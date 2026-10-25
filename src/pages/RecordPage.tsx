import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import AudioButton from '../components/AudioButton'
import { useSEO } from '../hooks/useSEO'
import { RECORD_PHRASES, TOPICS, pickDailyPhrase } from '../data/recordPhrases'
import { RECORD_STORIES, STORY_LEVELS, sentenceScore, type RecordStory } from '../data/recordStories'
import { loadLevel } from '../data/vocabLoader'
import type { Example, VocabItem } from '../types'
import Icon from '../components/Icon'
import { markSpokenToday } from '../lib/todayPlan'
import { playAudio } from '../audio'

type Source = 'daily' | 'story' | 'bank' | 'hsk' | 'custom' | 'link'
type Status = 'idle' | 'recording' | 'analyzing' | 'done' | 'error'
type Check = 'ok' | 'miss' | 'unknown'

interface PitchPoint { t: number; s: number }

type SandhiRule = 'third' | 'yi' | 'bu'

const SANDHI_TITLE: Record<SandhiRule, string> = {
  third: 'Third-tone sandhi: a 3rd tone before another 3rd tone is said as a 2nd tone',
  yi: '一 changes tone: 2nd before a 4th tone, 4th before tones 1–3, but 1st on its own, at the end, or in numbers and dates',
  bu: '不 changes tone: 2nd before a 4th tone, and light in the middle of 是不是 / 看不见 patterns',
}

interface CharScore {
  char: string
  // sandhi: tone changed from citationTone by a tone-change rule (3-3, 一 or 不); sandhiNote says how
  // neutral: light syllable, any pitch accepted; halfThird: 3rd tone said low without the rise
  expected: {
    pinyin: string; base: string; initial: string; final: string; tone: number
    citationTone?: number; sandhi?: boolean; sandhiRule?: SandhiRule; sandhiNote?: string; neutral?: boolean; halfThird?: boolean
  }
  heard: { char: string | null; pinyin: string; base: string; initial: string; final: string; toneFromText: number | null }
  scores: { initial: Check; final: Check; tone: Check }
  detectedTone: number | null
  timing: { tStart: number; tEnd: number }
  pitch?: PitchPoint[]
}

interface ScoreResponse {
  transcript: string
  chars: CharScore[]
  summary?: { perfect: boolean; toneMisses: number; soundMisses: number }
  warning?: string
}

// Latest attempt per target sentence, so going back to a sentence shows its result again
interface Attempt { result: ScoreResponse; audio: Blob }

const HSK_LEVELS = [1, 2, 3, 4, 5, 6]
const STORY_BEST_KEY = 'record-story-best'

const SOURCE_LABEL: Record<Source, string> = {
  link: 'From link', daily: 'Daily', story: 'Stories', bank: 'Phrases', hsk: 'HSK', custom: 'Custom',
}

function loadStoryBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORY_BEST_KEY) ?? '{}') } catch { return {} }
}

function downmixToMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0).slice()
  const ch0 = buffer.getChannelData(0)
  const ch1 = buffer.getChannelData(1)
  const out = new Float32Array(ch0.length)
  for (let i = 0; i < ch0.length; i++) out[i] = (ch0[i] + ch1[i]) / 2
  return out
}

function resample(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (inRate === outRate) return input
  const ratio = inRate / outRate
  const outLen = Math.floor(input.length / ratio)
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio
    const i0 = Math.floor(idx)
    const i1 = Math.min(i0 + 1, input.length - 1)
    const frac = idx - i0
    out[i] = input[i0] * (1 - frac) + input[i1] * frac
  }
  return out
}

function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const buf = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buf)
  const w = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)) }
  w(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  w(8, 'WAVE')
  w(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  w(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  let off = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    off += 2
  }
  return new Uint8Array(buf)
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

// 'hao3' → 'hǎo'; the scorer sends numbered pinyin (0 = neutral)
const MARKS: Record<string, string> = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' }
function toneMarked(numbered: string): string {
  const m = numbered.match(/^([a-züv]+)(\d)?$/i)
  if (!m) return numbered
  const base = m[1].replace(/v/g, 'ü')
  const tone = Number(m[2] ?? 0)
  if (tone < 1 || tone > 4) return base
  const idx = /[ae]/.test(base) ? base.search(/[ae]/) : base.includes('ou') ? base.indexOf('o') : base.search(/[iouü](?!.*[iouü])/)
  if (idx < 0) return base
  return base.slice(0, idx) + MARKS[base[idx]][tone - 1] + base.slice(idx + 1)
}

const isHan = (c: string) => /\p{Script=Han}/u.test(c)
const anyMiss = (c: CharScore) => c.scores.initial === 'miss' || c.scores.final === 'miss' || c.scores.tone === 'miss'
const scoreClass = (pct: number | null) => pct == null ? '' : pct >= 85 ? ' good' : pct >= 60 ? ' fair' : ' low'

// Same palette as --tone-1..4 / --tone-0 in index.css (literal hex: SVG attributes can't take var())
const TONE_COLOR: Record<number, string> = { 1: '#c0392b', 2: '#d35400', 3: '#27ae60', 4: '#2471a3', 0: '#95a5a6' }
const TONE_SHAPE: Record<number, string> = { 1: '‾', 2: '/', 3: 'v', 4: '\\', 0: '·' }

export default function RecordPage() {
  useSEO({ title: 'Record & Score', description: 'Read Mandarin phrases and short stories aloud and get instant AI feedback on tones, initials, and finals.', path: '/record' })

  const [params] = useSearchParams()
  const linkZh = params.get('zh') ?? ''
  const linkPinyin = params.get('pinyin') ?? ''
  const linkEn = params.get('en') ?? ''
  const linkTarget = linkZh ? { zh: linkZh, pinyin: linkPinyin, en: linkEn || undefined } : null

  const [source, setSource] = useState<Source>(linkTarget ? 'link' : 'daily')
  const [topic, setTopic] = useState(TOPICS[0].id)
  const [hskLevel, setHskLevel] = useState(1)
  const [hskExamples, setHskExamples] = useState<Example[]>([])
  const [hskIdx, setHskIdx] = useState(0)
  const [customZh, setCustomZh] = useState('')
  const [customPinyin, setCustomPinyin] = useState('')
  const [storyLevel, setStoryLevel] = useState(1)
  const [story, setStory] = useState<RecordStory | null>(null)
  const [lineIdx, setLineIdx] = useState(0)
  const [storyBest, setStoryBest] = useState<Record<string, number>>(loadStoryBest)
  const [showPassage, setShowPassage] = useState(false)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Record<number, string>>({})
  const [loadingExpl, setLoadingExpl] = useState<Record<number, boolean>>({})
  const [supported, setSupported] = useState(true)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recStartRef = useRef<number>(0)
  const [recMs, setRecMs] = useState(0)

  const daily = useMemo(() => pickDailyPhrase(), [])
  const bankPhrases = useMemo(() => RECORD_PHRASES.filter(p => p.topic === topic), [topic])
  const [bankIdx, setBankIdx] = useState(0)

  const target = useMemo<{ zh: string; pinyin: string; en?: string } | null>(() => {
    if (source === 'link') return linkTarget
    if (source === 'daily') return { zh: daily.zh, pinyin: daily.pinyin, en: daily.en }
    if (source === 'story') return story ? story.sentences[lineIdx] : null
    if (source === 'bank') {
      const p = bankPhrases[bankIdx % Math.max(1, bankPhrases.length)]
      return p ? { zh: p.zh, pinyin: p.pinyin, en: p.en } : null
    }
    if (source === 'hsk') {
      const ex = hskExamples[hskIdx]
      return ex ? { zh: ex.chinese, pinyin: ex.pinyin, en: ex.english } : null
    }
    return customZh.trim() ? { zh: customZh.trim(), pinyin: customPinyin.trim() } : null
  // linkTarget is rebuilt each render from the URL; its fields are the real dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, linkZh, linkPinyin, linkEn, daily, story, lineIdx, bankPhrases, bankIdx, hskExamples, hskIdx, customZh, customPinyin])

  const attempt = target ? attempts[target.zh] : undefined
  const result = attempt?.result ?? null

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MediaRecorder) setSupported(false)
  }, [])

  // New sentence or new result: open the first flagged character
  useEffect(() => {
    const first = result?.chars.findIndex(anyMiss) ?? -1
    setSelected(first >= 0 ? first : null)
    setExpanded({})
    setError('')
  }, [target?.zh, result])

  useEffect(() => {
    if (source !== 'hsk') return
    let cancelled = false
    loadLevel(hskLevel).then((words: VocabItem[]) => {
      if (cancelled) return
      const examples = words
        .flatMap(w => w.examples ?? [])
        .filter(e => e.chinese && e.pinyin && [...e.chinese].filter(isHan).length <= 15)
      const seed = hskLevel * 7919
      const shuffled = examples.map((e, i) => ({ e, k: (Math.sin(seed + i) + 1) / 2 })).sort((a, b) => a.k - b.k).map(x => x.e)
      setHskExamples(shuffled.slice(0, 30))
      setHskIdx(0)
    })
    return () => { cancelled = true }
  }, [source, hskLevel])

  useEffect(() => {
    if (status !== 'recording') { setRecMs(0); return }
    const id = window.setInterval(() => setRecMs(Date.now() - recStartRef.current), 100)
    return () => window.clearInterval(id)
  }, [status])

  // Story progress: per-sentence scores, and the average once every sentence has one
  const storyScores = story ? story.sentences.map(s => {
    const a = attempts[s.zh]
    return a ? sentenceScore(a.result.chars) : null
  }) : []
  const storyDone = story != null && storyScores.every(s => s != null)
  const storyAvg = storyDone ? Math.round(storyScores.reduce<number>((a, b) => a + (b ?? 0), 0) / storyScores.length) : null

  useEffect(() => {
    if (!story || storyAvg == null || (storyBest[story.id] ?? -1) >= storyAvg) return
    const next = { ...storyBest, [story.id]: storyAvg }
    setStoryBest(next)
    try { localStorage.setItem(STORY_BEST_KEY, JSON.stringify(next)) } catch { /* private mode */ }
  }, [story, storyAvg, storyBest])

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      const recorded = target
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => { void finishRecording(recorded) }
      mr.start()
      recStartRef.current = Date.now()
      setStatus('recording')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Microphone unavailable'
      setError(`Could not start microphone: ${msg}`)
      setStatus('error')
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  async function finishRecording(recorded: typeof target) {
    if (!recorded) { setStatus('idle'); return }
    setStatus('analyzing')
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      if (blob.size < 1000) { setError('Recording too short — try again.'); setStatus('error'); return }
      const buf = await blob.arrayBuffer()
      const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      const ctx = new AC()
      const audio = await ctx.decodeAudioData(buf.slice(0))
      await ctx.close()
      const mono = downmixToMono(audio)
      const resampled = resample(mono, audio.sampleRate, 16000)
      const wav = encodeWav(resampled, 16000)
      const b64 = toBase64(wav)

      const res = await fetch('/api/score-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wav: b64, target: recorded.zh }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scoring failed')
      setAttempts(prev => ({ ...prev, [recorded.zh]: { result: data, audio: blob } }))
      setStatus('done')
      markSpokenToday()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      setError(msg)
      setStatus('error')
    }
  }

  async function fetchExplanation(idx: number, c: CharScore) {
    if (expanded[idx]) { setExpanded(prev => ({ ...prev, [idx]: '' })); return }
    setLoadingExpl(prev => ({ ...prev, [idx]: true }))
    try {
      const res = await fetch('/api/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ char: c.char, expected: c.expected, heard: c.heard, scores: c.scores, detectedTone: c.detectedTone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Explanation failed')
      setExpanded(prev => ({ ...prev, [idx]: data.explanation }))
    } catch (e) {
      setExpanded(prev => ({ ...prev, [idx]: e instanceof Error ? e.message : 'Could not fetch explanation' }))
    } finally {
      setLoadingExpl(prev => ({ ...prev, [idx]: false }))
    }
  }

  const busy = status === 'recording' || status === 'analyzing'
  const hasNext = source === 'bank' || source === 'hsk' || (source === 'story' && story != null && lineIdx < story.sentences.length - 1)

  function nextPhrase() {
    if (source === 'bank') setBankIdx(i => (i + 1) % Math.max(1, bankPhrases.length))
    else if (source === 'hsk') setHskIdx(i => (i + 1) % Math.max(1, hskExamples.length))
    else if (source === 'story' && story) setLineIdx(i => Math.min(i + 1, story.sentences.length - 1))
  }

  function openStory(s: RecordStory | null) {
    setStory(s)
    setLineIdx(0)
    setStatus('idle')
  }

  function chooseSource(s: Source) {
    if (busy) return
    setSource(s)
    setStatus('idle')
  }

  if (!supported) {
    return (
      <div className="browser-page">
        <AppHeader />
        <div className="practice-page">
          <Link to="/guides" className="back-link">← Guides</Link>
          <div className="record-not-supported">
            Recording is not supported on this browser. Try Chrome, Edge, or Safari on a recent device.
          </div>
        </div>
      </div>
    )
  }

  const sentencePct = result ? sentenceScore(result.chars) : null
  const sel = result && selected != null ? result.chars[selected] : null
  const weakest = storyDone ? storyScores.indexOf(Math.min(...storyScores.map(s => s ?? 100))) : -1
  const nextStory = story ? RECORD_STORIES[(RECORD_STORIES.indexOf(story) + 1) % RECORD_STORIES.length] : null

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="practice-page record-page">
        <div className="record-head">
          <h1 className="record-title">Record & Score</h1>
          <Link to="/guides" className="record-head-link">Guides</Link>
        </div>

        <div className="record-source-tabs" role="tablist">
          {([...(linkTarget ? ['link'] : []), 'daily', 'story', 'bank', 'hsk', 'custom'] as Source[]).map(s => (
            <button key={s} role="tab" aria-selected={source === s} className={`record-tab${source === s ? ' active' : ''}`} onClick={() => chooseSource(s)} disabled={busy && source !== s}>
              {SOURCE_LABEL[s]}
            </button>
          ))}
        </div>

        {source === 'bank' && (
          <div className="record-topic-row">
            {TOPICS.map(t => (
              <button key={t.id} className={`record-topic-chip${topic === t.id ? ' active' : ''}`} onClick={() => { setTopic(t.id); setBankIdx(0) }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {source === 'hsk' && (
          <div className="record-topic-row">
            {HSK_LEVELS.map(l => (
              <button key={l} className={`record-topic-chip${hskLevel === l ? ' active' : ''}`} onClick={() => setHskLevel(l)}>
                HSK {l}
              </button>
            ))}
          </div>
        )}

        {source === 'custom' && (
          <div className="record-custom">
            <textarea
              className="record-custom-input"
              placeholder="Type or paste a Chinese phrase (max 60 characters)…"
              value={customZh}
              onChange={e => setCustomZh(e.target.value.slice(0, 60))}
              rows={2}
            />
            <input
              className="record-custom-pinyin"
              placeholder="Optional: paste pinyin (with tone marks)"
              value={customPinyin}
              onChange={e => setCustomPinyin(e.target.value)}
            />
          </div>
        )}

        {source === 'story' && !story && (
          <>
            <div className="record-topic-row">
              {STORY_LEVELS.map(l => (
                <button key={l} className={`record-topic-chip${storyLevel === l ? ' active' : ''}`} onClick={() => setStoryLevel(l)}>
                  HSK {l}
                </button>
              ))}
            </div>
            <div className="record-story-list">
              {RECORD_STORIES.filter(s => s.level === storyLevel).map(s => (
                <button key={s.id} className="record-story-card" onClick={() => openStory(s)}>
                  <span className="record-story-zh">{s.title}</span>
                  <span className="record-story-en">{s.titleEn}</span>
                  <span className="record-story-meta">
                    {s.sentences.length} sentences
                    {storyBest[s.id] != null && <span className={`record-pct${scoreClass(storyBest[s.id])}`}>best {storyBest[s.id]}%</span>}
                  </span>
                </button>
              ))}
            </div>
            <p className="record-hint">Read a short story aloud one sentence at a time. Each sentence is scored on its own, and you get a score for the whole story at the end.</p>
          </>
        )}

        {source === 'story' && story && (
          <div className="record-story">
            <div className="record-story-bar">
              <button className="record-link-btn" onClick={() => openStory(null)} disabled={busy}>← Stories</button>
              <span className="record-story-name">{story.title} <span>{story.titleEn}</span></span>
              <span className="record-story-count">{lineIdx + 1} / {story.sentences.length}</span>
            </div>
            <div className="record-story-steps">
              {story.sentences.map((_, i) => (
                <button
                  key={i}
                  className={`record-step${i === lineIdx ? ' current' : ''}${scoreClass(storyScores[i])}`}
                  onClick={() => setLineIdx(i)}
                  disabled={busy}
                  aria-label={`Sentence ${i + 1}${storyScores[i] != null ? `, ${storyScores[i]}%` : ''}`}
                >
                  {storyScores[i] ?? i + 1}
                </button>
              ))}
              <button className="record-link-btn record-story-toggle" onClick={() => setShowPassage(v => !v)}>
                {showPassage ? 'Hide story' : 'Whole story'}
              </button>
            </div>
            {showPassage && (
              <p className="record-passage">
                {story.sentences.map((s, i) => (
                  <span
                    key={i}
                    role="button"
                    tabIndex={0}
                    className={`record-passage-line${i === lineIdx ? ' current' : ''}${scoreClass(storyScores[i])}`}
                    onClick={() => { if (!busy) setLineIdx(i) }}
                    onKeyDown={e => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setLineIdx(i) } }}
                  >
                    {s.zh}
                  </span>
                ))}
              </p>
            )}
          </div>
        )}

        {storyDone && story && (
          <div className="record-story-done">
            <span className={`record-pct big${scoreClass(storyAvg)}`}>{storyAvg}%</span>
            <span className="record-story-done-text">
              Story done.
              {weakest >= 0 && (storyScores[weakest] ?? 100) < 85 && (
                <> Weakest: <button className="record-link-btn" onClick={() => setLineIdx(weakest)}>sentence {weakest + 1} ({storyScores[weakest]}%)</button></>
              )}
            </span>
            {nextStory && <button className="record-next-phrase" onClick={() => { setStoryLevel(nextStory.level); openStory(nextStory) }}>Next story →</button>}
          </div>
        )}

        {target ? (
          <div className="record-stage">
            {result && result.chars.length > 0 ? (
              <ScoredLine zh={target.zh} chars={result.chars} selected={selected} onSelect={i => setSelected(i === selected ? null : i)} />
            ) : (
              <>
                <div className="record-target-zh">{target.zh}</div>
                {target.pinyin && <div className="record-target-pinyin">{target.pinyin}</div>}
              </>
            )}
            {target.en && <div className="record-target-en">{target.en}</div>}

            <div className="record-controls">
              <AudioButton text={target.zh} label="Hear it read aloud" />
              {status === 'recording' ? (
                <button className="record-mic-btn recording" onClick={stopRecording}>
                  <span className="record-pulse" /> Stop {(recMs / 1000).toFixed(1)}s
                </button>
              ) : status === 'analyzing' ? (
                <span className="record-analyzing"><span className="record-spinner" /> Scoring…</span>
              ) : (
                <button className="record-mic-btn" onClick={startRecording}>
                  <Icon name="mic" size={18} /> {result ? 'Try again' : 'Record'}
                </button>
              )}
              {attempt && !busy && (
                <button className="record-round-btn" onClick={() => playAudio(attempt.audio)} aria-label="Play my recording" title="Play my recording">
                  <Icon name="play" size={15} />
                </button>
              )}
              {hasNext && (
                <button className="record-next-phrase" onClick={nextPhrase} disabled={busy}>Next →</button>
              )}
            </div>

            {error && <div className="record-error">{error}</div>}
            {result?.warning && <div className="record-warning">{result.warning}</div>}

            {result && result.chars.length > 0 && (
              <div className="record-scorebar">
                <span className={`record-pct big${scoreClass(sentencePct)}`}>{sentencePct ?? '–'}%</span>
                <span className="record-scorebar-text">
                  {result.summary?.perfect ? '完美！Every character on target.' : (
                    <>
                      {result.summary?.toneMisses ?? 0} tone{(result.summary?.toneMisses ?? 0) === 1 ? '' : 's'} · {result.summary?.soundMisses ?? 0} sound{(result.summary?.soundMisses ?? 0) === 1 ? '' : 's'} flagged
                    </>
                  )}
                  {result.transcript && <span className="record-heard">Heard: {result.transcript}</span>}
                </span>
              </div>
            )}

            {result && result.chars.length > 0 && (sel ? (
              <CharDetail
                c={sel}
                explanation={expanded[selected!]}
                loading={!!loadingExpl[selected!]}
                onWhy={() => fetchExplanation(selected!, sel)}
              />
            ) : (
              <p className="record-hint">Tap a character to see its tone, sounds and pitch.</p>
            ))}
          </div>
        ) : source !== 'story' && (
          <div className="record-stage record-target-empty">Enter a phrase above to begin.</div>
        )}
      </div>
    </div>
  )
}

// The sentence itself becomes the score sheet: one cell per character, punctuation kept in place
function ScoredLine({ zh, chars, selected, onSelect }: { zh: string; chars: CharScore[]; selected: number | null; onSelect: (i: number) => void }) {
  // Punctuation stays glued to the character before it so a line never starts with '。'
  const trailing: string[] = chars.map(() => '')
  if ([...zh].filter(isHan).length === chars.length) {
    let k = -1
    for (const ch of zh) {
      if (isHan(ch)) k++
      else if (k >= 0 && ch.trim()) trailing[k] += ch
    }
  }
  return (
    <div className="record-line">
      {chars.map((c, i) => {
        const state = anyMiss(c) ? 'miss' : c.scores.tone === 'unknown' ? 'unknown' : 'ok'
        return (
          <span key={i} className="record-cell-group">
            <button className={`record-cell ${state}${selected === i ? ' sel' : ''}`} onClick={() => onSelect(i)} aria-label={`${c.char} ${toneMarked(c.expected.pinyin)}: ${state === 'miss' ? 'needs work' : state}`}>
              <span className="record-cell-py">{toneMarked(c.expected.pinyin)}</span>
              <span className="record-cell-han" style={{ color: TONE_COLOR[c.expected.tone] ?? 'var(--text)' }}>{c.char}</span>
              {c.pitch && c.pitch.length >= 2
                ? <PitchSparkline pitch={c.pitch} expectedTone={c.expected.tone} status={c.scores.tone} width={34} height={12} thin />
                : <span className="record-cell-nopitch" />}
            </button>
            {trailing[i] && <span className="record-line-punct">{trailing[i]}</span>}
          </span>
        )
      })}
    </div>
  )
}

function CharDetail({ c, explanation, loading, onWhy }: { c: CharScore; explanation?: string; loading: boolean; onWhy: () => void }) {
  return (
    <div className={`record-detail${anyMiss(c) ? ' miss' : ''}`}>
      <div className="record-detail-grid">
        <div className="record-detail-char">
          <span className="record-detail-han" style={{ color: TONE_COLOR[c.expected.tone] ?? 'var(--text)' }}>{c.char}</span>
          <span className="record-detail-py">{toneMarked(c.expected.pinyin)}</span>
        </div>
        <div className="record-char-scores">
          <ScoreBadge label="Initial" expected={c.expected.initial} status={c.scores.initial} heard={c.heard.initial} />
          <ScoreBadge label="Final" expected={c.expected.final} status={c.scores.final} heard={c.heard.final} />
          <ToneBadge expected={c.expected.tone} detected={c.detectedTone} status={c.scores.tone} />
        </div>
        {c.pitch && c.pitch.length >= 2 && (
          <div className="record-detail-pitch">
            <span title="Dashed: target tone · solid: your pitch"><PitchSparkline pitch={c.pitch} expectedTone={c.expected.tone} status={c.scores.tone} width={120} height={44} /></span>
            <span className="record-detail-legend">dashed: target · solid: you</span>
          </div>
        )}
        <div className="record-detail-notes">
          {c.expected.sandhi && (
            <div className="record-char-sandhi" title={SANDHI_TITLE[c.expected.sandhiRule ?? 'third']}>
              Tone change: {c.expected.sandhiNote ?? `${c.expected.citationTone} → ${c.expected.tone} before 3rd tone`}
            </div>
          )}
          {c.expected.halfThird && <div className="record-char-sandhi">Half-3rd: said low, without rising back up</div>}
          {c.expected.neutral && !c.expected.sandhi && <div className="record-char-sandhi">Light / neutral: short, any pitch is fine</div>}
        </div>
        {anyMiss(c) && (
          <button className="record-why-btn" onClick={onWhy} disabled={loading}>
            {loading ? 'Thinking…' : explanation ? 'Hide' : 'Why?'}
          </button>
        )}
      </div>
      {explanation && <div className="record-explanation">{explanation}</div>}
    </div>
  )
}

function ScoreBadge({ label, expected, status, heard }: { label: string; expected: string; status: Check; heard: string }) {
  return (
    <div className={`record-score-badge sb-${status}`}>
      <span className="sb-label">{label}</span>
      <span className="sb-value">{expected || '—'}</span>
      {status === 'miss' && heard && <span className="sb-heard">heard {heard || '?'}</span>}
    </div>
  )
}

function ToneBadge({ expected, detected, status }: { expected: number; detected: number | null; status: Check }) {
  return (
    <div className={`record-score-badge sb-${status}`}>
      <span className="sb-label">Tone</span>
      <span className="sb-value" style={{ color: TONE_COLOR[expected] ?? 'var(--text)' }}>
        {expected} {TONE_SHAPE[expected] ?? ''}
      </span>
      {status === 'miss' && detected != null && <span className="sb-heard">heard {detected} {TONE_SHAPE[detected] ?? ''}</span>}
    </div>
  )
}

const IDEAL_TONE: Record<number, (t: number) => number> = {
  1: () => 4,
  2: t => -2 + 6 * t,
  3: t => t < 0.5 ? -2 - 4 * t : -4 + 4 * (t - 0.5),
  4: t => 4 - 8 * t,
  0: () => 0,
}

function PitchSparkline({ pitch, expectedTone, status, width = 90, height = 36, thin = false }: { pitch: PitchPoint[]; expectedTone: number; status: Check; width?: number; height?: number; thin?: boolean }) {
  const W = width
  const H = height
  const PAD_Y = thin ? 1.5 : 4
  const yMin = -8
  const yMax = 8
  const mapY = (s: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, s))
    return PAD_Y + (H - 2 * PAD_Y) * (1 - (clamped - yMin) / (yMax - yMin))
  }
  const mapX = (t: number) => t * W

  const userPath = pitch.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.t).toFixed(1)} ${mapY(p.s).toFixed(1)}`).join(' ')
  const ideal = IDEAL_TONE[expectedTone] ?? (() => 0)
  const idealPts = Array.from({ length: 16 }, (_, i) => i / 15)
  const idealPath = idealPts.map((t, i) => `${i === 0 ? 'M' : 'L'} ${mapX(t).toFixed(1)} ${mapY(ideal(t)).toFixed(1)}`).join(' ')
  const userColor = status === 'ok' ? '#2e7d32' : status === 'miss' ? '#c0392b' : '#95a5a6'

  return (
    <svg className="record-pitch-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label="pitch contour">
      {!thin && <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2 2" />}
      <path d={idealPath} fill="none" stroke={TONE_COLOR[expectedTone] ?? '#999'} strokeWidth={thin ? 1 : 1.2} strokeDasharray="3 2" opacity="0.6" />
      <path d={userPath} fill="none" stroke={userColor} strokeWidth={thin ? 1.4 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
