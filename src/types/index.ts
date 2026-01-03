// Database types for Sticky Rice FC

export type Week = {
  id: string
  week_start_date: string // "2026-01-06" (Monday)
  pitch_name: string
  pitch_address: string
  pitch_maps_url: string
  lock_time: string // ISO datetime
  status: 'open' | 'locked' | 'completed'
  max_players: number // Default 26
  payment_qr_code_url: string | null
  created_at?: string
}

export type Signup = {
  id: string
  week_id: string
  player_name: string
  note: string | null
  signed_up_at: string
  cancelled_at: string | null
  is_waitlist: boolean
}

export type Payment = {
  id: string
  signup_id: string
  proof_image_url: string
  marked_paid_at: string
  marked_paid_by: string // player_name who marked it
}

export type Photo = {
  id: string
  week_id: string
  image_url: string
  uploaded_by: string // player_name
  uploaded_at: string
}

export type PlayerName = {
  name: string // primary key
  last_used_at: string
}

export type Comment = {
  id: string
  week_id: string
  player_name: string
  message: string
  created_at: string
  parent_id: string | null
  replies?: Comment[]
}

export type Announcement = {
  id: string
  message: string
  created_by: string
  created_at: string
  expires_at: string | null
  is_active: boolean
}

export type GameSettings = {
  id: string
  auto_create_enabled: boolean
  default_pitch_name: string
  default_pitch_address: string
  default_pitch_maps_url: string
  default_max_players: number
  default_payment_qr_code_url: string
  default_lock_time_hours_before: number
  payment_amount: number
  created_at: string
  updated_at: string
}

// UI helper types
export type TabType = 'players' | 'payments' | 'album' | 'location'

export type SignupWithPayment = Signup & {
  payment: Payment | null
}
