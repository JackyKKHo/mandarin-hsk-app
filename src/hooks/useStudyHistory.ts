import { useState, useCallback } from 'react'

const HISTORY_KEY = 'study-history'

export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addToHistory(date: string) {
  try {
    const arr = loadHistory()
    if (!arr.includes(date)) {
      arr.push(date)
      arr.sort()
      if (arr.length > 400) arr.splice(0, arr.length - 400)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr))
    }
  } catch {}
}

export function useStudyHistory() {
  const [history] = useState<Set<string>>(() => new Set(loadHistory()))
  const hasStudied = useCallback((date: string) => history.has(date), [history])
  return { history, hasStudied }
}
