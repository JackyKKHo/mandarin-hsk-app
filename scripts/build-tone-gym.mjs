// Builds src/data/toneGym.json for the Tone Gym from the HSK word lists:
//   syllables — every toned syllable we can say with a real character, grouped by base syllable
//   pairs     — two-character HSK words grouped by tone combination (1-1 … 4-4)
// Run: node scripts/build-tone-gym.mjs
import fs from 'node:fs'
import { pinyin } from 'pinyin-pro'

const PAIRS_PER_COMBO = 40

const words = []
for (let l = 1; l <= 7; l++) {
  const d = JSON.parse(fs.readFileSync(`data/hsk${l}.json`, 'utf8'))
  words.push(...(Array.isArray(d) ? d : d.words))
}

const sylls = s => s.trim().toLowerCase().replace(/u:/g, 'v').replace(/ü/g, 'v').split(/\s+/)
const parse = s => {
  const m = s.match(/^([a-z]+)([0-5])$/)
  return m ? { base: m[1], tone: Number(m[2]) } : null
}
// The audio comes from TTS of the character on its own, so only use characters whose
// default reading is the one we want (行 in 银行 is háng, but on its own TTS says xíng).
const defaultReading = c => pinyin(c, { toneType: 'num', type: 'array' })[0]?.replace('ü', 'v')

const gloss = e => e.split(/[;,]/)[0].replace(/_/g, ' ').trim()

// ── syllables ──
const byKey = new Map() // "ma3" → { c, e, w }
function offer(char, base, tone, entry) {
  let key = base + tone
  const reading = defaultReading(char)
  // The word lists drop the ü in nü/lü (女 is "nu3"); trust the character's reading there
  if (/^[nl]u/.test(key) && reading === key.replace(/^([nl])u/, '$1v')) key = reading
  if (tone < 1 || tone > 4 || byKey.has(key) || reading !== key) return
  byKey.set(key, entry)
}
// Single-character words first (they come with a meaning), lowest level first
for (const w of words) {
  if ([...w.simplified].length !== 1 || !w.pinyinNumbered) continue
  const p = parse(sylls(w.pinyinNumbered)[0] ?? '')
  if (p) offer(w.simplified, p.base, p.tone, { c: w.simplified, e: gloss(w.english), id: w.id })
}
// Then characters inside longer words ("as in 学习")
for (const w of words) {
  const chars = [...w.simplified]
  const ps = sylls(w.pinyinNumbered ?? '')
  if (chars.length < 2 || chars.length !== ps.length) continue
  chars.forEach((c, i) => {
    const p = parse(ps[i])
    if (p && /\p{Script=Han}/u.test(c)) offer(c, p.base, p.tone, { c, w: w.simplified })
  })
}
const bases = new Map()
for (const [key, entry] of byKey) {
  const base = key.slice(0, -1), tone = Number(key.slice(-1))
  if (!bases.has(base)) bases.set(base, {})
  bases.get(base)[tone] = entry
}
const syllables = [...bases.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([base, tones]) => ({ base, tones }))

// ── tone pairs ──
const pairs = {}
for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) pairs[`${a}-${b}`] = []
for (const w of words) {
  const chars = [...w.simplified]
  if (chars.length !== 2 || /[一不]/.test(w.simplified)) continue // 一/不 change tone; Record & Score covers them
  const ps = sylls(w.pinyinNumbered ?? '').map(parse)
  if (ps.length !== 2 || ps.some(p => !p)) continue
  const combo = `${ps[0].tone}-${ps[1].tone}`
  if (!pairs[combo] || pairs[combo].length >= PAIRS_PER_COMBO) continue
  pairs[combo].push({ id: w.id, zh: w.simplified, py: w.pinyin, en: gloss(w.english) })
}

const out = { syllables, pairs }
fs.writeFileSync('src/data/toneGym.json', JSON.stringify(out))
const toned = syllables.reduce((n, s) => n + Object.keys(s.tones).length, 0)
console.log(`${syllables.length} base syllables, ${toned} toned syllables`)
console.log('pairs:', Object.entries(pairs).map(([k, v]) => `${k}:${v.length}`).join(' '))
