import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const KEY = 'hsk-favourites'

function loadLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLocal(set: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...set]))
}

export function useFavourites() {
  const { user } = useAuth()
  const [favourites, setFavourites] = useState<Set<string>>(loadLocal)

  useEffect(() => {
    if (!user) return
    supabase
      .from('favourites')
      .select('word_id')
      .then(({ data }) => {
        if (!data) return
        const remote = new Set(data.map(r => r.word_id as string))
        const local = loadLocal()
        const merged = new Set([...remote, ...local])
        setFavourites(merged)
        saveLocal(merged)
        const localOnly = [...local].filter(id => !remote.has(id))
        if (localOnly.length > 0) {
          supabase.from('favourites').upsert(
            localOnly.map(word_id => ({ user_id: user.id, word_id }))
          )
        }
      })
  }, [user])

  const toggleFavourite = useCallback((id: string) => {
    setFavourites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (user) supabase.from('favourites').delete().match({ user_id: user.id, word_id: id })
      } else {
        next.add(id)
        if (user) supabase.from('favourites').upsert({ user_id: user.id, word_id: id })
      }
      saveLocal(next)
      return next
    })
  }, [user])

  const isFavourite = useCallback((id: string) => favourites.has(id), [favourites])

  return { favourites, toggleFavourite, isFavourite }
}
