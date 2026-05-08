import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import { usePracticeWords } from '../hooks/usePracticeWords'

type Stage = 'idle' | 'question' | 'feedback' | 'complete'
type AnswerMode = 'type' | 'pick'

interface Question {
  word: VocabItem
  sentence: string      // full sentence
  before: string        // text before the blank
  after: string         // text after the blank
  options: VocabItem[]  // for pick mode
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestion(word: VocabItem, pool: VocabItem[]): Question | null {
  const ex = word.examples[0]
  if (!ex?.chinese) return null

  const idx = ex.chinese.indexOf(word.simplified)
  if (idx === -1) return null

  const before = ex.chinese.slice(0, idx)
  const after = ex.chinese.slice(idx + word.simplified.length)
  const distractors = shuffle(pool.filter(w => w.id !== word.id)).slice(0, 3)
  const options = shuffle([word, ...distractors])

  return { word, sentence: ex.chinese, before, after, options }
}

export default function FillBlankPage() {
  const { level } = useParams<{ level: string }>()
  const { review } = useSRS()
  const { recordStudy } = useStreak()
  const { words: allLevelWords, title, backPath, loading } = usePracticeWords(level)
  const levelWords = useMemo(() => allLevelWords.filter(w => w.examples.length > 0), [allLevelWords])

  const [stage, setStage] = useState<Stage>('idle')
  const [sessionLength, setSessionLength] = useState<10 | 25 | 50 | 100>(10)
  const [mode, setMode] = useState<AnswerMode>('pick')
  const [queue, setQueue] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  function start() {
    const qs = shuffle(levelWords)
      .map(w => buildQuestion(w, levelWords))
      .filter((q): q is Question => q !== null)
      .slice(0, sessionLength)

    if (qs.length === 0) return
    setQueue(qs)
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setTyped('')
    setSelected(null)
    setShowHint(false)
    setStage('question')
  }

  useEffect(() => {
    if (stage === 'question' && mode === 'type') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [stage, index, mode])

  function submitTyped() {
    if (!typed.trim()) return
    const q = queue[index]
    const correct = typed.trim() === q.word.simplified
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    review(q.word.id, correct ? 'good' : 'again')
    setStage('feedback')
  }

  function pick(wordId: string) {
    if (selected) return
    setSelected(wordId)
    const q = queue[index]
    const correct = wordId === q.word.id
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    review(q.word.id, correct ? 'good' : 'again')
    setStage('feedback')
  }

  function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(nextIdx)
      setTyped('')
      setSelected(null)
      setShowHint(false)
      setStage('question')
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Fill in the Blank</h2>
          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : levelWords.length < 4 ? (
            <p className="empty-state">Not enough words with example sentences yet.</p>
          ) : (
            <>
              <p className="practice-start-desc">
                Complete the example sentence by filling in the missing word.
              </p>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {([10, 25, 50, 100] as const).map(n => (
                    <button
                      key={String(n)}
                      className={`quiz-length-btn${sessionLength === n ? ' active' : ''}`}
                      onClick={() => setSessionLength(n)}
                      disabled={n > levelWords.length}
                    >
                      {n === 100 ? (levelWords.length <= 100 ? `All ${levelWords.length}` : '100') : n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Answer type</span>
                <div className="quiz-mode-picker">
                  <button className={`quiz-mode-btn${mode === 'pick' ? ' active' : ''}`} onClick={() => setMode('pick')}>
                    Multiple choice
                  </button>
                  <button className={`quiz-mode-btn${mode === 'type' ? ' active' : ''}`} onClick={() => setMode('type')}>
                    Type answer
                  </button>
                </div>
              </div>
              <button className="btn-primary" onClick={start}>
                Start {Math.min(sessionLength, levelWords.length)} questions
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const total = score.correct + score.wrong
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Play again</button>
            <Link to={backPath} className="btn-secondary">Back</Link>
          </div>
        </div>
      </div>
    )
  }

  const q = queue[index]
  const ex = q.word.examples[0]
  const progressPct = (index / queue.length) * 100
  const isCorrect = stage === 'feedback' && (
    mode === 'pick' ? selected === q.word.id : typed.trim() === q.word.simplified
  )

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={backPath} className="back-link" style={{ marginBottom: 0 }}>← {title}</Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>{' '}
          <span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Sentence with blank */}
      <div className="fillblank-sentence-card">
        <div className="fbs-sentence">
          <span>{q.before}</span>
          <span className={`fbs-blank${stage === 'feedback' ? (isCorrect ? ' blank-correct' : ' blank-wrong') : ''}`}>
            {stage === 'feedback' ? q.word.simplified : '_'.repeat(q.word.simplified.length)}
          </span>
          <span>{q.after}</span>
        </div>
        {stage === 'feedback' && (
          <>
            <TonedPinyin pinyin={ex.pinyin} className="fbs-pinyin" />
            <div className="fbs-english">{ex.english}</div>
          </>
        )}
        <div className="fbs-audio-row">
          {stage === 'feedback' && (
            <AudioButton text={ex.chinese} audioUrl={q.word.audio.exampleAudioUrls[0] ?? null} label="Play sentence" />
          )}
          {stage === 'question' && !showHint && (
            <button className="fbs-hint-btn" onClick={() => setShowHint(true)}>
              💡 Hint
            </button>
          )}
          {showHint && (
            <span className="fbs-hint">
              <TonedPinyin pinyin={q.word.pinyin} className="" /> — {q.word.english}
            </span>
          )}
        </div>
      </div>

      {/* Answer area */}
      {stage === 'question' && mode === 'type' && (
        <div className="fillblank-type-area">
          <input
            ref={inputRef}
            className="fillblank-input"
            type="text"
            placeholder={`Type the missing word (${q.word.simplified.length} char${q.word.simplified.length > 1 ? 's' : ''})`}
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitTyped() }}
          />
          <button className="btn-primary" onClick={submitTyped} disabled={!typed.trim()}>
            Check
          </button>
        </div>
      )}

      {stage === 'question' && mode === 'pick' && (
        <div className="quiz-options">
          {q.options.map(opt => (
            <button key={opt.id} className="quiz-option" onClick={() => pick(opt.id)}>
              <span className="opt-chinese">{opt.simplified}</span>
              <span className="opt-english-sub">{opt.english.split(';')[0].split(',')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {stage === 'feedback' && (
        <div className={`quiz-feedback ${isCorrect ? 'qf-correct' : 'qf-wrong'}`}>
          <span>
            {isCorrect ? '✓ Correct!' : `✗ Answer: ${q.word.simplified} (${q.word.english})`}
          </span>
          {!isCorrect && mode === 'type' && (
            <span className="fbs-typed-was">You typed: {typed}</span>
          )}
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
