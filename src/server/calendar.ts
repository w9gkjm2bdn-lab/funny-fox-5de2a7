// src/server/calendar.ts
// Minimal example API handlers. Adapt to your framework (Express, Next.js, Netlify functions, etc.).
// - GET /api/calendar/events -> returns JSON list of events
// - GET /api/work/:id/ics -> returns an .ics file for a work item

import { formatICS } from '../utils/ics';

// Placeholder DB client import - replace with your project's DB client (Drizzle, Prisma, pg, etc.)
// import { db } from '../db';

// Example getEvents handler (pseudo-code)
export async function getEventsHandler(_req: any, res: any) {
  try {
    // Option A: If you have query params to limit range, parse them
    // const { from, to } = req.query;

    // TODO: replace with your DB access to work_items and filter by scheduled_start/scheduled_end
    // Example return format expected by FullCalendar/react-big-calendar:
    // [{ id, title, start, end, allDay, extendedProps: { ... } }, ...]

    // const rows = await db.select().from(workItems).where(...)

    // For now return an empty array or mock
    const events: any[] = [];

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(events));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}

// Example getIcs handler - requires the work item's id in the path
export async function getIcsHandler(req: any, res: any) {
  try {
    const id = req.params ? req.params.id : req.query.id;
    if (!id) {
      res.statusCode = 400;
      res.end('Missing id');
      return;
    }

    // TODO: fetch the work item from DB by id and ensure the requesting user is authorized to access it
    // const item = await db.select().from(workItems).where(workItems.id.eq(Number(id))).then(r => r[0])

    // For demonstration, here's a mocked item (replace this with DB row)
    const item = {
      id: Number(id),
      customer_name: 'ACME Ltd',
      site: '123 Main St',
      whats_required: 'Measure windows',
      notes: 'Bring ladder',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      is_all_day: false,
    };

    const start = item.scheduled_start ? new Date(item.scheduled_start) : null;
    const end = item.scheduled_end ? new Date(item.scheduled_end) : null;

    const ics = formatICS({
      uid: `workitem-${item.id}@${process.env.APP_DOMAIN || 'example.com'}`,
      title: `${item.customer_name} — ${item.site}`,
      description: `${item.whats_required}\n\nNotes: ${item.notes || ''}`,
      start,
      end,
      allDay: !!item.is_all_day,
      location: item.site,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="job-${item.id}.ics"`);
    res.statusCode = 200;
    res.end(ics);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal error');
  }
}
