-- ==============================================================================
-- Migration: Add Tags Column to Poems Table & Seed Initial Category Tags
-- Description:
--   1. Adds 'tags' TEXT[] column to 'poems' table for live public feed & search.
--   2. Creates GIN index for fast tag filtering.
--   3. Back-fills initial tags for existing published poems based on category.
--   4. Configures RLS on 'submission_tags' so tags are publicly readable on feed.
-- ==============================================================================

-- 1. Add tags column to poems table (defaults to empty array)
ALTER TABLE IF EXISTS public.poems
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 2. GIN index for fast tag containment queries
CREATE INDEX IF NOT EXISTS idx_poems_tags ON public.poems USING GIN (tags);

-- 3. Ensure submission_tags RLS allows public select
ALTER TABLE IF EXISTS public.submission_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow read access to submission_tags"
  ON public.submission_tags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert to submission_tags" ON public.submission_tags;
CREATE POLICY "Allow public insert to submission_tags"
  ON public.submission_tags
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated manage submission_tags" ON public.submission_tags;
CREATE POLICY "Allow authenticated manage submission_tags"
  ON public.submission_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Backfill tags for existing poems based on category if empty
UPDATE public.poems
SET tags = ARRAY['Philosophy', 'Life', 'Wisdom']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Philosophy%';

UPDATE public.poems
SET tags = ARRAY['Free Verse', 'Poetry', 'Soul']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Free Verse%';

UPDATE public.poems
SET tags = ARRAY['Reflections', 'Memory', 'Mind']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Reflections%';

UPDATE public.poems
SET tags = ARRAY['Nature', 'Sea', 'Beauty']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Nature%';

UPDATE public.poems
SET tags = ARRAY['Sonnets', 'Love', 'Classical']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Sonnet%';

UPDATE public.poems
SET tags = ARRAY['Elegies', 'Grief', 'Memory']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Eleg%';

UPDATE public.poems
SET tags = ARRAY['Urban', 'Society', 'Modern']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Urban%';

UPDATE public.poems
SET tags = ARRAY['Nocturne', 'Night', 'Dreams']
WHERE (tags IS NULL OR cardinality(tags) = 0)
  AND category ILIKE '%Nocturne%';

-- Default fallback for any remaining poems
UPDATE public.poems
SET tags = ARRAY['Poetry', 'Anthology']
WHERE tags IS NULL OR cardinality(tags) = 0;

