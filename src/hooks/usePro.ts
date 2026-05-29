import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const KEY = 'hsk-pro-status'

// Pro feature flags. Add here when gating new features.
export type ProFeature =
  | 'unlimited-teacher'   // remove 50/hr Lin Wei limit
  | 'unlimited-sentence'  // remove 30/hr sentence-critique limit
  | 'advanced-stats'      // detailed heatmap + retention analytics
  | 'deck-export'         // export custom decks (CSV / Anki / Mochi)
  | 'offline-audio'       // pre-cache TTS for offline review

const PRO_FEATURES: ReadonlySet<ProFeature> = new Set([
  'unlimited-teacher',
  'unlimited-sentence',
  'advanced-stats',
  'deck-export',
  'offline-audio',
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

/**
 * Pro entitlement check. Currently sources from localStorage; when Stripe is
 * wired in, swap the loader for a Supabase / webhook-backed read.
 */
export function usePro() {
  const { user: _user } = useAuth()
  const [status, setStatus] = useState<ProStatus>(loadStatus)

  const isPro = status.active
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
