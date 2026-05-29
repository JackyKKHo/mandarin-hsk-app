import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      upsert: () => Promise.resolve({}),
    }),
  },
}))

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

describe('useStreak recovery', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('returns null recovery when no streak exists', async () => {
    const { useStreak } = await import('./useStreak')
    const { result } = renderHook(() => useStreak())
    expect(result.current.recovery).toBeNull()
  })

  it('exposes recoverable state when missed 1 day and freezes are available', async () => {
    localStorage.setItem('hsk-streak', JSON.stringify({ count: 10, lastDate: daysAgo(2) }))
    localStorage.setItem('hsk-freeze', '2')
    const { useStreak } = await import('./useStreak')
    const { result } = renderHook(() => useStreak())
    expect(result.current.recovery?.kind).toBe('recoverable')
    if (result.current.recovery?.kind === 'recoverable') {
      expect(result.current.recovery.streak).toBe(10)
      expect(result.current.recovery.freezesAvailable).toBe(2)
    }
  })

  it('exposes lost state when streak broken with no freezes', async () => {
    localStorage.setItem('hsk-streak', JSON.stringify({ count: 5, lastDate: daysAgo(2) }))
    localStorage.setItem('hsk-freeze', '0')
    const { useStreak } = await import('./useStreak')
    const { result } = renderHook(() => useStreak())
    expect(result.current.recovery?.kind).toBe('lost')
  })

  it('useFreeze consumes a token and rolls lastDate to yesterday', async () => {
    localStorage.setItem('hsk-streak', JSON.stringify({ count: 7, lastDate: daysAgo(2) }))
    localStorage.setItem('hsk-freeze', '1')
    const { useStreak } = await import('./useStreak')
    const { result } = renderHook(() => useStreak())
    act(() => { result.current.useFreeze() })
    expect(result.current.freezes).toBe(0)
    expect(result.current.recovery).toBeNull()
    expect(result.current.lastDate).toBe(daysAgo(1))
  })

  it('does not re-surface recovery after dismissal in the same day', async () => {
    localStorage.setItem('hsk-streak', JSON.stringify({ count: 4, lastDate: daysAgo(2) }))
    localStorage.setItem('hsk-freeze', '0')
    const { useStreak } = await import('./useStreak')
    const { result, rerender } = renderHook(() => useStreak())
    act(() => { result.current.dismissRecovery() })
    expect(result.current.recovery).toBeNull()
    localStorage.setItem('hsk-recovery-shown', todayStr())
    rerender()
    expect(result.current.recovery).toBeNull()
  })
})
