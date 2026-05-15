import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import passages, { getPassagesByLevel, type ReadingPassage } from '../data/readingPassages'
import { loadLevel } from '../data/vocabLoader'
import type { VocabItem } from '../types'
import ClickableText from '../components/ClickableText'

type View = 'list' | 'test' | 'result'

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner', 2: 'Beginner+', 3: 'Elementary', 4: 'Intermediate',
}

const LEVEL_COLORS: Record<number, string> = {
  1: '#2e7d32', 2: '#1565c0', 3: '#e65100', 4: '#6a1b9a',
}

// ── Reading test ──────────────────────────────────────────────────────────────
function ReadingTest({
  passage,
  onBack,
  onFinish,
  lookup,
}: {
  passage: ReadingPassage
  onBack: () => void
  onFinish: (answers: number[]) => void
  lookup: Map<string, VocabItem>
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(passage.questions.length).fill(null)
  )
  const [showTranslation, setShowTranslation] = useState(false)

  const allAnswered = answers.every(a => a !== null)

  function select(qIdx: number, optIdx: number) {
    setAnswers(prev => {
      const next = [...prev]
      next[qIdx] = optIdx
      return next
    })
  }

  return (
    <div className="practice-page">
      <div className="reading-topbar">
        <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onBack}>
          ← Reading
        </button>
        <span className="reading-level-badge" style={{ background: LEVEL_COLORS[passage.level] }}>
          HSK {passage.level}
        </span>
      </div>

      {/* Passage */}
      <div className="reading-passage-card">
        <h2 className="reading-passage-title">{passage.title}</h2>
        <p className="reading-passage-title-en">{passage.titleEn}</p>
        <div className="reading-passage-text">
          {passage.text.split('\n').map((line, i) => (
            <p key={i}><ClickableText text={line} lookup={lookup} /></p>
          ))}
        </div>
        <button
          className="reading-translation-toggle"
          onClick={() => setShowTranslation(v => !v)}
        >
          {showTranslation ? 'Hide translation' : 'Show translation'}
        </button>
        {showTranslation && (
          <div className="reading-translation">{passage.translation}</div>
        )}
      </div>

      {/* Questions */}
      <div className="reading-questions">
        <h3 className="reading-questions-title">Comprehension questions</h3>
        {passage.questions.map((q, qi) => (
          <div key={qi} className="reading-question">
            <div className="reading-q-number">Q{qi + 1}</div>
            <div className="reading-q-body">
              <p className="reading-q-chinese">{q.q}</p>
              <p className="reading-q-english">{q.qEn}</p>
              <div className="reading-options">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`reading-option${answers[qi] === oi ? ' reading-opt-selected' : ''}`}
                    onClick={() => select(qi, oi)}
                  >
                    <span className="reading-opt-letter">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 1rem 2rem', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <button
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={!allAnswered}
          onClick={() => onFinish(answers as number[])}
        >
          Submit answers →
        </button>
        {!allAnswered && (
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            Answer all {passage.questions.length} questions to submit
          </p>
        )}
      </div>
    </div>
  )
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ReadingResult({
  passage,
  answers,
  onRetry,
  onBack,
}: {
  passage: ReadingPassage
  answers: number[]
  onRetry: () => void
  onBack: () => void
}) {
  const correct = answers.filter((a, i) => a === passage.questions[i].answer).length
  const total = passage.questions.length
  const pct = Math.round((correct / total) * 100)

  return (
    <div className="practice-page">
      <div className="practice-complete-card">
        <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
          {pct}%
        </div>
        <h2>{passage.title}</h2>
        <p className="reading-result-sub">{correct} / {total} correct</p>

        <div className="complete-actions">
          <button className="btn-primary" onClick={onRetry}>Try again</button>
          <button className="btn-secondary" onClick={onBack}>Other passages</button>
        </div>

        {/* Answer review */}
        <div className="reading-review">
          <div className="missed-words-title" style={{ marginBottom: '0.75rem' }}>Answer review</div>
          {passage.questions.map((q, i) => {
            const isCorrect = answers[i] === q.answer
            return (
              <div key={i} className={`reading-review-item${isCorrect ? ' rr-correct' : ' rr-wrong'}`}>
                <div className="rr-header">
                  <span className="rr-icon">{isCorrect ? '✓' : '✗'}</span>
                  <span className="rr-q">{q.q}</span>
                </div>
                {!isCorrect && (
                  <div className="rr-detail">
                    <span className="rr-wrong-ans">Your answer: {q.options[answers[i]]}</span>
                    <span className="rr-correct-ans">Correct: {q.options[q.answer]}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Full passage + translation */}
        <div className="reading-passage-card" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <div className="reading-passage-text">
            {passage.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <div className="reading-translation" style={{ marginTop: '0.75rem' }}>{passage.translation}</div>
        </div>
      </div>
    </div>
  )
}

// ── Passage list ──────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1)
  const [view, setView] = useState<View>('list')
  const [activePassage, setActivePassage] = useState<ReadingPassage | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [lookup, setLookup] = useState<Map<string, VocabItem>>(new Map())

  useEffect(() => {
    Promise.all([1, 2, 3, 4].map(loadLevel)).then(levels => {
      const map = new Map<string, VocabItem>()
      for (const words of levels) {
        for (const w of words) {
          map.set(w.simplified, w)
          if (w.traditional !== w.simplified) map.set(w.traditional, w)
        }
      }
      setLookup(map)
    })
  }, [])

  const levelPassages = getPassagesByLevel(level)

  if (view === 'test' && activePassage) {
    return (
      <ReadingTest
        passage={activePassage}
        lookup={lookup}
        onBack={() => setView('list')}
        onFinish={ans => { setAnswers(ans); setView('result') }}
      />
    )
  }

  if (view === 'result' && activePassage) {
    return (
      <ReadingResult
        passage={activePassage}
        answers={answers}
        onRetry={() => { setAnswers([]); setView('test') }}
        onBack={() => setView('list')}
      />
    )
  }

  return (
    <div className="practice-page">
      <Link to="/guides" className="back-link">← Guides</Link>

      <div className="reading-page-header">
        <h1 className="reading-page-title">Reading Practice</h1>
        <p className="reading-page-desc">
          Read a passage then answer comprehension questions. Translation revealed after submitting.
        </p>
      </div>

      {/* Level tabs */}
      <div className="reading-level-tabs">
        {([1, 2, 3, 4] as const).map(l => (
          <button
            key={l}
            className={`reading-level-tab${level === l ? ' active' : ''}`}
            style={level === l ? { borderColor: LEVEL_COLORS[l], color: LEVEL_COLORS[l] } : {}}
            onClick={() => setLevel(l)}
          >
            HSK {l}
            <span className="reading-tab-label">{LEVEL_LABELS[l]}</span>
          </button>
        ))}
      </div>

      {/* Passage cards */}
      <div className="reading-passage-list">
        {levelPassages.map(p => (
          <button
            key={p.id}
            className="reading-passage-btn"
            onClick={() => { setActivePassage(p); setAnswers([]); setView('test') }}
          >
            <div className="rpb-left">
              <span className="rpb-badge" style={{ background: LEVEL_COLORS[p.level] }}>HSK {p.level}</span>
              <div>
                <div className="rpb-title">{p.title}</div>
                <div className="rpb-title-en">{p.titleEn}</div>
              </div>
            </div>
            <div className="rpb-right">
              <span className="rpb-qcount">{p.questions.length} questions</span>
              <span className="rpb-arrow">→</span>
            </div>
          </button>
        ))}
      </div>

      <p className="reading-total-note">
        {passages.length} passages across HSK 1–4
      </p>
    </div>
  )
}
