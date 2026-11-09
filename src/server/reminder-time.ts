// Calendar dates are interpreted in UK time, including British Summer Time.
export function reminderWindow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const part = (type: string) => parts.find(p => p.type === type)!.value
  const today = `${part('year')}-${part('month')}-${part('day')}`
  const hour = Number(part('hour'))
  // An hour-long retry window allows transient push service failures to recover.
  if (hour !== 7 && hour !== 18) return null
  const target = new Date(`${today}T12:00:00Z`)
  if (hour === 18) target.setUTCDate(target.getUTCDate() + 1)
  return { date: target.toISOString().slice(0, 10), kind: hour === 18 ? 'tomorrow' : 'today' }
}

export function scheduledDates(value: string | null) {
  return (value || '').split(',').map(s => s.trim()).filter(s => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/.test(s))
}
