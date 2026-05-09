import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadLevel } from '../data/vocabLoader'
import TonedPinyin from '../components/TonedPinyin'
import type { VocabItem } from '../types'

type QuestionType = 'char-to-english' | 'english-to-char' | 'listening' | 'pinyin' | 'reading'
type Stage = 'intro' | 'loading' | 'question' | 'feedback' | 'result'

interface Question {
  type: QuestionType
  word: VocabItem
  options: VocabItem[]
  audioUrl: string | null
  sentence: string | null       // reading type only
  pinyinOptions: string[] | null // pinyin type: 4 tone variants, correct = word.pinyin
}

// ── Pinyin tone variant generation ──────────────────────────────────────────
const TONE_MAP: Record<string, string[]> = {
  a: ['ā','á','ǎ','à'], e: ['ē','é','ě','è'],
  i: ['ī','í','ǐ','ì'], o: ['ō','ó','ǒ','ò'],
  u: ['ū','ú','ǔ','ù'], ü: ['ǖ','ǘ','ǚ','ǜ'], v: ['ǖ','ǘ','ǚ','ǜ'],
}

function syllableWithTone(syl: string, tone: number): string {
  const s = syl.replace('v', 'ü')
  let idx = s.search(/[ae]/)
  if (idx === -1) {
    const ou = s.indexOf('ou')
    idx = ou !== -1 ? ou : Math.max(s.lastIndexOf('i'), s.lastIndexOf('o'), s.lastIndexOf('u'), s.lastIndexOf('ü'))
  }
  if (idx < 0 || tone < 1 || tone > 4) return s
  return s.slice(0, idx) + (TONE_MAP[s[idx]]?.[tone - 1] ?? s[idx]) + s.slice(idx + 1)
}

function buildPinyinOptions(word: VocabItem): string[] | null {
  const numbered = (word.pinyinNumbered ?? '').toLowerCase()
  if (!numbered) return null
  const syllables = numbered.match(/[a-züv]+[1-5]/g)
  if (!syllables) return null

  const correctTone = parseInt(syllables[0].slice(-1))
  if (correctTone === 5) return null  // neutral tone — skip

  const base = syllables[0].replace(/[1-5]$/, '')
  const variants: string[] = []

  for (let t = 1; t <= 4; t++) {
    const newSyls = [...syllables]
    newSyls[0] = base + t
    const pinyin = newSyls.map(s => {
      const m = s.match(/([a-züv]+)([1-5])/)
      return m ? syllableWithTone(m[1], parseInt(m[2])) : s
    }).join(' ')
    variants.push(pinyin)
  }

  return shuffle(variants)
}

interface Answered {
  level: number
  correct: boolean
}

const TOTAL = 15
const TYPE_CYCLE: QuestionType[] = ['char-to-english', 'listening', 'english-to-char', 'pinyin', 'reading']

const TYPE_LABELS: Record<QuestionType, string> = {
  'char-to-english': 'Reading',
  'english-to-char': 'Translation',
  'listening':       'Listening',
  'pinyin':          'Tones',
  'reading':         'Reading in context',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function computeRecommended(answered: Answered[]): number {
  const byLevel: Record<number, { c: number; w: number }> = {}
  for (const a of answered) {
    if (!byLevel[a.level]) byLevel[a.level] = { c: 0, w: 0 }
    if (a.correct) byLevel[a.level].c++
    else byLevel[a.level].w++
  }
  let best = 1
  for (let l = 1; l <= 9; l++) {
    const s = byLevel[l]
    if (s && s.c >= s.w) best = l
  }
  return best
}

async function fetchAudio(word: VocabItem): Promise<string | null> {
  if (word.audio?.wordAudioUrl) return word.audio.wordAudioUrl
  try {
    const res = await fetch(`/api/tts?text=${encodeURIComponent(word.simplified)}`)
    if (!res.ok) return null
    return URL.createObjectURL(await res.blob())
  } catch { return null }
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner', 2: 'Beginner', 3: 'Elementary', 4: 'Elementary',
  5: 'Intermediate', 6: 'Intermediate', 7: 'Advanced', 8: 'Advanced', 9: 'Advanced',
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('intro')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState<Answered[]>([])
  const [recommended, setRecommended] = useState(1)
  const [audioPlaying, setAudioPlaying] = useState(false)

  const usedIds = useRef<Set<string>>(new Set())
  const levelCache = useRef<Record<number, VocabItem[]>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getLevelWords = useCallback(async (level: number): Promise<VocabItem[]> => {
    if (levelCache.current[level]) return levelCache.current[level]
    const words = await loadLevel(level)
    levelCache.current[level] = words
    return words
  }, [])

  function pickType(qIndex: number, word: VocabItem): QuestionType {
    const preferred = TYPE_CYCLE[qIndex % TYPE_CYCLE.length]
    if (preferred === 'reading' && !word.examples?.[0]?.chinese) return 'char-to-english'
    return preferred
  }

  async function buildQuestion(level: number, qIndex: number): Promise<Question | null> {
    const words = await getLevelWords(level)
    const eligible = words.filter(w => !usedIds.current.has(w.id) && w.english && w.simplified)
    if (eligible.length === 0) return null

    const word = shuffle(eligible)[0]
    usedIds.current.add(word.id)

    const type = pickType(qIndex, word)
    const pool = shuffle(words.filter(w => w.id !== word.id && w.english && w.simplified))
    const distractors = pool.slice(0, 3)
    const options = shuffle([word, ...distractors])

    let audioUrl: string | null = null
    if (type === 'listening') {
      audioUrl = await fetchAudio(word)
    }

    const sentence = type === 'reading' ? (word.examples?.[0]?.chinese ?? null) : null

    // For pinyin: generate tone variants; fall back to char-to-english if not possible
    let pinyinOptions: string[] | null = null
    let resolvedType = type
    if (type === 'pinyin') {
      pinyinOptions = buildPinyinOptions(word)
      if (!pinyinOptions) resolvedType = 'char-to-english'
    }

    // For listening: ensure all options have same character count as correct word
    let resolvedOptions = options
    if (type === 'listening') {
      const charCount = word.simplified.length
      const sameLength = shuffle(words.filter(w =>
        w.id !== word.id && w.english && w.simplified &&
        w.simplified.length === charCount
      ))
      if (sameLength.length >= 3) {
        resolvedOptions = shuffle([word, ...sameLength.slice(0, 3)])
      }
    }

    return { type: resolvedType, word, options: resolvedOptions, audioUrl, sentence, pinyinOptions }
  }

  async function loadQuestion(level: number, answeredSoFar: Answered[]) {
    setStage('loading')
    const q = await buildQuestion(level, answeredSoFar.length)
    if (!q) { finish(answeredSoFar); return }

    setQuestion(q)
    setSelected(null)
    setCurrentLevel(level)
    setStage('question')

    // auto-play audio
    if (q.type === 'listening' && q.audioUrl) {
      playAudio(q.audioUrl)
    }
  }

  function playAudio(url: string) {
    audioRef.current?.pause()
    const a = new Audio(url)
    audioRef.current = a
    setAudioPlaying(true)
    a.onended = () => setAudioPlaying(false)
    a.play().catch(() => setAudioPlaying(false))
  }

  function start() {
    usedIds.current = new Set()
    setAnswered([])
    loadQuestion(1, [])
  }

  function answer(optId: string) {
    if (!question || selected) return
    setSelected(optId)
    const correct = question.type === 'pinyin'
      ? optId === question.word.pinyin
      : optId === question.word.id
    const next: Answered[] = [...answered, { level: currentLevel, correct }]
    setAnswered(next)
    setStage('feedback')

    if (next.length >= TOTAL) {
      setTimeout(() => finish(next), 900)
    } else {
      const step = correct && currentLevel <= 3 ? 2 : 1
      const nextLevel = correct
        ? Math.min(9, currentLevel + step)
        : Math.max(1, currentLevel - 1)
      setTimeout(() => loadQuestion(nextLevel, next), 900)
    }
  }

  function finish(answeredList: Answered[]) {
    setRecommended(computeRecommended(answeredList))
    setStage('result')
  }

  function goToLevel(level: number) {
    localStorage.setItem('hsk-onboarded', '1')
    navigate(`/hsk/${level}`)
  }

  const progressPct = (answered.length / TOTAL) * 100

  // ── Intro ──────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="assessment-page">
        <div className="assessment-intro-card">
          <div className="assessment-icon">🎯</div>
          <h1>Level Assessment</h1>
          <p className="assessment-desc">
            Answer {TOTAL} questions across different skills and we'll recommend the right HSK level for you.
          </p>
          <ul className="assessment-bullets">
            <li>Reading — recognise characters and meanings</li>
            <li>Listening — identify words from audio</li>
            <li>Translation — English to Chinese</li>
            <li>Tones — pick the correct pinyin</li>
            <li>Context — understand words in sentences</li>
          </ul>
          <button className="btn-primary" onClick={start}>Start assessment →</button>
          <button className="assessment-skip" onClick={() => navigate('/welcome')}>
            Back to level picker
          </button>
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────
  if (stage === 'result') {
    const correct = answered.filter(a => a.correct).length
    const pct = Math.round((correct / answered.length) * 100)
    return (
      <div className="assessment-page">
        <div className="assessment-result-card">
          <div className="assessment-result-badge">HSK {recommended}</div>
          <h2>We recommend <strong>HSK {recommended}</strong></h2>
          <p className="assessment-result-tag">{LEVEL_LABELS[recommended]}</p>
          <p className="assessment-result-score">{correct} of {answered.length} correct ({pct}%)</p>
          <div className="assessment-result-actions">
            <button className="btn-primary" onClick={() => goToLevel(recommended)}>
              Start at HSK {recommended} →
            </button>
            {recommended < 9 && (
              <button className="btn-secondary" onClick={() => goToLevel(recommended + 1)}>
                Try HSK {recommended + 1} instead
              </button>
            )}
            {recommended > 1 && (
              <button className="btn-secondary" onClick={() => goToLevel(recommended - 1)}>
                Start easier at HSK {recommended - 1}
              </button>
            )}
          </div>
          <button className="assessment-skip" onClick={start}>Retake assessment</button>
        </div>
      </div>
    )
  }

  // ── Question ───────────────────────────────────────────────────────────
  const q = question

  return (
    <div className="assessment-page">
      <div className="assessment-topbar">
        <span className="assessment-counter">{answered.length + 1} / {TOTAL}</span>
        <span className="assessment-type-label">{q ? TYPE_LABELS[q.type] : ''}</span>
        <span className="assessment-level-badge">HSK {currentLevel}</span>
      </div>
      <div className="progress-bar-wrap" style={{ width: '100%', maxWidth: 480 }}>
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {stage === 'loading' || !q ? (
        <div className="assessment-loading">Loading question…</div>
      ) : (
        <>
          {/* Prompt card */}
          <div className="assessment-question-card">
            {q.type === 'char-to-english' && (
              <>
                <p className="assessment-prompt">What does this mean?</p>
                <div className="assessment-word">{q.word.simplified}</div>
                <TonedPinyin pinyin={q.word.pinyin} className="assessment-pinyin" />
              </>
            )}

            {q.type === 'english-to-char' && (
              <>
                <p className="assessment-prompt">Which character means…</p>
                <div className="assessment-english-prompt">
                  {q.word.english.split(';')[0]}
                </div>
              </>
            )}

            {q.type === 'listening' && (
              <>
                <p className="assessment-prompt">Which word did you hear?</p>
                {q.audioUrl ? (
                  <button
                    className={`assessment-play-btn${audioPlaying ? ' playing' : ''}`}
                    onClick={() => playAudio(q.audioUrl!)}
                  >
                    {audioPlaying ? '🔊 Playing…' : '▶ Play again'}
                  </button>
                ) : (
                  <p className="assessment-no-audio">No audio available — skip this one</p>
                )}
              </>
            )}

            {q.type === 'pinyin' && (
              <>
                <p className="assessment-prompt">How do you pronounce this?</p>
                <div className="assessment-word">{q.word.simplified}</div>
                <p className="assessment-pinyin-hint">{q.word.english.split(';')[0].split(',')[0]}</p>
              </>
            )}

            {q.type === 'reading' && q.sentence && (
              <>
                <p className="assessment-prompt">What does the highlighted word mean?</p>
                <div className="assessment-sentence">
                  {q.sentence.split(q.word.simplified).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="assessment-highlight">{q.word.simplified}</span>
                      )}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Options */}
          <div className="assessment-options">
            {q.type === 'pinyin' && q.pinyinOptions ? (
              q.pinyinOptions.map(pinyin => {
                let cls = 'assessment-option'
                if (selected) {
                  if (pinyin === q.word.pinyin) cls += ' opt-correct'
                  else if (pinyin === selected) cls += ' opt-wrong'
                  else cls += ' opt-dim'
                }
                return (
                  <button key={pinyin} className={cls} onClick={() => answer(pinyin)} disabled={!!selected}>
                    <TonedPinyin pinyin={pinyin} className="assessment-opt-pinyin" />
                  </button>
                )
              })
            ) : (
              q.options.map(opt => {
                let cls = 'assessment-option'
                if (selected) {
                  if (opt.id === q.word.id) cls += ' opt-correct'
                  else if (opt.id === selected) cls += ' opt-wrong'
                  else cls += ' opt-dim'
                }
                const label = q.type === 'char-to-english' || q.type === 'reading'
                  ? opt.english.split(';')[0].split(',')[0]
                  : opt.simplified
                return (
                  <button key={opt.id} className={cls} onClick={() => answer(opt.id)} disabled={!!selected}>
                    {q.type === 'english-to-char' || q.type === 'listening'
                      ? <span className="assessment-opt-char">{label}</span>
                      : label}
                  </button>
                )
              })
            )}
          </div>

          {/* Feedback bar */}
          {selected && (() => {
            const isCorrect = q.type === 'pinyin'
              ? selected === q.word.pinyin
              : selected === q.word.id
            return (
              <div className={`assessment-feedback ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
                {isCorrect
                  ? `✓ ${q.word.simplified} — ${q.word.pinyin} — ${q.word.english.split(';')[0]}`
                  : `✗ ${q.word.simplified} — ${q.word.pinyin} — ${q.word.english.split(';')[0]}`}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
