import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import grammarData from '../../data/grammar.json'
import type { GrammarPoint } from '../types'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'

const grammar = grammarData as GrammarPoint[]
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function GrammarListPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const currentLevel = Number(level) || 1
  const [search, setSearch] = useState('')

  const levelCounts = useMemo(
    () => Object.fromEntries(LEVELS.map(l => [l, grammar.filter(g => g.hskLevel === l).length])),
    []
  )

  const points = useMemo(() => {
    const levelPoints = grammar.filter(g => g.hskLevel === currentLevel)
    const q = search.trim().toLowerCase()
    if (!q) return levelPoints
    return levelPoints.filter(
      g =>
        g.title.toLowerCase().includes(q) ||
        g.pattern.toLowerCase().includes(q) ||
        g.explanation.toLowerCase().includes(q) ||
        g.tags.some(t => t.includes(q))
    )
  }, [currentLevel, search])

  function switchLevel(l: number) {
    setSearch('')
    navigate(`/grammar/${l}`)
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
          placeholder="Search grammar points…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search grammar"
        />
        <span className="result-count">
          {points.length} point{points.length !== 1 ? 's' : ''}
        </span>
      </div>

      {points.length === 0 ? (
        <p className="empty-state">
          {levelCounts[currentLevel] === 0
            ? `No grammar points yet for HSK ${currentLevel}.`
            : 'No results match your search.'}
        </p>
      ) : (
        <div className="grammar-list">
          {points.map(point => (
            <Link key={point.id} to={`/grammar/point/${point.id}`} className="grammar-card">
              <div className="grammar-card-title">{point.title}</div>
              <div className="grammar-card-pattern">{point.pattern}</div>
              {point.examples[0] && (
                <div className="grammar-card-example">
                  <span className="gc-ex-chinese">{point.examples[0].chinese}</span>
                  <TonedPinyin pinyin={point.examples[0].pinyin} className="gc-ex-pinyin" />
                  <span className="gc-ex-english">{point.examples[0].english}</span>
                </div>
              )}
              {point.tags.length > 0 && (
                <div className="grammar-card-tags">
                  {point.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
