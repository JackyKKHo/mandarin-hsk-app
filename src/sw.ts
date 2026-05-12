/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST)

registerRoute(
  ({ url }) => url.hostname === 'cdn.jsdelivr.net',
  new CacheFirst({
    cacheName: 'hanzi-data-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
)

registerRoute(({ url }) => url.pathname.startsWith('/api/'), new NetworkOnly())
registerRoute(({ url }) => url.pathname.startsWith('/_vercel/'), new NetworkOnly())

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Mandarin Daily', {
      body: data.body ?? 'Time to study!',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data?.url as string) ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return (client as WindowClient).focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
