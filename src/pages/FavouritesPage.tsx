import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useVocab } from '../hooks/useVocab'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useFavourites } from '../hooks/useFavourites'

export default function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites()
  const { words: allWords } = useVocab()
  const words = allWords.filter(w => favourites.has(w.id))
  const [practiceOpen, setPracticeOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setPracticeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Store favourite IDs in sessionStorage so practice pages can read them
  function openPractice(path: string) {
    sessionStorage.setItem('practice-ids', JSON.stringify([...favourites]))
    setPracticeOpen(false)
    window.location.href = path
  }

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="browser-controls">
        <h2 className="page-title">★ Favourites</h2>
        <span className="result-count">{words.length} word{words.length !== 1 ? 's' : ''}</span>
        {words.length >= 4 && (
          <div className="practice-menu-wrap" ref={menuRef}>
            <button className="btn-practice practice-menu-trigger" onClick={() => setPracticeOpen(o => !o)}>
              Practice ▾
            </button>
            {practiceOpen && (
              <div className="practice-menu-dropdown">
                {[
                  { path: '/practice/favourites', label: '🃏 Flashcards', sub: 'Spaced repetition' },
                  { path: '/quiz/favourites',     label: '❓ Quiz',        sub: 'Multiple choice' },
                  { path: '/listen/favourites',   label: '🔊 Listening',   sub: 'Hear & identify' },
                  { path: '/fill/favourites',     label: '✏️ Fill blank',   sub: 'Complete sentences' },
                ].map(({ path, label, sub }) => (
                  <button key={path} className="practice-menu-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => openPractice(path)}>
                    <span className="pmi-label">{label}</span>
                    <span className="pmi-sub">{sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {words.length === 0 ? (
        <p className="empty-state">No favourites yet — tap ☆ on any word to save it here.</p>
      ) : (
        <div className="vocab-grid">
          {words.map(word => (
            <Link key={word.id} to={`/word/${word.id}`} className="vocab-card">
              <div className="card-chinese">{word.simplified}</div>
              <TonedPinyin pinyin={word.pinyin} className="card-pinyin" />
              <div className="card-english">{word.english}</div>
              <div className="card-footer">
                <span className="card-pos">{word.partOfSpeech}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    className="action-btn fav-btn active"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavourite(word.id) }}
                    title="Remove from favourites"
                  >★</button>
                  <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label={`Play ${word.simplified}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
