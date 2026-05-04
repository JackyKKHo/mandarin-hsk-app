import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import vocab from '../data/vocab'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import type { SRSQuality } from '../hooks/useSRS'

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

  const dueWords = useMemo(
    () => shuffle(vocab.filter(w => isDue(w.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [stage, setStage] = useState<Stage>('idle')
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Record<SRSQuality, number>>({ again: 0, good: 0, easy: 0 })

  function start() {
    setIndex(0)
    setResults({ again: 0, good: 0, easy: 0 })
    setStage(dueWords.length > 0 ? 'front' : 'complete')
  }

  function flip() {
    setStage('back')
  }

  function rate(quality: SRSQuality) {
    const word = dueWords[index]
    review(word.id, quality)
    setResults(r => ({ ...r, [quality]: r[quality] + 1 }))

    if (index + 1 >= dueWords.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(i => i + 1)
      setStage('front')
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to="/stats" className="back-link">← Stats</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">SRS Review</div>
          <h2>Due for Review</h2>
          {dueWords.length === 0 ? (
            <p className="empty-state">No cards due — come back later!</p>
          ) : (
            <>
              <p className="practice-start-desc">
                {dueWords.length} card{dueWords.length !== 1 ? 's' : ''} due today.
                Rate each one honestly — the algorithm adjusts your schedule automatically.
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
          <p className="practice-start-desc" style={{ marginTop: '0.5rem' }}>
            Cards marked "again" will show up again tomorrow.
          </p>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Review again</button>
            <Link to="/stats" className="btn-secondary">Back to stats</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = dueWords[index]
  const card = getCard(word.id)
  const progressPct = (index / dueWords.length) * 100

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to="/stats" className="back-link" style={{ marginBottom: 0 }}>← Stats</Link>
        <span className="practice-counter">{index + 1} / {dueWords.length}</span>
        {card && <span className="practice-counter" style={{ opacity: 0.5 }}>interval {card.interval}d</span>}
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Card front */}
      <div className="review-card" onClick={stage === 'front' ? flip : undefined}>
        <div className="review-card-chinese">{word.simplified}</div>
        {stage === 'front' ? (
          <div className="review-card-hint">tap to reveal</div>
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

      {/* Rating buttons */}
      {stage === 'back' && (
        <div className="review-ratings">
          <button className="rate-btn rate-again" onClick={() => rate('again')}>
            <span className="rate-label">Again</span>
            <span className="rate-sub">forgot</span>
          </button>
          <button className="rate-btn rate-good" onClick={() => rate('good')}>
            <span className="rate-label">Good</span>
            <span className="rate-sub">remembered</span>
          </button>
          <button className="rate-btn rate-easy" onClick={() => rate('easy')}>
            <span className="rate-label">Easy</span>
            <span className="rate-sub">too easy</span>
          </button>
        </div>
      )}
    </div>
  )
}
