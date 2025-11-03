-- Materialize locations and hours from google_place_cache.raw

-- Add from_cache flags to identify materialized rows managed by backfill
ALTER TABLE IF EXISTS catalog.business_locations
  ADD COLUMN IF NOT EXISTS from_cache boolean NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS catalog.business_hours
  ADD COLUMN IF NOT EXISTS from_cache boolean NOT NULL DEFAULT false;
-- Backfill primary location from cache.geometry / formatted_address
CREATE OR REPLACE FUNCTION public.admin_backfill_location_from_cache(p_business_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  v_address text;
  v_lat double precision;
  v_lon double precision;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  FOR r IN
    SELECT b.id AS business_id,
           g.formatted_address,
           (g.geometry->>'latitude')::double precision AS lat,
           (g.geometry->>'longitude')::double precision AS lon
    FROM catalog.businesses b
    JOIN catalog.google_place_cache g ON g.business_id = b.id
    WHERE (p_business_id IS NULL OR b.id = p_business_id)
      AND (g.is_expired = false)
    ORDER BY g.fetched_at DESC
  LOOP
    v_address := r.formatted_address;
    v_lat := r.lat; v_lon := r.lon;

    IF v_lat IS NULL OR v_lon IS NULL THEN
      CONTINUE;
    END IF;

    -- Insert or update primary location from cache
    IF NOT EXISTS (
      SELECT 1 FROM catalog.business_locations
      WHERE business_id = r.business_id AND is_primary = true
    ) THEN
      INSERT INTO catalog.business_locations(business_id, address, city, country, latitude, longitude, is_primary, from_cache)
      VALUES (r.business_id, v_address, NULL, 'New Zealand', v_lat, v_lon, true, true);
    ELSE
      -- Update only rows created from cache (do not override manual data)
      UPDATE catalog.business_locations
      SET address = COALESCE(v_address, address),
          latitude = v_lat,
          longitude = v_lon
      WHERE business_id = r.business_id AND is_primary = true AND from_cache = true;
    END IF;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_backfill_location_from_cache(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_backfill_location_from_cache(uuid) TO service_role;
-- Backfill weekly hours from raw.regularOpeningHours (fallback currentOpeningHours)
CREATE OR REPLACE FUNCTION public.admin_backfill_hours_from_cache(p_business_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  periods jsonb;
  pr jsonb;
  dow_open smallint;
  dow_close smallint;
  t_open time;
  t_close time;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  FOR r IN
    SELECT b.id AS business_id,
           (g.raw->'regularOpeningHours'->'periods') AS reg_periods,
           (g.opening_hours->'periods') AS cur_periods
    FROM catalog.businesses b
    JOIN catalog.google_place_cache g ON g.business_id = b.id
    WHERE (p_business_id IS NULL OR b.id = p_business_id)
      AND (g.is_expired = false)
  LOOP
    periods := COALESCE(r.reg_periods, r.cur_periods);
    IF periods IS NULL THEN CONTINUE; END IF;

    -- For each period, upsert a simple open/close by openDay
    FOR pr IN SELECT * FROM jsonb_array_elements(periods)
    LOOP
      -- Map Google DayOfWeek to 0..6 (SUNDAY=0)
      dow_open := CASE pr->>'openDay'
        WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
        ELSE NULL END;
      dow_close := CASE pr->>'closeDay'
        WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
        ELSE dow_open END;

      t_open := NULLIF(pr->>'openTime','')::time;
      t_close := NULLIF(pr->>'closeTime','')::time;

      IF dow_open IS NULL THEN CONTINUE; END IF;

      INSERT INTO catalog.business_hours(business_id, day_of_week, open_time, close_time, from_cache)
      VALUES (r.business_id, dow_open, t_open, t_close, true)
      ON CONFLICT (business_id, day_of_week) DO UPDATE SET
        open_time = COALESCE(EXCLUDED.open_time, catalog.business_hours.open_time),
        close_time = COALESCE(EXCLUDED.close_time, catalog.business_hours.close_time),
        from_cache = true;
    END LOOP;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_backfill_hours_from_cache(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_backfill_hours_from_cache(uuid) TO service_role;
-- Convenience: backfill both
CREATE OR REPLACE FUNCTION public.admin_backfill_all_materialized()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.admin_backfill_location_from_cache(NULL);
  PERFORM public.admin_backfill_hours_from_cache(NULL);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_backfill_all_materialized() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_backfill_all_materialized() TO service_role;
-- Demote: delete materialized rows for a set of businesses (only rows created from cache)
CREATE OR REPLACE FUNCTION public.admin_demote_businesses(p_business_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  DELETE FROM catalog.business_hours WHERE from_cache = true AND business_id = ANY(p_business_ids);
  DELETE FROM catalog.business_locations WHERE from_cache = true AND business_id = ANY(p_business_ids);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_demote_businesses(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_demote_businesses(uuid[]) TO service_role;
