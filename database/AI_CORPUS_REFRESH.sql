-- AI Corpus Refresh Placeholder
-- Purpose: Refresh ai.business_corpus and run lightweight validations.
-- Notes:
-- - Schedule during off-peak hours; use CONCURRENTLY to minimize locks.
-- - Does not change schema; safe to run multiple times.

-- Pre-checks (optional): ensure view exists
-- SELECT matviewname FROM pg_matviews WHERE schemaname='ai' AND matviewname='business_corpus';

BEGIN;
  REFRESH MATERIALIZED VIEW CONCURRENTLY ai.business_corpus;
  ANALYZE ai.business_corpus;
COMMIT;

-- Quick validations (run as needed):
-- 1) Row count snapshot
--    SELECT count(*) AS corpus_rows FROM ai.business_corpus;
-- 2) Longest texts sample (to spot data issues)
--    SELECT business_id, length(text) AS len
--    FROM ai.business_corpus
--    ORDER BY len DESC
--    LIMIT 10;
-- 3) Empty/short texts
--    SELECT count(*) AS empty_or_short
--    FROM ai.business_corpus
--    WHERE text IS NULL OR length(trim(text)) < 10;



