import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useDailyGoal } from './useDailyGoal'

const KEY = 'hsk-srs'

export interface SRSCard {
  interval: number
  easeFactor: number
  dueDate: string
  reps: number
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

function loadLocal(): Record<string, SRSCard> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocal(data: Record<string, SRSCard>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function nextCard(card: SRSCard | undefined, quality: SRSQuality): SRSCard {
  const prev = card ?? { interval: 0, easeFactor: 2.5, dueDate: today(), reps: 0 }

  if (quality === 'again') {
    return { interval: 1, easeFactor: Math.max(1.3, prev.easeFactor - 0.2), dueDate: today(), reps: 0 }
  }

  const ef = quality === 'easy' ? Math.min(2.5, prev.easeFactor + 0.15) : prev.easeFactor
  let interval: number
  if (prev.reps === 0) interval = 1
  else if (prev.reps === 1) interval = quality === 'easy' ? 4 : 3
  else interval = Math.round(prev.interval * ef * (quality === 'easy' ? 1.3 : 1))

  return { interval, easeFactor: ef, dueDate: addDays(interval), reps: prev.reps + 1 }
}

export function useSRS() {
  const { user } = useAuth()
  const [data, setData] = useState<Record<string, SRSCard>>(loadLocal)
  const { addProgress } = useDailyGoal()

  useEffect(() => {
    if (!user) return
    supabase
      .from('srs_cards')
      .select('word_id, interval, ease_factor, due_date, reps')
      .then(({ data: rows }) => {
        if (!rows) return
        const remote: Record<string, SRSCard> = {}
        for (const r of rows) {
          remote[r.word_id] = {
            interval: r.interval,
            easeFactor: r.ease_factor,
            dueDate: r.due_date,
            reps: r.reps,
          }
        }
        const local = loadLocal()
        // Merge: remote wins on conflict (more up-to-date)
        const merged = { ...local, ...remote }
        setData(merged)
        saveLocal(merged)
        // Push local-only entries to Supabase
        const localOnly = Object.keys(local).filter(id => !remote[id])
        if (localOnly.length > 0) {
          supabase.from('srs_cards').upsert(
            localOnly.map(word_id => ({
              user_id: user.id,
              word_id,
              interval: local[word_id].interval,
              ease_factor: local[word_id].easeFactor,
              due_date: local[word_id].dueDate,
              reps: local[word_id].reps,
            }))
          )
        }
      })
  }, [user])

  const review = useCallback((id: string, quality: SRSQuality) => {
    if (quality !== 'again') addProgress(1)
    setData(prev => {
      const card = nextCard(prev[id], quality)
      const next = { ...prev, [id]: card }
      saveLocal(next)
      if (user) {
        supabase.from('srs_cards').upsert({
          user_id: user.id,
          word_id: id,
          interval: card.interval,
          ease_factor: card.easeFactor,
          due_date: card.dueDate,
          reps: card.reps,
        })
      }
      return next
    })
  }, [user])

  const isDue = useCallback(
    (id: string) => {
      const card = data[id]
      if (!card) return true
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
