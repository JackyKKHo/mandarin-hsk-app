import { describe, it, expect } from 'vitest'
import { scoreUtterance, pickWeighted, recordAttempt, topConfusion, type Frame, type GymStats } from './toneGym'

const HOP = 1 / 60
const BASE = 190

// Contours in semitones around the speaker's normal pitch, t in [0, 1]
const SHAPE: Record<string, (t: number) => number> = {
  1: () => 3,
  2: t => -2 + 6 * t,
  3: t => (t < 0.5 ? -2 - 5 * t : -4.5 + 6 * (t - 0.5)),
  4: t => 4 - 8 * t,
  h: t => -2.5 - 2.5 * t, // half-third: low, slight fall, no rise
  r: t => (t < 0.25 ? -3 - 3 * t : -3.75 + 6 * (t - 0.25)), // sandhi 2nd: brief dip, then rise
}

// Seeded noise so the tests are repeatable
function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647) }

function frames(shapes: string[], { syl = 0.32, gap = 0.06, jitter = 0, octaveGlitch = false, seed = 1 } = {}): Frame[] {
  const r = rng(seed)
  const out: Frame[] = []
  let t = 0
  for (let k = 0; k < 8; k++) { out.push({ t, f: null, rms: 0.002 }); t += HOP } // lead-in silence
  shapes.forEach((s, i) => {
    const n = Math.round(syl / HOP)
    for (let j = 0; j < n; j++) {
      let f = BASE * 2 ** ((SHAPE[s](j / (n - 1)) + (r() - 0.5) * 2 * jitter) / 12)
      if (octaveGlitch && j === Math.floor(n / 2)) f *= 2
      out.push({ t, f, rms: 0.1 })
      t += HOP
    }
    if (i < shapes.length - 1) for (let g = 0; g < Math.round(gap / HOP); g++) { out.push({ t, f: null, rms: 0.01 }); t += HOP }
  })
  for (let k = 0; k < 20; k++) { out.push({ t, f: null, rms: 0.002 }); t += HOP } // trailing silence
  return out
}

describe('scoreUtterance: single syllables', () => {
  it.each([1, 2, 3, 4])('recognises tone %i', tone => {
    const r = scoreUtterance(frames([String(tone)]), [tone], BASE)
    expect(r.heard).toBe(true)
    expect(r.syllables[0].detected).toBe(tone)
    expect(r.pass).toBe(true)
  })

  it.each([[1, '4'], [2, '3'], [3, '1'], [4, '2'], [2, '1'], [4, '1']])('marks tone %i said as %s wrong, with coaching', (want, said) => {
    const r = scoreUtterance(frames([said]), [want], BASE)
    expect(r.pass).toBe(false)
    expect(r.syllables[0].coach).not.toBe('Clean tone.')
  })

  it('copes with pitch jitter and an octave glitch', () => {
    for (const tone of [1, 2, 3, 4]) {
      const r = scoreUtterance(frames([String(tone)], { jitter: 0.6, octaveGlitch: true, seed: tone * 7 }), [tone], BASE)
      expect(r.syllables[0].detected).toBe(tone)
    }
  })

  it('works before the voice profile exists (no baseline)', () => {
    for (const tone of [2, 3, 4]) {
      expect(scoreUtterance(frames([String(tone)]), [tone], null).syllables[0].detected).toBe(tone)
    }
  })

  it('gives a full 3rd tone the normal feedback, not the half-third note', () => {
    expect(scoreUtterance(frames(['3']), [3], BASE).syllables[0].coach).not.toMatch(/rise back up/)
  })

  it('accepts a low half-third on its own but asks for the rise', () => {
    const r = scoreUtterance(frames(['h']), [3], BASE)
    expect(r.pass).toBe(true)
    expect(r.syllables[0].coach).toMatch(/rise/)
  })

  it('reports nothing heard for silence or a blip', () => {
    expect(scoreUtterance(frames([], {}), [1], BASE).heard).toBe(false)
    expect(scoreUtterance(frames(['1'], { syl: 0.06 }), [1], BASE).heard).toBe(false)
  })
})

describe('scoreUtterance: tone pairs', () => {
  it.each([
    [[1, 4], ['1', '4']],
    [[2, 1], ['2', '1']],
    [[4, 4], ['4', '4']],
    [[4, 2], ['4', '2']],
    [[3, 4], ['h', '4']],  // half-third before a 4th tone
    [[3, 1], ['h', '1']],
    [[3, 3], ['2', '3']],  // 3-3 → 2-3
    [[3, 3], ['r', '3']],  // with the natural dip at the start of the rise
    [[2, 3], ['2', 'h']],  // final 3rd tone without the rise
  ])('accepts %j said naturally', (tones, said) => {
    const r = scoreUtterance(frames(said), tones, BASE)
    expect(r.syllables.map(s => s.ok)).toEqual([true, true])
  })

  it('splits syllables with no silent gap between them', () => {
    const r = scoreUtterance(frames(['1', '4'], { gap: 0 }), [1, 4], BASE)
    expect(r.syllables.map(s => s.detected)).toEqual([1, 4])
  })

  it('explains the 3-3 change and catches saying both as full 3rd tones', () => {
    const r = scoreUtterance(frames(['3', '3']), [3, 3], BASE)
    expect(r.syllables[0].expected).toBe(2)
    expect(r.syllables[0].note).toMatch(/2nd tone/)
    expect(r.syllables[0].ok).toBe(false)
  })

  it('catches the wrong tone on one syllable', () => {
    const r = scoreUtterance(frames(['1', '1']), [1, 4], BASE)
    expect(r.syllables.map(s => s.ok)).toEqual([true, false])
  })
})

describe('stats and adaptive picking', () => {
  const empty: GymStats = { items: {}, tones: {}, confusion: {} }

  it('tracks the most common mix-up', () => {
    let s = empty
    const miss = scoreUtterance(frames(['3']), [2], BASE) // 2nd tone said as 3rd
    for (let i = 0; i < 3; i++) s = recordAttempt(s, 'ma2', miss)
    expect(topConfusion(s)).toEqual({ expected: 2, detected: 3, count: 3 })
  })

  it('favours items and tones you miss', () => {
    const s: GymStats = {
      items: { a: { n: 10, ok: 0 }, b: { n: 10, ok: 10 } },
      tones: { 1: { n: 10, ok: 0 }, 2: { n: 10, ok: 10 } },
      confusion: {},
    }
    const items = [{ k: 'a', t: 1 }, { k: 'b', t: 2 }]
    let a = 0
    const r = rng(42)
    for (let i = 0; i < 1000; i++) if (pickWeighted(items, x => x.k, x => [x.t], s, null, r).k === 'a') a++
    expect(a).toBeGreaterThan(700)
  })

  it('never repeats the last item', () => {
    const items = [{ k: 'a' }, { k: 'b' }]
    for (let i = 0; i < 50; i++) expect(pickWeighted(items, x => x.k, () => [1], empty, 'a').k).toBe('b')
  })
})
