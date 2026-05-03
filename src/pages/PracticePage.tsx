import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import vocab from '../data/vocab'
import type { VocabItem } from '../types'
import AudioButton from '../components/AudioButton'
import TonedPinyin from '../components/TonedPinyin'
import { useSRS, type SRSQuality } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'

type Stage = 'idle' | 'studying' | 'complete'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PracticePage() {
  const { level } = useParams<{ level: string }>()
  const currentLevel = Number(level) || 1
  const { review, isDue, getCard } = useSRS()
  const { streak, recordStudy } = useStreak()

  const levelWords = useMemo(
    () => vocab.filter(w => w.hskLevel === currentLevel),
    [currentLevel]
  )

  const due = useMemo(
    () => levelWords.filter(w => isDue(w.id)),
    [levelWords, isDue]
  )

  const notDue = useMemo(
    () => levelWords.filter(w => !isDue(w.id)),
    [levelWords, isDue]
  )

  const [stage, setStage] = useState<Stage>('idle')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [counts, setCounts] = useState({ again: 0, good: 0, easy: 0 })

  function start(dueOnly: boolean) {
    const words = dueOnly ? shuffle(due) : [...shuffle(due), ...shuffle(notDue)]
    setQueue(words)
    setIndex(0)
    setFlipped(false)
    setCounts({ again: 0, good: 0, easy: 0 })
    setStage('studying')
  }

  function answer(quality: SRSQuality) {
    review(queue[index].id, quality)
    setCounts(c => ({ ...c, [quality]: c[quality] + 1 }))
    advance()
  }

  function advance() {
    if (index + 1 >= queue.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={`/hsk/${currentLevel}`} className="back-link">← HSK {currentLevel}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">HSK {currentLevel}</div>
          <h2>Spaced Repetition</h2>
          {levelWords.length === 0 ? (
            <p className="empty-state">No vocabulary yet for this level.</p>
          ) : (
            <>
              {streak > 0 && (
            <div className="streak-badge">🔥 {streak} day streak</div>
          )}
          <div className="srs-stats">
                <div className="srs-stat">
                  <span className="srs-stat-num due-num">{due.length}</span>
                  <span className="srs-stat-label">due today</span>
                </div>
                <div className="srs-stat">
                  <span className="srs-stat-num">{notDue.length}</span>
                  <span className="srs-stat-label">scheduled</span>
                </div>
                <div className="srs-stat">
                  <span className="srs-stat-num">{levelWords.length}</span>
                  <span className="srs-stat-label">total</span>
                </div>
              </div>

              <p className="practice-start-desc">
                Tap to reveal, then rate how well you knew it. Cards you know well appear less often; harder cards come back sooner.
              </p>

              <div className="start-btns">
                {due.length > 0 && (
                  <button className="btn-primary" onClick={() => start(true)}>
                    Study due ({due.length})
                  </button>
                )}
                <button
                  className={due.length > 0 ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => start(false)}
                >
                  Study all ({levelWords.length})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const total = counts.again + counts.good + counts.easy
    const correct = counts.good + counts.easy
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Session complete</h2>
          <div className="srs-result-row">
            <span className="srs-easy-count">⚡ {counts.easy} easy</span>
            <span className="got-count">✓ {counts.good} good</span>
            <span className="missed-count">↩ {counts.again} again</span>
          </div>
          {streak > 0 && <div className="streak-badge">🔥 {streak} day streak</div>}
          <p className="complete-subtext">Cards are scheduled for future review based on your ratings.</p>
          <div className="complete-actions">
            <button className="btn-primary" onClick={() => start(false)}>Practice again</button>
            <Link to={`/hsk/${currentLevel}`} className="btn-secondary">Back to browser</Link>
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
        <Link to={`/hsk/${currentLevel}`} className="back-link" style={{ marginBottom: 0 }}>
          ← HSK {currentLevel}
        </Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="srs-easy-count">⚡{counts.easy}</span>
          {' '}
          <span className="got-count">✓{counts.good}</span>
          {' '}
          <span className="missed-count">↩{counts.again}</span>
        </span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div
        className="flashcard-scene"
        onClick={() => { if (!flipped) setFlipped(true) }}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !flipped) setFlipped(true) }}
        aria-label={flipped ? 'Card revealed' : 'Tap to reveal answer'}
      >
        <div className={`flashcard${flipped ? ' flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            <div className="fc-chinese">{word.simplified}</div>
            {card && (
              <div className="fc-srs-badge">
                {card.reps === 0 ? 'new' : `${card.interval}d`}
              </div>
            )}
            <div className="fc-tap-hint">tap to reveal</div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div className="fc-back-header">
              <div className="fc-chinese-sm">{word.simplified}</div>
              <AudioButton
                text={word.simplified}
                audioUrl={word.audio.wordAudioUrl}
                label={`Play ${word.simplified}`}
              />
            </div>
            <TonedPinyin pinyin={word.pinyin} className="fc-pinyin" />
            <div className="fc-pos-badge">{word.partOfSpeech}</div>
            <div className="fc-english">{word.english}</div>

            {word.examples[0] && (
              <div className="fc-example">
                <div className="fc-ex-row">
                  <div className="fc-ex-chinese">{word.examples[0].chinese}</div>
                  <AudioButton
                    text={word.examples[0].chinese}
                    audioUrl={word.audio.exampleAudioUrls[0] ?? null}
                    label="Play example"
                  />
                </div>
                <div className="fc-ex-english">{word.examples[0].english}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="answer-area">
          <div className="srs-answer-btns">
            <button className="btn-again" onClick={() => answer('again')}>
              <span className="srs-btn-label">Again</span>
              <span className="srs-btn-sub">&lt;1d</span>
            </button>
            <button className="btn-good" onClick={() => answer('good')}>
              <span className="srs-btn-label">Good</span>
              <span className="srs-btn-sub">{card ? `${Math.round(card.interval * (card.easeFactor))}d` : '3d'}</span>
            </button>
            <button className="btn-easy" onClick={() => answer('easy')}>
              <span className="srs-btn-label">Easy</span>
              <span className="srs-btn-sub">{card ? `${Math.round(card.interval * card.easeFactor * 1.3)}d` : '4d'}</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="flip-hint">tap the card to reveal</p>
      )}
    </div>
  )
}
