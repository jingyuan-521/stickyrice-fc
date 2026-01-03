-- Add replies to comments and create announcements feature

-- 1. Add parent_id column to comments for threading
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. Create index for better performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 3. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- 4. Enable RLS on announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can create announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can update announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can delete announcements" ON announcements;

-- 6. Allow anyone to read announcements
CREATE POLICY "Anyone can view announcements"
ON announcements FOR SELECT
USING (true);

-- 7. Allow anyone to create announcements (admin check done in app)
CREATE POLICY "Anyone can create announcements"
ON announcements FOR INSERT
WITH CHECK (true);

-- 8. Allow anyone to update announcements
CREATE POLICY "Anyone can update announcements"
ON announcements FOR UPDATE
USING (true);

-- 9. Allow anyone to delete announcements
CREATE POLICY "Anyone can delete announcements"
ON announcements FOR DELETE
USING (true);

-- 10. Create index for active announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);

-- Done! Reply threads and announcements are ready!
