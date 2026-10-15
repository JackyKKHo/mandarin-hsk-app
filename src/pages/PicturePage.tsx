import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import type { VocabItem } from '../types'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import MissedWords from '../components/MissedWords'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import { usePracticeWords } from '../hooks/usePracticeWords'
import { useVocab } from '../hooks/useVocab'
import { useWordImages, type ImageMap } from '../data/images'
import { TOPICS, parseTopics } from '../data/topics'
import { toLevel } from '../data/levels'
import { matchAnswer, type MatchResult } from '../lib/answerMatch'

type Answer = 'choose' | 'type'
type Stage = 'idle' | 'question' | 'feedback' | 'complete'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Three wrong answers, from the same topic where possible so the picture has to be read */
function buildOptions(word: VocabItem, pool: VocabItem[], images: ImageMap): VocabItem[] {
  const tags = new Set(word.tags ?? [])
  // Words sharing this photo (饭店 / 饭馆) would both be right, so they can't be wrong options
  const src = images[word.id]?.src
  const others = pool.filter(w => w.id !== word.id && w.simplified !== word.simplified && !(src && images[w.id]?.src === src))
  const sameTopic = shuffle(others.filter(w => w.tags?.some(t => tags.has(t))))
  const rest = shuffle(others.filter(w => !w.tags?.some(t => tags.has(t))))
  const picked: VocabItem[] = []
  const seen = new Set([word.simplified])
  for (const w of [...sameTopic, ...rest]) {
    if (seen.has(w.simplified)) continue
    seen.add(w.simplified)
    picked.push(w)
    if (picked.length === 3) break
  }
  return shuffle([word, ...picked])
}

const pictured = (words: VocabItem[], images: ImageMap) => words.filter(w => images[w.id])

export default function PicturePage() {
  const { level } = useParams<{ level: string }>()
  const [params, setParams] = useSearchParams()
  const { review } = useSRS()
  const { recordStudy } = useStreak()
  const { words, title, backPath, loading: wordsLoading } = usePracticeWords(level)
  const { images, loading: imagesLoading } = useWordImages()
  const loading = wordsLoading || imagesLoading

  // Topic chips on the start card: picture topics in this level (or all levels), before filtering
  const browsable = level === 'all' || /^\d+$/.test(level ?? '')
  const { words: unfiltered } = useVocab(level === 'all' ? undefined : toLevel(level))
  const selectedTopics = parseTopics(params.get('topics'))
  const topicChips = useMemo(() => {
    if (!browsable) return []
    const counts = new Map<string, number>()
    for (const w of pictured(unfiltered, images)) for (const t of w.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
    return TOPICS.filter(t => t.pictures && (counts.has(t.id) || selectedTopics.includes(t.id)))
      .map(t => ({ ...t, count: counts.get(t.id) ?? 0 }))
  }, [browsable, unfiltered, images, selectedTopics])

  function toggleTopic(id: string) {
    const next = selectedTopics.includes(id) ? selectedTopics.filter(t => t !== id) : [...selectedTopics, id]
    const p = new URLSearchParams(params)
    if (next.length) p.set('topics', next.join(','))
    else p.delete('topics')
    setParams(p, { replace: true })
  }

  const pool = useMemo(() => pictured(words, images), [words, images])

  const [stage, setStage] = useState<Stage>('idle')
  const [answerMode, setAnswerMode] = useState<Answer>('choose')
  const [length, setLength] = useState(10)
  const [queue, setQueue] = useState<VocabItem[]>([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState<VocabItem[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [missed, setMissed] = useState<VocabItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {})

  const word = queue[index]
  const image = word ? images[word.id] : null

  // Fetch the next picture early so it appears instantly
  useEffect(() => {
    const nextWord = queue[index + 1]
    const src = nextWord && images[nextWord.id]?.src
    if (src) new Image().src = src
  }, [queue, index, images])

  useEffect(() => {
    if (stage === 'question' && answerMode === 'type') inputRef.current?.focus()
  }, [stage, answerMode, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function start() {
    const q = shuffle(pool).slice(0, length)
    if (!q.length) return
    setQueue(q)
    setIndex(0)
    setScore({ correct: 0, wrong: 0 })
    setMissed([])
    showQuestion(q[0])
  }

  function showQuestion(w: VocabItem) {
    setChosen(null)
    setTyped('')
    setResult(null)
    // Distractors come from every word in the deck, not only pictured ones
    setOptions(buildOptions(w, words, images))
    setStage('question')
  }

  function finish(res: MatchResult) {
    setResult(res)
    const correct = res !== 'wrong'
    setScore(s => correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 })
    if (!correct) setMissed(m => [...m, word])
    review(word.id, correct ? 'good' : 'again')
    setStage('feedback')
  }

  function choose(id: string) {
    if (stage !== 'question') return
    setChosen(id)
    finish(id === word.id ? 'exact' : 'wrong')
  }

  function submitTyped(e?: React.FormEvent) {
    e?.preventDefault()
    if (stage !== 'question' || !typed.trim()) return
    // Any word shown with this same photo is accepted too
    const src = images[word.id]?.src
    const accepted = [word, ...words.filter(w => w.id !== word.id && src && images[w.id]?.src === src)]
    const results = accepted.map(w => matchAnswer(typed, w))
    finish(results.includes('exact') ? 'exact' : results.includes('toneless') ? 'toneless' : 'wrong')
  }

  function next() {
    const i = index + 1
    if (i >= queue.length) {
      recordStudy()
      setStage('complete')
    } else {
      setIndex(i)
      showQuestion(queue[i])
    }
  }

  // A picture that fails to load (moved on Commons, offline) is skipped, not scored
  function skipBroken() {
    const q = queue.filter((_, i) => i !== index)
    setQueue(q)
    if (index >= q.length) {
      if (score.correct + score.wrong > 0) { recordStudy(); setStage('complete') }
      else setStage('idle')
    } else {
      showQuestion(q[index])
    }
  }

  keyRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return
    if (stage === 'feedback' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next() }
    else if (stage === 'question' && answerMode === 'choose') {
      const n = parseInt(e.key) - 1
      if (n >= 0 && n < options.length) choose(options[n].id)
    }
  }

  if (stage === 'idle') {
    return (
      <div className="practice-page">
        <Link to={backPath} className="back-link">← {title}</Link>
        <div className="practice-start-card">
          <div className="practice-start-level">{title}</div>
          <h2>Picture Quiz</h2>
          <p className="picture-intro">See a photo, name it in Chinese.</p>
          {topicChips.length > 0 && (
            <div className="quiz-option-group">
              <span className="quiz-option-label">Topics</span>
              <div className="topic-chips picture-topic-chips">
                {topicChips.map(t => {
                  const on = selectedTopics.includes(t.id)
                  return (
                    <button key={t.id} className={`topic-chip${on ? ' selected' : ''}`} aria-pressed={on} onClick={() => toggleTopic(t.id)}>
                      {t.label} <span className="topic-chip-count">{t.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : pool.length === 0 ? (
            <p className="empty-state">
              No pictures for these words yet.
              {level !== 'all' && browsable && <> Try <Link to={`/picture/all${params.toString() ? `?${params}` : ''}`}>all levels</Link>.</>}
            </p>
          ) : (
            <>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Answer by</span>
                <div className="quiz-mode-picker">
                  <button className={`quiz-mode-btn${answerMode === 'choose' ? ' active' : ''}`} onClick={() => setAnswerMode('choose')}>Multiple choice</button>
                  <button className={`quiz-mode-btn${answerMode === 'type' ? ' active' : ''}`} onClick={() => setAnswerMode('type')}>Typing</button>
                </div>
              </div>
              <div className="quiz-option-group">
                <span className="quiz-option-label">Questions</span>
                <div className="quiz-length-picker">
                  {[...[10, 20, 50].filter(n => n < pool.length), pool.length].map(n => (
                    <button key={n} className={`quiz-length-btn${Math.min(length, pool.length) === n ? ' active' : ''}`} onClick={() => setLength(n)}>
                      {n === pool.length ? `All ${n}` : n}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={start}>
                Start {Math.min(length, pool.length)} pictures
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'complete') {
    const total = score.correct + score.wrong
    const pct = total ? Math.round((score.correct / total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>{pct}%</div>
          <h2>Picture quiz complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={start}>Play again</button>
            <button className="btn-secondary" onClick={() => setStage('idle')}>Change settings</button>
            <Link to={backPath} className="btn-secondary">Browse words</Link>
          </div>
          <MissedWords title="Missed words" words={missed} />
        </div>
      </div>
    )
  }

  if (!word || !image) return null
  const correct = result !== null && result !== 'wrong'

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <Link to={backPath} className="back-link" style={{ marginBottom: 0 }}>← {title}</Link>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>{' '}<span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
      </div>

      <figure className="picture-card">
        <img key={image.src} src={image.src} alt="What is this in Chinese?" onError={skipBroken} />
        <figcaption>
          Photo: <a href={image.page} target="_blank" rel="noopener noreferrer">{image.author}</a>, {image.license}, via Wikimedia Commons
        </figcaption>
      </figure>

      {answerMode === 'choose' ? (
        <div className="quiz-options picture-options">
          {options.map((opt, i) => {
            let cls = 'quiz-option'
            if (stage === 'feedback') {
              if (opt.id === word.id) cls += ' opt-correct'
              else if (opt.id === chosen) cls += ' opt-wrong'
              else cls += ' opt-dim'
            }
            return (
              <button key={opt.id} className={cls} onClick={() => choose(opt.id)} disabled={stage !== 'question'}>
                <kbd className="quiz-key">{i + 1}</kbd>
                <span className="opt-chinese">{opt.simplified}</span>
                {stage === 'feedback' && <TonedPinyin pinyin={opt.pinyin} className="opt-pinyin" />}
              </button>
            )
          })}
        </div>
      ) : (
        <form className="picture-type" onSubmit={submitTyped}>
          <input
            ref={inputRef}
            className="search-input"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="汉字 or pinyin (píngguǒ / ping2guo3)"
            aria-label="Your answer"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            lang="zh"
            disabled={stage !== 'question'}
          />
          {stage === 'question' && (
            <div className="picture-type-actions">
              <button type="submit" className="btn-primary" disabled={!typed.trim()}>Check</button>
              <button type="button" className="btn-secondary" onClick={() => finish('wrong')}>Show answer</button>
            </div>
          )}
        </form>
      )}

      {stage === 'feedback' && (
        <div className={`quiz-feedback ${correct ? 'qf-correct' : 'qf-wrong'}`}>
          <span>
            {result === 'exact' && '✓ Correct!'}
            {result === 'toneless' && '✓ Right word — check the tones:'}
            {result === 'wrong' && '✗ It was:'}
            {' '}<span className="picture-answer-han">{word.simplified}</span> — {word.english}
          </span>
          <span className="picture-answer-row">
            <TonedPinyin pinyin={word.pinyin} className="qf-pinyin" />
            <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label={`Play ${word.simplified}`} />
          </span>
          <button className="btn-next" onClick={next}>
            {index + 1 >= queue.length ? 'See results →' : 'Next →'} <kbd>Enter</kbd>
          </button>
        </div>
      )}
    </div>
  )
}
