import { describe, it, expect } from 'vitest'
import { placeLabels, stairShade } from './describeCard'

const size = () => ({ w: 60, h: 36 })

describe('placeLabels', () => {
  it('puts tags right of the dot, or left near the right edge', () => {
    const out = placeLabels([{ x: 20, y: 50 }, { x: 90, y: 50 }], 400, 300, size)
    expect(out.map(p => [p.left, p.dy])).toEqual([[false, 0], [true, 0]])
  })

  it('moves a tag that would cover another, and drops one with nowhere to go', () => {
    const out = placeLabels([{ x: 47, y: 50 }, { x: 50, y: 50 }, { x: 49, y: 50 }], 400, 300, size)
    expect(out).toHaveLength(3)
    expect(new Set(out.map(p => `${p.left}${p.dy}`)).size).toBe(3)
    const crowded = placeLabels(Array.from({ length: 8 }, () => ({ x: 50, y: 50 })), 200, 80, size)
    expect(crowded.length).toBeLessThan(8)
  })

  it('keeps tags inside the photo', () => {
    const [top] = placeLabels([{ x: 30, y: 2 }], 400, 300, size)
    expect(top.dy).toBeGreaterThan(0)
  })
})

describe('stairShade', () => {
  it('rises from light to full red', () => {
    expect(stairShade(0, 7)).toBe(35)
    expect(stairShade(6, 7)).toBe(100)
  })
})
