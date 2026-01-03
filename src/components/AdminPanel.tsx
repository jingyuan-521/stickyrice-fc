import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Week, GameSettings, Announcement } from '../types'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'
import { useToast } from '../lib/useToast'

const ADMIN_PASSWORD = 'StickyRice!Mon2026' // Stronger password: Capital letters, special char, numbers

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [weeks, setWeeks] = useState<Week[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingWeek, setEditingWeek] = useState<Week | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [deleteAnnouncementConfirm, setDeleteAnnouncementConfirm] = useState<string | null>(null)
  const [deleteWeekConfirm, setDeleteWeekConfirm] = useState<string | null>(null)
  const [loginError, setLoginError] = useState(false)
  const [uploadingQR, setUploadingQR] = useState(false)
  const { toasts, removeToast, success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    week_start_date: '',
    pitch_name: 'NL Arena',
    pitch_address: 'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
    pitch_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.770784950108!2d98.9905848!3d18.7190775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31b87d135f17%3A0xa40182cabd0422a7!2sNL%20ARENA!5e0!3m2!1sen!2sth!4v1767344450707!5m2!1sen!2sth',
    lock_time: '',
    max_players: 26,
    payment_qr_code_url: '',
    status: 'open' as 'open' | 'locked' | 'completed',
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadWeeks()
      loadGameSettings()
      loadAnnouncements()
      autoCreateNextMonday()
    }
  }, [isAuthenticated])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
      success('Welcome, Admin!')
    } else {
      setLoginError(true)
      showError('Incorrect password')
      setPassword('')
    }
  }

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  async function loadWeeks() {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .order('week_start_date', { ascending: false })
      .limit(10)

    if (data && !error) {
      setWeeks(data)
    }
  }

  async function loadGameSettings() {
    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .limit(1)
      .single()

    if (data && !error) {
      setGameSettings(data)
    }
  }

  async function loadAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      setAnnouncements(data)
    }
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!announcementMessage.trim()) return

    const { error } = await supabase.from('announcements').insert({
      message: announcementMessage.trim(),
      created_by: 'Admin',
      is_active: true,
      expires_at: null,
    })

    if (!error) {
      success('Announcement created!')
      setAnnouncementMessage('')
      setShowAnnouncements(false)
      loadAnnouncements()
    } else {
      showError('Failed to create announcement')
    }
  }

  async function toggleAnnouncement(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !isActive })
      .eq('id', id)

    if (!error) {
      loadAnnouncements()
    }
  }

  async function confirmDeleteAnnouncement() {
    if (!deleteAnnouncementConfirm) return

    const { error } = await supabase.from('announcements').delete().eq('id', deleteAnnouncementConfirm)

    if (!error) {
      success('Announcement deleted')
      loadAnnouncements()
    } else {
      showError('Failed to delete announcement')
    }

    setDeleteAnnouncementConfirm(null)
  }

  async function autoCreateNextMonday() {
    // Load settings first
    const { data: settings } = await supabase
      .from('game_settings')
      .select('*')
      .limit(1)
      .single()

    if (!settings || !settings.auto_create_enabled) return

    // Find next Monday
    const today = new Date()
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7))
    const nextMondayStr = nextMonday.toISOString().split('T')[0]

    // Check if game already exists for next Monday
    const { data: existingGame } = await supabase
      .from('weeks')
      .select('id')
      .eq('week_start_date', nextMondayStr)
      .single()

    if (existingGame) return // Game already exists

    // Create lock time (2 hours before game time, which is 6 PM)
    const lockTime = new Date(nextMonday)
    lockTime.setHours(18 - settings.default_lock_time_hours_before, 0, 0, 0)

    // Auto-create the game
    await supabase.from('weeks').insert({
      week_start_date: nextMondayStr,
      pitch_name: settings.default_pitch_name,
      pitch_address: settings.default_pitch_address,
      pitch_maps_url: settings.default_pitch_maps_url,
      lock_time: lockTime.toISOString(),
      max_players: settings.default_max_players,
      payment_qr_code_url: settings.default_payment_qr_code_url,
      status: 'open',
    })
  }

  async function createWeek(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.from('weeks').insert({
      week_start_date: formData.week_start_date,
      pitch_name: formData.pitch_name,
      pitch_address: formData.pitch_address,
      pitch_maps_url: formData.pitch_maps_url,
      lock_time: formData.lock_time,
      max_players: formData.max_players,
      payment_qr_code_url: formData.payment_qr_code_url || null,
      status: formData.status,
    })

    if (!error) {
      success('Game created successfully!')
      setShowForm(false)
      loadWeeks()
    } else {
      showError('Failed to create game')
    }
  }

  async function updateWeek(e: React.FormEvent) {
    e.preventDefault()
    if (!editingWeek) return

    const { error } = await supabase
      .from('weeks')
      .update({
        week_start_date: formData.week_start_date,
        pitch_name: formData.pitch_name,
        pitch_address: formData.pitch_address,
        pitch_maps_url: formData.pitch_maps_url,
        lock_time: formData.lock_time,
        max_players: formData.max_players,
        payment_qr_code_url: formData.payment_qr_code_url || null,
        status: formData.status,
      })
      .eq('id', editingWeek.id)

    if (!error) {
      success('Game updated successfully!')
      setEditingWeek(null)
      setShowForm(false)
      loadWeeks()
    } else {
      showError('Failed to update game')
    }
  }

  function startEditing(week: Week) {
    setEditingWeek(week)
    setFormData({
      week_start_date: week.week_start_date,
      pitch_name: week.pitch_name,
      pitch_address: week.pitch_address,
      pitch_maps_url: week.pitch_maps_url,
      lock_time: week.lock_time.replace('Z', '').slice(0, 16), // Format for datetime-local
      max_players: week.max_players,
      payment_qr_code_url: week.payment_qr_code_url || '',
      status: week.status,
    })
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingWeek(null)
    setShowForm(false)
    setFormData({
      week_start_date: '',
      pitch_name: 'NL Arena',
      pitch_address: 'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
      pitch_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.770784950108!2d98.9905848!3d18.7190775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31b87d135f17%3A0xa40182cabd0422a7!2sNL%20ARENA!5e0!3m2!1sen!2sth!4v1767344450707!5m2!1sen!2sth',
      lock_time: '',
      max_players: 26,
      payment_qr_code_url: '',
      status: 'open',
    })
  }

  async function updateGameSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!gameSettings) return

    const { error } = await supabase
      .from('game_settings')
      .update({
        auto_create_enabled: gameSettings.auto_create_enabled,
        default_pitch_name: gameSettings.default_pitch_name,
        default_pitch_address: gameSettings.default_pitch_address,
        default_pitch_maps_url: gameSettings.default_pitch_maps_url,
        default_max_players: gameSettings.default_max_players,
        default_payment_qr_code_url: gameSettings.default_payment_qr_code_url,
        default_lock_time_hours_before: gameSettings.default_lock_time_hours_before,
        payment_amount: gameSettings.payment_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameSettings.id)

    if (!error) {
      success('Settings updated successfully!')
      setShowSettings(false)
      loadGameSettings()
    } else {
      showError('Failed to update settings')
    }
  }

  async function handleQRUpload(file: File) {
    if (!gameSettings) return

    setUploadingQR(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `payment-qr-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(filePath)

      // Update game settings with new QR code URL
      setGameSettings({ ...gameSettings, default_payment_qr_code_url: urlData.publicUrl })

      success('QR code uploaded successfully!')
    } catch (err: any) {
      showError(`Upload failed: ${err.message}`)
    } finally {
      setUploadingQR(false)
    }
  }

  async function confirmDeleteWeek() {
    if (!deleteWeekConfirm) return

    const { error } = await supabase.from('weeks').delete().eq('id', deleteWeekConfirm)

    if (!error) {
      success('Game deleted successfully')
      loadWeeks()
    } else {
      showError('Failed to delete game')
    }

    setDeleteWeekConfirm(null)
  }

  async function toggleStatus(week: Week) {
    const newStatus = week.status === 'open' ? 'locked' : 'open'
    const { error } = await supabase
      .from('weeks')
      .update({ status: newStatus })
      .eq('id', week.id)

    if (!error) {
      loadWeeks()
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1b1464] to-[#6c4dc0] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter password to access admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6c4dc0] focus:border-transparent"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Login
            </button>

            <a
              href="/sticky-rice-fc"
              className="block text-center text-sm text-gray-600 hover:text-[#6c4dc0] transition"
            >
              ← Back to Main Page
            </a>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage games for Sticky Rice FC</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth')
                setIsAuthenticated(false)
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => {
              cancelEdit()
              setShowForm(!showForm)
            }}
            className="bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition"
          >
            {showForm && !editingWeek ? 'Cancel' : '+ Create New Game'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Auto-Create Settings
          </button>
          <button
            onClick={() => setShowAnnouncements(!showAnnouncements)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Announcements
          </button>
        </div>

        {showSettings && gameSettings && (
          <form onSubmit={updateGameSettings} className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">Auto-Create Settings</h2>
            <p className="text-sm text-gray-600 mb-4">
              When enabled, a new game will automatically be created for next Monday using these default settings.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_create"
                checked={gameSettings.auto_create_enabled}
                onChange={(e) => setGameSettings({ ...gameSettings, auto_create_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="auto_create" className="font-semibold">
                Enable auto-create for Monday games
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Default Pitch Name</label>
              <input
                type="text"
                value={gameSettings.default_pitch_name}
                onChange={(e) => setGameSettings({ ...gameSettings, default_pitch_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Default Pitch Address</label>
              <input
                type="text"
                value={gameSettings.default_pitch_address}
                onChange={(e) => setGameSettings({ ...gameSettings, default_pitch_address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Default Max Players</label>
              <input
                type="number"
                min="1"
                max="50"
                value={gameSettings.default_max_players}
                onChange={(e) => setGameSettings({ ...gameSettings, default_max_players: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Default Payment QR Code</label>

              {/* QR Code Preview */}
              {gameSettings.default_payment_qr_code_url && (
                <div className="mb-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Current QR Code:</p>
                  <img
                    src={gameSettings.default_payment_qr_code_url}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain mx-auto border-2 border-gray-300 rounded-lg bg-white"
                  />
                </div>
              )}

              {/* Upload Button */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleQRUpload(file)
                    }
                  }}
                  disabled={uploadingQR}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 file:cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                />
              </label>
              {uploadingQR && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 font-semibold">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading QR code...
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Upload your payment QR code image. This will be shown to all players on the Payments tab.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Lock Time (hours before game)</label>
              <input
                type="number"
                min="0"
                max="24"
                value={gameSettings.default_lock_time_hours_before}
                onChange={(e) => setGameSettings({ ...gameSettings, default_lock_time_hours_before: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Game time is 6:00 PM. Lock time will be set automatically.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Payment Amount (฿ THB)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={gameSettings.payment_amount}
                onChange={(e) => setGameSettings({ ...gameSettings, payment_amount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g. 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount each player should pay after the game. Players will be reminded automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showAnnouncements && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Manage Announcements</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Announcements appear at the top of all pages for all users.
            </p>

            {/* Create Announcement Form */}
            <form onSubmit={createAnnouncement} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <h3 className="font-bold mb-3">Create New Announcement</h3>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                rows={3}
                required
              />
              <div className="flex gap-3 mt-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700"
                >
                  Post Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnouncements(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </form>

            {/* Active Announcements List */}
            <div>
              <h3 className="font-bold mb-3">All Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No announcements yet</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`border-2 rounded-lg p-4 ${
                        announcement.is_active
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap break-words">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            By {announcement.created_by} •{' '}
                            {new Date(announcement.created_at).toLocaleString()}
                            {!announcement.is_active && ' • Inactive'}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() =>
                              toggleAnnouncement(announcement.id, announcement.is_active)
                            }
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              announcement.is_active
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {announcement.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => setDeleteAnnouncementConfirm(announcement.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={editingWeek ? updateWeek : createWeek} className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">{editingWeek ? 'Edit Game' : 'Create New Game'}</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">Game Date (Monday) *</label>
              <input
                type="date"
                required
                value={formData.week_start_date}
                onChange={(e) => setFormData({ ...formData, week_start_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Lock Time (When signups close) *</label>
              <input
                type="datetime-local"
                required
                value={formData.lock_time}
                onChange={(e) => setFormData({ ...formData, lock_time: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Pitch Name</label>
              <input
                type="text"
                value={formData.pitch_name}
                onChange={(e) => setFormData({ ...formData, pitch_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Pitch Address</label>
              <input
                type="text"
                value={formData.pitch_address}
                onChange={(e) => setFormData({ ...formData, pitch_address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Players</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.max_players}
                onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Payment QR Code URL (optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.payment_qr_code_url}
                onChange={(e) => setFormData({ ...formData, payment_qr_code_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Upload QR code to Supabase Storage and paste URL here</p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              Create Game
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">All Games</h2>

          {weeks.length === 0 ? (
            <p className="text-gray-500">No games yet</p>
          ) : (
            <div className="space-y-3">
              {weeks.map((week) => (
                <div key={week.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{new Date(week.week_start_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{week.pitch_name}</p>
                    <p className="text-xs text-gray-500">Lock: {new Date(week.lock_time).toLocaleString()}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      week.status === 'open' ? 'bg-green-100 text-green-800' :
                      week.status === 'locked' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {week.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(week)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(week)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      {week.status === 'open' ? 'Lock' : 'Open'}
                    </button>
                    <button
                      onClick={() => setDeleteWeekConfirm(week.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Week Confirmation Modal */}
        {deleteWeekConfirm && (
          <ConfirmModal
            title="Delete Game?"
            message="This will permanently delete the game along with all signups, payments, and photos. This action cannot be undone."
            confirmText="Delete Game"
            cancelText="Cancel"
            type="danger"
            onConfirm={confirmDeleteWeek}
            onCancel={() => setDeleteWeekConfirm(null)}
          />
        )}

        {/* Delete Announcement Confirmation Modal */}
        {deleteAnnouncementConfirm && (
          <ConfirmModal
            title="Delete Announcement?"
            message="This will permanently delete this announcement. This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={confirmDeleteAnnouncement}
            onCancel={() => setDeleteAnnouncementConfirm(null)}
          />
        )}

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[100] space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
