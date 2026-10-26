import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import AppHeader from '../components/AppHeader'
import Icon from '../components/Icon'
import PremiumWall from '../components/PremiumWall'
import { useAuth } from '../context/AuthContext'
import ClickableText from '../components/ClickableText'
import ReadAloud from '../components/ReadAloud'
import SpeedToggle from '../components/SpeedToggle'
import { useSEO } from '../hooks/useSEO'
import { useSRS } from '../hooks/useSRS'
import { loadAllLevels } from '../data/vocabLoader'
import { loadImages, type WordImage } from '../data/images'
import { levelLabel } from '../data/levels'
import { buildLookup } from '../lib/reader'
import { placeLabels, renderDescribeCard, shareOrDownload, stairShade } from '../lib/describeCard'

// Mirrors RUNGS in api/_pictureLadder.js; `short` labels the staircase steps
const RUNGS = [
  { level: 1, layer: 'What', short: 'What', hint: 'Who or what, doing what?' },
  { level: 2, layer: 'Where', short: 'Where', hint: 'Add where it is.' },
  { level: 3, layer: 'Details', short: 'Details', hint: 'Colours, materials, how many.' },
  { level: 4, layer: 'Why', short: 'Why', hint: 'Reasons and purpose.' },
  { level: 5, layer: 'Inference', short: 'Next', hint: 'What happened before or comes next? How do they feel?' },
  { level: 6, layer: 'Opinion', short: 'Opinion', hint: 'Comment on the scene.' },
  { level: 7, layer: 'Written style', short: 'Written', hint: 'Formal written Chinese, with an idiom.' },
]

// Scenes from the picture quiz photos (word ids in data/images.json)
const SAMPLE_IDS = [
  { id: 'hsk1_0019', label: '超市', en: 'Supermarket' },
  { id: 'hsk2_0035', label: '地铁', en: 'Subway' },
  { id: 'hsk2_0039', label: '饭馆', en: 'Restaurant' },
  { id: 'hsk3_0148', label: '公园', en: 'Park' },
]

const LAST_KEY = 'hsk-describe-last'
const MAX_SIDE = 1024

interface Keyword { zh: string; pinyin: string; en: string }
interface Rung { zh: string; pinyin: string; en: string; focus: string; ask: string; askEn: string; keywords: Keyword[] }
interface PhotoLabel { zh: string; pinyin: string; en: string; x: number; y: number }
// labels is missing on ladders saved before the picture-dictionary view existed
interface Ladder { title: string; titleEn: string; labels?: PhotoLabel[]; levels: Rung[] }
interface Session {
  image: string
  credit?: WordImage
  ladder: Ladder
  revealed: number
  attempts: Record<number, string>
}

const hanCount = (s: string) => [...s].filter(c => /\p{Script=Han}/u.test(c)).length

/** The photo with picture-dictionary pins; tap a pin for its English */
function LabelledPhoto({ src, alt, labels }: { src: string; alt: string; labels: PhotoLabel[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = img.current
    if (!el) return
    const measure = () => { if (el.clientWidth) setBox({ w: el.clientWidth, h: el.clientHeight }) }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Tag sizes estimated from the CSS (0.92rem characters, 0.64rem pinyin) so tags can be placed before they render
  const placed = box ? placeLabels(labels, box.w, box.h, l => ({ w: Math.max([...l.zh].length * 15, l.pinyin.length * 6) + 16, h: 36 })) : []

  return (
    <div className="describe-photo-wrap">
      <img ref={img} src={src} alt={alt} className="describe-photo" />
      {placed.map(({ label: l, left, dy }, i) => (
        <button
          key={i}
          className={`describe-pin${left ? ' left' : ''}${active === i ? ' active' : ''}`}
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
          onClick={() => setActive(active === i ? null : i)}
          aria-label={`${l.zh} ${l.pinyin}: ${l.en}`}
        >
          <span className="describe-pin-dot" aria-hidden="true" />
          <span className="describe-pin-tag" style={dy ? { transform: `translateY(${dy}px)` } : undefined}>
            <b lang="zh-CN">{l.zh}</b>
            <small>{active === i ? l.en : l.pinyin}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

/** Seven steps, each taller than the last; revealed steps fill in and show how many characters that level used */
function Staircase({ levels, revealed, onStep }: { levels: Rung[]; revealed: number; onStep: (level: number) => void }) {
  return (
    <ol className="describe-stairs" aria-label={`Level ${revealed} of ${RUNGS.length} revealed`}>
      {RUNGS.map((r, i) => {
        const open = r.level <= revealed
        const shade = stairShade(i, RUNGS.length)
        return (
          <li key={r.level}>
            <button
              className={`describe-stair${open ? ' open' : ''}${r.level === revealed + 1 ? ' next' : ''}${shade > 60 ? ' deep' : ''}`}
              style={{ '--h': `${1.6 + i * 0.7}rem`, '--shade': `${shade}%` } as CSSProperties}
              onClick={() => onStep(r.level)}
              title={`HSK ${levelLabel(r.level)} · ${r.layer}`}
            >
              <span className="describe-stair-count">{open ? `${hanCount(levels[i].zh)}字` : ''}</span>
              <span className="describe-stair-block">{levelLabel(r.level)}</span>
              <span className="describe-stair-layer">{r.short}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function loadLast(): Session | null {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLast(s: Session | null) {
  try {
    if (s) localStorage.setItem(LAST_KEY, JSON.stringify(s))
    else localStorage.removeItem(LAST_KEY)
  } catch { /* storage full or private mode: the ladder just won't survive a reload */ }
}

/** Downscale to at most 1024px and re-encode as JPEG, so uploads stay small and phone HEIC-converted photos work */
async function prepareImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function DescribePage() {
  useSEO({
    title: 'Describe It — 看图说话',
    description: 'Upload a photo and climb seven levels of Chinese describing it, from HSK 1 to HSK 7–9: what, where, details, why, inference, opinion and written style.',
    path: '/describe',
  })

  const [session, setSession] = useState<Session | null>(loadLast)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<{ id: string; label: string; en: string; image: WordImage }[]>([])
  const [lookup, setLookup] = useState<Map<string, VocabItem>>(new Map())
  const [showPinyin, setShowPinyin] = useState(true)
  const [openEnglish, setOpenEnglish] = useState<Set<number>>(new Set())
  const [showLabels, setShowLabels] = useState(true)
  const [saving, setSaving] = useState(false)
  const { review, getCard } = useSRS()
  const { session: auth } = useAuth()

  useEffect(() => {
    loadAllLevels().then(words => setLookup(buildLookup(words)))
    loadImages().then(map => setSamples(
      SAMPLE_IDS.flatMap(s => (map[s.id] ? [{ ...s, image: map[s.id]! }] : []))
    ))
  }, [])

  useEffect(() => { saveLast(session) }, [session])

  async function describe(image: string, credit?: WordImage) {
    setError(null)
    setPending(image)
    try {
      const body = credit
        ? { imageUrl: image }
        : { image: image.split(',')[1], mediaType: image.slice(5, image.indexOf(';')) }
      const res = await fetch('/api/teacher?action=describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth && { Authorization: `Bearer ${auth.access_token}` }),
        },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.levels) throw new Error(data?.error ?? 'Something went wrong — please try again.')
      setOpenEnglish(new Set())
      setSession({ image, credit, ladder: data, revealed: 1, attempts: {} })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — please try again.')
    } finally {
      setPending(null)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      describe(await prepareImage(file))
    } catch {
      setError("That file couldn't be opened as a photo. Try a JPEG or PNG.")
    }
  }

  function reveal(n: number) {
    setSession(s => s && { ...s, revealed: Math.max(s.revealed, n) })
  }

  function goToStep(level: number) {
    reveal(level)
    // Wait a frame so a newly revealed level exists before scrolling to it
    requestAnimationFrame(() => document.getElementById(`describe-rung-${level}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function saveImage() {
    if (!session) return
    setSaving(true)
    setError(null)
    try {
      const { ladder, revealed, credit } = session
      const blob = await renderDescribeCard({
        image: session.image,
        title: ladder.title,
        titleEn: ladder.titleEn,
        labels: showLabels ? ladder.labels ?? [] : [],
        levels: ladder.levels.slice(0, revealed).map((l, i) => ({ badge: `HSK ${levelLabel(RUNGS[i].level)}`, layer: RUNGS[i].layer, zh: l.zh })),
        totalLevels: RUNGS.length,
        credit: credit && `Photo: ${credit.author}, ${credit.license}, via Wikimedia Commons`,
      })
      await shareOrDownload(blob, `describe-it-${ladder.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'photo'}.png`, ladder.title)
    } catch {
      setError("Couldn't make the image — try again.")
    } finally {
      setSaving(false)
    }
  }

  function setAttempt(level: number, text: string) {
    setSession(s => s && { ...s, attempts: { ...s.attempts, [level]: text } })
  }

  function toggleEnglish(level: number) {
    setOpenEnglish(prev => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  // ── Picking a photo / waiting ───────────────────────────────────────────────
  if (!session || pending) {
    return (
      <div className="browser-page">
        <AppHeader />
        <div className="practice-page describe-page">
          <Link to="/guides" className="back-link">← Guides</Link>
          <h1 className="describe-title">Describe It <span lang="zh-CN">看图说话</span></h1>
          <p className="describe-desc">
            Take or upload a photo and climb seven levels of Chinese describing it, one HSK level at a time.
            First <em>what</em> is happening, then <em>where</em>, the <em>details</em>, <em>why</em>, what probably happens <em>next</em>,
            an <em>opinion</em>, and finally polished <em>written Chinese</em>.
          </p>

          {pending ? (
            <div className="describe-pending">
              <img src={pending} alt="Your photo" className="describe-photo" />
              <div className="describe-spinner" aria-live="polite">
                Writing seven levels of description… this takes about half a minute.
              </div>
            </div>
          ) : (
            <PremiumWall
              feature="describe-it"
              title="Describe It is part of Pro"
              description="Each photo is described by Claude, which costs us per photo. Sign in with a Pro account to use it."
            >
              <label className="describe-upload">
                <input type="file" accept="image/*" onChange={onFile} />
                <span className="describe-upload-icon" aria-hidden="true"><Icon name="camera" size={34} /></span>
                <span className="describe-upload-text">Take or choose a photo</span>
                <span className="describe-upload-sub">Something from your day works best: a street, a meal, your desk</span>
              </label>
              {error && <p className="describe-error" role="alert">{error}</p>}

              {samples.length > 0 && (
                <div className="describe-samples">
                  <div className="reader-samples-title">Or try a sample</div>
                  <div className="describe-sample-grid">
                    {samples.map(s => (
                      <button key={s.id} className="describe-sample" onClick={() => describe(s.image.src, s.image)}>
                        <img src={s.image.src} alt={s.en} loading="lazy" />
                        <span><span lang="zh-CN">{s.label}</span> · {s.en}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="describe-privacy">
                Your photo is sent to Anthropic (Claude) to write the descriptions and isn't stored by us. Avoid photos
                with personal details you wouldn't want to share.
              </p>
            </PremiumWall>
          )}
        </div>
      </div>
    )
  }

  // ── The ladder ──────────────────────────────────────────────────────────────
  const { ladder, revealed, attempts } = session
  const next = revealed < RUNGS.length ? RUNGS[revealed] : null

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="practice-page describe-page">
        <div className="describe-topbar">
          <button className="back-link describe-new-btn" onClick={() => setSession(null)}>← New photo</button>
          <SpeedToggle />
        </div>

        <figure className="describe-figure">
          <LabelledPhoto src={session.image} alt={ladder.titleEn || 'Your photo'} labels={showLabels ? ladder.labels ?? [] : []} />
          {session.credit && (
            <figcaption>
              Photo: <a href={session.credit.page} target="_blank" rel="noopener noreferrer">{session.credit.author}</a>, {session.credit.license}, via Wikimedia Commons
            </figcaption>
          )}
        </figure>

        <div className="describe-heading">
          <h1 lang="zh-CN">{ladder.title}</h1>
          <span>{ladder.titleEn}</span>
        </div>

        <Staircase levels={ladder.levels} revealed={revealed} onStep={goToStep} />

        <div className="describe-tools">
          {(ladder.labels?.length ?? 0) > 0 && (
            <label className="describe-pinyin-toggle">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} /> Labels
            </label>
          )}
          <label className="describe-pinyin-toggle">
            <input type="checkbox" checked={showPinyin} onChange={e => setShowPinyin(e.target.checked)} /> Pinyin
          </label>
          <button className="describe-save-btn" onClick={saveImage} disabled={saving}>
            {saving ? 'Saving…' : 'Save image'}
          </button>
        </div>
        {error && <p className="describe-error" role="alert">{error}</p>}

        <ol className="describe-ladder">
          {ladder.levels.slice(0, revealed).map((rung, i) => {
            const meta = RUNGS[i]
            return (
              <li key={meta.level} id={`describe-rung-${meta.level}`} className="describe-rung">
                <div className="describe-rung-head">
                  <span className="describe-rung-badge">HSK {levelLabel(meta.level)}</span>
                  <span className="describe-rung-layer">{meta.layer}</span>
                  <ReadAloud text={rung.zh} label="Listen" />
                </div>
                {rung.focus && <div className="describe-focus">{rung.focus}</div>}
                {attempts[meta.level]?.trim() && (
                  <div className="describe-attempt">
                    <span>Your try</span>
                    <p lang="zh-CN">{attempts[meta.level]}</p>
                  </div>
                )}
                <p className="describe-zh" lang="zh-CN"><ClickableText text={rung.zh} lookup={lookup} /></p>
                {showPinyin && <p className="describe-pinyin">{rung.pinyin}</p>}
                {openEnglish.has(meta.level)
                  ? <p className="describe-en">{rung.en}</p>
                  : <button className="describe-en-btn" onClick={() => toggleEnglish(meta.level)}>Show English</button>}
                {rung.keywords.length > 0 && (
                  <ul className="describe-keywords">
                    {rung.keywords.map(k => {
                      const word = lookup.get(k.zh)
                      const inReview = word && getCard(word.id)
                      return (
                        <li key={k.zh}>
                          {word
                            ? <Link to={`/word/${word.id}`} className="describe-kw-zh" lang="zh-CN">{k.zh}</Link>
                            : <span className="describe-kw-zh" lang="zh-CN">{k.zh}</span>}
                          <span className="describe-kw-py">{k.pinyin}</span>
                          <span className="describe-kw-en">{k.en}</span>
                          {word && (inReview
                            ? <span className="describe-kw-state">✓ in review</span>
                            : <button className="describe-kw-add" onClick={() => review(word.id, 'again')}>+ Review</button>)}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}

          {next && (
            <li id={`describe-rung-${next.level}`} className="describe-rung describe-rung-locked">
              <div className="describe-rung-head">
                <span className="describe-rung-badge">HSK {levelLabel(next.level)}</span>
                <span className="describe-rung-layer">{next.layer}</span>
              </div>
              <p className="describe-ask" lang="zh-CN">{ladder.levels[revealed].ask}</p>
              <p className="describe-ask-en">{ladder.levels[revealed].askEn} <span>· {next.hint}</span></p>
              <textarea
                className="describe-try"
                rows={2}
                lang="zh-CN"
                placeholder="Try it yourself first (optional): say it aloud or type it here"
                value={attempts[next.level] ?? ''}
                onChange={e => setAttempt(next.level, e.target.value)}
              />
              <div className="describe-locked-actions">
                <button className="btn-primary" onClick={() => reveal(next.level)}>
                  Reveal HSK {levelLabel(next.level)} ↑
                </button>
                <button className="btn-secondary" onClick={() => reveal(RUNGS.length)}>Show all</button>
              </div>
            </li>
          )}
        </ol>

        {!next && (
          <div className="describe-done">
            <p>You climbed all seven levels. Tap any word above to look it up, or try another photo.</p>
            <button className="btn-primary" onClick={() => setSession(null)}>New photo</button>
          </div>
        )}
      </div>
    </div>
  )
}
