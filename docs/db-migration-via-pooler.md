DB migration via Session Pooler (IPv4) – no CLI history checks

Use this when direct 5432 is unavailable and Supabase CLI is blocked by pooler prepared-statement conflicts.

Prereqs
- Have a Pooler (IPv4) URL and DB password. Example:
  postgresql://postgres.<project_ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres

Windows (PowerShell)
1) Install psql (one time):
   winget install --id PostgreSQL.PostgreSQL -e
2) Run a migration SQL file:
   $env:PGPASSWORD = '<DB_PASSWORD>'
   psql -h aws-0-<region>.pooler.supabase.com -p 6543 -U postgres.<project_ref> -d postgres -v ON_ERROR_STOP=1 -f "<path-to-sql-file>"

Mac/Linux (bash)
1) Install psql (via brew/apt as preferred)
2) Run:
   PGPASSWORD='<DB_PASSWORD>' \
   psql "host=aws-0-<region>.pooler.supabase.com port=6543 user=postgres.<project_ref> dbname=postgres" \
     -v ON_ERROR_STOP=1 -f <path-to-sql-file>

Node helper (optional)
- You can also use scripts/run_sql_pooler.js to execute a SQL file using DB_URL env var (pooler):
  set DB_URL=postgresql://postgres.<project_ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
  node scripts/run_sql_pooler.js supabase/migrations/20251106_specials_scrape_cache.sql

Notes
- Pooler uses transaction pooling; avoid prepared statements. psql works; Supabase CLI list/pull/push may conflict.
- This method bypasses migration history checks. If needed later, align history with a direct 5432 session or GitHub Actions.


