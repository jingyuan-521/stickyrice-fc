import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getLastName } from '../lib/storage'
import type { Week, SignupWithPayment } from '../types'
import CommentsSection from './CommentsSection'
import Toast from './Toast'
import { useToast } from '../lib/useToast'

type PaymentsTabProps = {
  week: Week
}

export default function PaymentsTab({ week }: PaymentsTabProps) {
  const [signupsWithPayments, setSignupsWithPayments] = useState<SignupWithPayment[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [viewingProof, setViewingProof] = useState<string | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  useEffect(() => {
    loadPayments()
  }, [week.id])

  async function loadPayments() {
    // Get all active signups
    const { data: signups, error: signupsError } = await supabase
      .from('signups')
      .select('*')
      .eq('week_id', week.id)
      .is('cancelled_at', null)
      .order('signed_up_at', { ascending: true })

    if (signupsError || !signups) return

    // Get payments for these signups
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('signup_id', signups.map(s => s.id))

    if (paymentsError) return

    // Combine signups with their payment status
    const combined = signups.map(signup => ({
      ...signup,
      payment: payments?.find(p => p.signup_id === signup.id) || null,
    }))

    setSignupsWithPayments(combined)
  }

  async function handleImageUpload(signupId: string, playerName: string, file: File) {
    setUploading(signupId)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${signupId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath)

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          signup_id: signupId,
          proof_image_url: urlData.publicUrl,
          marked_paid_by: playerName,
        })

      if (paymentError) throw paymentError

      // Reload payments
      await loadPayments()
      success('Payment proof uploaded successfully!')
    } catch (err: any) {
      showError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(null)
    }
  }

  // Check if this is the current user's signup (based on localStorage)
  function isCurrentUser(playerName: string): boolean {
    return getLastName() === playerName
  }

  return (
    <div className="space-y-6">
      {/* Payment QR Code */}
      {week.payment_qr_code_url && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center text-2xl">
              💳
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Scan to Pay</h2>
          </div>
          <div className="flex justify-center">
            <img
              src={week.payment_qr_code_url}
              alt="Payment QR Code"
              className="w-64 h-64 object-contain border-4 border-[#6c4dc0] rounded-lg shadow-md"
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Scan with your banking app to pay
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6c4dc0] to-[#9c6de6] rounded-full flex items-center justify-center text-2xl">
            💰
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Status</h2>
        </div>
        <div className="bg-gradient-to-r from-[#1b1464]/5 to-[#6c4dc0]/5 border-l-4 border-[#6c4dc0] p-4 rounded">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-[#1b1464]">How it works:</strong>
            <br />
            • {week.payment_qr_code_url ? 'Scan QR code above or make payment' : 'Make payment'}
            <br />
            • Upload your payment proof (screenshot/photo)
            <br />
            • Your status will automatically show as paid
            <br />
            • All payment statuses are publicly visible
          </p>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Tracker</h3>

        {signupsWithPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No players signed up yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {signupsWithPayments.map((item) => {
              const hasPaid = !!item.payment
              const canUpload = isCurrentUser(item.player_name)

              return (
                <div
                  key={item.id}
                  className={`rounded-lg border-2 p-4 space-y-3 transition-all ${
                    hasPaid
                      ? 'bg-[#ffcd00]/10 border-[#ffcd00] shadow-md'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{item.player_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {hasPaid ? (
                          <span className="text-[#1b1464] font-bold text-sm flex items-center gap-1">
                            ✓ PAID
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Not paid</span>
                        )}
                      </div>
                    </div>

                    {hasPaid && (
                      <button
                        onClick={() => setViewingProof(item.payment!.proof_image_url)}
                        className="text-[#6c4dc0] hover:text-[#1b1464] text-sm font-semibold underline transition"
                      >
                        View Proof
                      </button>
                    )}
                  </div>

                  {/* Upload section */}
                  {!hasPaid && canUpload && (
                    <div>
                      <label className="block">
                        <span className="text-sm font-semibold text-gray-700 mb-2 block">
                          Upload payment proof:
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(item.id, item.player_name, file)
                            }
                          }}
                          disabled={uploading === item.id}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-bold
                            file:bg-gradient-to-r file:from-[#6c4dc0] file:to-[#9c6de6] file:text-white
                            hover:file:shadow-lg file:transition-all
                            disabled:opacity-50 cursor-pointer"
                        />
                      </label>
                      {uploading === item.id && (
                        <p className="text-sm text-[#6c4dc0] font-medium mt-2 flex items-center gap-2">
                          <span className="animate-pulse">●</span>
                          Uploading...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Image viewer modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingProof(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={viewingProof}
              alt="Payment proof"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              className="mt-4 w-full bg-gradient-to-r from-[#6c4dc0] to-[#9c6de6] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              onClick={() => setViewingProof(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <CommentsSection week={week} />

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
