-- Add QR code to the current game
UPDATE weeks
SET payment_qr_code_url = 'https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/payment-proofs/IMG_5574.JPG'
WHERE week_start_date = '2026-01-05';
