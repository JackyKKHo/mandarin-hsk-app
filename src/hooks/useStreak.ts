import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface StreakData {
  count: number
  lastDate: string  // YYYY-MM-DD
}

const KEY = 'hsk-streak'
const FREEZE_KEY = 'hsk-freeze'
export const MAX_FREEZES = 3

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
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

function loadFreezes(): number {
  try { return parseInt(localStorage.getItem(FREEZE_KEY) ?? '0', 10) || 0 } catch { return 0 }
}

function saveFreezes(n: number) {
  localStorage.setItem(FREEZE_KEY, String(Math.max(0, Math.min(MAX_FREEZES, n))))
}

// Run once at init: auto-use a freeze if we missed exactly 1 day
function initStreak(): { data: StreakData; freezes: number; freezeUsed: boolean } {
  const local = loadLocal()
  const f = loadFreezes()
  const t = today()
  const y = yesterday()

  if (local.count > 0 && local.lastDate !== t && local.lastDate !== y && f > 0) {
    if (local.lastDate === daysAgo(2)) {
      const next = { count: local.count, lastDate: y }
      localStorage.setItem(KEY, JSON.stringify(next))
      saveFreezes(f - 1)
      return { data: next, freezes: f - 1, freezeUsed: true }
    }
  }
  return { data: local, freezes: f, freezeUsed: false }
}

const _init = initStreak()

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>(_init.data)
  const [freezes, setFreezes] = useState<number>(_init.freezes)
  const [freezeUsed] = useState<boolean>(_init.freezeUsed)

  useEffect(() => {
    if (!user) return
    supabase
      .from('streaks')
      .select('count, last_date')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
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

      // Award a freeze token every 7 streak days (max 3)
      if (newCount % 7 === 0) {
        setFreezes(f => {
          const nf = Math.min(f + 1, MAX_FREEZES)
          saveFreezes(nf)
          return nf
        })
      }

      if (user) {
        supabase.from('streaks').upsert({ user_id: user.id, count: newCount, last_date: t })
      }
      return next
    })
  }, [user])

  return { streak: streak.count, lastDate: streak.lastDate, recordStudy, freezes, freezeUsed }
}
