import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useVocab } from '../hooks/useVocab'
import { useProgress } from '../hooks/useProgress'
import { useSEO } from '../hooks/useSEO'
import { normalizePOS } from '../types'

const COVERAGE = [
  { label: 'HSK 1', cumWords: 497,  pct: 64, desc: 'Basic greetings, numbers, daily essentials' },
  { label: 'HSK 1–2', cumWords: 1260, pct: 75, desc: 'Simple conversations, shopping, travel' },
  { label: 'HSK 1–3', cumWords: 2226, pct: 85, desc: 'Most everyday situations' },
  { label: 'HSK 1–4', cumWords: 3220, pct: 92, desc: 'News, opinions, abstract topics' },
  { label: 'HSK 1–5', cumWords: 4287, pct: 96, desc: 'Literature, professional contexts' },
  { label: 'HSK 1–6', cumWords: 5421, pct: 98, desc: 'Near-native coverage' },
]

const LEVEL_COLORS: Record<number, string> = {
  1: '#c0392b', 2: '#d35400', 3: '#d4a017',
  4: '#27ae60', 5: '#2471a3', 6: '#8e44ad',
  7: '#16a085', 8: '#2c3e50', 9: '#7f8c8d',
}

const POS_COLORS: Record<string, string> = {
  noun: '#2471a3', verb: '#27ae60', adjective: '#d35400',
  adverb: '#8e44ad', measure: '#c0392b', particle: '#7f8c8d',
  pronoun: '#16a085', conjunction: '#d4a017', other: '#95a5a6',
}

function posGroup(pos: string): string {
  const p = pos?.toLowerCase() ?? ''
  if (p.includes('noun') || p.includes('名词')) return 'noun'
  if (p.includes('verb') || p.includes('动词')) return 'verb'
  if (p.includes('adj') || p.includes('形容')) return 'adjective'
  if (p.includes('adv') || p.includes('副词')) return 'adverb'
  if (p.includes('measure') || p.includes('量词')) return 'measure'
  if (p.includes('particle') || p.includes('助词') || p.includes('语气')) return 'particle'
  if (p.includes('pronoun') || p.includes('代词')) return 'pronoun'
  if (p.includes('conj') || p.includes('连词')) return 'conjunction'
  return 'other'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FrequencyPage() {
  useSEO({ title: 'Word Frequency — How Vocabulary Covers Real Chinese', path: '/frequency' })
  const { words, loading } = useVocab()
  const { learned } = useProgress()

  const [activeLevels, setActiveLevels] = useState<Set<number>>(new Set([1, 2, 3]))
  const [activePOS, setActivePOS] = useState<string | null>(null)

  function toggleLevel(l: number) {
    setActiveLevels(prev => {
      const next = new Set(prev)
      if (next.has(l)) { if (next.size > 1) next.delete(l) }
      else next.add(l)
      return next
    })
  }

  // Word cloud words — shuffle once on load (stable ref via useMemo)
  const cloudWords = useMemo(() => {
    if (!words.length) return []
    const filtered = words.filter(w => w.hskLevel <= 6)
    return shuffle(filtered)
  }, [words.length > 0])  // eslint-disable-line

  const visibleWords = useMemo(
    () => cloudWords.filter(w =>
      activeLevels.has(w.hskLevel) &&
      (activePOS === null || normalizePOS(w.partOfSpeech).some(p => posGroup(p) === activePOS))
    ),
    [cloudWords, activeLevels, activePOS]
  )

  // POS breakdown per level
  const posBreakdown = useMemo(() => {
    if (!words.length) return []
    return [1,2,3,4,5,6,7,8,9].map(l => {
      const lw = words.filter(w => w.hskLevel === l)
      const counts: Record<string, number> = {}
      for (const w of lw) {
        const g = posGroup(normalizePOS(w.partOfSpeech)[0] ?? '')
        counts[g] = (counts[g] ?? 0) + 1
      }
      return { level: l, total: lw.length, counts }
    })
  }, [words])

  // Top characters by frequency across all word simplified forms
  const topChars = useMemo(() => {
    if (!words.length) return []
    const freq: Record<string, number> = {}
    for (const w of words) {
      for (const ch of w.simplified) {
        if (/[\u4e00-\u9fff]/.test(ch)) freq[ch] = (freq[ch] ?? 0) + 1
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([char, count]) => {
        const word = words.find(w => w.simplified === char)
        return { char, count, word }
      })
  }, [words])

  const posKeys = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'conjunction', 'particle', 'measure', 'other']

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="freq-page">

        <div className="freq-hero">
          <h2 className="freq-title">Word Frequency</h2>
          <p className="freq-subtitle">How much of real Chinese do you unlock at each vocabulary milestone?</p>
        </div>

        {/* Coverage curve */}
        <section className="freq-section">
          <h3 className="freq-section-title">Coverage of Everyday Speech</h3>
          <p className="freq-note">Approximate figures based on spoken Mandarin corpus research.</p>
          <div className="coverage-list">
            {COVERAGE.map((c, i) => {
              const prev = i === 0 ? 0 : COVERAGE[i - 1].pct
              const gain = c.pct - prev
              return (
                <div key={c.label} className="coverage-row">
                  <div className="coverage-row-head">
                    <span className="coverage-label">{c.label}</span>
                    <span className="coverage-words">{c.cumWords.toLocaleString()} words</span>
                    <span className="coverage-pct">{c.pct}%</span>
                    {i > 0 && <span className="coverage-gain">+{gain}%</span>}
                  </div>
                  <div className="coverage-bar-track">
                    <div className="coverage-bar-fill" style={{ width: `${c.pct}%` }} />
                    {i > 0 && (
                      <div
                        className="coverage-bar-gain"
                        style={{ width: `${gain}%`, left: `${prev}%` }}
                      />
                    )}
                  </div>
                  <p className="coverage-desc">{c.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* POS breakdown */}
        <section className="freq-section">
          <h3 className="freq-section-title">Vocabulary Composition by Level</h3>
          <p className="freq-note">How each HSK level breaks down by part of speech.</p>
          <div className="pos-legend">
            {posKeys.map(p => (
              <span key={p} className="pos-legend-item">
                <span className="pos-legend-dot" style={{ background: POS_COLORS[p] }} />
                {p}
              </span>
            ))}
          </div>
          <div className="pos-breakdown">
            {posBreakdown.map(({ level, total, counts }) => (
              <div key={level} className="pos-row">
                <span className="pos-row-label" style={{ color: LEVEL_COLORS[level] }}>HSK {level}</span>
                <div className="pos-bar">
                  {posKeys.map(p => {
                    const w = ((counts[p] ?? 0) / total) * 100
                    return w > 0 ? (
                      <div
                        key={p}
                        className="pos-bar-seg"
                        style={{ width: `${w}%`, background: POS_COLORS[p] }}
                        title={`${p}: ${counts[p] ?? 0} (${Math.round(w)}%)`}
                      />
                    ) : null
                  })}
                </div>
                <span className="pos-row-total">{total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Word cloud */}
        <section className="freq-section">
          <h3 className="freq-section-title">Word Cloud</h3>
          <p className="freq-note">Font size reflects frequency tier — bigger = more common. Hover for meaning.</p>
          <div className="cloud-controls">
            <div className="cloud-level-chips">
              {[1,2,3,4,5,6].map(l => (
                <button
                  key={l}
                  className={`cloud-chip${activeLevels.has(l) ? ' active' : ''}`}
                  style={activeLevels.has(l) ? { background: LEVEL_COLORS[l], borderColor: LEVEL_COLORS[l] } : {}}
                  onClick={() => toggleLevel(l)}
                >
                  HSK {l}
                </button>
              ))}
            </div>
            <div className="cloud-pos-chips">
              <button
                className={`cloud-chip${activePOS === null ? ' active' : ''}`}
                style={activePOS === null ? { background: '#555', borderColor: '#555' } : {}}
                onClick={() => setActivePOS(null)}
              >all</button>
              {['noun','verb','adjective','adverb'].map(p => (
                <button
                  key={p}
                  className={`cloud-chip${activePOS === p ? ' active' : ''}`}
                  style={activePOS === p ? { background: POS_COLORS[p], borderColor: POS_COLORS[p] } : {}}
                  onClick={() => setActivePOS(activePOS === p ? null : p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="freq-note" style={{ padding: '2rem 0' }}>Loading vocabulary…</p>
          ) : (
            <div className="word-cloud">
              {visibleWords.map((w, i) => {
                const rot = ((i * 17) % 7) - 3  // subtle deterministic rotation -3..+3 deg
                const isLearned = learned.has(w.id)
                return (
                  <Link
                    key={w.id}
                    to={`/word/${w.id}`}
                    className={`cloud-word cloud-l${w.hskLevel}${isLearned ? ' cloud-learned' : ''}`}
                    style={{ transform: `rotate(${rot}deg)`, color: LEVEL_COLORS[w.hskLevel] }}
                    title={`${w.pinyin} — ${w.english}`}
                  >
                    {w.simplified}
                  </Link>
                )
              })}
              {visibleWords.length === 0 && (
                <p className="freq-note">No words match the current filters.</p>
              )}
            </div>
          )}
          <p className="cloud-count">{visibleWords.length.toLocaleString()} words shown</p>
        </section>

        {/* Top characters */}
        <section className="freq-section">
          <h3 className="freq-section-title">Most Frequent Characters</h3>
          <p className="freq-note">Individual hanzi ranked by how many HSK vocabulary words they appear in — these are the building blocks of Chinese.</p>
          {loading ? (
            <p className="freq-note">Loading…</p>
          ) : (
            <div className="char-freq-grid">
              {topChars.map(({ char, count, word }, i) => (
                <div key={char} className="char-freq-card">
                  <span className="char-freq-rank">#{i + 1}</span>
                  {word ? (
                    <Link to={`/word/${word.id}`} className="char-freq-hanzi">{char}</Link>
                  ) : (
                    <span className="char-freq-hanzi">{char}</span>
                  )}
                  <span className="char-freq-count">{count} words</span>
                  {word && <span className="char-freq-meaning">{word.english}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="freq-footer-note">
          Coverage percentages are approximations based on frequency corpus studies of spoken Mandarin.
          Actual coverage varies by context (formal vs. informal, spoken vs. written).
        </p>
      </div>
    </div>
  )
}
