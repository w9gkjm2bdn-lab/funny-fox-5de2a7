// netlify/functions/calendar-feed.mts
// Provides an iCal / webcal subscription feed for Apple Calendar (iOS / Mac) and Google Calendar (Android / Web)
import type { Config } from '@netlify/functions'
import { db } from '../../db/index.js'
import { workItems, calendarEvents } from '../../db/schema.js'
import { generateICSFeed, ICSEventItem, parseDateTimeString, formatDateTimeDisplay } from '../../src/utils/ics.js'

export default async (req: Request) => {
  try {
    const url = new URL(req.url)
    const assignee = url.searchParams.get('assignee')?.toLowerCase() // optional filter e.g. 'tom', 'chris'

    // Fetch all active work items and calendar entries
    const [allJobs, allManual] = await Promise.all([
      db.select().from(workItems),
      db.select().from(calendarEvents),
    ])

    const events: ICSEventItem[] = []

    // 1. Process Job Measure Dates
    allJobs.forEach((job) => {
      if (job.status === 'Completed') return // skip completed jobs from active feed

      if (job.measuredBooked && job.measuredBooked.trim()) {
        const rawDate = job.measuredBooked.trim()
        const assigned = (job.measuredBy || job.assignedTo || '').toLowerCase()
        if (!assignee || assigned.includes(assignee)) {
          const parsed = parseDateTimeString(rawDate)
          const timeInfo = parsed.hasTime ? `\nTime: ${parsed.timeStr} (1 hour duration)` : ''

          events.push({
            uid: `job-measure-${job.id}-${parsed.dateStr}@worktracker`,
            title: `📏 Measure: ${job.customerName}`,
            description: `Where: ${job.whereNeedsMeasuring}\nRequired: ${job.whatsRequired}${timeInfo}${job.notes ? `\nNotes: ${job.notes}` : ''}${job.what3words ? `\nwhat3words: ${job.what3words}` : ''}${job.customerPhone ? `\nPhone: ${job.customerPhone}` : ''}`,
            location: job.site || '',
            dateStr: rawDate,
            durationHours: 1,
          })
        }
      }

      // 2. Process Job Fitting Dates (single or comma-separated list)
      if (job.fittingDate && job.fittingDate.trim()) {
        const fittingList = job.fittingDate
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        const assigned = (job.assignedTo || '').toLowerCase()
        if (!assignee || assigned.includes(assignee)) {
          fittingList.forEach((fitDateStr, idx) => {
            const parsed = parseDateTimeString(fitDateStr)
            const timeInfo = parsed.hasTime ? `\nTime: ${parsed.timeStr} (1 hour duration)` : ''

            events.push({
              uid: `job-fitting-${job.id}-${parsed.dateStr}-${idx}@worktracker`,
              title: `🔨 Fitting: ${job.customerName}`,
              description: `Required: ${job.whatsRequired}${timeInfo}${job.notes ? `\nNotes: ${job.notes}` : ''}${job.what3words ? `\nwhat3words: ${job.what3words}` : ''}${job.customerPhone ? `\nPhone: ${job.customerPhone}` : ''}`,
              location: job.site || '',
              dateStr: fitDateStr,
              durationHours: 1,
            })
          })
        }
      }
    })

    // 3. Process Manual Calendar Events
    allManual.forEach((man) => {
      const assigned = (man.assignedTo || '').toLowerCase()
      if (!assignee || !assigned || assigned.includes(assignee)) {
        let prefix = '📅'
        if (man.eventType === 'measure') prefix = '📏'
        if (man.eventType === 'fitting') prefix = '🔨'
        if (man.eventType === 'delivery') prefix = '🚚'
        if (man.eventType === 'holiday') prefix = '🏖️'

        events.push({
          uid: `manual-event-${man.id}@worktracker`,
          title: `${prefix} ${man.title}`,
          description: `${man.notes || ''}${man.assignedTo ? `\nAssigned: ${man.assignedTo}` : ''}`,
          dateStr: man.date,
          endDateStr: man.endDate || undefined,
          durationHours: 1,
        })
      }
    })

    const calName = assignee ? `Work Tracker (${assignee.toUpperCase()})` : 'Work Tracker Schedule'
    const icsContent = generateICSFeed(calName, events)

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="schedule.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('Calendar feed error:', err)
    return new Response(`Error generating calendar feed: ${err?.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

export const config: Config = {
  path: ['/api/calendar-feed', '/api/calendar-feed.ics'],
}
