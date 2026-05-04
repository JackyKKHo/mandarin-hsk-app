import { useState, useCallback } from 'react'

const KEY = 'hsk-course'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

export function useCourseProgress() {
  const [completed, setCompleted] = useState<Set<string>>(load)

  const completeLesson = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const uncompleteLesson = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.delete(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  return {
    completed,
    isComplete: (id: string) => completed.has(id),
    completeLesson,
    uncompleteLesson,
  }
}
