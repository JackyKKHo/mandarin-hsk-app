import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const { session } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)
    if (supported) setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (!isSupported || !session) return
    navigator.serviceWorker.ready.then(async reg => {
      const sub = await reg.pushManager.getSubscription()
      setIsEnabled(!!sub)
    })
  }, [isSupported, session])

  const enable = useCallback(async () => {
    if (!isSupported || !session) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      })

      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })

      setIsEnabled(true)
    } finally {
      setLoading(false)
    }
  }, [isSupported, session])

  const disable = useCallback(async () => {
    if (!isSupported || !session) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      await sub?.unsubscribe()

      await fetch('/api/push-subscribe', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })

      setIsEnabled(false)
    } finally {
      setLoading(false)
    }
  }, [isSupported, session])

  return { isSupported, isEnabled, permission, loading, enable, disable }
}
