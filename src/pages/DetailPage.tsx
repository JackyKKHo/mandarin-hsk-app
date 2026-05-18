import { useParams, Link, useNavigate } from 'react-router-dom'
import AudioButton from '../components/AudioButton'
import TeacherButton from '../components/TeacherButton'
import TonedPinyin from '../components/TonedPinyin'
import PronunciationChecker from '../components/PronunciationChecker'
import StrokeOrder from '../components/StrokeOrder'
import SentencePractice from '../components/SentencePractice'
import { useDismissed } from '../hooks/useDismissed'
import { useProgress } from '../hooks/useProgress'
import { useFavourites } from '../hooks/useFavourites'
import { useVocab } from '../hooks/useVocab'
import { levelFromId } from '../data/vocabLoader'
import { useSEO } from '../hooks/useSEO'
import { normalizePOS } from '../types'
import { useMinedSentences } from '../hooks/useMinedSentences'

function WordSEO({ word }: { word: { id: string; simplified: string; pinyin: string; english: string; hskLevel: number; partOfSpeech: string | string[] } }) {
  const posStr = normalizePOS(word.partOfSpeech).join(', ')
  useSEO({
    title: `${word.simplified} (${word.pinyin}) — ${word.english}`,
    description: `${word.simplified} — ${word.english}. ${posStr}, HSK Level ${word.hskLevel}. Learn pronunciation, stroke order, example sentences and more.`,
    path: `/word/${word.id}`,
  })
  return null
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const level = id ? levelFromId(id) : 1
  const { words, loading } = useVocab(level)
  const wordIndex = words.findIndex(w => w.id === id)
  const word = wordIndex >= 0 ? words[wordIndex] : undefined
  const prevWord = wordIndex > 0 ? words[wordIndex - 1] : null
  const nextWord = wordIndex >= 0 && wordIndex < words.length - 1 ? words[wordIndex + 1] : null
  const { dismissed, dismiss, undismiss } = useDismissed()
  const { isLearned, markLearned, unmarkLearned } = useProgress()
  const { isFavourite, toggleFavourite } = useFavourites()
  const { mine, isMined } = useMinedSentences()

  if (loading) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">← Back</Link>
        <p className="empty-state">Loading…</p>
      </div>
    )
  }

  if (!word) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">← Back</Link>
        <p className="empty-state">Word not found.</p>
      </div>
    )
  }

  const learned = isLearned(word.id)
  const fav = isFavourite(word.id)
  const posLabels = normalizePOS(word.partOfSpeech)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: `${word.simplified} (${word.pinyin})`,
    description: `${word.english} — ${posLabels.join(', ')}, HSK Level ${word.hskLevel}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'HSK Mandarin Vocabulary',
      url: 'https://www.mandarindaily.app',
    },
  }

  return (
    <div className="detail-page">
      <WordSEO word={word} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="detail-nav">
        <Link to={`/hsk/${word.hskLevel}`} className="back-link" style={{ marginBottom: 0 }}>
          ← HSK {word.hskLevel}
        </Link>
        <div className="detail-prev-next">
          <button
            className="prev-next-btn"
            onClick={() => prevWord && navigate(`/word/${prevWord.id}`)}
            disabled={!prevWord}
            title="Previous word"
          >‹ Prev</button>
          <span className="prev-next-pos">{wordIndex + 1} / {words.length}</span>
          <button
            className="prev-next-btn"
            onClick={() => nextWord && navigate(`/word/${nextWord.id}`)}
            disabled={!nextWord}
            title="Next word"
          >Next ›</button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-chinese">{word.simplified}</div>
          <div className="detail-actions">
            <button
              className={`action-btn fav-btn${fav ? ' active' : ''}`}
              onClick={() => toggleFavourite(word.id)}
              title={fav ? 'Remove from favourites' : 'Add to favourites'}
            >
              {fav ? '★' : '☆'}
            </button>
            <AudioButton
              text={word.simplified}
              audioUrl={word.audio.wordAudioUrl}
              label={`Play pronunciation of ${word.simplified}`}
            />
          </div>
        </div>

        <TonedPinyin pinyin={word.pinyin} className="detail-pinyin" />

        <div className="detail-meta">
          <div className="detail-pos-badges">
            {posLabels.map(p => (
              <span key={p} className="badge badge-pos">{p}</span>
            ))}
            {posLabels.length > 1 && (
              <span className="badge badge-pos-note" title="Chinese words commonly function as multiple parts of speech depending on context">
                多词性
              </span>
            )}
          </div>
          <span className="badge badge-level">HSK {word.hskLevel}</span>
          <button
            className={`badge ${learned ? 'badge-learned' : 'badge-mark-learned'}`}
            onClick={() => learned ? unmarkLearned(word.id) : markLearned(word.id)}
          >
            {learned ? '✓ Learned · Undo' : 'Mark learned'}
          </button>
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

        {word.traditional !== word.simplified && (
          <div className="detail-traditional">
            Traditional: <span>{word.traditional}</span>
          </div>
        )}

        {word.meanings && word.meanings.length > 0 ? (
          <section className="meanings-section">
            {word.meanings.map((m, i) => (
              <div key={i} className="meaning-item">
                <div className="meaning-row">
                  <span className="meaning-num">{i + 1}</span>
                  <span className="meaning-def">{m.definition}</span>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="detail-english">{word.english}</div>
        )}

        {word.explanation && (
          <div className="detail-explanation">
            <span className="detail-explanation-label">Usage note</span>
            {word.explanation}
          </div>
        )}

        {(() => {
          const seen = new Set<string>()
          const combined = [
            ...word.examples,
            ...(word.meanings?.map(m => m.example) ?? []),
          ].filter(ex => {
            if (seen.has(ex.chinese)) return false
            seen.add(ex.chinese)
            return true
          }).slice(0, 2)
          return combined.length > 0 ? (
            <section className="examples-section">
              <h3>In use</h3>
              {combined.map((ex, i) => (
                <div key={i} className="example-item">
                  <div className="example-row">
                    <div className="example-content">
                      <div className="example-chinese">{ex.chinese}</div>
                      <TonedPinyin pinyin={ex.pinyin} className="example-pinyin" />
                      <div className="example-english">{ex.english}</div>
                    </div>
                    <div className="example-actions">
                      <AudioButton
                        text={ex.chinese}
                        audioUrl={word.audio.exampleAudioUrls[i] ?? null}
                        label={`Play example: ${ex.chinese}`}
                      />
                      <button
                        className={`mine-btn${isMined(ex.chinese) ? ' mined' : ''}`}
                        onClick={() => mine(ex.chinese, ex.pinyin, ex.english, word.id, word.simplified)}
                        title={isMined(ex.chinese) ? 'Already in sentence deck' : 'Add to sentence review'}
                      >
                        {isMined(ex.chinese) ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : null
        })()}

        <SentencePractice word={{
          simplified: word.simplified,
          pinyin: word.pinyin,
          english: word.english,
          hskLevel: word.hskLevel,
          partOfSpeech: word.partOfSpeech,
        }} />

        <StrokeOrder characters={word.simplified} />

        <PronunciationChecker target={word.simplified} />

        <TeacherButton context={{
          simplified: word.simplified,
          pinyin: word.pinyin,
          english: word.english,
          hskLevel: word.hskLevel,
          partOfSpeech: word.partOfSpeech,
          explanation: word.explanation,
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
