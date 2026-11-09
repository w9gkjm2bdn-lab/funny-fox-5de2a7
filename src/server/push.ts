import webPush from 'web-push'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { notificationSubscriptions, pushConfiguration } from '../../db/schema.js'

export async function getPushKeys() {
  const runtime = globalThis as typeof globalThis & { Netlify?: { env: { get: (name: string) => string | undefined } } }
  const env = (name: string) => runtime.Netlify?.env.get(name) ?? process.env[name]
  const publicKey = env('VAPID_PUBLIC_KEY')
  const privateKey = env('VAPID_PRIVATE_KEY')
  if (publicKey && privateKey) return { publicKey, privateKey }
  const [existing] = await db.select().from(pushConfiguration).where(eq(pushConfiguration.id, 1))
  if (existing) return existing
  const keys = webPush.generateVAPIDKeys()
  await db.insert(pushConfiguration).values({ id: 1, ...keys }).onConflictDoNothing()
  const [saved] = await db.select().from(pushConfiguration).where(eq(pushConfiguration.id, 1))
  return saved
}

export async function sendPush(subscription: typeof notificationSubscriptions.$inferSelect, title: string, body: string, tag: string) {
  const keys = await getPushKeys()
  try {
    await webPush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify({ title, body, tag, url: '/' }), {
        vapidDetails: { subject: 'https://tmflooring.netlify.app', ...keys },
        TTL: 3600, timeout: 5000,
      })
    return true
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    if (status === 404 || status === 410) {
      await db.delete(notificationSubscriptions).where(eq(notificationSubscriptions.id, subscription.id))
      return true
    }
    console.warn('Push delivery failed', { status })
    return false
  }
}

// Delivery failure must not turn a saved job into an apparent failed save.
export async function notifyAllSubscribers(title: string, body: string) {
  try {
    const subscriptions = await db.select().from(notificationSubscriptions)
    await Promise.all(subscriptions.map(subscription => sendPush(subscription, title, body, `change-${Date.now()}`)))
  } catch {
    console.warn('Unable to deliver tracker change notifications')
  }
}
