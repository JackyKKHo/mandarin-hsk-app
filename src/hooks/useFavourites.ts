import { useCallback } from 'react'
import { useSyncedWordSet } from './useSyncedWordSet'

export function useFavourites() {
  const { ids, add, remove, has } = useSyncedWordSet({
    table: 'favourites',
    localKey: 'hsk-favourites',
  })

  const toggleFavourite = useCallback((id: string) => {
    if (has(id)) remove(id)
    else add(id)
  }, [has, add, remove])

  return { favourites: ids, toggleFavourite, isFavourite: has }
}
