import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMinedSentences } from '../hooks/useMinedSentences'
import TonedPinyin from '../components/TonedPinyin'

export default function SentenceReviewPage() {
  const { due, review, remove } = useMinedSentences()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const queue = due
  const card = queue[index]

  function grade(quality: 'again' | 'good' | 'easy') {
    review(card.id, quality)
    if (index + 1 >= queue.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  if (queue.length === 0 || done) {
    return (
      <div className="practice-page">
        <Link to="/stats" className="back-link">← Stats</Link>
        <div className="practice-complete-card">
          <div className="complete-score score-good" style={{ fontSize: '2.5rem' }}>✓</div>
          <h2>Sentences done!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {done ? `${queue.length} sentence${queue.length !== 1 ? 's' : ''} reviewed.` : 'No sentences due for review.'}
          </p>
          <Link to="/stats" className="btn-primary" style={{ display: 'inline-block' }}>Back to stats</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="practice-page">
      <div className="review-topbar">
        <Link to="/stats" className="back-link" style={{ marginBottom: 0 }}>← Stats</Link>
        <span className="review-progress">{index + 1} / {queue.length}</span>
      </div>

      <div className="sr-card" onClick={() => !flipped && setFlipped(true)}>
        <div className="sr-label">Read this sentence</div>
        <div className="sr-chinese">{card.chinese}</div>

        {!flipped ? (
          <div className="sr-flip-hint">Tap to reveal</div>
        ) : (
          <div className="sr-back">
            <TonedPinyin pinyin={card.pinyin} className="sr-pinyin" />
            <div className="sr-english">{card.english}</div>
            <Link to={`/word/${card.wordId}`} className="sr-word-link">
              {card.wordSimplified} → full details
            </Link>
          </div>
        )}
      </div>

      {flipped && (
        <div className="review-buttons">
          <button className="review-btn btn-again" onClick={() => grade('again')}>Again</button>
          <button className="review-btn btn-good"  onClick={() => grade('good')}>Good</button>
          <button className="review-btn btn-easy"  onClick={() => grade('easy')}>Easy</button>
        </div>
      )}

      <button
        className="sr-remove-btn"
        onClick={() => { remove(card.id); if (index >= queue.length - 1) setIndex(Math.max(0, index - 1)) }}
        title="Remove this sentence"
      >
        Remove sentence
      </button>
    </div>
  )
}
