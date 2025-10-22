-- Hybrid retrieval RPCs: keyword + filters + vector search

-- Helper: parse city/neighborhood text to filter (simplified; real impl may use a table)
CREATE OR REPLACE FUNCTION public.normalize_location_text(p_text text)
RETURNS text
LANGUAGE sql
AS $$
  SELECT lower(trim(p_text));
$$;

-- Vector search businesses by query embedding + optional city filter
CREATE OR REPLACE FUNCTION public.search_businesses_vector(
  p_query_embedding vector,
  p_city text DEFAULT NULL,
  p_limit int DEFAULT 10
) RETURNS TABLE (
  business_id uuid,
  name text,
  website text,
  city text,
  distance float
) LANGUAGE sql
STABLE
AS $$
  WITH cand AS (
    SELECT be.business_id,
           (be.embedding <=> p_query_embedding) AS dist
    FROM ai.business_embeddings be
    ORDER BY be.embedding <=> p_query_embedding
    LIMIT COALESCE(p_limit * 10, 100)
  )
  SELECT b.id, b.name, b.website, l.city, cand.dist
  FROM cand
  JOIN catalog.businesses b ON b.id = cand.business_id AND b.is_active
  LEFT JOIN LATERAL (
    SELECT l1.city FROM catalog.business_locations l1
    WHERE l1.business_id = b.id AND l1.is_primary = true
    LIMIT 1
  ) l ON true
  WHERE (p_city IS NULL OR lower(l.city) = normalize_location_text(p_city))
  ORDER BY cand.dist ASC
  LIMIT COALESCE(p_limit, 10);
$$;

GRANT EXECUTE ON FUNCTION public.search_businesses_vector(vector, text, int) TO authenticated;

-- Keyword + filters + simple scoring (distance not included here)
CREATE OR REPLACE FUNCTION public.search_businesses_keyword(
  p_query text,
  p_city text DEFAULT NULL,
  p_limit int DEFAULT 10
) RETURNS TABLE (
  business_id uuid,
  name text,
  website text,
  city text,
  score numeric
) LANGUAGE sql
STABLE
AS $$
  SELECT b.id, b.name, b.website, l.city,
         (CASE WHEN b.name ILIKE '%'||p_query||'%' THEN 1 ELSE 0 END
          + CASE WHEN b.description ILIKE '%'||p_query||'%' THEN 0.5 ELSE 0 END) AS score
  FROM catalog.businesses b
  LEFT JOIN LATERAL (
    SELECT l1.city FROM catalog.business_locations l1
    WHERE l1.business_id = b.id AND l1.is_primary = true
    LIMIT 1
  ) l ON true
  WHERE b.is_active = true
    AND (p_city IS NULL OR lower(l.city) = normalize_location_text(p_city))
  ORDER BY score DESC
  LIMIT COALESCE(p_limit, 10);
$$;

GRANT EXECUTE ON FUNCTION public.search_businesses_keyword(text, text, int) TO anon, authenticated;

-- Hybrid: union vector + keyword with weights, then enrich from public view
CREATE OR REPLACE FUNCTION public.search_businesses_hybrid(
  p_query text,
  p_query_embedding vector,
  p_city text DEFAULT NULL,
  p_limit int DEFAULT 10
) RETURNS TABLE (
  id uuid,
  name text,
  website text,
  city text,
  score float,
  avg_rating numeric,
  review_count int
) LANGUAGE sql
STABLE
AS $$
  WITH kw AS (
    SELECT business_id, name, website, city, score
    FROM public.search_businesses_keyword(p_query, p_city, p_limit)
  ), vx AS (
    SELECT business_id, name, website, city, (1.0 - distance) AS score
    FROM public.search_businesses_vector(p_query_embedding, p_city, p_limit)
  ), uni AS (
    SELECT business_id, name, website, city, MAX(score) AS score
    FROM (
      SELECT * FROM kw
      UNION ALL
      SELECT * FROM vx
    ) u
    GROUP BY business_id, name, website, city
  )
  SELECT b.id, b.name, b.website, l.city, u.score,
         v.avg_rating, v.review_count
  FROM uni u
  JOIN catalog.businesses b ON b.id = u.business_id
  LEFT JOIN LATERAL (
    SELECT l1.city FROM catalog.business_locations l1
    WHERE l1.business_id = b.id AND l1.is_primary = true
    LIMIT 1
  ) l ON true
  LEFT JOIN public.business_page v ON v.id = b.id
  ORDER BY u.score DESC
  LIMIT COALESCE(p_limit, 10);
$$;

GRANT EXECUTE ON FUNCTION public.search_businesses_hybrid(text, vector, text, int) TO anon, authenticated;


