// src/utils/ics.ts
// Utility to create ICS content for an event. Can be used on server or client.

export function pad(n: number) { return String(n).padStart(2, '0'); }

export function toUtcBasic(date?: Date | null) {
  if (!date) return null;
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function escapeICSText(s: string) {
  return (s || '').replace(/\\r?\\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function formatICS(opts: {
  uid: string;
  title: string;
  description?: string;
  start?: Date | null;
  end?: Date | null;
  allDay?: boolean;
  location?: string;
}) {
  const now = new Date();
  const dtstamp = toUtcBasic(now);
  const dtstart = opts.start ? toUtcBasic(opts.start) : dtstamp;
  const dtend = opts.end ? toUtcBasic(opts.end) : (opts.start ? toUtcBasic(new Date((opts.start as Date).getTime() + 60 * 60 * 1000)) : dtstamp);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Company//Tracker//EN',
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
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
}
