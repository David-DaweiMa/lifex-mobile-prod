-- Initial DDL draft for core/catalog/content/social with RLS, views, and RPCs
-- Safe to refine before execution in production. Run in Supabase with care.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS postgis;  -- geospatial (Point, GIST)

-- =====================
-- core schema (PII)
-- =====================

CREATE TABLE IF NOT EXISTS core.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE core.user_profiles ENABLE ROW LEVEL SECURITY;

-- Only the user can read/update own profile
DROP POLICY IF EXISTS user_profiles_self_select ON core.user_profiles;
CREATE POLICY user_profiles_self_select ON core.user_profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS user_profiles_self_update ON core.user_profiles;
CREATE POLICY user_profiles_self_update ON core.user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Inserts/Deletes: by backend/service only (no policy for clients)

-- =====================
-- catalog schema (business directory)
-- =====================

CREATE TABLE IF NOT EXISTS catalog.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.businesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    website text,
    google_place_id text,
    lifex_rating numeric(3,2),
    lifex_review_count integer NOT NULL DEFAULT 0,
    view_count integer NOT NULL DEFAULT 0,
    favorite_count integer NOT NULL DEFAULT 0,
    owner_id uuid REFERENCES core.user_profiles(id),
    is_verified boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    data_source text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique per external place id when present
CREATE UNIQUE INDEX IF NOT EXISTS uq_businesses_place_id
ON catalog.businesses(google_place_id) WHERE google_place_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS catalog.business_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    address text,
    city text,
    country text DEFAULT 'New Zealand',
    latitude double precision,
    longitude double precision,
    is_primary boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Geospatial point from lat/lon for fast nearby queries
ALTER TABLE catalog.business_locations
  ADD COLUMN IF NOT EXISTS geom geography(Point,4326)
  GENERATED ALWAYS AS (
    CASE
      WHEN latitude IS NULL OR longitude IS NULL THEN NULL
      ELSE ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS gist_business_locations_geom
  ON catalog.business_locations USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_business_locations_business ON catalog.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_city ON catalog.business_locations(city);

CREATE TABLE IF NOT EXISTS catalog.business_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time time,
    close_time time
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_business_hours_business_dow ON catalog.business_hours(business_id, day_of_week);

CREATE TABLE IF NOT EXISTS catalog.business_category_links (
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES catalog.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (business_id, category_id)
);

-- External IDs and merge map for deduplication
CREATE TABLE IF NOT EXISTS catalog.business_aliases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    source text NOT NULL,          -- e.g., 'google','facebook','instagram','firsttable'
    external_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS catalog.business_merge_map (
    kept_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    removed_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    merged_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (kept_id, removed_id)
);

CREATE TABLE IF NOT EXISTS catalog.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz,
    venue_business_id uuid REFERENCES catalog.businesses(id),
    city text,
    url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.specials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    starts_at timestamptz,
    ends_at timestamptz,
    tags text[] DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and allow broad read for authenticated; writes via backend only
ALTER TABLE catalog.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_category_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_merge_map ENABLE ROW LEVEL SECURITY;

-- Read policies (authenticated can read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='businesses' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.businesses FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_locations' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_locations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_hours' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_hours FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='categories' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.categories FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_category_links' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_category_links FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='events' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.events FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='specials' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.specials FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_aliases' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_aliases FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_merge_map' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_merge_map FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- No write policies for clients; backend uses service_role which bypasses RLS in Supabase.

-- =====================
-- content schema (UGC)
-- =====================

CREATE TABLE IF NOT EXISTS content.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (business_id, user_id)
);

ALTER TABLE content.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
DROP POLICY IF EXISTS reviews_read_all ON content.reviews;
CREATE POLICY reviews_read_all ON content.reviews FOR SELECT USING (true);

-- Only author can write
DROP POLICY IF EXISTS reviews_self_write ON content.reviews;
CREATE POLICY reviews_self_write ON content.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reviews_self_update ON content.reviews;
CREATE POLICY reviews_self_update ON content.reviews
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reviews_self_delete ON content.reviews;
CREATE POLICY reviews_self_delete ON content.reviews
  FOR DELETE USING (user_id = auth.uid());

-- =====================
-- social schema (engagement)
-- =====================

CREATE TABLE IF NOT EXISTS social.favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, business_id)
);

ALTER TABLE social.favorites ENABLE ROW LEVEL SECURITY;

-- User can see own favorites
DROP POLICY IF EXISTS favorites_self_select ON social.favorites;
CREATE POLICY favorites_self_select ON social.favorites
  FOR SELECT USING (user_id = auth.uid());

-- User can add/remove own favorites
DROP POLICY IF EXISTS favorites_self_insert ON social.favorites;
CREATE POLICY favorites_self_insert ON social.favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS favorites_self_delete ON social.favorites;
CREATE POLICY favorites_self_delete ON social.favorites
  FOR DELETE USING (user_id = auth.uid());

-- =====================
-- Public read-model views
-- =====================

CREATE OR REPLACE VIEW public.business_list AS
SELECT b.id,
       b.name,
       b.website,
       COALESCE(b.lifex_rating, 0) AS lifex_rating,
       b.lifex_review_count,
       b.favorite_count,
       l.city,
       l.country
FROM catalog.businesses b
LEFT JOIN LATERAL (
  SELECT l1.city, l1.country
  FROM catalog.business_locations l1
  WHERE l1.business_id = b.id AND l1.is_primary = true
  ORDER BY l1.created_at ASC
  LIMIT 1
) l ON true
WHERE b.is_active = true;

CREATE OR REPLACE VIEW public.business_page AS
SELECT b.*,
       l.address,
       l.city,
       l.country,
       l.latitude,
       l.longitude,
       COALESCE(avg_r.avg_rating, b.lifex_rating) AS avg_rating,
       COALESCE(cnt_r.review_count, b.lifex_review_count) AS review_count
FROM catalog.businesses b
LEFT JOIN LATERAL (
  SELECT l1.*
  FROM catalog.business_locations l1
  WHERE l1.business_id = b.id AND l1.is_primary = true
  ORDER BY l1.created_at ASC
  LIMIT 1
) l ON true
LEFT JOIN (
  SELECT business_id, AVG(rating)::numeric(3,2) AS avg_rating
  FROM content.reviews
  GROUP BY business_id
) avg_r ON avg_r.business_id = b.id
LEFT JOIN (
  SELECT business_id, COUNT(*) AS review_count
  FROM content.reviews
  GROUP BY business_id
) cnt_r ON cnt_r.business_id = b.id
WHERE b.is_active = true;

CREATE OR REPLACE VIEW public.events_page AS
SELECT e.*, b.name AS business_name, l.city, l.country
FROM catalog.events e
LEFT JOIN catalog.businesses b ON b.id = e.venue_business_id
LEFT JOIN LATERAL (
  SELECT l1.city, l1.country
  FROM catalog.business_locations l1
  WHERE l1.business_id = e.venue_business_id AND l1.is_primary = true
  ORDER BY l1.created_at ASC
  LIMIT 1
) l ON true
WHERE e.is_active = true;

-- Grants for views (read-only to clients)
GRANT SELECT ON public.business_list TO anon, authenticated;
GRANT SELECT ON public.business_page TO anon, authenticated;
GRANT SELECT ON public.events_page TO anon, authenticated;

-- =====================
-- RPCs (user actions + service ingest)
-- =====================

-- Add favorite for current user
CREATE OR REPLACE FUNCTION public.add_favorite(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO social.favorites (user_id, business_id)
  VALUES (auth.uid(), p_business_id)
  ON CONFLICT (user_id, business_id) DO NOTHING;
END;
$$;

-- Remove favorite for current user
CREATE OR REPLACE FUNCTION public.remove_favorite(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM social.favorites
  WHERE user_id = auth.uid() AND business_id = p_business_id;
END;
$$;

-- Add or update user's review
CREATE OR REPLACE FUNCTION public.add_review(p_business_id uuid, p_rating int, p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO content.reviews (business_id, user_id, rating, content)
  VALUES (p_business_id, auth.uid(), p_rating, p_content)
  ON CONFLICT (business_id, user_id)
  DO UPDATE SET rating = EXCLUDED.rating, content = EXCLUDED.content, updated_at = now();
END;
$$;

-- Ingest-only: upsert business (guarded for service_role)
CREATE OR REPLACE FUNCTION public.upsert_business_from_ingest(
  p_name text,
  p_website text,
  p_google_place_id text,
  p_description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  INSERT INTO catalog.businesses (name, website, google_place_id, description, is_active)
  VALUES (p_name, p_website, p_google_place_id, p_description, true)
  ON CONFLICT (google_place_id) DO UPDATE SET
    name = EXCLUDED.name,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Grants for RPCs
GRANT EXECUTE ON FUNCTION public.add_favorite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_favorite(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_review(uuid, int, text) TO authenticated;
REVOKE ALL ON FUNCTION public.upsert_business_from_ingest(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_business_from_ingest(text, text, text, text) TO service_role;



-- =====================
-- Multi-source enrichment for businesses
-- (Appended section)
-- =====================

-- Google Places cache (respect 30-day policy; photos store only references)
CREATE TABLE IF NOT EXISTS catalog.google_place_cache (
    business_id uuid PRIMARY KEY REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    place_id text NOT NULL,
    name text,
    formatted_address text,
    international_phone_number text,
    website text,
    price_level smallint,
    rating numeric(3,2),
    user_ratings_total integer,
    opening_hours jsonb,
    geometry jsonb,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    raw jsonb
);

CREATE TABLE IF NOT EXISTS catalog.place_photos_meta (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    photo_reference text NOT NULL,
    width integer,
    height integer,
    attributions jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_place_photos_business ON catalog.place_photos_meta(business_id);

-- Curated overrides (by staff). One row per business; structured fields or JSON profile.
CREATE TABLE IF NOT EXISTS catalog.business_curated (
    business_id uuid PRIMARY KEY REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    name text,
    description text,
    website text,
    hours jsonb,
    attributes jsonb,
    updated_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Owner submissions (proposals) with moderation workflow
CREATE TABLE IF NOT EXISTS catalog.business_owner_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    proposed jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by uuid,
    reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_owner_updates_business ON catalog.business_owner_updates(business_id);
CREATE INDEX IF NOT EXISTS idx_owner_updates_owner ON catalog.business_owner_updates(owner_id);

-- Tags and profiling (AI/curator/owner) with confidence
CREATE TABLE IF NOT EXISTS catalog.business_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    tag text NOT NULL,
    source text NOT NULL CHECK (source IN ('ai','curator','owner')),
    confidence numeric(4,3),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_tags_business ON catalog.business_tags(business_id);
CREATE INDEX IF NOT EXISTS idx_business_tags_tag ON catalog.business_tags(tag);

-- Normalized tags (new)
CREATE TABLE IF NOT EXISTS catalog.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    kind text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.tag_aliases (
    tag_id uuid NOT NULL REFERENCES catalog.tags(id) ON DELETE CASCADE,
    alias text NOT NULL,
    UNIQUE(tag_id, alias)
);

CREATE TABLE IF NOT EXISTS catalog.business_tag_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES catalog.tags(id) ON DELETE CASCADE,
    source text NOT NULL CHECK (source IN ('ai','curator','owner')),
    confidence numeric(4,3),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (business_id, tag_id, source)
);

-- RLS enablement additions for tag tables
ALTER TABLE catalog.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.tag_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.business_tag_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='google_place_cache' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.google_place_cache FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='place_photos_meta' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.place_photos_meta FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_curated' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_curated FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_tags' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_tags FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='tags' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.tags FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='tag_aliases' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.tag_aliases FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_tag_links' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_tag_links FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Owner updates: owner can see own proposals; can insert proposals
DROP POLICY IF EXISTS owner_updates_self_select ON catalog.business_owner_updates;
CREATE POLICY owner_updates_self_select ON catalog.business_owner_updates
  FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS owner_updates_self_insert ON catalog.business_owner_updates;
CREATE POLICY owner_updates_self_insert ON catalog.business_owner_updates
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- =====================
-- Multi-source enrichment (extended)
-- - Attributes K/V for AI-friendly profiling and filters
-- - Scrape caches for events/specials with provenance
-- - Curated events overrides
-- =====================

-- Business attributes (structured facts with provenance)
CREATE TABLE IF NOT EXISTS catalog.business_attributes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    name text NOT NULL,                 -- e.g., 'price_level','cuisines','amenities.parking'
    value text,                         -- scalar value when applicable
    value_json jsonb,                   -- structured value (arrays/objects)
    source text NOT NULL CHECK (source IN ('google','scrape','owner','curator','ai')),
    confidence numeric(4,3),
    extracted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(business_id, name, source)
);
CREATE INDEX IF NOT EXISTS idx_business_attributes_business ON catalog.business_attributes(business_id);
CREATE INDEX IF NOT EXISTS idx_business_attributes_name ON catalog.business_attributes(name);

ALTER TABLE catalog.business_attributes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_attributes' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_attributes FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Event curated overrides (by staff)
CREATE TABLE IF NOT EXISTS catalog.event_curated (
    event_id uuid PRIMARY KEY REFERENCES catalog.events(id) ON DELETE CASCADE,
    title text,
    description text,
    starts_at timestamptz,
    ends_at timestamptz,
    timezone text,
    location text,
    city text,
    url text,
    attributes jsonb,
    updated_by uuid,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catalog.event_curated ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='event_curated' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.event_curated FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Event scrape cache (raw normalized from web sources)
CREATE TABLE IF NOT EXISTS catalog.event_scrape_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,               -- e.g., 'eventfinda','council_site'
    external_id text NOT NULL,
    title text,
    description text,
    starts_at timestamptz,
    ends_at timestamptz,
    timezone text,
    venue_name text,
    city text,
    url text,
    raw jsonb,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    matched_event_id uuid REFERENCES catalog.events(id) ON DELETE SET NULL,
    UNIQUE(source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_event_scrape_cache_source ON catalog.event_scrape_cache(source);
CREATE INDEX IF NOT EXISTS idx_event_scrape_cache_time ON catalog.event_scrape_cache(starts_at DESC);

ALTER TABLE catalog.event_scrape_cache ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='event_scrape_cache' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.event_scrape_cache FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Special scrape cache (raw normalized from web sources)
CREATE TABLE IF NOT EXISTS catalog.special_scrape_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,               -- e.g., 'supermarket_site','firsttable','restaurant_site'
    external_id text NOT NULL,
    business_id uuid REFERENCES catalog.businesses(id) ON DELETE SET NULL,
    external_business_name text,
    title text,
    description text,
    discount_type text CHECK (discount_type IN ('percentage','fixed_amount','bogo','other')),
    discount_value text,
    original_price numeric(10,2),
    discounted_price numeric(10,2),
    currency text,
    starts_at timestamptz,
    ends_at timestamptz,
    tags text[] DEFAULT '{}',
    url text,
    raw jsonb,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    matched_special_id uuid REFERENCES catalog.specials(id) ON DELETE SET NULL,
    UNIQUE(source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_special_scrape_cache_source ON catalog.special_scrape_cache(source);
CREATE INDEX IF NOT EXISTS idx_special_scrape_cache_time ON catalog.special_scrape_cache(ends_at DESC);

ALTER TABLE catalog.special_scrape_cache ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='special_scrape_cache' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.special_scrape_cache FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Service-only RPCs to promote scraped items to canonical tables
CREATE OR REPLACE FUNCTION public.promote_scraped_event(p_scrape_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
  v jsonb;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'title', title,
    'description', description,
    'starts_at', starts_at,
    'ends_at', ends_at,
    'timezone', timezone,
    'city', city,
    'url', url
  )) INTO v
  FROM catalog.event_scrape_cache WHERE id = p_scrape_id FOR UPDATE;

  INSERT INTO catalog.events(title, description, starts_at, ends_at, city, url, is_active)
  VALUES (
    v->>'title',
    v->>'description',
    NULLIF(v->>'starts_at','')::timestamptz,
    NULLIF(v->>'ends_at','')::timestamptz,
    v->>'city',
    v->>'url',
    true
  ) RETURNING id INTO v_id;

  UPDATE catalog.event_scrape_cache SET matched_event_id = v_id WHERE id = p_scrape_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_scraped_special(p_scrape_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
  s RECORD;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  SELECT * INTO s FROM catalog.special_scrape_cache WHERE id = p_scrape_id FOR UPDATE;

  INSERT INTO catalog.specials(
    business_id, title, description, starts_at, ends_at, tags
  ) VALUES (
    s.business_id,
    NULLIF(s.title,''),
    s.description,
    s.starts_at,
    s.ends_at,
    COALESCE(s.tags, '{}')
  ) RETURNING id INTO v_id;

  UPDATE catalog.special_scrape_cache SET matched_special_id = v_id WHERE id = p_scrape_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_scraped_event(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.promote_scraped_special(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_scraped_event(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_scraped_special(uuid) TO service_role;

-- =====================
-- Generic services and prices (restaurants, salons, etc.)
-- =====================

CREATE TABLE IF NOT EXISTS catalog.business_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,                  -- e.g., 'menu', 'haircut', 'massage'
    description text,
    attributes jsonb,               -- size/portion/variant options
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_services_business ON catalog.business_services(business_id);

CREATE TABLE IF NOT EXISTS catalog.service_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid NOT NULL REFERENCES catalog.business_services(id) ON DELETE CASCADE,
    price_cents integer NOT NULL,
    currency text DEFAULT 'NZD',
    source text,                    -- 'google','scrape','owner','curator'
    variant_key text,               -- e.g., 'large','men','women','weekday_lunch'
    valid_from timestamptz,
    valid_to timestamptz,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_prices_service ON catalog.service_prices(service_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_valid_to ON catalog.service_prices(valid_to DESC);

ALTER TABLE catalog.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.service_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='business_services' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.business_services FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='service_prices' AND policyname='read_all_auth'
  ) THEN
    CREATE POLICY read_all_auth ON catalog.service_prices FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Effective merged profile view: precedence owner_approved -> curated -> base -> google_cache
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
       l.longitude
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
WHERE b.is_active = true;

GRANT SELECT ON public.business_profile TO anon, authenticated;

-- RPCs for owner updates and moderation
CREATE OR REPLACE FUNCTION public.submit_business_update(p_business_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO catalog.business_owner_updates (business_id, owner_id, proposed, status)
  VALUES (p_business_id, auth.uid(), p_payload, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderate_business_update(p_update_id uuid, p_approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  UPDATE catalog.business_owner_updates
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_update_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_business_update(uuid, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.moderate_business_update(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_business_update(uuid, boolean) TO service_role;


-- =====================
-- User-submitted events and specials (with moderation)
-- =====================

-- Event submissions (may or may not attach to a business)
CREATE TABLE IF NOT EXISTS catalog.event_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    business_id uuid REFERENCES catalog.businesses(id) ON DELETE SET NULL,
    proposed jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    approved_event_id uuid REFERENCES catalog.events(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by uuid,
    reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_event_submissions_user ON catalog.event_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_submissions_business ON catalog.event_submissions(business_id);

-- Special submissions (must attach to a business)
CREATE TABLE IF NOT EXISTS catalog.special_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    business_id uuid NOT NULL REFERENCES catalog.businesses(id) ON DELETE CASCADE,
    proposed jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    approved_special_id uuid REFERENCES catalog.specials(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_by uuid,
    reviewed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_special_submissions_user ON catalog.special_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_special_submissions_business ON catalog.special_submissions(business_id);

-- Enable RLS
ALTER TABLE catalog.event_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.special_submissions ENABLE ROW LEVEL SECURITY;

-- Policies: users can view and insert their own submissions; delete only when pending
DROP POLICY IF EXISTS event_submissions_self_select ON catalog.event_submissions;
CREATE POLICY event_submissions_self_select ON catalog.event_submissions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS event_submissions_self_insert ON catalog.event_submissions;
CREATE POLICY event_submissions_self_insert ON catalog.event_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS event_submissions_self_delete ON catalog.event_submissions;
CREATE POLICY event_submissions_self_delete ON catalog.event_submissions
  FOR DELETE USING (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS special_submissions_self_select ON catalog.special_submissions;
CREATE POLICY special_submissions_self_select ON catalog.special_submissions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS special_submissions_self_insert ON catalog.special_submissions;
CREATE POLICY special_submissions_self_insert ON catalog.special_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS special_submissions_self_delete ON catalog.special_submissions;
CREATE POLICY special_submissions_self_delete ON catalog.special_submissions
  FOR DELETE USING (user_id = auth.uid() AND status = 'pending');

-- Public deals page view (approved specials only)
CREATE OR REPLACE VIEW public.deals_page AS
SELECT s.*, b.name AS business_name, l.city, l.country
FROM catalog.specials s
JOIN catalog.businesses b ON b.id = s.business_id
LEFT JOIN LATERAL (
  SELECT l1.city, l1.country
  FROM catalog.business_locations l1
  WHERE l1.business_id = s.business_id AND l1.is_primary = true
  ORDER BY l1.created_at ASC
  LIMIT 1
) l ON true
WHERE (s.starts_at IS NULL OR s.starts_at <= now())
  AND (s.ends_at IS NULL OR s.ends_at >= now());

GRANT SELECT ON public.deals_page TO anon, authenticated;

-- RPCs: submit and moderate event/special submissions
CREATE OR REPLACE FUNCTION public.submit_event_submission(p_business_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO catalog.event_submissions (user_id, business_id, proposed, status)
  VALUES (auth.uid(), p_business_id, p_payload, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_special_submission(p_business_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO catalog.special_submissions (user_id, business_id, proposed, status)
  VALUES (auth.uid(), p_business_id, p_payload, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderate_event_submission(p_submission_id uuid, p_approve boolean)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_business_id uuid;
  v_proposed jsonb;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  SELECT business_id, proposed INTO v_business_id, v_proposed
  FROM catalog.event_submissions WHERE id = p_submission_id FOR UPDATE;

  IF p_approve THEN
    INSERT INTO catalog.events (
      title, description, starts_at, ends_at, venue_business_id, city, url, is_active
    ) VALUES (
      NULLIF(v_proposed->>'title',''),
      v_proposed->>'description',
      NULLIF(v_proposed->>'starts_at','')::timestamptz,
      NULLIF(v_proposed->>'ends_at','')::timestamptz,
      COALESCE(v_business_id, (v_proposed->>'venue_business_id')::uuid),
      v_proposed->>'city',
      v_proposed->>'url',
      true
    ) RETURNING id INTO v_id;
    UPDATE catalog.event_submissions
      SET status='approved', reviewed_by=auth.uid(), reviewed_at=now(), approved_event_id=v_id
      WHERE id = p_submission_id;
  ELSE
    UPDATE catalog.event_submissions
      SET status='rejected', reviewed_by=auth.uid(), reviewed_at=now()
      WHERE id = p_submission_id;
    v_id := NULL;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderate_special_submission(p_submission_id uuid, p_approve boolean)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_business_id uuid;
  v_proposed jsonb;
  v_tags text[] := NULL;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;
  SELECT business_id, proposed INTO v_business_id, v_proposed
  FROM catalog.special_submissions WHERE id = p_submission_id FOR UPDATE;

  IF (v_proposed ? 'tags') THEN
    SELECT COALESCE(array_agg(elem), '{}') INTO v_tags
    FROM jsonb_array_elements_text(v_proposed->'tags') AS t(elem);
  END IF;

  IF p_approve THEN
    INSERT INTO catalog.specials (
      business_id, title, description, starts_at, ends_at, tags
    ) VALUES (
      v_business_id,
      NULLIF(v_proposed->>'title',''),
      v_proposed->>'description',
      NULLIF(v_proposed->>'starts_at','')::timestamptz,
      NULLIF(v_proposed->>'ends_at','')::timestamptz,
      v_tags
    ) RETURNING id INTO v_id;
    UPDATE catalog.special_submissions
      SET status='approved', reviewed_by=auth.uid(), reviewed_at=now(), approved_special_id=v_id
      WHERE id = p_submission_id;
  ELSE
    UPDATE catalog.special_submissions
      SET status='rejected', reviewed_by=auth.uid(), reviewed_at=now()
      WHERE id = p_submission_id;
    v_id := NULL;
  END IF;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_event_submission(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_special_submission(uuid, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.moderate_event_submission(uuid, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.moderate_special_submission(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_event_submission(uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.moderate_special_submission(uuid, boolean) TO service_role;
