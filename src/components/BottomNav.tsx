import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'

const TABS = [
  { to: '/hsk/1',  emoji: '📚', label: 'Browse',  match: (p: string) => p.startsWith('/hsk') || p.startsWith('/word') },
  { to: '/review', emoji: '🔄', label: 'Review',  match: (p: string) => p === '/review' },
  { to: '/guides', emoji: '🧭', label: 'Guides',  match: (p: string) => p.startsWith('/guides') || p.startsWith('/radicals') || p.startsWith('/measure') || p.startsWith('/daily') || p.startsWith('/songs') || p.startsWith('/tone') || p.startsWith('/scramble') || p === '/cantonese' || p === '/frequency' },
  { to: '/stats',  emoji: '📊', label: 'Stats',   match: (p: string) => p === '/stats' },
  { to: '/search', emoji: '🔍', label: 'Search',  match: (p: string) => p === '/search' },
]

const GUIDES_SUBMENU = [
  { to: '/guides',    emoji: '🧭', label: 'All Guides' },
  { to: '/cantonese', emoji: '粵', label: 'Cantonese' },
  { to: '/frequency', emoji: '📊', label: 'Word Freq' },
  { to: '/daily',     emoji: '📅', label: 'Daily' },
]

export default function BottomNav() {
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
    <nav className="bottom-nav">
      {TABS.map(tab => {
        const active = tab.match(pathname)
        const emoji = tab.to === '/stats' && streak > 0 ? '🔥' : tab.emoji

        if (tab.to === '/guides') {
          return (
            <div key={tab.to} ref={ref} className="bottom-nav-guides-wrap">
              {submenuOpen && (
                <div className="bottom-nav-submenu">
                  {GUIDES_SUBMENU.map(s => (
                    <Link key={s.to} to={s.to} className={`bns-item${pathname === s.to || (s.to === '/guides' && active) ? ' active' : ''}`}>
                      <span className="bns-emoji">{s.emoji}</span>
                      <span className="bns-label">{s.label}</span>
                    </Link>
                  ))}
                </div>
              )}
              <button
                className={`bottom-nav-tab${active ? ' active' : ''}`}
                onClick={() => setSubmenuOpen(o => !o)}
              >
                <span className="bottom-nav-emoji">{emoji}</span>
                <span className="bottom-nav-label">Guides ▴</span>
              </button>
            </div>
          )
        }

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
