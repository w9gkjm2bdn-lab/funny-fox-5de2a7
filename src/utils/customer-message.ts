// Pre-written "confirming your fitting" message for texting or WhatsApping a customer.

const TITLES = new Set(['mr', 'mrs', 'ms', 'miss', 'mx', 'dr'])

// "Sarah Jones" → "Sarah"; "Mrs Smith" / "Mrs J Smith" → "Mrs Smith" (a title alone would read oddly).
export function greetingName(customerName: string) {
  const words = customerName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (TITLES.has(words[0].replace(/\.$/, '').toLowerCase()) && words.length > 1) {
    return `${words[0]} ${words[words.length - 1]}`
  }
  return words[0]
}

// Earliest fitting date (YYYY-MM-DD) on or after today, from a comma-separated list.
export function nextFittingDate(fittingDate: string | null | undefined, today: string) {
  return (fittingDate || '').split(',').map(s => s.trim().slice(0, 10))
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today)
    .sort()[0] || null
}

function ordinal(n: number) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th'
  return `${n}${s}`
}

// "2026-11-27" → "Friday 27th November" (no time, on purpose).
export function friendlyDate(date: string) {
  const d = new Date(`${date}T12:00:00Z`)
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
  const month = d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })
  return `${weekday} ${ordinal(d.getUTCDate())} ${month}`
}

export function fittingMessage(customerName: string, date: string) {
  const name = greetingName(customerName)
  return `Hi${name ? ` ${name}` : ''}, just confirming your fitting on ${friendlyDate(date)}. ` +
    `If you have any questions before then, just let us know. Thanks`
}

// UK mobile "07700 900123" → "447700900123" for wa.me links.
export function whatsappHref(phone: string, text: string) {
  let digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  else if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = `44${digits.slice(1)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

// "?&body=" works on both iPhone and Android messaging apps.
export function smsHref(phone: string, text: string) {
  return `sms:${phone.replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(text)}`
}
