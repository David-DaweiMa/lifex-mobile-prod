-- Renamed local version to avoid version id collision
-- Admin RPC to log job runs (service_role only)
CREATE OR REPLACE FUNCTION public.admin_log_job_run(
  p_job_name text,
  p_started_at timestamptz,
  p_finished_at timestamptz,
  p_status text,                       -- 'success' | 'failed' | 'running'
  p_result jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_job_id uuid;
  v_run_id uuid;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'forbidden: service_role required';
  END IF;

  -- Ensure job exists by unique name
  SELECT id INTO v_job_id FROM ops.jobs WHERE name = p_job_name LIMIT 1;
  IF v_job_id IS NULL THEN
    INSERT INTO ops.jobs(name, schedule, active, config)
    VALUES (p_job_name, 'adhoc', true, NULL)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_job_id;
  END IF;

  -- Insert run record
  INSERT INTO ops.job_runs(job_id, started_at, finished_at, status, result)
  VALUES (v_job_id, p_started_at, p_finished_at, p_status, p_result)
  RETURNING id INTO v_run_id;

  RETURN v_run_id;
END;
$fn$;
REVOKE ALL ON FUNCTION public.admin_log_job_run(text, timestamptz, timestamptz, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_log_job_run(text, timestamptz, timestamptz, text, jsonb) TO service_role;


