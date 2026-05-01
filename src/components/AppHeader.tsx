import { Link, useLocation } from 'react-router-dom'

export default function AppHeader() {
  const { pathname } = useLocation()
  const section = pathname.startsWith('/grammar') ? 'grammar' : 'vocab'

  return (
    <header className="app-header">
      <h1>汉语 Chinese Study</h1>
      <nav className="app-nav">
        <Link
          to="/hsk/1"
          className={`app-nav-link${section === 'vocab' ? ' active' : ''}`}
        >
          Vocabulary
        </Link>
        <Link
          to="/grammar/1"
          className={`app-nav-link${section === 'grammar' ? ' active' : ''}`}
        >
          Grammar
        </Link>
      </nav>
    </header>
  )
}
