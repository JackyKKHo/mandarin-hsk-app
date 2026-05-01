import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import vocab from '../data/vocab'
import type { VocabItem } from '../types'
import AudioButton from '../components/AudioButton'
import TonedPinyin from '../components/TonedPinyin'
import { useDismissed } from '../hooks/useDismissed'

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
  const { dismissed, dismiss, clearLevel } = useDismissed()

  const levelWords = useMemo(
    () => vocab.filter(w => w.hskLevel === currentLevel),
    [currentLevel]
  )

  const activeWords = useMemo(
    () => levelWords.filter(w => !dismissed.has(w.id)),
    [levelWords, dismissed]
  )

  const dismissedCount = levelWords.length - activeWords.length

  const [stage, setStage] = useState<Stage>('idle')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [got, setGot] = useState(0)
  const [missed, setMissed] = useState(0)

  function start() {
    setQueue(shuffle(activeWords))
    setIndex(0)
    setFlipped(false)
    setGot(0)
    setMissed(0)
    setStage('studying')
  }

  function answer(correct: boolean) {
    if (correct) setGot(g => g + 1)
    else setMissed(m => m + 1)
    advance()
  }

  function tooEasy() {
    dismiss(queue[index].id)
    setGot(g => g + 1)
    advance()
  }

  function advance() {
    if (index + 1 >= queue.length) {
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
          <h2>Flashcard Practice</h2>
          {levelWords.length === 0 ? (
            <p className="empty-state">No vocabulary yet for this level.</p>
          ) : activeWords.length === 0 ? (
            <>
              <p className="practice-start-desc">
                You've marked all {levelWords.length} words as too easy.
              </p>
              <button
                className="btn-secondary"
                onClick={() => clearLevel(levelWords.map(w => w.id))}
              >
                Reset — show all words
              </button>
            </>
          ) : (
            <>
              <p className="practice-start-desc">
                {activeWords.length} card{activeWords.length !== 1 ? 's' : ''}, shuffled. Tap each card to
                reveal pinyin and meaning, then mark whether you knew it.
              </p>
              {dismissedCount > 0 && (
                <p className="dismissed-info">
                  {dismissedCount} word{dismissedCount !== 1 ? 's' : ''} hidden (too easy)
                  {' · '}
                  <button
                    className="link-btn"
                    onClick={() => clearLevel(levelWords.map(w => w.id))}
                  >
                    Reset
                  </button>
                </p>
              )}
              <button className="btn-primary" onClick={start}>
                Start practice
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const total = got + missed
    const pct = total > 0 ? Math.round((got / total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Session complete</h2>
          <p className="complete-detail">
            <span className="got-count">{got} correct</span>
            {' · '}
            <span className="missed-count">{missed} to review</span>
            {' · '}
            {total} total
          </p>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Practice again</button>
            <Link to={`/hsk/${currentLevel}`} className="btn-secondary">Back to browser</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = queue[index]
  const progressPct = (index / queue.length) * 100

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={`/hsk/${currentLevel}`} className="back-link" style={{ marginBottom: 0 }}>
          ← HSK {currentLevel}
        </Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓ {got}</span>
          {' '}
          <span className="missed-count">✗ {missed}</span>
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
          <div className="answer-btns">
            <button className="btn-missed" onClick={() => answer(false)}>✗ Try again</button>
            <button className="btn-got" onClick={() => answer(true)}>✓ Got it</button>
          </div>
          <button className="btn-too-easy" onClick={tooEasy}>
            Don't show again — too easy
          </button>
        </div>
      ) : (
        <p className="flip-hint">tap the card to reveal</p>
      )}
    </div>
  )
}
