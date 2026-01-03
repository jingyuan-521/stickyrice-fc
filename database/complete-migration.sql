-- ============================================
-- STICKY RICE FC - COMPLETE DATABASE MIGRATION
-- ============================================
-- This includes all updates for:
-- 1. Comment replies and announcements
-- 2. QR code storage bucket
-- 3. Payment amount field
-- ============================================

-- ============================================
-- 1. COMMENT REPLIES & ANNOUNCEMENTS
-- ============================================

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can update announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can delete announcements" ON announcements;

-- Create policies for announcements
CREATE POLICY "Anyone can view announcements"
ON announcements FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Anyone can insert announcements"
ON announcements FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update announcements"
ON announcements FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete announcements"
ON announcements FOR DELETE
USING (true);

-- Add parent_id column to comments for threading
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Create index for faster parent comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- 2. QR CODE STORAGE BUCKET
-- ============================================

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete QR codes" ON storage.objects;

-- Create storage policies for qr-codes bucket
CREATE POLICY "Anyone can view QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Anyone can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes');

CREATE POLICY "Anyone can update QR codes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'qr-codes');

CREATE POLICY "Anyone can delete QR codes"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-codes');

-- ============================================
-- 3. PAYMENT AMOUNT FIELD
-- ============================================

-- Add payment_amount column to game_settings table
ALTER TABLE game_settings
ADD COLUMN IF NOT EXISTS payment_amount INTEGER DEFAULT 100;

-- Update existing row to have a default payment amount
UPDATE game_settings
SET payment_amount = 100
WHERE payment_amount IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All features are now ready:
-- ✅ Comment replies with threading
-- ✅ Announcements system
-- ✅ QR code upload storage
-- ✅ Configurable payment amounts
-- ============================================
