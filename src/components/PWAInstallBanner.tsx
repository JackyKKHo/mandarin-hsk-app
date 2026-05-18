import { usePWAInstall } from '../hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall()
  if (!canInstall) return null

  return (
    <div className="pwa-banner">
      <span className="pwa-banner-text">Add Mandarin Daily to your home screen for the best experience</span>
      <div className="pwa-banner-actions">
        <button className="pwa-banner-install" onClick={install}>Install</button>
        <button className="pwa-banner-dismiss" onClick={dismiss}>✕</button>
      </div>
    </div>
  )
}
