import { describe, it, expect } from 'vitest'
import { pickWeakIds, countMastered } from './learnerProfile'
import type { SRSCard } from '../hooks/useSRS'

const card = (easeFactor: number, interval = 3, dueDate = '2026-10-20'): SRSCard =>
  ({ easeFactor, interval, dueDate, reps: 2 })

describe('pickWeakIds', () => {
  it('keeps only lapsed cards, hardest first', () => {
    const ids = pickWeakIds({
      a: card(2.5),
      b: card(2.3),
      c: card(1.5),
      d: card(2.65),
      e: card(1.9),
    })
    expect(ids).toEqual(['c', 'e', 'b'])
  })

  it('breaks ease ties by the soonest due date', () => {
    const ids = pickWeakIds({
      late: card(2.1, 3, '2026-11-01'),
      soon: card(2.1, 3, '2026-10-19'),
    })
    expect(ids).toEqual(['soon', 'late'])
  })

  it('caps the list', () => {
    const cards = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`w${i}`, card(1.3 + i / 100)]))
    expect(pickWeakIds(cards)).toHaveLength(12)
    expect(pickWeakIds(cards, 3)).toEqual(['w0', 'w1', 'w2'])
  })

  it('returns nothing for a new learner', () => {
    expect(pickWeakIds({})).toEqual([])
  })
})

describe('countMastered', () => {
  it('counts cards with a 21+ day interval', () => {
    expect(countMastered({ a: card(2.5, 21), b: card(2.5, 20), c: card(2.5, 90) })).toBe(2)
  })
})
