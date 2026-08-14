# Calendar feature (feature/calendar-events)

This branch adds a Calendar UI and "Add to Calendar" support (ICS + Google Calendar link).

What I added
- migrations/0001_add_schedule_fields.sql — adds scheduled_start, scheduled_end, is_all_day to work_items
- src/utils/ics.ts — ICS formatting utility (server/client usable)
- src/server/calendar.ts — example API handlers (get events, return ICS). Adapt to your framework.
- src/components/WorkCalendar.tsx — FullCalendar React component to display events
- src/components/AddToCalendarButton.tsx — Button to download .ics (phone) and open Google Calendar

Notes / Next steps
1) Run the migration against your Postgres DB:
   psql $DATABASE_URL -f migrations/0001_add_schedule_fields.sql

2) Wire API handlers to your framework:
   - If using Next.js API routes, create pages/api/calendar/events.ts and pages/api/work/[id]/ics.ts and import the handlers from src/server/calendar.ts
   - If using Express or Netlify functions, adapt the handlers accordingly. They contain TODO comments where you should hook your DB and auth.

3) Install frontend deps (if you use FullCalendar):
   npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

4) Add the WorkCalendar component to a page (e.g., /calendar) and show AddToCalendarButton on job detail pages.

Behavior/UX implemented
- Calendar will fetch events from /api/calendar/events (you must implement DB query in the handler to return scheduled jobs and availability slots)
- Users can select ranges (select handler logs the range; you should open a modal to create availability and save it as an "availability" event or related model)
- AddToCalendarButton tries to download an ICS from server (/api/work/:id/ics). If that fails it falls back to client-generated ICS.

Mobile notes
- iPhone: downloading and opening an .ics will prompt to add to the native Calendar app.
- Android: behavior varies; Google Calendar link typically gives the best UX on Android.

If you want, I can now:
- Implement the DB select queries and wire them into the API handlers (I need to know which DB client you use: Drizzle, Prisma, knex, plain pg)
- Add server-side availability model and migrations to store user availability days
- Create a modal UI to create availability slots from the calendar selection
- Open a PR with these changes (I'm on branch feature/calendar-events)

Tell me which of the above you'd like next and what DB client/framework your project uses so I can finish wiring the endpoints and open the PR.
