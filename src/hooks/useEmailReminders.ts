import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useEmailReminders() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) { setLoaded(false); return }
    supabase
      .from('email_reminders')
      .select('enabled')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setEnabled(data?.enabled ?? false)
        setLoaded(true)
      })
  }, [user])

  const toggle = useCallback(async () => {
    if (!user) return
    const next = !enabled
    setLoading(true)
    setEnabled(next)
    await supabase
      .from('email_reminders')
      .upsert({ user_id: user.id, enabled: next }, { onConflict: 'user_id' })
    setLoading(false)
  }, [user, enabled])

  return { enabled, loading, loaded, toggle }
}
