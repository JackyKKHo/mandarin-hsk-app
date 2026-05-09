import { useState, useCallback } from 'react'

const GOAL_KEY = 'hsk-daily-goal'
const PROGRESS_KEY = 'hsk-daily-progress'

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface DailyProgress {
  date: string
  count: number
}

function loadGoal(): number {
  try { return parseInt(localStorage.getItem(GOAL_KEY) ?? '10', 10) || 10 } catch { return 10 }
}

function loadProgress(): DailyProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    const p: DailyProgress = raw ? JSON.parse(raw) : { date: '', count: 0 }
    return p.date === today() ? p : { date: today(), count: 0 }
  } catch {
    return { date: today(), count: 0 }
  }
}

function saveProgress(p: DailyProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
}

export function useDailyGoal() {
  const [goal, setGoalState] = useState<number>(loadGoal)
  const [progress, setProgress] = useState<DailyProgress>(loadProgress)

  const setGoal = useCallback((n: number) => {
    const clamped = Math.max(1, Math.min(200, n))
    localStorage.setItem(GOAL_KEY, String(clamped))
    setGoalState(clamped)
  }, [])

  const addProgress = useCallback((n = 1) => {
    setProgress(prev => {
      const base = prev.date === today() ? prev : { date: today(), count: 0 }
      const next = { ...base, count: base.count + n }
      saveProgress(next)
      return next
    })
  }, [])

  const todayCount = progress.date === today() ? progress.count : 0
  const pct = Math.min(100, Math.round((todayCount / goal) * 100))
  const done = todayCount >= goal

  return { goal, setGoal, todayCount, pct, done, addProgress }
}
