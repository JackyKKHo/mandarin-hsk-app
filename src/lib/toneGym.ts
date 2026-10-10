// Scoring for the Tone Gym: turns live pitch frames into per-syllable tone results.
// The tone rules themselves are shared with Record & Score (api/_toneContour.js).
import { classifyContour, coachTone, isHalfThirdContour, isRisingContour } from '../../api/_toneContour.js'

export interface Frame { t: number; f: number | null; rms: number }
export interface Point { t: number; y: number }

export interface SyllableResult {
  expected: number          // the tone that should be said (after tone changes)
  citation: number          // the tone in the dictionary
  detected: number | null
  ok: boolean
  coach: string
  note?: string             // e.g. 3-3 tone change explanation
  points: Point[]           // contour in semitones vs the speaker's normal pitch, t in seconds from syllable start
}

export interface UtteranceResult {
  heard: boolean
  pass: boolean
  syllables: SyllableResult[]
  medianHz: number | null
}

const median = (xs: number[]) => {
  if (!xs.length) return NaN
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

/**
 * The main burst of speech: voiced runs joined across short gaps (≤ 0.25 s, the pause
 * between two syllables), keeping the cluster with the most voiced frames.
 */
export function mainCluster(frames: Frame[]): Frame[] {
  const clusters: Frame[][] = []
  let cur: Frame[] = []
  let lastVoicedT = -Infinity
  for (const fr of frames) {
    if (fr.f == null) { if (cur.length) cur.push(fr); continue }
    if (cur.length && fr.t - lastVoicedT > 0.25) { clusters.push(cur); cur = [] }
    cur.push(fr)
    lastVoicedT = fr.t
  }
  if (cur.length) clusters.push(cur)
  const voicedCount = (c: Frame[]) => c.filter(f => f.f != null).length
  const best = clusters.sort((a, b) => voicedCount(b) - voicedCount(a))[0] ?? []
  // drop trailing unvoiced frames
  let end = best.length
  while (end > 0 && best[end - 1].f == null) end--
  return best.slice(0, end)
}

/** Fixes octave jumps and smooths with a 5-frame median. Unvoiced frames stay null. */
export function cleanPitch(frames: Frame[]): Frame[] {
  const med = median(frames.filter(f => f.f != null).map(f => f.f!))
  if (!Number.isFinite(med)) return frames
  const fixed = frames.map(fr => {
    if (fr.f == null) return fr
    let f = fr.f
    if (f > med * 1.7) f /= 2
    else if (f < med * 0.6) f *= 2
    return { ...fr, f }
  })
  return fixed.map((fr, i) => {
    if (fr.f == null) return fr
    const win = fixed.slice(Math.max(0, i - 2), i + 3).filter(x => x.f != null).map(x => x.f!)
    return { ...fr, f: median(win) }
  })
}

/** Splits a cluster into n syllables at the clearest break (a silent gap, else the quietest frame). */
export function splitSyllables(cluster: Frame[], n: number): Frame[][] {
  if (n <= 1 || cluster.length < 8) return [cluster]
  const t0 = cluster[0].t
  const span = cluster[cluster.length - 1].t - t0
  const inMiddle = (fr: Frame) => fr.t - t0 > span * 0.3 && fr.t - t0 < span * 0.7
  let cut = -1
  // longest unvoiced run in the middle
  let runStart = -1, bestLen = 0
  cluster.forEach((fr, i) => {
    if (fr.f == null && inMiddle(fr)) {
      if (runStart < 0) runStart = i
      const len = i - runStart + 1
      if (len > bestLen) { bestLen = len; cut = runStart + Math.floor(len / 2) }
    } else runStart = -1
  })
  if (cut < 0) {
    let minRms = Infinity
    cluster.forEach((fr, i) => { if (inMiddle(fr) && fr.rms < minRms) { minRms = fr.rms; cut = i } })
  }
  if (cut < 0) cut = Math.floor(cluster.length / 2)
  return [cluster.slice(0, cut), cluster.slice(cut)]
}

export function toPoints(frames: Frame[], baseHz: number): Point[] {
  const voiced = frames.filter(f => f.f != null)
  if (!voiced.length) return []
  const t0 = voiced[0].t
  return voiced.map(f => ({ t: f.t - t0, y: 12 * Math.log2(f.f! / baseHz) }))
}

// Onsets and endings wobble (the voice settling, then trailing off); classify on the middle.
function trimEdges(points: Point[]): Point[] {
  if (points.length < 12) return points
  const k = Math.round(points.length * 0.1)
  return points.slice(k, points.length - k)
}

/**
 * Scores what was said against the expected citation tones (1–4).
 * baseHz is the speaker's normal pitch; without one, the utterance's own median is used.
 */
export function scoreUtterance(frames: Frame[], citation: number[], baseHz: number | null): UtteranceResult {
  const cluster = cleanPitch(mainCluster(frames))
  const voicedHz = cluster.filter(f => f.f != null).map(f => f.f!)
  const voicedSec = voicedHz.length ? cluster[cluster.length - 1].t - cluster[0].t : 0
  if (voicedHz.length < 6 || voicedSec < 0.12) return { heard: false, pass: false, syllables: [], medianHz: null }
  const medianHz = median(voicedHz)
  const base = baseHz ?? medianHz

  const parts = splitSyllables(cluster, citation.length)
  const pair = citation.length === 2
  const syllables = citation.map((cit, i): SyllableResult => {
    const points = toPoints(parts[i] ?? [], base)
    const core = trimEdges(points)
    const ys = core.map(p => p.y)
    const detected = classifyContour(core)

    let expected = cit
    let note: string | undefined
    let accept = [cit]
    let lenient = false
    if (pair && i === 0 && cit === 3 && citation[1] === 3) {
      expected = 2
      note = 'Two 3rd tones in a row: the first is said as a 2nd tone.'
      accept = [2]
      lenient = isRisingContour(ys)
    } else if (cit === 3 && (pair || citation.length === 1)) {
      // A 3rd tone before another tone is a low "half-third" without the rise; at the end of a
      // word or alone the rise is optional in natural speech.
      lenient = isHalfThirdContour(ys, detected)
    }
    const exact = detected != null && accept.includes(detected)
    const viaLenient = !exact && lenient
    const ok = exact || viaLenient
    let coach = detected == null ? 'Too short to hear. Say it a little longer.' : coachTone(expected, ok ? expected : detected, ys)
    if (viaLenient && expected === 3 && pair && i === 0) coach = 'Good half-third: low, with no rise before the next syllable.'
    else if (viaLenient && expected === 3 && !pair) coach = 'Good and low. On its own, let it rise back up at the end.'
    return { expected, citation: cit, detected, ok, coach, note, points }
  })
  return { heard: true, pass: syllables.every(s => s.ok), syllables, medianHz }
}

// ── voice profile: the speaker's normal pitch, learned from recent attempts ──
const VOICE_KEY = 'tone-gym-voice'
export function loadVoiceBase(): number | null {
  try {
    const xs: number[] = JSON.parse(localStorage.getItem(VOICE_KEY) ?? '[]')
    return xs.length >= 3 ? median(xs) : null
  } catch { return null }
}
export function addVoiceSample(hz: number) {
  try {
    const xs: number[] = JSON.parse(localStorage.getItem(VOICE_KEY) ?? '[]')
    xs.push(Math.round(hz))
    localStorage.setItem(VOICE_KEY, JSON.stringify(xs.slice(-40)))
  } catch { /* storage unavailable */ }
}

// ── practice stats: per item, per tone, and which tone each one gets mistaken for ──
export interface GymStats {
  items: Record<string, { n: number; ok: number }>
  tones: Record<string, { n: number; ok: number }>
  confusion: Record<string, Record<string, number>> // expected → detected → count
}
const STATS_KEY = 'tone-gym-stats'
export function loadStats(): GymStats {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY) ?? 'null')
    if (s?.items && s?.tones && s?.confusion) return s
  } catch { /* fall through */ }
  return { items: {}, tones: {}, confusion: {} }
}
export function recordAttempt(stats: GymStats, itemKey: string, r: UtteranceResult): GymStats {
  const next: GymStats = structuredClone(stats)
  const it = next.items[itemKey] ?? { n: 0, ok: 0 }
  next.items[itemKey] = { n: it.n + 1, ok: it.ok + (r.pass ? 1 : 0) }
  for (const s of r.syllables) {
    const k = String(s.expected)
    const t = next.tones[k] ?? { n: 0, ok: 0 }
    next.tones[k] = { n: t.n + 1, ok: t.ok + (s.ok ? 1 : 0) }
    if (!s.ok && s.detected != null) {
      next.confusion[k] = next.confusion[k] ?? {}
      next.confusion[k][s.detected] = (next.confusion[k][s.detected] ?? 0) + 1
    }
  }
  try { localStorage.setItem(STATS_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  return next
}

/** The most common mix-up, e.g. { expected: 2, detected: 3, count: 5 }, once there's enough data. */
export function topConfusion(stats: GymStats): { expected: number; detected: number; count: number } | null {
  let best: { expected: number; detected: number; count: number } | null = null
  for (const [e, row] of Object.entries(stats.confusion)) {
    for (const [d, count] of Object.entries(row)) {
      if (count >= 3 && (!best || count > best.count)) best = { expected: Number(e), detected: Number(d), count }
    }
  }
  return best
}

/**
 * Picks the next item, favouring ones you've missed and tones you're weak on.
 * Smoothed miss rates so one bad attempt doesn't dominate; never repeats the last item.
 */
export function pickWeighted<T>(items: T[], keyOf: (x: T) => string, tonesOf: (x: T) => number[], stats: GymStats, lastKey: string | null, rand = Math.random): T {
  const missRate = (r?: { n: number; ok: number }) => r ? (r.n - r.ok + 1) / (r.n + 2) : 0.5
  const weights = items.map(x => {
    const key = keyOf(x)
    if (key === lastKey && items.length > 1) return 0
    const item = stats.items[key]
    const toneWeak = Math.max(...tonesOf(x).map(t => missRate(stats.tones[String(t)])))
    return 0.5 + (item ? 2 * missRate(item) : 0.75) + 2 * toneWeak
  })
  const total = weights.reduce((a, w) => a + w, 0)
  let r = rand() * total
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i] }
  return items[items.length - 1]
}
