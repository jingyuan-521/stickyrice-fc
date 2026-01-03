-- COMPLETE SETUP FOR STICKY RICE FC
-- Run this ONCE in Supabase SQL Editor
-- This includes: waitlist, QR code, comments, and all new features

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

-- 6. Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Anyone can add comments" ON comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON comments;

-- 7. Create policy to allow anyone to read comments
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

-- 8. Create policy to allow anyone to insert comments
CREATE POLICY "Anyone can add comments"
ON comments FOR INSERT
WITH CHECK (true);

-- 9. Create policy to allow anyone to delete comments
CREATE POLICY "Anyone can delete comments"
ON comments FOR DELETE
USING (true);

-- 10. Create indexes on comments for better performance
CREATE INDEX IF NOT EXISTS idx_comments_week_id ON comments(week_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 11. Update existing week to have max_players set
UPDATE weeks
SET max_players = 26
WHERE week_start_date = '2026-01-05' AND max_players IS NULL;

-- 12. Add your QR code URL to the current game
UPDATE weeks
SET payment_qr_code_url = 'https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/payment-proofs/IMG_5574.JPG'
WHERE week_start_date = '2026-01-05';

-- 13. Create game_settings table for auto-create feature
CREATE TABLE IF NOT EXISTS game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_create_enabled BOOLEAN DEFAULT true,
  default_pitch_name TEXT DEFAULT 'NL Arena',
  default_pitch_address TEXT DEFAULT 'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
  default_pitch_maps_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.770784950108!2d98.9905848!3d18.7190775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31b87d135f17%3A0xa40182cabd0422a7!2sNL%20ARENA!5e0!3m2!1sen!2sth!4v1767344450707!5m2!1sen!2sth',
  default_max_players INTEGER DEFAULT 26,
  default_payment_qr_code_url TEXT DEFAULT 'https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/payment-proofs/IMG_5574.JPG',
  default_lock_time_hours_before INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Enable RLS on game_settings
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- 15. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view game settings" ON game_settings;
DROP POLICY IF EXISTS "Anyone can update game settings" ON game_settings;

-- 16. Allow anyone to read settings
CREATE POLICY "Anyone can view game settings"
ON game_settings FOR SELECT
USING (true);

-- 17. Allow anyone to update settings (for admin panel)
CREATE POLICY "Anyone can update game settings"
ON game_settings FOR UPDATE
USING (true);

-- 18. Insert default settings (only if table is empty)
INSERT INTO game_settings (
  auto_create_enabled,
  default_pitch_name,
  default_pitch_address,
  default_pitch_maps_url,
  default_max_players,
  default_payment_qr_code_url,
  default_lock_time_hours_before
)
SELECT
  true,
  'NL Arena',
  'Nong Hoi, Mueang Chiang Mai District, Chiang Mai 50000, Thailand',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.770784950108!2d98.9905848!3d18.7190775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da31b87d135f17%3A0xa40182cabd0422a7!2sNL%20ARENA!5e0!3m2!1sen!2sth!4v1767344450707!5m2!1sen!2sth',
  26,
  'https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/payment-proofs/IMG_5574.JPG',
  2
WHERE NOT EXISTS (SELECT 1 FROM game_settings);

-- Done! All features are now active including auto-create!
