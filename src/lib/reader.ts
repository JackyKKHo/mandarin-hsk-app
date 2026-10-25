// "Read anything": how much of a pasted text the learner already knows.
import type { VocabItem } from '../types'
import { isHan, type Token } from './segment'
import { LEVELS } from '../data/levels'

/** known = learned or marked too easy; learning = has an SRS card; new = in the HSK list but unseen */
export type WordStatus = 'known' | 'learning' | 'new'

export interface ReaderStats {
  /** HSK word tokens in the text (repeats count) */
  words: number
  known: number
  learning: number
  new: number
  /** Han characters that aren't part of any HSK word (names, rare words) */
  outside: number
  /** Share of HSK word tokens that are known or being learned, 0–100 */
  coverage: number
  /** Distinct new words, easiest level first */
  newWords: VocabItem[]
  /** Lowest HSK level whose words cover ≥95% of the text's words, or null when the text has none */
  level: number | null
}

export function readerStats(tokens: Token[], statusOf: (id: string) => WordStatus): ReaderStats {
  const s = { words: 0, known: 0, learning: 0, new: 0, outside: 0 }
  const fresh = new Map<string, VocabItem>()
  const byLevel = new Map<number, number>()

  for (const tok of tokens) {
    if (!tok.vocab) {
      for (const ch of tok.text) if (isHan(ch)) s.outside++
      continue
    }
    s.words++
    byLevel.set(tok.vocab.hskLevel, (byLevel.get(tok.vocab.hskLevel) ?? 0) + 1)
    const st = statusOf(tok.vocab.id)
    s[st]++
    if (st === 'new') fresh.set(tok.vocab.id, tok.vocab)
  }

  let level: number | null = null
  if (s.words > 0) {
    let covered = 0
    for (const l of LEVELS) {
      covered += byLevel.get(l) ?? 0
      if (covered / s.words >= 0.95) { level = l; break }
    }
  }

  return {
    ...s,
    coverage: s.words ? Math.round(((s.known + s.learning) / s.words) * 100) : 0,
    newWords: [...fresh.values()].sort((a, b) => a.hskLevel - b.hskLevel),
    level,
  }
}

/** Word lookup across levels: simplified and traditional forms, lower level wins on clashes */
export function buildLookup(words: VocabItem[]): Map<string, VocabItem> {
  const map = new Map<string, VocabItem>()
  for (const w of [...words].sort((a, b) => b.hskLevel - a.hskLevel)) {
    map.set(w.simplified, w)
    if (w.traditional && w.traditional !== w.simplified) map.set(w.traditional, w)
  }
  return map
}
