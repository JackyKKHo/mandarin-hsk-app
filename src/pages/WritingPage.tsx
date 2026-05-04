import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import HanziWriter from 'hanzi-writer'
import TonedPinyin from '../components/TonedPinyin'
import { useVocab } from '../hooks/useVocab'

type Stage = 'idle' | 'writing' | 'complete'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SIZE = 200

export default function WritingPage() {
  const { level } = useParams<{ level: string }>()
  const currentLevel = Number(level) || 1

  const { words: vocabLevel } = useVocab(currentLevel)
  const levelWords = useMemo(() =>
    vocabLevel.filter(w => [...w.simplified].every(c => /\p{Script=Han}/u.test(c))),
    [vocabLevel]
  )

  const [stage, setStage] = useState<Stage>('idle')
  const [queue, setQueue] = useState<typeof levelWords>([])
  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [status, setStatus] = useState<'writing' | 'done' | 'loading'>('loading')
  const [mistakes, setMistakes] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)

  function start() {
    const q = shuffle(levelWords).slice(0, 20)
    setQueue(q)
    setIndex(0)
    setCharIndex(0)
    setScore({ correct: 0, total: 0 })
    setStage('writing')
  }

  useEffect(() => {
    if (stage !== 'writing' || !containerRef.current || queue.length === 0) return

    const word = queue[index]
    const chars = [...word.simplified]
    const char = chars[charIndex]

    if (!char) return

    setStatus('loading')
    setMistakes(0)

    const container = containerRef.current
    container.innerHTML = ''

    writerRef.current?.cancelQuiz()

    const writer = HanziWriter.create(container, char, {
      width: SIZE,
      height: SIZE,
      padding: 16,
      showCharacter: false,
      showOutline: true,
      strokeColor: '#c0392b',
      outlineColor: '#d0d0d0',
      drawingColor: '#2471a3',
      drawingWidth: 4,
      highlightOnComplete: true,
      highlightColor: '#27ae60',
      charDataLoader: (c, onLoad, onError) => {
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${c}.json`)
          .then(r => { if (!r.ok) throw new Error(); return r.json() })
          .then(data => {
            onLoad(data)
            setStatus('writing')
            writer.quiz({
              onMistake: () => setMistakes(m => m + 1),
              onCorrectStroke: () => {},
              onComplete: (summary: { totalMistakes: number }) => {
                const isClean = summary.totalMistakes === 0
                setScore(s => ({
                  correct: s.correct + (isClean ? 1 : 0),
                  total: s.total + 1,
                }))
                setStatus('done')
              },
            })
          })
          .catch(() => {
            onError?.()
            setStatus('done')
          })
      },
    })
    writerRef.current = writer

    return () => { writer.cancelQuiz() }
  }, [stage, index, charIndex, queue])

  function nextChar() {
    const word = queue[index]
    const chars = [...word.simplified]
    if (charIndex + 1 < chars.length) {
      setCharIndex(c => c + 1)
    } else {
      if (index + 1 >= queue.length) {
        setStage('complete')
      } else {
        setIndex(i => i + 1)
        setCharIndex(0)
      }
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={`/hsk/${currentLevel}`} className="back-link">← HSK {currentLevel}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">HSK {currentLevel}</div>
          <h2>Writing Practice</h2>
          {levelWords.length === 0 ? (
            <p className="empty-state">No single-character words for this level.</p>
          ) : (
            <>
              <p className="practice-start-desc">
                Trace each stroke in the correct order using your mouse or finger.
                Up to 20 words per session.
              </p>
              <button className="btn-primary" onClick={start}>Start writing</button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Writing complete!</h2>
          <p className="complete-detail">
            <span className="got-count">{score.correct} perfect</span>
            {' · '}
            {score.total} total strokes attempted
          </p>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Try again</button>
            <Link to={`/hsk/${currentLevel}`} className="btn-secondary">Back to browser</Link>
          </div>
        </div>
      </div>
    )
  }

  const word = queue[index]
  const chars = [...word.simplified]
  const progressPct = ((index + charIndex / chars.length) / queue.length) * 100

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={`/hsk/${currentLevel}`} className="back-link" style={{ marginBottom: 0 }}>
          ← HSK {currentLevel}
        </Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="writing-card">
        <div className="writing-word-info">
          <TonedPinyin pinyin={word.pinyin} className="writing-pinyin" />
          <div className="writing-english">{word.english}</div>
          {chars.length > 1 && (
            <div className="writing-char-progress">
              {chars.map((c, i) => (
                <span key={i} className={`writing-char-dot${i < charIndex ? ' done' : i === charIndex ? ' current' : ''}`}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="writing-canvas-wrap">
          {status === 'loading' && <div className="writing-loading">Loading…</div>}
          <div
            ref={containerRef}
            className="writing-canvas"
            style={{ width: SIZE, height: SIZE }}
          />
        </div>

        {mistakes > 0 && status === 'writing' && (
          <p className="writing-mistakes">{mistakes} mistake{mistakes !== 1 ? 's' : ''} so far</p>
        )}

        {status === 'done' && (
          <button className="btn-primary writing-next-btn" onClick={nextChar}>
            {charIndex + 1 < chars.length
              ? `Next character (${chars[charIndex + 1]}) →`
              : index + 1 >= queue.length ? 'See results →' : 'Next word →'}
          </button>
        )}

        {status === 'writing' && (
          <p className="writing-hint">Trace each stroke in order</p>
        )}
      </div>
    </div>
  )
}
