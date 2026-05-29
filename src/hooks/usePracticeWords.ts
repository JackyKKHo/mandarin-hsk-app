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
  const { isDue, getCard } = useSRS()
  const isNumericLevel = levelParam !== 'favourites' && levelParam !== 'review' && levelParam !== 'smart'
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
    if (levelParam === 'smart') {
      // Smart Mix: due cards from every level + a sprinkle of new ones the user hasn't seen
      const due = allWords.filter(w => isDue(w.id))
      const unseen = allWords.filter(w => !getCard(w.id))
      // Pick the unseen words from the lowest level the user hasn't fully started
      const stretch: typeof unseen = []
      const byLevel = new Map<number, typeof unseen>()
      for (const w of unseen) {
        const arr = byLevel.get(w.hskLevel) ?? []
        arr.push(w)
        byLevel.set(w.hskLevel, arr)
      }
      for (let lvl = 1; lvl <= 9 && stretch.length < 10; lvl++) {
        const lvlUnseen = byLevel.get(lvl) ?? []
        for (const w of lvlUnseen) {
          if (stretch.length >= 10) break
          stretch.push(w)
        }
      }
      return {
        words: [...due, ...stretch],
        title: '✨ Smart Mix',
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
  }, [levelParam, isDue, getCard, allWords, loading])
}
