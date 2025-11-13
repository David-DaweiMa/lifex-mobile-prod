-- Create cache table for website scraping results and a batch upsert RPC.
-- Stores HTML snapshot (bounded), extracted JSON-LD nodes, and normalized attributes.
-- This cache is written even during dry runs for validation.

BEGIN;

CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE IF NOT EXISTS catalog.business_scrape_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid,
  source_url text NOT NULL,
  page_title text,
  raw_html text,
  jsonld jsonb,
  attrs jsonb,
  status text,
  error text,
  job_name text DEFAULT 'business-website-extract',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  extracted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_url)
);

-- Batch upsert RPC for service role
CREATE OR REPLACE FUNCTION public.admin_upsert_business_scrape_cache_batch(p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  itm jsonb;
  v_business_id uuid;
  v_source_url text;
  v_page_title text;
  v_raw_html text;
  v_jsonld jsonb;
  v_attrs jsonb;
  v_status text;
  v_error text;
  v_job_name text;
  v_fetched_at timestamptz;
  v_extracted_at timestamptz;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'invalid payload: expected jsonb array';
  END IF;

  FOR itm IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_business_id := NULLIF(itm->>'business_id','')::uuid;
    v_source_url := NULLIF(itm->>'source_url','');
    v_page_title := NULLIF(itm->>'page_title','');
    v_raw_html := itm->>'raw_html';
    v_jsonld := itm->'jsonld';
    v_attrs := itm->'attrs';
    v_status := NULLIF(itm->>'status','');
    v_error := NULLIF(itm->>'error','');
    v_job_name := COALESCE(NULLIF(itm->>'job_name',''), 'business-website-extract');
    v_fetched_at := COALESCE(NULLIF(itm->>'fetched_at','')::timestamptz, now());
    v_extracted_at := COALESCE(NULLIF(itm->>'extracted_at','')::timestamptz, now());

    IF v_source_url IS NULL THEN
      CONTINUE;
    END IF;

    INSERT INTO catalog.business_scrape_cache(
      business_id, source_url, page_title, raw_html, jsonld, attrs,
      status, error, job_name, fetched_at, extracted_at
    ) VALUES (
      v_business_id, v_source_url, v_page_title, v_raw_html, v_jsonld, v_attrs,
      v_status, v_error, v_job_name, v_fetched_at, v_extracted_at
    )
    ON CONFLICT (source_url) DO UPDATE SET
      business_id = EXCLUDED.business_id,
      page_title = EXCLUDED.page_title,
      raw_html = EXCLUDED.raw_html,
      jsonld = EXCLUDED.jsonld,
      attrs = EXCLUDED.attrs,
      status = EXCLUDED.status,
      error = EXCLUDED.error,
      job_name = EXCLUDED.job_name,
      fetched_at = EXCLUDED.fetched_at,
      extracted_at = EXCLUDED.extracted_at;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_business_scrape_cache_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_business_scrape_cache_batch(jsonb) TO service_role;

COMMIT;

-- Business website scrape cache
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE IF NOT EXISTS catalog.business_scrape_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid,
  url text,
  jsonld jsonb,
  attrs jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  extracted_at timestamptz,
  errors text[],
  UNIQUE (business_id, url)
);

-- Optional helpful indexes
CREATE INDEX IF NOT EXISTS idx_business_scrape_cache_business_id
  ON catalog.business_scrape_cache (business_id);
CREATE INDEX IF NOT EXISTS idx_business_scrape_cache_fetched_at
  ON catalog.business_scrape_cache (fetched_at DESC);


