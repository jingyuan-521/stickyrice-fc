import { createClient } from '@supabase/supabase-js'
import type { Week, Signup, Payment, Photo, PlayerName } from '../types'

// Get environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      weeks: {
        Row: Week
        Insert: Omit<Week, 'id' | 'created_at'>
        Update: Partial<Omit<Week, 'id'>>
      }
      signups: {
        Row: Signup
        Insert: Omit<Signup, 'id' | 'signed_up_at'>
        Update: Partial<Omit<Signup, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'marked_paid_at'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      photos: {
        Row: Photo
        Insert: Omit<Photo, 'id' | 'uploaded_at'>
        Update: Partial<Omit<Photo, 'id'>>
      }
      player_names: {
        Row: PlayerName
        Insert: PlayerName
        Update: Partial<PlayerName>
      }
    }
  }
}
