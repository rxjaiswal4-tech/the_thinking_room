-- ==============================================================================
-- Migration: Add Language and Tags to Submissions Architecture
-- Description:
--   1. Adds 'language' column to 'submissions' table with default 'english'.
--   2. Creates 'tags' table with unique slug constraint for duplicate prevention.
--   3. Creates 'submission_tags' relational junction table.
--   4. Seeds initial preset tags (Love, Philosophy, Nature, etc.).
--   5. Configures Row Level Security (RLS) policies for secure contributor access.
-- ==============================================================================

-- 1. Add language column to submissions table (preserving existing records)
ALTER TABLE IF EXISTS public.submissions 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'english';

-- Optional: ensure valid language options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_submissions_language'
  ) THEN
    ALTER TABLE public.submissions 
    ADD CONSTRAINT check_submissions_language 
    CHECK (language IN ('english', 'hindi', 'nepali', 'urdu'));
  END IF;
END $$;

-- 2. Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_preset BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for normalized slug lookups
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- 3. Create submission_tags junction table
CREATE TABLE IF NOT EXISTS public.submission_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_submission_tag UNIQUE (submission_id, tag_id)
);

-- Indexes for efficient joins
CREATE INDEX IF NOT EXISTS idx_submission_tags_submission_id ON public.submission_tags(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_tags_tag_id ON public.submission_tags(tag_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_tags ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for tags
DROP POLICY IF EXISTS "Allow public read access to tags" ON public.tags;
CREATE POLICY "Allow public read access to tags"
  ON public.tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert to tags" ON public.tags;
CREATE POLICY "Allow public insert to tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (true);

-- 6. RLS Policies for submission_tags
DROP POLICY IF EXISTS "Allow public insert to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow public insert to submission_tags"
  ON public.submission_tags
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow read access to submission_tags"
  ON public.submission_tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage submission_tags" ON public.submission_tags;
CREATE POLICY "Allow authenticated manage submission_tags"
  ON public.submission_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Seed initial preset tags
INSERT INTO public.tags (name, slug, is_preset)
VALUES
  ('Love', 'love', true),
  ('Philosophy', 'philosophy', true),
  ('Nature', 'nature', true),
  ('Life', 'life', true),
  ('Memory', 'memory', true),
  ('Grief', 'grief', true),
  ('Identity', 'identity', true),
  ('Hope', 'hope', true),
  ('Friendship', 'friendship', true),
  ('Family', 'family', true),
  ('Freedom', 'freedom', true),
  ('Society', 'society', true),
  ('Spirituality', 'spirituality', true)
ON CONFLICT (slug) DO NOTHING;
