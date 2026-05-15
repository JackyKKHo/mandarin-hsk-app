import { useState, useCallback } from 'react'

const KEY = 'hsk-mined-sentences'

export interface MinedSentence {
  id: string
  chinese: string
  pinyin: string
  english: string
  wordId: string
  wordSimplified: string
  addedAt: string
  interval: number
  easeFactor: number
  dueDate: string
  reps: number
}

export type SRSQuality = 'again' | 'good' | 'easy'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function load(): MinedSentence[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(sentences: MinedSentence[]) {
  localStorage.setItem(KEY, JSON.stringify(sentences))
}

function nextSRS(s: MinedSentence, quality: SRSQuality): Partial<MinedSentence> {
  if (quality === 'again') {
    return { interval: 1, easeFactor: Math.max(1.3, s.easeFactor - 0.2), dueDate: today(), reps: 0 }
  }
  const ef = quality === 'easy' ? Math.min(2.5, s.easeFactor + 0.15) : s.easeFactor
  let interval: number
  if (s.reps === 0) interval = 1
  else if (s.reps === 1) interval = quality === 'easy' ? 4 : 3
  else interval = Math.round(s.interval * ef * (quality === 'easy' ? 1.3 : 1))
  return { interval, easeFactor: ef, dueDate: addDays(interval), reps: s.reps + 1 }
}

export function useMinedSentences() {
  const [sentences, setSentences] = useState<MinedSentence[]>(load)

  const mine = useCallback((
    chinese: string,
    pinyin: string,
    english: string,
    wordId: string,
    wordSimplified: string,
  ) => {
    setSentences(prev => {
      if (prev.some(s => s.chinese === chinese)) return prev
      const id = 'mined_' + Math.random().toString(36).slice(2)
      const next: MinedSentence[] = [...prev, {
        id, chinese, pinyin, english, wordId, wordSimplified,
        addedAt: today(),
        interval: 1, easeFactor: 2.5, dueDate: today(), reps: 0,
      }]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setSentences(prev => {
      const next = prev.filter(s => s.id !== id)
      save(next)
      return next
    })
  }, [])

  const isMined = useCallback((chinese: string) => {
    return sentences.some(s => s.chinese === chinese)
  }, [sentences])

  const review = useCallback((id: string, quality: SRSQuality) => {
    setSentences(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...nextSRS(s, quality) } : s)
      save(next)
      return next
    })
  }, [])

  const due = sentences.filter(s => s.dueDate <= today())

  return { sentences, due, mine, remove, isMined, review }
}
