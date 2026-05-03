import { Link } from 'react-router-dom'
import vocab from '../data/vocab'
import AppHeader from '../components/AppHeader'
import TonedPinyin from '../components/TonedPinyin'
import AudioButton from '../components/AudioButton'
import { useFavourites } from '../hooks/useFavourites'

export default function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites()
  const words = vocab.filter(w => favourites.has(w.id))

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="browser-controls">
        <h2 className="page-title">★ Favourites</h2>
        <span className="result-count">{words.length} word{words.length !== 1 ? 's' : ''}</span>
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
