// Word for home-screen widgets (Scriptable on iOS). Picks a word from the requested HSK
// level(s) that changes every `every` minutes, the same for everyone in that time slot.
//
//   GET /api/widget?level=3          HSK 3
//   GET /api/widget?level=2-4        HSK 2 to 4
//   GET /api/widget?level=3&every=30 new word every 30 minutes (15-1440, default 60)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://www.mandarindaily.app'
const cache = new Map()

function loadLevel(level) {
  if (!cache.has(level)) {
    const raw = readFileSync(join(process.cwd(), 'data', `hsk${level}.json`), 'utf8')
    cache.set(level, JSON.parse(raw))
  }
  return cache.get(level)
}

// Same syllable split and tone detection as src/components/TonedPinyin.tsx
const SYLLABLE_RE = /(zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])?[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]+(?:ng?)?(?:r(?![aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]))?/gi
function toneOf(s) {
  if (/[āēīōūǖĀĒĪŌŪǕ]/.test(s)) return 1
  if (/[áéíóúǘÁÉÍÓÚǗ]/.test(s)) return 2
  if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(s)) return 3
  if (/[àèìòùǜÀÈÌÒÙǛ]/.test(s)) return 4
  return 0
}
export function syllables(pinyin) {
  const out = []
  const re = new RegExp(SYLLABLE_RE.source, 'gi')
  let last = 0
  let m
  while ((m = re.exec(pinyin)) !== null) {
    if (m.index > last) out.push({ text: pinyin.slice(last, m.index), tone: null })
    out.push({ text: m[0], tone: toneOf(m[0]) })
    last = m.index + m[0].length
  }
  if (last < pinyin.length) out.push({ text: pinyin.slice(last), tone: null })
  return out
}

function hash(s) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0
  return h
}

export function parseLevels(param) {
  const m = /^([1-9])(?:-([1-9]))?$/.exec(String(param ?? '1').trim())
  if (!m) return [1]
  const a = Number(m[1])
  const b = Number(m[2] ?? m[1])
  const levels = []
  for (let l = Math.min(a, b); l <= Math.max(a, b); l++) levels.push(l)
  return levels
}

export function pickWord(levels, everyMin, now = Date.now()) {
  const pool = levels.flatMap(loadLevel)
  // Prefer words with an example sentence; the widget has room to show one
  const withExamples = pool.filter(w => w.examples?.length)
  const candidates = withExamples.length ? withExamples : pool
  const slotMs = everyMin * 60_000
  const slot = Math.floor(now / slotMs)
  const word = candidates[hash(`${slot}|${levels.join(',')}`) % candidates.length]
  return { word, nextAt: new Date((slot + 1) * slotMs) }
}

export default function handler(req, res) {
  const levels = parseLevels(req.query?.level)
  const every = Math.min(1440, Math.max(15, Number(req.query?.every) || 60))

  try {
    const { word: w, nextAt } = pickWord(levels, every)
    const english = String(w.english ?? '')
    const ex = w.examples?.[0]
    const secondsLeft = Math.max(30, Math.round((nextAt.getTime() - Date.now()) / 1000))

    res.setHeader('Cache-Control', `public, s-maxage=${secondsLeft}, stale-while-revalidate=60`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      id: w.id,
      level: w.hskLevel,
      hanzi: w.simplified,
      pinyin: w.pinyin,
      syllables: syllables(w.pinyin),
      english,
      englishShort: english.split(/[;；]/)[0].trim(),
      pos: Array.isArray(w.partOfSpeech) ? w.partOfSpeech.join(', ') : (w.partOfSpeech ?? ''),
      example: ex ? { zh: ex.chinese, pinyin: ex.pinyin, en: ex.english } : null,
      url: `${SITE}/word/${w.id}`,
      nextAt: nextAt.toISOString(),
    })
  } catch (e) {
    console.error('widget error:', e)
    res.status(500).json({ error: 'Could not load a word' })
  }
}
