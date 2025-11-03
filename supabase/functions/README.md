# Supabase Edge Functions — Workers Skeleton

Functions:
- places-refresh: Google Places cache refresh and promotion trigger
- events-scrape: Events scraping to event_scrape_cache
- specials-scrape: Specials scraping to special_scrape_cache
- embeddings-generate: Generate embeddings from ai.business_corpus

Environment (set in Supabase project → Functions → Config):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_PLACES_API_KEY (for places-refresh)
- EMBEDDING_PROVIDER (e.g., openai)
- OPENAI_API_KEY (if provider=openai)
- RATE_LIMIT_QPS, BATCH_SIZE, CONCURRENCY

HTTP trigger examples (POST JSON):
```bash
curl -X POST "$FUNCTION_URL/places-refresh" -H 'Content-Type: application/json' -d '{"city":"Auckland","category":"restaurant"}'
curl -X POST "$FUNCTION_URL/events-scrape" -H 'Content-Type: application/json' -d '{"source":"example","city":"Auckland"}'
curl -X POST "$FUNCTION_URL/specials-scrape" -H 'Content-Type: application/json' -d '{"source":"example","city":"Auckland"}'
curl -X POST "$FUNCTION_URL/embeddings-generate" -H 'Content-Type: application/json' -d '{"scope":"incremental","model":"text-embedding-3-small"}'
```

Scheduling (Supabase cron): call the HTTP endpoints on desired cadence.



