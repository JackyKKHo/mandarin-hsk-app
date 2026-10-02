import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'
import { getSavedLevel } from '../lib/todayPlan'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const SPEEDS = [
  { min: 60, label: 'Every hour' },
  { min: 30, label: 'Every 30 min' },
  { min: 240, label: 'Every 4 hours' },
  { min: 1440, label: 'Once a day' },
]

export default function WidgetPage() {
  useSEO({ title: 'iPhone Widget', description: 'Put a new Chinese word on your iPhone home screen or lock screen every hour.', path: '/widget' })
  const saved = getSavedLevel()
  const [from, setFrom] = useState(saved)
  const [to, setTo] = useState(saved)
  const [every, setEvery] = useState(60)
  const [copied, setCopied] = useState<'script' | 'param' | 'error' | null>(null)

  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const param = `${lo === hi ? lo : `${lo}-${hi}`}${every === 60 ? '' : `,${every}`}`

  async function copy(what: 'script' | 'param') {
    try {
      const text = what === 'param' ? param : await (await fetch('/mandarin-daily-widget.js')).text()
      await navigator.clipboard.writeText(text)
      setCopied(what)
    } catch {
      setCopied('error')
    }
  }

  return (
    <div className="widget-page">
      <AppHeader />
      <main className="widget-main">
        <h1 className="widget-title">iPhone widget</h1>
        <p className="widget-lede">
          A new word on your home screen or lock screen every hour, with tone-coloured pinyin and an example
          sentence. Tap it to open the word here. It uses Scriptable, a free app that runs small widget scripts.
        </p>

        <section className="widget-config" aria-label="Widget settings">
          <div className="widget-config-row">
            <label>
              Levels
              <span className="widget-range">
                HSK
                <select value={from} onChange={e => setFrom(Number(e.target.value))} aria-label="From level">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                to
                <select value={to} onChange={e => setTo(Number(e.target.value))} aria-label="To level">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </span>
            </label>
            <label>
              New word
              <select value={every} onChange={e => setEvery(Number(e.target.value))}>
                {SPEEDS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <div className="widget-param">
            Your widget parameter: <code>{param}</code>
            <button className="btn-secondary" onClick={() => copy('param')}>{copied === 'param' ? 'Copied' : 'Copy'}</button>
          </div>
        </section>

        <ol className="widget-steps">
          <li>
            <strong>Install Scriptable</strong> from the App Store (search “Scriptable”, it’s free).
          </li>
          <li>
            <strong>Copy the widget script</strong>
            <div className="widget-step-action">
              <button className="btn-primary" onClick={() => copy('script')}>
                {copied === 'script' ? 'Script copied' : 'Copy script'}
              </button>
              <a href="/mandarin-daily-widget.js" target="_blank" rel="noopener noreferrer">or view it</a>
            </div>
            {copied === 'error' && (
              <div className="widget-error">Couldn’t copy automatically. Open “view it”, select all, and copy.</div>
            )}
          </li>
          <li>
            <strong>Open Scriptable</strong>, tap <b>+</b>, paste, then tap the title at the top and rename it
            to <b>Mandarin Daily</b>. Tap <b>Done</b>. Tap the script once to preview it.
          </li>
          <li>
            <strong>Add the widget:</strong> long-press your home screen → <b>Edit</b> → <b>Add Widget</b> →
            <b> Scriptable</b> → pick a size → <b>Add Widget</b>.
          </li>
          <li>
            <strong>Set it up:</strong> long-press the new widget → <b>Edit Widget</b>, then set
            <ul>
              <li>Script: <b>Mandarin Daily</b></li>
              <li>When Interacting: <b>Open URL</b></li>
              <li>Parameter: <code>{param}</code></li>
            </ul>
          </li>
          <li>
            <strong>Lock screen too:</strong> long-press the lock screen → <b>Customize</b> → <b>Lock Screen</b> →
            tap the widget area → <b>Scriptable</b>, then set it up the same way.
          </li>
        </ol>

        <p className="widget-note">
          iOS decides exactly when widgets refresh, so a new word may appear a little after the hour. Without a
          connection, the widget keeps showing the last word it loaded.
        </p>
      </main>
    </div>
  )
}
