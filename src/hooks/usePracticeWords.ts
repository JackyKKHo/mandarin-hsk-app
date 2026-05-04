import { useMemo } from 'react'
import type { VocabItem } from '../types'
import { useSRS } from './useSRS'
import { useVocab } from './useVocab'

export function usePracticeWords(levelParam: string | undefined): {
  words: VocabItem[]
  title: string
  backPath: string
  loading: boolean
} {
  const { isDue } = useSRS()
  const isNumericLevel = levelParam !== 'favourites' && levelParam !== 'review'
  const numericLevel = isNumericLevel ? Number(levelParam) || 1 : undefined
  const { words: allWords, loading } = useVocab(numericLevel)

  return useMemo(() => {
    if (loading) return { words: [], title: '', backPath: '/', loading: true }

    if (levelParam === 'favourites') {
      try {
        const ids = JSON.parse(sessionStorage.getItem('practice-ids') ?? '[]') as string[]
        const set = new Set(ids)
        return {
          words: allWords.filter(w => set.has(w.id)),
          title: '★ Favourites',
          backPath: '/favourites',
          loading: false,
        }
      } catch {
        return { words: [], title: '★ Favourites', backPath: '/favourites', loading: false }
      }
    }
    if (levelParam === 'review') {
      return {
        words: allWords.filter(w => isDue(w.id)),
        title: 'Due for Review',
        backPath: '/stats',
        loading: false,
      }
    }
    const level = Number(levelParam) || 1
    return {
      words: allWords,
      title: `HSK ${level}`,
      backPath: `/hsk/${level}`,
      loading: false,
    }
  }, [levelParam, isDue, allWords, loading])
}
