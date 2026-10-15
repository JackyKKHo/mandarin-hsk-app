import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import AudioButton from '../components/AudioButton'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import { useProgress, DAILY_GOAL } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'
import { useVocab } from '../hooks/useVocab'
import { LEVEL_COUNTS } from '../data/vocabLoader'
import { useSEO } from '../hooks/useSEO'
import WordOfTheDay from '../components/WordOfTheDay'
import { normalizePOS } from '../types'
import Icon from '../components/Icon'
import { LEVELS, levelLabel, toLevel } from '../data/levels'
import { TOPIC_GROUPS, countTopics, filterByTopics, parseTopics, topicLabel } from '../data/topics'

const UNLOCK_THRESHOLD = 80

function getUnlockKey(level: number) { return `hsk-unlocked-${level}` }

export default function BrowserPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const currentLevel = toLevel(level)

  // Old links to /hsk/8 and /hsk/9 now point at the combined HSK 7–9 band
  useEffect(() => {
    if (level !== String(currentLevel)) navigate(`/hsk/${currentLevel}${window.location.search}`, { replace: true })
  }, [level, currentLevel, navigate])

  // Topic filter lives in the URL (?topics=fruit,vegetables&scope=all) so it survives
  // navigation, can be shared, and practice links can pass it on
  const [params, setParams] = useSearchParams()
  const selectedTopics = useMemo(() => parseTopics(params.get('topics')), [params])
  const allLevels = selectedTopics.length > 0 && params.get('scope') === 'all'
  const [topicsOpen, setTopicsOpen] = useState(false)

  function setTopicParams(topics: string[], scopeAll: boolean) {
    const next = new URLSearchParams(params)
    if (topics.length) next.set('topics', topics.join(','))
    else next.delete('topics')
    if (topics.length && scopeAll) next.set('scope', 'all')
    else next.delete('scope')
    setParams(next, { replace: true })
  }
  function toggleTopic(id: string) {
    const next = selectedTopics.includes(id) ? selectedTopics.filter(t => t !== id) : [...selectedTopics, id]
    setTopicParams(next, allLevels)
  }
  useSEO({
    title: `HSK ${levelLabel(currentLevel)} Vocabulary — ${LEVEL_COUNTS[currentLevel] ?? ''} Words`,
    description: `Browse and study all HSK Level ${currentLevel} Mandarin Chinese vocabulary. ${LEVEL_COUNTS[currentLevel] ?? ''} words with pinyin, examples, audio and spaced repetition flashcards.`,
    path: `/hsk/${currentLevel}`,
  })
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'default' | 'unlearned' | 'az'>('default')
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [unlockBanner, setUnlockBanner] = useState<number | null>(null)
  const practiceRef = useRef<HTMLDivElement>(null)
  const { learned, todayCount } = useProgress()
  const { isFavourite, toggleFavourite } = useFavourites()
  const { words: levelWords, loading } = useVocab(allLevels ? undefined : currentLevel)
  const topicCounts = useMemo(() => countTopics(levelWords), [levelWords])
  // Hide the topic filter until the vocab files have been tagged (scripts/fill-tags.mjs)
  const hasTopics = topicCounts.size > 0 || selectedTopics.length > 0

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
    const pool = filterByTopics(levelWords, selectedTopics)
    let result = q
      ? pool.filter(
          w =>
            w.simplified.includes(search.trim()) ||
            w.pinyin.toLowerCase().includes(q) ||
            w.english.toLowerCase().includes(q)
        )
      : [...pool]
    if (sort === 'unlearned') result.sort((a, b) => (learned.has(a.id) ? 1 : 0) - (learned.has(b.id) ? 1 : 0))
    else if (sort === 'az') result.sort((a, b) => a.pinyin.localeCompare(b.pinyin))
    return result
  }, [levelWords, selectedTopics, search, sort, learned])

  function switchLevel(l: number) {
    setSearch('')
    // Keep the topic filter when switching level; switching level means "this level only"
    navigate(selectedTopics.length ? `/hsk/${l}?topics=${selectedTopics.join(',')}` : `/hsk/${l}`)
  }

  return (
    <div className="browser-page">
      <AppHeader />

      <WordOfTheDay />

      {/* Daily goal bar */}
      <div className={`daily-goal-bar${goalMet ? ' goal-met' : ''}`}>
        <span className="daily-goal-label">
          {goalMet ? 'Daily goal complete' : `Today: ${todayCount} / ${DAILY_GOAL} words`}
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
          <span>{progressPct}% of HSK {levelLabel(unlockBanner)} learned — milestone reached</span>
          <button className="unlock-dismiss" onClick={() => setUnlockBanner(null)} aria-label="Dismiss"><Icon name="x" size={16} /></button>
        </div>
      )}

      <nav className="level-tabs" aria-label="HSK levels">
        {LEVELS.map(l => (
          <button
            key={l}
            className={`level-tab${l === currentLevel && !allLevels ? ' active' : ''}`}
            onClick={() => switchLevel(l)}
            aria-current={l === currentLevel ? 'page' : undefined}
          >
            HSK {levelLabel(l)}
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

      {hasTopics && (
        <div className="topic-filter">
          <div className="topic-bar">
            <button
              className={`topic-toggle${selectedTopics.length ? ' active' : ''}`}
              onClick={() => setTopicsOpen(o => !o)}
              aria-expanded={topicsOpen}
              aria-controls="topic-panel"
            >
              Topics{selectedTopics.length ? ` · ${selectedTopics.length}` : ''} {topicsOpen ? '▴' : '▾'}
            </button>
            {selectedTopics.map(id => (
              <button key={id} className="topic-chip selected" onClick={() => toggleTopic(id)} aria-label={`Remove ${topicLabel(id)}`}>
                {topicLabel(id)} <Icon name="x" size={12} />
              </button>
            ))}
            {selectedTopics.length > 0 && (
              <>
                <div className="topic-scope" role="group" aria-label="Which levels">
                  <button className={`sort-btn${!allLevels ? ' active' : ''}`} onClick={() => setTopicParams(selectedTopics, false)}>
                    HSK {levelLabel(currentLevel)}
                  </button>
                  <button className={`sort-btn${allLevels ? ' active' : ''}`} onClick={() => setTopicParams(selectedTopics, true)}>
                    All levels
                  </button>
                </div>
                <button className="topic-clear" onClick={() => setTopicParams([], false)}>Clear</button>
              </>
            )}
          </div>
          {topicsOpen && (
            <div className="topic-panel" id="topic-panel">
              {TOPIC_GROUPS.map(group => {
                const topics = group.topics.filter(t => topicCounts.has(t.id) || selectedTopics.includes(t.id))
                if (!topics.length) return null
                return (
                  <div key={group.label} className="topic-group">
                    <div className="topic-group-label">{group.label}</div>
                    <div className="topic-chips">
                      {topics.map(t => {
                        const on = selectedTopics.includes(t.id)
                        return (
                          <button
                            key={t.id}
                            className={`topic-chip${on ? ' selected' : ''}`}
                            onClick={() => toggleTopic(t.id)}
                            aria-pressed={on}
                          >
                            {t.label} <span className="topic-chip-zh">{t.zh}</span>
                            <span className="topic-chip-count">{topicCounts.get(t.id) ?? 0}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {!allLevels && (
                <p className="topic-panel-note">Counts are for HSK {levelLabel(currentLevel)}. Pick a topic, then “All levels” to see every level.</p>
              )}
            </div>
          )}
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
              {selectedTopics.length > 0 && (
                <div className="practice-menu-note">Practising {words.length} {selectedTopics.map(topicLabel).join(' + ')} words</div>
              )}
              {[
                { mode: 'practice', label: '🃏 Flashcards', sub: 'Spaced repetition' },
                { mode: 'quiz',     label: 'Quiz',        sub: 'Multiple choice' },
                { mode: 'listen',   label: 'Listening',   sub: 'Hear & identify' },
                { mode: 'fill',     label: 'Fill blank',   sub: 'Complete sentences' },
                { mode: 'write',    label: 'Writing',      sub: 'Stroke order tracing' },
                { mode: 'tone',     label: 'Tone trainer', sub: 'Identify tones' },
                { mode: 'scramble', label: 'Scramble',    sub: 'Reorder sentences' },
              ]
                // Writing practice works per level and doesn't take a topic filter yet
                .filter(({ mode }) => !(selectedTopics.length && mode === 'write'))
                .map(({ mode, label, sub }) => ({
                  to: selectedTopics.length
                    ? `/${mode}/${allLevels ? 'all' : currentLevel}?topics=${selectedTopics.join(',')}`
                    : `/${mode}/${currentLevel}`,
                  label,
                  sub,
                }))
                .map(({ to, label, sub }) => (
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
        <p className="empty-state">
          {selectedTopics.length && !search.trim() && !allLevels
            ? <>No {selectedTopics.map(topicLabel).join(' or ')} words in HSK {levelLabel(currentLevel)}. <button className="topic-clear" onClick={() => setTopicParams(selectedTopics, true)}>Show all levels</button></>
            : 'No results match your search.'}
        </p>
      ) : (
        <div className="vocab-grid">
          {words.map(word => (
            <Link key={word.id} to={`/word/${word.id}`} className={`vocab-card${learned.has(word.id) ? ' learned' : ''}`}>
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              <div className="card-pos-row">
                {normalizePOS(word.partOfSpeech).map(p => (
                  <span key={p} className="card-meaning-pos">{p}</span>
                ))}
              </div>
              {word.meanings && word.meanings.length > 0 ? (
                <div className="card-meanings">
                  {word.meanings.map((m, i) => (
                    <span key={i} className="card-meaning-item">
                      <span className="card-meaning-num">{i + 1}</span>
                      {m.definition}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="card-english">{word.english}</div>
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
