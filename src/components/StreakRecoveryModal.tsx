import { useStreak } from '../hooks/useStreak'

export default function StreakRecoveryModal() {
  const { recovery, useFreeze, dismissRecovery } = useStreak()
  if (!recovery) return null

  if (recovery.kind === 'recoverable') {
    return (
      <div className="modal-overlay" onClick={dismissRecovery} role="dialog" aria-modal="true" aria-labelledby="streak-recovery-title">
        <div className="modal-card streak-recovery" onClick={e => e.stopPropagation()}>
          <div className="streak-recovery-icon" aria-hidden="true">🥶</div>
          <h2 id="streak-recovery-title">Your streak is in danger!</h2>
          <p>You missed a day. Use a freeze token to save your <strong>{recovery.streak}-day streak</strong>.</p>
          <p className="streak-recovery-tokens">
            Freeze tokens available: <strong>{recovery.freezesAvailable}</strong>
          </p>
          <div className="streak-recovery-actions">
            <button className="btn-primary" onClick={useFreeze}>
              ❄️ Use a freeze
            </button>
            <button className="btn-secondary" onClick={dismissRecovery}>
              Skip
            </button>
          </div>
          <p className="streak-recovery-help">
            Earn one freeze every 7 days of practice (max 3).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={dismissRecovery} role="dialog" aria-modal="true" aria-labelledby="streak-lost-title">
      <div className="modal-card streak-recovery" onClick={e => e.stopPropagation()}>
        <div className="streak-recovery-icon" aria-hidden="true">💔</div>
        <h2 id="streak-lost-title">Your {recovery.streak}-day streak ended</h2>
        <p>Don't worry — start a new one today. A few minutes of practice will get you back on track.</p>
        <div className="streak-recovery-actions">
          <button className="btn-primary" onClick={dismissRecovery}>
            Start fresh
          </button>
        </div>
      </div>
    </div>
  )
}
