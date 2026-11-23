self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = null
  try { payload = event.data ? event.data.json() : null } catch { /* Use fallback message. */ }
  const title = payload?.title || 'Work Tracker Update'
  const body = payload?.body || 'A change was made in the tracker.'

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload?.tag || 'work-tracker',
    requireInteraction: true,
    data: payload || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/')
      }

      return undefined
    }),
  )
})
