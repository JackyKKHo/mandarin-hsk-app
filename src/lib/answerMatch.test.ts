import { describe, it, expect } from 'vitest'
import { matchAnswer } from './answerMatch'

const apple = { simplified: '苹果', traditional: '蘋果', pinyin: 'píngguǒ', pinyinNumbered: 'ping2 guo3' }
const mum = { simplified: '妈妈', traditional: '媽媽', pinyin: 'māma', pinyinNumbered: 'ma1 ma5' }
const green = { simplified: '绿', traditional: '綠', pinyin: 'lǜ', pinyinNumbered: 'lü4' }

describe('matchAnswer', () => {
  it('accepts characters, simplified or traditional', () => {
    expect(matchAnswer('苹果', apple)).toBe('exact')
    expect(matchAnswer(' 蘋果 ', apple)).toBe('exact')
    expect(matchAnswer('苹', apple)).toBe('wrong')
  })

  it('accepts pinyin with tone marks or numbers, any spacing or case', () => {
    expect(matchAnswer('píngguǒ', apple)).toBe('exact')
    expect(matchAnswer('Ping2 guo3', apple)).toBe('exact')
    expect(matchAnswer('ping2guo3', apple)).toBe('exact')
  })

  it('flags pinyin without tones, rejects wrong tones', () => {
    expect(matchAnswer('pingguo', apple)).toBe('toneless')
    expect(matchAnswer('ping1guo3', apple)).toBe('wrong')
    expect(matchAnswer('pinguo', apple)).toBe('wrong')
  })

  it('handles the neutral tone', () => {
    expect(matchAnswer('ma1ma', mum)).toBe('exact')
    expect(matchAnswer('ma1ma5', mum)).toBe('exact')
    expect(matchAnswer('ma1ma1', mum)).toBe('wrong')
  })

  it('accepts v and u: for ü', () => {
    expect(matchAnswer('lv4', green)).toBe('exact')
    expect(matchAnswer('lu:4', green)).toBe('exact')
    expect(matchAnswer('lü', green)).toBe('toneless')
  })

  it('rejects empty input', () => {
    expect(matchAnswer('  ', apple)).toBe('wrong')
  })
})
