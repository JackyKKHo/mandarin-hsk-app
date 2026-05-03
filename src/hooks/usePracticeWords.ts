import { useMemo } from 'react'
import vocab from '../data/vocab'
import type { VocabItem } from '../types'

export function usePracticeWords(levelParam: string | undefined): {
  words: VocabItem[]
  title: string
  backPath: string
} {
  return useMemo(() => {
    if (levelParam === 'favourites') {
      try {
        const ids = JSON.parse(sessionStorage.getItem('practice-ids') ?? '[]') as string[]
        const set = new Set(ids)
        return {
          words: vocab.filter(w => set.has(w.id)),
          title: '★ Favourites',
          backPath: '/favourites',
        }
      } catch {
        return { words: [], title: '★ Favourites', backPath: '/favourites' }
      }
    }
    const level = Number(levelParam) || 1
    return {
      words: vocab.filter(w => w.hskLevel === level),
      title: `HSK ${level}`,
      backPath: `/hsk/${level}`,
    }
  }, [levelParam])
}
