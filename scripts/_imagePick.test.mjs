import { describe, it, expect } from 'vitest'
import { pickEntity, isOpenLicence, plainCredit, imageEntry, glossTerms } from './_imagePick.mjs'

const claim = v => ({ mainsnak: { datavalue: { value: v } } })
const entity = (id, { zh, zhAlias = [], en, enAlias = [], image, instanceOf = [] }) => ({
  id,
  labels: { ...(zh && { 'zh-hans': { value: zh } }), ...(en && { en: { value: en } }) },
  aliases: { 'zh-hans': zhAlias.map(value => ({ value })), en: enAlias.map(value => ({ value })) },
  claims: {
    ...(image && { P18: [claim(image)] }),
    P31: instanceOf.map(id => claim({ id })),
  },
})

const apple = { simplified: '苹果', english: 'apple', meanings: [{ definition: 'apple' }] }

describe('pickEntity', () => {
  it('picks the everyday concept over a company with the same Chinese name', () => {
    const r = pickEntity(apple, [
      entity('Q312', { zh: '苹果', en: 'Apple', image: 'Apple park.jpg', instanceOf: ['Q4830453'] }),
      entity('Q89', { zh: '苹果', en: 'apple', image: 'Red Apple.jpg' }),
    ])
    expect(r).toMatchObject({ id: 'Q89', file: 'Red Apple.jpg' })
  })

  it('skips items with no image or whose English meaning does not match', () => {
    const r = pickEntity(apple, [
      entity('Q1', { zh: '苹果', en: 'apple' }),
      entity('Q2', { zh: '苹果', en: 'Apple Records label', image: 'x.jpg' }),
    ])
    expect(r.file).toBeUndefined()
    expect(r.reason).toMatch(/no image/)
  })

  it('matches plurals and multi-meaning glosses', () => {
    const bus = { simplified: '公共汽车', english: 'bus; public bus' }
    const r = pickEntity(bus, [entity('Q5638', { zh: '公共汽车', en: 'buses', image: 'Bus.jpg' })])
    expect(r.id).toBe('Q5638')
  })

  it('prefers the general concept (lower Q id) on a tie', () => {
    const cat = { simplified: '猫', english: 'cat' }
    const r = pickEntity(cat, [
      entity('Q2000000', { zh: '猫', en: 'cat', image: 'b.jpg' }),
      entity('Q146', { zh: '猫', en: 'cat', image: 'a.jpg' }),
    ])
    expect(r.id).toBe('Q146')
  })
})

describe('licences and credits', () => {
  it('allows public domain and CC BY / BY-SA only', () => {
    for (const ok of ['CC0', 'Public domain', 'CC BY 2.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0 de', 'CC BY-SA']) expect(isOpenLicence(ok)).toBe(true)
    for (const no of ['GFDL', 'CC BY-NC 2.0', 'CC BY-ND 4.0', 'Fair use', '', undefined]) expect(isOpenLicence(no)).toBe(false)
  })

  it('turns Commons HTML credits into short plain text', () => {
    expect(plainCredit('<a href="//x">Jane &amp; Co</a>')).toBe('Jane & Co')
    expect(plainCredit('')).toBe('Wikimedia Commons contributor')
    expect(plainCredit('x'.repeat(200)).length).toBe(78)
  })

  it('builds an entry, rejecting drawings and closed licences', () => {
    const info = {
      mime: 'image/jpeg', url: 'https://u/full.jpg', thumburl: 'https://u/640.jpg', descriptionurl: 'https://c/File:A.jpg',
      extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<b>Ann</b>' } },
    }
    expect(imageEntry('Q89', info)).toEqual({
      src: 'https://u/640.jpg', page: 'https://c/File:A.jpg', author: 'Ann', license: 'CC BY-SA 4.0', wikidata: 'Q89',
    })
    expect(imageEntry('Q89', { ...info, mime: 'image/svg+xml' }).reason).toMatch(/svg/)
    expect(imageEntry('Q89', { ...info, extmetadata: { LicenseShortName: { value: 'GFDL' } } }).reason).toMatch(/licence/)
  })
})

describe('glossTerms', () => {
  it('splits phrases and drops filler words', () => {
    const g = glossTerms(['to ride (a bike); or a horse'])
    expect(g.phrases.has('ride')).toBe(true)
    expect(g.tokens.has('bike')).toBe(true)
    expect(g.tokens.has('to')).toBe(false)
  })
})
