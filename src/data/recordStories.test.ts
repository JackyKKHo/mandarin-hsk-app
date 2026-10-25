import { describe, it, expect } from 'vitest'
import { pinyin } from 'pinyin-pro'
import { RECORD_STORIES, sentenceScore } from './recordStories'

const han = (s: string) => [...s].filter(c => /\p{Script=Han}/u.test(c)).join('')
const letters = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

describe('record stories', () => {
  it('has unique ids and 5+ sentences per story', () => {
    expect(new Set(RECORD_STORIES.map(s => s.id)).size).toBe(RECORD_STORIES.length)
    for (const s of RECORD_STORIES) expect(s.sentences.length).toBeGreaterThanOrEqual(5)
  })

  it('keeps every sentence within the scorer limit', () => {
    for (const s of RECORD_STORIES) {
      for (const line of s.sentences) {
        expect(line.zh.length).toBeLessThanOrEqual(60)
        expect(han(line.zh).length).toBeLessThanOrEqual(25)
      }
    }
  })

  // The scorer reads the expected sounds with pinyin-pro, so the pinyin shown to the
  // learner must spell the same syllables (tones are left out: 一/不 changes are written).
  // Adverbial 地 is de; the scorer accepts it as light whatever pinyin-pro says.
  it('spells the same syllables the scorer expects', () => {
    for (const s of RECORD_STORIES) {
      for (const line of s.sentences) {
        const chars = [...han(line.zh)]
        const syllables = pinyin(chars.join(''), { toneType: 'none', type: 'array' })
          .map((p, i) => chars[i] === '地' ? '(?:di|de)' : letters(p.replace(/ü/g, 'u')))
        expect(letters(line.pinyin), `${s.id}: ${line.zh}`).toMatch(new RegExp(`^${syllables.join('')}$`))
      }
    }
  })
})

describe('sentenceScore', () => {
  it('ignores unknown checks', () => {
    expect(sentenceScore([
      { scores: { initial: 'ok', final: 'ok', tone: 'miss' } },
      { scores: { initial: 'unknown', final: 'ok', tone: 'ok' } },
    ])).toBe(80)
    expect(sentenceScore([{ scores: { initial: 'unknown', final: 'unknown', tone: 'unknown' } }])).toBeNull()
  })
})
