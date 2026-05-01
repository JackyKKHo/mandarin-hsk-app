import { useParams, Link } from 'react-router-dom'
import grammarData from '../../data/grammar.json'
import type { GrammarPoint } from '../types'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'

const grammar = grammarData as GrammarPoint[]

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
      </div>
    </div>
  )
}
