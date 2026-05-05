import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TonedPinyin from '../components/TonedPinyin'
import { useVocab } from '../hooks/useVocab'
import AudioButton from '../components/AudioButton'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import type { SRSQuality } from '../hooks/useSRS'
import type { VocabItem } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Stage = 'idle' | 'front' | 'back' | 'complete'

export default function ReviewPage() {
  const { isDue, review, getCard } = useSRS()
  const { recordStudy } = useStreak()
  const { words: allWords } = useVocab()

  const initialDueCount = useMemo(
    () => allWords.filter(w => isDue(w.id)).length,
    [allWords, isDue]
  )

  const [stage, setStage] = useState<Stage>('idle')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Record<SRSQuality, number>>({ again: 0, good: 0, easy: 0 })

  const stageRef = useRef(stage)
  const rateRef = useRef<(q: SRSQuality) => void>(() => {})
  stageRef.current = stage

  function rate(quality: SRSQuality) {
    const word = queue[index]
    review(word.id, quality)
    setResults(r => ({ ...r, [quality]: r[quality] + 1 }))

    const newQueue = quality === 'again' ? [...queue, word] : queue
    const nextIndex = index + 1

    if (nextIndex >= newQueue.length) {
      recordStudy()
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
    const q = shuffle(allWords.filter(w => isDue(w.id)))
    setQueue(q)
    setIndex(0)
    setResults({ again: 0, good: 0, easy: 0 })
    setStage(q.length > 0 ? 'front' : 'complete')
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to="/stats" className="back-link">← Stats</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">SRS Review</div>
          <h2>Due for Review</h2>
          {initialDueCount === 0 ? (
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
              <p className="practice-start-desc">
                {initialDueCount} card{initialDueCount !== 1 ? 's' : ''} due today.
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
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Review complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {results.good + results.easy} remembered</span>
            <span className="missed-count">↺ {results.again} again</span>
          </div>
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
  const progressPct = (index / queue.length) * 100

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to="/stats" className="back-link" style={{ marginBottom: 0 }}>← Stats</Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        {card && <span className="practice-counter" style={{ opacity: 0.5 }}>interval {card.interval}d</span>}
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
