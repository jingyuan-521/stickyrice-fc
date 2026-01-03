-- Add waitlist feature to Sticky Rice FC
-- Run this in your Supabase SQL Editor

-- 1. Add max_players column to weeks table (default 26)
ALTER TABLE weeks
ADD COLUMN max_players INTEGER DEFAULT 26;

-- 2. Add is_waitlist column to signups table
ALTER TABLE signups
ADD COLUMN is_waitlist BOOLEAN DEFAULT false;

-- 3. Update existing week to have max_players set
UPDATE weeks
SET max_players = 26
WHERE week_start_date = '2026-01-05';
