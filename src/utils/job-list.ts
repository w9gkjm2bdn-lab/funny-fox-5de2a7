import { nextAppointment } from './next-appointment.ts'

type Job = {
  customerName: string
  customerPhone?: string | null
  site: string
  what3words?: string | null
  googleDriveUrl?: string | null
  whatsRequired: string
  whereNeedsMeasuring?: string | null
  notes?: string | null
  measuredBooked?: string | null
  fittingDate?: string | null
}

// Jobs with an upcoming measure or fitting come first, soonest at the top.
// The rest keep their existing order (most recently changed first).
export function sortByNextAppointment<T extends Job>(jobs: T[], today: string): T[] {
  const keyed = jobs.map((job, index) => ({ job, index, next: nextAppointment(job.measuredBooked, job.fittingDate, today)?.value }))
  keyed.sort((a, b) => {
    if (a.next && b.next) return a.next.localeCompare(b.next) || a.index - b.index
    if (a.next) return -1
    if (b.next) return 1
    return a.index - b.index
  })
  return keyed.map(k => k.job)
}

// Case-insensitive search across the job's text; phone numbers match with or
// without spaces ("07700900123" finds "07700 900123").
export function jobMatchesSearch(job: Job, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const fields = [job.customerName, job.customerPhone, job.site, job.what3words, job.googleDriveUrl,
    job.whatsRequired, job.whereNeedsMeasuring, job.notes]
  if (fields.some(f => (f || '').toLowerCase().includes(q))) return true
  const digits = q.replace(/\D/g, '')
  return digits.length >= 3 && (job.customerPhone || '').replace(/\D/g, '').includes(digits)
}
