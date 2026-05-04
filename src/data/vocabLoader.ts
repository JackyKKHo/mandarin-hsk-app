import type { VocabItem } from '../types'

const cache = new Map<number, VocabItem[]>()

export async function loadLevel(level: number): Promise<VocabItem[]> {
  if (cache.has(level)) return cache.get(level)!
  const loaders: Record<number, () => Promise<{ default: VocabItem[] }>> = {
    1: () => import('../../data/hsk1.json'),
    2: () => import('../../data/hsk2.json'),
    3: () => import('../../data/hsk3.json'),
    4: () => import('../../data/hsk4.json'),
    5: () => import('../../data/hsk5.json'),
    6: () => import('../../data/hsk6.json'),
    7: () => import('../../data/hsk7.json'),
    8: () => import('../../data/hsk8.json'),
    9: () => import('../../data/hsk9.json'),
  }
  const mod = await loaders[level]()
  const words = mod.default as VocabItem[]
  cache.set(level, words)
  return words
}

export async function loadAllLevels(): Promise<VocabItem[]> {
  const levels = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map(loadLevel))
  return levels.flat()
}

export function levelFromId(id: string): number {
  return parseInt(id.replace('hsk', '').split('_')[0]) || 1
}

// Static word counts — avoids loading all levels just to count
export const LEVEL_COUNTS: Record<number, number> = {
  1: 497, 2: 763, 3: 966, 4: 994, 5: 1067,
  6: 1134, 7: 1872, 8: 1872, 9: 1871,
}
