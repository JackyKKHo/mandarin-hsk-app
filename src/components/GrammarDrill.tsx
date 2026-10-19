import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GrammarChoiceExercise, GrammarOrderExercise } from '../types'
import AudioButton from './AudioButton'
import {
  BLANK, checkOrder, fillBlank, orderAnswerText, shuffle, shuffleTiles, type DrillItem,
} from '../lib/grammarDrill'

interface Props {
  items: DrillItem[]
  /** Show which grammar point each question belongs to (level drills) */
  showPoint?: boolean
  onRestart: () => void
  onClose?: () => void
}

interface Result { correct: number; wrong: number; missed: DrillItem[] }

export default function GrammarDrill({ items, showPoint, onRestart, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState<boolean | null>(null)
  const [result, setResult] = useState<Result>({ correct: 0, wrong: 0, missed: [] })

  useEffect(() => {
    setIndex(0)
    setAnswered(null)
    setResult({ correct: 0, wrong: 0, missed: [] })
  }, [items])

  const item = items[index]
  const done = index >= items.length

  function record(ok: boolean) {
    setAnswered(ok)
    setResult(r => ok
      ? { ...r, correct: r.correct + 1 }
      : { ...r, wrong: r.wrong + 1, missed: [...r.missed, item] })
  }

  function next() {
    setAnswered(null)
    setIndex(i => i + 1)
  }

  if (items.length === 0) return <p className="empty-state">No exercises yet.</p>

  if (done) {
    const pct = Math.round((result.correct / items.length) * 100)
    const missedPoints = [...new Map(result.missed.map(m => [m.pointId, m])).values()]
    return (
      <div className="practice-complete-card grammar-drill-done">
        <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>{pct}%</div>
        <div className="srs-result-row">
          <span className="got-count">✓ {result.correct} correct</span>
          <span className="missed-count">✗ {result.wrong} wrong</span>
        </div>
        {showPoint && missedPoints.length > 0 && (
          <div className="grammar-drill-missed">
            <div className="grammar-drill-missed-label">Worth another look</div>
            {missedPoints.map(m => (
              <Link key={m.pointId} to={`/grammar/point/${m.pointId}`} className="grammar-drill-missed-link">{m.pointTitle}</Link>
            ))}
          </div>
        )}
        <div className="complete-actions">
          <button className="btn-primary" onClick={onRestart}>Try again</button>
          {onClose && <button className="btn-secondary" onClick={onClose}>Done</button>}
        </div>
      </div>
    )
  }

  const ex = item.exercise
  return (
    <div className="grammar-drill">
      <div className="grammar-drill-top">
        <span className="practice-counter">{index + 1} / {items.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{result.correct}</span>{' '}
          <span className="missed-count">✗{result.wrong}</span>
        </span>
        {onClose && <button className="grammar-drill-close" onClick={onClose} aria-label="Close drill">✕</button>}
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>

      {showPoint && <div className="grammar-drill-point">{item.pointTitle}</div>}

      {ex.type === 'choice'
        ? <ChoiceQuestion key={index} ex={ex} answered={answered} onAnswer={record} />
        : <OrderQuestion key={index} ex={ex} answered={answered} onAnswer={record} />}

      {answered !== null && (
        <button className="btn-primary grammar-drill-next" onClick={next} autoFocus>
          {index + 1 >= items.length ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}

function Feedback({ ok, sentence, explain }: { ok: boolean; sentence: string; explain?: string }) {
  return (
    <div className={`grammar-drill-feedback ${ok ? 'is-right' : 'is-wrong'}`}>
      <div className="grammar-drill-verdict">{ok ? '✓ Correct' : '✗ Not quite'}</div>
      <div className="grammar-drill-answer">
        <span className="grammar-drill-answer-zh">{sentence}</span>
        <AudioButton text={sentence} audioUrl={null} label={`Play: ${sentence}`} />
      </div>
      {explain && <p className="grammar-drill-explain">{explain}</p>}
    </div>
  )
}

function ChoiceQuestion({ ex, answered, onAnswer }: {
  ex: GrammarChoiceExercise; answered: boolean | null; onAnswer: (ok: boolean) => void
}) {
  const options = useMemo(() => shuffle(ex.options), [ex])
  const [picked, setPicked] = useState<string | null>(null)
  const hasBlank = ex.prompt.includes(BLANK)
  const [before, after] = hasBlank ? ex.prompt.split(BLANK) : [ex.prompt, '']

  function pick(o: string) {
    if (answered !== null) return
    setPicked(o)
    onAnswer(o === ex.answer)
  }

  return (
    <>
      <div className="grammar-drill-card">
        <div className="grammar-drill-english">{ex.english}</div>
        {hasBlank ? (
          <div className="grammar-drill-sentence">
            {before}
            <span className={`grammar-drill-blank${answered !== null ? ' filled' : ''}`}>
              {answered !== null ? ex.answer : ' '}
            </span>
            {after}
          </div>
        ) : (
          <div className="grammar-drill-instruction">{ex.prompt}</div>
        )}
      </div>
      <div className={`quiz-options${hasBlank ? '' : ' grammar-drill-sentence-options'}`}>
        {options.map(o => {
          let cls = 'quiz-option'
          if (answered !== null) {
            if (o === ex.answer) cls += ' opt-correct'
            else if (o === picked) cls += ' opt-wrong'
            else cls += ' opt-dim'
          }
          return (
            <button key={o} className={cls} onClick={() => pick(o)} disabled={answered !== null}>{o}</button>
          )
        })}
      </div>
      {answered !== null && (
        <Feedback ok={answered} sentence={fillBlank(ex.prompt, ex.answer)} explain={ex.explain} />
      )}
    </>
  )
}

function OrderQuestion({ ex, answered, onAnswer }: {
  ex: GrammarOrderExercise; answered: boolean | null; onAnswer: (ok: boolean) => void
}) {
  const start = useMemo(() => shuffleTiles(ex), [ex])
  const [placed, setPlaced] = useState<number[]>([])
  const pool = start.filter(i => !placed.includes(i))
  const full = placed.length === ex.tokens.length

  function check() {
    onAnswer(checkOrder(ex, placed.map(i => ex.tokens[i])))
  }

  return (
    <>
      <div className="grammar-drill-card">
        <div className="grammar-drill-instruction">Put the words in order</div>
        <div className="grammar-drill-english">{ex.english}</div>
      </div>

      <div className="scramble-answer grammar-drill-slots">
        {placed.length === 0 && <span className="grammar-drill-slots-hint">Tap the words below</span>}
        {placed.map((ti, pos) => (
          <button
            key={ti}
            className={`scramble-slot filled${answered === null ? '' : answered ? ' slot-correct' : ' slot-wrong'}`}
            onClick={() => answered === null && setPlaced(p => p.filter((_, i) => i !== pos))}
            disabled={answered !== null}
          >
            {ex.tokens[ti].replace(/[，,]$/, '')}
          </button>
        ))}
      </div>

      {answered === null && (
        <>
          <div className="scramble-pool">
            {pool.map(ti => (
              <button key={ti} className="scramble-tile" onClick={() => setPlaced(p => [...p, ti])}>
                {ex.tokens[ti].replace(/[，,]$/, '')}
              </button>
            ))}
          </div>
          <div className="scramble-actions">
            <button className="btn-secondary" onClick={() => setPlaced([])} disabled={placed.length === 0}>Clear</button>
            <button className="btn-primary" onClick={check} disabled={!full}>Check</button>
          </div>
        </>
      )}

      {answered !== null && (
        <Feedback ok={answered} sentence={orderAnswerText(ex)} explain={ex.explain} />
      )}
    </>
  )
}
