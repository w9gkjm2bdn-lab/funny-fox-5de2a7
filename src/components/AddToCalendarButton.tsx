// src/components/AddToCalendarButton.tsx
// Dropdown/popover component that lets users add an individual job/event to Apple Calendar, Google Calendar, or copy details

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, Download, ExternalLink, ChevronDown, Check } from 'lucide-react'
import { downloadICSFile, makeGoogleCalendarUrl } from '../utils/ics'

export interface AddToCalendarProps {
  title: string
  dateStr: string // YYYY-MM-DD
  endDateStr?: string
  location?: string
  details?: string
  uid: string
  compact?: boolean
  buttonLabel?: string
}

export default function AddToCalendarButton({
  title,
  dateStr,
  endDateStr,
  location,
  details,
  uid,
  compact = true,
  buttonLabel = 'Add to Calendar',
}: AddToCalendarProps) {
  const [open, setOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleDownloadICS = () => {
    downloadICSFile(`event-${dateStr}.ics`, {
      uid,
      title,
      description: details,
      location,
      dateStr,
      endDateStr,
    })
    setDownloaded(true)
    setTimeout(() => {
      setDownloaded(false)
      setOpen(false)
    }, 1500)
  }

  const googleUrl = makeGoogleCalendarUrl({
    title,
    details,
    location,
    dateStr,
    endDateStr,
  })

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
          compact
            ? 'p-1.5 text-xs text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
            : 'px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600 shadow-sm'
        }`}
        title="Add to personal or shared calendar"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        {!compact && <span>{buttonLabel}</span>}
        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-1.5 sm:mb-0 sm:mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in">
          <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80">
            Export Event
          </p>

          {/* Google Calendar Link */}
          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Google Calendar</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
            </a>
          )}

          {/* Apple / Outlook / Generic ICS Download */}
          <button
            type="button"
            onClick={handleDownloadICS}
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Apple / Phone (.ics)</span>
            </div>
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
