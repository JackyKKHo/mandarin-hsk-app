import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'
import { RECORD_PHRASES, TOPICS, pickDailyPhrase } from '../data/recordPhrases'
import { loadLevel } from '../data/vocabLoader'
import type { Example, VocabItem } from '../types'

type Source = 'daily' | 'bank' | 'hsk' | 'custom'
type Status = 'idle' | 'recording' | 'analyzing' | 'done' | 'error'

interface CharScore {
  char: string
  expected: { pinyin: string; base: string; initial: string; final: string; tone: number }
  heard: { char: string | null; pinyin: string; base: string; initial: string; final: string; toneFromText: number | null }
  scores: { initial: 'ok' | 'miss' | 'unknown'; final: 'ok' | 'miss' | 'unknown'; tone: 'ok' | 'miss' | 'unknown' }
  detectedTone: number | null
  timing: { tStart: number; tEnd: number }
}

interface ScoreResponse {
  transcript: string
  chars: CharScore[]
  summary?: { perfect: boolean; toneMisses: number; soundMisses: number }
  warning?: string
}

const HSK_LEVELS = [1, 2, 3, 4, 5, 6]

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

const TONE_COLOR: Record<number, string> = { 1: '#1976d2', 2: '#388e3c', 3: '#f57c00', 4: '#d32f2f', 0: '#757575' }
const TONE_SHAPE: Record<number, string> = { 1: '‾', 2: '/', 3: 'v', 4: '\\', 0: '·' }

export default function RecordPage() {
  useSEO({ title: 'Record & Score', description: 'Record your Mandarin pronunciation and get instant AI feedback on tones, initials, and finals.', path: '/record' })

  const [source, setSource] = useState<Source>('daily')
  const [topic, setTopic] = useState(TOPICS[0].id)
  const [hskLevel, setHskLevel] = useState(1)
  const [hskExamples, setHskExamples] = useState<Example[]>([])
  const [hskIdx, setHskIdx] = useState(0)
  const [customZh, setCustomZh] = useState('')
  const [customPinyin, setCustomPinyin] = useState('')

  const [target, setTarget] = useState<{ zh: string; pinyin: string; en?: string } | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScoreResponse | null>(null)
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

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MediaRecorder) setSupported(false)
  }, [])

  useEffect(() => {
    if (source === 'daily') setTarget({ zh: daily.zh, pinyin: daily.pinyin, en: daily.en })
    else if (source === 'bank') {
      const p = bankPhrases[bankIdx % Math.max(1, bankPhrases.length)]
      if (p) setTarget({ zh: p.zh, pinyin: p.pinyin, en: p.en })
    } else if (source === 'hsk') {
      const ex = hskExamples[hskIdx]
      if (ex) setTarget({ zh: ex.chinese, pinyin: ex.pinyin, en: ex.english })
    } else if (source === 'custom') {
      if (customZh.trim()) setTarget({ zh: customZh.trim(), pinyin: customPinyin.trim() })
      else setTarget(null)
    }
    setResult(null)
    setExpanded({})
    setError('')
  }, [source, topic, bankIdx, bankPhrases, hskExamples, hskIdx, customZh, customPinyin, daily])

  useEffect(() => {
    if (source !== 'hsk') return
    let cancelled = false
    loadLevel(hskLevel).then((words: VocabItem[]) => {
      if (cancelled) return
      const examples = words
        .flatMap(w => w.examples ?? [])
        .filter(e => e.chinese && e.pinyin && [...e.chinese].filter(c => /\p{Script=Han}/u.test(c)).length <= 15)
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

  async function startRecording() {
    setError('')
    setResult(null)
    setExpanded({})
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => { void finishRecording() }
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

  async function finishRecording() {
    if (!target) { setStatus('idle'); return }
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
        body: JSON.stringify({ wav: b64, target: target.zh }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scoring failed')
      setResult(data)
      setStatus('done')
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

  function nextPhrase() {
    if (source === 'bank') setBankIdx(i => (i + 1) % Math.max(1, bankPhrases.length))
    else if (source === 'hsk') setHskIdx(i => (i + 1) % Math.max(1, hskExamples.length))
  }

  if (!supported) {
    return (
      <div className="browser-page">
        <AppHeader />
        <div className="practice-page">
          <Link to="/guides" className="back-link">← Guides</Link>
          <div className="record-not-supported">
            🎙️ Recording is not supported on this browser. Try Chrome, Edge, or Safari on a recent device.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="practice-page">
        <Link to="/guides" className="back-link">← Guides</Link>

        <div className="reading-page-header">
          <h1 className="reading-page-title">🎙️ Record & Score</h1>
          <p className="reading-page-desc">
            Read a phrase aloud and get instant feedback on initials, finals, and tones — per character.
          </p>
        </div>

        <div className="record-source-tabs">
          {(['daily', 'bank', 'hsk', 'custom'] as Source[]).map(s => (
            <button key={s} className={`record-tab${source === s ? ' active' : ''}`} onClick={() => setSource(s)}>
              {s === 'daily' && '📅 Daily'}
              {s === 'bank' && '📚 Phrase bank'}
              {s === 'hsk' && '🏷️ HSK examples'}
              {s === 'custom' && '✏️ Custom'}
            </button>
          ))}
        </div>

        {source === 'bank' && (
          <div className="record-topic-row">
            {TOPICS.map(t => (
              <button key={t.id} className={`record-topic-chip${topic === t.id ? ' active' : ''}`} onClick={() => { setTopic(t.id); setBankIdx(0) }}>
                <span>{t.emoji}</span> {t.label}
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

        {target ? (
          <div className="record-target-card">
            <div className="record-target-zh">{target.zh}</div>
            {target.pinyin && <div className="record-target-pinyin">{target.pinyin}</div>}
            {target.en && <div className="record-target-en">{target.en}</div>}
            {(source === 'bank' || source === 'hsk') && (
              <button className="record-next-phrase" onClick={nextPhrase}>Next phrase →</button>
            )}
          </div>
        ) : (
          <div className="record-target-card record-target-empty">Enter a phrase above to begin.</div>
        )}

        <div className="record-mic-row">
          {status === 'idle' || status === 'done' || status === 'error' ? (
            <button className="record-mic-btn" onClick={startRecording} disabled={!target}>
              🎙️ {result ? 'Try again' : 'Start recording'}
            </button>
          ) : null}
          {status === 'recording' && (
            <button className="record-mic-btn recording" onClick={stopRecording}>
              <span className="record-pulse" /> Stop ({(recMs / 1000).toFixed(1)}s)
            </button>
          )}
          {status === 'analyzing' && (
            <div className="record-analyzing">
              <span className="record-spinner" /> Analyzing pitch and pronunciation…
            </div>
          )}
        </div>

        {error && <div className="record-error">{error}</div>}

        {result && result.warning && <div className="record-warning">{result.warning}</div>}

        {result && result.chars.length > 0 && (
          <div className="record-results">
            {result.summary?.perfect && <div className="record-perfect">🎉 完美！Every character on target.</div>}
            {!result.summary?.perfect && (
              <div className="record-summary">
                {result.summary?.toneMisses ?? 0} tone{(result.summary?.toneMisses ?? 0) === 1 ? '' : 's'} flagged,{' '}
                {result.summary?.soundMisses ?? 0} sound{(result.summary?.soundMisses ?? 0) === 1 ? '' : 's'} flagged.
              </div>
            )}

            <div className="record-char-grid">
              {result.chars.map((c, i) => {
                const anyMiss = c.scores.initial === 'miss' || c.scores.final === 'miss' || c.scores.tone === 'miss'
                return (
                  <div key={i} className={`record-char-card${anyMiss ? ' miss' : ' ok'}`}>
                    <div className="record-char-top">
                      <div className="record-char-han" style={{ color: TONE_COLOR[c.expected.tone] ?? '#333' }}>{c.char}</div>
                      <div className="record-char-py">{c.expected.pinyin}</div>
                    </div>
                    <div className="record-char-scores">
                      <ScoreBadge label="Initial" expected={c.expected.initial} status={c.scores.initial} heard={c.heard.initial} />
                      <ScoreBadge label="Final" expected={c.expected.final} status={c.scores.final} heard={c.heard.final} />
                      <ToneBadge expected={c.expected.tone} detected={c.detectedTone} status={c.scores.tone} />
                    </div>
                    {anyMiss && (
                      <>
                        <button className="record-why-btn" onClick={() => fetchExplanation(i, c)} disabled={loadingExpl[i]}>
                          {loadingExpl[i] ? 'Thinking…' : expanded[i] ? 'Hide' : 'Why?'}
                        </button>
                        {expanded[i] && <div className="record-explanation">{expanded[i]}</div>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {result.transcript && (
              <div className="record-transcript">
                <span className="record-transcript-label">Heard:</span>
                <span className="record-transcript-text">{result.transcript}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreBadge({ label, expected, status, heard }: { label: string; expected: string; status: 'ok' | 'miss' | 'unknown'; heard: string }) {
  return (
    <div className={`record-score-badge sb-${status}`}>
      <span className="sb-label">{label}</span>
      <span className="sb-value">{expected || '—'}</span>
      {status === 'miss' && heard && <span className="sb-heard">heard: {heard || '?'}</span>}
    </div>
  )
}

function ToneBadge({ expected, detected, status }: { expected: number; detected: number | null; status: 'ok' | 'miss' | 'unknown' }) {
  return (
    <div className={`record-score-badge sb-${status}`}>
      <span className="sb-label">Tone</span>
      <span className="sb-value" style={{ color: TONE_COLOR[expected] ?? '#333' }}>
        {expected} {TONE_SHAPE[expected] ?? ''}
      </span>
      {status === 'miss' && detected != null && <span className="sb-heard">heard: {detected} {TONE_SHAPE[detected] ?? ''}</span>}
    </div>
  )
}
