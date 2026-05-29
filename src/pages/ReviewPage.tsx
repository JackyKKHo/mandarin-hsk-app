import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TonedPinyin from '../components/TonedPinyin'
import { useVocab } from '../hooks/useVocab'
import AudioButton from '../components/AudioButton'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import type { SRSQuality } from '../hooks/useSRS'
import type { VocabItem } from '../types'

const NEW_CARD_LIMIT = 20
const NEW_CARDS_KEY = 'hsk-review-new-today'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getNewCardsIntroducedToday(): number {
  try {
    const raw = localStorage.getItem(NEW_CARDS_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return date === todayStr() ? count : 0
  } catch { return 0 }
}

function recordNewCardsToday(total: number) {
  localStorage.setItem(NEW_CARDS_KEY, JSON.stringify({ date: todayStr(), count: total }))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Stage = 'idle' | 'front' | 'back' | 'complete'

function scoreLabel(pct: number) {
  if (pct >= 90) return { text: 'Outstanding! 🌟', cls: 'score-good' }
  if (pct >= 70) return { text: 'Great work! 👍', cls: 'score-good' }
  if (pct >= 50) return { text: 'Keep going! 💪', cls: 'score-ok' }
  return { text: 'Keep practising!', cls: 'score-low' }
}

export default function ReviewPage() {
  const { isDue, review, getCard } = useSRS()
  const { recordStudy } = useStreak()
  const { words: allWords } = useVocab()

  const { dueCount: reviewDueCount, newCount: reviewNewCount } = useMemo(() => {
    const alreadyNew = getNewCardsIntroducedToday()
    const remaining = Math.max(0, NEW_CARD_LIMIT - alreadyNew)
    const dueCount = allWords.filter(w => getCard(w.id) && isDue(w.id)).length
    const newCount = Math.min(allWords.filter(w => !getCard(w.id)).length, remaining)
    return { dueCount, newCount }
  }, [allWords, isDue, getCard])

  const [stage, setStage] = useState<Stage>('idle')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Record<SRSQuality, number>>({ again: 0, good: 0, easy: 0 })
  const [sessionStreak, setSessionStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [streakFlash, setStreakFlash] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const initialLengthRef = useRef(0)
  const startedAtRef = useRef<number>(0)

  const stageRef = useRef(stage)
  const rateRef = useRef<(q: SRSQuality) => void>(() => {})
  stageRef.current = stage

  function rate(quality: SRSQuality) {
    const word = queue[index]
    review(word.id, quality)
    setResults(r => ({ ...r, [quality]: r[quality] + 1 }))

    if (quality === 'again') {
      setSessionStreak(0)
    } else {
      setSessionStreak(prev => {
        const next = prev + 1
        setBestStreak(b => Math.max(b, next))
        if (next > 0 && next % 5 === 0) {
          setStreakFlash(true)
          setTimeout(() => setStreakFlash(false), 800)
        }
        return next
      })
    }

    const newQueue = quality === 'again' ? [...queue, word] : queue
    const nextIndex = index + 1

    if (nextIndex >= newQueue.length) {
      recordStudy()
      setElapsedMs(Date.now() - startedAtRef.current)
      setQueue(newQueue)
      setStage('complete')
    } else {
      setQueue(newQueue)
      setIndex(nextIndex)
      setStage('front')
    }
  }
  rateRef.current = rate

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const s = stageRef.current
      if (s === 'front' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setStage('back')
      } else if (s === 'back') {
        if (e.key === '1') rateRef.current('again')
        else if (e.key === '2') rateRef.current('good')
        else if (e.key === '3') rateRef.current('easy')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function start() {
    const dueCards = allWords.filter(w => getCard(w.id) && isDue(w.id))
    const alreadyNew = getNewCardsIntroducedToday()
    const remaining = Math.max(0, NEW_CARD_LIMIT - alreadyNew)
    const newCards = allWords.filter(w => !getCard(w.id)).slice(0, remaining)
    recordNewCardsToday(alreadyNew + newCards.length)
    const q = shuffle([...dueCards, ...newCards])
    initialLengthRef.current = q.length
    startedAtRef.current = Date.now()
    setElapsedMs(0)
    setQueue(q)
    setIndex(0)
    setResults({ again: 0, good: 0, easy: 0 })
    setSessionStreak(0)
    setBestStreak(0)
    setStage(q.length > 0 ? 'front' : 'complete')
  }

  function formatDuration(ms: number) {
    const s = Math.round(ms / 1000)
    const m = Math.floor(s / 60)
    const r = s % 60
    return m > 0 ? `${m}m ${r}s` : `${r}s`
  }

  if (stage === 'idle') {
    const totalToday = reviewDueCount + reviewNewCount
    return (
      <div className="practice-page">
        <Link to="/stats" className="back-link">← Stats</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">SRS Review</div>
          <h2>Due for Review</h2>
          {totalToday === 0 ? (
            <>
              <p className="empty-state" style={{ marginBottom: '1rem' }}>All caught up! No cards due right now.</p>
              <p className="practice-start-desc">
                Keep studying flashcards to grow your review queue — cards you rate will be scheduled automatically.
              </p>
              <div className="complete-actions">
                <Link to="/hsk/1" className="btn-primary">Browse vocabulary</Link>
                <Link to="/stats" className="btn-secondary">Back to stats</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', margin: '0.5rem 0 1rem' }}>
                {reviewDueCount > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{reviewDueCount}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>due for review</div>
                  </div>
                )}
                {reviewNewCount > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent, #4f8ef7)' }}>{reviewNewCount}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>new today</div>
                  </div>
                )}
              </div>
              <p className="practice-start-desc">
                {reviewNewCount > 0 && `Up to ${NEW_CARD_LIMIT} new cards per day. `}
                Cards you mark "again" will loop back this session.
              </p>
              <button className="btn-primary" onClick={start}>Start review</button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const total = results.again + results.good + results.easy
    const pct = total > 0 ? Math.round(((results.good + results.easy) / total) * 100) : 0
    const { text: scoreText, cls: scoreCls } = scoreLabel(pct)
    const minutes = elapsedMs / 60000
    const cardsPerMin = minutes > 0 ? Math.round(total / minutes) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${scoreCls}`}>{pct}%</div>
          <h2>Review complete!</h2>
          <p className="complete-score-label">{scoreText}</p>

          <div className="review-complete-stats">
            <div className="rcs-item rcs-good">
              <span className="rcs-num">{results.good + results.easy}</span>
              <span className="rcs-label">remembered</span>
            </div>
            <div className="rcs-item rcs-again">
              <span className="rcs-num">{results.again}</span>
              <span className="rcs-label">again</span>
            </div>
            {bestStreak >= 3 && (
              <div className="rcs-item rcs-streak">
                <span className="rcs-num">🔥{bestStreak}</span>
                <span className="rcs-label">best streak</span>
              </div>
            )}
          </div>

          {elapsedMs > 0 && (
            <div className="review-pace">
              <span>⏱ {formatDuration(elapsedMs)}</span>
              <span>·</span>
              <span>{cardsPerMin} cards/min</span>
            </div>
          )}

          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Review again</button>
            <Link to="/stats" className="btn-secondary">Back to stats</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = queue[index]
  const card = getCard(word.id)
  const doneCount = results.good + results.easy
  const progressPct = initialLengthRef.current > 0 ? (doneCount / initialLengthRef.current) * 100 : 0

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to="/stats" className="back-link" style={{ marginBottom: 0 }}>← Stats</Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        {sessionStreak >= 3
          ? <span className={`session-streak-badge${streakFlash ? ' flash' : ''}`}>🔥 {sessionStreak} in a row</span>
          : card && <span className="practice-counter" style={{ opacity: 0.5 }}>interval {card.interval}d</span>
        }
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="review-card" onClick={stage === 'front' ? () => setStage('back') : undefined}>
        <div className="review-card-chinese">{word.simplified}</div>
        {stage === 'front' ? (
          <div className="review-card-hint">tap to reveal · <kbd>Space</kbd></div>
        ) : (
          <div className="review-card-back">
            <TonedPinyin pinyin={word.pinyin} className="review-card-pinyin" />
            <div className="review-card-english">{word.english}</div>
            {word.partOfSpeech && (
              <span className="pos-badge">{word.partOfSpeech}</span>
            )}
            {word.examples[0] && (
              <div className="review-card-example">
                <div className="review-example-zh">{word.examples[0].chinese}</div>
                <div className="review-example-en">{word.examples[0].english}</div>
              </div>
            )}
            <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label="Play" />
          </div>
        )}
      </div>

      {stage === 'back' && (
        <div className="review-ratings">
          <button className="rate-btn rate-again" onClick={() => rate('again')}>
            <span className="rate-label">Again</span>
            <span className="rate-sub">forgot · <kbd>1</kbd></span>
          </button>
          <button className="rate-btn rate-good" onClick={() => rate('good')}>
            <span className="rate-label">Good</span>
            <span className="rate-sub">remembered · <kbd>2</kbd></span>
          </button>
          <button className="rate-btn rate-easy" onClick={() => rate('easy')}>
            <span className="rate-label">Easy</span>
            <span className="rate-sub">too easy · <kbd>3</kbd></span>
          </button>
        </div>
      )}
    </div>
  )
}
