import { useState, useCallback } from 'react'

const KEY = 'hsk-favourites'

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

export function useFavourites() {
  const [favourites, setFavourites] = useState<Set<string>>(load)

  const toggleFavourite = useCallback((id: string) => {
    setFavourites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      save(next)
      return next
    })
  }, [])

  const isFavourite = useCallback((id: string) => favourites.has(id), [favourites])

  return { favourites, toggleFavourite, isFavourite }
}
