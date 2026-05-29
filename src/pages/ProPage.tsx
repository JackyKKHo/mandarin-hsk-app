import { Link } from 'react-router-dom'
import { PRO_PRICING, usePro } from '../hooks/usePro'
import { useSEO } from '../hooks/useSEO'

const FEATURES = [
  { icon: '🤖', title: 'Unlimited Lin Wei',     desc: 'Chat as much as you want with our AI tutor — no hourly cap.' },
  { icon: '✍️', title: 'Unlimited sentence feedback', desc: 'Get instant grammar critique on every sentence you write.' },
  { icon: '📈', title: 'Advanced stats',         desc: 'Retention curves, leech detection, and goal projections.' },
  { icon: '💾', title: 'Deck export',           desc: 'Export custom decks to Anki, CSV, or Mochi.' },
  { icon: '✈️', title: 'Offline audio',         desc: 'Pre-cache pronunciation audio for review without WiFi.' },
  { icon: '🎯', title: 'Support indie dev',     desc: 'You keep this app alive and ad-free.' },
]

export default function ProPage() {
  useSEO({
    title: 'Mandarin Daily Pro — Unlimited AI Tutor + Advanced Stats',
    description: 'Upgrade to Pro for unlimited Lin Wei chats, deck export, advanced stats, and offline audio. From $2.99/mo.',
    path: '/pro',
  })
  const { isPro, plan } = usePro()

  if (isPro) {
    return (
      <div className="pro-page">
        <Link to="/stats" className="back-link">← Stats</Link>
        <div className="pro-active-card">
          <div className="pro-badge pro-badge-large">PRO</div>
          <h1>You're on Pro</h1>
          <p>Thanks for supporting Mandarin Daily. You're on the <strong>{plan}</strong> plan.</p>
          <p className="pro-active-help">Manage billing in your account settings (coming soon).</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pro-page">
      <Link to="/stats" className="back-link">← Back</Link>

      <div className="pro-hero">
        <div className="pro-badge pro-badge-large">PRO</div>
        <h1>Go deeper with Mandarin Daily Pro</h1>
        <p className="pro-hero-sub">Unlimited AI tutor, advanced stats, and deck export. Cancel anytime.</p>
      </div>

      <div className="pro-pricing">
        <div className="pro-price-card">
          <div className="pro-price-name">Monthly</div>
          <div className="pro-price-amount">{PRO_PRICING.monthly.label}</div>
          <button className="btn-secondary pro-price-cta" disabled>Coming soon</button>
        </div>
        <div className="pro-price-card pro-price-featured">
          <div className="pro-price-tag">{PRO_PRICING.annual.savings}</div>
          <div className="pro-price-name">Annual</div>
          <div className="pro-price-amount">{PRO_PRICING.annual.label}</div>
          <button className="btn-primary pro-price-cta" disabled>Coming soon</button>
        </div>
      </div>

      <div className="pro-features">
        {FEATURES.map(f => (
          <div key={f.title} className="pro-feature">
            <span className="pro-feature-icon" aria-hidden="true">{f.icon}</span>
            <div>
              <div className="pro-feature-title">{f.title}</div>
              <div className="pro-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="pro-footnote">
        Pro is in development. <a href="mailto:jacky6556@gmail.com">Email me</a> to join the early-access list.
      </p>
    </div>
  )
}
