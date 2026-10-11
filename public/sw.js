self.addEventListener('push', (event) => {
  const payload = event.data?.json ? event.data.json() : null
  const title = payload?.title || 'Work Tracker Update'
  const body = payload?.body || 'A change was made in the tracker.'

  const options = {
    body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'work-tracker',
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
