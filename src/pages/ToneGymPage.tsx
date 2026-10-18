import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Icon from '../components/Icon'
import { useSEO } from '../hooks/useSEO'
import { useStreak } from '../hooks/useStreak'
import { numberedToToned } from './TonePage'
import gym from '../data/toneGym.json'
import { PitchTracker, analyzeClip } from '../lib/pitchTracker'
import {
  scoreUtterance, loadVoiceBase, addVoiceSample, loadStats, recordAttempt, topConfusion, pickWeighted, cleanPitch, mainCluster,
  type Frame, type Point, type UtteranceResult, type GymStats,
} from '../lib/toneGym'
import { toneName } from '../../api/_toneContour.js'

type Mode = 'syllables' | 'pairs'
interface Item { key: string; zh: string; pinyin: string; tones: number[]; hint: string }

interface SyllableEntry { c: string; e?: string; w?: string }
const SYLLABLES: Item[] = (gym.syllables as { base: string; tones: Record<string, SyllableEntry> }[]).flatMap(s =>
  Object.entries(s.tones).map(([t, e]) => ({
    key: s.base + t,
    zh: e.c,
    pinyin: numberedToToned(s.base + t),
    tones: [Number(t)],
    hint: e.e ? `${e.c} · ${e.e}` : `${e.c} · as in ${e.w}`,
  })),
)
const PAIRS: Record<string, Item[]> = Object.fromEntries(
  Object.entries(gym.pairs as Record<string, { id: string; zh: string; py: string; en: string }[]>).map(([combo, ws]) => [
    combo,
    ws.map(w => ({ key: w.id, zh: w.zh, pinyin: w.py, tones: combo.split('-').map(Number), hint: w.en })),
  ]),
)
const COMBOS = Object.keys(PAIRS)

const TONE_VAR = (t: number) => `var(--tone-${t})`
// Target shapes in semitones around your normal pitch, t in [0, 1]
const IDEAL: Record<number, (t: number) => number> = {
  1: () => 4,
  2: t => -2 + 6 * t,
  3: t => (t < 0.5 ? -2 - 4 * t : -4 + 4 * (t - 0.5)),
  4: t => 4 - 8 * t,
}
const HALF_THIRD = (t: number) => -2.5 - 2 * t

const ttsCache = new Map<string, Promise<{ url: string; frames: Frame[] }>>()
function loadNative(text: string) {
  if (!ttsCache.has(text)) {
    ttsCache.set(text, (async () => {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
      if (!res.ok) throw new Error('Audio unavailable')
      const blob = await res.blob()
      const frames = await analyzeClip(await blob.arrayBuffer()).catch(() => [])
      return { url: URL.createObjectURL(blob), frames }
    })())
    ttsCache.get(text)!.catch(() => ttsCache.delete(text))
  }
  return ttsCache.get(text)!
}

// The native speaker's contour, split per syllable and normalised to 0–1 time, shifted so its
// average sits where the target shape's does (only the shape is comparable across voices).
function nativeShapes(frames: Frame[], tones: number[], spoken: number[]): Point[][] {
  const cluster = cleanPitch(mainCluster(frames))
  const voiced = cluster.filter(f => f.f != null)
  if (voiced.length < 6) return []
  const t0 = cluster[0].t, span = cluster[cluster.length - 1].t - t0 || 1
  const n = tones.length
  return tones.map((_, i) => {
    const whole = voiced.filter(f => f.t - t0 >= (i / n) * span && f.t - t0 <= ((i + 1) / n) * span)
    // Drop the consonant burst at the start and the trail-off at the end, like for your voice
    const k = whole.length >= 10 ? Math.round(whole.length * 0.12) : 0
    const part = whole.slice(k, whole.length - k)
    if (part.length < 3) return []
    const ys = part.map(f => 12 * Math.log2(f.f!))
    const mean = ys.reduce((a, y) => a + y, 0) / ys.length
    const shape = shapeFor(spoken[i], n, i)
    const target = Array.from({ length: 11 }, (_, k) => shape(k / 10)).reduce((a, y) => a + y, 0) / 11
    const pt0 = part[0].t, pspan = part[part.length - 1].t - pt0 || 1
    return part.map((f, k) => ({ t: (f.t - pt0) / pspan, y: ys[k] - mean + target }))
  })
}

// In a pair, a 3rd tone before another tone is said low without the rise
const shapeFor = (tone: number, n: number, i: number) => (tone === 3 && n === 2 && i === 0 ? HALF_THIRD : IDEAL[tone])
const spokenTones = (tones: number[]) => (tones.length === 2 && tones[0] === 3 && tones[1] === 3 ? [2, 3] : tones)

export default function ToneGymPage() {
  useSEO({
    title: 'Tone Gym: Mandarin Tone Practice',
    description: 'Say a syllable and see your pitch live against the target tone. Instant feedback on all four Mandarin tones and tone pairs.',
    path: '/tones',
  })
  const { recordStudy } = useStreak()
  const [mode, setMode] = useState<Mode>('syllables')
  const [toneFilter, setToneFilter] = useState<number[]>([1, 2, 3, 4])
  const [combo, setCombo] = useState<string | null>(null)
  const [stats, setStats] = useState<GymStats>(loadStats)
  const [item, setItem] = useState<Item | null>(null)
  const [phase, setPhase] = useState<'ready' | 'listening' | 'speaking' | 'result'>('ready')
  const [live, setLive] = useState<Frame[]>([])
  const [result, setResult] = useState<UtteranceResult | null>(null)
  const [myAudio, setMyAudio] = useState<string | null>(null)
  const [native, setNative] = useState<Point[][]>([])
  const [error, setError] = useState('')
  const [session, setSession] = useState({ reps: 0, passes: 0, run: 0 })
  const tracker = useRef<PitchTracker | null>(null)
  const audioEl = useRef<HTMLAudioElement | null>(null)
  const advanceTimer = useRef<number | null>(null)
  const studied = useRef(false)

  const pool = useMemo(() => {
    if (mode === 'pairs') return combo ? PAIRS[combo] : COMBOS.flatMap(c => PAIRS[c])
    return SYLLABLES.filter(s => toneFilter.includes(s.tones[0]))
  }, [mode, toneFilter, combo])

  function nextItem(lastKey: string | null = item?.key ?? null) {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null }
    if (!pool.length) { setItem(null); return }
    const next = pickWeighted(pool, x => x.key, x => spokenTones(x.tones), stats, lastKey)
    setItem(next); setResult(null); setLive([]); setNative([]); setPhase('ready')
    if (myAudio) { URL.revokeObjectURL(myAudio); setMyAudio(null) }
    loadNative(next.zh).then(n => setNative(nativeShapes(n.frames, next.tones, spokenTones(next.tones)))).catch(() => {})
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { nextItem(null) }, [pool])
  useEffect(() => () => {
    tracker.current?.close()
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    audioEl.current?.pause()
  }, [])

  async function playNative() {
    if (!item) return
    try {
      const { url } = await loadNative(item.zh)
      audioEl.current?.pause()
      audioEl.current = new Audio(url)
      await audioEl.current.play()
    } catch { setError('Couldn’t load the audio. Check your connection.') }
  }

  function playMine() {
    if (!myAudio) return
    audioEl.current?.pause()
    audioEl.current = new Audio(myAudio)
    void audioEl.current.play()
  }

  async function listen() {
    if (!item || phase === 'listening' || phase === 'speaking') return
    setError('')
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null }
    audioEl.current?.pause()
    try {
      if (!tracker.current) tracker.current = new PitchTracker()
      await tracker.current.open()
    } catch {
      setError('Microphone blocked. Allow microphone access for this site, then try again.')
      return
    }
    setResult(null); setLive([]); setPhase('listening')
    const buf: Frame[] = []
    let pending = false
    let finished = false
    const { frames, audio } = await tracker.current.listen((f, speaking) => {
      if (!speaking) return
      buf.push(f)
      if (!pending) {
        pending = true
        requestAnimationFrame(() => { pending = false; if (!finished) { setLive([...buf]); setPhase('speaking') } })
      }
    }, { maxSec: item.tones.length === 2 ? 2.5 : 1.8 })
    finished = true

    const r = scoreUtterance(frames, item.tones, loadVoiceBase())
    setResult(r)
    setPhase('result')
    if (myAudio) URL.revokeObjectURL(myAudio)
    setMyAudio(audio ? URL.createObjectURL(audio) : null)
    if (!r.heard) return
    if (r.medianHz) addVoiceSample(r.medianHz)
    setStats(s => recordAttempt(s, item.key, r))
    setSession(s => {
      const next = { reps: s.reps + 1, passes: s.passes + (r.pass ? 1 : 0), run: r.pass ? s.run + 1 : 0 }
      if (next.reps >= 5 && !studied.current) { studied.current = true; recordStudy() }
      return next
    })
    if (r.pass) advanceTimer.current = window.setTimeout(() => nextItem(item.key), 1600)
  }

  function stopListening() { tracker.current?.stop() }

  const confusion = topConfusion(stats)
  const toneAcc = (t: number) => {
    const s = stats.tones[String(t)]
    return s && s.n >= 3 ? Math.round((s.ok / s.n) * 100) : null
  }
  const comboAcc = (c: string) => {
    const ks = PAIRS[c].map(w => stats.items[w.key]).filter(Boolean)
    const n = ks.reduce((a, k) => a + k.n, 0), ok = ks.reduce((a, k) => a + k.ok, 0)
    return n >= 2 ? Math.round((ok / n) * 100) : null
  }

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="practice-page gym-page">
        <Link to="/guides" className="back-link">← Guides</Link>
        <div className="gym-head">
          <h1 className="gym-title">Tone Gym</h1>
          <p className="gym-lede">Say it out loud and watch your pitch against the target. Instant feedback, as many reps as you like.</p>
        </div>

        <div className="gym-modes" role="tablist">
          {(['syllables', 'pairs'] as const).map(m => (
            <button key={m} role="tab" aria-selected={mode === m} className={`gym-mode${mode === m ? ' active' : ''}`}
              onClick={() => { setMode(m); setCombo(null) }}>
              {m === 'syllables' ? `Syllables · ${SYLLABLES.length}` : 'Tone pairs · real words'}
            </button>
          ))}
        </div>

        {mode === 'syllables' ? (
          <div className="gym-filter" aria-label="Tones to practise">
            {[1, 2, 3, 4].map(t => {
              const on = toneFilter.includes(t)
              const acc = toneAcc(t)
              return (
                <button key={t} className={`gym-chip${on ? ' on' : ''}`} style={{ '--chip': TONE_VAR(t) } as React.CSSProperties}
                  aria-pressed={on}
                  onClick={() => setToneFilter(f => on ? (f.length > 1 ? f.filter(x => x !== t) : f) : [...f, t].sort())}>
                  <span className="gym-chip-name">Tone {t}</span>
                  <span className="gym-chip-acc">{acc == null ? '–' : `${acc}%`}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="gym-grid-wrap">
            <div className="gym-grid" aria-label="Tone pair grid: first tone by row, second by column">
              <span />
              {[1, 2, 3, 4].map(t => <span key={t} className="gym-grid-h" style={{ color: TONE_VAR(t) }}>{t}</span>)}
              {[1, 2, 3, 4].map(a => (
                <FragmentRow key={a} a={a} combo={combo} setCombo={setCombo} comboAcc={comboAcc} />
              ))}
            </div>
            <button className={`gym-all${combo == null ? ' on' : ''}`} onClick={() => setCombo(null)}>All pairs, weakest first</button>
          </div>
        )}

        {item && (
          <section className={`gym-card${result ? (result.pass ? ' pass' : result.heard ? ' miss' : '') : ''}`}>
            <div className="gym-prompt">
              <div className="gym-pinyin">
                {item.tones.length === 2
                  ? <PairPinyin pinyin={item.pinyin} tones={item.tones} />
                  : <span style={{ color: TONE_VAR(item.tones[0]) }}>{item.pinyin}</span>}
              </div>
              <div className="gym-hint">{item.tones.length === 2 ? `${item.zh} · ${item.hint}` : item.hint}</div>
            </div>

            <ContourPlot item={item} live={live} result={result} native={native} phase={phase} />

            <div className="gym-actions">
              <button className="gym-listen" onClick={playNative} aria-label="Hear a native speaker">
                <Icon name="volume" size={20} /> Native
              </button>
              {phase === 'listening' || phase === 'speaking' ? (
                <button className="gym-mic recording" onClick={stopListening} aria-label="Stop">
                  <span className="gym-mic-dot" /> {phase === 'listening' ? 'Listening…' : 'Hearing you…'}
                </button>
              ) : (
                <button className="gym-mic" onClick={listen}>
                  <Icon name="mic" size={22} /> {result ? 'Again' : 'Say it'}
                </button>
              )}
              <button className="gym-listen" onClick={playMine} disabled={!myAudio} aria-label="Hear yourself">
                <Icon name="play" size={18} /> You
              </button>
            </div>

            {error && <p className="gym-error">{error}</p>}

            {result && !result.heard && <p className="gym-verdict">Didn’t catch that. Say it a little louder, closer to the mic.</p>}
            {result?.heard && (
              <div className="gym-feedback" aria-live="polite" ref={el => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}>
                <p className="gym-verdict">{result.pass ? '✓ Correct' : '✗ Not quite'}</p>
                {result.syllables.map((s, i) => (
                  <div key={i} className="gym-syl">
                    {result.syllables.length > 1 && <span className="gym-syl-n">{[...item.zh][i]}</span>}
                    <div>
                      {!s.ok && <p className="gym-heard">Sounded like a <strong style={{ color: s.detected ? TONE_VAR(s.detected) : undefined }}>{toneName(s.detected)}</strong></p>}
                      <p className="gym-coach">{s.coach}</p>
                      {s.note && <p className="gym-note">{s.note}</p>}
                    </div>
                  </div>
                ))}
                <button className="btn-secondary gym-next" onClick={() => nextItem()}>Next →</button>
              </div>
            )}
          </section>
        )}

        <div className="gym-session">
          <span>{session.reps} reps</span>
          <span>{session.reps ? Math.round((session.passes / session.reps) * 100) : 0}% correct</span>
          {session.run >= 3 && <span className="gym-run">{session.run} in a row</span>}
        </div>
        {confusion && (
          <p className="gym-insight">
            Your most common slip: <strong style={{ color: TONE_VAR(confusion.expected) }}>tone {confusion.expected}</strong> coming out as{' '}
            <strong style={{ color: TONE_VAR(confusion.detected) }}>tone {confusion.detected}</strong> ({confusion.count}×). Tones you miss come up more often.
          </p>
        )}
        <p className="gym-small">Feedback gets more accurate after a few reps, once it has learned your normal pitch. Everything runs on your device; nothing is uploaded.</p>
      </div>
    </div>
  )
}

function FragmentRow({ a, combo, setCombo, comboAcc }: { a: number; combo: string | null; setCombo: (c: string) => void; comboAcc: (c: string) => number | null }) {
  return (
    <>
      <span className="gym-grid-h" style={{ color: TONE_VAR(a) }}>{a}</span>
      {[1, 2, 3, 4].map(b => {
        const c = `${a}-${b}`
        const acc = comboAcc(c)
        const heat = acc == null ? undefined : acc >= 80 ? 'good' : acc >= 50 ? 'ok' : 'low'
        return (
          <button key={c} className={`gym-cell${combo === c ? ' on' : ''}${heat ? ` heat-${heat}` : ''}`} onClick={() => setCombo(c)}
            aria-label={`Tone ${a} then tone ${b}${acc == null ? '' : `, ${acc}% correct`}`}>
            {acc == null ? '·' : `${acc}`}
          </button>
        )
      })}
    </>
  )
}

function PairPinyin({ pinyin, tones }: { pinyin: string; tones: number[] }) {
  // Pair pinyin comes as "nǐ hǎo" or "kěyǐ"; colour each syllable by its tone
  const parts = pinyin.includes(' ') ? pinyin.split(/\s+/) : splitTwo(pinyin)
  return <>{parts.map((p, i) => <span key={i} style={{ color: TONE_VAR(tones[i] ?? 0) }}>{p}{i === 0 && parts.length > 1 ? ' ' : ''}</span>)}</>
}

// Splits two joined syllables at the start of the second one ("kěyǐ" → kě + yǐ)
function splitTwo(p: string): string[] {
  const m = p.match(/^(.+?[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ](?:ng|n(?![aeiouāáǎàēéěèīíǐìōóǒòūúǔùü])|r(?![aeiouāáǎàēéěèīíǐìōóǒòūúǔùü]))?)(?=[^aeiouāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ']|')'?(.+)$/i)
  return m ? [m[1], m[2]] : [p]
}

const W = 320, H = 150, Y_MIN = -9, Y_MAX = 9
const mapY = (y: number) => 8 + (H - 16) * (1 - (Math.max(Y_MIN, Math.min(Y_MAX, y)) - Y_MIN) / (Y_MAX - Y_MIN))

function ContourPlot({ item, live, result, native, phase }: { item: Item; live: Frame[]; result: UtteranceResult | null; native: Point[][]; phase: string }) {
  const n = item.tones.length
  const spoken = spokenTones(item.tones)
  const slotW = W / n
  const pad = 10
  const slotX = (i: number, t: number) => i * slotW + pad + t * (slotW - 2 * pad)
  const path = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const base = loadVoiceBase()

  // Live trace: time since speech began across the whole plot
  let livePath = ''
  if (!result && live.length) {
    const t0 = live[0].t
    const span = n === 2 ? 1.2 : 0.8
    const b = base ?? live.find(f => f.f != null)?.f ?? 200
    const segs: string[] = []
    let pen = false
    for (const f of live) {
      if (f.f == null) { pen = false; continue }
      const x = Math.min(W - 4, 4 + ((f.t - t0) / span) * (W - 8))
      const y = mapY(12 * Math.log2(f.f / b))
      segs.push(`${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
      pen = true
    }
    livePath = segs.join(' ')
  }

  return (
    <svg className="gym-plot" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={result ? 'Your pitch compared with the target tone' : 'Target tone shape'}>
      <line x1="0" x2={W} y1={mapY(0)} y2={mapY(0)} className="gym-plot-mid" />
      {n === 2 && <line x1={W / 2} x2={W / 2} y1="6" y2={H - 6} className="gym-plot-mid" />}
      {spoken.map((t, i) => {
        const shape = shapeFor(t, n, i)
        const pts = Array.from({ length: 21 }, (_, k) => ({ x: slotX(i, k / 20), y: mapY(shape(k / 20)) }))
        return <path key={`ideal${i}`} d={path(pts)} className="gym-plot-ideal" style={{ stroke: TONE_VAR(t) }} />
      })}
      {native.map((pts, i) => pts.length > 1 && (
        <path key={`nat${i}`} d={path(pts.map(p => ({ x: slotX(i, p.t), y: mapY(p.y) })))} className="gym-plot-native" />
      ))}
      {livePath && <path d={livePath} className="gym-plot-you" />}
      {result?.heard && result.syllables.map((s, i) => {
        if (s.points.length < 2) return null
        const dur = s.points[s.points.length - 1].t || 1
        return <path key={`you${i}`} d={path(s.points.map(p => ({ x: slotX(i, p.t / dur), y: mapY(p.y) })))}
          className={`gym-plot-you ${s.ok ? 'ok' : 'miss'}`} />
      })}
      {phase === 'ready' && !result && (
        <text x={W / 2} y={H - 10} textAnchor="middle" className="gym-plot-label">dashed = target · grey = native speaker</text>
      )}
    </svg>
  )
}
