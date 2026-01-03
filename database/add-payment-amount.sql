-- Add payment_amount column to game_settings table
ALTER TABLE game_settings
ADD COLUMN IF NOT EXISTS payment_amount INTEGER DEFAULT 100;

-- Update existing row to have a default payment amount
UPDATE game_settings
SET payment_amount = 100
WHERE payment_amount IS NULL;
