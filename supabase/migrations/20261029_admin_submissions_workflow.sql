-- ==============================================================================
-- Migration: Add Admin Submissions Workflow & Status Support
-- Description:
--   1. Adds 'status' column to 'submissions' table ('draft', 'submitted', 
--      'under_review', 'approved', 'rejected', 'published').
--   2. Enforces valid status check constraints and synchronizes existing records.
--   3. Configures Row Level Security (RLS) on 'submissions' so only published
--      submissions are publicly readable, while authenticated Admins have full access.
-- ==============================================================================

-- 1. Add status column to submissions table
ALTER TABLE IF EXISTS public.submissions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';

-- 2. Ensure status check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_submissions_status'
  ) THEN
    ALTER TABLE public.submissions 
    ADD CONSTRAINT check_submissions_status 
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'published'));
  END IF;
END $$;

-- 3. Synchronize existing records
UPDATE public.submissions
SET status = CASE
  WHEN is_published = true THEN 'published'
  ELSE 'submitted'
END
WHERE status IS NULL OR status = '';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Public read published submissions only
DROP POLICY IF EXISTS "Allow public read published submissions" ON public.submissions;
CREATE POLICY "Allow public read published submissions"
  ON public.submissions
  FOR SELECT
  USING (is_published = true AND status = 'published');

-- 6. RLS Policy: Public insert submitted submissions (contributors)
DROP POLICY IF EXISTS "Allow public insert submitted submissions" ON public.submissions;
CREATE POLICY "Allow public insert submitted submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (
    is_published = false AND 
    (status = 'submitted' OR status = 'draft')
  );

-- 7. RLS Policy: Authenticated Admin full access to submissions
DROP POLICY IF EXISTS "Allow authenticated admin all submissions" ON public.submissions;
CREATE POLICY "Allow authenticated admin all submissions"
  ON public.submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

