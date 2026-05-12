import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useVocab } from '../hooks/useVocab'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import type { VocabItem } from '../types'

interface WordResult { word: VocabItem; correct: boolean }

const CHALLENGE_SIZE = 10

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dateKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function dateSeed(dateStr: string): number {
  let h = 0
  for (const c of dateStr) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h
}

function pickDistractors(correct: VocabItem, pool: VocabItem[]): VocabItem[] {
  const same = pool.filter(w => w.id !== correct.id && w.partOfSpeech === correct.partOfSpeech)
  const rest = pool.filter(w => w.id !== correct.id && w.partOfSpeech !== correct.partOfSpeech)
  const combined = [...same, ...rest]
  // deterministic shuffle for distractors using word id hash
  let h = 0
  for (const c of correct.id) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return seededShuffle(combined, h).slice(0, 3)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Stage = 'loading' | 'already-done' | 'idle' | 'question' | 'feedback' | 'complete'

interface DailyResult { date: string; score: number; total: number }

export default function DailyChallengePage() {
  const { words: allWords } = useVocab()
  const { review } = useSRS()
  const { recordStudy } = useStreak()

  const today = dateKey()
  const stored: DailyResult | null = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('daily-challenge') ?? 'null') } catch { return null }
  }, [])
  const alreadyDone = stored?.date === today

  const dailyWords = useMemo(() => {
    if (allWords.length === 0) return []
    return seededShuffle(allWords, dateSeed(today)).slice(0, CHALLENGE_SIZE)
  }, [allWords, today])

  const [stage, setStage] = useState<Stage>(allWords.length === 0 ? 'loading' : alreadyDone ? 'already-done' : 'idle')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<VocabItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [wordResults, setWordResults] = useState<WordResult[]>([])

  const stageRef = useRef(stage)
  const optionsRef = useRef(options)
  const answerRef = useRef<(id: string) => void>(() => {})
  const nextRef = useRef<() => void>(() => {})
  stageRef.current = stage
  optionsRef.current = options

  useEffect(() => {
    if (allWords.length > 0 && stage === 'loading') {
      setStage(alreadyDone ? 'already-done' : 'idle')
    }
  }, [allWords.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      const s = stageRef.current
      if (s === 'feedback' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); nextRef.current() }
      else if (s === 'question') {
        const idx = parseInt(e.key) - 1
        const opts = optionsRef.current
        if (idx >= 0 && idx < opts.length) answerRef.current(opts[idx].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function buildOptions(word: VocabItem, pool: VocabItem[]): VocabItem[] {
    return shuffle([word, ...pickDistractors(word, pool)])
  }

  function start() {
    const q = [...dailyWords]
    setQueue(q); setIndex(0); setScore({ correct: 0, wrong: 0 }); setSelected(null); setWordResults([])
    setOptions(buildOptions(q[0], allWords)); setStage('question')
  }

  function answer(wordId: string) {
    if (selected) return
    setSelected(wordId)
    const correct = wordId === queue[index].id
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    setWordResults(r => [...r, { word: queue[index], correct }])
    review(queue[index].id, correct ? 'good' : 'again')
    setStage('feedback')
  }
  answerRef.current = answer

  function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) {
      recordStudy()
      const result: DailyResult = { date: today, score: score.correct + (selected === queue[index].id ? 1 : 0), total: queue.length }
      localStorage.setItem('daily-challenge', JSON.stringify(result))
      setStage('complete')
    } else {
      setIndex(nextIdx); setSelected(null)
      setOptions(buildOptions(queue[nextIdx], allWords)); setStage('question')
    }
  }
  nextRef.current = next

  // Time until midnight
  const now = new Date()
  const midnight = new Date(now); midnight.setHours(24, 0, 0, 0)
  const hoursLeft = Math.ceil((midnight.getTime() - now.getTime()) / 3600000)

  if (stage === 'loading') {
    return (
      <div className="practice-page">
        <div className="practice-start-card">
          <p className="empty-state">Loading…</p>
        </div>
      </div>
    )
  }

  if (stage === 'already-done') {
    const pct = stored ? Math.round((stored.score / stored.total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className="daily-badge">📅 Daily Challenge</div>
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>{pct}%</div>
          <h2>Already completed today!</h2>
          <p className="practice-start-desc">
            You scored {stored?.score}/{stored?.total}. Come back in {hoursLeft}h for tomorrow's challenge.
          </p>
          <div className="complete-actions">
            <Link to="/hsk/1" className="btn-secondary">Browse vocabulary</Link>
            <Link to="/review" className="btn-secondary">SRS Review</Link>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <div className="practice-start-card">
          <div className="daily-badge">📅 Daily Challenge</div>
          <h2>Today's Challenge</h2>
          {dailyWords.length === 0 ? (
            <p className="empty-state">Loading vocabulary…</p>
          ) : (
            <>
              <p className="practice-start-desc">
                {CHALLENGE_SIZE} words from across all HSK levels, refreshing every day.
                Same words for everyone today.
              </p>
              <div className="daily-preview">
                {dailyWords.map(w => (
                  <span key={w.id} className="daily-preview-tag">HSK {w.hskLevel}</span>
                ))}
              </div>
              <button className="btn-primary" onClick={start}>Start challenge</button>
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
      <div className="practice-page" style={{ paddingBottom: '2rem' }}>
        <div className="practice-complete-card">
          <div className="daily-badge">📅 Daily Challenge</div>
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>{pct}%</div>
          <h2>Challenge complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <p className="complete-subtext">Next challenge in {hoursLeft}h</p>
          <div className="complete-actions">
            <Link to="/review" className="btn-primary">SRS Review</Link>
            <Link to="/hsk/1" className="btn-secondary">Browse vocabulary</Link>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 520, margin: '1.5rem auto 0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', opacity: 0.7 }}>Today's words</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wordResults.map(({ word: w, correct }) => (
              <div key={w.id} style={{
                background: 'var(--card-bg)',
                border: `1.5px solid ${correct ? 'var(--success, #22c55e)' : 'var(--error, #ef4444)'}`,
                borderRadius: 12,
                padding: '0.9rem 1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Link to={`/word/${w.id}`} style={{ fontSize: '1.5rem', fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>{w.simplified}</Link>
                  <TonedPinyin pinyin={w.pinyin} className="review-card-pinyin" />
                  {w.partOfSpeech && <span className="pos-badge" style={{ fontSize: '0.7rem' }}>{w.partOfSpeech}</span>}
                  <AudioButton text={w.simplified} audioUrl={w.audio.wordAudioUrl} label="" />
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 600, color: correct ? 'var(--success, #22c55e)' : 'var(--error, #ef4444)' }}>
                    {correct ? '✓' : '✗'}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.85, margin: '0.25rem 0 0.5rem' }}>{w.english}</div>
                {w.examples[0] && (
                  <div style={{ borderTop: '1px solid var(--border, #eee)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 500 }}>{w.examples[0].chinese}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{w.examples[0].pinyin}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.15rem' }}>{w.examples[0].english}</div>
                  </div>
                )}
              </div>
            ))}
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
        <span className="daily-badge" style={{ marginBottom: 0 }}>📅 Daily</span>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>{' '}
          <span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="quiz-prompt">
        <div className="quiz-prompt-chinese">{word.simplified}</div>
        <div className="quiz-prompt-sub">
          <span className="badge badge-level" style={{ fontSize: '0.75rem' }}>HSK {word.hskLevel}</span>
          <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label="Play" />
        </div>
      </div>

      <div className="quiz-options">
        {options.map((opt, i) => {
          let cls = 'quiz-option'
          if (selected) {
            if (opt.id === word.id) cls += ' opt-correct'
            else if (opt.id === selected) cls += ' opt-wrong'
            else cls += ' opt-dim'
          }
          return (
            <button key={opt.id} className={cls} onClick={() => answer(opt.id)} disabled={!!selected}>
              <kbd className="quiz-key">{i + 1}</kbd>
              {opt.english.length > 55 ? opt.english.slice(0, 55) + '…' : opt.english}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`quiz-feedback ${isCorrect ? 'qf-correct' : 'qf-wrong'}`}>
          <span>{isCorrect ? '✓ Correct!' : `✗ It was: ${word.simplified} — ${word.english}`}</span>
          {!isCorrect && <TonedPinyin pinyin={word.pinyin} className="qf-pinyin" />}
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'} <kbd>Space</kbd>
          </button>
        </div>
      )}
    </div>
  )
}
