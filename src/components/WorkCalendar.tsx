// src/components/WorkCalendar.tsx
// React component using FullCalendar. Install dependencies: @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type EventItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps?: any;
};

export default function WorkCalendar() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/calendar/events');
        if (!res.ok) throw new Error('Failed to load events');
        const data = await res.json();
        // Expecting server returns [{ id, title, start, end, allDay, ... }]
        setEvents(data.map((e: any) => ({ ...e, id: String(e.id) })));
      } catch (err) {
        console.error('Calendar load error', err);
      }
    }
    load();
  }, []);

  return (
    <div className="work-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        eventClick={(info) => {
          // Default action: navigate to work details or open modal
          const id = info.event.id;
          window.location.href = `/work/${id}`; // adapt to your routing
        }}
        selectable={true}
        select={(selectInfo) => {
          // When user selects a slot, you can open a modal to create an "available" slot
          // For now we just log selection; adapt to your booking/availability UI
          console.log('Selected range', selectInfo.startStr, selectInfo.endStr, selectInfo.allDay);
          // Open your create-availability modal here
        }}
        height="auto"
      />
    </div>
  );
}
