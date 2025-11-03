-- AI Embedding Index Maintenance Placeholder
-- Purpose: Ensure pgvector extension and create/maintain vector indexes.
-- Notes:
-- - Tune `lists` per data size (e.g., 100 ~ 1000). Higher = better recall, higher build cost.
-- - Use CONCURRENTLY to reduce write blocking during creation.

CREATE EXTENSION IF NOT EXISTS vector;

-- Business embeddings index (cosine distance)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='ai' AND indexname='idx_ai_business_embeddings_cos'
  ) THEN
    CREATE INDEX CONCURRENTLY idx_ai_business_embeddings_cos
      ON ai.business_embeddings USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END $$;

-- Review embeddings index (if table is used)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='ai' AND table_name='review_embeddings'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='ai' AND indexname='idx_ai_review_embeddings_cos'
  ) THEN
    CREATE INDEX CONCURRENTLY idx_ai_review_embeddings_cos
      ON ai.review_embeddings USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END $$;

-- Analyze tables to update planner stats
ANALYZE ai.business_embeddings;
-- ANALYZE ai.review_embeddings; -- uncomment if used

-- Optional re-tuning (manual):
-- To change `lists`, drop and recreate the index during a maintenance window:
--   DROP INDEX CONCURRENTLY IF EXISTS idx_ai_business_embeddings_cos;
--   CREATE INDEX CONCURRENTLY idx_ai_business_embeddings_cos
--     ON ai.business_embeddings USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 200);



