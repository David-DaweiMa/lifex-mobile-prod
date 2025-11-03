-- Fix hours backfill to support Places v1 openingHours schema (open/close with hour/minute)

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
  open_node jsonb;
  close_node jsonb;
  oh int;
  om int;
  ch int;
  cm int;
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
    IF periods IS NULL OR jsonb_typeof(periods) <> 'array' THEN CONTINUE; END IF;

    FOR pr IN SELECT * FROM jsonb_array_elements(periods)
    LOOP
      open_node := pr->'open';
      close_node := pr->'close';

      IF open_node IS NOT NULL THEN
        -- New schema with open/close objects and hour/minute
        dow_open := CASE open_node->>'day'
          WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
          ELSE NULL END;
        dow_close := CASE close_node->>'day'
          WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
          ELSE dow_open END;

        oh := NULLIF(open_node->>'hour','')::int;
        om := NULLIF(open_node->>'minute','')::int;
        ch := NULLIF(close_node->>'hour','')::int;
        cm := NULLIF(close_node->>'minute','')::int;

        IF dow_open IS NULL THEN CONTINUE; END IF;
        IF oh IS NOT NULL AND om IS NOT NULL THEN
          t_open := make_time(oh, om, 0);
        ELSE
          t_open := NULL;
        END IF;
        IF ch IS NOT NULL AND cm IS NOT NULL THEN
          t_close := make_time(ch, cm, 0);
        ELSE
          t_close := NULL;
        END IF;
      ELSE
        -- Legacy schema with openDay/openTime strings (fallback)
        dow_open := CASE pr->>'openDay'
          WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
          ELSE NULL END;
        dow_close := CASE pr->>'closeDay'
          WHEN 'SUNDAY' THEN 0 WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6
          ELSE dow_open END;

        IF (pr ? 'openTime') THEN
          t_open := NULLIF(pr->>'openTime','')::time;
        ELSE
          t_open := NULL;
        END IF;
        IF (pr ? 'closeTime') THEN
          t_close := NULLIF(pr->>'closeTime','')::time;
        ELSE
          t_close := NULL;
        END IF;
      END IF;

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
