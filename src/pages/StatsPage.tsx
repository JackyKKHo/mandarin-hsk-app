import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useProgress } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'
import { useStreak } from '../hooks/useStreak'
import { useSRS } from '../hooks/useSRS'
import { useVocab } from '../hooks/useVocab'
import { LEVEL_COUNTS } from '../data/vocabLoader'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const TOTAL = Object.values(LEVEL_COUNTS).reduce((a, b) => a + b, 0)

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function StatsPage() {
  const { learned } = useProgress()
  const { favourites } = useFavourites()
  const { streak, lastDate } = useStreak()
  const { isDue, getCard } = useSRS()
  const { words: vocab } = useVocab()

  const totalLearned = learned.size
  const totalPct = Math.round((totalLearned / TOTAL) * 100)

  const levelStats = useMemo(() =>
    LEVELS.map(l => {
      const words = vocab.filter(w => w.hskLevel === l)
      const learnedCount = words.filter(w => learned.has(w.id)).length
      const dueCount = words.filter(w => isDue(w.id)).length
      const reviewedCount = words.filter(w => {
        const c = getCard(w.id)
        return c && c.reps > 0
      }).length
      return { level: l, total: LEVEL_COUNTS[l], learned: learnedCount, due: dueCount, reviewed: reviewedCount }
    }),
    [vocab, learned, isDue, getCard]
  )

  const totalDue = levelStats.reduce((s, l) => s + l.due, 0)
  const totalReviewed = levelStats.reduce((s, l) => s + l.reviewed, 0)
  const studiedToday = lastDate === today()

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="stats-page">
        <h2 className="stats-title">Your Progress</h2>

        {/* Top stats row */}
        <div className="stats-hero-row">
          <div className="stats-hero-card">
            <span className="stats-hero-num">{streak}</span>
            <span className="stats-hero-label">🔥 day streak</span>
            {studiedToday
              ? <span className="stats-hero-sub today-badge">studied today ✓</span>
              : <span className="stats-hero-sub">study today to keep it!</span>
            }
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">{totalLearned}</span>
            <span className="stats-hero-label">words learned</span>
            <span className="stats-hero-sub">{totalPct}% of {TOTAL} total</span>
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">{totalDue}</span>
            <span className="stats-hero-label">due for review</span>
            {totalDue > 0
              ? <Link to="/review" className="stats-hero-sub stats-link">start review →</Link>
              : <span className="stats-hero-sub">{totalReviewed} ever reviewed</span>
            }
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">{favourites.size}</span>
            <span className="stats-hero-label">★ favourites</span>
            <Link to="/favourites" className="stats-hero-sub stats-link">view all →</Link>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="stats-overall">
          <div className="stats-overall-label">
            <span>Overall vocabulary</span>
            <span>{totalLearned} / {TOTAL}</span>
          </div>
          <div className="stats-bar-track">
            <div className="stats-bar-fill" style={{ width: `${totalPct}%` }} />
          </div>
        </div>

        {/* Per-level breakdown */}
        <div className="stats-levels">
          {levelStats.map(s => {
            const learnedPct = s.total > 0 ? Math.round((s.learned / s.total) * 100) : 0
            const reviewedPct = s.total > 0 ? Math.round((s.reviewed / s.total) * 100) : 0
            return (
              <div key={s.level} className="stats-level-row">
                <div className="stats-level-head">
                  <Link to={`/hsk/${s.level}`} className="stats-level-name">HSK {s.level}</Link>
                  <span className="stats-level-counts">
                    <span className="slc-learned">{s.learned} learned</span>
                    {s.due > 0 && <span className="slc-due">{s.due} due</span>}
                    <span className="slc-total">{s.total} total</span>
                  </span>
                  {s.due > 0 && (
                    <Link to={`/practice/${s.level}`} className="stats-practice-btn">Practice →</Link>
                  )}
                </div>
                <div className="stats-level-bars">
                  <div className="stats-bar-track stats-bar-sm">
                    <div className="stats-bar-fill" style={{ width: `${learnedPct}%` }} title={`${learnedPct}% learned`} />
                    <div className="stats-bar-reviewed" style={{ width: `${reviewedPct}%` }} title={`${reviewedPct}% reviewed via SRS`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
