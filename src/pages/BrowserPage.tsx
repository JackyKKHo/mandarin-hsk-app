import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AudioButton from '../components/AudioButton'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import { useProgress, DAILY_GOAL } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'
import { useVocab } from '../hooks/useVocab'
import { LEVEL_COUNTS } from '../data/vocabLoader'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const UNLOCK_THRESHOLD = 80

function getUnlockKey(level: number) { return `hsk-unlocked-${level}` }

export default function BrowserPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const currentLevel = Number(level) || 1
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'default' | 'unlearned' | 'az'>('default')
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [unlockBanner, setUnlockBanner] = useState<number | null>(null)
  const practiceRef = useRef<HTMLDivElement>(null)
  const { learned, todayCount } = useProgress()
  const { isFavourite, toggleFavourite } = useFavourites()
  const { words: levelWords, loading } = useVocab(currentLevel)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (practiceRef.current && !practiceRef.current.contains(e.target as Node)) {
        setPracticeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const levelLearnedCounts = useMemo(
    () => Object.fromEntries(LEVELS.map(l => [
      l,
      [...learned].filter(id => id.startsWith(`hsk${l}_`)).length,
    ])),
    [learned]
  )

  const currentLevelTotal = LEVEL_COUNTS[currentLevel] || 1
  const currentLevelLearned = levelLearnedCounts[currentLevel] || 0
  const progressPct = Math.round((currentLevelLearned / currentLevelTotal) * 100)

  // Show level unlock banner when first crossing 80%
  useEffect(() => {
    if (progressPct >= UNLOCK_THRESHOLD) {
      const key = getUnlockKey(currentLevel)
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1')
        setUnlockBanner(currentLevel)
      }
    }
  }, [progressPct, currentLevel])

  const goalMet = todayCount >= DAILY_GOAL
  const goalDots = Array.from({ length: DAILY_GOAL }, (_, i) => i < todayCount)

  const words = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = q
      ? levelWords.filter(
          w =>
            w.simplified.includes(search.trim()) ||
            w.pinyin.toLowerCase().includes(q) ||
            w.english.toLowerCase().includes(q)
        )
      : [...levelWords]
    if (sort === 'unlearned') result.sort((a, b) => (learned.has(a.id) ? 1 : 0) - (learned.has(b.id) ? 1 : 0))
    else if (sort === 'az') result.sort((a, b) => a.pinyin.localeCompare(b.pinyin))
    return result
  }, [levelWords, search, sort, learned])

  function switchLevel(l: number) {
    setSearch('')
    navigate(`/hsk/${l}`)
  }

  return (
    <div className="browser-page">
      <AppHeader />

      {/* Daily goal bar */}
      <div className={`daily-goal-bar${goalMet ? ' goal-met' : ''}`}>
        <span className="daily-goal-label">
          {goalMet ? '🎉 Daily goal complete!' : `Today: ${todayCount} / ${DAILY_GOAL} words`}
        </span>
        <div className="daily-goal-dots">
          {goalDots.map((filled, i) => (
            <span key={i} className={`goal-dot${filled ? ' filled' : ''}`} />
          ))}
        </div>
      </div>

      {/* Level unlock banner */}
      {unlockBanner && (
        <div className="unlock-banner">
          <span>🏆 {progressPct}% of HSK {unlockBanner} learned — milestone reached!</span>
          <button className="unlock-dismiss" onClick={() => setUnlockBanner(null)}>✕</button>
        </div>
      )}

      <nav className="level-tabs" aria-label="HSK levels">
        {LEVELS.map(l => (
          <button
            key={l}
            className={`level-tab${l === currentLevel ? ' active' : ''}`}
            onClick={() => switchLevel(l)}
            aria-current={l === currentLevel ? 'page' : undefined}
          >
            HSK {l}
            <span className="level-count">{LEVEL_COUNTS[l]}</span>
          </button>
        ))}
      </nav>

      {currentLevelLearned > 0 && (
        <div className="level-progress">
          <div className="level-progress-bar">
            <div className="level-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="level-progress-label">
            {progressPct >= 90 && currentLevelLearned < currentLevelTotal
              ? `Almost there! Only ${currentLevelTotal - currentLevelLearned} words left`
              : `${currentLevelLearned} / ${currentLevelTotal} learned (${progressPct}%)`}
          </span>
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
        <div className="sort-control">
          {(['default', 'unlearned', 'az'] as const).map(s => (
            <button
              key={s}
              className={`sort-btn${sort === s ? ' active' : ''}`}
              onClick={() => setSort(s)}
            >
              {s === 'default' ? 'Default' : s === 'unlearned' ? 'Unlearned first' : 'A–Z'}
            </button>
          ))}
        </div>
        <span className="result-count">
          {loading ? '…' : `${words.length} word${words.length !== 1 ? 's' : ''}`}
        </span>
        <div className="practice-menu-wrap" ref={practiceRef}>
          <button className="btn-practice practice-menu-trigger" onClick={() => setPracticeOpen(o => !o)}>
            Practice ▾
          </button>
          {practiceOpen && (
            <div className="practice-menu-dropdown">
              {[
                { to: `/practice/${currentLevel}`, label: '🃏 Flashcards', sub: 'Spaced repetition' },
                { to: `/quiz/${currentLevel}`,     label: '❓ Quiz',        sub: 'Multiple choice' },
                { to: `/listen/${currentLevel}`,   label: '🔊 Listening',   sub: 'Hear & identify' },
                { to: `/fill/${currentLevel}`,     label: '✏️ Fill blank',   sub: 'Complete sentences' },
                { to: `/write/${currentLevel}`,    label: '✍️ Writing',      sub: 'Stroke order tracing' },
                { to: `/tone/${currentLevel}`,     label: '🎵 Tone Trainer', sub: 'Identify tones' },
                { to: `/scramble/${currentLevel}`, label: '🔀 Scramble',    sub: 'Reorder sentences' },
              ].map(({ to, label, sub }) => (
                <Link key={to} to={to} className="practice-menu-item" onClick={() => setPracticeOpen(false)}>
                  <span className="pmi-label">{label}</span>
                  <span className="pmi-sub">{sub}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : words.length === 0 ? (
        <p className="empty-state">No results match your search.</p>
      ) : (
        <div className="vocab-grid">
          {words.map(word => (
            <Link key={word.id} to={`/word/${word.id}`} className={`vocab-card${learned.has(word.id) ? ' learned' : ''}`}>
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              {word.meanings && word.meanings.length > 0 ? (
                <div className="card-meanings">
                  {word.meanings.map((m, i) => (
                    <span key={i} className="card-meaning-item">
                      <span className="card-meaning-num">{i + 1}</span>
                      <span className="card-meaning-pos">{word.partOfSpeech}.</span>
                      {m.definition}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="card-english">
                  <span className="card-meaning-pos">{word.partOfSpeech}.</span> {word.english}
                </div>
              )}
              <div className="card-footer">
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
