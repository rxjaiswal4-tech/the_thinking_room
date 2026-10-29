-- ==============================================================================
-- Migration: Add Performance Indexes for Language & Publication Filtering
-- Description:
--   Ensures fast lookups on 'submissions' by language and publication status.
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_submissions_language 
ON public.submissions(language);

CREATE INDEX IF NOT EXISTS idx_submissions_pub_status_lang 
ON public.submissions(is_published, status, language);

