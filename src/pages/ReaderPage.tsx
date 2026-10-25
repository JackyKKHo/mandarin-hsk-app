import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { pinyin as toPinyin } from 'pinyin-pro'
import type { VocabItem } from '../types'
import { normalizePOS } from '../types'
import AppHeader from '../components/AppHeader'
import AudioButton from '../components/AudioButton'
import ReadAloud from '../components/ReadAloud'
import SpeedToggle from '../components/SpeedToggle'
import TonedPinyin from '../components/TonedPinyin'
import { useSEO } from '../hooks/useSEO'
import { useSRS } from '../hooks/useSRS'
import { useProgress } from '../hooks/useProgress'
import { useDismissed } from '../hooks/useDismissed'
import { loadAllLevels } from '../data/vocabLoader'
import { levelLabel } from '../data/levels'
import { getPassagesByLevel } from '../data/readingPassages'
import { segment, isHan } from '../lib/segment'
import { readerStats, buildLookup, type WordStatus } from '../lib/reader'

const DRAFT_KEY = 'hsk-reader-text'
const PINYIN_KEY = 'hsk-reader-pinyin'
const MAX_CHARS = 5000

type PinyinMode = 'new' | 'all' | 'off'

const SAMPLES = [2, 4, 6].map(l => getPassagesByLevel(l as 2 | 4 | 6)[0]).filter(Boolean)

function loadDraft(): string {
  try { return localStorage.getItem(DRAFT_KEY) ?? '' } catch { return '' }
}

function loadPinyinMode(): PinyinMode {
  try {
    const v = localStorage.getItem(PINYIN_KEY)
    return v === 'all' || v === 'off' ? v : 'new'
  } catch { return 'new' }
}

export default function ReaderPage() {
  useSEO({
    title: 'Read Any Chinese Text',
    description: 'Paste any Chinese text and see which words you know, tap new words for pinyin and meaning, and add them to your review deck.',
    path: '/reader',
  })

  const [text, setText] = useState(loadDraft)
  const [reading, setReading] = useState(() => loadDraft().trim().length > 0)
  const [pinyinMode, setPinyinMode] = useState<PinyinMode>(loadPinyinMode)
  const [lookup, setLookup] = useState<Map<string, VocabItem> | null>(null)
  const [active, setActive] = useState<VocabItem | null>(null)

  const { review, getCard } = useSRS()
  const { learned, markLearned } = useProgress()
  const { dismissed } = useDismissed()

  useEffect(() => {
    loadAllLevels().then(words => setLookup(buildLookup(words)))
  }, [])

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, text) } catch { /* private mode */ }
  }, [text])

  useEffect(() => {
    try { localStorage.setItem(PINYIN_KEY, pinyinMode) } catch { /* private mode */ }
  }, [pinyinMode])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setActive(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const statusOf = useCallback((id: string): WordStatus => {
    if (learned.has(id) || dismissed.has(id)) return 'known'
    return getCard(id) ? 'learning' : 'new'
  }, [learned, dismissed, getCard])

  const paragraphs = useMemo(() => {
    if (!lookup || !reading) return []
    return text.split(/\n+/).map(p => p.trim()).filter(Boolean).map(p => segment(p, lookup, 5))
  }, [text, lookup, reading])

  const stats = useMemo(() => readerStats(paragraphs.flat(), statusOf), [paragraphs, statusOf])

  function addAllNew() {
    for (const w of stats.newWords) review(w.id, 'again')
  }

  function showPinyin(status: WordStatus | null) {
    if (pinyinMode === 'all') return true
    if (pinyinMode === 'off') return false
    return status !== 'known'
  }

  if (!reading) {
    return (
      <div className="browser-page">
        <AppHeader />
        <div className="practice-page reader-page">
          <Link to="/guides" className="back-link">← Guides</Link>
          <h1 className="reader-title">Read Anything</h1>
          <p className="reader-desc">
            Paste Chinese from a news site, a chat, a book or subtitles. Words you know stay plain,
            new ones are highlighted with pinyin, and one tap adds them to your review deck.
          </p>
          <textarea
            className="reader-input"
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="粘贴中文文本… (paste Chinese text here)"
            rows={10}
            lang="zh-CN"
          />
          <div className="reader-input-meta">{text.length} / {MAX_CHARS}</div>
          <div className="reader-actions">
            <button className="btn-primary" disabled={!text.trim()} onClick={() => setReading(true)}>
              Read →
            </button>
            {text && <button className="btn-secondary" onClick={() => setText('')}>Clear</button>}
          </div>
          {SAMPLES.length > 0 && (
            <div className="reader-samples">
              <div className="reader-samples-title">Or try a sample</div>
              {SAMPLES.map(p => (
                <button
                  key={p.id}
                  className="reader-sample"
                  onClick={() => { setText(p.text); setReading(true) }}
                >
                  <span className="rpb-badge">HSK {p.level}</span> {p.title} · {p.titleEn}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="practice-page reader-page">
        <div className="reader-topbar">
          <button className="back-link reader-edit-btn" onClick={() => { setActive(null); setReading(false) }}>
            ← Edit text
          </button>
          <ReadAloud text={text} />
          <SpeedToggle />
        </div>

        {!lookup ? (
          <p className="reader-desc">Loading dictionary…</p>
        ) : (
          <>
            <div className="reader-stats">
              <div className="reader-coverage">
                <span className="reader-coverage-num">{stats.coverage}%</span>
                <span className="reader-coverage-label">
                  of words known or in review
                  {stats.level && <> · text is about <strong>HSK {levelLabel(stats.level)}</strong></>}
                </span>
              </div>
              <div className="reader-bar" aria-hidden="true">
                <span className="rd-bar-known" style={{ flex: stats.known }} />
                <span className="rd-bar-learning" style={{ flex: stats.learning }} />
                <span className="rd-bar-new" style={{ flex: stats.new }} />
              </div>
              <div className="reader-legend">
                <span><i className="rd-dot rd-dot-known" />{stats.known} known</span>
                <span><i className="rd-dot rd-dot-learning" />{stats.learning} learning</span>
                <span><i className="rd-dot rd-dot-new" />{stats.new} new</span>
                {stats.outside > 0 && <span><i className="rd-dot rd-dot-outside" />{stats.outside} chars outside HSK</span>}
              </div>
            </div>

            <div className="reader-pinyin-modes" role="group" aria-label="Show pinyin">
              <span>Pinyin:</span>
              {(['new', 'all', 'off'] as const).map(m => (
                <button
                  key={m}
                  className={`reader-mode${pinyinMode === m ? ' active' : ''}`}
                  onClick={() => setPinyinMode(m)}
                >
                  {m === 'new' ? 'Unknown words' : m === 'all' ? 'All' : 'Off'}
                </button>
              ))}
            </div>

            <div className="reader-text" lang="zh-CN">
              {paragraphs.map((tokens, pi) => (
                <p key={pi}>
                  {tokens.map((tok, i) => {
                    if (tok.vocab) {
                      const st = statusOf(tok.vocab.id)
                      return (
                        <button
                          key={i}
                          className={`rd-word rd-${st}${active?.id === tok.vocab.id ? ' rd-active' : ''}`}
                          onClick={() => setActive(a => a?.id === tok.vocab!.id ? null : tok.vocab!)}
                        >
                          {showPinyin(st)
                            ? <ruby>{tok.text}<rt>{tok.vocab.pinyin}</rt></ruby>
                            : tok.text}
                        </button>
                      )
                    }
                    if (tok.text.length === 1 && isHan(tok.text)) {
                      const py = toPinyin(tok.text)
                      return (
                        <span key={i} className="rd-outside" title={py}>
                          {showPinyin(null) ? <ruby>{tok.text}<rt>{py}</rt></ruby> : tok.text}
                        </span>
                      )
                    }
                    return <span key={i}>{tok.text}</span>
                  })}
                </p>
              ))}
            </div>

            {stats.newWords.length > 0 && (
              <div className="reader-new">
                <div className="reader-new-head">
                  <h2>{stats.newWords.length} new word{stats.newWords.length === 1 ? '' : 's'}</h2>
                  <button className="btn-primary" onClick={addAllNew}>Add all to review</button>
                </div>
                <ul className="reader-new-list">
                  {stats.newWords.map(w => (
                    <li key={w.id}>
                      <button className="reader-new-item" onClick={() => setActive(w)}>
                        <span className="reader-new-char">{w.simplified}</span>
                        <TonedPinyin pinyin={w.pinyin} />
                        <span className="reader-new-en">{w.english}</span>
                        <span className="reader-new-level">HSK {levelLabel(w.hskLevel)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {active && (
        <div className="ct-popup" role="dialog" aria-label={`${active.simplified} definition`}>
          <div className="ct-popup-header">
            <div className="ct-popup-char">{active.simplified}</div>
            <div className="ct-popup-meta">
              <TonedPinyin pinyin={active.pinyin} className="ct-popup-pinyin" />
              <div className="ct-popup-pos">
                HSK {levelLabel(active.hskLevel)} · {normalizePOS(active.partOfSpeech).join(' · ')}
              </div>
            </div>
            <AudioButton text={active.simplified} audioUrl={active.audio?.wordAudioUrl} />
            <button className="ct-popup-close" onClick={() => setActive(null)} aria-label="Close">✕</button>
          </div>
          <div className="ct-popup-english">{active.english}</div>
          {active.explanation && <div className="ct-popup-note">{active.explanation}</div>}
          <div className="reader-popup-actions">
            {statusOf(active.id) === 'known' ? (
              <span className="reader-popup-state">✓ Known</span>
            ) : (
              <>
                {getCard(active.id)
                  ? <span className="reader-popup-state">In your review deck</span>
                  : <button className="btn-secondary" onClick={() => review(active.id, 'again')}>+ Add to review</button>}
                <button className="btn-secondary" onClick={() => markLearned(active.id)}>I know this</button>
              </>
            )}
          </div>
          <Link to={`/word/${active.id}`} className="ct-popup-link" onClick={() => setActive(null)}>
            View full details →
          </Link>
        </div>
      )}
    </div>
  )
}
