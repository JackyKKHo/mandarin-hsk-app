import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadLevel } from '../data/vocabLoader'
import TonedPinyin from '../components/TonedPinyin'
import type { VocabItem } from '../types'

type Stage = 'intro' | 'loading' | 'question' | 'feedback' | 'result'

interface AnsweredQ {
  level: number
  correct: boolean
}

const TOTAL_QUESTIONS = 15

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function computeRecommended(answered: AnsweredQ[]): number {
  // Find the highest level where accuracy >= 50%
  const byLevel: Record<number, { c: number; w: number }> = {}
  for (const a of answered) {
    if (!byLevel[a.level]) byLevel[a.level] = { c: 0, w: 0 }
    if (a.correct) byLevel[a.level].c++
    else byLevel[a.level].w++
  }
  let best = 1
  for (let l = 1; l <= 9; l++) {
    const s = byLevel[l]
    if (s && s.c >= s.w) best = l
  }
  return best
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner', 2: 'Beginner', 3: 'Elementary', 4: 'Elementary',
  5: 'Intermediate', 6: 'Intermediate', 7: 'Advanced', 8: 'Advanced', 9: 'Advanced',
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('intro')
  const [currentLevel, setCurrentLevel] = useState(3)
  const [word, setWord] = useState<VocabItem | null>(null)
  const [options, setOptions] = useState<VocabItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState<AnsweredQ[]>([])
  const [recommended, setRecommended] = useState(1)

  const usedIds = useRef<Set<string>>(new Set())
  const levelCache = useRef<Record<number, VocabItem[]>>({})

  const getLevelWords = useCallback(async (level: number): Promise<VocabItem[]> => {
    if (levelCache.current[level]) return levelCache.current[level]
    const words = await loadLevel(level)
    levelCache.current[level] = words
    return words
  }, [])

  async function loadQuestion(level: number, answeredSoFar: AnsweredQ[]) {
    setStage('loading')
    const words = await getLevelWords(level)
    const eligible = words.filter(w => !usedIds.current.has(w.id) && w.english && w.simplified)
    const target = shuffle(eligible)[0]

    if (!target) {
      // Level exhausted — just move on
      finish(answeredSoFar)
      return
    }

    usedIds.current.add(target.id)

    // Distractors: prefer same level, fall back to any from pool
    const pool = shuffle(words.filter(w => w.id !== target.id && w.english))
    const distractors = pool.slice(0, 3)

    setWord(target)
    setOptions(shuffle([target, ...distractors]))
    setSelected(null)
    setCurrentLevel(level)
    setStage('question')
  }

  function start() {
    usedIds.current = new Set()
    setAnswered([])
    loadQuestion(3, [])
  }

  function answer(optId: string) {
    if (!word || selected) return
    setSelected(optId)
    const correct = optId === word.id
    const next: AnsweredQ[] = [...answered, { level: currentLevel, correct }]
    setAnswered(next)
    setStage('feedback')

    if (next.length >= TOTAL_QUESTIONS) {
      setTimeout(() => finish(next), 800)
    } else {
      const nextLevel = correct
        ? Math.min(9, currentLevel + 1)
        : Math.max(1, currentLevel - 1)
      setTimeout(() => loadQuestion(nextLevel, next), 800)
    }
  }

  function finish(answeredList: AnsweredQ[]) {
    const rec = computeRecommended(answeredList)
    setRecommended(rec)
    setStage('result')
  }

  function goToLevel(level: number) {
    localStorage.setItem('hsk-onboarded', '1')
    navigate(`/hsk/${level}`)
  }

  const progressPct = (answered.length / TOTAL_QUESTIONS) * 100

  if (stage === 'intro') {
    return (
      <div className="assessment-page">
        <div className="assessment-intro-card">
          <div className="assessment-icon">🎯</div>
          <h1>Level Assessment</h1>
          <p className="assessment-desc">
            Answer {TOTAL_QUESTIONS} quick questions and we'll recommend the right HSK level for you.
            Questions adapt based on your answers — no guessing required.
          </p>
          <ul className="assessment-bullets">
            <li>Multiple choice — pick the English meaning</li>
            <li>Starts at HSK 3, adjusts up or down</li>
            <li>Takes about 2 minutes</li>
          </ul>
          <button className="btn-primary" onClick={start}>Start assessment →</button>
          <button className="assessment-skip" onClick={() => navigate('/welcome')}>
            Back to level picker
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'result') {
    const correct = answered.filter(a => a.correct).length
    const pct = Math.round((correct / answered.length) * 100)
    return (
      <div className="assessment-page">
        <div className="assessment-result-card">
          <div className="assessment-result-badge">HSK {recommended}</div>
          <h2>We recommend <strong>HSK {recommended}</strong></h2>
          <p className="assessment-result-tag">{LEVEL_LABELS[recommended]}</p>
          <p className="assessment-result-score">
            You answered {correct} of {answered.length} correctly ({pct}%)
          </p>
          <div className="assessment-result-actions">
            <button className="btn-primary" onClick={() => goToLevel(recommended)}>
              Start at HSK {recommended} →
            </button>
            {recommended < 9 && (
              <button className="btn-secondary" onClick={() => goToLevel(recommended + 1)}>
                Try HSK {recommended + 1} instead
              </button>
            )}
            {recommended > 1 && (
              <button className="btn-secondary" onClick={() => goToLevel(recommended - 1)}>
                Start easier at HSK {recommended - 1}
              </button>
            )}
          </div>
          <button className="assessment-skip" onClick={start}>Retake assessment</button>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-page">
      {/* Progress */}
      <div className="assessment-topbar">
        <span className="assessment-counter">{answered.length + (stage === 'feedback' ? 0 : 0)} / {TOTAL_QUESTIONS}</span>
        <span className="assessment-level-badge">HSK {currentLevel}</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {stage === 'loading' ? (
        <div className="assessment-loading">Loading question…</div>
      ) : word ? (
        <>
          <div className="assessment-question-card">
            <p className="assessment-prompt">What does this word mean?</p>
            <div className="assessment-word">{word.simplified}</div>
            <TonedPinyin pinyin={word.pinyin} className="assessment-pinyin" />
          </div>

          <div className="assessment-options">
            {options.map(opt => {
              let cls = 'assessment-option'
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
                  {opt.english.split(';')[0].split(',')[0]}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
