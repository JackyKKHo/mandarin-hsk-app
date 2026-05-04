import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFavourites } from '../hooks/useFavourites'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function AppHeader() {
  const { pathname } = useLocation()
  const { favourites } = useFavourites()
  const { dark, toggle } = useDarkMode()
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  const section = pathname.startsWith('/grammar') ? 'grammar'
    : pathname.startsWith('/favourites') ? 'favourites'
    : pathname.startsWith('/search') ? 'search'
    : pathname.startsWith('/stats') ? 'stats'
    : pathname.startsWith('/pronunciation') ? 'pronunciation'
    : 'vocab'

  return (
    <header className="app-header">
      <h1>Mandarin Daily <span className="header-zh">每日普通话</span></h1>
      <nav className="app-nav">
        <Link to="/hsk/1" className={`app-nav-link${section === 'vocab' ? ' active' : ''}`}>
          Vocabulary
        </Link>
        <Link to="/grammar/1" className={`app-nav-link${section === 'grammar' ? ' active' : ''}`}>
          Grammar
        </Link>
        <Link to="/pronunciation" className={`app-nav-link${section === 'pronunciation' ? ' active' : ''}`}>
          🗣️
        </Link>
        <Link to="/search" className={`app-nav-link${section === 'search' ? ' active' : ''}`}>
          🔍
        </Link>
        <Link to="/stats" className={`app-nav-link${section === 'stats' ? ' active' : ''}`}>
          📊
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
