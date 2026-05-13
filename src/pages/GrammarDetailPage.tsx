import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import grammarData from '../../data/grammar.json'
import type { GrammarPoint } from '../types'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'

const grammar = grammarData as GrammarPoint[]

type TestStage = 'idle' | 'answering' | 'loading' | 'feedback'

function GrammarTest({ point }: { point: GrammarPoint }) {
  const [active, setActive] = useState(false)
  const [exIndex, setExIndex] = useState(0)
  const [attempt, setAttempt] = useState('')
  const [stage, setStage] = useState<TestStage>('idle')
  const [feedback, setFeedback] = useState('')
  const [showRef, setShowRef] = useState(false)

  const examples = point.examples
  const ex = examples[exIndex]

  function startTest() {
    setActive(true)
    setExIndex(0)
    setAttempt('')
    setStage('answering')
    setFeedback('')
    setShowRef(false)
  }

  async function submit() {
    if (!attempt.trim()) return
    setStage('loading')
    try {
      const res = await fetch('/api/grammar-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarTitle: point.title,
          pattern: point.pattern,
          explanation: point.explanation,
          english: ex.english,
          reference: ex.chinese,
          attempt: attempt.trim(),
        }),
      })
      const data = await res.json()
      setFeedback(res.ok ? data.feedback : 'Could not get feedback right now.')
    } catch {
      setFeedback('Could not get feedback right now.')
    }
    setStage('feedback')
    setShowRef(true)
  }

  function next() {
    const nextIdx = exIndex + 1
    if (nextIdx >= examples.length) {
      setActive(false)
      setStage('idle')
    } else {
      setExIndex(nextIdx)
      setAttempt('')
      setFeedback('')
      setShowRef(false)
      setStage('answering')
    }
  }

  if (!active) {
    return (
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={startTest}>
          Practice this grammar ({examples.length} sentence{examples.length !== 1 ? 's' : ''})
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '1.5rem', border: '1.5px solid var(--accent, #4f8ef7)', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Practice {exIndex + 1} / {examples.length}</span>
        <button onClick={() => setActive(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1rem' }}>✕</button>
      </div>

      <div style={{ background: 'var(--surface, #f5f5f5)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Translate into Chinese using: <strong>{point.pattern}</strong></div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ex.english}</div>
      </div>

      <textarea
        value={attempt}
        onChange={e => setAttempt(e.target.value)}
        placeholder="Type your Chinese sentence here…"
        disabled={stage === 'loading' || stage === 'feedback'}
        rows={2}
        style={{ width: '100%', borderRadius: 8, border: '1.5px solid var(--border, #ddd)', padding: '0.6rem 0.75rem', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: 'var(--card-bg)' }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && stage === 'answering') { e.preventDefault(); submit() } }}
      />

      {stage === 'answering' && (
        <button className="btn-primary" onClick={submit} disabled={!attempt.trim()} style={{ marginTop: '0.75rem', width: '100%' }}>
          Get feedback
        </button>
      )}

      {stage === 'loading' && (
        <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '0.75rem' }}>Checking your answer…</p>
      )}

      {stage === 'feedback' && (
        <>
          <div style={{ marginTop: '0.75rem', background: 'var(--surface, #f5f5f5)', borderRadius: 10, padding: '0.85rem 1rem', borderLeft: '3px solid var(--accent, #4f8ef7)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, marginBottom: '0.35rem' }}>AI Feedback</div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{feedback}</p>
          </div>

          {showRef && (
            <div style={{ marginTop: '0.6rem', background: 'var(--surface, #f5f5f5)', borderRadius: 10, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.2rem' }}>Reference answer</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{ex.chinese}</div>
              <TonedPinyin pinyin={ex.pinyin} className="example-pinyin" />
            </div>
          )}

          <button className="btn-primary" onClick={next} style={{ marginTop: '0.75rem', width: '100%' }}>
            {exIndex + 1 >= examples.length ? 'Finish practice' : 'Next sentence →'}
          </button>
        </>
      )}
    </div>
  )
}

export default function GrammarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const point = grammar.find(g => g.id === id)

  if (!point) {
    return (
      <div className="detail-page">
        <Link to="/grammar/1" className="back-link">← Grammar</Link>
        <p className="empty-state">Grammar point not found.</p>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to={`/grammar/${point.hskLevel}`} className="back-link">
        ← HSK {point.hskLevel} Grammar
      </Link>

      <div className="detail-card">
        <div className="grammar-detail-meta">
          <span className="badge badge-level">HSK {point.hskLevel}</span>
          {point.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        <h2 className="grammar-detail-title">{point.title}</h2>

        <div className="grammar-pattern-block">
          <span className="grammar-pattern-label">Pattern</span>
          <span className="grammar-pattern-text">{point.pattern}</span>
        </div>

        <p className="grammar-explanation">{point.explanation}</p>

        <section className="examples-section">
          <h3>Examples</h3>
          {point.examples.map((ex, i) => (
            <div key={i} className="example-item">
              <div className="example-row">
                <div className="example-content">
                  <div className="example-chinese">{ex.chinese}</div>
                  <TonedPinyin pinyin={ex.pinyin} className="example-pinyin" />
                  <div className="example-english">{ex.english}</div>
                </div>
                <AudioButton
                  text={ex.chinese}
                  audioUrl={null}
                  label={`Play: ${ex.chinese}`}
                />
              </div>
            </div>
          ))}
        </section>

        {point.notes && (
          <div className="grammar-notes">
            <span className="grammar-notes-label">Note</span>
            <p>{point.notes}</p>
          </div>
        )}

        {point.examples.length > 0 && <GrammarTest point={point} />}
      </div>
    </div>
  )
}
