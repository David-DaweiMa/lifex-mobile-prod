-- AI schema draft for vector search and hybrid retrieval

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector

-- Schema
CREATE SCHEMA IF NOT EXISTS ai;

-- Business embeddings (one per business)
CREATE TABLE IF NOT EXISTS ai.business_embeddings (
    business_id uuid PRIMARY KEY REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL,
    model text NOT NULL DEFAULT 'text-embedding-3-large',
    source text NOT NULL DEFAULT 'generated',
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Review embeddings (optional, one per review)
CREATE TABLE IF NOT EXISTS ai.review_embeddings (
    review_id uuid PRIMARY KEY REFERENCES content.reviews(id) ON DELETE CASCADE,
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL,
    model text NOT NULL DEFAULT 'text-embedding-3-large',
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_review_embeddings_business ON ai.review_embeddings(business_id);

-- Indexes for vector search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_ai_business_embeddings_cos ON ai.business_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_ai_review_embeddings_cos ON ai.review_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Optional: denormalized corpus for embedding refresh
CREATE MATERIALIZED VIEW IF NOT EXISTS ai.business_corpus AS
SELECT b.id AS business_id,
       trim(
         concat_ws(' ',
           b.name,
           b.description,
           c.name,
           string_agg(DISTINCT bt.tag, ' ')
         )
       ) AS text
FROM catalog.businesses b
LEFT JOIN catalog.business_category_links bcl ON bcl.business_id = b.id
LEFT JOIN catalog.categories c ON c.id = bcl.category_id
LEFT JOIN catalog.business_tags bt ON bt.business_id = b.id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.description, c.name;

-- RLS (readable to authenticated; writes managed by backend jobs)
ALTER TABLE ai.business_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai.review_embeddings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='ai' AND tablename='business_embeddings' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON ai.business_embeddings FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='ai' AND tablename='review_embeddings' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON ai.review_embeddings FOR SELECT TO authenticated USING (true);
  END IF;
END $$;



