import { useState, useCallback } from 'react'

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

function load(): StreakData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { count: 0, lastDate: '' }
  } catch {
    return { count: 0, lastDate: '' }
  }
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(load)

  const recordStudy = useCallback(() => {
    setStreak(prev => {
      const t = today()
      if (prev.lastDate === t) return prev  // already recorded today

      const newCount = prev.lastDate === yesterday() ? prev.count + 1 : 1
      const next = { count: newCount, lastDate: t }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { streak: streak.count, lastDate: streak.lastDate, recordStudy }
}
