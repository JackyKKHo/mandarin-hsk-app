import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import grammarData from '../../data/grammar.json'
import type { GrammarPoint } from '../types'
import GrammarDrill from '../components/GrammarDrill'
import { buildDrill, drillItems, type DrillItem } from '../lib/grammarDrill'
import { levelLabel, toLevel } from '../data/levels'
import { useSEO } from '../hooks/useSEO'

const grammar = grammarData as GrammarPoint[]
const LENGTHS = [10, 20, 0] as const

export default function GrammarDrillPage() {
  const { level } = useParams<{ level: string }>()
  const currentLevel = toLevel(level)
  const label = levelLabel(currentLevel)
  useSEO({
    title: `HSK ${label} Grammar Drill`,
    description: `Practise HSK ${label} Mandarin grammar with instantly marked fill-the-gap, correct-sentence and word-order exercises.`,
    path: `/grammar/drill/${currentLevel}`,
  })

  const points = useMemo(() => grammar.filter(g => g.hskLevel === currentLevel), [currentLevel])
  const total = useMemo(() => drillItems(points).length, [points])
  const [length, setLength] = useState<number>(10)
  const [items, setItems] = useState<DrillItem[] | null>(null)

  const backPath = `/grammar/${currentLevel}`
  const start = () => setItems(buildDrill(points, length))

  if (!items) {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← HSK {label} Grammar</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">HSK {label} Grammar Drill</div>
          {total === 0 ? (
            <p className="empty-state">No grammar exercises for this level yet.</p>
          ) : (
            <>
              <p className="practice-start-desc">
                A mix of fill-the-gap, spot-the-correct-sentence and word-order questions from {points.length} grammar
                points, marked instantly.
              </p>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {LENGTHS.filter(n => n === 0 || n < total).map(n => (
                    <button
                      key={n}
                      className={`quiz-length-btn${length === n ? ' active' : ''}`}
                      onClick={() => setLength(n)}
                    >
                      {n === 0 ? `All ${total}` : n}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={start}>Start drill</button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="practice-page">
      <Link to={backPath} className="back-link">← HSK {label} Grammar</Link>
      <GrammarDrill items={items} showPoint onRestart={start} />
    </div>
  )
}
