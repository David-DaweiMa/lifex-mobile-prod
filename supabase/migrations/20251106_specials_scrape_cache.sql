-- specials scrape cache and batch upsert
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE IF NOT EXISTS catalog.special_scrape_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_id text NOT NULL,
  title text,
  description text,
  price numeric,
  currency text,
  brand text,
  retailer_name text,
  store_name text,
  city text,
  url text,
  image_url text,
  valid_from timestamptz,
  valid_to timestamptz,
  raw jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  matched_special_id uuid REFERENCES catalog.specials(id) ON DELETE SET NULL,
  UNIQUE(source, external_id)
);

CREATE OR REPLACE FUNCTION public.admin_upsert_special_scrape_cache_batch(p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  itm jsonb;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'invalid payload: expected jsonb array';
  END IF;

  FOR itm IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO catalog.special_scrape_cache(
      source, external_id, title, description, price, currency, brand,
      retailer_name, store_name, city, url, image_url, valid_from, valid_to,
      raw, fetched_at, valid_until
    ) VALUES (
      NULLIF(itm->>'source',''), NULLIF(itm->>'external_id',''), NULLIF(itm->>'title',''), itm->>'description',
      NULLIF(itm->>'price','')::numeric, NULLIF(itm->>'currency',''), NULLIF(itm->>'brand',''),
      NULLIF(itm->>'retailer_name',''), NULLIF(itm->>'store_name',''), NULLIF(itm->>'city',''), NULLIF(itm->>'url',''), NULLIF(itm->>'image_url',''),
      NULLIF(itm->>'valid_from','')::timestamptz, NULLIF(itm->>'valid_to','')::timestamptz,
      itm->'raw', now(),
      CASE WHEN itm ? 'valid_until' THEN NULLIF(itm->>'valid_until','')::timestamptz ELSE now() + interval '45 days' END
    )
    ON CONFLICT (source, external_id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      currency = EXCLUDED.currency,
      brand = EXCLUDED.brand,
      retailer_name = EXCLUDED.retailer_name,
      store_name = EXCLUDED.store_name,
      city = EXCLUDED.city,
      url = EXCLUDED.url,
      image_url = EXCLUDED.image_url,
      valid_from = EXCLUDED.valid_from,
      valid_to = EXCLUDED.valid_to,
      raw = EXCLUDED.raw,
      fetched_at = now(),
      valid_until = EXCLUDED.valid_until;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_special_scrape_cache_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_special_scrape_cache_batch(jsonb) TO service_role;


