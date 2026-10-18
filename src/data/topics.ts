// Topic tags for vocabulary (the `tags` field in data/hsk*.json).
// A word can have 0–3 topics; grammar/function words usually have none.
// The list itself lives in topics.json so `node scripts/fill-tags.mjs` can read it. Keep ids stable:
// renaming an id means re-tagging. Add new topics at the end of a group.

import type { VocabItem } from '../types'
import topicGroups from './topics.json'

export interface Topic {
  id: string
  label: string
  zh: string
  /** Shown to the tagger so borderline words land in the right place */
  hint: string
  /** Concrete enough to show as a photo (used by the picture quiz and scripts/fill-images.mjs) */
  pictures?: boolean
}

export interface TopicGroup {
  label: string
  topics: Topic[]
}

export const TOPIC_GROUPS: TopicGroup[] = topicGroups

export const TOPICS: Topic[] = TOPIC_GROUPS.flatMap(g => g.topics)
export const TOPIC_IDS = new Set(TOPICS.map(t => t.id))
const BY_ID = new Map(TOPICS.map(t => [t.id, t]))

export function topicLabel(id: string): string {
  return BY_ID.get(id)?.label ?? id
}

/** Read `?topics=fruit,vegetables` → valid topic ids, deduped, in the order given */
export function parseTopics(raw: string | null | undefined): string[] {
  if (!raw) return []
  return [...new Set(raw.split(',').map(s => s.trim()).filter(id => TOPIC_IDS.has(id)))]
}

/** Words tagged with ANY of the selected topics; no selection = every word */
export function filterByTopics(words: VocabItem[], topics: string[]): VocabItem[] {
  if (topics.length === 0) return words
  const wanted = new Set(topics)
  return words.filter(w => w.tags?.some(t => wanted.has(t)))
}

/** How many words carry each topic (for chip counts and hiding empty topics) */
export function countTopics(words: VocabItem[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const w of words) for (const t of w.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
  return counts
}

/** "Fruit", "Fruit & Drinks", "Fruit +2" */
export function topicsTitle(topics: string[]): string {
  if (topics.length <= 2) return topics.map(topicLabel).join(' & ')
  return `${topicLabel(topics[0])} +${topics.length - 1}`
}
