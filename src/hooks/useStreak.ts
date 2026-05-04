import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface StreakData {
  count: number
  lastDate: string  // YYYY-MM-DD
}

const KEY = 'hsk-streak'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function loadLocal(): StreakData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { count: 0, lastDate: '' }
  } catch {
    return { count: 0, lastDate: '' }
  }
}

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>(loadLocal)

  useEffect(() => {
    if (!user) return
    supabase
      .from('streaks')
      .select('count, last_date')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          // Push local streak to Supabase if it exists
          const local = loadLocal()
          if (local.count > 0) {
            supabase.from('streaks').upsert({
              user_id: user.id,
              count: local.count,
              last_date: local.lastDate || null,
            })
          }
          return
        }
        const remote: StreakData = { count: data.count, lastDate: data.last_date ?? '' }
        const local = loadLocal()
        // Use whichever streak is higher
        const best = remote.count >= local.count ? remote : local
        setStreak(best)
        localStorage.setItem(KEY, JSON.stringify(best))
      })
  }, [user])

  const recordStudy = useCallback(() => {
    setStreak(prev => {
      const t = today()
      if (prev.lastDate === t) return prev

      const newCount = prev.lastDate === yesterday() ? prev.count + 1 : 1
      const next = { count: newCount, lastDate: t }
      localStorage.setItem(KEY, JSON.stringify(next))
      if (user) {
        supabase.from('streaks').upsert({ user_id: user.id, count: newCount, last_date: t })
      }
      return next
    })
  }, [user])

  return { streak: streak.count, lastDate: streak.lastDate, recordStudy }
}
