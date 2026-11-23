// The soonest upcoming measure or fitting, for the bold line under the customer's name.
export type Appointment = { kind: 'Measure' | 'Fitting'; value: string }

function upcoming(raw: string | null | undefined, today: string) {
  return (raw || '').split(',').map(s => s.trim())
    .filter(s => /^\d{4}-\d{2}-\d{2}/.test(s) && s.slice(0, 10) >= today)
}

export function nextAppointment(measuredBooked: string | null | undefined, fittingDate: string | null | undefined, today: string): Appointment | null {
  const all: Appointment[] = [
    ...upcoming(measuredBooked, today).map(value => ({ kind: 'Measure' as const, value })),
    ...upcoming(fittingDate, today).map(value => ({ kind: 'Fitting' as const, value })),
  ]
  all.sort((a, b) => a.value.localeCompare(b.value))
  return all[0] ?? null
}

// "2026-11-27T09:00" → "Fri 27 Nov · 09:00"; today/tomorrow are named.
export function formatAppointmentDate(value: string, today: string) {
  const date = value.slice(0, 10)
  const time = /T(\d{2}:\d{2})/.exec(value)?.[1]
  const d = new Date(`${date}T12:00:00Z`)
  const t = new Date(`${today}T12:00:00Z`)
  const days = Math.round((d.getTime() - t.getTime()) / 86400000)
  const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow'
    : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
  return time ? `${label} · ${time}` : label
}
