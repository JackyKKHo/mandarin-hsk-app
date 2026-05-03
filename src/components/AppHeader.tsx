import { Link, useLocation } from 'react-router-dom'
import { useFavourites } from '../hooks/useFavourites'
import { useDarkMode } from '../hooks/useDarkMode'

export default function AppHeader() {
  const { pathname } = useLocation()
  const { favourites } = useFavourites()
  const { dark, toggle } = useDarkMode()
  const section = pathname.startsWith('/grammar') ? 'grammar'
    : pathname.startsWith('/favourites') ? 'favourites'
    : 'vocab'

  return (
    <header className="app-header">
      <h1>汉语 Chinese Study</h1>
      <nav className="app-nav">
        <Link to="/hsk/1" className={`app-nav-link${section === 'vocab' ? ' active' : ''}`}>
          Vocabulary
        </Link>
        <Link to="/grammar/1" className={`app-nav-link${section === 'grammar' ? ' active' : ''}`}>
          Grammar
        </Link>
        <Link to="/favourites" className={`app-nav-link${section === 'favourites' ? ' active' : ''}`}>
          ★{favourites.size > 0 && <span className="fav-count">{favourites.size}</span>}
        </Link>
        <button className="dark-toggle" onClick={toggle} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  )
}
