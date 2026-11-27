import { eq, lt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { workItems, calendarEvents, notificationSubscriptions, notificationDeliveries } from '../../db/schema.js'
import { sendPush } from '../../src/server/push.js'
import { reminderWindow, scheduledDates, checkInDates } from '../../src/server/reminder-time.js'

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
  // Morning only: remind the team to check in with the customer a few days before fitting.
  const checkInTargets = window.kind === 'today' ? checkInDates(window.date) : []
  const formatDay = (date: string) => new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })
  for (const job of jobs) {
    if (job.status === 'Completed') continue
    add(`job-${job.id}-fitting`, job.customerName, 'Install', job.fittingDate, job.site)
    add(`job-${job.id}-measure`, job.customerName, 'Measuring', job.measuredBooked, job.site)
    for (const date of job.customerContacted ? [] : scheduledDates(job.fittingDate)) {
      if (!checkInTargets.includes(date.slice(0, 10))) continue
      const time = date.length > 10 ? ` at ${date.slice(11, 16)}` : ''
      reminders.push({
        // Keyed on the fitting date (not today) so the day-3 fallback doesn't repeat it.
        key: `job-${job.id}-checkin:${date}`,
        title: 'Check in with customer',
        body: `${job.customerName}${job.site ? ` — ${job.site}` : ''}. Fitting ${formatDay(date)}${time}.` +
          `${job.customerPhone ? ` Call ${job.customerPhone}.` : ''}`,
      })
    }
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

// Only wake up in the hours a reminder can go out: 7 am and 6 pm UK time are
// 06:xx/07:xx and 17:xx/18:xx UTC across summer and winter. Running all day cost
// credits for nothing. Netlify reads this value as written, so keep it a literal.
export const config = { schedule: '*/10 6,7,17,18 * * *' }
