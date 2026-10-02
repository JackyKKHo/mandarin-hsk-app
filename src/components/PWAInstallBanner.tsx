import { usePWAInstall } from '../hooks/usePWAInstall'
import Icon from './Icon'

export default function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall()
  if (!canInstall) return null

  return (
    <div className="pwa-banner" role="region" aria-label="Install app">
      <span className="pwa-banner-text">Install Mandarin Daily for one-tap access from your home screen</span>
      <div className="pwa-banner-actions">
        <button className="pwa-banner-install" onClick={install}>Install</button>
        <button className="pwa-banner-dismiss" onClick={dismiss} aria-label="Dismiss"><Icon name="x" size={16} /></button>
      </div>
    </div>
  )
}
