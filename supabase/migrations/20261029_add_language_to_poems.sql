-- ==============================================================================
-- Migration: Add Language Column to Poems Table
-- Description:
--   Adds 'language' column to the public 'poems' table so that language
--   filtering works on the live published anthology feed.
--   Also back-fills language for existing poems based on common indicators.
-- ==============================================================================

-- 1. Add language column to poems table (default 'english' for existing content)
ALTER TABLE IF EXISTS public.poems
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'english';

-- 2. Ensure valid language values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_poems_language'
  ) THEN
    ALTER TABLE public.poems 
    ADD CONSTRAINT check_poems_language 
    CHECK (language IN ('english', 'hindi', 'nepali', 'urdu'));
  END IF;
END $$;

-- 3. Performance index for language filtering on the live feed
CREATE INDEX IF NOT EXISTS idx_poems_language ON public.poems(language);

-- 4. Back-fill language for known Nepali and Hindi works already in the poems table
-- Poems by Lekhnath Paudyal or Laxmi Prasad Devkota are Nepali
UPDATE public.poems
SET language = 'nepali'
WHERE language = 'english'
  AND (
    author ILIKE '%Lekhnath%'
    OR author ILIKE '%Devkota%'
    OR author ILIKE '%Paudyal%'
  );

-- Poems in Urdu / Hindi script by known authors (Javed Akhtar, Ahmad Faraz, Ghalib, Junaid Jamshed)
UPDATE public.poems
SET language = 'urdu'
WHERE language = 'english'
  AND (
    author ILIKE '%Javed Akhtar%'
    OR author ILIKE '%Ahmad Faraz%'
    OR author ILIKE '%Ghalib%'
    OR author ILIKE '%Junaid Jamshed%'
    OR author ILIKE '%Mehdi Hassan%'
  );

