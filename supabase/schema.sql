-- ==============================================================================
-- Stanza Architecture Schema Definition
-- Language, Tags, and Admin Submission Workflow Included
-- ==============================================================================

-- 1. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Reflections',
  language TEXT NOT NULL DEFAULT 'english',
  status TEXT NOT NULL DEFAULT 'submitted',
  instagram TEXT DEFAULT '',
  email TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure language check constraint
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

-- Ensure status check constraint
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

-- 2. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_preset BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- 3. Submission Tags Junction Table
CREATE TABLE IF NOT EXISTS public.submission_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_submission_tag UNIQUE (submission_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_tags_submission_id ON public.submission_tags(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_tags_tag_id ON public.submission_tags(tag_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_tags ENABLE ROW LEVEL SECURITY;

-- 5. Submissions RLS Policies
DROP POLICY IF EXISTS "Allow public read published submissions" ON public.submissions;
CREATE POLICY "Allow public read published submissions"
  ON public.submissions
  FOR SELECT
  USING (is_published = true AND status = 'published');

DROP POLICY IF EXISTS "Allow public insert submitted submissions" ON public.submissions;
CREATE POLICY "Allow public insert submitted submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (
    is_published = false AND 
    (status = 'submitted' OR status = 'draft')
  );

DROP POLICY IF EXISTS "Allow authenticated admin all submissions" ON public.submissions;
CREATE POLICY "Allow authenticated admin all submissions"
  ON public.submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Tags RLS Policies
DROP POLICY IF EXISTS "Allow public read access to tags" ON public.tags;
CREATE POLICY "Allow public read access to tags"
  ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to tags" ON public.tags;
CREATE POLICY "Allow public insert to tags"
  ON public.tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated manage tags" ON public.tags;
CREATE POLICY "Allow authenticated manage tags"
  ON public.tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Submission Tags RLS Policies
DROP POLICY IF EXISTS "Allow public insert to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow public insert to submission_tags"
  ON public.submission_tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow read access to submission_tags"
  ON public.submission_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage submission_tags" ON public.submission_tags;
CREATE POLICY "Allow authenticated manage submission_tags"
  ON public.submission_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Initial Preset Tags
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
