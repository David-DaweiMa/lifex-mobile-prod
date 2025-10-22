-- Coly-focused data structures: reminders, watchlists, supermarket, fuel, EV

-- Use existing schemas: core (user/PII), catalog (real-world places), social (lists)

-- =====================
-- Reminders (personal, PII-bound)
-- =====================

CREATE TABLE IF NOT EXISTS core.reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    kind text NOT NULL, -- e.g., 'wof', 'reg', 'sub', 'bill', 'custom'
    title text NOT NULL,
    due_at timestamptz,
    payload jsonb, -- optional structured fields
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','done','snoozed','cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE core.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reminders_self_select ON core.reminders;
CREATE POLICY reminders_self_select ON core.reminders FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS reminders_self_write ON core.reminders;
CREATE POLICY reminders_self_write ON core.reminders
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reminders_self_update ON core.reminders;
CREATE POLICY reminders_self_update ON core.reminders
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reminders_self_delete ON core.reminders;
CREATE POLICY reminders_self_delete ON core.reminders
  FOR DELETE USING (user_id = auth.uid());

-- =====================
-- Watchlists (track items like categories, businesses, deals)
-- =====================

CREATE TABLE IF NOT EXISTS social.user_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    kind text NOT NULL DEFAULT 'generic', -- e.g., 'deal_watch', 'fuel_watch', 'grocery'
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social.list_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id uuid NOT NULL REFERENCES social.user_lists(id) ON DELETE CASCADE,
    target_type text NOT NULL, -- 'business'|'category'|'product'|'city'
    target_id uuid,
    target_text text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lists_self_select ON social.user_lists;
CREATE POLICY lists_self_select ON social.user_lists FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS lists_self_write ON social.user_lists;
CREATE POLICY lists_self_write ON social.user_lists FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS lists_self_update ON social.user_lists;
CREATE POLICY lists_self_update ON social.user_lists FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS lists_self_delete ON social.user_lists;
CREATE POLICY lists_self_delete ON social.user_lists FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS list_items_self_select ON social.list_items;
CREATE POLICY list_items_self_select ON social.list_items
  FOR SELECT USING (list_id IN (SELECT id FROM social.user_lists WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS list_items_self_insert ON social.list_items;
CREATE POLICY list_items_self_insert ON social.list_items
  FOR INSERT WITH CHECK (list_id IN (SELECT id FROM social.user_lists WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS list_items_self_delete ON social.list_items;
CREATE POLICY list_items_self_delete ON social.list_items
  FOR DELETE USING (list_id IN (SELECT id FROM social.user_lists WHERE user_id = auth.uid()));

-- =====================
-- Supermarket (retailers, stores, products, prices)
-- =====================

CREATE TABLE IF NOT EXISTS catalog.retailers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    website text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.retailer_stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id uuid NOT NULL REFERENCES catalog.retailers(id) ON DELETE CASCADE,
    name text,
    city text,
    address text,
    latitude double precision,
    longitude double precision
);

CREATE TABLE IF NOT EXISTS catalog.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku text,
    name text NOT NULL,
    brand text,
    size text,
    attributes jsonb
);

CREATE TABLE IF NOT EXISTS catalog.store_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid NOT NULL REFERENCES catalog.retailer_stores(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES catalog.products(id) ON DELETE CASCADE,
    price_cents integer NOT NULL,
    promo boolean NOT NULL DEFAULT false,
    fetched_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catalog.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.retailer_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.store_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='retailers' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.retailers FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='retailer_stores' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.retailer_stores FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='products' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.products FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='store_prices' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.store_prices FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- =====================
-- Fuel and EV
-- =====================

CREATE TABLE IF NOT EXISTS catalog.fuel_stations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    brand text,
    address text,
    city text,
    latitude double precision,
    longitude double precision,
    source text,
    source_ref text
);

CREATE TABLE IF NOT EXISTS catalog.fuel_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id uuid NOT NULL REFERENCES catalog.fuel_stations(id) ON DELETE CASCADE,
    fuel_type text NOT NULL, -- 91/95/98/diesel
    price_cents integer NOT NULL,
    fetched_at timestamptz NOT NULL DEFAULT now(),
    source text,
    source_ref text
);

CREATE TABLE IF NOT EXISTS catalog.ev_networks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    website text
);

CREATE TABLE IF NOT EXISTS catalog.ev_chargers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id uuid REFERENCES catalog.ev_networks(id) ON DELETE SET NULL,
    name text,
    address text,
    city text,
    latitude double precision,
    longitude double precision,
    power_kw numeric(6,2),
    connector_types text[]
);

ALTER TABLE catalog.fuel_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.ev_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.ev_chargers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='fuel_stations' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.fuel_stations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='fuel_prices' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.fuel_prices FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='ev_networks' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.ev_networks FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='catalog' AND tablename='ev_chargers' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON catalog.ev_chargers FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- =====================
-- Views and RPCs (selected)
-- =====================

CREATE OR REPLACE VIEW public.fuel_nearby AS
SELECT s.*,
       p.price_cents,
       p.fuel_type,
       p.fetched_at
FROM catalog.fuel_stations s
LEFT JOIN LATERAL (
  SELECT fp.price_cents, fp.fuel_type, fp.fetched_at
  FROM catalog.fuel_prices fp
  WHERE fp.station_id = s.id
  ORDER BY fp.fetched_at DESC
  LIMIT 1
) p ON true;

GRANT SELECT ON public.fuel_nearby TO anon, authenticated;

CREATE OR REPLACE VIEW public.ev_nearby AS
SELECT c.*, n.name AS network_name, n.website AS network_website
FROM catalog.ev_chargers c
LEFT JOIN catalog.ev_networks n ON n.id = c.network_id;

GRANT SELECT ON public.ev_nearby TO anon, authenticated;

-- Create/list user watchlists via RPC
CREATE OR REPLACE FUNCTION public.create_user_list(p_name text, p_kind text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO social.user_lists (user_id, name, kind)
  VALUES (auth.uid(), p_name, p_kind)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_list_item(p_list_id uuid, p_type text, p_target_id uuid, p_target_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO social.list_items (list_id, target_type, target_id, target_text)
  SELECT p_list_id, p_type, p_target_id, p_target_text
  WHERE p_list_id IN (SELECT id FROM social.user_lists WHERE user_id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_list(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_list_item(uuid, text, uuid, text) TO authenticated;

-- =====================
-- Scheduling (ops jobs + runs) and reminder templates
-- =====================

CREATE SCHEMA IF NOT EXISTS ops;

CREATE TABLE IF NOT EXISTS ops.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    schedule text NOT NULL, -- e.g., 'daily','weekly','monthly','hourly','adhoc'
    active boolean NOT NULL DEFAULT true,
    config jsonb
);

CREATE TABLE IF NOT EXISTS ops.job_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES ops.jobs(id) ON DELETE CASCADE,
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz,
    status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','failed')),
    result jsonb
);

ALTER TABLE ops.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.job_runs ENABLE ROW LEVEL SECURITY;

-- Read-only to authenticated; writes via service backend
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='ops' AND tablename='jobs' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON ops.jobs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='ops' AND tablename='job_runs' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON ops.job_runs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Reminder templates (for generating user reminders)
CREATE TABLE IF NOT EXISTS core.reminder_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE, -- e.g., 'wof', 'reg', 'sub_netflix'
    title text NOT NULL,
    default_offset_days integer, -- how many days before due to notify
    payload_schema jsonb -- optional schema for payload
);

ALTER TABLE core.reminder_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reminder_templates_read ON core.reminder_templates;
CREATE POLICY reminder_templates_read ON core.reminder_templates FOR SELECT USING (true);

-- RPC: generate due reminders in next N days (for current user)
CREATE OR REPLACE FUNCTION public.list_due_reminders(p_within_days int DEFAULT 7)
RETURNS TABLE (
    id uuid,
    title text,
    due_at timestamptz,
    status text
) LANGUAGE sql
STABLE
AS $$
  SELECT r.id, r.title, r.due_at, r.status
  FROM core.reminders r
  WHERE r.user_id = auth.uid()
    AND r.status = 'active'
    AND r.due_at IS NOT NULL
    AND r.due_at <= now() + ((p_within_days || ' days')::interval)
  ORDER BY r.due_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.list_due_reminders(int) TO authenticated;

-- =====================
-- Fuel best price and EV nearby RPCs
-- =====================

CREATE OR REPLACE FUNCTION public.find_best_fuel_price(
  p_city text,
  p_fuel_type text DEFAULT '91',
  p_limit int DEFAULT 10
) RETURNS TABLE (
  station_id uuid,
  name text,
  address text,
  city text,
  price_cents int,
  fetched_at timestamptz
) LANGUAGE sql
STABLE
AS $$
  WITH latest AS (
    SELECT fp.station_id, fp.fuel_type, fp.price_cents, fp.fetched_at,
           ROW_NUMBER() OVER (PARTITION BY fp.station_id, fp.fuel_type ORDER BY fp.fetched_at DESC) AS rn
    FROM catalog.fuel_prices fp
    WHERE lower(fp.fuel_type) = lower(p_fuel_type)
  )
  SELECT s.id, s.name, s.address, s.city, l.price_cents, l.fetched_at
  FROM catalog.fuel_stations s
  JOIN latest l ON l.station_id = s.id AND l.rn = 1
  WHERE lower(s.city) = lower(p_city)
  ORDER BY l.price_cents ASC
  LIMIT COALESCE(p_limit, 10);
$$;

GRANT EXECUTE ON FUNCTION public.find_best_fuel_price(text, text, int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.find_ev_nearby(
  p_city text,
  p_limit int DEFAULT 20
) RETURNS TABLE (
  id uuid,
  name text,
  address text,
  city text,
  power_kw numeric,
  connector_types text[],
  network_name text
) LANGUAGE sql
STABLE
AS $$
  SELECT c.id, c.name, c.address, c.city, c.power_kw, c.connector_types, n.name AS network_name
  FROM catalog.ev_chargers c
  LEFT JOIN catalog.ev_networks n ON n.id = c.network_id
  WHERE lower(c.city) = lower(p_city)
  ORDER BY c.power_kw DESC NULLS LAST
  LIMIT COALESCE(p_limit, 20);
$$;

GRANT EXECUTE ON FUNCTION public.find_ev_nearby(text, int) TO anon, authenticated;

-- =====================
-- Seed ops.jobs (idempotent upserts by unique name)
-- =====================

INSERT INTO ops.jobs (name, schedule, active, config)
VALUES
  ('daily_due_reminder_notify', 'daily', true, '{"lookahead_days":7}'),
  ('daily_fuel_prices_refresh', 'daily', true, '{"cities":["auckland","wellington","christchurch","hamilton","tauranga"]}'),
  ('daily_ev_chargers_refresh', 'daily', true, '{"cities":["auckland","wellington","christchurch","hamilton","tauranga"]}'),
  ('daily_google_places_refresh_popular', 'daily', true, '{"batch_size":200}'),
  ('weekly_events_scrape', 'weekly', true, '{"sources":["eventfinda","council"]}'),
  ('weekly_deals_scrape', 'weekly', true, '{"domains":["firsttable","restaurant","supermarket"]}'),
  ('weekly_business_metrics_recalc', 'weekly', true, '{"metrics":["lifex_rating","review_count","favorite_count"]}'),
  ('monthly_embeddings_rebuild', 'monthly', true, '{"target":"business","rebuild_percent":25}'),
  ('monthly_data_quality_audit', 'monthly', true, '{"checks":["orphans","duplicates","stale_google"]}'),
  ('adhoc_backfill', 'adhoc', false, '{"note":"enable per-need"}')
ON CONFLICT (name) DO UPDATE SET
  schedule = EXCLUDED.schedule,
  active = EXCLUDED.active,
  config = EXCLUDED.config;

-- =====================
-- Consents (privacy) and Outbox (reliable external delivery)
-- =====================

CREATE TABLE IF NOT EXISTS core.consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    key text NOT NULL, -- e.g., 'marketing_emails','analytics','personalization'
    granted_at timestamptz,
    revoked_at timestamptz,
    UNIQUE (user_id, key)
);

ALTER TABLE core.consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS consents_self_select ON core.consents;
CREATE POLICY consents_self_select ON core.consents FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS consents_self_write ON core.consents;
CREATE POLICY consents_self_write ON core.consents FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS consents_self_update ON core.consents;
CREATE POLICY consents_self_update ON core.consents FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Outbox for external notifications/webhooks
CREATE TABLE IF NOT EXISTS ops.outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic text NOT NULL, -- e.g., 'email','push','webhook:stripe','webhook:analytics'
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
    attempts int NOT NULL DEFAULT 0,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ops.outbox ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='ops' AND tablename='outbox' AND policyname='read_all_auth') THEN
    CREATE POLICY read_all_auth ON ops.outbox FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


