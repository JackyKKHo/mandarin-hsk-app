import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import { useSEO } from '../hooks/useSEO'
import { SONGS } from '../data/songs'

const HSK_COLOR: Record<number, string> = {
  1: '#27ae60', 2: '#2ecc71', 3: '#f39c12',
  4: '#e67e22', 5: '#8e44ad', 6: '#9b59b6',
  7: '#c0392b', 8: '#e74c3c', 9: '#7f8c8d',
}

export default function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>()
  const song = SONGS.find(s => s.id === songId)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)

  useSEO({
    title: song ? `${song.title} — Chinese Song Breakdown` : 'Song Breakdown',
    description: song?.description ?? '',
    path: `/songs/${songId}`,
  })

  if (!song) {
    return (
      <div className="browser-page">
        <AppHeader />
        <div className="empty-state" style={{ marginTop: '4rem' }}>Song not found. <Link to="/songs">Back to songs</Link></div>
      </div>
    )
  }

  return (
    <div className="browser-page">
      <AppHeader />

      <article className="song-article">
        {/* Header */}
        <div className="song-article-header">
          <Link to="/songs" className="back-link">← Songs</Link>
          <div className="song-article-title-block">
            <h1 className="song-article-title">{song.title}</h1>
            <div className="song-article-pinyin">{song.titlePinyin}</div>
            <div className="song-article-meta">
              <span className="song-article-artist">{song.artist}</span>
              <span className="song-article-year">{song.year}</span>
              <span className="song-article-hsk">{song.hskRange}</span>
            </div>
          </div>
          <p className="song-article-desc">{song.description}</p>
        </div>

        {/* YouTube embed */}
        <div className="song-video-wrap">
          <iframe
            className="song-video"
            src={`https://www.youtube.com/embed/${song.youtubeId}`}
            title={song.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Cultural note */}
        <div className="song-callout song-callout-culture">
          <div className="song-callout-label">🏮 Cultural context</div>
          <p>{song.culturalNote}</p>
        </div>

        {/* Lyric controls */}
        <div className="song-lyric-controls">
          <span className="song-lyric-controls-label">Show:</span>
          <button
            className={`song-toggle-btn${showPinyin ? ' active' : ''}`}
            onClick={() => setShowPinyin(v => !v)}
          >
            Pinyin
          </button>
          <button
            className={`song-toggle-btn${showTranslation ? ' active' : ''}`}
            onClick={() => setShowTranslation(v => !v)}
          >
            Translation
          </button>
        </div>

        {/* Lyrics */}
        <div className="song-lyrics">
          {song.sections.map(section => (
            <div key={section.label} className="song-section">
              <div className="song-section-label">{section.label}</div>
              {section.lines.map((line, i) => (
                <div key={i} className="song-line">
                  <div className="song-line-chinese">{line.chinese}</div>
                  {showPinyin && (
                    <TonedPinyin pinyin={line.pinyin} className="song-line-pinyin" />
                  )}
                  {showTranslation && (
                    <div className="song-line-english">{line.english}</div>
                  )}
                  {line.note && (
                    <div className="song-line-note">💡 {line.note}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Learning tips */}
        <div className="song-callout song-callout-tips">
          <div className="song-callout-label">📖 Grammar & usage notes</div>
          <ul className="song-tips-list">
            {song.learningTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Vocabulary */}
        <div className="song-vocab-section">
          <h2 className="song-section-heading">Key vocabulary</h2>
          <p className="song-vocab-intro">
            These words from the song are worth learning — most appear across many other contexts.
          </p>
          <div className="song-vocab-grid">
            {song.vocab.map(v => (
              <div key={v.simplified} className="song-vocab-card">
                <div className="song-vocab-top">
                  <span className="song-vocab-char">{v.simplified}</span>
                  <span
                    className="song-vocab-hsk"
                    style={{ background: HSK_COLOR[v.hskLevel] + '22', color: HSK_COLOR[v.hskLevel] }}
                  >
                    HSK {v.hskLevel}
                  </span>
                </div>
                <TonedPinyin pinyin={v.pinyin} className="song-vocab-pinyin" />
                <div className="song-vocab-english">{v.english}</div>
                <div className="song-vocab-note">{v.note}</div>
                <Link to={`/search?q=${encodeURIComponent(v.simplified)}`} className="song-vocab-search">
                  Search in vocab →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div className="song-article-footer">
          <Link to="/songs" className="btn-secondary">← All songs</Link>
          {SONGS.find(s => s.id !== song.id) && (
            <Link
              to={`/songs/${SONGS.find(s => s.id !== song.id)!.id}`}
              className="btn-primary"
            >
              Next song →
            </Link>
          )}
        </div>
      </article>
    </div>
  )
}
