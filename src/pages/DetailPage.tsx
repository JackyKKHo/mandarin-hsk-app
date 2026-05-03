import { useParams, Link } from 'react-router-dom'
import vocab from '../data/vocab'
import AudioButton from '../components/AudioButton'
import TeacherButton from '../components/TeacherButton'
import TonedPinyin from '../components/TonedPinyin'
import { useDismissed } from '../hooks/useDismissed'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const word = vocab.find(w => w.id === id)
  const { dismissed, dismiss, undismiss } = useDismissed()

  if (!word) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">← Back</Link>
        <p className="empty-state">Word not found.</p>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to={`/hsk/${word.hskLevel}`} className="back-link">
        ← HSK {word.hskLevel}
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-chinese">{word.simplified}</div>
          <AudioButton
            text={word.simplified}
            audioUrl={word.audio.wordAudioUrl}
            label={`Play pronunciation of ${word.simplified}`}
          />
        </div>

        <TonedPinyin pinyin={word.pinyin} className="detail-pinyin" />

        <div className="detail-meta">
          <span className="badge badge-pos">{word.partOfSpeech}</span>
          <span className="badge badge-level">HSK {word.hskLevel}</span>
          {dismissed.has(word.id) ? (
            <button
              className="badge badge-dismissed"
              onClick={() => undismiss(word.id)}
              title="Click to show again in practice"
            >
              ✓ Too easy · Undo
            </button>
          ) : (
            <button
              className="badge badge-dismiss-btn"
              onClick={() => dismiss(word.id)}
              title="Hide from practice sessions"
            >
              Too easy?
            </button>
          )}
        </div>

        <div className="detail-english">{word.english}</div>

        {word.traditional !== word.simplified && (
          <div className="detail-traditional">
            Traditional: <span>{word.traditional}</span>
          </div>
        )}

        {word.examples.length > 0 && (
          <section className="examples-section">
            <h3>Example sentences</h3>
            {word.examples.map((ex, i) => (
              <div key={i} className="example-item">
                <div className="example-row">
                  <div className="example-content">
                    <div className="example-chinese">{ex.chinese}</div>
                    <TonedPinyin pinyin={ex.pinyin} className="example-pinyin" />
                    <div className="example-english">{ex.english}</div>
                  </div>
                  <AudioButton
                    text={ex.chinese}
                    audioUrl={word.audio.exampleAudioUrls[i] ?? null}
                    label={`Play example: ${ex.chinese}`}
                  />
                </div>
              </div>
            ))}
          </section>
        )}

        <TeacherButton context={{
          simplified: word.simplified,
          pinyin: word.pinyin,
          english: word.english,
          hskLevel: word.hskLevel,
        }} />

        {word.tags.length > 0 && (
          <div className="tags-section">
            {word.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
