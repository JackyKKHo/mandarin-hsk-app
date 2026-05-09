import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { DIALOGUES } from '../data/dialogues'

export default function DialoguesPage() {
  const byLevel = [1, 2, 3, 4, 5].map(level => ({
    level,
    items: DIALOGUES.filter(d => d.hskLevel === level),
  })).filter(g => g.items.length > 0)

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="dialogues-hero">
        <div className="dialogues-hero-text">
          <div className="dialogues-hero-label">Real-life Chinese</div>
          <h2 className="dialogues-hero-title">Situational Dialogues</h2>
          <p className="dialogues-hero-sub">
            Short conversations set in real situations — coffee shops, taxis, WeChat chats.
            Tap any line to see pinyin and translation.
          </p>
        </div>
        <div className="dialogues-hero-icon">🇨🇳</div>
      </div>

      {byLevel.map(({ level, items }) => (
        <div key={level} className="dialogues-group">
          <div className="dialogues-group-label">HSK {level} level</div>
          <div className="dialogues-grid">
            {items.map(d => (
              <Link key={d.id} to={`/dialogue/${d.id}`} className="dialogue-card">
                <span className="dialogue-card-emoji">{d.emoji}</span>
                <div className="dialogue-card-body">
                  <div className="dialogue-card-title">{d.title}</div>
                  <div className="dialogue-card-zh">{d.titleZh}</div>
                  <div className="dialogue-card-situation">{d.situation}</div>
                  <div className="dialogue-card-lines">{d.lines.length} lines</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
