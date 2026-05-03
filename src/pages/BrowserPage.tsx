import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import vocab from '../data/vocab'
import AudioButton from '../components/AudioButton'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import { useProgress } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function BrowserPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const currentLevel = Number(level) || 1
  const [search, setSearch] = useState('')
  const { learned } = useProgress()
  const { isFavourite, toggleFavourite } = useFavourites()

  const levelCounts = useMemo(
    () => Object.fromEntries(LEVELS.map(l => [l, vocab.filter(w => w.hskLevel === l).length])),
    []
  )

  const levelLearnedCounts = useMemo(
    () => Object.fromEntries(LEVELS.map(l => [l, vocab.filter(w => w.hskLevel === l && learned.has(w.id)).length])),
    [learned]
  )

  const currentLevelTotal = levelCounts[currentLevel] || 1
  const currentLevelLearned = levelLearnedCounts[currentLevel] || 0
  const progressPct = Math.round((currentLevelLearned / currentLevelTotal) * 100)

  const words = useMemo(() => {
    const levelWords = vocab.filter(w => w.hskLevel === currentLevel)
    const q = search.trim().toLowerCase()
    if (!q) return levelWords
    return levelWords.filter(
      w =>
        w.simplified.includes(search.trim()) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q)
    )
  }, [currentLevel, search])

  function switchLevel(l: number) {
    setSearch('')
    navigate(`/hsk/${l}`)
  }

  return (
    <div className="browser-page">
      <AppHeader />

      <nav className="level-tabs" aria-label="HSK levels">
        {LEVELS.map(l => (
          <button
            key={l}
            className={`level-tab${l === currentLevel ? ' active' : ''}${levelCounts[l] === 0 ? ' empty' : ''}`}
            onClick={() => switchLevel(l)}
            aria-current={l === currentLevel ? 'page' : undefined}
          >
            HSK {l}
            {levelCounts[l] > 0 && (
              <span className="level-count">{levelCounts[l]}</span>
            )}
          </button>
        ))}
      </nav>

      {currentLevelLearned > 0 && (
        <div className="level-progress">
          <div className="level-progress-bar">
            <div className="level-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="level-progress-label">{currentLevelLearned} / {currentLevelTotal} learned ({progressPct}%)</span>
        </div>
      )}

      <div className="browser-controls">
        <input
          className="search-input"
          type="search"
          placeholder="Search characters, pinyin, or English…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search vocabulary"
        />
        <span className="result-count">
          {words.length} word{words.length !== 1 ? 's' : ''}
        </span>
        {levelCounts[currentLevel] > 0 && (
          <>
            <Link to={`/practice/${currentLevel}`} className="btn-practice">Flashcards</Link>
            <Link to={`/quiz/${currentLevel}`} className="btn-practice btn-practice-quiz">Quiz</Link>
            <Link to={`/write/${currentLevel}`} className="btn-practice btn-practice-write">Write</Link>
            <Link to={`/listen/${currentLevel}`} className="btn-practice btn-practice-listen">Listen</Link>
          </>
        )}
      </div>

      {words.length === 0 ? (
        <p className="empty-state">
          {levelCounts[currentLevel] === 0
            ? `No vocabulary added yet for HSK ${currentLevel}.`
            : 'No results match your search.'}
        </p>
      ) : (
        <div className="vocab-grid">
          {words.map(word => (
            <Link key={word.id} to={`/word/${word.id}`} className={`vocab-card${learned.has(word.id) ? ' learned' : ''}`}>
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              <div className="card-english">{word.english}</div>
              <div className="card-footer">
                <span className="card-pos">{word.partOfSpeech}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    className={`action-btn fav-btn${isFavourite(word.id) ? ' active' : ''}`}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavourite(word.id) }}
                    title={isFavourite(word.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >{isFavourite(word.id) ? '★' : '☆'}</button>
                  <AudioButton
                    text={word.simplified}
                    audioUrl={word.audio.wordAudioUrl}
                    label={`Play ${word.simplified}`}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
