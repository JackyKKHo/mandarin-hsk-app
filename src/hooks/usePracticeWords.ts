import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { VocabItem } from '../types'
import { useSRS } from './useSRS'
import { useVocab } from './useVocab'
import { loadPlan } from '../lib/todayPlan'
import { TOP_LEVEL, levelLabel, toLevel } from '../data/levels'
import { filterByTopics, parseTopics, topicsTitle } from '../data/topics'

/**
 * Resolves a practice route to its word list. `levelParam` is a level number, `all`
 * (every level), or one of the special lists below. Any of them can be narrowed to topics
 * with `?topics=fruit,vegetables`, so every practice mode supports topic decks for free.
 */
export function usePracticeWords(levelParam: string | undefined): {
  words: VocabItem[]
  title: string
  backPath: string
  loading: boolean
} {
  const [params] = useSearchParams()
  const topicsParam = params.get('topics')
  const base = usePracticeWordsUnfiltered(levelParam)
  return useMemo(() => {
    const topics = parseTopics(topicsParam)
    if (topics.length === 0 || base.loading) return base
    const query = `?topics=${topics.join(',')}${levelParam === 'all' ? '&scope=all' : ''}`
    return {
      words: filterByTopics(base.words, topics),
      title: `${topicsTitle(topics)} · ${base.title}`,
      backPath: base.backPath.startsWith('/hsk/') ? `${base.backPath}${query}` : base.backPath,
      loading: false,
    }
  }, [base, topicsParam, levelParam])
}

function usePracticeWordsUnfiltered(levelParam: string | undefined): {
  words: VocabItem[]
  title: string
  backPath: string
  loading: boolean
} {
  const { isDue, getCard } = useSRS()
  const isNumericLevel = levelParam !== 'favourites' && levelParam !== 'review' && levelParam !== 'smart' && levelParam !== 'today' && levelParam !== 'all'
  const numericLevel = isNumericLevel ? toLevel(levelParam) : undefined
  const { words: allWords, loading } = useVocab(numericLevel)

  return useMemo(() => {
    if (loading) return { words: [], title: '', backPath: '/', loading: true }

    if (levelParam === 'favourites') {
      try {
        const ids = JSON.parse(sessionStorage.getItem('practice-ids') ?? '[]') as string[]
        const set = new Set(ids)
        return {
          words: allWords.filter(w => set.has(w.id)),
          title: 'Favourites',
          backPath: '/favourites',
          loading: false,
        }
      } catch {
        return { words: [], title: 'Favourites', backPath: '/favourites', loading: false }
      }
    }
    if (levelParam === 'today') {
      const ids = new Set(loadPlan()?.newIds ?? [])
      return {
        words: allWords.filter(w => ids.has(w.id)),
        title: "Today's new words",
        backPath: '/today',
        loading: false,
      }
    }
    if (levelParam === 'review') {
      return {
        words: allWords.filter(w => getCard(w.id) && isDue(w.id)),
        title: 'Due for Review',
        backPath: '/stats',
        loading: false,
      }
    }
    if (levelParam === 'smart') {
      // Smart Mix: due cards from every level + a sprinkle of new ones the user hasn't seen
      const due = allWords.filter(w => getCard(w.id) && isDue(w.id))
      const unseen = allWords.filter(w => !getCard(w.id))
      // Pick the unseen words from the lowest level the user hasn't fully started
      const stretch: typeof unseen = []
      const byLevel = new Map<number, typeof unseen>()
      for (const w of unseen) {
        const arr = byLevel.get(w.hskLevel) ?? []
        arr.push(w)
        byLevel.set(w.hskLevel, arr)
      }
      for (let lvl = 1; lvl <= TOP_LEVEL && stretch.length < 10; lvl++) {
        const lvlUnseen = byLevel.get(lvl) ?? []
        for (const w of lvlUnseen) {
          if (stretch.length >= 10) break
          stretch.push(w)
        }
      }
      return {
        words: [...due, ...stretch],
        title: 'Smart Mix',
        backPath: '/stats',
        loading: false,
      }
    }
    if (levelParam === 'all') {
      return { words: allWords, title: 'All levels', backPath: '/hsk/1', loading: false }
    }
    const level = toLevel(levelParam)
    return {
      words: allWords,
      title: `HSK ${levelLabel(level)}`,
      backPath: `/hsk/${level}`,
      loading: false,
    }
  }, [levelParam, isDue, getCard, allWords, loading])
}
