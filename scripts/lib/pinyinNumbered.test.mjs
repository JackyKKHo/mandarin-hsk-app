import { describe, it, expect } from 'vitest'
import { numbered } from './pinyinNumbered.mjs'

describe('numbered', () => {
  it('gives a final n or ng to the next syllable when a vowel follows', () => {
    expect(numbered('niúnǎi')).toBe('niu2 nai3')
    expect(numbered('kěnéng')).toBe('ke3 neng2')
    expect(numbered('bàngōngshì')).toBe('ban4 gong1 shi4')
    expect(numbered('nǎinai')).toBe('nai3 nai0')
  })

  it('keeps n and ng at the end of a syllable', () => {
    expect(numbered('Běijīng')).toBe('bei3 jing1')
    expect(numbered('zhōngguó')).toBe('zhong1 guo2')
  })

  it('keeps ü', () => {
    expect(numbered('nǚ')).toBe('nü3')
    expect(numbered('lǜsè')).toBe('lü4 se4')
  })

  it('splits erhua into its own er2', () => {
    expect(numbered('miàntiáor')).toBe('mian4 tiao2 er2')
    expect(numbered('èr')).toBe('er4')
  })
})
