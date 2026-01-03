-- Add waitlist feature, payment QR code, and comments to Sticky Rice FC
-- Run this in your Supabase SQL Editor

-- 1. Add max_players column to weeks table (default 26)
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 26;

-- 2. Add payment_qr_code_url column to weeks table
ALTER TABLE weeks
ADD COLUMN IF NOT EXISTS payment_qr_code_url TEXT;

-- 3. Add is_waitlist column to signups table
ALTER TABLE signups
ADD COLUMN IF NOT EXISTS is_waitlist BOOLEAN DEFAULT false;

-- 4. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 6. Create policy to allow anyone to read comments
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

-- 7. Create policy to allow anyone to add comments
CREATE POLICY "Anyone can add comments"
ON comments FOR INSERT
WITH CHECK (true);

-- 8. Create policy to allow anyone to delete comments
CREATE POLICY "Anyone can delete comments"
ON comments FOR DELETE
USING (true);

-- 9. Create index on comments for better performance
CREATE INDEX IF NOT EXISTS idx_comments_week_id ON comments(week_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 10. Update existing week to have max_players set
UPDATE weeks
SET max_players = 26
WHERE week_start_date = '2026-01-05';
