import { useMemo } from 'react'
import vocab from '../data/vocab'
import type { VocabItem } from '../types'
import { useSRS } from './useSRS'

export function usePracticeWords(levelParam: string | undefined): {
  words: VocabItem[]
  title: string
  backPath: string
} {
  const { isDue } = useSRS()

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
    if (levelParam === 'review') {
      return {
        words: vocab.filter(w => isDue(w.id)),
        title: 'Due for Review',
        backPath: '/stats',
      }
    }
    const level = Number(levelParam) || 1
    return {
      words: vocab.filter(w => w.hskLevel === level),
      title: `HSK ${level}`,
      backPath: `/hsk/${level}`,
    }
  }, [levelParam, isDue])
}
