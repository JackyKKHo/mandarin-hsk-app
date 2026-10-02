import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFavourites } from '../hooks/useFavourites'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import AuthModal from './AuthModal'
import Icon, { type IconName } from './Icon'

const NAV: { to: string; icon: IconName; label: string; section: string }[] = [
  { to: '/hsk/1',      icon: 'bookOpen',   label: 'Vocab',      section: 'vocab' },
  { to: '/review',     icon: 'repeat',     label: 'Review',     section: 'review' },
  { to: '/course',     icon: 'graduation', label: 'Course',     section: 'course' },
  { to: '/dialogues',  icon: 'message',    label: 'Dialogues',  section: 'dialogues' },
  { to: '/grammar/1',  icon: 'book',       label: 'Grammar',    section: 'grammar' },
  { to: '/guides',     icon: 'compass',    label: 'Guides',     section: 'guides' },
  { to: '/search',     icon: 'search',     label: 'Search',     section: 'search' },
  { to: '/flashcards', icon: 'layers',     label: 'Cards',      section: 'flashcards' },
]

const GUIDES_DROPDOWN = [
  { to: '/guides',     label: 'All guides' },
  { to: '/reading',    label: 'Reading practice' },
  { to: '/cantonese',  label: 'Cantonese → Mandarin' },
  { to: '/frequency',  label: 'Word frequency' },
  { to: '/daily',      label: 'Daily challenge' },
  { to: '/songs',      label: 'Learn through songs' },
  { to: '/radicals',   label: 'Radicals' },
  { to: '/assessment', label: 'Level assessment' },
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
    : pathname.startsWith('/assessment') ? 'guides'
    : pathname === '/review' ? 'review'
    : pathname.startsWith('/flashcards') ? 'flashcards'
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
          Streak protected by a freeze ({freezes} left)
        </div>
      )}
      <nav className="app-nav">
        {NAV.map(({ to, icon, label, section: s }) => {
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
                  <Icon name={icon} />
                  <span className="nav-label">{label}<Icon name="chevronDown" size={10} className="nav-caret" /></span>
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
              <Icon name={icon} />
              <span className="nav-label">{label}</span>
            </Link>
          )
        })}

        <Link to="/stats" className={`app-nav-link${section === 'stats' ? ' active' : ''}`} title="Stats">
          {streak > 0 ? (
            <span className="streak-display">
              <Icon name="flame" />{streak}
              {freezes > 0 && <span className="freeze-count"><Icon name="shield" size={12} />{freezes}</span>}
            </span>
          ) : <Icon name="chart" />}
          <span className="nav-label">Stats</span>
        </Link>

        <Link to="/favourites" className={`app-nav-link${section === 'favourites' ? ' active' : ''}`}>
          <span className="nav-icon-badge">
            <Icon name="star" />
            {favourites.size > 0 && <span className="fav-count">{favourites.size}</span>}
          </span>
          <span className="nav-label">Saved</span>
        </Link>

        <button
          className="dark-toggle"
          onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={dark ? 'sun' : 'moon'} />
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
