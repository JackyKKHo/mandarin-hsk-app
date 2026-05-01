import { useState, useCallback } from 'react'

const STORAGE_KEY = 'hsk-dismissed-words'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function persist(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useDismissed() {
  const [dismissed, setDismissed] = useState<Set<string>>(load)

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      persist(next)
      return next
    })
  }, [])

  const undismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.delete(id)
      persist(next)
      return next
    })
  }, [])

  const clearLevel = useCallback((ids: string[]) => {
    setDismissed(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      persist(next)
      return next
    })
  }, [])

  return { dismissed, dismiss, undismiss, clearLevel }
}
