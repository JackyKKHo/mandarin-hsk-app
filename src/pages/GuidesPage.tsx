import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'

const GUIDES = [
  { to: '/pronunciation', emoji: '🗣️', title: 'Pronunciation & Tones', desc: 'Tones, initials, finals, and the pinyin system explained.' },
  { to: '/radicals', emoji: '字', title: 'Radicals (部首)', desc: 'The building blocks of Chinese characters — learn to recognise them.' },
  { to: '/measure-words', emoji: '个', title: 'Measure Words (量词)', desc: '20 essential measure words with examples for every pattern.' },
  { to: '/keyboard', emoji: '⌨️', title: 'Pinyin Input', desc: 'How to type Chinese on any device using pinyin input methods.' },
]

const PRACTICE = [
  { to: '/daily', emoji: '📅', title: 'Daily Challenge', desc: 'Ten words from across all HSK levels — refreshes every day.' },
  { to: '/tone/1', emoji: '🎵', title: 'Tone Trainer', desc: 'Listen and identify the correct tones. Per HSK level.' },
  { to: '/scramble/1', emoji: '🔀', title: 'Sentence Scramble', desc: 'Reconstruct scrambled example sentences character by character.' },
]

export default function GuidesPage() {
  useSEO({ title: 'Mandarin Learning Guides & Extra Practice', description: 'Pronunciation guides, Chinese radicals, measure words, daily challenges and more — free resources for Mandarin learners.', path: '/guides' })
  return (
    <div className="browser-page">
      <AppHeader />
      <div className="guides-hero">
        <h2>Guides & Practice</h2>
        <p className="guides-hero-desc">Reference material and extra practice modes beyond the main flashcard deck.</p>
      </div>

      <section className="guides-section">
        <h3 className="guides-section-title">Reference</h3>
        <div className="guides-grid">
          {GUIDES.map(g => (
            <Link key={g.to} to={g.to} className="guide-card">
              <span className="guide-emoji">{g.emoji}</span>
              <div>
                <div className="guide-title">{g.title}</div>
                <div className="guide-desc">{g.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="guides-section">
        <h3 className="guides-section-title">Extra Practice</h3>
        <div className="guides-grid">
          {PRACTICE.map(g => (
            <Link key={g.to} to={g.to} className="guide-card">
              <span className="guide-emoji">{g.emoji}</span>
              <div>
                <div className="guide-title">{g.title}</div>
                <div className="guide-desc">{g.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
