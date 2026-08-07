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
} from '../server/tracker.functions'

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
  const [measuredBooked, setMeasuredBooked] = useState('')
  const [fittingDates, setFittingDates] = useState<string[]>([''])
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

  // Active vs Archive view ("Completed" jobs are archived out of the main list)
  const [view, setView] = useState<'active' | 'archive'>('active')

  // Which cards have their secondary details expanded, and which are mid status-update
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({})
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Inline status change straight from a card, without opening the full editor.
  const handleStatusChange = async (item: WorkItem, newStatus: string) => {
    if (newStatus === item.status) return
    // Optimistic update so the list feels instant in the field.
    setWorkItemsList((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)))
    setStatusUpdatingId(item.id)
    try {
      await updateWorkItem({
        data: {
          id: item.id,
          customerName: item.customerName,
          customerPhone: item.customerPhone || '',
          site: item.site,
          status: newStatus,
          assignedTo: (item.assignedTo as 'tom' | 'chris') || 'tom',
          whatsRequired: item.whatsRequired,
          whereNeedsMeasuring: item.whereNeedsMeasuring,
          notes: item.notes || '',
          samples: item.samples || '',
          googleDriveUrl: item.googleDriveUrl || '',
          upliftAndDisposal: Boolean(item.upliftAndDisposal),
          furniture: Boolean(item.furniture),
          measuredBy: item.measuredBy || '',
          measuredBooked: item.measuredBooked || '',
          fittingDate: item.fittingDate || '',
          carpetOrderedDate: item.carpetOrderedDate || '',
          carpetCostPerSqm: item.carpetCostPerSqm || '',
        },
      })
      await fetchWorkItems()
    } catch (err) {
      console.error('Status update error:', err)
      // Roll back on failure.
      await fetchWorkItems()
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Shared status options + badge styling so cards and filters stay consistent.
  const STATUS_OPTIONS = ['Pending', 'Measure booked', 'Fitting booked', 'Quote sent', 'In progress', 'Completed']
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
      case 'In progress':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25'
      case 'Measure booked':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/25'
      case 'Fitting booked':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/25'
      case 'Quote sent':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25'
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/25'
    }
  }

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
          await fetchWorkItems()
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
    setMeasuredBooked('')
    setFittingDates([''])
    setFormError(null)
    setFormMode('add')
  }

  // Open Form for Editing
  const openEditForm = (item: WorkItem) => {
    setSelectedItemId(item.id)
    setCustomerName(item.customerName)
    setCustomerPhone(item.customerPhone || '')
    setSite(item.site)
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
    setMeasuredBooked((item as any).measuredBooked || '')
    const loadedFittingDates = ((item as any).fittingDate || '')
      .split(',')
      .map((d: string) => d.trim())
      .filter(Boolean)
    setFittingDates(loadedFittingDates.length ? loadedFittingDates : [''])
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

    // Multiple fitting dates are stored as a single comma-separated string.
    const fittingDate = fittingDates.map((d) => d.trim()).filter(Boolean).join(',')

    setFormSubmitting(true)
    try {
      if (formMode === 'add') {
        await createWorkItem({
          data: {
            customerName,
            customerPhone,
            site,
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

  // Multi-day fitting date helpers (jobs can span several days)
  const updateFittingDate = (index: number, value: string) => {
    setFittingDates((prev) => prev.map((d, i) => (i === index ? value : d)))
  }
  const addFittingDate = () => {
    setFittingDates((prev) => [...prev, ''])
  }
  const removeFittingDate = (index: number) => {
    setFittingDates((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length ? next : ['']
    })
  }

  const getDialHref = (phone: string) => {
    const dialable = phone.replace(/[^\d+]/g, '')
    return dialable ? `tel:${dialable}` : '#'
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
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-900/30 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
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
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Work Item
          </button>
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

              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Customer &amp; job
              </p>
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

              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2 border-t border-slate-800">
                Samples, files &amp; options
              </p>
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
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2 border-t border-slate-800">
                Scheduling &amp; pricing
              </p>
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
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Measure booked</label>
                  <input
                    type="date"
                    value={measuredBooked}
                    onChange={(e) => setMeasuredBooked(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Fitting date(s)
                </label>
                <p className="text-xs text-slate-500 mb-2">Add more than one date for jobs that span multiple days.</p>
                <div className="space-y-2.5">
                  {fittingDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => updateFittingDate(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFittingDate(index)}
                        disabled={fittingDates.length === 1 && !date}
                        className="p-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Remove this date"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFittingDate}
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

        {/* Active / Archive Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setView('active')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
              view === 'active'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Active Jobs
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
              {activeItems.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView('archive')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
              view === 'archive'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            Archive
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
              {archivedItems.length}
            </span>
          </button>
        </div>

        {/* Work Items Listing Grid / View */}
        {itemsLoading && workItemsList.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const fittingList = (item.fittingDate || '')
                .split(',')
                .map((d) => d.trim())
                .filter(Boolean)
              const hasExtras =
                Boolean(item.notes) ||
                Boolean(item.samples) ||
                Boolean(item.carpetOrderedDate) ||
                Boolean(item.carpetCostPerSqm) ||
                item.upliftAndDisposal ||
                item.furniture
              const isExpanded = Boolean(expandedCards[item.id])

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col overflow-hidden shadow-md"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: customer + inline status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-lg tracking-tight truncate">
                          {item.customerName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{item.site}</span>
                        </div>
                      </div>
                      <div className="relative shrink-0">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          disabled={statusUpdatingId === item.id}
                          className={`appearance-none cursor-pointer rounded-full border pl-2.5 pr-6 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 ${getStatusBadgeClass(item.status)}`}
                          title="Change status"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-slate-900 text-slate-100">
                              {s}
                            </option>
                          ))}
                        </select>
                        <Filter className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>
                    </div>

                    {/* Quick contact row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                      {item.customerPhone && (
                        <a
                          href={getDialHref(item.customerPhone)}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400/80" />
                          <span>{item.customerPhone}</span>
                        </a>
                      )}
                      {item.assignedTo && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="capitalize">{item.assignedTo}</span>
                        </span>
                      )}
                      {item.googleDriveUrl && (
                        <a
                          href={item.googleDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-sky-400/80" />
                          <span className="underline underline-offset-2">Folder</span>
                        </a>
                      )}
                    </div>

                    {/* Core requirement summary */}
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required</p>
                        <p className="text-sm text-slate-200 leading-relaxed mt-0.5 line-clamp-2">
                          {item.whatsRequired}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Where</p>
                        <p className="text-sm text-slate-200 leading-relaxed mt-0.5 line-clamp-2">
                          {item.whereNeedsMeasuring}
                        </p>
                      </div>
                    </div>

                    {/* Key schedule chips (always visible) */}
                    {(item.measuredBooked || fittingList.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.measuredBooked && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
                            <Clock className="w-3 h-3 text-teal-400/80" />
                            Measure {new Date(item.measuredBooked).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {fittingList.map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="w-3 h-3 text-violet-400/80" />
                            Fit {new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Secondary details (collapsible) */}
                    {hasExtras && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleCard(item.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Hide details' : 'Show details'}
                        </button>
                        {isExpanded && (
                          <div className="space-y-3 pt-1 border-t border-slate-800/70">
                            {(item.upliftAndDisposal || item.furniture) && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {item.upliftAndDisposal && (
                                  <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                    Uplift &amp; disposal
                                  </span>
                                )}
                                {item.furniture && (
                                  <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                    Furniture
                                  </span>
                                )}
                              </div>
                            )}
                            {item.samples && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Samples</p>
                                <p className="text-sm text-slate-300 leading-relaxed mt-0.5">{item.samples}</p>
                              </div>
                            )}
                            {item.notes && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Notes</p>
                                <p className="text-xs text-slate-400 leading-relaxed italic mt-0.5 whitespace-pre-line">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                            {(item.carpetOrderedDate || item.carpetCostPerSqm) && (
                              <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {item.carpetOrderedDate && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Carpet ordered</p>
                                    <p className="text-sm text-slate-300 mt-0.5">{new Date(item.carpetOrderedDate).toLocaleDateString()}</p>
                                  </div>
                                )}
                                {item.carpetCostPerSqm && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cost / m² (excl. VAT)</p>
                                    <p className="text-sm text-slate-300 mt-0.5">£{item.carpetCostPerSqm}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions & Timestamps Footer */}
                  <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <span title={`Updated: ${new Date(item.updatedAt).toLocaleString()}`}>
                      Updated {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
      </div>
    </div>
  )
}
