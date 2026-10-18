import { describe, it, expect } from 'vitest'
import { daysUntil, cumulativeCoverage } from './exam'

describe('daysUntil', () => {
  it('counts whole UTC days', () => {
    expect(daysUntil('2026-12-13', new Date('2026-10-18T23:30:00Z'))).toBe(56)
    expect(daysUntil('2026-12-13', new Date('2026-12-13T08:00:00Z'))).toBe(0)
    expect(daysUntil('2026-12-13', new Date('2026-12-14T00:00:01Z'))).toBe(-1)
  })
})

describe('cumulativeCoverage', () => {
  it('includes every lower level', () => {
    // HSK 1: 300/300, HSK 2: 0/200 → HSK 2 exam coverage is 300/500 = 60%
    expect(cumulativeCoverage([
      { mastered: 300, total: 300 },
      { mastered: 0, total: 200 },
      { mastered: 250, total: 500 },
    ])).toEqual([100, 60, 55])
  })

  it('handles empty totals', () => {
    expect(cumulativeCoverage([{ mastered: 0, total: 0 }])).toEqual([0])
  })
})
