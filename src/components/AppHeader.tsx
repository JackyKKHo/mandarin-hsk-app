import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFavourites } from '../hooks/useFavourites'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import AuthModal from './AuthModal'

const NAV = [
  { to: '/hsk/1',      emoji: '📚', label: 'Vocab',      section: 'vocab' },
  { to: '/course',     emoji: '🎓', label: 'Course',     section: 'course' },
  { to: '/dialogues',  emoji: '💬', label: 'Dialogues',  section: 'dialogues' },
  { to: '/grammar/1',  emoji: '📖', label: 'Grammar',    section: 'grammar' },
  { to: '/guides',     emoji: '🧭', label: 'Guides',     section: 'guides' },
  { to: '/search',     emoji: '🔍', label: 'Search',     section: 'search' },
  { to: '/assessment', emoji: '🎯', label: 'Assess',     section: 'assessment' },
  { to: '/flashcards', emoji: '🗂', label: 'Cards',      section: 'flashcards' },
]

const GUIDES_DROPDOWN = [
  { to: '/guides',     emoji: '🧭', label: 'All Guides' },
  { to: '/reading',    emoji: '📖', label: 'Reading Practice' },
  { to: '/cantonese',  emoji: '粵', label: 'Cantonese → Mandarin' },
  { to: '/frequency',  emoji: '📊', label: 'Word Frequency' },
  { to: '/daily',      emoji: '📅', label: 'Daily Challenge' },
  { to: '/songs',      emoji: '🎵', label: 'Learn Through Songs' },
  { to: '/radicals',   emoji: '字', label: 'Radicals' },
]

export default function AppHeader() {
  const { pathname } = useLocation()
  const { favourites } = useFavourites()
  const { dark, toggle } = useDarkMode()
  const { user, signOut } = useAuth()
  const { streak, freezes, freezeUsed } = useStreak()
  const [showAuth, setShowAuth] = useState(false)
  const [showFreezeToast, setShowFreezeToast] = useState(freezeUsed)
  const [guidesOpen, setGuidesOpen] = useState(false)
  const guidesRef = useRef<HTMLDivElement>(null)

  const section = pathname.startsWith('/grammar') ? 'grammar'
    : pathname.startsWith('/favourites') ? 'favourites'
    : pathname.startsWith('/search') ? 'search'
    : pathname.startsWith('/stats') ? 'stats'
    : pathname.startsWith('/pronunciation') ? 'pronunciation'
    : pathname.startsWith('/keyboard') ? 'keyboard'
    : pathname.startsWith('/course') ? 'course'
    : pathname.startsWith('/dialogue') ? 'dialogues'
    : pathname.startsWith('/guides') || pathname.startsWith('/radicals') || pathname.startsWith('/measure-words') || pathname.startsWith('/daily') || pathname.startsWith('/songs') || pathname.startsWith('/tone') || pathname.startsWith('/scramble') || pathname === '/cantonese' || pathname === '/frequency' ? 'guides'
    : pathname.startsWith('/assessment') ? 'assessment'
    : 'vocab'

  return (
    <header className="app-header">
      <Link to="/hsk/1" className="app-logo">
        <span className="app-logo-mark">汉</span>
        <span className="app-logo-text">
          <span className="app-logo-en">Mandarin Daily</span>
          <span className="app-logo-zh">每日普通话</span>
        </span>
      </Link>
      {showFreezeToast && (
        <div className="freeze-toast" onClick={() => setShowFreezeToast(false)}>
          🛡️ Streak protected by a freeze token! ({freezes} left)
        </div>
      )}
      <nav className="app-nav">
        {NAV.map(({ to, emoji, label, section: s }) => {
          if (s === 'guides') {
            return (
              <div
                key={to}
                ref={guidesRef}
                className="app-nav-guides-wrap"
                onMouseEnter={() => setGuidesOpen(true)}
                onMouseLeave={() => setGuidesOpen(false)}
              >
                <Link to={to} className={`app-nav-link${section === s ? ' active' : ''}`}>
                  <span className="nav-emoji">{emoji}</span>
                  <span className="nav-label">{label} ▾</span>
                </Link>
                {guidesOpen && (
                  <div className="app-nav-dropdown">
                    {GUIDES_DROPDOWN.map(d => (
                      <Link
                        key={d.to}
                        to={d.to}
                        className={`app-nav-dd-item${pathname === d.to || (d.to === '/guides' && section === 'guides') ? ' active' : ''}`}
                        onClick={() => setGuidesOpen(false)}
                      >
                        <span className="app-nav-dd-emoji">{d.emoji}</span>
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <Link key={to} to={to} className={`app-nav-link${section === s ? ' active' : ''}`}>
              <span className="nav-emoji">{emoji}</span>
              <span className="nav-label">{label}</span>
            </Link>
          )
        })}

        <Link to="/stats" className={`app-nav-link${section === 'stats' ? ' active' : ''}`} title="Stats">
          <span className="nav-emoji">
            {streak > 0 ? (
              <span className="streak-display">
                🔥{streak}{freezes > 0 && <span className="freeze-count">🛡️{freezes}</span>}
              </span>
            ) : '📊'}
          </span>
          <span className="nav-label">Stats</span>
        </Link>

        <Link to="/favourites" className={`app-nav-link${section === 'favourites' ? ' active' : ''}`}>
          <span className="nav-emoji">★{favourites.size > 0 && <span className="fav-count">{favourites.size}</span>}</span>
          <span className="nav-label">Saved</span>
        </Link>

        <button className="dark-toggle" onClick={toggle} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>

        {user ? (
          <button className="app-nav-link app-nav-signout" onClick={signOut} title={user.email}>
            Sign out
          </button>
        ) : (
          <button className="app-nav-link app-nav-signin" onClick={() => setShowAuth(true)}>
            Sign in
          </button>
        )}
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  )
}
