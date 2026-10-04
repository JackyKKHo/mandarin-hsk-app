// Guardrail for edits to data/hsk*.json, used by the example-writer agent and by humans.
//
//   node scripts/check-vocab.mjs              check format + basic schema of all files
//   node scripts/check-vocab.mjs --changed    also compare with origin/main: only `examples`
//                                             may change, and every new example must pass
//                                             the stricter rules below
//
// Exits 1 on any error. Prints a summary either way.
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const changedMode = process.argv.includes('--changed')
const base = process.argv.find(a => a.startsWith('--base='))?.slice(7) ?? 'origin/main'

const errors = []
const warnings = []
const stats = { words: 0, missingExamples: 0, changedWords: 0, newExamples: 0 }

// Same layout the files use today: 2-space JSON, CRLF line endings, raw UTF-8, no final newline
const serialize = data => JSON.stringify(data, null, 2).replace(/\n/g, '\r\n')
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
  if (serialize(data) !== raw) {
    errors.push(`${path}: formatting changed. Write it with JSON.stringify(data, null, 2), CRLF line endings, no trailing newline`)
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
    errors.push(`${path}: words were added, removed or reordered. Only add examples to existing words`)
    continue
  }
  data.forEach((w, i) => {
    const b = baseData[i]
    const { examples: newEx, ...restNew } = w
    const { examples: oldEx, ...restOld } = b
    if (JSON.stringify(restNew) !== JSON.stringify(restOld)) {
      errors.push(`${path} ${w.id}: fields other than "examples" changed`)
    }
    if (JSON.stringify(newEx) === JSON.stringify(oldEx)) return
    stats.changedWords++
    const old = oldEx ?? []
    if (newEx.length < old.length || old.some((e, k) => JSON.stringify(e) !== JSON.stringify(newEx[k]))) {
      errors.push(`${path} ${w.id}: existing examples were edited or removed. Only append new ones`)
    }
    for (const ex of newEx.slice(old.length)) {
      stats.newExamples++
      checkNewExample(w, ex, path)
    }
    if (newEx.length > 2) warnings.push(`${path} ${w.id}: now has ${newEx.length} examples`)
  })
}

console.log(`Words: ${stats.words}. Still missing an example: ${stats.missingExamples}.`)
if (changedMode) console.log(`Compared with ${base}: ${stats.changedWords} words changed, ${stats.newExamples} new examples.`)
for (const w of warnings) console.log(`warning: ${w}`)
if (errors.length) {
  console.log(`\n${errors.length} error(s):`)
  for (const e of errors.slice(0, 50)) console.log(`  ${e}`)
  if (errors.length > 50) console.log(`  ...and ${errors.length - 50} more`)
  process.exit(1)
}
console.log('OK')
