import { describe, it, expect } from 'vitest'
import { nextCard, type SRSCard } from './useSRS'

const today = () => new Date().toISOString().slice(0, 10)

describe('nextCard (SM-2 SRS algorithm)', () => {
  it('schedules a new card 1 day out on first "good" rating', () => {
    const c = nextCard(undefined, 'good')
    expect(c.reps).toBe(1)
    expect(c.interval).toBe(1)
    expect(c.easeFactor).toBe(2.5)
    expect(c.dueDate > today() || c.dueDate === today()).toBe(true)
  })

  it('uses 3 days on rep 2 with "good"', () => {
    const after1: SRSCard = { interval: 1, easeFactor: 2.5, dueDate: today(), reps: 1 }
    const c = nextCard(after1, 'good')
    expect(c.interval).toBe(3)
    expect(c.reps).toBe(2)
  })

  it('uses 4 days on rep 2 with "easy"', () => {
    const after1: SRSCard = { interval: 1, easeFactor: 2.5, dueDate: today(), reps: 1 }
    const c = nextCard(after1, 'easy')
    expect(c.interval).toBe(4)
  })

  it('multiplies interval by ease on rep 3+', () => {
    const seed: SRSCard = { interval: 10, easeFactor: 2.5, dueDate: today(), reps: 2 }
    const c = nextCard(seed, 'good')
    expect(c.interval).toBe(25)  // 10 * 2.5
  })

  it('"again" reduces ease and resets interval to 1', () => {
    const seed: SRSCard = { interval: 30, easeFactor: 2.5, dueDate: today(), reps: 4 }
    const c = nextCard(seed, 'again')
    expect(c.interval).toBe(1)
    expect(c.reps).toBe(0)
    expect(c.easeFactor).toBeCloseTo(2.3, 5)
  })

  it('ease factor floors at 1.3', () => {
    const seed: SRSCard = { interval: 5, easeFactor: 1.4, dueDate: today(), reps: 3 }
    const c = nextCard(seed, 'again')
    expect(c.easeFactor).toBe(1.3)
  })

  it('ease factor ceils at 2.5 on "easy"', () => {
    const seed: SRSCard = { interval: 10, easeFactor: 2.5, dueDate: today(), reps: 4 }
    const c = nextCard(seed, 'easy')
    expect(c.easeFactor).toBe(2.5)
  })

  it('"easy" applies 1.3x interval multiplier', () => {
    const seed: SRSCard = { interval: 10, easeFactor: 2.5, dueDate: today(), reps: 3 }
    const c = nextCard(seed, 'easy')
    // 10 * 2.5 * 1.3 = 32.5 → rounds to 33 (and ease is already capped)
    expect(c.interval).toBe(33)
  })
})
