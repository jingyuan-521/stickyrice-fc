import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isPastLockTime } from '../lib/utils'
import { saveLastName, getLastName } from '../lib/storage'
import type { Week, Signup } from '../types'
import NameInput from './NameInput'
import CommentsSection from './CommentsSection'
import Toast from './Toast'
import ConfirmModal from './ConfirmModal'
import { useToast } from '../lib/useToast'

type PlayersTabProps = {
  week: Week
  onSignupChange: () => void
}

export default function PlayersTab({ week, onSignupChange }: PlayersTabProps) {
  const [signups, setSignups] = useState<Signup[]>([])
  const [playerName, setPlayerName] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState<Signup | null>(null)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [promotedPlayerName, setPromotedPlayerName] = useState('')
  const [showPaymentReminder, setShowPaymentReminder] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const { toasts, removeToast, success, warning, error: showError } = useToast()

  const isLocked = isPastLockTime(week.lock_time)

  useEffect(() => {
    loadSignups()
    checkPaymentReminder()
  }, [week.id])

  async function checkPaymentReminder() {
    // Check if game has ended (game time is 6 PM, so check if it's past 8 PM on game day)
    const gameDate = new Date(week.week_start_date)
    gameDate.setHours(20, 0, 0, 0) // 8 PM on game day

    const now = new Date()
    const isAfterGame = now > gameDate

    if (!isAfterGame) return

    // Check if current user played and hasn't paid
    const currentUserName = getLastName()
    if (!currentUserName) return

    // Get user's signup for this week
    const { data: userSignup } = await supabase
      .from('signups')
      .select('id, is_waitlist')
      .eq('week_id', week.id)
      .eq('player_name', currentUserName)
      .is('cancelled_at', null)
      .single()

    if (!userSignup || userSignup.is_waitlist) return // User didn't play

    // Check if user has already paid
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('signup_id', userSignup.id)
      .single()

    if (payment) return // Already paid

    // Get payment amount from game settings
    const { data: settings } = await supabase
      .from('game_settings')
      .select('payment_amount')
      .single()

    const amount = settings?.payment_amount || 100

    // Check if reminder was already dismissed for this week
    const dismissedKey = `payment-reminder-dismissed-${week.id}`
    if (localStorage.getItem(dismissedKey) === 'true') return

    // Show payment reminder
    setPaymentAmount(amount)
    setShowPaymentReminder(true)
  }

  async function loadSignups() {
    const { data, error } = await supabase
      .from('signups')
      .select('*')
      .eq('week_id', week.id)
      .is('cancelled_at', null)
      .order('signed_up_at', { ascending: true })

    if (data && !error) {
      setSignups(data)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    if (isLocked) {
      setError('Sign-ups are locked for this week')
      return
    }

    setLoading(true)

    try {
      // Check if spots are full
      const activeSignups = signups.filter(s => !s.is_waitlist)
      const maxPlayers = week.max_players || 26
      const isWaitlist = activeSignups.length >= maxPlayers

      // Insert signup
      const { error: signupError } = await supabase
        .from('signups')
        .insert({
          week_id: week.id,
          player_name: playerName.trim(),
          note: note.trim() || null,
          is_waitlist: isWaitlist,
        })

      if (signupError) throw signupError

      // Save name to player_names table for autocomplete
      await supabase
        .from('player_names')
        .upsert({ name: playerName.trim(), last_used_at: new Date().toISOString() })

      // Save to localStorage
      saveLastName(playerName.trim())

      // Reload signups
      await loadSignups()
      onSignupChange()

      // Clear form
      setNote('')

      if (isWaitlist) {
        setShowWaitlistModal(true)
      } else {
        success('You\'re signed up!')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. You may already be signed up.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel(signup: Signup) {
    if (isLocked) {
      showError('Cannot cancel after lock time')
      return
    }

    setCancelConfirm(signup)
  }

  async function confirmCancel() {
    if (!cancelConfirm) return

    const { error } = await supabase
      .from('signups')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('id', cancelConfirm.id)

    if (!error) {
      success('Signup cancelled')

      // Check if there's someone on the waitlist to promote
      const waitlistSignups = signups.filter(s => s.is_waitlist && !s.cancelled_at)

      if (waitlistSignups.length > 0) {
        // Promote the first person from waitlist
        const firstWaitlist = waitlistSignups[0]

        const { error: promoteError } = await supabase
          .from('signups')
          .update({ is_waitlist: false })
          .eq('id', firstWaitlist.id)

        if (!promoteError) {
          // Check if the promoted player is the current user
          const currentUserName = getLastName()
          if (currentUserName === firstWaitlist.player_name) {
            // Show modal to current user
            setPromotedPlayerName(firstWaitlist.player_name)
            setShowPromotionModal(true)
          } else {
            // Show toast for admin/other users
            setTimeout(() => {
              success(`${firstWaitlist.player_name} has been moved from waitlist to the game!`)
            }, 1000)
          }
        }
      }

      await loadSignups()
      onSignupChange()
    } else {
      showError('Failed to cancel signup')
    }

    setCancelConfirm(null)
  }

  const activeSignups = signups.filter(s => !s.is_waitlist)
  const waitlistSignups = signups.filter(s => s.is_waitlist)
  const maxPlayers = week.max_players || 26 // Default to 26 if not set
  const spotsLeft = maxPlayers - activeSignups.length

  return (
    <div className="space-y-6">
      {/* Sign-up Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center text-2xl">
            ⚽
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Sign Up for This Week</h2>
            <p className="text-sm font-semibold mt-1">
              {spotsLeft > 0 ? (
                <span className="text-green-600">{spotsLeft} / {maxPlayers} spots available</span>
              ) : (
                <span className="text-orange-600">Full - Joining waitlist</span>
              )}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name *
            </label>
            <NameInput
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Bringing a friend, arriving late, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6c4dc0] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing up...' : isLocked ? 'Sign-ups Locked' : 'Sign Me Up!'}
          </button>

          {isLocked && (
            <p className="text-sm text-gray-600 text-center">
              Sign-ups closed on {new Date(week.lock_time).toLocaleString()}
            </p>
          )}
        </form>
      </div>

      {/* Active Players List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>Squad List</span>
          <span className="bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white text-sm font-bold px-3 py-1 rounded-full">
            {activeSignups.length} / {maxPlayers}
          </span>
        </h3>

        {activeSignups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">No players yet</p>
            <p className="text-gray-500">Be the first to sign up!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeSignups.map((signup, index) => (
              <div
                key={signup.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{signup.player_name}</p>
                      {signup.note && (
                        <p className="text-sm text-gray-600 mt-1">{signup.note}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(signup)}
                    disabled={isLocked}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waitlist */}
      {waitlistSignups.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏳ Waitlist</span>
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {waitlistSignups.length}
            </span>
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {waitlistSignups.map((signup, index) => (
              <div
                key={signup.id}
                className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      W{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{signup.player_name}</p>
                      {signup.note && (
                        <p className="text-sm text-gray-600 mt-1">{signup.note}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(signup)}
                    disabled={isLocked}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <CommentsSection week={week} />

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <ConfirmModal
          title="Cancel Signup?"
          message={`Are you sure you want to cancel the signup for ${cancelConfirm.player_name}? This action can be undone by signing up again.`}
          confirmText="Yes, Cancel Signup"
          cancelText="Keep Signup"
          type="warning"
          onConfirm={confirmCancel}
          onCancel={() => setCancelConfirm(null)}
        />
      )}

      {/* Waitlist Information Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  W
                </div>
                <h3 className="text-xl font-bold text-gray-900">Added to Waitlist</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                All spots are currently full, but you've been added to the <strong>waitlist</strong>.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">What happens next?</p>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>If someone cancels, you'll <strong>automatically</strong> be moved to the game</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>You'll see a notification when you're promoted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>First on waitlist = first to join when a spot opens</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Keep checking back or refresh the page to see if you've been moved to the game!
              </p>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Success Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900">You're In!</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed text-lg font-semibold mb-4">
                Great news! A spot opened up and you've been automatically moved from the waitlist to the game.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-sm text-green-900 font-semibold">You're now confirmed to play!</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Awesome! Let's Play!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Game Payment Reminder Modal */}
      {showPaymentReminder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  ฿
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Reminder</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Thanks for playing! Please submit your payment of <strong className="text-orange-600">฿{paymentAmount} THB</strong>.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900 font-semibold mb-2">How to pay:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to the Payments tab</li>
                  <li>Scan the QR code</li>
                  <li>Upload payment proof</li>
                </ol>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  localStorage.setItem(`payment-reminder-dismissed-${week.id}`, 'true')
                  setShowPaymentReminder(false)
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
              >
                Remind Me Later
              </button>
              <button
                onClick={() => {
                  setShowPaymentReminder(false)
                  window.location.hash = '#payments'
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
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
  )
}
