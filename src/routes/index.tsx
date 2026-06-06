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
  site: string
  status: string
  notes: string | null
  whatsRequired: string
  whereNeedsMeasuring: string
  samples?: string | null
  carpetAndFlooringOrdered?: boolean
  carpetOrderedDate?: string | null
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
  const [site, setSite] = useState('')
  const [status, setStatus] = useState('Measure booked')
  const [whatsRequired, setWhatsRequired] = useState('')
  const [whereNeedsMeasuring, setWhereNeedsMeasuring] = useState('')
  const [notes, setNotes] = useState('')
  const [samples, setSamples] = useState('')
  const [carpetAndFlooringOrdered, setCarpetAndFlooringOrdered] = useState(false)
  const [assignedTo, setAssignedTo] = useState('tom')
  const [carpetOrderedDate, setCarpetOrderedDate] = useState('')
  const [measuredBy, setMeasuredBy] = useState('')
  const [measuredBooked, setMeasuredBooked] = useState('')
  const [fittingDate, setFittingDate] = useState('')
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
    setSite('')
    setStatus('Measure booked')
    setWhatsRequired('')
    setWhereNeedsMeasuring('')
    setNotes('')
    setSamples('')
    setCarpetAndFlooringOrdered(false)
    setAssignedTo('tom')
    setCarpetOrderedDate('')
    setMeasuredBy('')
    setMeasuredBooked('')
    setFittingDate('')
    setFormError(null)
    setFormMode('add')
  }

  // Open Form for Editing
  const openEditForm = (item: WorkItem) => {
    setSelectedItemId(item.id)
    setCustomerName(item.customerName)
    setSite(item.site)
    setStatus(item.status)
    setWhatsRequired(item.whatsRequired)
    setWhereNeedsMeasuring(item.whereNeedsMeasuring)
    setNotes(item.notes || '')
    setSamples((item as any).samples || '')
    setCarpetAndFlooringOrdered(Boolean(item.carpetAndFlooringOrdered))
    setAssignedTo((item as any).assignedTo || 'tom')
    setCarpetOrderedDate((item as any).carpetOrderedDate || '')
    setMeasuredBy((item as any).measuredBy || '')
    setMeasuredBooked((item as any).measuredBooked || '')
    setFittingDate((item as any).fittingDate || '')
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

    setFormSubmitting(true)
    try {
      if (formMode === 'add') {
        await createWorkItem({
          data: {
            customerName,
            site,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            carpetAndFlooringOrdered,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
          },
        })
      } else if (formMode === 'edit' && selectedItemId !== null) {
        await updateWorkItem({
          data: {
            id: selectedItemId,
            customerName,
            site,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            carpetAndFlooringOrdered,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
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

  // Filtering Logic
  const filteredItems = workItemsList.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatsRequired.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whereNeedsMeasuring.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Counts for Stats
  const totalJobs = workItemsList.length
  const pendingJobs = workItemsList.filter((i) => i.status === 'Pending').length
  const progressJobs = workItemsList.filter((i) => i.status === 'In Progress').length
  const completedJobs = workItemsList.filter((i) => i.status === 'Completed').length

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
                  ) : authMode === 'login' ? (
                    'Log In'
                  ) : (
                    'Create Account'
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Jobs</p>
              <p className="text-3xl font-extrabold text-white mt-1">{totalJobs}</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl text-slate-300 border border-slate-700/50">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-extrabold text-white mt-1">{pendingJobs}</p>
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

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-extrabold text-white mt-1">{completedJobs}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
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
                className="appearance-none w-full sm:w-44 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-10"
              >
                <option value="All">All Statuses</option>
                <option value="Measure booked">Measure booked</option>
                <option value="Fitting booked">Fitting booked</option>
                <option value="Quote sent">Quote sent</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
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

        {/* Dynamic Modal / Inline Form for Add & Edit */}
        {formMode !== 'none' && (
          <div className="bg-slate-900 rounded-3xl border border-emerald-500/20 overflow-hidden shadow-xl shadow-emerald-950/5">
            <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-emerald-400" />
                {formMode === 'add' ? 'Add New Work Item' : 'Edit Work Item'}
              </h3>
              <button
                onClick={() => setFormMode('none')}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
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
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Assigned To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="tom">Tom</option>
                    <option value="chris">Chris</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Flooring ordered</label>
                  <input
                    type="date"
                    value={carpetOrderedDate}
                    onChange={(e) => setCarpetOrderedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
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
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Fitting date</label>
                  <input
                    type="date"
                    value={fittingDate}
                    onChange={(e) => setFittingDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
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
        )}

        {/* Work Items Listing Grid / View */}
        {itemsLoading && workItemsList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400">Loading work database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-slate-900/20 py-20 text-center rounded-3xl border border-dashed border-slate-800">
            <Clipboard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No Work Items Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
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
                      <div>
                        <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
                          {item.customerName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500/80" />
                          <span>{item.site}</span>
                        </div>
                        {item.assignedTo && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
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

                      {item.carpetOrderedDate && (
                        <div>
                          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Flooring ordered</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">{new Date(item.carpetOrderedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {item.measuredBooked && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Measure booked</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">{new Date(item.measuredBooked).toLocaleDateString()}</p>
                        </div>
                      )}
                      {item.fittingDate && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fitting date</p>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium mt-1">{new Date(item.fittingDate).toLocaleDateString()}</p>
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
      </div>
    </div>
  )
}
