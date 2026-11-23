import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { getNotificationKey, subscribeToNotifications, unsubscribeFromNotifications, testNotification } from '../server/tracker.functions'

function applicationKey(value: string) {
  const decoded = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(decoded, c => c.charCodeAt(0))
}

// Shown until notifications are on for this device; after that it stays out of the
// way and the header bell reopens it (to send a test or turn them off).
export default function NotificationSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState('')
  // Keeps the box up after enabling, so the confirmation and test button are seen.
  const [changedThisVisit, setChangedThisVisit] = useState(false)
  useEffect(() => {
    let active = true
    const support = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(support)
    if (!support) { setBusy(false); return }
    navigator.serviceWorker.register('/sw.js').then(async registration => {
      const subscription = await registration.pushManager.getSubscription()
      // Restore the subscription's ownership after signing in on a shared device.
      if (subscription) await save(subscription)
      if (active) setEnabled(!!subscription)
    }).catch(() => { if (active) setMessage('Unable to check notifications. Please try again.') })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [])

  async function save(subscription: PushSubscription) {
    const json = subscription.toJSON()
    await subscribeToNotifications({ data: { subscription: { endpoint: subscription.endpoint, keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth } } } })
  }

  async function toggle() {
    setBusy(true); setMessage('')
    try {
      // Permission is requested directly from the button click for mobile browsers.
      if (!enabled && await Notification.requestPermission() !== 'granted') {
        throw new Error('Notifications are blocked. Allow them in your browser settings. On iPhone or iPad, add this site to your Home Screen and open it there.')
      }
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (enabled) {
        if (subscription) {
          await unsubscribeFromNotifications({ data: { endpoint: subscription.endpoint } })
          await subscription.unsubscribe()
        }
        setEnabled(false)
      } else {
        const { publicKey } = await getNotificationKey()
        subscription ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(publicKey) })
        await save(subscription)
        setEnabled(true)
        setChangedThisVisit(true)
        setMessage('Notifications enabled on this device. Use the bell at the top to change this later.')
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update notifications.') }
    finally { setBusy(false) }
  }

  async function test() {
    setBusy(true); setMessage('')
    try {
      const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription()
      if (!subscription) throw new Error('Enable notifications first.')
      await testNotification({ data: { endpoint: subscription.endpoint } })
      setMessage('Test notification sent.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to send test.') }
    finally { setBusy(false) }
  }

  // Nothing to show while checking, or once they're on (unless asked for).
  if (busy && !open && !changedThisVisit && !message) return null
  if (enabled && !open && !changedThisVisit) return null

  const closable = enabled || open
  return <section className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-5" aria-label="Push notifications">
    {closable && <button type="button" onClick={() => { setChangedThisVisit(false); setMessage(''); onClose() }} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60" aria-label="Close notification settings"><X className="w-4 h-4" /></button>}
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${closable ? "sm:pr-8" : ""}`}>
      <div className={`flex gap-3 ${closable ? "pr-8 sm:pr-0" : ""}`}><Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-1" /><div>
        <h2 className="font-semibold text-white">Job notifications <span className="text-xs text-slate-400 ml-2">{enabled ? 'On for this device' : 'Off for this device'}</span></h2>
        <p className="text-sm text-slate-400 mt-1">New jobs and changes, plus install, measuring and delivery reminders at 6 pm the day before and 7 am on the day (UK time).</p>
      </div></div>
      <div className="flex gap-2 shrink-0">
        {enabled && <button disabled={busy} onClick={test} className="px-3 py-2 rounded-lg border border-slate-700 text-sm disabled:opacity-50">Send test</button>}
        <button disabled={busy || !supported} onClick={toggle} className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-semibold disabled:opacity-50">{busy ? 'Checking…' : enabled ? 'Turn off' : 'Enable notifications'}</button>
      </div>
    </div>
    {!supported && !busy && <p className="mt-3 text-sm text-amber-300">Push notifications need a supported browser. On iPhone or iPad, add this site to your Home Screen, then open it there.</p>}
    {message && <p role="status" className="mt-3 text-sm text-slate-300">{message}</p>}
  </section>
}
