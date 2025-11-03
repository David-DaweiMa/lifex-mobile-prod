-- Update admin_upsert_google_place_cache to set valid_until
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
    raw, fetched_at, valid_until
  ) VALUES (
    p_business_id, p_place_id, p_name, p_formatted_address, p_international_phone_number,
    p_website, p_price_level, p_rating, p_user_ratings_total, p_opening_hours, p_geometry,
    p_raw, now(), now() + interval '30 days'
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
    fetched_at = now(),
    valid_until = now() + interval '30 days';
END;
$$;
REVOKE ALL ON FUNCTION public.admin_upsert_google_place_cache(uuid, text, text, text, text, text, smallint, numeric, int, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_google_place_cache(uuid, text, text, text, text, text, smallint, numeric, int, jsonb, jsonb, jsonb) TO service_role;
-- Cleanup RPC to remove expired cache and reviews
CREATE OR REPLACE FUNCTION public.admin_cleanup_places_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  -- Backfill valid_until for old rows
  UPDATE catalog.google_place_cache
  SET valid_until = COALESCE(valid_until, fetched_at + interval '30 days')
  WHERE valid_until IS NULL;

  -- Delete expired
  DELETE FROM catalog.google_place_reviews WHERE valid_until IS NOT NULL AND valid_until < now();
  DELETE FROM catalog.google_place_cache WHERE valid_until IS NOT NULL AND valid_until < now();
END;
$$;
REVOKE ALL ON FUNCTION public.admin_cleanup_places_cache() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cleanup_places_cache() TO service_role;
-- Rebuild business_profile view to expose safe capability attributes
DROP VIEW IF EXISTS public.business_profile;
CREATE OR REPLACE VIEW public.business_profile AS
WITH owner_approved AS (
  SELECT DISTINCT ON (u.business_id)
         u.business_id,
         (u.proposed ->> 'name') AS name,
         (u.proposed ->> 'description') AS description,
         (u.proposed ->> 'website') AS website,
         (u.proposed -> 'hours') AS hours,
         u.reviewed_at
  FROM catalog.business_owner_updates u
  WHERE u.status = 'approved'
  ORDER BY u.business_id, u.reviewed_at DESC NULLS LAST
),
curated AS (
  SELECT c.business_id, c.name, c.description, c.website, c.hours, c.updated_at
  FROM catalog.business_curated c
),
cap AS (
  SELECT
    ba.business_id,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'cap.dine_in') AS cap_dine_in,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'cap.delivery') AS cap_delivery,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'cap.takeout') AS cap_takeout,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'cap.curbside_pickup') AS cap_curbside,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'cap.reservable') AS cap_reservable,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.breakfast') AS serves_breakfast,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.lunch') AS serves_lunch,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.dinner') AS serves_dinner,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.beer') AS serves_beer,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.wine') AS serves_wine,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.cocktails') AS serves_cocktails,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'serves.vegetarian_food') AS serves_vegetarian,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'ambience.good_for_children') AS good_for_children,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'ambience.good_for_groups') AS good_for_groups,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'ambience.outdoor_seating') AS outdoor_seating,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'ambience.live_music') AS live_music,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'amenities.restroom') AS has_restroom,
    bool_or(ba.value = 'true') FILTER (WHERE ba.name = 'amenities.menu_for_children') AS has_kids_menu,
    (SELECT ba2.value_json FROM catalog.business_attributes ba2 WHERE ba2.business_id = ba.business_id AND ba2.name = 'accessibility.options' ORDER BY ba2.extracted_at DESC NULLS LAST LIMIT 1) AS accessibility_options,
    (SELECT ba3.value_json FROM catalog.business_attributes ba3 WHERE ba3.business_id = ba.business_id AND ba3.name = 'payment.options' ORDER BY ba3.extracted_at DESC NULLS LAST LIMIT 1) AS payment_options,
    (SELECT ba4.value_json FROM catalog.business_attributes ba4 WHERE ba4.business_id = ba.business_id AND ba4.name = 'parking.options' ORDER BY ba4.extracted_at DESC NULLS LAST LIMIT 1) AS parking_options
  FROM catalog.business_attributes ba
  WHERE ba.name IN (
    'cap.dine_in','cap.delivery','cap.takeout','cap.curbside_pickup','cap.reservable',
    'serves.breakfast','serves.lunch','serves.dinner','serves.beer','serves.wine','serves.cocktails','serves.vegetarian_food',
    'ambience.good_for_children','ambience.good_for_groups','ambience.outdoor_seating','ambience.live_music',
    'amenities.restroom','amenities.menu_for_children',
    'accessibility.options','payment.options','parking.options'
  )
  GROUP BY ba.business_id
)
SELECT b.id,
       COALESCE(o.name, c2.name, b.name, g.name) AS name,
       COALESCE(o.description, c2.description, b.description, g.formatted_address) AS description,
       COALESCE(o.website, c2.website, b.website, g.website) AS website,
       COALESCE(o.hours, c2.hours, g.opening_hours) AS hours,
       b.google_place_id,
       b.lifex_rating,
       b.lifex_review_count,
       b.favorite_count,
       l.address,
       l.city,
       l.country,
       l.latitude,
       l.longitude,
       cap.cap_dine_in,
       cap.cap_delivery,
       cap.cap_takeout,
       cap.cap_curbside,
       cap.cap_reservable,
       cap.serves_breakfast,
       cap.serves_lunch,
       cap.serves_dinner,
       cap.serves_beer,
       cap.serves_wine,
       cap.serves_cocktails,
       cap.serves_vegetarian,
       cap.good_for_children,
       cap.good_for_groups,
       cap.outdoor_seating,
       cap.live_music,
       cap.has_restroom,
       cap.has_kids_menu,
       cap.accessibility_options,
       cap.payment_options,
       cap.parking_options
FROM catalog.businesses b
LEFT JOIN owner_approved o ON o.business_id = b.id
LEFT JOIN curated c2 ON c2.business_id = b.id
LEFT JOIN catalog.google_place_cache g ON g.business_id = b.id
LEFT JOIN LATERAL (
  SELECT l1.*
  FROM catalog.business_locations l1
  WHERE l1.business_id = b.id AND l1.is_primary = true
  ORDER BY l1.created_at ASC
  LIMIT 1
) l ON true
LEFT JOIN cap ON cap.business_id = b.id
WHERE b.is_active = true;
GRANT SELECT ON public.business_profile TO anon, authenticated;
