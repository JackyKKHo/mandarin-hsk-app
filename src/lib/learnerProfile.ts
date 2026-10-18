// A compact picture of the learner that Lin Wei gets with every message, so answers
// stay at the learner's level and recycle the words they keep forgetting.
// Built from SRS data on the device; only the word strings are sent, never ids or history.
import type { SRSCard } from '../hooks/useSRS'

export const MAX_WEAK_WORDS = 12
export const MASTERED_INTERVAL = 21

// One "again" drops ease from 2.5 to 2.3 and "good" never raises it, so anything at or
// below ~2.3 has lapsed at least once and hasn't been recovered with "easy".
const WEAK_EASE = 2.35

export interface LearnerProfile {
  level: number
  mastered: number
  weakWords: string[]
}

/** Ids of the words the learner struggles with most: lowest ease first, then soonest due. */
export function pickWeakIds(cards: Record<string, SRSCard>, limit = MAX_WEAK_WORDS): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.easeFactor < WEAK_EASE)
    .sort(([, a], [, b]) => a.easeFactor - b.easeFactor || a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit)
    .map(([id]) => id)
}

export function countMastered(cards: Record<string, SRSCard>): number {
  return Object.values(cards).filter(c => c.interval >= MASTERED_INTERVAL).length
}
