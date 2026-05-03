import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import vocab from '../data/vocab'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useFavourites } from '../hooks/useFavourites'

const MAX_RESULTS = 80

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { isFavourite, toggleFavourite } = useFavourites()

  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 1) return []
    const ql = q.toLowerCase()
    return vocab.filter(w =>
      w.simplified.includes(q) ||
      w.traditional.includes(q) ||
      w.pinyin.toLowerCase().includes(ql) ||
      w.english.toLowerCase().includes(ql)
    ).slice(0, MAX_RESULTS)
  }, [query])

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
        {query.trim() && (
          <span className="result-count">
            {results.length}{results.length === MAX_RESULTS ? '+' : ''} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {query.trim() === '' && (
        <p className="search-hint">Search by Chinese characters, pinyin, or English meaning across all 9 HSK levels.</p>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <p className="empty-state">No results for "{query}"</p>
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
