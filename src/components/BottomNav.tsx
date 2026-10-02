import { memo, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'
import Icon, { type IconName } from './Icon'

const TABS: { to: string; icon: IconName; label: string; aria: string; match: (p: string) => boolean }[] = [
  { to: '/hsk/1',  icon: 'bookOpen', label: 'Browse',  aria: 'Browse HSK vocabulary',          match: (p: string) => p.startsWith('/hsk') || p.startsWith('/word') },
  { to: '/review',     icon: 'repeat', label: 'Review',  aria: 'Spaced repetition review',         match: (p: string) => p === '/review' },
  { to: '/flashcards', icon: 'layers', label: 'Cards',   aria: 'Custom flashcards',                match: (p: string) => p.startsWith('/flashcards') },
  { to: '/guides', icon: 'compass', label: 'Guides',  aria: 'Open guides menu',                 match: (p: string) => p.startsWith('/guides') || p.startsWith('/radicals') || p.startsWith('/measure') || p.startsWith('/daily') || p.startsWith('/songs') || p.startsWith('/tone') || p.startsWith('/scramble') || p === '/cantonese' || p === '/frequency' || p === '/reading' || p === '/verb-frameworks' || p.startsWith('/assessment') },
  { to: '/stats',  icon: 'chart', label: 'Stats',   aria: 'Stats and streak',                 match: (p: string) => p === '/stats' },
  { to: '/search', icon: 'search', label: 'Search',  aria: 'Search all words',                 match: (p: string) => p === '/search' },
]

const GUIDES_SUBMENU = [
  { to: '/guides',           label: 'All guides' },
  { to: '/cantonese',        label: 'Cantonese' },
  { to: '/frequency',        label: 'Word frequency' },
  { to: '/daily',            label: 'Daily challenge' },
  { to: '/reading',          label: 'Reading' },
  { to: '/sentences/review', label: 'Sentences' },
  { to: '/verb-frameworks',  label: 'Verb tips' },
]

function BottomNav() {
  const { pathname } = useLocation()
  const { streak } = useStreak()
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setSubmenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!submenuOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setSubmenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [submenuOpen])

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {TABS.map(tab => {
        const active = tab.match(pathname)
        const icon: IconName = tab.to === '/stats' && streak > 0 ? 'flame' : tab.icon

        if (tab.to === '/guides') {
          return (
            <div key={tab.to} ref={ref} className="bottom-nav-guides-wrap">
              {submenuOpen && (
                <div className="bottom-nav-submenu" role="menu">
                  {GUIDES_SUBMENU.map(s => (
                    <Link
                      key={s.to}
                      to={s.to}
                      role="menuitem"
                      aria-label={s.label}
                      className={`bns-item${pathname === s.to || (s.to === '/guides' && active) ? ' active' : ''}`}
                    >
                      <span className="bns-label">{s.label}</span>
                    </Link>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={`bottom-nav-tab${active ? ' active' : ''}`}
                aria-label={tab.aria}
                aria-expanded={submenuOpen}
                aria-haspopup="menu"
                onClick={() => setSubmenuOpen(o => !o)}
              >
                <Icon name={icon} size={22} />
                <span className="bottom-nav-label">Guides</span>
              </button>
            </div>
          )
        }

        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-label={tab.aria}
            aria-current={active ? 'page' : undefined}
            className={`bottom-nav-tab${active ? ' active' : ''}`}
          >
            <Icon name={icon} size={22} />
            <span className="bottom-nav-label">{tab.label}</span>
            {tab.to === '/stats' && streak > 0 && (
              <span className="bottom-nav-streak" aria-label={`${streak} day streak`}>{streak}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default memo(BottomNav)
