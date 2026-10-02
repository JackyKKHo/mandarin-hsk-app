import { pinyin } from 'pinyin-pro'
import { applyThirdToneSandhi, hanPhraseIds } from './_toneSandhi.js'

// Dictionary tones as the scorer gets them from pinyin-pro
function scored(text) {
  const han = [...text].filter(c => /\p{Script=Han}/u.test(c)).join('')
  const tones = pinyin(han, { toneType: 'num', type: 'array' }).map(p => Number(p.slice(-1)) || 0)
  return applyThirdToneSandhi(tones, hanPhraseIds(text), [...han])
}

describe('applyThirdToneSandhi', () => {
  it('turns the first of two 3rd tones into a 2nd tone', () => {
    const r = scored('我有三个苹果。')
    expect(r[0]).toEqual({ tone: 2, accept: [2], sandhi: true }) // 我 wó
    expect(r[1]).toMatchObject({ tone: 3, accept: [3], sandhi: false, halfThird: true }) // 有 yǒu, mid-phrase
    expect(r.slice(2).every(c => !c.sandhi)).toBe(true)
  })

  it('handles common pairs', () => {
    for (const w of ['你好', '可以', '小狗', '老鼠']) {
      expect(scored(w).map(c => c.tone)).toEqual([2, 3])
    }
  })

  it('accepts either tone early in a run of three, but fixes the last two', () => {
    for (const w of ['展览馆', '我很好']) {
      const r = scored(w)
      expect(r[0].accept).toEqual([2, 3])
      expect(r[1]).toMatchObject({ tone: 2, accept: [2] })
      expect(r[2]).toMatchObject({ tone: 3, accept: [3] })
    }
  })

  it('does not apply across punctuation', () => {
    const r = scored('你好。我')
    expect(r.map(c => c.tone)).toEqual([2, 3, 3])
  })

  it('accepts any detected tone on neutral syllables and reduplications', () => {
    for (const w of ['我们', '你的', '妈妈', '什么']) expect(scored(w)[1].neutral).toBe(true)
    for (const w of ['谢谢', '看看']) expect(scored(w)[1]).toMatchObject({ neutral: true, accept: [0, 1, 2, 3, 4] })
    expect(scored('想想')[0]).toMatchObject({ tone: 2, sandhi: true }) // xiáng xiang
  })

  it('flags half-third tones: a 3rd tone with more of the phrase after it', () => {
    expect(scored('好吃')[0].halfThird).toBe(true)
    expect(scored('我爱你')[0].halfThird).toBe(true)
    expect(scored('我爱你')[2].halfThird).toBeUndefined() // phrase-final: full dip
    expect(scored('你好。')[1].halfThird).toBeUndefined()
  })

  it('leaves the 一/不 changes pinyin-pro already made alone', () => {
    expect(scored('不是').map(c => c.tone)).toEqual([2, 4])
    expect(scored('一起').map(c => c.tone)).toEqual([4, 3])
  })
})
