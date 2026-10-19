// Auto-marked grammar exercises (no API call): fill-the-blank / pick-the-correct-sentence
// multiple choice, and put-the-words-in-order. Data lives in `exercises` on data/grammar.json.

import type { GrammarExercise, GrammarOrderExercise, GrammarPoint } from '../types'

export const BLANK = '＿＿'

export interface DrillItem {
  pointId: string
  pointTitle: string
  exercise: GrammarExercise
}

const PUNCT = /[\s，。？！、,.?!;；:："“”'‘’]/g

/** Strip spaces and punctuation so 我是学生。 and 我是学生 compare equal */
export function normaliseSentence(s: string): string {
  return s.replace(PUNCT, '')
}

/** All accepted answers for an order exercise, normalised */
export function acceptedOrders(ex: GrammarOrderExercise): string[] {
  return [ex.tokens.join(''), ...(ex.alt ?? [])].map(normaliseSentence)
}

export function checkOrder(ex: GrammarOrderExercise, placed: string[]): boolean {
  return acceptedOrders(ex).includes(normaliseSentence(placed.join('')))
}

/** The model answer for an order exercise, with end punctuation */
export function orderAnswerText(ex: GrammarOrderExercise): string {
  const s = ex.tokens.join('').replace(/[，,]$/, '')
  if (/[。？！]$/.test(s)) return s
  return s + (ex.english.trim().endsWith('?') ? '？' : '。')
}

/** The sentence with the blank filled in (or the chosen sentence itself) */
export function fillBlank(prompt: string, option: string): string {
  return prompt.includes(BLANK) ? prompt.replace(BLANK, option) : option
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Shuffle tile indexes so the starting order is never already an accepted answer */
export function shuffleTiles(ex: GrammarOrderExercise, rng: () => number = Math.random): number[] {
  const idx = ex.tokens.map((_, i) => i)
  for (let tries = 0; tries < 20; tries++) {
    const order = shuffle(idx, rng)
    if (!checkOrder(ex, order.map(i => ex.tokens[i]))) return order
  }
  return idx.slice().reverse()
}

export function drillItems(points: readonly GrammarPoint[]): DrillItem[] {
  return points.flatMap(p =>
    (p.exercises ?? []).map(exercise => ({ pointId: p.id, pointTitle: p.title, exercise })),
  )
}

/** Shuffled session; `limit` caps the length (0 or undefined = everything) */
export function buildDrill(points: readonly GrammarPoint[], limit?: number, rng: () => number = Math.random): DrillItem[] {
  const all = shuffle(drillItems(points), rng)
  return limit && limit > 0 ? all.slice(0, limit) : all
}

/** Data checks, used by the test suite over data/grammar.json */
export function validateExercise(ex: GrammarExercise): string[] {
  const errs: string[] = []
  if (!ex.english?.trim()) errs.push('missing english')
  if (ex.type === 'choice') {
    if (ex.options.length < 3) errs.push('needs at least 3 options')
    if (new Set(ex.options).size !== ex.options.length) errs.push('duplicate options')
    if (!ex.options.includes(ex.answer)) errs.push('answer not among options')
    if (!ex.explain?.trim()) errs.push('missing explain')
    const blanks = ex.prompt.split(BLANK).length - 1
    if (blanks > 1) errs.push('more than one blank')
    if (blanks === 0 && ex.options.some(o => !/[。？！]$/.test(o))) errs.push('sentence options must end with punctuation')
  } else if (ex.type === 'order') {
    if (ex.tokens.length < 3) errs.push('needs at least 3 tiles')
    if (ex.tokens.some(t => !t.trim())) errs.push('empty tile')
    const tiles = normaliseSentence(ex.tokens.join('')).split('').sort().join('')
    for (const a of ex.alt ?? []) {
      if (normaliseSentence(a).split('').sort().join('') !== tiles) errs.push(`alt "${a}" uses different characters`)
    }
  } else {
    errs.push('unknown type')
  }
  return errs
}
