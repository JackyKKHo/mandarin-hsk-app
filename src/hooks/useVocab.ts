import { useState, useEffect } from 'react'
import type { VocabItem } from '../types'
import { loadLevel, loadAllLevels } from '../data/vocabLoader'

export function useVocab(level?: number) {
  const [words, setWords] = useState<VocabItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fn = level !== undefined ? loadLevel(level) : loadAllLevels()
    fn.then(w => {
      setWords(w)
      setLoading(false)
    })
  }, [level])

  return { words, loading }
}
