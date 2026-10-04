// Guardrail for edits to data/hsk*.json, used by the agents in agents/ and by humans.
//
//   node scripts/check-vocab.mjs                          check format + basic schema of all files
//   node scripts/check-vocab.mjs --changed                compare with origin/main: only new
//                                                         examples may be added (Example Writer)
//   node scripts/check-vocab.mjs --changed --allow=english  only `english` may change
//                                                         (Translation Fixer)
//
// Exits 1 on any error. Prints a summary either way.
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const LEVELS = [1, 2, 3, 4, 5, 6, 7] // 7 = the HSK 7–9 band (official 2026 syllabus)
const changedMode = process.argv.includes('--changed')
const base = process.argv.find(a => a.startsWith('--base='))?.slice(7) ?? 'origin/main'
const allow = process.argv.find(a => a.startsWith('--allow='))?.slice(8) ?? 'examples'
if (!['examples', 'english'].includes(allow)) {
  console.error(`--allow must be "examples" or "english", not "${allow}"`)
  process.exit(2)
}
const MAX_ENGLISH_CHANGES = 80

const errors = []
const warnings = []
const stats = { words: 0, missingExamples: 0, changedWords: 0, newExamples: 0 }

// Same layout the files use today: 2-space JSON, raw UTF-8, no final newline. Line endings are
// whatever this checkout uses: git stores LF, and Windows checkouts (core.autocrlf) see CRLF.
const serialize = (data, eol) => JSON.stringify(data, null, 2).replace(/\n/g, eol)
const HAN = /\p{Script=Han}/u
const TONE_MARK = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i

function checkNewExample(w, ex, where) {
  const fail = msg => errors.push(`${where} ${w.id} ${w.simplified}: ${msg}`)
  if (!ex || typeof ex !== 'object') return fail('example is not an object')
  const keys = Object.keys(ex).sort().join(',')
  if (keys !== 'chinese,english,pinyin') fail(`example must have exactly chinese, pinyin, english (has ${keys})`)
  const zh = String(ex.chinese ?? '')
  const py = String(ex.pinyin ?? '')
  const en = String(ex.english ?? '')
  if (!zh.includes(w.simplified)) fail(`example doesn't contain the word: ${zh}`)
  const hanCount = [...zh].filter(c => HAN.test(c)).length
  if (hanCount < 6 || hanCount > 40) fail(`example should be 6-40 characters, has ${hanCount}: ${zh}`)
  if (!/[。！？]$/.test(zh)) fail(`Chinese should end with 。！or ？: ${zh}`)
  if (/[a-z]/i.test(zh)) fail(`Chinese contains Latin letters: ${zh}`)
  if (!TONE_MARK.test(py)) fail(`pinyin needs tone marks: ${py}`)
  if (HAN.test(py)) fail(`pinyin contains Chinese characters: ${py}`)
  if (!/^[A-ZĀÁǍÀĒÉĚÈŌÓǑÒ]/.test(py)) fail(`pinyin should start with a capital letter: ${py}`)
  if (!/[.!?]$/.test(py)) fail(`pinyin should end with . ! or ?: ${py}`)
  if (en.length < 8 || HAN.test(en) || !/[.!?"']$/.test(en)) fail(`English translation looks wrong: ${en}`)
}

// A gloss as shown on cards and quizzes: short, plain, primary meaning first
function checkNewEnglish(w, en, where) {
  const fail = msg => errors.push(`${where} ${w.id} ${w.simplified}: ${msg}: "${en}"`)
  if (typeof en !== 'string' || !en.trim()) return fail('english is empty')
  if (en !== en.trim() || /\s{2,}/.test(en)) fail('extra spaces')
  if (en.length > 60) fail(`too long (${en.length} chars, max 60)`)
  if (HAN.test(en)) fail('contains Chinese characters')
  if (/[_*#`|]/.test(en)) fail('contains stray symbols (_ * # ` |)')
  if ((en.match(/\(/g) ?? []).length !== (en.match(/\)/g) ?? []).length) fail('unbalanced brackets')
  if (/[.;,:]$/.test(en)) fail('ends with punctuation')
  // Can't tell proper nouns (Beijing, Chinese) from stray capitals (Look like), so just flag it
  if (/^[A-Z]/.test(en)) warnings.push(`${where} ${w.id} ${w.simplified}: starts with a capital, fine only for a proper noun: "${en}"`)
  if (/^(n|v|adj|adv|conj|prep)\.?:/i.test(en)) fail('starts with a part-of-speech label')
}

for (const level of LEVELS) {
  const path = `data/hsk${level}.json`
  const raw = readFileSync(path, 'utf8')
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    errors.push(`${path}: invalid JSON (${e.message})`)
    continue
  }
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  if (serialize(data, eol) !== raw) {
    errors.push(`${path}: formatting changed. Write it with JSON.stringify(data, null, 2), keep the line endings the file already had (${eol === '\r\n' ? 'CRLF' : 'LF'} here), no trailing newline`)
  }

  data.forEach((w, i) => {
    stats.words++
    const where = `${path}[${i}]`
    if (!/^hsk\d_\d{4}$/.test(w.id) || w.hskLevel !== level) errors.push(`${where}: bad id/level ${w.id}`)
    if (!w.simplified || !w.pinyin || !w.english) errors.push(`${where} ${w.id}: missing simplified/pinyin/english`)
    if (!Array.isArray(w.examples)) errors.push(`${where} ${w.id}: examples must be an array`)
    else if (w.examples.length === 0) stats.missingExamples++
  })

  if (!changedMode) continue

  let baseData
  try {
    baseData = JSON.parse(execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }))
  } catch (e) {
    errors.push(`${path}: couldn't read ${base} version to compare (${e.message.split('\n')[0]})`)
    continue
  }
  if (baseData.length !== data.length || baseData.some((b, i) => b.id !== data[i]?.id)) {
    errors.push(`${path}: words were added, removed or reordered. Words must stay as they are`)
    continue
  }
  let changedInFile = 0
  data.forEach((w, i) => {
    const b = baseData[i]
    const { [allow]: newVal, ...restNew } = w
    const { [allow]: oldVal, ...restOld } = b
    if (JSON.stringify(restNew) !== JSON.stringify(restOld)) {
      errors.push(`${path} ${w.id}: fields other than "${allow}" changed`)
    }
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
    stats.changedWords++
    changedInFile++

    if (allow === 'english') {
      checkNewEnglish(w, newVal, path)
      return
    }
    const old = oldVal ?? []
    if (newVal.length < old.length || old.some((e, k) => JSON.stringify(e) !== JSON.stringify(newVal[k]))) {
      errors.push(`${path} ${w.id}: existing examples were edited or removed. Only append new ones`)
    }
    for (const ex of newVal.slice(old.length)) {
      stats.newExamples++
      checkNewExample(w, ex, path)
    }
    if (newVal.length > 2) warnings.push(`${path} ${w.id}: now has ${newVal.length} examples`)
  })

  // Ask git what it would commit. Each changed word should remove exactly one line (the old
  // `"examples": []` / closing `}`, or the old "english" line), so more removed lines than changed
  // words means the file was reformatted, e.g. CRLF written into an LF checkout.
  const numstat = execFileSync('git', ['diff', '--numstat', base, '--', path], { encoding: 'utf8' }).trim()
  const removed = numstat ? Number(numstat.split('\t')[1]) : 0
  if (removed > changedInFile) {
    errors.push(`${path}: git sees ${removed} removed lines but only ${changedInFile} words changed their "${allow}". Other fields were edited or the file was reformatted (keep its line endings and layout)`)
  }
}

if (changedMode && allow === 'english' && stats.changedWords > MAX_ENGLISH_CHANGES) {
  errors.push(`${stats.changedWords} english fields changed; the limit per run is ${MAX_ENGLISH_CHANGES}`)
}

console.log(`Words: ${stats.words}. Still missing an example: ${stats.missingExamples}.`)
if (changedMode) {
  console.log(allow === 'english'
    ? `Compared with ${base}: ${stats.changedWords} english fields changed.`
    : `Compared with ${base}: ${stats.changedWords} words changed, ${stats.newExamples} new examples.`)
}
for (const w of warnings) console.log(`warning: ${w}`)
if (errors.length) {
  console.log(`\n${errors.length} error(s):`)
  for (const e of errors.slice(0, 50)) console.log(`  ${e}`)
  if (errors.length > 50) console.log(`  ...and ${errors.length - 50} more`)
  process.exit(1)
}
console.log('OK')
