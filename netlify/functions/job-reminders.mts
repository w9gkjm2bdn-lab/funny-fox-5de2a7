import { eq, lt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { workItems, calendarEvents, notificationSubscriptions, notificationDeliveries } from '../../db/schema.js'
import { sendPush } from '../../src/server/push.js'
import { reminderWindow, scheduledDates } from '../../src/server/reminder-time.js'

export default async () => {
  const now = new Date()
  const window = reminderWindow(now)
  if (!window) return
  const [jobs, events, subscriptions] = await Promise.all([
    db.select().from(workItems), db.select().from(calendarEvents), db.select().from(notificationSubscriptions),
  ])
  const reminders: { key: string; title: string; body: string }[] = []
  const add = (source: string, name: string, type: string, value: string | null, site = '') => {
    for (const date of scheduledDates(value)) {
      if (date.slice(0, 10) !== window.date) continue
      reminders.push({ key: `${source}:${date}:${window.kind}`, title: `${type} ${window.kind}`,
        body: `${name}${site ? ` — ${site}` : ''}. ${date.replace('T', ' at ')}.` })
    }
  }
  for (const job of jobs) {
    if (job.status === 'Completed') continue
    add(`job-${job.id}-fitting`, job.customerName, 'Install', job.fittingDate, job.site)
    add(`job-${job.id}-measure`, job.customerName, 'Measuring', job.measuredBooked, job.site)
  }
  for (const event of events) {
    if (['fitting', 'measure', 'delivery'].includes(event.eventType)) {
      add(`event-${event.id}`, event.title, event.eventType === 'fitting' ? 'Install' : event.eventType === 'measure' ? 'Measuring' : 'Delivery', event.date)
    }
  }
  // Bound concurrency to respect push service limits and the scheduled runtime.
  for (let offset = 0; offset < subscriptions.length; offset += 10) {
    await Promise.all(subscriptions.slice(offset, offset + 10).map(async subscription => {
      for (const reminder of reminders) {
        const key = `${subscription.id}:${reminder.key}`
        const [claim] = await db.insert(notificationDeliveries).values({ key }).onConflictDoNothing().returning()
        if (!claim) continue
        if (!await sendPush(subscription, reminder.title, reminder.body, reminder.key)) {
          await db.delete(notificationDeliveries).where(eq(notificationDeliveries.key, key))
        }
      }
    }))
  }
  await db.delete(notificationDeliveries).where(lt(notificationDeliveries.claimedAt, new Date(now.getTime() - 90 * 86400000)))
}

export const config = { schedule: '*/10 * * * *' }
