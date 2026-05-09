import { useState, useMemo, useEffect } from 'react'
import { useSEO } from '../hooks/useSEO'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useVocab } from '../hooks/useVocab'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useFavourites } from '../hooks/useFavourites'

const MAX_RESULTS = 80
const POS_OPTIONS = ['noun', 'verb', 'adj', 'adv', 'pron', 'conj', 'prep', 'mw', 'particle']

export default function SearchPage() {
  useSEO({ title: 'Search Mandarin Vocabulary', description: 'Search all 11,000+ HSK 1–9 Mandarin Chinese words by character, pinyin, or English meaning.', path: '/search' })
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [posFilter, setPosFilter] = useState<string | null>(null)
  const { isFavourite, toggleFavourite } = useFavourites()
  const { words: vocab } = useVocab()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(t)
  }, [query])

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    const raw = debouncedQuery.trim()
    return vocab.filter(w => {
      if (levelFilter && w.hskLevel !== levelFilter) return false
      if (posFilter && !(w.partOfSpeech?.toLowerCase().includes(posFilter))) return false
      if (!q) return !!(levelFilter || posFilter)
      return (
        w.simplified.includes(raw) ||
        w.traditional.includes(raw) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q)
      )
    }).slice(0, MAX_RESULTS)
  }, [debouncedQuery, vocab, levelFilter, posFilter])

  const hasFilters = levelFilter !== null || posFilter !== null
  const showResults = debouncedQuery.trim().length > 0 || hasFilters

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
        {showResults && (
          <span className="result-count">
            {results.length}{results.length === MAX_RESULTS ? '+' : ''} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="search-filters">
        <div className="search-filter-row">
          <span className="search-filter-label">Level</span>
          <div className="search-filter-chips">
            {[1,2,3,4,5,6,7,8,9].map(l => (
              <button
                key={l}
                className={`filter-chip${levelFilter === l ? ' active' : ''}`}
                onClick={() => setLevelFilter(levelFilter === l ? null : l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="search-filter-row">
          <span className="search-filter-label">Type</span>
          <div className="search-filter-chips">
            {POS_OPTIONS.map(pos => (
              <button
                key={pos}
                className={`filter-chip${posFilter === pos ? ' active' : ''}`}
                onClick={() => setPosFilter(posFilter === pos ? null : pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
        {hasFilters && (
          <button className="search-clear-filters" onClick={() => { setLevelFilter(null); setPosFilter(null) }}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {!showResults && (
        <p className="search-hint">Search by character, pinyin, or English — or filter by level and word type.</p>
      )}

      {showResults && results.length === 0 && (
        <p className="empty-state">No results{debouncedQuery ? ` for "${debouncedQuery}"` : ''}</p>
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
