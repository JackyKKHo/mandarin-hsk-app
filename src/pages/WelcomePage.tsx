import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LEVELS = [
  { level: 1, label: 'HSK 1', words: 500,  tag: 'Beginner',     desc: 'Basic greetings, numbers, family' },
  { level: 2, label: 'HSK 2', words: 772,  tag: 'Beginner',     desc: 'Simple daily conversations' },
  { level: 3, label: 'HSK 3', words: 973,  tag: 'Elementary',   desc: 'Travel, shopping, work basics' },
  { level: 4, label: 'HSK 4', words: 1000, tag: 'Elementary',   desc: 'Wider topics, opinions, feelings' },
  { level: 5, label: 'HSK 5', words: 1071, tag: 'Intermediate', desc: 'News, literature, abstract topics' },
  { level: 6, label: 'HSK 6', words: 1140, tag: 'Intermediate', desc: 'Near-fluent, complex texts' },
  { level: 7, label: 'HSK 7', words: 1872, tag: 'Advanced',     desc: 'Professional and academic use' },
  { level: 8, label: 'HSK 8', words: 1872, tag: 'Advanced',     desc: 'Nuanced expression and debate' },
  { level: 9, label: 'HSK 9', words: 1871, tag: 'Advanced',     desc: 'Full native-level proficiency' },
]

const GROUPS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced']

const FEATURES = [
  { icon: '📚', title: 'Browse vocabulary', desc: '11,000+ words across HSK 1–9' },
  { icon: '🧠', title: 'Spaced repetition', desc: 'Smart review scheduling so you never forget' },
  { icon: '🎧', title: 'Audio + stroke order', desc: 'Hear every word, see every stroke' },
  { icon: '🤖', title: 'AI teacher', desc: 'Chat with Lin Wei, your personal tutor' },
]

export function shouldShowWelcome() {
  return !localStorage.getItem('hsk-onboarded')
}

export function markOnboarded() {
  localStorage.setItem('hsk-onboarded', '1')
}

export default function WelcomePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  function finish(level: number) {
    markOnboarded()
    navigate(`/hsk/${level}`)
  }

  function skip() {
    markOnboarded()
    navigate('/hsk/1')
  }

  if (step === 1) {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <div className="welcome-logo">每日普通话</div>
          <h1 className="welcome-title">Mandarin Daily</h1>
          <p className="welcome-tagline">Learn HSK vocabulary the smart way — with spaced repetition, audio, and an AI tutor.</p>

          <div className="welcome-features">
            {FEATURES.map(f => (
              <div key={f.title} className="welcome-feature">
                <span className="welcome-feature-icon">{f.icon}</span>
                <div>
                  <div className="welcome-feature-title">{f.title}</div>
                  <div className="welcome-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary welcome-cta" onClick={() => setStep(2)}>
            Get started →
          </button>
          <button className="welcome-skip" onClick={skip}>Skip</button>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-page">
      <div className="welcome-card welcome-card-wide">
        <h2 className="welcome-pick-title">Where are you starting?</h2>
        <p className="welcome-pick-sub">Pick the highest level you're comfortable with. You can always change it later.</p>

        <div className="welcome-level-groups">
          {GROUPS.map(group => (
            <div key={group} className="welcome-level-group">
              <div className="welcome-group-label">{group}</div>
              <div className="welcome-level-list">
                {LEVELS.filter(l => l.tag === group).map(l => (
                  <button
                    key={l.level}
                    className={`welcome-level-btn${selectedLevel === l.level ? ' selected' : ''}`}
                    onClick={() => setSelectedLevel(l.level)}
                  >
                    <span className="wlb-label">{l.label}</span>
                    <span className="wlb-desc">{l.desc}</span>
                    <span className="wlb-words">{l.words.toLocaleString()} words</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="welcome-pick-actions">
          <button
            className="btn-primary"
            disabled={!selectedLevel}
            onClick={() => selectedLevel && finish(selectedLevel)}
          >
            Start learning →
          </button>
          <button className="welcome-skip" onClick={skip}>Start from HSK 1</button>
        </div>
      </div>
    </div>
  )
}
