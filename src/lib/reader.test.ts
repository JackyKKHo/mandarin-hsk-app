import { describe, it, expect } from 'vitest'
import type { VocabItem } from '../types'
import { segment, chunkForSpeech } from './segment'
import { readerStats, buildLookup, type WordStatus } from './reader'

function word(id: string, simplified: string, hskLevel: number, traditional = simplified): VocabItem {
  return {
    id, hskLevel, simplified, traditional, pinyin: '', pinyinNumbered: '', english: '',
    partOfSpeech: '', examples: [], tags: [], audio: { wordAudioUrl: null, exampleAudioUrls: [] },
  }
}

const WORDS = [
  word('a', '我', 1), word('b', '喜欢', 1, '喜歡'), word('c', '中国', 1, '中國'),
  word('d', '中', 1), word('e', '国', 2, '國'), word('f', '菜', 2), word('g', '图书馆', 3, '圖書館'),
  word('h', '我', 4), // same word listed again at a higher level
]
const lookup = buildLookup(WORDS)

describe('segment', () => {
  it('prefers the longest HSK word', () => {
    expect(segment('我喜欢中国菜。', lookup).map(t => t.text)).toEqual(['我', '喜欢', '中国', '菜', '。'])
  })

  it('matches traditional forms and keeps unknown characters separate from punctuation', () => {
    const toks = segment('我喜歡圖書館，嗯！', lookup)
    expect(toks.map(t => t.text)).toEqual(['我', '喜歡', '圖書館', '，', '嗯', '！'])
    expect(toks[2].vocab?.id).toBe('g')
    expect(toks[4].vocab).toBeUndefined()
  })

  it('keeps Latin text and spaces together', () => {
    expect(segment('我 like 菜', lookup).map(t => t.text)).toEqual(['我', ' like ', '菜'])
  })
})

describe('buildLookup', () => {
  it('lets the lower level win when a word is listed twice', () => {
    expect(lookup.get('我')?.id).toBe('a')
  })
})

describe('readerStats', () => {
  const status: Record<string, WordStatus> = { a: 'known', b: 'learning' }
  const statusOf = (id: string) => status[id] ?? 'new'

  it('counts statuses, coverage and distinct new words', () => {
    const s = readerStats(segment('我喜欢中国菜，我喜欢图书馆。嗯', lookup), statusOf)
    expect(s).toMatchObject({ words: 7, known: 2, learning: 2, new: 3, outside: 1, coverage: 57 })
    expect(s.newWords.map(w => w.id)).toEqual(['c', 'f', 'g'])
  })

  it('estimates the lowest level covering 95% of words', () => {
    expect(readerStats(segment('我喜欢中国', lookup), statusOf).level).toBe(1)
    expect(readerStats(segment('我喜欢菜', lookup), statusOf).level).toBe(2)
    expect(readerStats(segment('嗯', lookup), statusOf).level).toBeNull()
  })
})

describe('chunkForSpeech', () => {
  it('groups sentences up to the limit', () => {
    expect(chunkForSpeech('你好。我很好！你呢？', 6)).toEqual(['你好。', '我很好！', '你呢？'])
    expect(chunkForSpeech('你好。我很好！你呢？', 20)).toEqual(['你好。我很好！你呢？'])
  })

  it('splits one long sentence at commas without losing text', () => {
    const long = '今天天气很好，我们一起去公园散步，然后去吃饭。'
    const chunks = chunkForSpeech(long, 10)
    expect(chunks.join('')).toBe(long)
    expect(chunks.every(c => c.length <= 10)).toBe(true)
  })

  it('drops blank lines', () => {
    expect(chunkForSpeech('\n\n你好\n\n')).toEqual(['你好'])
  })
})
