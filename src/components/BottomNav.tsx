import { Link, useLocation } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'

const TABS = [
  { to: '/hsk/1',  emoji: '📚', label: 'Browse',  match: (p: string) => p.startsWith('/hsk') || p.startsWith('/word') },
  { to: '/review', emoji: '🔄', label: 'Review',  match: (p: string) => p === '/review' },
  { to: '/guides', emoji: '🧭', label: 'Guides',  match: (p: string) => p.startsWith('/guides') || p.startsWith('/radicals') || p.startsWith('/measure') || p.startsWith('/daily') || p.startsWith('/songs') || p.startsWith('/tone') || p.startsWith('/scramble') },
  { to: '/stats',  emoji: '📊', label: 'Stats',   match: (p: string) => p === '/stats' },
  { to: '/search', emoji: '🔍', label: 'Search',  match: (p: string) => p === '/search' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { streak } = useStreak()

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = tab.match(pathname)
        const emoji = tab.to === '/stats' && streak > 0 ? '🔥' : tab.emoji
        return (
          <Link key={tab.to} to={tab.to} className={`bottom-nav-tab${active ? ' active' : ''}`}>
            <span className="bottom-nav-emoji">{emoji}</span>
            <span className="bottom-nav-label">{tab.label}</span>
            {tab.to === '/stats' && streak > 0 && (
              <span className="bottom-nav-streak">{streak}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
