import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import vocab from '../data/vocab'
import AudioButton from '../components/AudioButton'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function BrowserPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const currentLevel = Number(level) || 1
  const [search, setSearch] = useState('')

  const levelCounts = useMemo(
    () => Object.fromEntries(LEVELS.map(l => [l, vocab.filter(w => w.hskLevel === l).length])),
    []
  )

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
          <Link to={`/practice/${currentLevel}`} className="btn-practice">
            Practice
          </Link>
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
            <Link key={word.id} to={`/word/${word.id}`} className="vocab-card">
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              <div className="card-english">{word.english}</div>
              <div className="card-footer">
                <span className="card-pos">{word.partOfSpeech}</span>
                <AudioButton
                  text={word.simplified}
                  audioUrl={word.audio.wordAudioUrl}
                  label={`Play ${word.simplified}`}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
