import type { VocabItem } from '../types'
import { LEVELS, toLevel } from './levels'

const cache = new Map<number, VocabItem[]>()

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6D2B79F5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export async function loadLevel(requested: number): Promise<VocabItem[]> {
  const level = toLevel(requested)
  if (cache.has(level)) return cache.get(level)!
  const loaders: Record<number, () => Promise<{ default: VocabItem[] }>> = {
    1: () => import('../../data/hsk1.json'),
    2: () => import('../../data/hsk2.json'),
    3: () => import('../../data/hsk3.json'),
    4: () => import('../../data/hsk4.json'),
    5: () => import('../../data/hsk5.json'),
    6: () => import('../../data/hsk6.json'),
    7: () => import('../../data/hsk7.json'),
  }
  const mod = await loaders[level]()
  const words = seededShuffle(mod.default as VocabItem[], level * 9973 + 1)
  cache.set(level, words)
  return words
}

export async function loadAllLevels(): Promise<VocabItem[]> {
  const levels = await Promise.all(LEVELS.map(loadLevel))
  return levels.flat()
}

export function levelFromId(id: string): number {
  return toLevel(parseInt(id.replace('hsk', '').split('_')[0]))
}

// Static word counts (official 2026 syllabus) — avoids loading all levels just to count
export const LEVEL_COUNTS: Record<number, number> = {
  1: 300, 2: 200, 3: 500, 4: 1000, 5: 1600, 6: 1800, 7: 5600,
}
