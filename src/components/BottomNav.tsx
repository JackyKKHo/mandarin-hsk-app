import { memo, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'

const TABS = [
  { to: '/hsk/1',  emoji: '📚', label: 'Browse',  aria: 'Browse HSK vocabulary',          match: (p: string) => p.startsWith('/hsk') || p.startsWith('/word') },
  { to: '/review',     emoji: '🔄', label: 'Review',  aria: 'Spaced repetition review',         match: (p: string) => p === '/review' },
  { to: '/flashcards', emoji: '🗂', label: 'Cards',   aria: 'Custom flashcards',                match: (p: string) => p.startsWith('/flashcards') },
  { to: '/guides', emoji: '🧭', label: 'Guides',  aria: 'Open guides menu',                 match: (p: string) => p.startsWith('/guides') || p.startsWith('/radicals') || p.startsWith('/measure') || p.startsWith('/daily') || p.startsWith('/songs') || p.startsWith('/tone') || p.startsWith('/scramble') || p === '/cantonese' || p === '/frequency' || p === '/reading' || p === '/verb-frameworks' },
  { to: '/stats',  emoji: '📊', label: 'Stats',   aria: 'Stats and streak',                 match: (p: string) => p === '/stats' },
  { to: '/search', emoji: '🔍', label: 'Search',  aria: 'Search all words',                 match: (p: string) => p === '/search' },
]

const GUIDES_SUBMENU = [
  { to: '/guides',           emoji: '🧭', label: 'All Guides' },
  { to: '/cantonese',        emoji: '粵', label: 'Cantonese' },
  { to: '/frequency',        emoji: '📊', label: 'Word Freq' },
  { to: '/daily',            emoji: '📅', label: 'Daily' },
  { to: '/reading',          emoji: '📖', label: 'Reading' },
  { to: '/sentences/review', emoji: '✍️', label: 'Sentences' },
  { to: '/verb-frameworks',  emoji: '动', label: 'Verb Tips' },
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
        const emoji = tab.to === '/stats' && streak > 0 ? '🔥' : tab.emoji

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
                      <span className="bns-emoji" aria-hidden="true">{s.emoji}</span>
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
                <span className="bottom-nav-emoji" aria-hidden="true">{emoji}</span>
                <span className="bottom-nav-label">Guides ▴</span>
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
            <span className="bottom-nav-emoji" aria-hidden="true">{emoji}</span>
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
