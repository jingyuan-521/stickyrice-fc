-- Update the default payment QR code URL to the new one
UPDATE game_settings
SET default_payment_qr_code_url = 'https://gllvzrjyuplairmubzbu.supabase.co/storage/v1/object/public/payment-proofs/Screenshot%202569-01-03%20at%2011.04.18.png'
WHERE id IS NOT NULL;
