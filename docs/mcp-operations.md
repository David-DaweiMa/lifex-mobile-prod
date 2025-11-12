### Supabase DB operations via Cursor MCP

This project now standardizes all database operations through Cursor MCP (Supabase server). Prefer MCP over local CLI or ad‑hoc runners.

Scope
- Execute raw SQL (read/write)
- Apply lightweight migrations (DDL / CREATE FUNCTION)
- List schemas/tables, inspect objects
- Fetch recent service logs (auth/api/storage/realtime) for debugging

Prerequisites
- `.cursor/mcp.json` includes:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=muuzilttuddlljumoiig"
    }
  }
}
```

Enable in Cursor
- Command Palette → “MCP: Reload”
- In MCP panel select `supabase` → Connect

Common operations
- Run SQL (read/write):

```sql
-- Example: check one row
select * from catalog.special_scrape_cache limit 1;
```

- Apply migration (DDL / function updates):
  - Paste the SQL content of a migration file (e.g. `supabase/migrations/20251112_update_specials_rpc.sql`) into MCP “Execute SQL”, or use the “Apply migration” action if available in your Cursor build.

- List tables in schemas:
  - Use MCP “List Tables” → choose schema(s), or:
```sql
select table_schema, table_name from information_schema.tables
where table_schema in ('public','catalog')
order by table_schema, table_name;
```

Guidelines
- Use MCP for:
  - Hotfix DDL (CREATE/REPLACE FUNCTION, CREATE VIEW, simple ALTER TABLE)
  - Data backfills and quick sanity checks
- Avoid long‑running/complex data migrations in MCP; for bulk work, script them and execute in batches.
- Use `service_role`-guarded RPCs for server writes from Edge Functions; MCP is for operator tasks.

Deprecations
- GitHub Actions “Run SQL (once)” workflow: removed.
- Local pooler scripts: kept for reference but not recommended; use MCP instead.

Change log
- 2025-11-12: Adopt MCP as the primary path for database operations; updated RPC `public.admin_upsert_special_scrape_cache_batch` to write `catalog.special_scrape_cache`.


