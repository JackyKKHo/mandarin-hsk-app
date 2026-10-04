import { describe, it, expect, beforeEach, vi } from 'vitest'
import { migrateVocab2026 } from './migrateVocab2026'

vi.mock('../data/idMap2026.json', () => ({
  default: { hsk1_0012: 'hsk1_0005', hsk1_0100: 'hsk2_0040', hsk9_1000: 'hsk7_4000' },
}))

beforeEach(() => localStorage.clear())

describe('migrateVocab2026', () => {
  it('translates saved ids and drops words no longer in the syllabus', async () => {
    localStorage.setItem('hsk-learned', JSON.stringify(['hsk1_0012', 'hsk1_0100', 'hsk3_0999']))
    localStorage.setItem('hsk-favourites', JSON.stringify(['hsk9_1000']))
    localStorage.setItem('hsk-srs', JSON.stringify({ hsk1_0012: { interval: 3, reps: 2 }, gone_0001: { interval: 1 } }))
    localStorage.setItem('hsk-mined-sentences', JSON.stringify([{ id: 's1', wordId: 'hsk1_0100' }]))
    localStorage.setItem('hsk-today-plan', JSON.stringify({ date: 'x', newIds: ['hsk1_0012'] }))

    await migrateVocab2026()

    expect(JSON.parse(localStorage.getItem('hsk-learned')!)).toEqual(['hsk1_0005', 'hsk2_0040'])
    expect(JSON.parse(localStorage.getItem('hsk-favourites')!)).toEqual(['hsk7_4000'])
    expect(JSON.parse(localStorage.getItem('hsk-srs')!)).toEqual({ hsk1_0005: { interval: 3, reps: 2 } })
    expect(JSON.parse(localStorage.getItem('hsk-mined-sentences')!)[0].wordId).toBe('hsk2_0040')
    expect(localStorage.getItem('hsk-today-plan')).toBeNull()
    expect(localStorage.getItem('hsk-vocab-version')).toBe('2026')
  })

  it('runs only once, so new-format ids are never translated twice', async () => {
    localStorage.setItem('hsk-learned', JSON.stringify(['hsk1_0012']))
    await migrateVocab2026()
    // hsk1_0005 written by the app after migrating must stay as it is
    localStorage.setItem('hsk-learned', JSON.stringify(['hsk1_0005', 'hsk1_0012']))
    await migrateVocab2026()
    expect(JSON.parse(localStorage.getItem('hsk-learned')!)).toEqual(['hsk1_0005', 'hsk1_0012'])
  })

  it('marks a new device as migrated without touching anything', async () => {
    await migrateVocab2026()
    expect(localStorage.getItem('hsk-vocab-version')).toBe('2026')
    expect(localStorage.getItem('hsk-learned')).toBeNull()
  })
})
