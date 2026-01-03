-- Add auto-create settings table
-- This stores default game settings for automatic weekly game creation

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

-- Enable RLS
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can view game settings"
ON game_settings FOR SELECT
USING (true);

-- Allow anyone to update settings (for admin panel)
CREATE POLICY "Anyone can update game settings"
ON game_settings FOR UPDATE
USING (true);

-- Insert default settings (only if table is empty)
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
