// src/utils/ics.ts
// Utility to create standard RFC 5545 iCalendar (ICS) files and subscription feeds with precise start times and 1-hour default durations

export function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function toUtcBasic(date?: Date | null) {
  if (!date) return null
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

export function toLocalBasic(date?: Date | null) {
  if (!date) return ''
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  )
}

function escapeICSText(s: string) {
  return (s || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export interface ParsedDateTime {
  dateStr: string // YYYY-MM-DD
  timeStr?: string // HH:mm (e.g. 09:30)
  hasTime: boolean
}

/**
 * Parses a combined string (e.g. "2026-08-21T09:30", "2026-08-21 09:30", or "2026-08-21")
 */
export function parseDateTimeString(raw?: string | null): ParsedDateTime {
  if (!raw || !raw.trim()) return { dateStr: '', hasTime: false }
  const trimmed = raw.trim()
  if (trimmed.includes('T')) {
    const [d, t] = trimmed.split('T')
    const timeOnly = t ? t.slice(0, 5) : ''
    return { dateStr: d, timeStr: timeOnly || undefined, hasTime: Boolean(timeOnly) }
  }
  if (trimmed.includes(' ')) {
    const [d, t] = trimmed.split(' ')
    if (t && t.includes(':')) {
      const timeOnly = t.slice(0, 5)
      return { dateStr: d, timeStr: timeOnly, hasTime: true }
    }
  }
  return { dateStr: trimmed, hasTime: false }
}

/**
 * Formats date and start time cleanly for display, highlighting the 1-hour duration when a start time is set
 */
export function formatDateTimeDisplay(raw?: string | null, defaultDurationHours = 1): string {
  const parsed = parseDateTimeString(raw)
  if (!parsed.dateStr) return ''
  
  const [y, m, d] = parsed.dateStr.split('-').map(Number)
  if (!y || !m || !d) return parsed.dateStr

  const dateObj = new Date(y, m - 1, d)
  const formattedDate = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  if (parsed.hasTime && parsed.timeStr) {
    const [h, min] = parsed.timeStr.split(':').map(Number)
    const endH = (h + defaultDurationHours) % 24
    const endTimeStr = `${pad(endH)}:${pad(min)}`
    return `${formattedDate} • ${parsed.timeStr} – ${endTimeStr} (${defaultDurationHours} hr)`
  }

  return formattedDate
}

export interface ICSEventItem {
  uid: string
  title: string
  description?: string
  location?: string
  dateStr: string // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  endDateStr?: string // optional YYYY-MM-DD or YYYY-MM-DDTHH:mm
  allDay?: boolean
  durationHours?: number // defaults to 1 hour if start time is present
}

/**
 * Format a single or multi-event iCalendar (.ics) string
 */
export function generateICSFeed(calName: string, events: ICSEventItem[]): string {
  const now = new Date()
  const dtstamp = toUtcBasic(now)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Work Tracker//TM Flooring Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICSText(calName)}`,
    'X-WR-TIMEZONE:UTC',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ]

  for (const ev of events) {
    if (!ev.dateStr) continue

    const parsedStart = parseDateTimeString(ev.dateStr)
    if (!parsedStart.dateStr) continue

    const [y, m, d] = parsedStart.dateStr.split('-').map(Number)
    if (!y || !m || !d) continue

    const duration = ev.durationHours || 1

    let startH = 9, startM = 0
    if (parsedStart.hasTime && parsedStart.timeStr) {
      const [h, min] = parsedStart.timeStr.split(':').map(Number)
      if (!isNaN(h) && !isNaN(min)) {
        startH = h
        startM = min
      }
    }

    const startDate = new Date(Date.UTC(y, m - 1, d, startH, startM, 0))

    let endDate: Date
    if (ev.endDateStr) {
      const parsedEnd = parseDateTimeString(ev.endDateStr)
      const [ey, em, ed] = parsedEnd.dateStr.split('-').map(Number)
      let endH = 17, endM = 0
      if (parsedEnd.hasTime && parsedEnd.timeStr) {
        const [h, min] = parsedEnd.timeStr.split(':').map(Number)
        if (!isNaN(h) && !isNaN(min)) {
          endH = h
          endM = min
        }
      }
      endDate = new Date(Date.UTC(ey || y, (em ? em - 1 : m - 1), ed || d, endH, endM, 0))
    } else {
      // Default duration is exactly 1 hour from start time
      endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)
    }

    const dtstart = toUtcBasic(startDate)
    const dtend = toUtcBasic(endDate)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.uid}`)
    lines.push(`DTSTAMP:${dtstamp}`)
    lines.push(`DTSTART:${dtstart}`)
    lines.push(`DTEND:${dtend}`)
    lines.push(`SUMMARY:${escapeICSText(ev.title)}`)
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeICSText(ev.description)}`)
    }
    if (ev.location) {
      lines.push(`LOCATION:${escapeICSText(ev.location)}`)
    }
    lines.push('STATUS:CONFIRMED')
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function formatICS(opts: {
  uid: string
  title: string
  description?: string
  start?: Date | null
  end?: Date | null
  allDay?: boolean
  location?: string
}) {
  const now = new Date()
  const dtstamp = toUtcBasic(now)
  const dtstart = opts.start ? toUtcBasic(opts.start) : dtstamp
  const dtend = opts.end
    ? toUtcBasic(opts.end)
    : opts.start
    ? toUtcBasic(new Date((opts.start as Date).getTime() + 60 * 60 * 1000))
    : dtstamp

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Work Tracker//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(opts.title)}`,
    `DESCRIPTION:${escapeICSText(opts.description || '')}`,
    `LOCATION:${escapeICSText(opts.location || '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

/**
 * Generate Google Calendar URL for one-click adding with 1-hour default duration
 */
export function makeGoogleCalendarUrl(opts: {
  title: string
  details?: string
  location?: string
  dateStr: string // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  endDateStr?: string
  durationHours?: number
}) {
  const parsedStart = parseDateTimeString(opts.dateStr)
  if (!parsedStart.dateStr) return ''

  const [y, m, d] = parsedStart.dateStr.split('-').map(Number)
  if (!y || !m || !d) return ''

  const duration = opts.durationHours || 1

  let startH = 9, startM = 0
  if (parsedStart.hasTime && parsedStart.timeStr) {
    const [h, min] = parsedStart.timeStr.split(':').map(Number)
    if (!isNaN(h) && !isNaN(min)) {
      startH = h
      startM = min
    }
  }

  const startDate = new Date(Date.UTC(y, m - 1, d, startH, startM, 0))

  let endDate: Date
  if (opts.endDateStr) {
    const parsedEnd = parseDateTimeString(opts.endDateStr)
    const [ey, em, ed] = parsedEnd.dateStr.split('-').map(Number)
    let endH = 17, endM = 0
    if (parsedEnd.hasTime && parsedEnd.timeStr) {
      const [h, min] = parsedEnd.timeStr.split(':').map(Number)
      if (!isNaN(h) && !isNaN(min)) {
        endH = h
        endM = min
      }
    }
    endDate = new Date(Date.UTC(ey || y, (em ? em - 1 : m - 1), ed || d, endH, endM, 0))
  } else {
    // 1 hour default duration
    endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)
  }

  const startFormatted = toUtcBasic(startDate)?.replace(/[-:]/g, '') || ''
  const endFormatted = toUtcBasic(endDate)?.replace(/[-:]/g, '') || ''

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    details: opts.details || '',
    location: opts.location || '',
    dates: `${startFormatted}/${endFormatted}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Download a single event directly as an .ics file on iOS / Android / Desktop
 */
export function downloadICSFile(filename: string, event: ICSEventItem) {
  const ics = generateICSFeed('Work Tracker Event', [event])
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
