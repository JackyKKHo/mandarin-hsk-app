import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const KEY = 'hsk-learned'
const DAILY_KEY = 'hsk-daily'
export const DAILY_GOAL = 10

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLocal(set: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}

function loadDailyCount(): number {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    const d = raw ? JSON.parse(raw) : null
    return d?.date === today() ? (d.count as number) : 0
  } catch { return 0 }
}

function saveDailyCount(count: number) {
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today(), count }))
}

export function useProgress() {
  const { user } = useAuth()
  const [learned, setLearned] = useState<Set<string>>(loadLocal)
  const [todayCount, setTodayCount] = useState<number>(loadDailyCount)

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user) return
    supabase
      .from('progress')
      .select('word_id')
      .then(({ data }) => {
        if (!data) return
        const remote = new Set(data.map(r => r.word_id as string))
        // Merge with local data
        const local = loadLocal()
        const merged = new Set([...remote, ...local])
        setLearned(merged)
        saveLocal(merged)
        // Push any local-only entries to Supabase
        const localOnly = [...local].filter(id => !remote.has(id))
        if (localOnly.length > 0) {
          supabase.from('progress').upsert(
            localOnly.map(word_id => ({ user_id: user.id, word_id }))
          )
        }
      })
  }, [user])

  const markLearned = useCallback((id: string) => {
    const isNew = !learned.has(id)
    setLearned(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveLocal(next)
      return next
    })
    if (isNew) {
      setTodayCount(prev => {
        const next = prev + 1
        saveDailyCount(next)
        return next
      })
    }
    if (user) {
      supabase.from('progress').upsert({ user_id: user.id, word_id: id })
    }
  }, [user, learned])

  const unmarkLearned = useCallback((id: string) => {
    setLearned(prev => {
      const next = new Set(prev)
      next.delete(id)
      saveLocal(next)
      return next
    })
    if (user) {
      supabase.from('progress').delete().match({ user_id: user.id, word_id: id })
    }
  }, [user])

  const isLearned = useCallback((id: string) => learned.has(id), [learned])

  return { learned, markLearned, unmarkLearned, isLearned, todayCount }
}
