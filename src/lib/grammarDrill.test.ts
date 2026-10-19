import { describe, it, expect } from 'vitest'
import grammarData from '../../data/grammar.json'
import type { GrammarOrderExercise, GrammarPoint } from '../types'
import {
  buildDrill, checkOrder, drillItems, fillBlank, normaliseSentence,
  orderAnswerText, shuffleTiles, validateExercise,
} from './grammarDrill'

const grammar = grammarData as GrammarPoint[]

const order: GrammarOrderExercise = {
  type: 'order',
  english: 'She went to Beijing yesterday.',
  tokens: ['她', '昨天', '去', '了', '北京'],
  alt: ['昨天她去了北京'],
}

describe('grammar drill helpers', () => {
  it('ignores spaces and punctuation when comparing', () => {
    expect(normaliseSentence('我 是学生。')).toBe('我是学生')
    expect(normaliseSentence('因为太贵了，所以我没买！')).toBe('因为太贵了所以我没买')
  })

  it('accepts the main order and listed alternatives only', () => {
    expect(checkOrder(order, ['她', '昨天', '去', '了', '北京'])).toBe(true)
    expect(checkOrder(order, ['昨天', '她', '去', '了', '北京'])).toBe(true)
    expect(checkOrder(order, ['她', '去', '了', '北京', '昨天'])).toBe(false)
  })

  it('adds the right end punctuation to the model answer', () => {
    expect(orderAnswerText(order)).toBe('她昨天去了北京。')
    expect(orderAnswerText({ ...order, english: 'Is he coming?', tokens: ['他', '来', '吗'] })).toBe('他来吗？')
  })

  it('fills the blank, or returns a chosen sentence as-is', () => {
    expect(fillBlank('我＿＿学生。', '是')).toBe('我是学生。')
    expect(fillBlank('Which sentence is correct?', '我是学生。')).toBe('我是学生。')
  })

  it('never starts tiles in an accepted order', () => {
    for (let seed = 0; seed < 50; seed++) {
      let x = seed
      const rng = () => ((x = (x * 9301 + 49297) % 233280) / 233280)
      const tiles = shuffleTiles(order, rng)
      expect(tiles.slice().sort()).toEqual([0, 1, 2, 3, 4])
      expect(checkOrder(order, tiles.map(i => order.tokens[i]))).toBe(false)
    }
  })

  it('builds a level drill and respects the limit', () => {
    const hsk1 = grammar.filter(g => g.hskLevel === 1)
    expect(buildDrill(hsk1).length).toBe(drillItems(hsk1).length)
    expect(buildDrill(hsk1, 10).length).toBe(10)
  })
})

describe('data/grammar.json exercises', () => {
  it('every grammar point has at least 5 exercises, with both kinds', () => {
    for (const g of grammar) {
      const ex = g.exercises ?? []
      expect(ex.length, g.id).toBeGreaterThanOrEqual(5)
      expect(ex.some(e => e.type === 'choice'), g.id).toBe(true)
    }
  })

  it('every exercise is well-formed', () => {
    for (const g of grammar) {
      for (const [i, ex] of (g.exercises ?? []).entries()) {
        expect(validateExercise(ex), `${g.id} #${i + 1}`).toEqual([])
      }
    }
  })
})
