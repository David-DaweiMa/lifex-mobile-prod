// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type RunParams = {
  placeIds?: string[]
  businessIds?: string[]
  sampleLimit?: number
  dryRun?: boolean
  // When true, never call Google Places; only scrape when website already exists in DB.
  requireWebsite?: boolean
  // Optional fallbacks when function env is not set
  supabaseUrl?: string
  serviceRoleKey?: string
}

const PLACES_BASE = 'https://places.googleapis.com/v1'

function getPlacesKey(): string {
  const key = Deno.env.get('GOOGLE_PLACES_API_KEY') || Deno.env.get('GOOGLE_MAPS_API_KEY')
  if (!key) throw new Error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY')
  return key
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

async function withRetries<T>(fn: () => Promise<T>, maxAttempts = 4, baseDelayMs = 300): Promise<T> {
  let attempt = 0
  let lastErr: any
  while (attempt < maxAttempts) {
    try { return await fn() } catch (e) {
      lastErr = e; attempt++
      await sleep(baseDelayMs * Math.pow(2, attempt - 1))
    }
  }
  throw lastErr
}

async function fetchPlaceDetail(key: string, placeId: string) {
  const res = await fetch(`${PLACES_BASE}/places/${encodeURIComponent(placeId)}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': [
        'id',
        'displayName',
        'formattedAddress',
        'websiteUri'
      ].join(',')
    }
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`place detail ${res.status} ${txt}`)
  }
  return await res.json()
}

function preferHttps(url: string | undefined): string | undefined {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.protocol === 'http:') {
      u.protocol = 'https:'
      return u.toString()
    }
    return url
  } catch {
    return url
  }
}

function buildUa(): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}

function extractJsonLdBlocks(html: string): any[] {
  const blocks: any[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]
    try {
      const json = JSON.parse(raw)
      if (Array.isArray(json)) blocks.push(...json)
      else blocks.push(json)
    } catch {
      // ignore malformed block
    }
    if (blocks.length >= 20) break
  }
  // Expand @graph if present
  const expanded: any[] = []
  for (const b of blocks) {
    if (b && Array.isArray(b['@graph'])) expanded.push(...b['@graph'])
    else expanded.push(b)
  }
  return expanded
}

function ensureArray<T>(v: any): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

function toStr(v: any): string | undefined {
  if (v == null) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return undefined
}

function pickFirst<T>(...vals: Array<T | undefined>): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v
  return undefined
}

function buildAttrsFromJsonLd(nodes: any[], nowIso: string) {
  const attrs: Array<{ name: string; value: string | null; value_json: any; source: string; confidence: number; extracted_at: string }> = []
  const add = (name: string, value: string | null, value_json: any, confidence = 0.8) => {
    attrs.push({ name, value, value_json, source: 'scrape', confidence, extracted_at: nowIso })
  }

  // Prefer LocalBusiness/Organization nodes
  const candidates = nodes.filter((n) => {
    const t = (n?.['@type'] || n?.type || '')
    const s = Array.isArray(t) ? t.join(',') : String(t)
    return /LocalBusiness|Organization|Restaurant|Store|Cafe|Bar|Hotel|Lodging|TouristAttraction/i.test(s)
  })
  const org = candidates[0] || nodes.find((n) => n?.['@type'] === 'WebSite') || null
  if (org) {
    const typeStr = toStr(org['@type']) || (Array.isArray(org['@type']) ? org['@type'][0] : undefined)
    if (typeStr) add('organization.type', typeStr, null, 0.85)

    const name = pickFirst<string>(org['name']?.text, org['name'])
    if (typeof name === 'string' && name.trim()) add('organization.name', name.trim(), null, 0.9)

    const telephone = toStr(org['telephone'])
    if (telephone) add('contact.phone', telephone, null, 0.85)

    const priceRange = toStr(org['priceRange'])
    if (priceRange) add('price.range', priceRange, null, 0.75)

    const servesCuisine = ensureArray<string>(org['servesCuisine']).filter(Boolean)
    if (servesCuisine.length > 0) add('serves.cuisine', null, servesCuisine, 0.75)

    const sameAs = ensureArray<string>(org['sameAs']).filter(Boolean)
    if (sameAs.length > 0) add('social.same_as', null, sameAs, 0.8)

    const address = org['address']
    if (address) add('address.structured', null, address, 0.85)

    const openingHours = org['openingHoursSpecification'] || org['openingHours']
    if (openingHours) add('hours.jsonld', null, openingHours, 0.85)

    const acceptsReservations = toStr(org['acceptsReservations'])
    if (acceptsReservations) add('reservations.accepts', acceptsReservations, null, 0.7)

    const menuUrl = toStr(org['hasMenu']) || toStr(org['menu'])
    if (menuUrl) add('menu.url', menuUrl, null, 0.7)

    const aggregateRating = org['aggregateRating']
    if (aggregateRating) add('reviews.aggregate_rating', null, aggregateRating, 0.8)

    // Keep raw snapshot (bounded)
    add('website.jsonld', null, { organization: org }, 0.6)
  }

  // Offers (menus, promos)
  const offers = nodes.filter((n) => {
    const t = (n?.['@type'] || n?.type || '')
    const s = Array.isArray(t) ? t.join(',') : String(t)
    return /Offer|Menu|MenuItem|Service/i.test(s)
  })
  if (offers.length > 0) {
    add('website.offers', null, offers.slice(0, 50), 0.6)
  }
  return attrs
}

function extractTitle(html: string): string | null {
  try {
    const lower = html.toLowerCase()
    const start = lower.indexOf('<title')
    if (start < 0) return null
    const gt = lower.indexOf('>', start)
    if (gt < 0) return null
    const end = lower.indexOf('</title>', gt)
    if (end < 0) return null
    const raw = html.slice(gt + 1, end).trim()
    const txt = raw.slice(0, 300)
    return txt.length > 0 ? txt : null
  } catch {
    return null
  }
}

async function fetchHtmlBestEffort(url: string): Promise<{ html: string | null; finalUrl: string | null; error?: string }> {
  const candidates: string[] = []
  const httpsFirst = preferHttps(url)
  if (httpsFirst && httpsFirst !== url) candidates.push(httpsFirst)
  if (url) candidates.push(url)
  const headers = buildUa()
  let lastErr = ''
  for (const u of candidates) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 12000)
      const res = await fetch(u, { headers, redirect: 'follow', signal: ctrl.signal })
      clearTimeout(t)
      if (!res.ok) {
        lastErr = `status_${res.status}`
        continue
      }
      const text = await res.text()
      return { html: text, finalUrl: res.url || u }
    } catch (e: any) {
      lastErr = String(e?.message || e)
      continue
    }
  }
  return { html: null, finalUrl: null, error: lastErr || 'fetch_failed' }
}

serve(async (req) => {
  const startedAt = new Date().toISOString()
  let status: 'success' | 'failed' = 'success'
  const placesKey = (() => { try { return getPlacesKey() } catch { return null } })()
  const debug: Record<string, unknown> = {}

  try {
    const p = (await req.json().catch(() => ({}))) as RunParams
    // Build Supabase client: prefer env, fallback to request-provided credentials
    const envUrl = Deno.env.get('SUPABASE_URL') || undefined
    const envKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || undefined
    const hdrAuth = req.headers.get('authorization') || ''
    const bearer = hdrAuth.toLowerCase().startsWith('bearer ') ? hdrAuth.slice(7).trim() : undefined
    const supabaseUrl = envUrl || p.supabaseUrl
    const serviceRoleKey = envKey || p.serviceRoleKey || bearer
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (provide via env or request body)')
    }
    // Two clients: public for RPCs; catalog for table reads
    const supabasePublic = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    })
    const supabaseCatalog = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
      db: { schema: 'catalog' }
    })
    const placeIds = Array.isArray(p.placeIds) ? p.placeIds.filter(Boolean) : []
    const businessIds = Array.isArray(p.businessIds) ? p.businessIds.filter(Boolean) : []
    const limit = Math.max(1, Math.min(p.sampleLimit ?? 50, 200))
    const dryRun = p.dryRun === true
    const nowIso = new Date().toISOString()
    const requireWebsite = p.requireWebsite === true
    const allowPlacesLookup = !requireWebsite

    const targets: Array<{ businessId?: string; placeId?: string; website?: string }> = []
    for (const id of placeIds.slice(0, limit)) targets.push({ placeId: id })
    for (const id of businessIds.slice(0, limit)) targets.push({ businessId: id })
    // If no explicit targets provided, sample 1 business with website for testing
    if (targets.length === 0 && requireWebsite) {
      // Use RPCs to avoid schema header issues
      const pickBiz = await supabasePublic.rpc('admin_pick_business_with_website')
      const picks = Array.isArray(pickBiz.data) ? pickBiz.data : []
      debug['catalog_businesses_pick_count'] = picks.length
      if (picks.length > 0) {
        debug['catalog_businesses_first_website'] = picks[0]?.website ?? null
        targets.push({ businessId: picks[0].id, website: picks[0].website ?? undefined })
      } else {
        const pickGpc = await supabasePublic.rpc('admin_pick_google_place_with_website')
        const gpc = Array.isArray(pickGpc.data) ? pickGpc.data : []
        debug['google_place_cache_pick_count'] = gpc.length
        if (gpc.length > 0) {
          debug['google_place_cache_first_website'] = gpc[0]?.website ?? null
          targets.push({ placeId: gpc[0].place_id, website: gpc[0].website ?? undefined })
        }
      }
    }

    let success = 0
    let failures = 0
    const errors: string[] = []
    const cacheItems: any[] = []

    for (const t of targets) {
      try {
        let businessId: string | undefined = t.businessId
        let placeId: string | undefined = t.placeId
        let website: string | undefined = t.website
        let name: string | undefined
        let formattedAddress: string | undefined
        const targetErrors: string[] = []

        if (placeId && placesKey && allowPlacesLookup) {
          const detail = await withRetries(() => fetchPlaceDetail(placesKey, placeId))
          name = detail?.displayName?.text || undefined
          formattedAddress = detail?.formattedAddress || undefined
          website = detail?.websiteUri || undefined

          if (!dryRun) {
            const rpc = await supabasePublic.rpc('upsert_business_from_ingest', {
              p_name: name ?? 'Unknown',
              p_website: website ?? null,
              p_google_place_id: detail.id,
              p_description: formattedAddress ?? null
            })
            if (rpc.error) throw rpc.error
            businessId = rpc.data as string
          }
        }

        if (!businessId && !placeId) {
          failures++;
          targetErrors.push('no_business_or_place_id')
          cacheItems.push({
            business_id: null,
            source_url: website ?? null,
            page_title: null,
            raw_html: null,
            jsonld: [],
            attrs: [],
            status: 'failed_no_target',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: targetErrors.slice(0, 5)
          })
          continue
        }

        // If still no website, try DB lookup
        if (!website && businessId) {
          // Lookup only in catalog.businesses
          const { data: bRow, error: bErr } = await supabaseCatalog
            .from('businesses')
            .select('website, google_place_id')
            .eq('id', businessId)
            .maybeSingle()
          if (!bErr && bRow) {
            website = bRow.website || undefined
            placeId = placeId || bRow.google_place_id || undefined
          }
        }
        if (!website && placeId && placesKey && allowPlacesLookup) {
          const detail = await withRetries(() => fetchPlaceDetail(placesKey, placeId))
          website = detail?.websiteUri || undefined
          name = name || detail?.displayName?.text || undefined
          formattedAddress = formattedAddress || detail?.formattedAddress || undefined
        }
        if (!website) { 
          failures++; 
          targetErrors.push('no_website')
          cacheItems.push({
            business_id: businessId ?? null,
            source_url: null,
            page_title: null,
            raw_html: null,
            jsonld: [],
            attrs: [],
            status: 'failed_no_website',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: targetErrors.slice(0, 5)
          })
          continue 
        }

        const fetched = await fetchHtmlBestEffort(website)
        const finalUrl = fetched.finalUrl ?? website
        const html = fetched.html
        if (!html) { 
          failures++; 
          targetErrors.push(`fetch_failed:${String(fetched.error || 'unknown')}`)
          cacheItems.push({
            business_id: businessId ?? null,
            source_url: finalUrl,
            page_title: null,
            raw_html: null,
            jsonld: [],
            attrs: [],
            status: 'failed_fetch',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: targetErrors.slice(0, 5)
          })
          continue 
        }
        const nodes = extractJsonLdBlocks(html)
        if (!nodes || nodes.length === 0) { 
          failures++; 
          targetErrors.push('no_jsonld')
          const pageTitle0 = extractTitle(html)
          const htmlLimited0 = html.length > 200000 ? html.slice(0, 200000) : html
          cacheItems.push({
            business_id: businessId ?? null,
            source_url: finalUrl,
            page_title: pageTitle0,
            raw_html: htmlLimited0,
            jsonld: [],
            attrs: [],
            status: 'no_jsonld',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: targetErrors.slice(0, 5)
          })
          continue 
        }
        const attrs = buildAttrsFromJsonLd(nodes, nowIso)
        if (attrs.length === 0) { 
          failures++; 
          targetErrors.push('no_attrs')
          const pageTitle1 = extractTitle(html)
          const htmlLimited1 = html.length > 200000 ? html.slice(0, 200000) : html
          cacheItems.push({
            business_id: businessId ?? null,
            source_url: finalUrl,
            page_title: pageTitle1,
            raw_html: htmlLimited1,
            jsonld: nodes.slice(0, 50),
            attrs: [],
            status: 'no_attrs',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: targetErrors.slice(0, 5)
          })
          continue 
        }

        // Always write scrape cache (even on dry run)
        try {
          const pageTitle = extractTitle(html)
          const htmlLimited = html.length > 200000 ? html.slice(0, 200000) : html
          cacheItems.push({
            business_id: businessId ?? null,
            source_url: finalUrl,
            page_title: pageTitle,
            raw_html: htmlLimited,
            jsonld: nodes.slice(0, 50),
            attrs,
            status: 'ok',
            job_name: 'business-website-extract',
            fetched_at: nowIso,
            extracted_at: nowIso,
            errors: []
          })
        } catch (_) {
          // ignore cache preparation errors (do not fail the run)
        }

        // Do not ingest into catalog.business_attributes here.
        // Attributes ingestion will be handled separately.
        success++
        await sleep(200)
      } catch (e) {
        failures++
        try { errors.push(String(e)) } catch {}
      }
    }

    // Flush cache items regardless of dryRun
    if (cacheItems.length > 0) {
      const r = await supabasePublic.rpc('admin_upsert_business_scrape_cache_batch', {
        p_items: cacheItems as unknown as Record<string, unknown>[]
      })
      if (r?.error) {
        try { errors.push(`cache_upsert: ${String(r.error.message || r.error)}`) } catch {}
      }
    }

    try {
      await supabasePublic.rpc('admin_log_job_run', {
        p_job_name: 'business-website-extract',
        p_started_at: startedAt,
        p_finished_at: new Date().toISOString(),
        p_status: status,
        p_result: { success, failures, dryRun, total: targets.length, errors: errors.slice(0, 10) } as unknown as Record<string, unknown>
      })
    } catch {
      // ignore logging errors
    }

    debug['errors'] = errors.slice(0, 10)
    return new Response(JSON.stringify({ ok: true, success, failures, total: targets.length, dryRun, debug }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    status = 'failed'
    try {
      const p = (await req.json().catch(() => ({}))) as RunParams
      const envUrl = Deno.env.get('SUPABASE_URL') || p.supabaseUrl
      const envKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || p.serviceRoleKey
      if (envUrl && envKey) {
        const clientPublic = createClient(envUrl, envKey, {
          auth: { persistSession: false },
          db: { schema: 'public' }
        })
        await clientPublic.rpc('admin_log_job_run', {
          p_job_name: 'business-website-extract',
          p_started_at: startedAt,
          p_finished_at: new Date().toISOString(),
          p_status: status,
          p_result: { error: String(e) } as unknown as Record<string, unknown>
        })
      }
    } catch {
      // ignore logging failure
    }
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})


