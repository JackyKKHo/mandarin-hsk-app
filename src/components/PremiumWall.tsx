import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePro, type ProFeature } from '../hooks/usePro'

interface Props {
  feature: ProFeature
  title?: string
  description?: string
  children: ReactNode
}

/**
 * Gates a piece of UI behind Pro entitlement. Until Pro is wired to billing,
 * this renders the upsell card whenever `hasFeature(feature)` is false.
 *
 *   <PremiumWall feature="deck-export" title="Export decks">
 *     <DeckExportButton />
 *   </PremiumWall>
 */
export default function PremiumWall({ feature, title, description, children }: Props) {
  const { hasFeature } = usePro()
  if (hasFeature(feature)) return <>{children}</>

  return (
    <div className="premium-wall" role="region" aria-label="Pro feature">
      <div className="premium-wall-badge">PRO</div>
      <h3 className="premium-wall-title">{title ?? 'Pro feature'}</h3>
      {description && <p className="premium-wall-desc">{description}</p>}
      <Link to="/pro" className="btn-primary premium-wall-cta">
        Unlock with Pro →
      </Link>
    </div>
  )
}
