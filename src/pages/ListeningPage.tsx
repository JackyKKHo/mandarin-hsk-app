import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import { usePracticeWords } from '../hooks/usePracticeWords'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'

type Stage = 'idle' | 'question' | 'feedback' | 'complete'
type QuestionType = 'char' | 'english' | 'pinyin'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDistractors(correct: VocabItem, pool: VocabItem[]): VocabItem[] {
  return shuffle(pool.filter(w => w.id !== correct.id)).slice(0, 3)
}

async function fetchTTS(text: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

export default function ListeningPage() {
  const { level } = useParams<{ level: string }>()
  const { review } = useSRS()
  const { recordStudy } = useStreak()
  const { words: levelWords, title, backPath, loading: vocabLoading } = usePracticeWords(level)

  const [stage, setStage] = useState<Stage>('idle')
  const [sessionLength, setSessionLength] = useState<10 | 25 | 50 | 100>(25)
  const [questionType, setQuestionType] = useState<QuestionType>('char')
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<VocabItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [wrongWords, setWrongWords] = useState<VocabItem[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const touchStartY = useRef(0)
  const touchScrolled = useRef(false)

  async function loadQuestion(word: VocabItem, pool: VocabItem[]) {
    setLoading(true)
    const url = await fetchTTS(word.simplified)
    setAudioUrl(url)
    setOptions(shuffle([word, ...pickDistractors(word, pool)]))
    setLoading(false)
    // auto-play
    if (url) {
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play().catch(() => {})
    }
  }

  async function start() {
    const q = shuffle(levelWords).slice(0, sessionLength)
    setQueue(q)
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setWrongWords([])
    setSelected(null)
    setStage('question')
    await loadQuestion(q[0], levelWords)
  }

  function playAudio() {
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.play().catch(() => {})
  }

  function answer(wordId: string) {
    if (selected) return
    setSelected(wordId)
    const correct = wordId === queue[index].id
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    if (!correct) setWrongWords(w => [...w, queue[index]])
    review(queue[index].id, correct ? 'good' : 'again')
    setStage('feedback')
  }

  async function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(nextIdx)
      setSelected(null)
      setStage('question')
      await loadQuestion(queue[nextIdx], levelWords)
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Listening Practice</h2>
          {vocabLoading ? (
            <p className="empty-state">Loading…</p>
          ) : levelWords.length === 0 ? (
            <p className="empty-state">No vocabulary yet for this level.</p>
          ) : (
            <>
              <p className="practice-start-desc">
                Listen to the word and pick the correct answer.
                Audio plays automatically.
              </p>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {([10, 25, 50, 100] as const).map(n => (
                    <button
                      key={String(n)}
                      className={`quiz-length-btn${sessionLength === n ? ' active' : ''}`}
                      onClick={() => setSessionLength(n)}
                      disabled={n > levelWords.length}
                    >
                      {n === 100 ? (levelWords.length <= 100 ? `All ${levelWords.length}` : '100') : n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Answer type</span>
                <div className="quiz-mode-picker">
                  {([
                    { key: 'char', label: 'Pick character' },
                    { key: 'english', label: 'Pick meaning' },
                    { key: 'pinyin', label: 'Pick pinyin' },
                  ] as { key: QuestionType; label: string }[]).map(({ key, label }) => (
                    <button
                      key={key}
                      className={`quiz-mode-btn${questionType === key ? ' active' : ''}`}
                      onClick={() => setQuestionType(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={start} disabled={loading}>
                {loading ? 'Loading…' : `Start ${Math.min(sessionLength, levelWords.length)} questions`}
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
          <h2>Listening complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Play again</button>
            <Link to={backPath} className="btn-secondary">Back to browser</Link>
          </div>
          {wrongWords.length > 0 && (
            <div className="missed-words">
              <div className="missed-words-title">Missed words</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {wrongWords.map(w => (
                  <Link key={w.id} to={`/word/${w.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--error, #ef4444)', borderRadius: 12, padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{w.simplified}</span>
                        <TonedPinyin pinyin={w.pinyin} className="review-card-pinyin" />
                        {w.partOfSpeech && <span className="pos-badge" style={{ fontSize: '0.7rem' }}>{w.partOfSpeech}</span>}
                        <AudioButton text={w.simplified} audioUrl={w.audio.wordAudioUrl} label="" />
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent, #4f8ef7)' }}>Full explanation →</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.85, margin: '0.2rem 0 0.5rem' }}>{w.english}</div>
                      {w.examples[0] && (
                        <div style={{ borderTop: '1px solid var(--border, #eee)', paddingTop: '0.5rem' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 500 }}>{w.examples[0].chinese}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{w.examples[0].pinyin}</div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.15rem' }}>{w.examples[0].english}</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const word = queue[index]
  const progressPct = (index / queue.length) * 100

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

      <div className="listening-prompt">
        {loading ? (
          <div className="listening-loading">
            <span className="listening-spinner" />
            Loading audio…
          </div>
        ) : (
          <button className="listening-play-btn" onClick={playAudio} aria-label="Play audio">
            <span className="listening-play-icon">▶</span>
            <span className="listening-play-label">Play again</span>
          </button>
        )}
        <p className="listening-instruction">
          {questionType === 'char' && 'Which character did you hear?'}
          {questionType === 'english' && 'What does this word mean?'}
          {questionType === 'pinyin' && 'Which pinyin matches?'}
        </p>
      </div>

      <div
        className="quiz-options"
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY; touchScrolled.current = false }}
        onTouchMove={e => { if (Math.abs(e.touches[0].clientY - touchStartY.current) > 8) touchScrolled.current = true }}
      >
        {options.map(opt => {
          let cls = 'quiz-option'
          if (selected) {
            if (opt.id === word.id) cls += ' opt-correct'
            else if (opt.id === selected) cls += ' opt-wrong'
            else cls += ' opt-dim'
          }
          return (
            <button key={opt.id} className={cls} onClick={() => { if (!touchScrolled.current) answer(opt.id) }} disabled={!!selected}>
              {questionType === 'char'    && <span className="opt-chinese">{opt.simplified}</span>}
              {questionType === 'english' && opt.english}
              {questionType === 'pinyin'  && <TonedPinyin pinyin={opt.pinyin} className="" />}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`quiz-feedback ${selected === word.id ? 'qf-correct' : 'qf-wrong'}`}>
          <span>
            {selected === word.id
              ? `✓ Correct! ${word.simplified} — ${word.english}`
              : `✗ It was: ${word.simplified} — ${word.english}`}
          </span>
          <TonedPinyin pinyin={word.pinyin} className="qf-pinyin" />
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
