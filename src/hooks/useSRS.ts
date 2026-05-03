import { useState, useCallback } from 'react'

const KEY = 'hsk-srs'

export interface SRSCard {
  interval: number    // days until next review
  easeFactor: number  // SM-2 ease factor (min 1.3)
  dueDate: string     // ISO date YYYY-MM-DD
  reps: number        // successful review streak
}

export type SRSQuality = 'again' | 'good' | 'easy'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function load(): Record<string, SRSCard> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(data: Record<string, SRSCard>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function nextCard(card: SRSCard | undefined, quality: SRSQuality): SRSCard {
  const prev = card ?? { interval: 0, easeFactor: 2.5, dueDate: today(), reps: 0 }

  if (quality === 'again') {
    return {
      interval: 1,
      easeFactor: Math.max(1.3, prev.easeFactor - 0.2),
      dueDate: today(),
      reps: 0,
    }
  }

  const ef = quality === 'easy'
    ? Math.min(2.5, prev.easeFactor + 0.15)
    : prev.easeFactor

  let interval: number
  if (prev.reps === 0) interval = 1
  else if (prev.reps === 1) interval = quality === 'easy' ? 4 : 3
  else interval = Math.round(prev.interval * ef * (quality === 'easy' ? 1.3 : 1))

  return {
    interval,
    easeFactor: ef,
    dueDate: addDays(interval),
    reps: prev.reps + 1,
  }
}

export function useSRS() {
  const [data, setData] = useState<Record<string, SRSCard>>(load)

  const review = useCallback((id: string, quality: SRSQuality) => {
    setData(prev => {
      const next = { ...prev, [id]: nextCard(prev[id], quality) }
      save(next)
      return next
    })
  }, [])

  const isDue = useCallback(
    (id: string) => {
      const card = data[id]
      if (!card) return true // never seen = due
      return card.dueDate <= today()
    },
    [data]
  )

  const getCard = useCallback((id: string) => data[id], [data])

  const dueCount = useCallback(
    (ids: string[]) => ids.filter(id => isDue(id)).length,
    [isDue]
  )

  return { review, isDue, getCard, dueCount }
}
