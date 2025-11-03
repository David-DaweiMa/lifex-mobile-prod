-- Renamed local version to avoid version id collision
-- Admin RPC: batch upsert business attributes (service_role only)
CREATE OR REPLACE FUNCTION public.admin_upsert_business_attributes_batch(
  p_business_id uuid,
  p_attrs jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  INSERT INTO catalog.business_attributes(
    business_id, name, value, value_json, source, confidence, extracted_at
  )
  SELECT p_business_id,
         (a->>'name')::text,
         NULLIF(a->>'value','')::text,
         CASE WHEN a ? 'value_json' THEN NULLIF(a->>'value_json','')::jsonb ELSE NULL END,
         COALESCE(a->>'source','google'),
         NULLIF(a->>'confidence','')::numeric,
         COALESCE(NULLIF(a->>'extracted_at','')::timestamptz, now())
  FROM jsonb_array_elements(p_attrs) AS t(a)
  ON CONFLICT (business_id, name, source)
  DO UPDATE SET
    value = EXCLUDED.value,
    value_json = EXCLUDED.value_json,
    confidence = COALESCE(EXCLUDED.confidence, catalog.business_attributes.confidence),
    extracted_at = EXCLUDED.extracted_at;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_upsert_business_attributes_batch(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_business_attributes_batch(uuid, jsonb) TO service_role;
