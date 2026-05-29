import { useEffect, useState } from 'react'
import type { Milestone } from '../hooks/useMilestones'

interface Props {
  milestone: Milestone
  onDismiss: () => void
}

export default function MilestoneToast({ milestone, onDismiss }: Props) {
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [milestone.id, onDismiss])

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const text = `${milestone.icon} I just unlocked "${milestone.title}" on Mandarin Daily! Learning Chinese the smart way. https://www.mandarindaily.app`
    try {
      const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
      if (nav.share) {
        await nav.share({
          title: 'Mandarin Daily',
          text,
          url: 'https://www.mandarindaily.app',
        })
      } else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 1800)
      }
    } catch {
      // user cancelled or share failed — no-op
    }
  }

  return (
    <div className="milestone-toast" role="status">
      <span className="milestone-toast-icon" aria-hidden="true">{milestone.icon}</span>
      <div className="milestone-toast-body">
        <div className="milestone-toast-label">Achievement unlocked</div>
        <div className="milestone-toast-title">{milestone.title}</div>
        <div className="milestone-toast-desc">{milestone.desc}</div>
      </div>
      <div className="milestone-toast-actions">
        <button
          className="milestone-toast-share"
          onClick={handleShare}
          aria-label="Share achievement"
          title="Share"
        >
          {shared ? '✓' : '↗'}
        </button>
        <button
          className="milestone-toast-close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
