import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFavourites } from '../hooks/useFavourites'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import AuthModal from './AuthModal'

export default function AppHeader() {
  const { pathname } = useLocation()
  const { favourites } = useFavourites()
  const { dark, toggle } = useDarkMode()
  const { user, signOut } = useAuth()
  const { streak, freezes, freezeUsed } = useStreak()
  const [showAuth, setShowAuth] = useState(false)
  const [showFreezeToast, setShowFreezeToast] = useState(freezeUsed)

  const section = pathname.startsWith('/grammar') ? 'grammar'
    : pathname.startsWith('/favourites') ? 'favourites'
    : pathname.startsWith('/search') ? 'search'
    : pathname.startsWith('/stats') ? 'stats'
    : pathname.startsWith('/pronunciation') ? 'pronunciation'
    : pathname.startsWith('/keyboard') ? 'keyboard'
    : pathname.startsWith('/course') ? 'course'
    : pathname.startsWith('/dialogue') ? 'dialogues'
    : pathname.startsWith('/guides') || pathname.startsWith('/radicals') || pathname.startsWith('/measure-words') || pathname.startsWith('/daily') || pathname.startsWith('/songs') ? 'guides'
    : pathname.startsWith('/assessment') ? 'assessment'
    : 'vocab'

  return (
    <header className="app-header">
      <h1>Mandarin Daily <span className="header-zh">每日普通话</span></h1>
      {showFreezeToast && (
        <div className="freeze-toast" onClick={() => setShowFreezeToast(false)}>
          🛡️ Streak protected by a freeze token! ({freezes} left)
        </div>
      )}
      <nav className="app-nav">
        <Link to="/hsk/1" className={`app-nav-link${section === 'vocab' ? ' active' : ''}`}>
          Vocabulary
        </Link>
        <Link to="/course" className={`app-nav-link${section === 'course' ? ' active' : ''}`}>
          Course
        </Link>
        <Link to="/dialogues" className={`app-nav-link${section === 'dialogues' ? ' active' : ''}`}>
          Dialogues
        </Link>
        <Link to="/grammar/1" className={`app-nav-link${section === 'grammar' ? ' active' : ''}`}>
          Grammar
        </Link>
        <Link to="/guides" className={`app-nav-link${section === 'guides' ? ' active' : ''}`}>
          Guides
        </Link>
        <Link to="/assessment" className={`app-nav-link${section === 'assessment' ? ' active' : ''}`} title="Level Assessment">
          🎯
        </Link>
        <Link to="/pronunciation" className={`app-nav-link${section === 'pronunciation' ? ' active' : ''}`}>
          🗣️
        </Link>
        <Link to="/keyboard" className={`app-nav-link${section === 'keyboard' ? ' active' : ''}`} title="Pinyin keyboard guide">
          ⌨️
        </Link>
        <Link to="/search" className={`app-nav-link${section === 'search' ? ' active' : ''}`}>
          🔍
        </Link>
        <Link to="/stats" className={`app-nav-link${section === 'stats' ? ' active' : ''}`} title="Stats">
          {streak > 0 ? (
            <span className="streak-display">
              🔥{streak}{freezes > 0 && <span className="freeze-count">🛡️{freezes}</span>}
            </span>
          ) : '📊'}
        </Link>
        <Link to="/favourites" className={`app-nav-link${section === 'favourites' ? ' active' : ''}`}>
          ★{favourites.size > 0 && <span className="fav-count">{favourites.size}</span>}
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
