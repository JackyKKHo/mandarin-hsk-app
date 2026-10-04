// Rebuilds data/hsk*.json on the official 2026 HSK syllabus word list.
//
//   node scripts/migrate-hsk-2026.mjs --report   list words that still need a gloss, write nothing
//   node scripts/migrate-hsk-2026.mjs            write data/hsk1-7.json (7 = the HSK 7–9 band),
//                                                remove hsk8/hsk9.json, write src/data/idMap2026.json
//
// Inputs:
//   data/source/hsk-2026-syllabus.json  official list: which words exist, their level, pinyin, POS
//   data/hsk1-9.json (current)          content to reuse: english, explanation, examples, meanings…
//   data/source/new-words-2026.json     english + traditional for words with no reusable content,
//                                       keyed "<hanzi>|<pinyin>"
//
// A word reuses existing content when the characters match and the pinyin matches ignoring tones
// and spacing (so 谁 shéi/shuí or neutral-tone spellings still match, but 还 hái vs huán doesn't).
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'

const report = process.argv.includes('--report')
const syllabus = JSON.parse(readFileSync('data/source/hsk-2026-syllabus.json', 'utf8')).words
const newWordsPath = 'data/source/new-words-2026.json'
const newWords = existsSync(newWordsPath) ? JSON.parse(readFileSync(newWordsPath, 'utf8')) : {}

const OLD_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(l => existsSync(`data/hsk${l}.json`))
const old = OLD_LEVELS.flatMap(l => JSON.parse(readFileSync(`data/hsk${l}.json`, 'utf8')))
if (old.length < 11000) throw new Error(`expected the pre-2026 data (11,036 words), found ${old.length}. Already migrated?`)

// Toneless, spaceless pinyin: "Běijīng" → "beijing", "shéi/shuí" → "shei/shui"
const base = p => p.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ü/g, 'v').replace(/[\s'’·\d-]/g, '')
const readings = p => base(p).split('/')

const byHanzi = new Map()
for (const w of old) {
  if (!byHanzi.has(w.simplified)) byHanzi.set(w.simplified, [])
  byHanzi.get(w.simplified).push(w)
}
function findOld(hanzi, pinyin) {
  const want = readings(pinyin)
  // lowest old level first, so a word that existed at two levels keeps its earlier content
  return (byHanzi.get(hanzi) ?? []).sort((a, b) => a.hskLevel - b.hskLevel)
    .find(w => readings(w.pinyin).some(r => want.includes(r)))
}

const POS = {
  名: 'noun', 动: 'verb', 形: 'adjective', 副: 'adverb', 代: 'pronoun', 数: 'numeral', 量: 'measure word',
  介: 'preposition', 连: 'conjunction', 助: 'particle', 叹: 'interjection', 拟声: 'onomatopoeia',
  前缀: 'prefix', 后缀: 'suffix', 数量: 'numeral-classifier',
}
function mapPos(pos) {
  const parts = pos.split('、').map(p => p.replace(/[（）()]/g, '').trim()).filter(Boolean)
  const mapped = [...new Set(parts.map(p => POS[p]).filter(Boolean))]
  return mapped.length === 0 ? null : mapped.length === 1 ? mapped[0] : mapped
}

// Tone-marked pinyin → numbered, syllable by syllable ("Běijīng" → "bei3 jing1")
const SYL = /(zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])?[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]+(?:ng?)?(?:r(?![aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]))?/gi
const TONES = [/[āēīōūǖ]/i, /[áéíóúǘ]/i, /[ǎěǐǒǔǚ]/i, /[àèìòùǜ]/i]
// Same format as the existing data (and TonePage): one syllable per character, neutral tone as 0,
// ü written as ü, and the erhua 儿 as its own "er2" ("miàntiáor" → "mian4 tiao2 er2")
function numbered(pinyin) {
  return (pinyin.split('/')[0].match(SYL) ?? []).flatMap(s => {
    const t = TONES.findIndex(re => re.test(s)) + 1
    let syl = base(s).replace(/v/g, 'ü')
    const erhua = syl.endsWith('r') && syl !== 'er'
    if (erhua) syl = syl.slice(0, -1)
    return erhua ? [`${syl}${t}`, 'er2'] : [`${syl}${t}`]
  }).join(' ')
}

// Errors in the official PDF itself (both independent transcriptions agree on the source text)
const PINYIN_FIXES = {
  '任性|rénxìng': 'rènxìng',
}

const levelOf = l => (l === '7-9' ? 7 : Number(l))
const counters = {}
const out = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
const idMap = {}
const needGloss = []
let reused = 0

for (const s of syllabus) {
  const level = levelOf(s.level)
  counters[level] = (counters[level] ?? 0) + 1
  const id = `hsk${level}_${String(counters[level]).padStart(4, '0')}`
  const key = `${s.hanzi}|${s.pinyin}`
  const pinyin = PINYIN_FIXES[key] ?? s.pinyin
  const prev = findOld(s.hanzi, pinyin)
  const fresh = newWords[key]

  let word
  if (prev) {
    reused++
    if (!(prev.id in idMap)) idMap[prev.id] = id
    const { id: _i, hskLevel: _l, pinyin: _p, pinyinNumbered: _n, partOfSpeech, ...content } = prev
    word = { id, hskLevel: level, ...content, pinyin, pinyinNumbered: numbered(pinyin), partOfSpeech: mapPos(s.pos) ?? partOfSpeech }
  } else {
    if (!fresh) needGloss.push({ key, level: s.level, pos: s.pos, others: (byHanzi.get(s.hanzi) ?? []).map(w => `${w.pinyin}: ${w.english}`) })
    word = {
      id, hskLevel: level, simplified: s.hanzi, traditional: fresh?.traditional ?? s.hanzi,
      pinyin, pinyinNumbered: numbered(pinyin), english: fresh?.english ?? '',
      partOfSpeech: mapPos(s.pos) ?? '', examples: [], tags: [], audio: { wordAudioUrl: null, exampleAudioUrls: [] },
    }
  }
  // Same key order as the existing files
  const ordered = {}
  for (const k of ['id', 'hskLevel', 'simplified', 'traditional', 'pinyin', 'pinyinNumbered', 'english', 'partOfSpeech', 'meanings', 'examples', 'tags', 'audio', 'explanation']) {
    if (word[k] !== undefined) ordered[k] = word[k]
  }
  out[level].push(ordered)
}

console.log(`Official words: ${syllabus.length}. Reused existing content: ${reused}. New: ${syllabus.length - reused}.`)
console.log(`Per level: ${Object.entries(out).map(([l, ws]) => `${l === '7' ? '7-9' : l}=${ws.length}`).join(' ')}`)
console.log(`Still need an English gloss: ${needGloss.length}`)

if (report) {
  writeFileSync('migrate-hsk-2026.report.json', JSON.stringify(needGloss, null, 1))
  console.log('Wrote migrate-hsk-2026.report.json (not committed)')
  process.exit(0)
}
if (needGloss.length) throw new Error('Some words have no English gloss; run with --report and add them to data/source/new-words-2026.json')

const eol = readFileSync('data/hsk1.json', 'utf8').includes('\r\n') ? '\r\n' : '\n'
for (const [level, words] of Object.entries(out)) {
  writeFileSync(`data/hsk${level}.json`, JSON.stringify(words, null, 2).replace(/\n/g, eol))
}
for (const l of [8, 9]) if (existsSync(`data/hsk${l}.json`)) unlinkSync(`data/hsk${l}.json`)
writeFileSync('src/data/idMap2026.json', JSON.stringify(idMap))
console.log(`Wrote data/hsk1-7.json, removed hsk8/hsk9.json, wrote src/data/idMap2026.json (${Object.keys(idMap).length} old ids mapped)`)
