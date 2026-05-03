import { useState, useCallback } from 'react'

const KEY = 'hsk-learned'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function save(set: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}

export function useProgress() {
  const [learned, setLearned] = useState<Set<string>>(load)

  const markLearned = useCallback((id: string) => {
    setLearned(prev => {
      const next = new Set(prev)
      next.add(id)
      save(next)
      return next
    })
  }, [])

  const unmarkLearned = useCallback((id: string) => {
    setLearned(prev => {
      const next = new Set(prev)
      next.delete(id)
      save(next)
      return next
    })
  }, [])

  const isLearned = useCallback((id: string) => learned.has(id), [learned])

  return { learned, markLearned, unmarkLearned, isLearned }
}
