import { RUNGS, SYSTEM_PROMPT, imageBlock, inlineImage, sanitiseLadder } from './_pictureLadder.js'

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
  it('keeps photo labels, clamped to the photo, and tolerates ladders saved before labels existed', () => {
    const l = ladder()
    l.labels = [
      { zh: '喷泉', pinyin: 'pēnquán', en: 'fountain', x: 48.6, y: 62 },
      { zh: '树', pinyin: 'shù', en: 'tree', x: 130, y: -5 },
      { zh: 'tree', pinyin: '', en: '', x: 10, y: 10 },
      { zh: '草地', pinyin: 'cǎodì', en: 'lawn', x: 'left', y: 80 },
    ]
    expect(sanitiseLadder(l).labels).toEqual([
      { zh: '喷泉', pinyin: 'pēnquán', en: 'fountain', x: 49, y: 62 },
      { zh: '树', pinyin: 'shù', en: 'tree', x: 100, y: 0 },
    ])
    expect(sanitiseLadder(ladder()).labels).toEqual([])
  })
})

describe('inlineImage', () => {
  const urlBlock = { type: 'image', source: { type: 'url', url: 'https://upload.wikimedia.org/a.jpg' } }
  const fakeFetch = (status, type, bytes = [1, 2, 3]) => async () =>
    new Response(new Uint8Array(bytes), { status, headers: { 'content-type': type } })

  it('fetches sample photos and sends them as base64', async () => {
    const { block } = await inlineImage(urlBlock, fakeFetch(200, 'image/jpeg'))
    expect(block.source).toEqual({ type: 'base64', media_type: 'image/jpeg', data: 'AQID' })
  })
  it('passes uploaded photos through', async () => {
    const b64 = { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AA==' } }
    expect((await inlineImage(b64, () => { throw new Error('no fetch') })).block).toBe(b64)
  })
  it('rejects failed downloads and non-images', async () => {
    expect((await inlineImage(urlBlock, fakeFetch(404, 'image/jpeg'))).error).toBeTruthy()
    expect((await inlineImage(urlBlock, fakeFetch(200, 'text/html'))).error).toBeTruthy()
    expect((await inlineImage(urlBlock, async () => { throw new Error('offline') })).error).toBeTruthy()
  })
})
