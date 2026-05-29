import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { addToHistory } from './useStudyHistory'

interface StreakData {
  count: number
  lastDate: string  // YYYY-MM-DD
}

const KEY = 'hsk-streak'
const FREEZE_KEY = 'hsk-freeze'
const RECOVERY_SHOWN_KEY = 'hsk-recovery-shown'
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

export type RecoveryState =
  | { kind: 'recoverable'; streak: number; freezesAvailable: number }
  | { kind: 'lost'; streak: number }
  | null

function computeRecovery(data: StreakData, freezes: number): RecoveryState {
  if (data.count === 0) return null
  const t = today()
  const y = yesterday()
  if (data.lastDate === t || data.lastDate === y) return null
  // Streak broken: studied 2+ days ago. Offer freeze if we missed exactly 1 day
  if (data.lastDate === daysAgo(2) && freezes > 0) {
    return { kind: 'recoverable', streak: data.count, freezesAvailable: freezes }
  }
  return { kind: 'lost', streak: data.count }
}

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>(() => loadLocal())
  const [freezes, setFreezes] = useState<number>(() => loadFreezes())
  const [recovery, setRecovery] = useState<RecoveryState>(() => {
    const shownToday = localStorage.getItem(RECOVERY_SHOWN_KEY) === today()
    if (shownToday) return null
    return computeRecovery(loadLocal(), loadFreezes())
  })

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
      addToHistory(t)

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

  const useFreeze = useCallback(() => {
    if (freezes <= 0) return false
    const y = yesterday()
    setStreak(prev => {
      const next = { count: prev.count, lastDate: y }
      localStorage.setItem(KEY, JSON.stringify(next))
      if (user) {
        supabase.from('streaks').upsert({ user_id: user.id, count: prev.count, last_date: y })
      }
      return next
    })
    setFreezes(f => {
      const nf = Math.max(0, f - 1)
      saveFreezes(nf)
      return nf
    })
    setRecovery(null)
    localStorage.setItem(RECOVERY_SHOWN_KEY, today())
    return true
  }, [freezes, user])

  const dismissRecovery = useCallback(() => {
    setRecovery(null)
    localStorage.setItem(RECOVERY_SHOWN_KEY, today())
  }, [])

  return {
    streak: streak.count,
    lastDate: streak.lastDate,
    recordStudy,
    freezes,
    recovery,
    useFreeze,
    dismissRecovery,
    freezeUsed: false,
  }
}
