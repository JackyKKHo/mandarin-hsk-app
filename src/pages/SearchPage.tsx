import { useState, useMemo, useEffect } from 'react'
import { useSEO } from '../hooks/useSEO'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useVocab } from '../hooks/useVocab'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useFavourites } from '../hooks/useFavourites'

const MAX_RESULTS = 80

export default function SearchPage() {
  useSEO({ title: 'Search Mandarin Vocabulary', description: 'Search all 11,000+ HSK 1–9 Mandarin Chinese words by character, pinyin, or English meaning.', path: '/search' })
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { isFavourite, toggleFavourite } = useFavourites()
  const { words: vocab } = useVocab()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const results = useMemo(() => {
    const q = debouncedQuery.trim()
    if (q.length < 1) return []
    const ql = q.toLowerCase()
    return vocab.filter(w =>
      w.simplified.includes(debouncedQuery.trim()) ||
      w.traditional.includes(debouncedQuery.trim()) ||
      w.pinyin.toLowerCase().includes(ql) ||
      w.english.toLowerCase().includes(ql)
    ).slice(0, MAX_RESULTS)
  }, [debouncedQuery, vocab])

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="search-page-hero">
        <input
          className="search-input search-input-lg"
          type="search"
          placeholder="Search all HSK words…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          aria-label="Search all vocabulary"
        />
        {debouncedQuery.trim() && (
          <span className="result-count">
            {results.length}{results.length === MAX_RESULTS ? '+' : ''} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {debouncedQuery.trim() === '' && (
        <p className="search-hint">Search by Chinese characters, pinyin, or English meaning across all 9 HSK levels.</p>
      )}

      {debouncedQuery.trim() !== '' && results.length === 0 && (
        <p className="empty-state">No results for "{debouncedQuery}"</p>
      )}

      {results.length > 0 && (
        <div className="vocab-grid">
          {results.map(word => (
            <Link key={word.id} to={`/word/${word.id}`} className="vocab-card">
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              <div className="card-english">{word.english}</div>
              <div className="card-footer">
                <span className="card-pos badge badge-level" style={{ fontSize: '0.72rem' }}>HSK {word.hskLevel}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    className={`action-btn fav-btn${isFavourite(word.id) ? ' active' : ''}`}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavourite(word.id) }}
                    title={isFavourite(word.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >{isFavourite(word.id) ? '★' : '☆'}</button>
                  <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label={`Play ${word.simplified}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
