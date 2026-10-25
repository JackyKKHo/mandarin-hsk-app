import { RUNGS, SYSTEM_PROMPT, imageBlock, sanitiseLadder } from './_pictureLadder.js'

const rung = (i, extra = {}) => ({
  zh: `第${i}级。`, pinyin: 'dì jí.', en: `Rung ${i}.`, focus: 'Focus', ask: '这是什么？', askEn: 'What is this?',
  keywords: [{ zh: '扶手', pinyin: 'fúshǒu', en: 'handrail' }], ...extra,
})
const ladder = (n = 7) => ({ title: '上楼梯', titleEn: 'Going upstairs', levels: Array.from({ length: n }, (_, i) => rung(i + 1)) })

describe('prompt', () => {
  it('describes all seven rungs in order', () => {
    expect(RUNGS.map(r => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7])
    for (const r of RUNGS) expect(SYSTEM_PROMPT).toContain(`Rung ${r.level} — ${r.layer}`)
  })
})

describe('imageBlock', () => {
  it('accepts a base64 JPEG', () => {
    expect(imageBlock({ image: 'abcd+/09==', mediaType: 'image/jpeg' }).block.source)
      .toEqual({ type: 'base64', media_type: 'image/jpeg', data: 'abcd+/09==' })
  })

  it('rejects missing, oversized, non-base64 or unsupported images', () => {
    expect(imageBlock({}).error).toBe('Missing image')
    expect(imageBlock({ image: 'abcd', mediaType: 'image/heic' }).error).toBe('Unsupported image type')
    expect(imageBlock({ image: 'data:image/jpeg;base64,abcd', mediaType: 'image/jpeg' }).error).toBe('Image must be base64')
    expect(imageBlock({ image: 'a'.repeat(7 * 1024 * 1024), mediaType: 'image/jpeg' }).error).toBe('Image too large')
  })

  it('only allows Wikimedia sample photos by URL', () => {
    expect(imageBlock({ imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Apple.jpg' }).block.source.type).toBe('url')
    expect(imageBlock({ imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/x.jpg/960px-x.jpg?utm_source=c' }).block).toBeTruthy()
    expect(imageBlock({ imageUrl: 'https://example.com/a.jpg' }).error).toMatch(/sample/)
    expect(imageBlock({ imageUrl: 'https://upload.wikimedia.org.evil.com/a.jpg' }).error).toMatch(/sample/)
    expect(imageBlock({ imageUrl: 'http://upload.wikimedia.org/a.jpg' }).error).toMatch(/sample/)
    expect(imageBlock({ imageUrl: 'not a url' }).error).toBe('Bad image URL')
  })
})

describe('sanitiseLadder', () => {
  it('keeps a well-formed ladder', () => {
    const out = sanitiseLadder(ladder())
    expect(out.levels).toHaveLength(7)
    expect(out.levels[0]).toEqual(rung(1))
  })

  it('rejects a short ladder or an empty rung', () => {
    expect(sanitiseLadder(ladder(6))).toBeNull()
    const l = ladder(); l.levels[3].zh = '  '
    expect(sanitiseLadder(l)).toBeNull()
    expect(sanitiseLadder('nope')).toBeNull()
  })

  it('drops extra rungs, non-Chinese keywords and caps keyword count', () => {
    const l = ladder(9)
    l.levels[0].keywords = [{ zh: 'hello', pinyin: '', en: '' }, ...Array(6).fill({ zh: '栏杆', pinyin: 'lángān', en: 'railing' })]
    const out = sanitiseLadder(l)
    expect(out.levels).toHaveLength(7)
    expect(out.levels[0].keywords).toHaveLength(4)
    expect(out.levels[0].keywords.every(k => k.zh === '栏杆')).toBe(true)
  })
})
