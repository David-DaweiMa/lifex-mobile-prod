-- Google Place Reviews storage (server-only) and admin RPC

-- Table: catalog.google_place_reviews
CREATE TABLE IF NOT EXISTS catalog.google_place_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  review_name text NOT NULL,                        -- unique identifier for the review (v1 provides 'reviews.name')
  rating numeric(3,2),
  text text,
  language_code text,
  author_attributions jsonb,
  publish_time timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  raw jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_google_place_reviews_place_rev
  ON catalog.google_place_reviews(place_id, review_name);
CREATE INDEX IF NOT EXISTS idx_google_place_reviews_business
  ON catalog.google_place_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_google_place_reviews_time
  ON catalog.google_place_reviews(publish_time DESC);
-- Enable RLS and keep server-only by default (no public policies)
ALTER TABLE catalog.google_place_reviews ENABLE ROW LEVEL SECURITY;
-- Admin RPC: batch upsert reviews
CREATE OR REPLACE FUNCTION public.admin_upsert_google_place_reviews_batch(
  p_business_id uuid,
  p_place_id text,
  p_reviews jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  INSERT INTO catalog.google_place_reviews(
    business_id, place_id, review_name, rating, text, language_code,
    author_attributions, publish_time, fetched_at, valid_until, raw
  )
  SELECT p_business_id,
         p_place_id,
         NULLIF(elem->>'name','')::text,
         NULLIF(elem->>'rating','')::numeric,
         NULLIF(elem->'text'->>'text','')::text,
         NULLIF(elem->'text'->>'languageCode','')::text,
         COALESCE(elem->'authorAttributions', 'null'::jsonb),
         NULLIF(elem->>'publishTime','')::timestamptz,
         now(),
         now() + interval '30 days',
         elem
  FROM jsonb_array_elements(p_reviews) AS t(elem)
  WHERE NULLIF(elem->>'name','') IS NOT NULL
  ON CONFLICT (place_id, review_name) DO UPDATE SET
    rating = EXCLUDED.rating,
    text = EXCLUDED.text,
    language_code = EXCLUDED.language_code,
    author_attributions = EXCLUDED.author_attributions,
    publish_time = EXCLUDED.publish_time,
    fetched_at = now(),
    valid_until = EXCLUDED.valid_until,
    raw = EXCLUDED.raw;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_upsert_google_place_reviews_batch(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_google_place_reviews_batch(uuid, text, jsonb) TO service_role;
