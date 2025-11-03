-- Admin batch upsert for event scrape cache and job run logging integration

CREATE OR REPLACE FUNCTION public.admin_upsert_event_scrape_cache_batch(p_items jsonb)
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
    INSERT INTO catalog.event_scrape_cache(
      source,
      external_id,
      title,
      description,
      starts_at,
      ends_at,
      timezone,
      venue_name,
      city,
      url,
      raw,
      fetched_at,
      valid_until
    ) VALUES (
      NULLIF(itm->>'source',''),
      NULLIF(itm->>'external_id',''),
      NULLIF(itm->>'title',''),
      itm->>'description',
      NULLIF(itm->>'starts_at','')::timestamptz,
      NULLIF(itm->>'ends_at','')::timestamptz,
      NULLIF(itm->>'timezone',''),
      NULLIF(itm->>'venue_name',''),
      NULLIF(itm->>'city',''),
      NULLIF(itm->>'url',''),
      itm->'raw',
      now(),
      CASE WHEN itm ? 'valid_until' THEN NULLIF(itm->>'valid_until','')::timestamptz ELSE now() + interval '90 days' END
    )
    ON CONFLICT (source, external_id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      starts_at = EXCLUDED.starts_at,
      ends_at = EXCLUDED.ends_at,
      timezone = EXCLUDED.timezone,
      venue_name = EXCLUDED.venue_name,
      city = EXCLUDED.city,
      url = EXCLUDED.url,
      raw = EXCLUDED.raw,
      fetched_at = now(),
      valid_until = EXCLUDED.valid_until;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_upsert_event_scrape_cache_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_event_scrape_cache_batch(jsonb) TO service_role;
