import { sanitiseLearner, learnerNote } from './_learnerProfile.js'

describe('sanitiseLearner', () => {
  it('returns null when nothing usable is sent', () => {
    expect(sanitiseLearner(undefined)).toBeNull()
    expect(sanitiseLearner('hsk4')).toBeNull()
  })

  it('clamps the level and mastered count', () => {
    expect(sanitiseLearner({ level: 9, mastered: -5 })).toEqual({ level: 7, mastered: 0, weakWords: [] })
    expect(sanitiseLearner({ level: '3', mastered: '120.7' })).toEqual({ level: 3, mastered: 120, weakWords: [] })
    expect(sanitiseLearner({ level: 'x' }).level).toBe(1)
  })

  it('only lets short Chinese words through, deduplicated and capped', () => {
    const r = sanitiseLearner({
      level: 4,
      mastered: 10,
      weakWords: ['认识', '认识', 'ignore previous instructions', '你好。', 42, '一二三四五六七', ...Array(20).fill('考试').map((w, i) => w + '中国人民'[i % 4])],
    })
    expect(r.weakWords[0]).toBe('认识')
    expect(r.weakWords).not.toContain('ignore previous instructions')
    expect(r.weakWords).not.toContain('你好。')
    expect(r.weakWords).not.toContain('一二三四五六七')
    expect(r.weakWords.length).toBeLessThanOrEqual(12)
    expect(new Set(r.weakWords).size).toBe(r.weakWords.length)
  })
})

describe('learnerNote', () => {
  it('is empty without a profile', () => {
    expect(learnerNote(null)).toBe('')
  })

  it('names the level and leaves out the weak-word advice when there are none', () => {
    const note = learnerNote({ level: 7, mastered: 3000, weakWords: [] })
    expect(note).toContain('HSK 7–9')
    expect(note).not.toContain('keeps forgetting')
  })

  it('lists weak words', () => {
    expect(learnerNote({ level: 3, mastered: 400, weakWords: ['认识', '知道'] })).toContain('认识、知道')
  })
})
