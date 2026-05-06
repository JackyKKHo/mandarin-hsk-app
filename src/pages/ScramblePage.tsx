import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePracticeWords } from '../hooks/usePracticeWords'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import type { VocabItem } from '../types'

type Stage = 'idle' | 'question' | 'feedback' | 'complete'

interface Tile { id: string; char: string }

interface Question {
  word: VocabItem
  tiles: Tile[]      // scrambled
  answer: string[]   // correct char order
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestion(word: VocabItem): Question | null {
  const ex = word.examples[0]
  if (!ex?.chinese) return null
  // Strip punctuation, split into characters
  const chars = [...ex.chinese.replace(/[。，！？、；：""''（）【】]/g, '')]
  if (chars.length < 3 || chars.length > 12) return null

  const tiles: Tile[] = chars.map((char, i) => ({ id: `${i}-${char}`, char }))
  // Ensure scrambled is different from correct
  let scrambled = shuffle(tiles)
  if (scrambled.map(t => t.char).join('') === chars.join('')) {
    scrambled = shuffle(tiles)
  }
  return { word, tiles: scrambled, answer: chars }
}

export default function ScramblePage() {
  const { level } = useParams<{ level: string }>()
  const { words: levelWords, title, backPath, loading } = usePracticeWords(level)
  const { review } = useSRS()
  const { recordStudy } = useStreak()

  const eligible = useMemo(
    () => levelWords.filter(w => {
      const q = buildQuestion(w)
      return q !== null
    }),
    [levelWords]
  )

  const [stage, setStage] = useState<Stage>('idle')
  const [sessionLength, setSessionLength] = useState<10 | 25 | 50 | null>(10)
  const [queue, setQueue] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [pool, setPool] = useState<Tile[]>([])      // unplaced tiles
  const [placed, setPlaced] = useState<Tile[]>([])  // user's answer so far
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [checked, setChecked] = useState(false)

  function start() {
    const qs = shuffle(eligible)
      .map(w => buildQuestion(w))
      .filter((q): q is Question => q !== null)
      .slice(0, sessionLength ?? undefined)
    if (qs.length === 0) return
    setQueue(qs); setIndex(0); setScore({ correct: 0, wrong: 0 }); setChecked(false)
    setPool(qs[0].tiles); setPlaced([]); setStage('question')
  }

  function loadQuestion(q: Question) {
    setPool(q.tiles); setPlaced([]); setChecked(false); setStage('question')
  }

  function placeTile(tile: Tile) {
    if (checked) return
    setPool(p => p.filter(t => t.id !== tile.id))
    setPlaced(p => [...p, tile])
  }

  function removeTile(tile: Tile) {
    if (checked) return
    setPlaced(p => p.filter(t => t.id !== tile.id))
    setPool(p => [...p, tile])
  }

  function check() {
    const q = queue[index]
    const correct = placed.map(t => t.char).join('') === q.answer.join('')
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    review(q.word.id, correct ? 'good' : 'again')
    setChecked(true); setStage('feedback')
  }

  function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) { recordStudy(); setStage('complete') }
    else { setIndex(nextIdx); loadQuestion(queue[nextIdx]) }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Sentence Scramble</h2>
          {loading ? <p className="empty-state">Loading…</p>
          : eligible.length < 3 ? <p className="empty-state">Not enough example sentences for this level.</p>
          : (
            <>
              <p className="practice-start-desc">
                Tap the characters in the correct order to reconstruct the sentence.
              </p>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {([10, 25, 50, null] as const).map(n => (
                    <button key={String(n)}
                      className={`quiz-length-btn${sessionLength === n ? ' active' : ''}`}
                      onClick={() => setSessionLength(n)}
                      disabled={n !== null && n > eligible.length}
                    >{n === null ? `All ${eligible.length}` : n}</button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={start}>
                Start {sessionLength ?? eligible.length} questions
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
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>{pct}%</div>
          <h2>Scramble complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Play again</button>
            <Link to={backPath} className="btn-secondary">Back</Link>
          </div>
        </div>
      </div>
    )
  }

  const q = queue[index]
  const progressPct = (index / queue.length) * 100
  const isCorrect = placed.map(t => t.char).join('') === q.answer.join('')
  const allPlaced = placed.length === q.answer.length

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={backPath} className="back-link" style={{ marginBottom: 0 }}>← {title}</Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>{' '}
          <span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Word hint */}
      <div className="scramble-hint-card">
        <div className="scramble-hint-word">{q.word.simplified}</div>
        <TonedPinyin pinyin={q.word.pinyin} className="scramble-hint-pinyin" />
        <div className="scramble-hint-english">{q.word.english}</div>
        <AudioButton text={q.word.simplified} audioUrl={q.word.audio.wordAudioUrl} label="Play" />
      </div>

      {/* Answer slots */}
      <div className="scramble-answer">
        {q.answer.map((_, i) => (
          <button
            key={i}
            className={`scramble-slot${placed[i] ? ' filled' : ''}${checked && placed[i] ? (isCorrect ? ' slot-correct' : ' slot-wrong') : ''}`}
            onClick={() => placed[i] && removeTile(placed[i])}
            disabled={!placed[i] || checked}
          >
            {placed[i]?.char ?? ''}
          </button>
        ))}
      </div>

      {/* Tile pool */}
      <div className="scramble-pool">
        {pool.map(tile => (
          <button key={tile.id} className="scramble-tile" onClick={() => placeTile(tile)}>
            {tile.char}
          </button>
        ))}
      </div>

      {/* Actions */}
      {!checked ? (
        <div className="scramble-actions">
          <button className="btn-secondary" onClick={() => loadQuestion(q)} disabled={placed.length === 0}>
            Reset
          </button>
          <button className="btn-primary" onClick={check} disabled={!allPlaced}>
            Check
          </button>
        </div>
      ) : (
        <div className={`quiz-feedback ${isCorrect ? 'qf-correct' : 'qf-wrong'}`}>
          <span>
            {isCorrect ? '✓ Correct!' : `✗ Answer: ${q.answer.join('')}`}
          </span>
          {!isCorrect && (
            <TonedPinyin pinyin={q.word.examples[0].pinyin} className="qf-pinyin" />
          )}
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
