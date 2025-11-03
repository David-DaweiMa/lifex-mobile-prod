-- Service-only RPCs to write into non-public schemas from Edge Functions
-- Rationale: Hosted PostgREST exposes only 'public' and 'graphql_public' schemas to HTTP.
-- Edge Functions should call these SECURITY DEFINER functions instead of writing tables directly.

-- Ensure supporting constraints for ON CONFLICT
ALTER TABLE IF EXISTS catalog.google_place_cache
  ADD CONSTRAINT IF NOT EXISTS uq_google_place_cache_business UNIQUE (business_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_place_photos_meta_unique
  ON catalog.place_photos_meta(business_id, photo_reference);

-- Upsert Google Place cache by business_id
CREATE OR REPLACE FUNCTION public.admin_upsert_google_place_cache(
  p_business_id uuid,
  p_place_id text,
  p_name text,
  p_formatted_address text,
  p_international_phone_number text,
  p_website text,
  p_price_level smallint,
  p_rating numeric,
  p_user_ratings_total int,
  p_opening_hours jsonb,
  p_geometry jsonb,
  p_raw jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  INSERT INTO catalog.google_place_cache(
    business_id, place_id, name, formatted_address, international_phone_number,
    website, price_level, rating, user_ratings_total, opening_hours, geometry,
    raw, fetched_at
  ) VALUES (
    p_business_id, p_place_id, p_name, p_formatted_address, p_international_phone_number,
    p_website, p_price_level, p_rating, p_user_ratings_total, p_opening_hours, p_geometry,
    p_raw, now()
  )
  ON CONFLICT (business_id) DO UPDATE SET
    place_id = EXCLUDED.place_id,
    name = EXCLUDED.name,
    formatted_address = EXCLUDED.formatted_address,
    international_phone_number = EXCLUDED.international_phone_number,
    website = EXCLUDED.website,
    price_level = EXCLUDED.price_level,
    rating = EXCLUDED.rating,
    user_ratings_total = EXCLUDED.user_ratings_total,
    opening_hours = EXCLUDED.opening_hours,
    geometry = EXCLUDED.geometry,
    raw = EXCLUDED.raw,
    fetched_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_google_place_cache(uuid, text, text, text, text, text, smallint, numeric, int, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_google_place_cache(uuid, text, text, text, text, text, smallint, numeric, int, jsonb, jsonb, jsonb) TO service_role;

-- Batch-insert photos meta; ignores duplicates by (business_id, photo_reference)
CREATE OR REPLACE FUNCTION public.admin_insert_place_photos_meta_batch(
  p_business_id uuid,
  p_photos jsonb -- [{photo_reference, width, height, attributions}]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  INSERT INTO catalog.place_photos_meta(
    business_id, photo_reference, width, height, attributions
  )
  SELECT p_business_id,
         (elem->>'photo_reference')::text,
         NULLIF(elem->>'width','')::int,
         NULLIF(elem->>'height','')::int,
         NULLIF(elem->>'attributions','')::jsonb
  FROM jsonb_array_elements(p_photos) AS t(elem)
  ON CONFLICT (business_id, photo_reference) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_insert_place_photos_meta_batch(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_place_photos_meta_batch(uuid, jsonb) TO service_role;



