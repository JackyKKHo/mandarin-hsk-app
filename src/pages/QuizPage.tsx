import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import { usePracticeWords } from '../hooks/usePracticeWords'

type Mode = 'zh→en' | 'en→zh' | 'pinyin→zh'
type Stage = 'idle' | 'question' | 'feedback' | 'complete'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDistractors(correct: VocabItem, pool: VocabItem[]): VocabItem[] {
  const others = pool.filter(w => w.id !== correct.id)
  const samePOS = shuffle(others.filter(w => w.partOfSpeech === correct.partOfSpeech))
  const rest = shuffle(others.filter(w => w.partOfSpeech !== correct.partOfSpeech))
  return [...samePOS, ...rest].slice(0, 3)
}

function truncate(s: string, n = 55): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default function QuizPage() {
  const { level } = useParams<{ level: string }>()
  const { review } = useSRS()
  const { recordStudy } = useStreak()
  const { words: levelWords, title, backPath, loading } = usePracticeWords(level)

  const [stage, setStage] = useState<Stage>('idle')
  const [mode, setMode] = useState<Mode>('zh→en')
  const [quizLength, setQuizLength] = useState<10 | 25 | 50 | null>(25)
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<VocabItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })

  const stageRef = useRef(stage)
  const optionsRef = useRef(options)
  const answerRef = useRef<(id: string) => void>(() => {})
  const nextRef = useRef<() => void>(() => {})
  stageRef.current = stage
  optionsRef.current = options

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const s = stageRef.current
      if (s === 'feedback' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        nextRef.current()
      } else if (s === 'question') {
        const idx = parseInt(e.key) - 1
        const opts = optionsRef.current
        if (idx >= 0 && idx < opts.length) answerRef.current(opts[idx].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const buildOptions = useCallback((word: VocabItem, pool: VocabItem[]) => {
    const distractors = pickDistractors(word, pool)
    return shuffle([word, ...distractors])
  }, [])

  function start() {
    const q = shuffle(levelWords).slice(0, quizLength ?? undefined)
    setQueue(q)
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setSelected(null)
    setOptions(buildOptions(q[0], levelWords))
    setStage('question')
  }

  function answer(wordId: string) {
    if (selected) return
    setSelected(wordId)
    const correct = wordId === queue[index].id
    setScore(s => correct
      ? { ...s, correct: s.correct + 1 }
      : { ...s, wrong: s.wrong + 1 }
    )
    review(queue[index].id, correct ? 'good' : 'again')
    setStage('feedback')
  }
  answerRef.current = answer

  function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(nextIdx)
      setSelected(null)
      setOptions(buildOptions(queue[nextIdx], levelWords))
      setStage('question')
    }
  }
  nextRef.current = next

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Multiple Choice Quiz</h2>
          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : levelWords.length === 0 ? (
            <p className="empty-state">No vocabulary yet for this level.</p>
          ) : (
            <>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {([10, 25, 50, null] as const).map(n => (
                    <button
                      key={String(n)}
                      className={`quiz-length-btn${quizLength === n ? ' active' : ''}`}
                      onClick={() => setQuizLength(n)}
                      disabled={n !== null && n > levelWords.length}
                    >
                      {n === null ? `All ${levelWords.length}` : n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Direction</span>
                <div className="quiz-mode-picker">
                  {(['zh→en', 'en→zh', 'pinyin→zh'] as Mode[]).map(m => (
                    <button
                      key={m}
                      className={`quiz-mode-btn${mode === m ? ' active' : ''}`}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={start}>
                Start {quizLength ?? levelWords.length}-question quiz
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
          <h2>Quiz complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Play again</button>
            <Link to={backPath === '/favourites' ? '/practice/favourites' : `/practice/${level}`} className="btn-secondary">Flashcards</Link>
            <Link to={backPath} className="btn-secondary">Browse words</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = queue[index]
  const progressPct = (index / queue.length) * 100
  const isCorrect = selected === word.id

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={backPath} className="back-link" style={{ marginBottom: 0 }}>
          ← {title}
        </Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>
          {' '}
          <span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Prompt */}
      <div className="quiz-prompt">
        {mode === 'zh→en' && (
          <>
            <div className="quiz-prompt-chinese">{word.simplified}</div>
            <div className="quiz-prompt-sub">
              <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label="Play" />
            </div>
          </>
        )}
        {mode === 'en→zh' && (
          <div className="quiz-prompt-english">{word.english}</div>
        )}
        {mode === 'pinyin→zh' && (
          <TonedPinyin pinyin={word.pinyin} className="quiz-prompt-pinyin" />
        )}
      </div>

      {/* Options */}
      <div className="quiz-options">
        {options.map((opt, i) => {
          let cls = 'quiz-option'
          if (selected) {
            if (opt.id === word.id) cls += ' opt-correct'
            else if (opt.id === selected) cls += ' opt-wrong'
            else cls += ' opt-dim'
          }
          return (
            <button
              key={opt.id}
              className={cls}
              onClick={() => answer(opt.id)}
              disabled={!!selected}
            >
              <kbd className="quiz-key">{i + 1}</kbd>
              {mode === 'zh→en' && truncate(opt.english)}
              {mode === 'en→zh' && <span className="opt-chinese">{opt.simplified}</span>}
              {mode === 'pinyin→zh' && <span className="opt-chinese">{opt.simplified}</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {selected && (
        <div className={`quiz-feedback ${isCorrect ? 'qf-correct' : 'qf-wrong'}`}>
          <span>{isCorrect ? '✓ Correct!' : `✗ It was: ${word.simplified} — ${word.english}`}</span>
          {!isCorrect && <TonedPinyin pinyin={word.pinyin} className="qf-pinyin" />}
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next → '}
            <kbd>Space</kbd>
          </button>
        </div>
      )}
    </div>
  )
}
