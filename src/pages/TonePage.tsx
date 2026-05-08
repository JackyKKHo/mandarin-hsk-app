import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePracticeWords } from '../hooks/usePracticeWords'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import type { VocabItem } from '../types'

type Stage = 'idle' | 'question' | 'feedback' | 'complete'

// --- Pinyin tone utilities ---

const TONE_TABLE: Record<string, string[]> = {
  a: ['ā','á','ǎ','à','a'],
  e: ['ē','é','ě','è','e'],
  i: ['ī','í','ǐ','ì','i'],
  o: ['ō','ó','ǒ','ò','o'],
  u: ['ū','ú','ǔ','ù','u'],
  v: ['ǖ','ǘ','ǚ','ǜ','ü'],
}

function applyTone(base: string, tone: number): string {
  if (tone === 5 || tone === 0) return base.replace(/v/g, 'ü')
  const idx = tone - 1
  const b = base.toLowerCase()
  if (b.includes('a')) return base.replace(/a/i, TONE_TABLE.a[idx]).replace(/v/g, 'ü')
  if (b.includes('e')) return base.replace(/e/i, TONE_TABLE.e[idx]).replace(/v/g, 'ü')
  if (b.includes('ou')) return base.replace(/o/i, TONE_TABLE.o[idx]).replace(/v/g, 'ü')
  for (let i = base.length - 1; i >= 0; i--) {
    const c = base[i].toLowerCase()
    if (TONE_TABLE[c]) {
      return base.slice(0, i) + TONE_TABLE[c][idx] + base.slice(i + 1).replace(/v/g, 'ü')
    }
  }
  return base.replace(/v/g, 'ü')
}

export function numberedToToned(pinyinNumbered: string): string {
  return pinyinNumbered.trim().split(/\s+/).map(syl => {
    const m = syl.match(/^([a-zü:v]+)([0-5])$/i)
    if (!m) return syl
    return applyTone(m[1], parseInt(m[2]))
  }).join(' ')
}

function makeToneDistractors(pinyinNumbered: string): string[] {
  const syllables = pinyinNumbered.trim().split(/\s+/)
  const seen = new Set<string>([pinyinNumbered])
  const result: string[] = []
  let attempts = 0
  while (result.length < 3 && attempts < 60) {
    attempts++
    const variant = syllables.map(s => {
      const m = s.match(/^([a-zü:v]+)([0-5])$/i)
      if (!m) return s
      const t = parseInt(m[2])
      const others = [1, 2, 3, 4].filter(x => x !== t)
      return m[1] + others[Math.floor(Math.random() * others.length)]
    }).join(' ')
    if (!seen.has(variant)) { seen.add(variant); result.push(variant) }
  }
  return result
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TonePage() {
  const { level } = useParams<{ level: string }>()
  const { words: levelWords, title, backPath, loading } = usePracticeWords(level)
  const { review } = useSRS()
  const { recordStudy } = useStreak()

  const eligible = levelWords.filter(w => w.pinyinNumbered)

  const [stage, setStage] = useState<Stage>('idle')
  const [sessionLength, setSessionLength] = useState<10 | 25 | 50 | 100>(25)
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function buildOptions(word: VocabItem): string[] {
    return shuffle([word.pinyinNumbered, ...makeToneDistractors(word.pinyinNumbered)])
  }

  async function playWord(word: VocabItem) {
    audioRef.current?.pause()
    const url = word.audio.wordAudioUrl
    if (url) {
      const a = new Audio(url); audioRef.current = a; a.play().catch(() => {})
      return
    }
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(word.simplified)}`)
      if (!res.ok) return
      const objUrl = URL.createObjectURL(await res.blob())
      const a = new Audio(objUrl); audioRef.current = a; a.play().catch(() => {})
    } catch {}
  }

  async function start() {
    const q = shuffle(eligible).slice(0, sessionLength)
    setQueue(q); setIndex(0); setScore({ correct: 0, wrong: 0 })
    setSelected(null); setOptions(buildOptions(q[0])); setStage('question')
    await playWord(q[0])
  }

  function answer(opt: string) {
    if (selected) return
    setSelected(opt)
    const correct = opt === queue[index].pinyinNumbered
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    review(queue[index].id, correct ? 'good' : 'again')
    setStage('feedback')
  }

  async function next() {
    const nextIdx = index + 1
    if (nextIdx >= queue.length) { recordStudy(); setStage('complete') }
    else {
      setIndex(nextIdx); setSelected(null)
      setOptions(buildOptions(queue[nextIdx])); setStage('question')
      await playWord(queue[nextIdx])
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Tone Trainer</h2>
          {loading ? <p className="empty-state">Loading…</p>
          : eligible.length === 0 ? <p className="empty-state">No tone data for this level.</p>
          : (
            <>
              <p className="practice-start-desc">
                Listen to the audio and pick the correct tones for each word.
              </p>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {([10, 25, 50, 100] as const).map(n => (
                    <button key={String(n)}
                      className={`quiz-length-btn${sessionLength === n ? ' active' : ''}`}
                      onClick={() => setSessionLength(n)}
                      disabled={n > eligible.length}
                    >{n === 100 ? (eligible.length <= 100 ? `All ${eligible.length}` : '100') : n}</button>
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
          <h2>Tone trainer complete!</h2>
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

  const word = queue[index]
  const progressPct = (index / queue.length) * 100

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

      <div className="tone-prompt">
        <div className="tone-prompt-chinese">{word.simplified}</div>
        <button className="tone-play-btn" onClick={() => playWord(word)}>🔊 Play again</button>
        <p className="tone-prompt-hint">Which tones did you hear?</p>
      </div>

      <div className="tone-options">
        {options.map(opt => {
          let cls = 'tone-option'
          if (selected) {
            if (opt === word.pinyinNumbered) cls += ' opt-correct'
            else if (opt === selected) cls += ' opt-wrong'
            else cls += ' opt-dim'
          }
          return (
            <button key={opt} className={cls} onClick={() => answer(opt)} disabled={!!selected}>
              {numberedToToned(opt)}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`quiz-feedback ${selected === word.pinyinNumbered ? 'qf-correct' : 'qf-wrong'}`}>
          <span>
            {selected === word.pinyinNumbered
              ? `✓ ${numberedToToned(word.pinyinNumbered)} — ${word.english}`
              : `✗ It was: ${numberedToToned(word.pinyinNumbered)} — ${word.english}`}
          </span>
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
