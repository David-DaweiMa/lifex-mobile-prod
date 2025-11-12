### Supabase Edge Functions – Local testing notes (2025-11-12)

- This document captures how to test deployed Supabase Edge Functions and REST reads locally, plus the latest test results for the current project.

#### Required environment
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- Optional: SUPABASE_ANON_KEY
- Optional: SUPABASE_FUNCTIONS_URL (can be derived from SUPABASE_URL as https://<ref>.functions.supabase.co)

Example: load from .env or .env.backup in PowerShell

```powershell
# Load .env(.backup)
Get-Content .env.backup, .env -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  if ($_ -match '^(?<k>[^=]+)=(?<v>.*)$') {
    $k=$Matches['k'].Trim(); $v=$Matches['v']
    if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v=$v.Trim('"') }
    [Environment]::SetEnvironmentVariable($k,$v,'Process')
  }
}
# Map Expo vars if present
if (-not $env:SUPABASE_URL -and $env:EXPO_PUBLIC_SUPABASE_URL) { $env:SUPABASE_URL = $env:EXPO_PUBLIC_SUPABASE_URL }
if (-not $env:SUPABASE_ANON_KEY -and $env:EXPO_PUBLIC_SUPABASE_ANON_KEY) { $env:SUPABASE_ANON_KEY = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY }
# Derive functions URL
if (-not $env:SUPABASE_FUNCTIONS_URL -and $env:SUPABASE_URL) {
  $u=[Uri]$env:SUPABASE_URL
  if ($u.Host -match '^(?<ref>[^\.]+)\.supabase\.co$') { $env:SUPABASE_FUNCTIONS_URL = \"https://$($Matches['ref']).functions.supabase.co\" }
}
```

#### How to invoke functions (safe/dry run)
Use the functions v1 endpoint. Headers: Authorization: Bearer <SERVICE_ROLE_KEY>, Content-Type: application/json.

```powershell
$headers = @{ Authorization = \"Bearer $env:SUPABASE_SERVICE_ROLE_KEY\"; 'Content-Type'='application/json' }

# specials-scrape
Invoke-RestMethod -Method Post -Uri \"$env:SUPABASE_URL/functions/v1/specials-scrape\" -Headers $headers -Body '{\"dryRun\":true,\"sampleLimit\":1}'

# places-refresh
Invoke-RestMethod -Method Post -Uri \"$env:SUPABASE_URL/functions/v1/places-refresh\" -Headers $headers -Body '{\"city\":\"Auckland\",\"category\":\"cafe\",\"maxPages\":1,\"pageSize\":1,\"dryRun\":true}'

# events-scrape
Invoke-RestMethod -Method Post -Uri \"$env:SUPABASE_URL/functions/v1/events-scrape\" -Headers $headers -Body '{\"dryRun\":true,\"maxUrls\":0}'
```

#### Latest test results (2025-11-12, dryRun, no writes)
- specials-scrape: OK
  - Returned: {"ok":true,"scraped":0,"dryRun":true}
- places-refresh: OK
  - Returned: {"ok":true,"success":1,"failures":0,"skipped":0,"errors":[]}
- events-scrape: OK
  - Returned: {"ok":true,"source":"eventfinda","scraped":0,"dryRun":true,...}
- chat: 500 Internal Error (function responds with error on minimal payload)
- chat-v2: OK (returned greeting + usage)
- business-website-extract: 404 Not Found (not deployed in this project)

#### REST reads (PostgREST) – why 404?
- 404 indicates the table/view is not exposed to REST for the active schema, or the fully-qualified path is not available via API.
- Options to enable:
  - In Supabase Studio → API → expose the desired schema/tables, or
  - Create `public` views that select from internal schemas (e.g., `catalog`) and expose `public`.

Example GET once exposed:

```powershell
$headers = @{ apikey=$env:SUPABASE_ANON_KEY; Authorization = \"Bearer $env:SUPABASE_ANON_KEY\" }
Invoke-RestMethod -Method Get -Uri \"$env:SUPABASE_URL/rest/v1/catalog.event_scrape_cache?select=*&limit=1\" -Headers $headers
```

#### Deploy missing function (if needed)
- To deploy `business-website-extract`:
  - npx supabase functions deploy business-website-extract --project-ref <ref>
  - Then call:
    - POST $env:SUPABASE_URL/functions/v1/business-website-extract
    - or POST $env:SUPABASE_FUNCTIONS_URL/business-website-extract

Notes
- All tests used `dryRun=true` or no-op limits to avoid writes.
- For “modify database structure” tasks (DDL/migrations), prefer GitHub Actions psql runner or an admin-only execution path; direct local DB connectivity may be limited by network.


