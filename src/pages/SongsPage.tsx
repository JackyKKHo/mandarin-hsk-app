import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'
import { SONGS } from '../data/songs'

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#27ae60',
  Elementary: '#e67e22',
  Intermediate: '#8e44ad',
}

export default function SongsPage() {
  useSEO({
    title: 'Learn Mandarin Through Songs',
    description: 'Lyric breakdowns, pinyin, vocabulary, and cultural notes for the most famous Chinese songs.',
    path: '/songs',
  })

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="songs-hero">
        <div className="songs-hero-icon">🎵</div>
        <h2>Learn Through Songs</h2>
        <p className="songs-hero-desc">
          Famous Chinese songs broken down line by line — lyrics, pinyin, translations, vocabulary, and cultural context.
          One of the best ways to absorb natural Mandarin.
        </p>
      </div>

      <div className="songs-list">
        {SONGS.map(song => (
          <Link key={song.id} to={`/songs/${song.id}`} className="song-card">
            <div className="song-card-left">
              <div className="song-title">{song.title}</div>
              <div className="song-pinyin">{song.titlePinyin}</div>
              <div className="song-artist">{song.artist} · {song.year}</div>
              <p className="song-desc">{song.description.slice(0, 120)}…</p>
            </div>
            <div className="song-card-right">
              <span
                className="song-difficulty"
                style={{ background: DIFFICULTY_COLOR[song.difficulty] + '22', color: DIFFICULTY_COLOR[song.difficulty] }}
              >
                {song.difficulty}
              </span>
              <span className="song-hsk">{song.hskRange}</span>
              <span className="song-read-link">Read breakdown →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
