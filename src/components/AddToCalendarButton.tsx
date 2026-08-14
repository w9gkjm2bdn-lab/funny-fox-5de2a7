// src/components/AddToCalendarButton.tsx
// Button that downloads an .ics file (works on iPhone/most Android) and offers a Google Calendar link

import React from 'react';
import { formatICS } from '../utils/ics';

type Work = {
  id: number | string;
  customerName?: string;
  site?: string;
  whatsRequired?: string;
  notes?: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  isAllDay?: boolean;
};

function toDate(d?: string | null) {
  return d ? new Date(d) : null;
}

function formatForGoogle(d: Date) {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/-|:|\.\d{3}/g, '');
}

function makeGoogleUrl({ title, details, location, start, end, allDay }: any) {
  if (!start || !end) return null;
  const dates = allDay
    ? `${start.toISOString().slice(0,10).replace(/-/g,'')}/${end.toISOString().slice(0,10).replace(/-/g,'')}`
    : `${formatForGoogle(start)}/${formatForGoogle(end)}`;
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, details: details || '', location: location || '', dates });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function AddToCalendarButton({ work }: { work: Work }) {
  const title = `${work.customerName || 'Job'} — ${work.site || ''}`.trim();
  const details = `${work.whatsRequired || ''}${work.notes ? '\n\n' + work.notes : ''}`;
  const location = work.site || '';
  const start = toDate(work.scheduledStart);
  const end = toDate(work.scheduledEnd) || (start ? new Date(start.getTime() + 60 * 60 * 1000) : null);

  const handleDownload = async () => {
    // Prefer server-generated ICS to respect auth/visibility, but fallback to client-generated ICS
    try {
      // Try fetching from server endpoint
      const res = await fetch(`/api/work/${work.id}/ics`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-${work.id}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('Server ICS fetch failed, falling back to client generation', err);
    }

    // Client-side (fallback)
    const ics = formatICS({
      uid: `workitem-${work.id}@${(typeof window !== 'undefined' && (window as any).location && (window as any).location.hostname) || 'example.com'}`,
      title,
      description: details,
      start,
      end,
      allDay: !!work.isAllDay,
      location,
    });

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-${work.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const googleUrl = start && end ? makeGoogleUrl({ title, details, location, start, end, allDay: work.isAllDay }) : null;

  return (
    <div className="add-to-calendar-buttons" style={{ display: 'flex', gap: 8 }}>
      <button onClick={handleDownload} className="btn btn-primary">Save to phone (.ics)</button>
      {googleUrl && (
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Add to Google Calendar</a>
      )}
    </div>
  );
}
