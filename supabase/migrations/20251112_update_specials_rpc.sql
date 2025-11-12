-- Update RPC to write into the existing public.special_scrape_cache table
-- This does NOT change table structure. It adapts inputs to current columns.
-- Safe to run multiple times.

CREATE OR REPLACE FUNCTION public.admin_upsert_special_scrape_cache_batch(p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  itm jsonb;
  v_source text;
  v_external_id text;
  v_title text;
  v_description text;
  v_discount_type text;
  v_discount_value text;
  v_original_price numeric;
  v_discounted_price numeric;
  v_currency text;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_tags text[];
  v_url text;
  v_raw jsonb;
  v_valid_until timestamptz;
  v_business_id uuid;
  v_external_business_name text;
  v_matched_special_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'invalid payload: expected jsonb array';
  END IF;

  FOR itm IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- mandatory keys
    v_source := NULLIF(itm->>'source','');
    v_external_id := NULLIF(itm->>'external_id','');
    IF v_source IS NULL OR v_external_id IS NULL THEN
      CONTINUE;
    END IF;

    -- basic fields
    v_title := NULLIF(itm->>'title','');
    v_description := NULLIF(itm->>'description','');
    v_currency := NULLIF(itm->>'currency','');
    v_url := NULLIF(itm->>'url','');
    v_raw := COALESCE(itm->'raw', itm);
    v_valid_until := COALESCE(NULLIF(itm->>'valid_until','')::timestamptz, now() + interval '45 days');

    -- discount/price mapping
    v_discount_type := NULLIF(itm->>'discount_type','');
    v_discount_value := NULLIF(itm->>'discount_value','');
    v_original_price := NULLIF(itm->>'original_price','')::numeric;
    v_discounted_price := NULLIF(itm->>'discounted_price','')::numeric;
    -- backward-compat: accept single 'price' as discounted_price when both are null
    IF v_original_price IS NULL AND v_discounted_price IS NULL THEN
      v_discounted_price := NULLIF(itm->>'price','')::numeric;
    END IF;

    -- time mapping
    v_starts_at := COALESCE(NULLIF(itm->>'starts_at','')::timestamptz,
                            NULLIF(itm->>'valid_from','')::timestamptz);
    v_ends_at   := COALESCE(NULLIF(itm->>'ends_at','')::timestamptz,
                            NULLIF(itm->>'valid_to','')::timestamptz);

    -- optional relations/metadata
    v_business_id := NULLIF(itm->>'business_id','')::uuid;
    v_external_business_name := NULLIF(itm->>'external_business_name','');
    IF v_external_business_name IS NULL THEN
      v_external_business_name := COALESCE(NULLIF(itm->>'retailer_name',''),
                                           NULLIF(itm->>'brand',''));
    END IF;
    v_matched_special_id := NULLIF(itm->>'matched_special_id','')::uuid;

    -- tags array (if provided)
    IF itm ? 'tags' THEN
      v_tags := ARRAY(
        SELECT NULLIF(trim(both from t), '')
        FROM jsonb_array_elements_text(itm->'tags') AS t
      );
      IF v_tags = ARRAY[NULL::text] THEN
        v_tags := NULL;
      END IF;
    ELSE
      v_tags := NULL;
    END IF;

    -- upsert without requiring a unique index by using update-then-insert
  UPDATE catalog.special_scrape_cache SET
      title = v_title,
      description = v_description,
      discount_type = v_discount_type,
      discount_value = v_discount_value,
      original_price = v_original_price,
      discounted_price = v_discounted_price,
      currency = v_currency,
      starts_at = v_starts_at,
      ends_at = v_ends_at,
      tags = v_tags,
      url = v_url,
      raw = v_raw,
      fetched_at = now(),
      valid_until = v_valid_until,
      business_id = v_business_id,
      external_business_name = v_external_business_name,
      matched_special_id = COALESCE(v_matched_special_id, matched_special_id)
    WHERE source = v_source AND external_id = v_external_id;

    IF NOT FOUND THEN
      INSERT INTO catalog.special_scrape_cache(
        source, external_id, business_id, external_business_name,
        title, description, discount_type, discount_value,
        original_price, discounted_price, currency,
        starts_at, ends_at, tags, url, raw,
        fetched_at, valid_until, matched_special_id
      ) VALUES (
        v_source, v_external_id, v_business_id, v_external_business_name,
        v_title, v_description, v_discount_type, v_discount_value,
        v_original_price, v_discounted_price, v_currency,
        v_starts_at, v_ends_at, v_tags, v_url, v_raw,
        now(), v_valid_until, v_matched_special_id
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_special_scrape_cache_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_special_scrape_cache_batch(jsonb) TO service_role;


