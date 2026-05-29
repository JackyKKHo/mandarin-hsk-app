import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useProgress } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'
import { useStreak } from '../hooks/useStreak'
import { useSRS } from '../hooks/useSRS'
import { useVocab } from '../hooks/useVocab'
import { LEVEL_COUNTS } from '../data/vocabLoader'
import StudyHeatmap from '../components/StudyHeatmap'
import { useSEO } from '../hooks/useSEO'
import { useDailyGoal } from '../hooks/useDailyGoal'
import { MAX_FREEZES } from '../hooks/useStreak'
import { useMilestones } from '../hooks/useMilestones'
import MilestoneToast from '../components/MilestoneToast'
import { useEmailReminders } from '../hooks/useEmailReminders'
import { useMinedSentences } from '../hooks/useMinedSentences'
import type { VocabItem } from '../types'

function exportWords(type: 'learned' | 'favourites', vocab: VocabItem[], learned: Set<string>, favourites: Set<string>) {
  const words = vocab.filter(w => type === 'learned' ? learned.has(w.id) : favourites.has(w.id))
  const rows = [['Simplified', 'Traditional', 'Pinyin', 'English', 'HSK Level', 'Part of Speech']]
  for (const w of words) rows.push([w.simplified, w.traditional, w.pinyin, w.english, String(w.hskLevel), Array.isArray(w.partOfSpeech) ? w.partOfSpeech.join(', ') : (w.partOfSpeech ?? '')])
  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  download(`mandarin-daily-${type}.csv`, csv, 'text/csv')
}

function exportAnki(vocab: VocabItem[], learned: Set<string>) {
  const words = vocab.filter(w => learned.has(w.id))
  const lines = words.map(w => `${w.simplified} (${w.pinyin})\t${w.english} [HSK ${w.hskLevel}]`)
  download('mandarin-daily-anki.txt', lines.join('\n'), 'text/plain')
}

function download(filename: string, content: string, mime: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: mime }))
  a.download = filename
  a.click()
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const TOTAL = Object.values(LEVEL_COUNTS).reduce((a, b) => a + b, 0)

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function StatsPage() {
  useSEO({ title: 'My Progress', path: '/stats' })
  const { learned } = useProgress()
  const { favourites } = useFavourites()
  const { streak, lastDate, freezes } = useStreak()
  const { isDue, getCard } = useSRS()
  const { words: vocab } = useVocab()
  const { sentences: minedSentences, due: dueSentences } = useMinedSentences()
  const { goal, setGoal, todayCount, pct: goalPct, done: goalDone } = useDailyGoal()
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))

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
      const masteredCount = words.filter(w => {
        const c = getCard(w.id)
        return c && c.interval >= 21
      }).length
      const familiarCount = words.filter(w => {
        const c = getCard(w.id)
        return c && c.interval >= 7 && c.interval < 21
      }).length
      const learningCount = words.filter(w => {
        const c = getCard(w.id)
        return c && c.reps > 0 && c.interval < 7
      }).length
      return { level: l, total: LEVEL_COUNTS[l], learned: learnedCount, due: dueCount, reviewed: reviewedCount, mastered: masteredCount, familiar: familiarCount, learning: learningCount }
    }),
    [vocab, learned, isDue, getCard]
  )

  const totalDue = levelStats.reduce((s, l) => s + l.due, 0)
  const totalReviewed = levelStats.reduce((s, l) => s + l.reviewed, 0)
  const studiedToday = lastDate === today()

  const totalMastered = levelStats.reduce((s, l) => s + l.mastered, 0)
  const levelPcts = useMemo(
    () => levelStats.map(s => s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0),
    [levelStats]
  )
  const { pending: pendingMilestones, claim: claimMilestone } = useMilestones(totalMastered, streak, levelPcts)
  const { enabled: emailEnabled, loading: emailLoading, loaded: emailLoaded, toggle: toggleEmail } = useEmailReminders()

  const strugglingWords = useMemo(() =>
    vocab.filter(w => {
      const c = getCard(w.id)
      return c && c.reps >= 3 && c.easeFactor < 2.0
    }).sort((a, b) => {
      const ca = getCard(a.id)!; const cb = getCard(b.id)!
      return ca.easeFactor - cb.easeFactor
    }).slice(0, 12),
    [vocab, getCard]
  )

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="stats-page">
        <div className="stats-assessment-banner">
          <span>🎯 Not sure of your level?</span>
          <Link to="/assessment" className="stats-assessment-link">Take the assessment →</Link>
        </div>

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
            <button
              className="stats-share-btn"
              onClick={() => {
                const text = `🔥 ${streak}-day Mandarin streak on Mandarin Daily!\nI've learned ${totalLearned} words (${totalPct}% of HSK 1–9).\nhttps://www.mandarindaily.app`
                if (navigator.share) {
                  navigator.share({ text })
                } else {
                  navigator.clipboard.writeText(text)
                  alert('Copied to clipboard!')
                }
              }}
            >Share</button>
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
          <div className="stats-hero-card">
            <span className="stats-hero-num">📅</span>
            <span className="stats-hero-label">Daily Challenge</span>
            <Link to="/daily" className="stats-hero-sub stats-link">start today's →</Link>
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">✨</span>
            <span className="stats-hero-label">Smart Mix</span>
            <Link to="/practice/smart" className="stats-hero-sub stats-link">due + stretch words →</Link>
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">{minedSentences.length}</span>
            <span className="stats-hero-label">mined sentences</span>
            {dueSentences.length > 0
              ? <Link to="/sentences/review" className="stats-hero-sub stats-link">{dueSentences.length} due →</Link>
              : <Link to="/sentences/review" className="stats-hero-sub stats-link">review deck →</Link>
            }
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">🛡️{freezes}</span>
            <span className="stats-hero-label">freeze tokens</span>
            <span className="stats-hero-sub">earn 1 every 7-day streak (max {MAX_FREEZES})</span>
          </div>
          <div className="stats-hero-card">
            <span className="stats-hero-num">⭐</span>
            <span className="stats-hero-label">Mandarin Daily Pro</span>
            <Link to="/pro" className="stats-hero-sub stats-link">unlock more →</Link>
          </div>
        </div>

        {/* Email reminders */}
        {emailLoaded && (
          <div className="stats-goal-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div className="stats-goal-label">Daily email reminders</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {emailEnabled
                  ? "We'll email you at 8am when you have cards due or your streak needs saving."
                  : "Get an email at 8am when you have cards due or your streak needs saving."}
              </div>
            </div>
            <button
              className={emailEnabled ? 'btn-secondary' : 'btn-primary'}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={toggleEmail}
              disabled={emailLoading}
            >
              {emailLoading ? '...' : emailEnabled ? 'Turn off' : 'Turn on'}
            </button>
          </div>
        )}

        {/* Daily goal */}
        <div className="stats-goal-card">
          <div className="stats-goal-left">
            <div className="stats-goal-label">
              Today's goal
              {!editingGoal
                ? <button className="stats-goal-edit" onClick={() => { setEditingGoal(true); setGoalInput(String(goal)) }}>Edit</button>
                : <span style={{ display: 'inline-flex', gap: '0.4rem', marginLeft: '0.5rem' }}>
                    <input
                      className="stats-goal-input"
                      type="number"
                      value={goalInput}
                      min={1} max={200}
                      onChange={e => setGoalInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { setGoal(parseInt(goalInput) || goal); setEditingGoal(false) } if (e.key === 'Escape') setEditingGoal(false) }}
                      autoFocus
                    />
                    <button className="stats-goal-save" onClick={() => { setGoal(parseInt(goalInput) || goal); setEditingGoal(false) }}>Save</button>
                  </span>
              }
            </div>
            <div className="stats-goal-count">
              <span className={goalDone ? 'goal-done' : ''}>{todayCount}</span>
              <span className="stats-goal-sep"> / {goal} words</span>
              {goalDone && <span className="goal-badge">✓ Done!</span>}
            </div>
          </div>
          <div className="stats-goal-bar-wrap">
            <div className="stats-goal-bar" style={{ width: `${goalPct}%` }} />
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

        {/* Study heatmap */}
        <div className="stats-section">
          <h3 className="stats-section-title">Study Activity</h3>
          <StudyHeatmap />
        </div>

        {/* Struggling words */}
        {strugglingWords.length > 0 && (
          <div className="stats-section">
            <h3 className="stats-section-title">Struggling Words</h3>
            <p className="stats-section-desc">These words have a low ease score — you've missed them multiple times.</p>
            <div className="struggle-grid">
              {strugglingWords.map(w => (
                <Link key={w.id} to={`/word/${w.id}`} className="struggle-card">
                  <span className="struggle-chinese">{w.simplified}</span>
                  <span className="struggle-english">{w.english}</span>
                </Link>
              ))}
            </div>
            <Link to="/review" className="btn-primary" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.875rem' }}>
              Review all due cards →
            </Link>
          </div>
        )}

        {/* Export */}
        <div className="stats-section stats-export-row">
          <h3 className="stats-section-title">Export vocabulary</h3>
          <p className="stats-section-desc">Download your learned or favourited words for use in other apps.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => exportWords('learned', vocab, learned, favourites)}>
              ⬇ Learned words (CSV)
            </button>
            <button className="btn-secondary" onClick={() => exportWords('favourites', vocab, learned, favourites)}>
              ⬇ Favourites (CSV)
            </button>
            <button className="btn-secondary" onClick={() => exportAnki(vocab, learned)}>
              ⬇ Anki deck (.txt)
            </button>
          </div>
        </div>

        {/* HSK Readiness */}
        <div className="stats-section">
          <h3 className="stats-section-title">HSK Readiness</h3>
          <p className="stats-section-desc">How well you know each level — based on spaced repetition history.</p>
          <div className="readiness-legend">
            <span className="rl-item"><span className="rl-dot rl-mastered" />Mastered (21+ day interval)</span>
            <span className="rl-item"><span className="rl-dot rl-familiar" />Familiar (7–20 days)</span>
            <span className="rl-item"><span className="rl-dot rl-learning" />Learning</span>
          </div>
          <div className="stats-levels">
            {levelStats.map(s => {
              const masteredPct = s.total > 0 ? (s.mastered / s.total) * 100 : 0
              const familiarPct = s.total > 0 ? (s.familiar / s.total) * 100 : 0
              const learningPct = s.total > 0 ? (s.learning / s.total) * 100 : 0
              const readinessPct = Math.round(masteredPct)
              return (
                <div key={s.level} className="stats-level-row">
                  <div className="stats-level-head">
                    <Link to={`/hsk/${s.level}`} className="stats-level-name">HSK {s.level}</Link>
                    <span className="readiness-pct">{readinessPct}% ready</span>
                    <span className="stats-level-counts">
                      <span className="slc-learned">{s.mastered} mastered</span>
                      {s.due > 0 && <span className="slc-due">{s.due} due</span>}
                      <span className="slc-total">{s.total} total</span>
                    </span>
                    {s.due > 0 && (
                      <Link to={`/practice/${s.level}`} className="stats-practice-btn">Practice →</Link>
                    )}
                  </div>
                  <div className="stats-bar-track stats-bar-sm">
                    <div className="stats-bar-mastered" style={{ width: `${masteredPct}%` }} title={`${s.mastered} mastered`} />
                    <div className="stats-bar-familiar" style={{ width: `${familiarPct}%`, marginLeft: `${masteredPct}%` }} title={`${s.familiar} familiar`} />
                    <div className="stats-bar-learning" style={{ width: `${learningPct}%`, marginLeft: `${masteredPct + familiarPct}%` }} title={`${s.learning} learning`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* HSK Passport */}
        <div className="stats-section">
          <h3 className="stats-section-title">HSK Passport</h3>
          <p className="stats-section-desc">Earn a stamp by mastering 70% of each level.</p>
          <div className="passport-grid">
            {levelStats.map((s, i) => {
              const pct = levelPcts[i]
              const stamped = pct >= 70
              const partial = pct > 0 && pct < 70
              return (
                <Link key={s.level} to={`/hsk/${s.level}`} className={`passport-stamp${stamped ? ' stamped' : partial ? ' partial' : ''}`}>
                  <div className="passport-stamp-ring">
                    <div className="passport-stamp-inner">
                      <span className="passport-hsk">HSK</span>
                      <span className="passport-num">{s.level}</span>
                    </div>
                    {stamped && <span className="passport-tick">✓</span>}
                  </div>
                  <span className="passport-pct">{pct}%</span>
                </Link>
              )
            })}
          </div>
        </div>

      </div>

      {/* Milestone toasts */}
      {pendingMilestones[0] && (
        <MilestoneToast
          key={pendingMilestones[0].id}
          milestone={pendingMilestones[0]}
          onDismiss={() => claimMilestone(pendingMilestones[0].id)}
        />
      )}
    </div>
  )
}
