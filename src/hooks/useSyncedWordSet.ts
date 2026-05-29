import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Options {
  table: 'favourites' | 'dismissed' | 'progress'
  localKey: string
}

function loadLocal(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function persist(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

/**
 * Hybrid localStorage + Supabase sync for a Set<word_id>. Used by useFavourites,
 * useDismissed, and useProgress to remove copy-pasted load/merge/sync code.
 */
export function useSyncedWordSet({ table, localKey }: Options) {
  const { user } = useAuth()
  const [ids, setIds] = useState<Set<string>>(() => loadLocal(localKey))

  useEffect(() => {
    if (!user) return
    supabase
      .from(table)
      .select('word_id')
      .then(({ data }) => {
        if (!data) return
        const remote = new Set(data.map(r => r.word_id as string))
        const local = loadLocal(localKey)
        const merged = new Set([...remote, ...local])
        setIds(merged)
        persist(localKey, merged)
        const localOnly = [...local].filter(id => !remote.has(id))
        if (localOnly.length > 0) {
          supabase.from(table).upsert(
            localOnly.map(word_id => ({ user_id: user.id, word_id }))
          )
        }
      })
  }, [user, table, localKey])

  const add = useCallback((id: string) => {
    let didAdd = false
    setIds(prev => {
      if (prev.has(id)) return prev
      didAdd = true
      const next = new Set(prev)
      next.add(id)
      persist(localKey, next)
      return next
    })
    if (didAdd && user) supabase.from(table).upsert({ user_id: user.id, word_id: id })
    return didAdd
  }, [user, table, localKey])

  const remove = useCallback((id: string) => {
    setIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      persist(localKey, next)
      return next
    })
    if (user) supabase.from(table).delete().match({ user_id: user.id, word_id: id })
  }, [user, table, localKey])

  const removeMany = useCallback((removeIds: string[]) => {
    setIds(prev => {
      const next = new Set(prev)
      removeIds.forEach(id => next.delete(id))
      persist(localKey, next)
      return next
    })
    if (user && removeIds.length > 0) {
      supabase.from(table).delete().in('word_id', removeIds).match({ user_id: user.id })
    }
  }, [user, table, localKey])

  const has = useCallback((id: string) => ids.has(id), [ids])

  return { ids, add, remove, removeMany, has }
}
