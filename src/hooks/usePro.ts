import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const KEY = 'hsk-pro-status'

// Pro feature flags. Add here when gating new features.
export type ProFeature =
  | 'unlimited-teacher'   // remove 50/hr Lin Wei limit
  | 'unlimited-sentence'  // remove 30/hr sentence-critique limit
  | 'advanced-stats'      // detailed heatmap + retention analytics
  | 'deck-export'         // export custom decks (CSV / Anki / Mochi)
  | 'offline-audio'       // pre-cache TTS for offline review
  | 'describe-it'         // Describe It photo ladders (paid vision calls)

const PRO_FEATURES: ReadonlySet<ProFeature> = new Set([
  'unlimited-teacher',
  'unlimited-sentence',
  'advanced-stats',
  'deck-export',
  'offline-audio',
  'describe-it',
])

interface ProStatus {
  active: boolean
  plan: 'monthly' | 'annual' | null
  since: string | null
}

function loadStatus(): ProStatus {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { active: false, plan: null, since: null }
}

// One server check per access token, shared by every usePro() on the page
let serverCheck: { token: string; pro: Promise<boolean> } | null = null
function checkServerPro(token: string): Promise<boolean> {
  if (serverCheck?.token !== token) {
    serverCheck = {
      token,
      pro: fetch('/api/teacher?action=pro-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : null))
        .then(d => Boolean(d?.pro))
        .catch(() => false),
    }
  }
  return serverCheck.pro
}

/**
 * Pro entitlement check. Signed-in accounts listed in PRO_EMAILS on the server are Pro
 * (api/_pro.js, which also guards the paid endpoints); the localStorage status is kept
 * for when Stripe is wired in.
 */
export function usePro() {
  const { session } = useAuth()
  const [status, setStatus] = useState<ProStatus>(loadStatus)
  const [serverPro, setServerPro] = useState(false)
  const token = session?.access_token

  useEffect(() => {
    if (!token) { setServerPro(false); return }
    let live = true
    checkServerPro(token).then(pro => { if (live) setServerPro(pro) })
    return () => { live = false }
  }, [token])

  const isPro = status.active || serverPro
  const hasFeature = useCallback(
    (f: ProFeature) => isPro && PRO_FEATURES.has(f),
    [isPro]
  )

  return { isPro, plan: status.plan, since: status.since, hasFeature, setStatus }
}

export const PRO_PRICING = {
  monthly: { amount: 2.99, currency: 'USD', label: '$2.99/mo' },
  annual:  { amount: 24.99, currency: 'USD', label: '$24.99/yr', savings: 'Save 30%' },
}
