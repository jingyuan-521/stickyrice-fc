-- Fix photo upload RLS policy
-- Run this in Supabase SQL Editor

-- 1. Drop existing restrictive policies on photos bucket
DROP POLICY IF EXISTS "Allow public uploads to photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- 2. Create permissive policy for photos bucket - allow anyone to upload
CREATE POLICY "Public can upload to photos bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'photos');

-- 3. Allow anyone to read from photos bucket
CREATE POLICY "Public can view photos bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photos');

-- 4. Allow anyone to delete from photos bucket
CREATE POLICY "Public can delete from photos bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'photos');

-- 5. Same for payment-proofs bucket
DROP POLICY IF EXISTS "Public can upload to payment-proofs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payment-proofs bucket" ON storage.objects;

CREATE POLICY "Public can upload to payment-proofs bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Public can view payment-proofs bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Public can delete from payment-proofs bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'payment-proofs');
