import { describe, it, expect } from 'vitest'
import type { VocabItem } from '../types'
import { TOPICS, countTopics, filterByTopics, parseTopics, topicsTitle } from './topics'

const word = (id: string, tags: string[]) => ({ id, tags } as unknown as VocabItem)
const words = [word('a', ['fruit']), word('b', ['fruit', 'food']), word('c', ['vegetables']), word('d', [])]

describe('topics', () => {
  it('has unique ids', () => {
    expect(new Set(TOPICS.map(t => t.id)).size).toBe(TOPICS.length)
  })

  it('parses the query string, dropping unknown and repeated ids', () => {
    expect(parseTopics('fruit, vegetables,nope,fruit')).toEqual(['fruit', 'vegetables'])
    expect(parseTopics(null)).toEqual([])
    expect(parseTopics('')).toEqual([])
  })

  it('keeps words that match any selected topic', () => {
    expect(filterByTopics(words, ['fruit']).map(w => w.id)).toEqual(['a', 'b'])
    expect(filterByTopics(words, ['fruit', 'vegetables']).map(w => w.id)).toEqual(['a', 'b', 'c'])
    expect(filterByTopics(words, [])).toBe(words)
  })

  it('counts words per topic', () => {
    const c = countTopics(words)
    expect(c.get('fruit')).toBe(2)
    expect(c.get('food')).toBe(1)
    expect(c.has('animals')).toBe(false)
  })

  it('builds short titles', () => {
    expect(topicsTitle(['fruit'])).toBe('Fruit')
    expect(topicsTitle(['fruit', 'drinks'])).toBe('Fruit & Drinks')
    expect(topicsTitle(['fruit', 'drinks', 'food'])).toBe('Fruit +2')
  })
})
