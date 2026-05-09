import { useEffect } from 'react'
import type { Milestone } from '../hooks/useMilestones'

interface Props {
  milestone: Milestone
  onDismiss: () => void
}

export default function MilestoneToast({ milestone, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [milestone.id, onDismiss])

  return (
    <div className="milestone-toast" onClick={onDismiss} role="status">
      <span className="milestone-toast-icon">{milestone.icon}</span>
      <div className="milestone-toast-body">
        <div className="milestone-toast-label">Achievement unlocked</div>
        <div className="milestone-toast-title">{milestone.title}</div>
        <div className="milestone-toast-desc">{milestone.desc}</div>
      </div>
      <button className="milestone-toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
