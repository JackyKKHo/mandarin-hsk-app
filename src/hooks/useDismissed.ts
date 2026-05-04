import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'hsk-dismissed-words'

function loadLocal(): Set<string> {
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
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState<Set<string>>(loadLocal)

  useEffect(() => {
    if (!user) return
    supabase
      .from('dismissed')
      .select('word_id')
      .then(({ data }) => {
        if (!data) return
        const remote = new Set(data.map(r => r.word_id as string))
        const local = loadLocal()
        const merged = new Set([...remote, ...local])
        setDismissed(merged)
        persist(merged)
        const localOnly = [...local].filter(id => !remote.has(id))
        if (localOnly.length > 0) {
          supabase.from('dismissed').upsert(
            localOnly.map(word_id => ({ user_id: user.id, word_id }))
          )
        }
      })
  }, [user])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      persist(next)
      return next
    })
    if (user) supabase.from('dismissed').upsert({ user_id: user.id, word_id: id })
  }, [user])

  const undismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.delete(id)
      persist(next)
      return next
    })
    if (user) supabase.from('dismissed').delete().match({ user_id: user.id, word_id: id })
  }, [user])

  const clearLevel = useCallback((ids: string[]) => {
    setDismissed(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      persist(next)
      return next
    })
    if (user) {
      supabase.from('dismissed').delete().in('word_id', ids).match({ user_id: user.id })
    }
  }, [user])

  return { dismissed, dismiss, undismiss, clearLevel }
}
