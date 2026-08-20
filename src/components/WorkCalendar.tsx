import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  User,
  Filter,
  Rss,
  Check,
  Copy,
  Smartphone,
  Clock,
} from 'lucide-react'
import AddToCalendarButton from './AddToCalendarButton'
import { parseDateTimeString, formatDateTimeDisplay } from '../utils/ics'

export interface CalendarEventItem {
  id: number
  title: string
  date: string // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  endDate?: string | null
  notes?: string | null
  eventType: string // 'general' | 'fitting' | 'measure' | 'holiday' | 'delivery'
  assignedTo?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface WorkItemForCalendar {
  id: number
  customerName: string
  site: string
  status: string
  customerPhone?: string | null
  whatsRequired: string
  whereNeedsMeasuring: string
  notes?: string | null
  assignedTo?: string | null
  measuredBy?: string | null
  measuredBooked?: string | null
  fittingDate?: string | null
  carpetOrderedDate?: string | null
  what3words?: string | null
}

export interface UnifiedEvent {
  uniqueKey: string
  id: string | number
  type: 'job-measure' | 'job-fitting' | 'manual'
  title: string
  subtitle?: string
  rawDateStr: string // full string with time if present
  dayDate: string // YYYY-MM-DD
  timeStr?: string // HH:mm
  hasTime: boolean
  endDate?: string
  color: string
  badgeBg: string
  badgeText: string
  borderColor: string
  dotColor: string
  assignedTo?: string | null
  rawJob?: WorkItemForCalendar
  rawManual?: CalendarEventItem
}

interface WorkCalendarProps {
  workItems: WorkItemForCalendar[]
  manualEvents: CalendarEventItem[]
  onOpenJob: (job: WorkItemForCalendar) => void
  onAddManualEvent: (presetDate?: string) => void
  onEditManualEvent: (event: CalendarEventItem) => void
  onDeleteManualEvent: (id: number) => void
  currentUser?: { username: string; displayName?: string; isAdmin?: boolean } | null
}

export default function WorkCalendarModal({
  workItems,
  manualEvents,
  onOpenJob,
  onAddManualEvent,
  onEditManualEvent,
  onDeleteManualEvent,
}: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [filterType, setFilterType] = useState<'all' | 'jobs' | 'measures' | 'fittings' | 'manual'>('all')
  const [filterAssignee, setFilterAssignee] = useState<'all' | 'tom' | 'chris'>('all')
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Convert all job dates and manual events into unified events
  const unifiedEvents: UnifiedEvent[] = useMemo(() => {
    const events: UnifiedEvent[] = []

    // 1. Process Job Measure Dates
    workItems.forEach((job) => {
      if (job.status === 'Completed') return

      if (job.measuredBooked && job.measuredBooked.trim()) {
        const d = job.measuredBooked.trim()
        const parsed = parseDateTimeString(d)
        events.push({
          uniqueKey: `job-measure-${job.id}-${d}`,
          id: job.id,
          type: 'job-measure',
          title: `📏 Measure: ${job.customerName}`,
          subtitle: job.site,
          rawDateStr: d,
          dayDate: parsed.dateStr,
          timeStr: parsed.timeStr,
          hasTime: parsed.hasTime,
          color: 'amber',
          badgeBg: 'bg-amber-500/15',
          badgeText: 'text-amber-300',
          borderColor: 'border-amber-500/30',
          dotColor: 'bg-amber-400',
          assignedTo: job.measuredBy || job.assignedTo,
          rawJob: job,
        })
      }

      // 2. Process Job Fitting Dates (single or comma-separated list)
      if (job.fittingDate && job.fittingDate.trim()) {
        const fittingList = job.fittingDate
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        fittingList.forEach((fitDate, idx) => {
          const parsed = parseDateTimeString(fitDate)
          events.push({
            uniqueKey: `job-fitting-${job.id}-${fitDate}-${idx}`,
            id: job.id,
            type: 'job-fitting',
            title: `🔨 Fitting: ${job.customerName}`,
            subtitle: job.site,
            rawDateStr: fitDate,
            dayDate: parsed.dateStr,
            timeStr: parsed.timeStr,
            hasTime: parsed.hasTime,
            color: 'violet',
            badgeBg: 'bg-violet-500/15',
            badgeText: 'text-violet-300',
            borderColor: 'border-violet-500/30',
            dotColor: 'bg-violet-400',
            assignedTo: job.assignedTo,
            rawJob: job,
          })
        })
      }
    })

    // 3. Process Manual Calendar Events
    manualEvents.forEach((man) => {
      let color = 'emerald'
      let badgeBg = 'bg-emerald-500/15'
      let badgeText = 'text-emerald-300'
      let borderColor = 'border-emerald-500/30'
      let dotColor = 'bg-emerald-400'

      if (man.eventType === 'holiday') {
        color = 'rose'
        badgeBg = 'bg-rose-500/15'
        badgeText = 'text-rose-300'
        borderColor = 'border-rose-500/30'
        dotColor = 'bg-rose-400'
      } else if (man.eventType === 'delivery') {
        color = 'sky'
        badgeBg = 'bg-sky-500/15'
        badgeText = 'text-sky-300'
        borderColor = 'border-sky-500/30'
        dotColor = 'bg-sky-400'
      } else if (man.eventType === 'measure') {
        color = 'amber'
        badgeBg = 'bg-amber-500/15'
        badgeText = 'text-amber-300'
        borderColor = 'border-amber-500/30'
        dotColor = 'bg-amber-400'
      } else if (man.eventType === 'fitting') {
        color = 'violet'
        badgeBg = 'bg-violet-500/15'
        badgeText = 'text-violet-300'
        borderColor = 'border-violet-500/30'
        dotColor = 'bg-violet-400'
      }

      const parsed = parseDateTimeString(man.date)

      events.push({
        uniqueKey: `manual-${man.id}`,
        id: man.id,
        type: 'manual',
        title: man.title,
        subtitle: man.notes || undefined,
        rawDateStr: man.date,
        dayDate: parsed.dateStr,
        timeStr: parsed.timeStr,
        hasTime: parsed.hasTime,
        endDate: man.endDate || undefined,
        color,
        badgeBg,
        badgeText,
        borderColor,
        dotColor,
        assignedTo: man.assignedTo,
        rawManual: man,
      })
    })

    return events
  }, [workItems, manualEvents])

  // Filter events by selected category and assignee
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((ev) => {
      if (filterType === 'measures' && ev.type !== 'job-measure') return false
      if (filterType === 'fittings' && ev.type !== 'job-fitting') return false
      if (filterType === 'jobs' && ev.type !== 'job-measure' && ev.type !== 'job-fitting') return false
      if (filterType === 'manual' && ev.type !== 'manual') return false

      if (filterAssignee !== 'all') {
        const assigned = (ev.assignedTo || '').toLowerCase()
        if (!assigned.includes(filterAssignee)) return false
      }
      return true
    })
  }, [unifiedEvents, filterType, filterAssignee])

  // Map events by date YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, UnifiedEvent[]>()
    filteredEvents.forEach((ev) => {
      if (!ev.dayDate) return
      const list = map.get(ev.dayDate) || []
      list.push(ev)
      map.set(ev.dayDate, list)
    })

    // Sort events on each day: timed events first in chronological order, then untimed events
    map.forEach((items, key) => {
      items.sort((a, b) => {
        if (a.hasTime && b.hasTime) {
          return (a.timeStr || '').localeCompare(b.timeStr || '')
        }
        if (a.hasTime) return -1
        if (b.hasTime) return 1
        return 0
      })
      map.set(key, items)
    })

    return map
  }, [filteredEvents])

  // Calendar Grid generation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 is Sunday
    // Adjust so Monday is 0
    const mondayOffset = (firstDayIndex + 6) % 7
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Previous month padding days
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      const prevM = month === 0 ? 11 : month - 1
      const prevY = month === 0 ? year - 1 : year
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
      })
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 11 ? 0 : month + 1
      const nextY = month === 11 ? year + 1 : year
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month])

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
  }

  const selectedDateEvents = eventsByDate.get(selectedDate) || []

  const todayStr = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const feedUrl = `${baseUrl}/api/calendar-feed.ics`
  const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://')

  const copyFeedLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(feedUrl)
      setCopiedFeedUrl(true)
      setTimeout(() => setCopiedFeedUrl(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-400">
                {unifiedEvents.length} scheduled item{unifiedEvents.length === 1 ? '' : 's'} across jobs & calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-0 sm:ml-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters, Sync & Add Entry Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Sync Shared Calendar button */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Sync live calendar with iPhone / Android / Google Calendar"
          >
            <Rss className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Phone Calendar</span>
          </button>

          {/* Event Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="measures">📏 Measures Only</option>
              <option value="fittings">🔨 Fittings Only</option>
              <option value="jobs">All Job Dates</option>
              <option value="manual">Manual Entries Only</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value as any)}
              className="appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Everyone</option>
              <option value="tom">Tom</option>
              <option value="chris">Chris</option>
            </select>
            <User className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => onAddManualEvent(selectedDate)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Layout: Grid + Day Detail Side panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Month Grid View */}
        <div className="xl:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
              <div key={dayName} className="text-xs font-semibold text-slate-400 py-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map(({ dayNum, dateStr, isCurrentMonth }) => {
              const dayEvents = eventsByDate.get(dateStr) || []
              const isSelected = selectedDate === dateStr
              const isToday = todayStr === dateStr

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-md'
                      : isToday
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                      : isCurrentMonth
                      ? 'bg-slate-950/60 border-slate-800/70 hover:bg-slate-900/60 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900/50 opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-500 text-white'
                          : isSelected
                          ? 'text-emerald-400'
                          : isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges inside day cell */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.uniqueKey}
                        className={`text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded truncate border ${ev.badgeBg} ${ev.badgeText} ${ev.borderColor}`}
                        title={`${ev.title} ${ev.timeStr ? `at ${ev.timeStr}` : ''} ${ev.subtitle ? `(${ev.subtitle})` : ''}`}
                      >
                        {ev.timeStr ? `${ev.timeStr} ` : ''}{ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-semibold text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {selectedDate === todayStr ? 'Today’s Schedule' : 'Selected Date'}
                </p>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => onAddManualEvent(selectedDate)}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                title="Add event for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-sm font-medium">No events scheduled for this day</p>
                <button
                  onClick={() => onAddManualEvent(selectedDate)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add an entry or reminder
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {selectedDateEvents.map((ev) => {
                  return (
                    <div
                      key={ev.uniqueKey}
                      className={`p-3.5 rounded-xl border ${ev.badgeBg} ${ev.borderColor} bg-slate-950/70 transition-all hover:bg-slate-950`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${ev.dotColor} shrink-0`} />
                            <h4 className="text-sm font-bold text-white leading-snug truncate">{ev.title}</h4>
                          </div>

                          {/* Time & Duration Display */}
                          {ev.hasTime && ev.timeStr ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 pl-4">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{formatDateTimeDisplay(ev.rawDateStr, 1).split('•')[1]?.trim() || `${ev.timeStr} (1 hr)`}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-4">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>All-day slot (1 hr default)</span>
                            </div>
                          )}

                          {ev.subtitle && (
                            <p className="text-xs text-slate-300 pl-4 truncate">{ev.subtitle}</p>
                          )}

                          {ev.assignedTo && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-4">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="capitalize">{ev.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        {/* Event Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Add to Calendar Button */}
                          <AddToCalendarButton
                            uid={ev.uniqueKey}
                            title={ev.title}
                            dateStr={ev.rawDateStr}
                            endDateStr={ev.endDate}
                            location={ev.subtitle}
                            details={ev.type !== 'manual' && ev.rawJob ? `Required: ${ev.rawJob.whatsRequired}\nMeasuring: ${ev.rawJob.whereNeedsMeasuring}` : ev.subtitle}
                            compact={true}
                          />

                          {ev.type !== 'manual' && ev.rawJob && (
                            <button
                              onClick={() => onOpenJob(ev.rawJob!)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Open and edit Job Card"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          )}

                          {ev.type === 'manual' && ev.rawManual && (
                            <>
                              <button
                                onClick={() => onEditManualEvent(ev.rawManual!)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteManualEvent(ev.rawManual!.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Legend Footer */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Job Measure Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Job Fitting Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>General Note / Task</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Holiday / Off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Calendar Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sync Shared Phone Calendar</h3>
                  <p className="text-xs text-slate-400">Live automatic 2-way sync across all devices</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You can subscribe to this live calendar on your <strong>iPhone (Apple Calendar)</strong>, <strong>Android (Google Calendar)</strong>, or <strong>Outlook</strong>. Whenever anyone adds or edits a measure or fitting date in the app, your phone calendar updates automatically!
            </p>

            {/* Apple iPhone 1-tap subscribe button */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Option 1: iPhone / Apple Calendar
                  </h4>
                  <p className="text-[11px] text-slate-400">Tap below to auto-subscribe in Apple Calendar</p>
                </div>
                <a
                  href={webcalUrl}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Subscribe on iPhone
                </a>
              </div>
            </div>

            {/* Android / Google Calendar instructions */}
            <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Option 2: Google Calendar (Android / Web)
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                1. Copy the subscription link below.<br />
                2. In Google Calendar on desktop or mobile, go to <em>Other calendars (+) &rarr; From URL</em> and paste it.
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={feedUrl}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyFeedLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedFeedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFeedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
