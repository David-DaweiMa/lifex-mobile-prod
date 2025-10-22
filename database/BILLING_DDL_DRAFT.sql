-- Billing schema: provider-agnostic (Stripe/PayPal/etc.)

CREATE SCHEMA IF NOT EXISTS billing;

-- Core entities
CREATE TABLE IF NOT EXISTS billing.customers (
    user_id uuid PRIMARY KEY REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    default_provider text, -- 'stripe' | 'paypal' | 'apple' | 'google'
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE, -- e.g., 'coly_basic', 'coly_plus'
    name text NOT NULL,
    description text,
    active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS billing.prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES billing.products(id) ON DELETE CASCADE,
    currency text NOT NULL DEFAULT 'NZD',
    unit_amount_cents integer NOT NULL,
    interval text NOT NULL DEFAULT 'month', -- month|year|one_time
    active boolean NOT NULL DEFAULT true
);

-- Provider linkage (external IDs)
CREATE TABLE IF NOT EXISTS billing.provider_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL, -- 'product'|'price'|'customer'|'subscription'|'payment'
    entity_id uuid NOT NULL,   -- FK to our tables
    provider text NOT NULL,    -- 'stripe'|'paypal'|'apple'|'google'
    external_id text NOT NULL,
    UNIQUE(entity_type, entity_id, provider)
);

CREATE TABLE IF NOT EXISTS billing.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES billing.products(id) ON DELETE RESTRICT,
    price_id uuid NOT NULL REFERENCES billing.prices(id) ON DELETE RESTRICT,
    status text NOT NULL CHECK (status IN ('active','trialing','past_due','canceled','incomplete','paused')),
    current_period_end timestamptz,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS billing.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.user_profiles(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    currency text NOT NULL DEFAULT 'NZD',
    provider text NOT NULL,
    external_id text,
    status text NOT NULL CHECK (status IN ('succeeded','pending','failed','refunded','partial_refunded')),
    created_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb
);

CREATE TABLE IF NOT EXISTS billing.webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now(),
    event_type text,
    external_id text,
    payload jsonb
);

-- RLS
ALTER TABLE billing.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payments ENABLE ROW LEVEL SECURITY;

-- Policies: user can read own billing data
DROP POLICY IF EXISTS customers_self_select ON billing.customers;
CREATE POLICY customers_self_select ON billing.customers FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS subscriptions_self_select ON billing.subscriptions;
CREATE POLICY subscriptions_self_select ON billing.subscriptions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS payments_self_select ON billing.payments;
CREATE POLICY payments_self_select ON billing.payments FOR SELECT USING (user_id = auth.uid());

-- Public entitlements view
CREATE OR REPLACE VIEW public.user_entitlements AS
SELECT s.user_id,
       p.key AS product_key,
       s.status,
       s.current_period_end,
       (s.status IN ('active','trialing') AND (s.current_period_end IS NULL OR s.current_period_end >= now())) AS is_active
FROM billing.subscriptions s
JOIN billing.products p ON p.id = s.product_id
WHERE p.active = true;

GRANT SELECT ON public.user_entitlements TO anon, authenticated;

-- RPC: get current user entitlements
CREATE OR REPLACE FUNCTION public.get_my_entitlements()
RETURNS SETOF public.user_entitlements
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.user_entitlements WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_entitlements() TO authenticated;

-- Service-only admin RPCs (create product/price)
CREATE OR REPLACE FUNCTION public.admin_create_product(p_key text, p_name text, p_description text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO billing.products (key, name, description)
  VALUES (p_key, p_name, p_description) RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_create_price(p_product_id uuid, p_amount_cents int, p_currency text DEFAULT 'NZD', p_interval text DEFAULT 'month')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO billing.prices (product_id, currency, unit_amount_cents, interval)
  VALUES (p_product_id, p_currency, p_amount_cents, p_interval) RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

REVOKE ALL ON FUNCTION public.admin_create_product(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_create_price(uuid, int, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_product(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_price(uuid, int, text, text) TO service_role;

-- Activate/Deactivate a price (service only)
CREATE OR REPLACE FUNCTION public.admin_set_price_active(p_price_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE billing.prices SET active = p_active WHERE id = p_price_id;
END; $$;

REVOKE ALL ON FUNCTION public.admin_set_price_active(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_price_active(uuid, boolean) TO service_role;

-- Cancel a user's subscription (service only)
CREATE OR REPLACE FUNCTION public.admin_cancel_subscription(p_user_id uuid, p_product_key text, p_at_period_end boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_product_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO v_product_id FROM billing.products WHERE key = p_product_key;
  IF v_product_id IS NULL THEN RAISE EXCEPTION 'product not found'; END IF;
  UPDATE billing.subscriptions
     SET status = CASE WHEN p_at_period_end THEN status ELSE 'canceled' END,
         cancel_at_period_end = p_at_period_end,
         updated_at = now()
   WHERE user_id = p_user_id AND product_id = v_product_id;
END; $$;

REVOKE ALL ON FUNCTION public.admin_cancel_subscription(uuid, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cancel_subscription(uuid, text, boolean) TO service_role;

-- Sync subscription from provider identifiers (service only)
CREATE OR REPLACE FUNCTION public.admin_sync_subscription(
  p_provider text,
  p_external_customer_id text,
  p_external_subscription_id text,
  p_product_key text,
  p_price_external_id text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_product_id uuid;
  v_price_id uuid;
  v_sub_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'forbidden'; END IF;

  -- Resolve user by provider customer link
  SELECT c.user_id INTO v_user_id
  FROM billing.customers c
  JOIN billing.provider_links pl
    ON pl.entity_type = 'customer' AND pl.entity_id = c.user_id AND pl.provider = p_provider AND pl.external_id = p_external_customer_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'customer link not found for % %', p_provider, p_external_customer_id;
  END IF;

  -- Resolve product by key
  SELECT id INTO v_product_id FROM billing.products WHERE key = p_product_key;
  IF v_product_id IS NULL THEN RAISE EXCEPTION 'product not found by key %', p_product_key; END IF;

  -- Resolve price via provider link
  SELECT pl.entity_id INTO v_price_id
  FROM billing.provider_links pl
  WHERE pl.entity_type = 'price' AND pl.provider = p_provider AND pl.external_id = p_price_external_id
  LIMIT 1;

  IF v_price_id IS NULL THEN
    RAISE EXCEPTION 'price link not found for % %', p_provider, p_price_external_id;
  END IF;

  -- Upsert subscription
  INSERT INTO billing.subscriptions (user_id, product_id, price_id, status, current_period_end, cancel_at_period_end)
  VALUES (v_user_id, v_product_id, v_price_id, p_status, p_current_period_end, p_cancel_at_period_end)
  ON CONFLICT (user_id, product_id) DO UPDATE SET
    price_id = EXCLUDED.price_id,
    status = EXCLUDED.status,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = now()
  RETURNING id INTO v_sub_id;

  -- Link provider subscription id
  INSERT INTO billing.provider_links (entity_type, entity_id, provider, external_id)
  VALUES ('subscription', v_sub_id, p_provider, p_external_subscription_id)
  ON CONFLICT (entity_type, entity_id, provider) DO UPDATE SET external_id = EXCLUDED.external_id;

  RETURN v_sub_id;
END; $$;

REVOKE ALL ON FUNCTION public.admin_sync_subscription(text, text, text, text, text, text, timestamptz, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_sync_subscription(text, text, text, text, text, text, timestamptz, boolean) TO service_role;


