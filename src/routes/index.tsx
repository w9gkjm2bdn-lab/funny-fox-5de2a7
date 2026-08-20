import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  User,
  Search,
  Briefcase,
  Clock,
  CheckCircle2,
  MapPin,
  Clipboard,
  AlertCircle,
  Key,
  Database,
  Filter,
  Archive,
  X,
  Phone,
  FolderOpen,
  Calendar as CalendarIcon,
  ExternalLink,
} from 'lucide-react'
import {
  login,
  logout,
  getCurrentUser,
  getWorkItems,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem,
  updateUserProfile,
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../server/tracker.functions'
import WorkCalendarModal, { CalendarEventItem } from '../components/WorkCalendar'
import AddToCalendarButton from '../components/AddToCalendarButton'
import { parseDateTimeString, formatDateTimeDisplay } from '../utils/ics'

export const Route = createFileRoute('/')({
  component: TrackerApp,
})

interface WorkItem {
  id: number
  customerName: string
  customerPhone?: string | null
  site: string
  status: string
  notes: string | null
  whatsRequired: string
  whereNeedsMeasuring: string
  googleDriveUrl?: string | null
  samples?: string | null
  upliftAndDisposal?: boolean
  furniture?: boolean
  carpetOrderedDate?: string | null
  carpetCostPerSqm?: string | null
  measuredBy?: string | null
  measuredBooked?: string | null
  fittingDate?: string | null
  assignedTo?: string | null
  what3words?: string | null
  createdAt: string
  updatedAt: string
}

interface CurrentUser {
  userId: number
  username: string
  isAdmin?: boolean
  displayName?: string
  imageUrl?: string
}

function TrackerApp() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState(false)
  const [workItemsList, setWorkItemsList] = useState<WorkItem[]>([])
  
  // Auth Form State
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSubmitting, setAuthSubmitting] = useState(false)

  // Work Item Form State (for both Add and Edit)
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [site, setSite] = useState('')
  const [what3words, setWhat3words] = useState('')
  const [status, setStatus] = useState('Measure booked')
  const [whatsRequired, setWhatsRequired] = useState('')
  const [whereNeedsMeasuring, setWhereNeedsMeasuring] = useState('')
  const [notes, setNotes] = useState('')
  const [samples, setSamples] = useState('')
  const [googleDriveUrl, setGoogleDriveUrl] = useState('')
  const [editingDriveUrl, setEditingDriveUrl] = useState(false)
  const [upliftAndDisposal, setUpliftAndDisposal] = useState(false)
  const [furniture, setFurniture] = useState(false)
  const [assignedTo, setAssignedTo] = useState<'tom' | 'chris'>('tom')
  const [carpetOrderedDate, setCarpetOrderedDate] = useState('')
  const [carpetCostPerSqm, setCarpetCostPerSqm] = useState('')
  const [measuredBy, setMeasuredBy] = useState('')
  const [measuredBookedDate, setMeasuredBookedDate] = useState('')
  const [measuredBookedTime, setMeasuredBookedTime] = useState('')
  const [fittingSlots, setFittingSlots] = useState<{ date: string; time: string }[]>([{ date: '', time: '' }])
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileDisplayName, setProfileDisplayName] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Active vs Archive vs Calendar view ("Completed" jobs are archived out of the main list)
  const [view, setView] = useState<'active' | 'archive' | 'calendar'>('active')

  // Calendar manual events state
  const [calendarEventsList, setCalendarEventsList] = useState<CalendarEventItem[]>([])
  const [calendarModalMode, setCalendarModalMode] = useState<'none' | 'add' | 'edit'>('none')
  const [selectedCalendarEventId, setSelectedCalendarEventId] = useState<number | null>(null)
  const [calTitle, setCalTitle] = useState('')
  const [calDate, setCalDate] = useState('')
  const [calTime, setCalTime] = useState('')
  const [calEndDate, setCalEndDate] = useState('')
  const [calNotes, setCalNotes] = useState('')
  const [calEventType, setCalEventType] = useState('general')
  const [calAssignedTo, setCalAssignedTo] = useState('')
  const [calFormError, setCalFormError] = useState<string | null>(null)
  const [calFormSubmitting, setCalFormSubmitting] = useState(false)

  useEffect(() => {
    if (formMode === 'none') {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFormMode('none')
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [formMode])

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await Promise.all([fetchWorkItems(), fetchCalendarEvents()])
        }
      } catch (err) {
        console.error('Failed to get current user:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch all items
  const fetchWorkItems = async () => {
    setItemsLoading(true)
    try {
      const data = await getWorkItems()
      // Map server timestamps and null safety
      const mapped = data.map((item: any) => ({
        ...item,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      }))
      setWorkItemsList(mapped)
    } catch (err) {
      console.error('Error fetching work items:', err)
    } finally {
      setItemsLoading(false)
    }
  }

  // Fetch all calendar events
  const fetchCalendarEvents = async () => {
    try {
      const data = await getCalendarEvents()
      const mapped: CalendarEventItem[] = data.map((ev: any) => ({
        ...ev,
        createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : String(ev.createdAt),
        updatedAt: ev.updatedAt instanceof Date ? ev.updatedAt.toISOString() : String(ev.updatedAt),
      }))
      setCalendarEventsList(mapped)
    } catch (err) {
      console.error('Error fetching calendar events:', err)
    }
  }

  const openAddCalendarModal = (presetDate?: string) => {
    setSelectedCalendarEventId(null)
    setCalTitle('')
    const defaultDate = presetDate || (() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })()
    const parsed = parseDateTimeString(defaultDate)
    setCalDate(parsed.dateStr)
    setCalTime(parsed.timeStr || '')
    setCalEndDate('')
    setCalNotes('')
    setCalEventType('general')
    setCalAssignedTo('')
    setCalFormError(null)
    setCalendarModalMode('add')
  }

  const openEditCalendarModal = (event: CalendarEventItem) => {
    setSelectedCalendarEventId(event.id)
    setCalTitle(event.title)
    const parsed = parseDateTimeString(event.date)
    setCalDate(parsed.dateStr)
    setCalTime(parsed.timeStr || '')
    setCalEndDate(event.endDate || '')
    setCalNotes(event.notes || '')
    setCalEventType(event.eventType || 'general')
    setCalAssignedTo(event.assignedTo || '')
    setCalFormError(null)
    setCalendarModalMode('edit')
  }

  const handleCalendarFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalFormError(null)

    if (!calTitle.trim() || !calDate.trim()) {
      setCalFormError('Title and Date are required')
      return
    }

    const fullDate = calDate.trim() + (calTime.trim() ? `T${calTime.trim()}` : '')

    setCalFormSubmitting(true)
    try {
      if (calendarModalMode === 'add') {
        await createCalendarEvent({
          data: {
            title: calTitle.trim(),
            date: fullDate,
            endDate: calEndDate.trim() || undefined,
            notes: calNotes.trim() || undefined,
            eventType: calEventType,
            assignedTo: calAssignedTo.trim() || undefined,
          },
        })
      } else if (calendarModalMode === 'edit' && selectedCalendarEventId) {
        await updateCalendarEvent({
          data: {
            id: selectedCalendarEventId,
            title: calTitle.trim(),
            date: fullDate,
            endDate: calEndDate.trim() || undefined,
            notes: calNotes.trim() || undefined,
            eventType: calEventType,
            assignedTo: calAssignedTo.trim() || undefined,
          },
        })
      }
      setCalendarModalMode('none')
      await fetchCalendarEvents()
    } catch (err: any) {
      setCalFormError(err?.message || 'Failed to save calendar entry')
    } finally {
      setCalFormSubmitting(false)
    }
  }

  const handleDeleteCalendarEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this calendar entry?')) return
    try {
      await deleteCalendarEvent({ data: { id } })
      await fetchCalendarEvents()
    } catch (err) {
      console.error('Delete calendar event error:', err)
      alert('Failed to delete calendar entry')
    }
  }

  // Handle Login or Register submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!usernameInput || !passwordInput) {
      setAuthError('Please fill in all fields')
      return
    }

    setAuthSubmitting(true)
    try {
      const loggedInUser = await login({
        data: { username: usernameInput, password: passwordInput },
      })
      setUser(loggedInUser)
      setUsernameInput('')
      setPasswordInput('')
      await fetchWorkItems()
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.')
    } finally {
      setAuthSubmitting(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setWorkItemsList([])
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const openProfile = () => {
    if (!user) return
    setProfileDisplayName(user.displayName || user.username)
    setProfileImageUrl(user.imageUrl || '')
    setProfilePassword('')
    setProfileConfirmPassword('')
    setProfileError(null)
    setProfileOpen(true)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)

    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileError('Passwords must match')
      return
    }

    setProfileSubmitting(true)
    try {
      const updatedUser = await updateUserProfile({
        data: {
          displayName: profileDisplayName,
          imageUrl: profileImageUrl,
          password: profilePassword || undefined,
          confirmPassword: profileConfirmPassword || undefined,
        },
      })
      setUser(updatedUser)
      setProfileOpen(false)
      setProfilePassword('')
      setProfileConfirmPassword('')
    } catch (err: any) {
      setProfileError(err?.message || 'Unable to save profile settings')
    } finally {
      setProfileSubmitting(false)
    }
  }

  // Open Form for Adding
  const openAddForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setSite('')
    setWhat3words('')
    setStatus('Measure booked')
    setWhatsRequired('')
    setWhereNeedsMeasuring('')
    setNotes('')
    setSamples('')
    setGoogleDriveUrl('')
    setEditingDriveUrl(false)
    setUpliftAndDisposal(false)
    setFurniture(false)
    setAssignedTo('tom')
    setCarpetOrderedDate('')
    setCarpetCostPerSqm('')
    setMeasuredBy('')
    setMeasuredBookedDate('')
    setMeasuredBookedTime('')
    setFittingSlots([{ date: '', time: '' }])
    setFormError(null)
    setFormMode('add')
  }

  // Open Form for Editing
  const openEditForm = (item: WorkItem) => {
    setSelectedItemId(item.id)
    setCustomerName(item.customerName)
    setCustomerPhone(item.customerPhone || '')
    setSite(item.site)
    setWhat3words((item as any).what3words || '')
    setStatus(item.status)
    setWhatsRequired(item.whatsRequired)
    setWhereNeedsMeasuring(item.whereNeedsMeasuring)
    setNotes(item.notes || '')
    setSamples((item as any).samples || '')
    setGoogleDriveUrl(item.googleDriveUrl || '')
    setEditingDriveUrl(false)
    setUpliftAndDisposal(Boolean(item.upliftAndDisposal))
    setFurniture(Boolean(item.furniture))
    setAssignedTo((item as any).assignedTo || 'tom')
    setCarpetOrderedDate((item as any).carpetOrderedDate || '')
    setCarpetCostPerSqm((item as any).carpetCostPerSqm || '')
    setMeasuredBy((item as any).measuredBy || '')
    
    const parsedMeasure = parseDateTimeString((item as any).measuredBooked || '')
    setMeasuredBookedDate(parsedMeasure.dateStr)
    setMeasuredBookedTime(parsedMeasure.timeStr || '')

    const loadedFittingDates = ((item as any).fittingDate || '')
      .split(',')
      .map((d: string) => d.trim())
      .filter(Boolean)
    
    const slots = loadedFittingDates.map((raw: string) => {
      const p = parseDateTimeString(raw)
      return { date: p.dateStr, time: p.timeStr || '' }
    })
    setFittingSlots(slots.length ? slots : [{ date: '', time: '' }])
    setFormError(null)
    setFormMode('edit')
  }

  // Handle Create or Update work item
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!customerName || !site || !whatsRequired || !whereNeedsMeasuring) {
      setFormError('Please fill in all required fields')
      return
    }

    const measuredBooked = measuredBookedDate.trim()
      ? (measuredBookedTime.trim() ? `${measuredBookedDate.trim()}T${measuredBookedTime.trim()}` : measuredBookedDate.trim())
      : ''

    // Multiple fitting dates stored as comma-separated YYYY-MM-DD or YYYY-MM-DDTHH:mm
    const fittingDate = fittingSlots
      .filter((s) => s.date.trim())
      .map((s) => (s.time.trim() ? `${s.date.trim()}T${s.time.trim()}` : s.date.trim()))
      .join(',')

    setFormSubmitting(true)
    try {
      if (formMode === 'add') {
        await createWorkItem({
          data: {
            customerName,
            customerPhone,
            site,
            what3words: what3words.trim() || undefined,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            googleDriveUrl,
            upliftAndDisposal,
            furniture,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
            carpetCostPerSqm,
          },
        })
      } else if (formMode === 'edit' && selectedItemId !== null) {
        await updateWorkItem({
          data: {
            id: selectedItemId,
            customerName,
            customerPhone,
            site,
            what3words: what3words.trim() || undefined,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            googleDriveUrl,
            upliftAndDisposal,
            furniture,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
            carpetCostPerSqm,
          },
        })
      }
      setFormMode('none')
      await fetchWorkItems()
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save work item.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Handle delete work item
  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this work item?')) {
      return
    }

    try {
      await deleteWorkItem({ data: { id } })
      await fetchWorkItems()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete work item')
    }
  }

  // Multi-day fitting date & time helpers (jobs can span several days)
  const updateFittingSlot = (index: number, field: 'date' | 'time', value: string) => {
    setFittingSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }
  const addFittingSlot = () => {
    setFittingSlots((prev) => [...prev, { date: '', time: '' }])
  }
  const removeFittingSlot = (index: number) => {
    setFittingSlots((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length ? next : [{ date: '', time: '' }]
    })
  }

  const getDialHref = (phone: string) => {
    const dialable = phone.replace(/[^\d+]/g, '')
    return dialable ? `tel:${dialable}` : '#'
  }

  const getWhat3WordsHref = (w3w: string) => {
    const clean = w3w.trim().replace(/^\/{1,3}/, '')
    return `https://what3words.com/${encodeURIComponent(clean)}`
  }

  // Completed jobs are archived: they leave the main list and live in the Archive view.
  const activeItems = workItemsList.filter((item) => item.status !== 'Completed')
  const archivedItems = workItemsList.filter((item) => item.status === 'Completed')

  // Filtering Logic
  const filteredItems = (view === 'archive' ? archivedItems : activeItems).filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerPhone && item.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.what3words && item.what3words.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.googleDriveUrl && item.googleDriveUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.whatsRequired.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whereNeedsMeasuring.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    // Status filter only applies to the active list (the archive is all "Completed").
    const matchesStatus =
      view === 'archive' || statusFilter === 'All' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Counts for Stats
  const totalJobs = activeItems.length
  const measureBookedJobs = workItemsList.filter((i) => i.status === 'Measure booked').length
  const progressJobs = workItemsList.filter((i) => i.status === 'In progress').length
  const completedJobs = archivedItems.length

  // Main Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-100">Loading Work Tracker...</h2>
        </div>
      </div>
    )
  }

  // Login/Register Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <Database className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Work Tracker
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access across all devices • Fully persistent • Team accounts
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/50 backdrop-blur-md py-8 px-4 shadow-xl ring-1 ring-slate-800 rounded-3xl sm:px-10 border border-slate-800">
            <form className="space-y-5" onSubmit={handleAuthSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Username
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {authError && (
                <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-sm text-red-400 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                >
                  {authSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Log In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <div className="rounded-2xl bg-emerald-950/20 border border-emerald-900/30 p-4">
                <h4 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  Team Login
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your team credentials to access the tracker. Accounts are managed centrally and cannot be created here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged-in Tracker Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Work Tracker</h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Persistent Multi-Device Task Registry</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openProfile}
              className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-sm text-left hover:bg-slate-900 transition-all"
              title="Edit profile"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium capitalize">{user.displayName || user.username}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* KPI Dashboard Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <p className="text-3xl font-extrabold text-white mt-1">{totalJobs}</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl text-slate-300 border border-slate-700/50">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Measure Booked</p>
              <p className="text-3xl font-extrabold text-white mt-1">{measureBookedJobs}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-extrabold text-white mt-1">{progressJobs}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <Filter className="w-5 h-5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView('archive')}
            className="text-left bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all cursor-pointer"
            title="View archived (completed) jobs"
          >
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Archived</p>
              <p className="text-3xl font-extrabold text-white mt-1">{completedJobs}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Search, Filters and Create Action Block */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-slate-900/30 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
          <div className="flex flex-1 flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by customer, site, needs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            {/* Status Select Filter */}
            {view !== 'calendar' && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={view === 'archive'}
                  className="appearance-none w-full sm:w-44 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Measure booked">Measure booked</option>
                  <option value="Fitting booked">Fitting booked</option>
                  <option value="Quote sent">Quote sent</option>
                  <option value="In progress">In progress</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Filter className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
            <button
              onClick={() => setView(view === 'calendar' ? 'active' : 'calendar')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                view === 'calendar'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800'
              }`}
              title="Toggle Schedule View"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{view === 'calendar' ? 'Show Cards' : 'Schedule'}</span>
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-all cursor-pointer shadow-md shadow-emerald-500/10 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {profileOpen && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl shadow-emerald-950/5 mt-6">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Edit Profile
              </h3>
              <button
                onClick={() => setProfileOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              {profileError && (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(e) => setProfileDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Tom, Chris, or your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Profile Image URL</label>
                  <input
                    type="url"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={profileConfirmPassword}
                    onChange={(e) => setProfileConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {profileSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dynamic Modal for Add & Edit */}
        {formMode !== 'none' && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto px-3 py-4 sm:px-6 sm:py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-item-form-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setFormMode('none')
              }
            }}
          >
            <div className="w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl shadow-slate-950/60">
            <div className="sticky top-0 z-10 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-emerald-400" />
                <span id="work-item-form-title">
                  {formMode === 'add' ? 'Add New Work Item' : 'Edit Work Item'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setFormMode('none')}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/70 transition-all cursor-pointer"
                title="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-6">
              {formError && (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Site Address / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="E.g. Main Office, North Wing, Sydney Branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>what3words Location (Optional)</span>
                    <span className="text-xs text-rose-400 font-mono font-bold">///</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400 font-mono font-bold text-sm">
                      ///
                    </span>
                    <input
                      type="text"
                      value={what3words.replace(/^\/{1,3}/, '')}
                      onChange={(e) => setWhat3words(e.target.value ? `///${e.target.value.replace(/^\/{1,3}/, '')}` : '')}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-sm font-mono"
                      placeholder="e.g. filled.count.soap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Measure booked">Measure booked</option>
                    <option value="Fitting booked">Fitting booked</option>
                    <option value="Quote sent">Quote sent</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Where Needs Measuring <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={whereNeedsMeasuring}
                    onChange={(e) => setWhereNeedsMeasuring(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="E.g. Ground floor windows, boardroom skylight"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  What flooring is required <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={whatsRequired}
                  onChange={(e) => setWhatsRequired(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                  placeholder="Describe what tasks or materials are required..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                  placeholder="Any other helpful observations..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Samples (Optional)</label>
                  <input
                    type="text"
                    value={samples}
                    onChange={(e) => setSamples(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Samples required or notes about samples"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Google Drive Folder
                  </label>
                  {googleDriveUrl.trim() && !editingDriveUrl ? (
                    <div className="flex items-center justify-between gap-3 w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <a
                        href={googleDriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-sky-300 hover:text-sky-200 transition-colors min-w-0"
                      >
                        <FolderOpen className="w-4 h-4 shrink-0 text-sky-400/80" />
                        <span className="truncate underline underline-offset-2">
                          {customerName.trim() || 'Open folder'}
                        </span>
                      </a>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingDriveUrl(true)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleDriveUrl('')
                            setEditingDriveUrl(false)
                          }}
                          className="text-xs font-semibold text-slate-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={googleDriveUrl}
                      onChange={(e) => setGoogleDriveUrl(e.target.value)}
                      onBlur={() => googleDriveUrl.trim() && setEditingDriveUrl(false)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="Paste the customer folder link"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Assigned To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value as 'tom' | 'chris')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="tom">Tom</option>
                    <option value="chris">Chris</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer hover:border-emerald-500/40 transition-all">
                  <input
                    type="checkbox"
                    checked={upliftAndDisposal}
                    onChange={(e) => setUpliftAndDisposal(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  Uplift and disposal
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer hover:border-emerald-500/40 transition-all">
                  <input
                    type="checkbox"
                    checked={furniture}
                    onChange={(e) => setFurniture(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  Furniture
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Carpet ordered</label>
                  <input
                    type="date"
                    value={carpetOrderedDate}
                    onChange={(e) => setCarpetOrderedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Carpet cost per m² (excl. VAT)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                      £
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={carpetCostPerSqm}
                      onChange={(e) => setCarpetCostPerSqm(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Measure booked</span>
                    <span className="text-[11px] text-slate-500 font-normal">Defaults to 1 hr</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="date"
                      value={measuredBookedDate}
                      onChange={(e) => setMeasuredBookedDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                    <div className="relative">
                      <input
                        type="time"
                        value={measuredBookedTime}
                        onChange={(e) => setMeasuredBookedTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-300">
                    Fitting date(s) & start times
                  </label>
                  <span className="text-[11px] text-slate-500 font-normal">Defaults to 1 hr duration</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Select the date and optional start time for each day of the fitting.</p>
                <div className="space-y-2.5">
                  {fittingSlots.map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => updateFittingSlot(index, 'date', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => updateFittingSlot(index, 'time', e.target.value)}
                        className="w-full sm:w-36 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFittingSlot(index)}
                        disabled={fittingSlots.length === 1 && !slot.date && !slot.time}
                        className="p-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                        title="Remove this date"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFittingSlot}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add another date
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Who's measuring</label>
                  <select
                    value={measuredBy}
                    onChange={(e) => setMeasuredBy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="">-- Select --</option>
                    <option value="tom">Tom</option>
                    <option value="chris">Chris</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormMode('none')}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {formSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : formMode === 'add' ? (
                    'Add Item'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Navigation Tabs: Active Jobs | Schedule | Archive */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setView('active')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              view === 'active'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Active Jobs</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
              {activeItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              view === 'calendar'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Schedule</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {workItemsList.filter((i) => i.measuredBooked || i.fittingDate).length + calendarEventsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setView('archive')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              view === 'archive'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-4 h-4 shrink-0" />
            <span>Archive</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
              {archivedItems.length}
            </span>
          </button>
        </div>

        {/* View Content: Calendar vs Work Item Cards */}
        {view === 'calendar' ? (
          <WorkCalendarModal
            workItems={workItemsList}
            manualEvents={calendarEventsList}
            onOpenJob={(job) => {
              openEditForm(job as any)
            }}
            onAddManualEvent={(presetDate) => {
              openAddCalendarModal(presetDate)
            }}
            onEditManualEvent={(event) => {
              openEditCalendarModal(event)
            }}
            onDeleteManualEvent={(id) => {
              handleDeleteCalendarEvent(id)
            }}
            currentUser={user}
          />
        ) : itemsLoading && workItemsList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400">Loading work database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-slate-900/20 py-20 text-center rounded-3xl border border-dashed border-slate-800">
            <Clipboard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">
              {view === 'archive' ? 'No Archived Jobs Yet' : 'No Work Items Found'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {view === 'archive'
                ? searchQuery
                  ? 'No archived jobs match your active search.'
                  : 'Jobs marked as “Completed” are moved here automatically so your active list stays clear.'
                : searchQuery || statusFilter !== 'All'
                  ? 'No items match your active search filter settings.'
                  : "Get started by adding your team's first work tracking entry!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              // Status Badge Coloring
              let statusBadgeClass = ''
              if (item.status === 'Completed') {
                statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              } else if (item.status === 'In progress') {
                statusBadgeClass = 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
              } else if (item.status === 'Measure booked') {
                statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              } else if (item.status === 'Fitting booked') {
                statusBadgeClass = 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              } else if (item.status === 'Quote sent') {
                statusBadgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              } else if (item.status === 'Pending') {
                statusBadgeClass = 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
              } else {
                statusBadgeClass = 'bg-slate-700/10 text-slate-300 border border-slate-700/20'
              }

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/65 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl"
                >
                  <div className="p-6 space-y-4">
                    {/* Customer & Location */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
                          {item.customerName}
                        </h4>

                        {/* Highlighted Clickable Address */}
                        <div>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(item.site)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-semibold transition-all shadow-sm group/site max-w-full"
                            title="Open address in Maps"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover/site:scale-110 transition-transform" />
                            <span className="truncate">{item.site}</span>
                            <ExternalLink className="w-3 h-3 text-emerald-400/70 group-hover/site:text-emerald-300 shrink-0 ml-0.5" />
                          </a>
                        </div>

                        {/* Clickable what3words */}
                        {item.what3words && (
                          <div>
                            <a
                              href={getWhat3WordsHref(item.what3words)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 hover:border-rose-500/40 text-xs font-mono font-semibold transition-all group/w3w max-w-full"
                              title="Open location in what3words"
                            >
                              <span className="text-rose-400 font-bold">///</span>
                              <span className="truncate">{item.what3words.trim().replace(/^\/{1,3}/, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-rose-400/70 group-hover/w3w:text-rose-300 shrink-0 ml-0.5" />
                            </a>
                          </div>
                        )}

                        {item.customerPhone && (
                          <div>
                            <a
                              href={getDialHref(item.customerPhone)}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-300 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400/80" />
                              <span>{item.customerPhone}</span>
                            </a>
                          </div>
                        )}
                        {item.googleDriveUrl && (
                          <div>
                            <a
                              href={item.googleDriveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200 transition-colors"
                            >
                              <FolderOpen className="w-3.5 h-3.5 text-sky-400/80" />
                              <span className="underline underline-offset-2">{item.customerName}</span>
                            </a>
                          </div>
                        )}
                        {item.assignedTo && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Briefcase className="w-3.5 h-3.5 text-violet-400/80" />
                            <span className="capitalize">Assigned to {item.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${statusBadgeClass}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Requirements / Details */}
                    <div className="space-y-3.5">
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">What’s Required</p>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">
                          {item.whatsRequired}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Where Needs Measuring</p>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">
                          {item.whereNeedsMeasuring}
                        </p>
                      </div>

                      {item.notes && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Notes</p>
                          <p className="text-xs text-slate-400 leading-relaxed italic mt-0.5 whitespace-pre-line">
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {(item as any).samples && (
                        <div>
                          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Samples</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">
                            {(item as any).samples}
                          </p>
                        </div>
                      )}

                      {(item.upliftAndDisposal || item.furniture) && (
                        <div className="flex flex-wrap gap-2">
                          {item.upliftAndDisposal && (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                              Uplift and disposal
                            </span>
                          )}
                          {item.furniture && (
                            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
                              Furniture
                            </span>
                          )}
                        </div>
                      )}

                      {item.carpetOrderedDate && (
                        <div>
                          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Carpet ordered</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">{new Date(item.carpetOrderedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {item.carpetCostPerSqm && (
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Carpet cost per m² (excl. VAT)</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">£{item.carpetCostPerSqm}</p>
                        </div>
                      )}
                      {item.measuredBooked && (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Measure booked</p>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">
                              {formatDateTimeDisplay(item.measuredBooked, 1)}
                            </p>
                          </div>
                          <AddToCalendarButton
                            uid={`work-${item.id}-measure@worktracker`}
                            title={`📏 Measure: ${item.customerName}`}
                            dateStr={item.measuredBooked}
                            location={item.site}
                            details={`Where needs measuring: ${item.whereNeedsMeasuring}\nWhat's required: ${item.whatsRequired}${item.notes ? `\nNotes: ${item.notes}` : ''}${item.what3words ? `\nwhat3words: ${item.what3words}` : ''}`}
                            compact={true}
                          />
                        </div>
                      )}
                      {item.fittingDate && (
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
                              Fitting date{item.fittingDate.includes(',') ? 's' : ''}
                            </p>
                            <AddToCalendarButton
                              uid={`work-${item.id}-fitting@worktracker`}
                              title={`🔨 Fitting: ${item.customerName}`}
                              dateStr={item.fittingDate.split(',')[0].trim()}
                              location={item.site}
                              details={`What's required: ${item.whatsRequired}${item.notes ? `\nNotes: ${item.notes}` : ''}${item.what3words ? `\nwhat3words: ${item.what3words}` : ''}`}
                              compact={true}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.fittingDate
                              .split(',')
                              .map((d) => d.trim())
                              .filter(Boolean)
                              .map((d, i) => (
                                <span
                                  key={i}
                                  className="text-sm text-slate-300 leading-relaxed font-medium bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1"
                                >
                                  {formatDateTimeDisplay(d, 1)}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Timestamps Footer */}
                  <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <span title={`Updated: ${new Date(item.updatedAt).toLocaleString()}`}>
                      Updated: {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Manual Calendar Event Add/Edit Modal */}
        {calendarModalMode !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-400" />
                  {calendarModalMode === 'add' ? 'Add Calendar Entry' : 'Edit Calendar Entry'}
                </h3>
                <button
                  onClick={() => setCalendarModalMode('none')}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCalendarFormSubmit} className="p-6 space-y-4">
                {calFormError && (
                  <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{calFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Event Title / Note <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="e.g. Workshop inventory, Supplier delivery, Tom off"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={calDate}
                      onChange={(e) => setCalDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Start Time</span>
                      <span className="text-[10px] text-slate-500 font-normal">1 hr default</span>
                    </label>
                    <input
                      type="time"
                      value={calTime}
                      onChange={(e) => setCalTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={calEndDate}
                      onChange={(e) => setCalEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                      Category / Type
                    </label>
                    <select
                      value={calEventType}
                      onChange={(e) => setCalEventType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="general">General Note / Task</option>
                      <option value="measure">Measure Appointment</option>
                      <option value="fitting">Fitting Appointment</option>
                      <option value="delivery">Material / Carpet Delivery</option>
                      <option value="holiday">Holiday / Day Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                      Assigned To (Optional)
                    </label>
                    <select
                      value={calAssignedTo}
                      onChange={(e) => setCalAssignedTo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="">Team / Anyone</option>
                      <option value="tom">Tom</option>
                      <option value="chris">Chris</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                    Notes / Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={calNotes}
                    onChange={(e) => setCalNotes(e.target.value)}
                    placeholder="Add any extra notes or requirements..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCalendarModalMode('none')}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={calFormSubmitting}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    {calFormSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : calendarModalMode === 'add' ? (
                      'Create Entry'
                    ) : (
                      'Save Entry'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
