-- Sticky Rice FC Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Player names table (for autocomplete)
CREATE TABLE player_names (
  name TEXT PRIMARY KEY,
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weeks table (each Monday's game)
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start_date DATE NOT NULL UNIQUE, -- Monday's date
  pitch_name TEXT NOT NULL DEFAULT 'NL Arena',
  pitch_address TEXT NOT NULL DEFAULT 'Chiang Mai, Thailand',
  pitch_maps_url TEXT,
  lock_time TIMESTAMPTZ NOT NULL, -- When sign-ups close
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signups table
CREATE TABLE signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  note TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(week_id, player_name, cancelled_at) -- Prevent duplicate active signups
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signup_id UUID NOT NULL UNIQUE REFERENCES signups(id) ON DELETE CASCADE,
  proof_image_url TEXT NOT NULL,
  marked_paid_at TIMESTAMPTZ DEFAULT NOW(),
  marked_paid_by TEXT NOT NULL
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_signups_week_id ON signups(week_id);
CREATE INDEX idx_signups_cancelled_at ON signups(cancelled_at);
CREATE INDEX idx_payments_signup_id ON payments(signup_id);
CREATE INDEX idx_photos_week_id ON photos(week_id);
CREATE INDEX idx_weeks_date ON weeks(week_start_date DESC);

-- Insert the current week as a starting point
INSERT INTO weeks (week_start_date, pitch_name, pitch_address, pitch_maps_url, lock_time, status)
VALUES (
  '2026-01-06', -- This Monday
  'NL Arena',
  '123 Somewhere St, Chiang Mai 50200, Thailand',
  'https://maps.google.com/?q=NL+Arena+Chiang+Mai',
  '2026-01-05 20:00:00+07', -- Sunday 8:00 PM ICT
  'open'
);

-- Row Level Security (RLS) Policies
-- Since we have no auth, we'll allow public read/write for MVP
-- You can add more restrictions later if needed

ALTER TABLE player_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow all operations for MVP (no auth)
CREATE POLICY "Allow all for player_names" ON player_names FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for weeks" ON weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for signups" ON signups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for photos" ON photos FOR ALL USING (true) WITH CHECK (true);
