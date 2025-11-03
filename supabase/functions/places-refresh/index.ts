// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { getServiceClient } from '../_shared/supabaseClient.ts'

type RunParams = {
  city?: string
  radiusMeters?: number
  category?: string // e.g., 'restaurant', 'cafe'
  maxPages?: number // safety cap for pagination
  pageSize?: number
  dryRun?: boolean
  // New: advanced filters
  categories?: string[]
  priceLevels?: number[] // 0-4
  minRating?: number
  minUserRatings?: number
  maxTotal?: number // stop after N successes
  // Capture-all vs filtered ingest (default capture-all)
  applyFilters?: boolean
}

type LatLng = { latitude: number; longitude: number }

const CITY_CENTER: Record<string, LatLng> = {
  Auckland: { latitude: -36.8485, longitude: 174.7633 },
  Wellington: { latitude: -41.2865, longitude: 174.7762 },
  Christchurch: { latitude: -43.5321, longitude: 172.6362 }
}

const PLACES_BASE = 'https://places.googleapis.com/v1'

function getApiKey(): string {
  const key = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!key) throw new Error('Missing GOOGLE_PLACES_API_KEY')
  return key
}

function mapPriceLevel(v: unknown): number | null {
  if (typeof v !== 'string') return null
  // Map Places API (New) enums to numeric levels similar to legacy 0-4
  // FREE(0), INEXPENSIVE(1), MODERATE(2), EXPENSIVE(3), VERY_EXPENSIVE(4)
  if (v.includes('FREE')) return 0
  if (v.includes('VERY_EXPENSIVE')) return 4
  if (v.includes('EXPENSIVE')) return 3
  if (v.includes('MODERATE')) return 2
  if (v.includes('INEXPENSIVE')) return 1
  if (v.includes('UNSPECIFIED')) return null
  return null
}

async function searchNearby(params: {
  key: string
  center: LatLng
  radius: number
  includedTypes?: string[]
  pageSize: number
  pageToken?: string
}) {
  const body: Record<string, unknown> = {
    includedTypes: params.includedTypes,
    maxResultCount: params.pageSize,
    locationRestriction: {
      circle: {
        center: { latitude: params.center.latitude, longitude: params.center.longitude },
        radius: params.radius
      }
    }
  }
  if (params.pageToken) body.pageToken = params.pageToken

  const res = await fetch(`${PLACES_BASE}/places:searchNearby`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-Goog-Api-Key': params.key,
      // FieldMask only supports fields under `places.*` for this endpoint
      'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.types'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    console.error('searchNearby error', res.status, txt)
    throw new Error(`searchNearby ${res.status} ${txt}`)
  }
  return await res.json() as { places?: Array<{ id: string }>; nextPageToken?: string }
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
        'shortFormattedAddress',
        'adrFormatAddress',
        'addressComponents',
        'internationalPhoneNumber',
        'nationalPhoneNumber',
        'websiteUri',
        'googleMapsUri',
        'plusCode',
        'priceLevel',
        'rating',
        'userRatingCount',
        'currentOpeningHours',
        'regularOpeningHours',
        'utcOffsetMinutes',
        'location',
        'types',
        'primaryType',
        'primaryTypeDisplayName',
        'businessStatus',
        'reviews.name',
        // Reviews (atmosphere tier); kept minimal for payload
        'reviews.text',
        'reviews.rating',
        'reviews.authorAttribution',
        'reviews.publishTime',
        'editorialSummary',
        // Capability & amenities
        'dineIn',
        'delivery',
        'takeout',
        'curbsidePickup',
        'reservable',
        'servesBreakfast',
        'servesLunch',
        'servesDinner',
        'servesBeer',
        'servesWine',
        'servesCocktails',
        'servesVegetarianFood',
        'goodForChildren',
        'goodForGroups',
        'outdoorSeating',
        'liveMusic',
        'restroom',
        'menuForChildren',
        'accessibilityOptions',
        'paymentOptions',
        'parkingOptions',
        'photos.name',
        'photos.widthPx',
        'photos.heightPx',
        'photos.authorAttributions'
      ].join(',')
    }
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    console.error('place detail error', res.status, txt)
    throw new Error(`place detail ${res.status} ${txt}`)
  }
  return await res.json()
}

serve(async (req) => {
  let supabase: any | null = null
  const startedAt = new Date().toISOString()
  let success = 0
  let failures = 0
  let skipped = 0
  const errors: string[] = []
  let errorMsg: string | null = null

  try {
    const p = (await req.json().catch(() => ({}))) as RunParams
    const city = p.city && CITY_CENTER[p.city] ? p.city : 'Auckland'
    const center = CITY_CENTER[city]
    const radius = p.radiusMeters ?? 3000
    const pageSize = Math.min(Math.max(p.pageSize ?? 20, 1), 20) // API limit: 1..20
    const maxPages = Math.min(Math.max(p.maxPages ?? 1, 1), 5)
    const includedTypes = Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : (p.category ? [p.category] : undefined)
    const key = getApiKey()
    const applyFilters = p.applyFilters === true

    console.log('places-refresh start', {
      city,
      center,
      radius,
      pageSize,
      maxPages,
      includedTypes,
      dryRun: !!p.dryRun,
      hasKey: Boolean(key && key.length > 5)
    })

    let pageToken: string | undefined = undefined
    for (let page = 0; page < maxPages; page++) {
      const nearby = await withRetries(() => searchNearby({ key, center, radius, includedTypes, pageSize, pageToken }))
      const ids = (nearby.places ?? []).map((pl: any) => pl.id).filter(Boolean)
      if (ids.length === 0) break

      for (const id of ids) {
        try {
          const detail = await withRetries(() => fetchPlaceDetail(key, id))

          // Extract reviews for analysis; keep reviews in raw cache for backoffice analytics
          const reviews: any[] = Array.isArray((detail as any).reviews) ? (detail as any).reviews : []

          const name: string | undefined = detail.displayName?.text ?? detail.displayName ?? undefined
          const website: string | undefined = detail.websiteUri ?? undefined
          const description: string | undefined = detail.formattedAddress ?? undefined

          // Optional filtering (disabled by default during initial capture phase)
          if (applyFilters) {
            const priceLevelNum = mapPriceLevel(detail.priceLevel)
            const ratingNum: number | undefined = typeof detail.rating === 'number' ? detail.rating : undefined
            const userRatings: number | undefined = typeof detail.userRatingCount === 'number' ? detail.userRatingCount : undefined
            if (Array.isArray(p.priceLevels) && p.priceLevels.length > 0) {
              if (priceLevelNum === null || !p.priceLevels.includes(priceLevelNum)) {
                skipped++; continue
              }
            }
            if (typeof p.minRating === 'number' && ratingNum !== undefined && ratingNum < p.minRating) {
              skipped++; continue
            }
            if (typeof p.minUserRatings === 'number' && userRatings !== undefined && userRatings < p.minUserRatings) {
              skipped++; continue
            }
          }

          if (!p.dryRun) {
            if (!supabase) {
              supabase = getServiceClient()
            }
            // 1) ensure business exists/updated
            const rpc = await supabase.rpc('upsert_business_from_ingest', {
              p_name: name ?? 'Unknown',
              p_website: website ?? null,
              p_google_place_id: detail.id,
              p_description: description ?? null
            })
            if (rpc.error) throw rpc.error
            const businessId: string = rpc.data

            // 2) upsert google_place_cache via RPC (public schema)
            const rpcCache = await supabase.rpc('admin_upsert_google_place_cache', {
              p_business_id: businessId,
              p_place_id: detail.id,
              p_name: name ?? null,
              p_formatted_address: detail.formattedAddress ?? null,
              p_international_phone_number: detail.internationalPhoneNumber ?? null,
              p_website: website ?? null,
              p_price_level: mapPriceLevel(detail.priceLevel),
              p_rating: detail.rating ?? null,
              p_user_ratings_total: detail.userRatingCount ?? null,
              p_opening_hours: detail.currentOpeningHours ?? null,
              p_geometry: detail.location ?? null,
              p_raw: detail
            })
            if (rpcCache.error) throw rpcCache.error

            // 3) insert photos meta (best-effort)
            const photos: any[] = Array.isArray(detail.photos) ? detail.photos : []
            if (photos.length > 0) {
              const rows = photos.slice(0, 10).map((ph) => ({
                photo_reference: ph.name ?? null,
                width: ph.widthPx ?? null,
                height: ph.heightPx ?? null,
                attributions: ph.authorAttributions ?? null
              }))
              const rpcPhotos = await supabase.rpc('admin_insert_place_photos_meta_batch', {
                p_business_id: businessId,
                p_photos: rows
              })
              if (rpcPhotos.error) {
                console.warn('photo batch warn', rpcPhotos.error)
              }
            }

            // 4) Upsert derived attributes (reviews + capabilities + address/phone/primary type)
            try {
              const nowIso = new Date().toISOString()
              const attrs: Array<{ name: string; value: string | null; value_json: any; source: string; confidence: number; extracted_at: string }> = []

              // Base identifiers and contact
              if (typeof detail.primaryType === 'string') attrs.push({ name: 'primary_type', value: detail.primaryType, value_json: null, source: 'google', confidence: 0.95, extracted_at: nowIso })
              if (detail.primaryTypeDisplayName?.text) attrs.push({ name: 'primary_type_display', value: detail.primaryTypeDisplayName.text, value_json: null, source: 'google', confidence: 0.95, extracted_at: nowIso })
              if (typeof detail.nationalPhoneNumber === 'string') attrs.push({ name: 'contact.phone_national', value: detail.nationalPhoneNumber, value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
              if (typeof detail.utcOffsetMinutes === 'number') attrs.push({ name: 'utc_offset_minutes', value: String(detail.utcOffsetMinutes), value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
              if (detail.editorialSummary?.overview) attrs.push({ name: 'editorial.overview', value: detail.editorialSummary.overview, value_json: null, source: 'google', confidence: 0.8, extracted_at: nowIso })

              // Address & codes
              if (detail.shortFormattedAddress) attrs.push({ name: 'address.short', value: detail.shortFormattedAddress, value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
              if (detail.adrFormatAddress) attrs.push({ name: 'address.adr', value: detail.adrFormatAddress, value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
              if (detail.addressComponents) attrs.push({ name: 'address.components', value: null, value_json: detail.addressComponents, source: 'google', confidence: 0.9, extracted_at: nowIso })
              if (detail.plusCode) attrs.push({ name: 'address.plus_code', value: null, value_json: detail.plusCode, source: 'google', confidence: 0.9, extracted_at: nowIso })

              // Capabilities & amenities (booleans)
              const boolPairs: Array<[string, any]> = [
                ['cap.dine_in', detail.dineIn],
                ['cap.delivery', detail.delivery],
                ['cap.takeout', detail.takeout],
                ['cap.curbside_pickup', detail.curbsidePickup],
                ['cap.reservable', detail.reservable],
                ['serves.breakfast', detail.servesBreakfast],
                ['serves.lunch', detail.servesLunch],
                ['serves.dinner', detail.servesDinner],
                ['serves.beer', detail.servesBeer],
                ['serves.wine', detail.servesWine],
                ['serves.cocktails', detail.servesCocktails],
                ['serves.vegetarian_food', detail.servesVegetarianFood],
                ['ambience.good_for_children', detail.goodForChildren],
                ['ambience.good_for_groups', detail.goodForGroups],
                ['ambience.outdoor_seating', detail.outdoorSeating],
                ['ambience.live_music', detail.liveMusic],
                ['amenities.restroom', detail.restroom],
                ['amenities.menu_for_children', detail.menuForChildren]
              ]
              for (const [name, v] of boolPairs) {
                if (typeof v === 'boolean') attrs.push({ name, value: String(v), value_json: null, source: 'google', confidence: 0.85, extracted_at: nowIso })
              }
              if (detail.accessibilityOptions) attrs.push({ name: 'accessibility.options', value: null, value_json: detail.accessibilityOptions, source: 'google', confidence: 0.85, extracted_at: nowIso })
              if (detail.paymentOptions) attrs.push({ name: 'payment.options', value: null, value_json: detail.paymentOptions, source: 'google', confidence: 0.85, extracted_at: nowIso })
              if (detail.parkingOptions) attrs.push({ name: 'parking.options', value: null, value_json: detail.parkingOptions, source: 'google', confidence: 0.85, extracted_at: nowIso })

              // Reviews-derived metrics
              if (reviews.length > 0) {
                const sampleCount = reviews.length
                const avgRating = (() => {
                  const nums = reviews.map((r: any) => Number(r?.rating)).filter((n: any) => !Number.isNaN(n))
                  if (nums.length === 0) return null
                  const s = nums.reduce((a: number, b: number) => a + b, 0)
                  return Number((s / nums.length).toFixed(2))
                })()
                const lastPublishTime = (() => {
                  const times = reviews.map((r: any) => r?.publishTime).filter(Boolean)
                  return times.length > 0 ? new Date(Math.max(...times.map((t: any) => Date.parse(t)))).toISOString() : null
                })()
                attrs.push({ name: 'reviews.google.sample_count', value: String(sampleCount), value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
                if (avgRating !== null) attrs.push({ name: 'reviews.sentiment.avg_rating', value: String(avgRating), value_json: null, source: 'google', confidence: 0.9, extracted_at: nowIso })
                if (lastPublishTime) attrs.push({ name: 'reviews.last_seen_at', value: lastPublishTime, value_json: null, source: 'google', confidence: 0.8, extracted_at: nowIso })

                // Persist reviews sample for backoffice analytics (server-only)
                try {
                  const rpcRev = await supabase.rpc('admin_upsert_google_place_reviews_batch', {
                    p_business_id: businessId,
                    p_place_id: detail.id,
                    p_reviews: reviews
                  })
                  if (rpcRev.error) throw rpcRev.error
                } catch (e2) {
                  console.warn('reviews batch upsert warn', e2)
                }
              }

              if (attrs.length > 0) {
                const rpcAttrs = await supabase.rpc('admin_upsert_business_attributes_batch', {
                  p_business_id: businessId,
                  p_attrs: attrs
                })
                if (rpcAttrs.error) throw rpcAttrs.error
              }
            } catch (e) {
              console.warn('attributes upsert warn', e)
            }

            // 5) Materialize location and hours from cache (event-driven backfill)
            try {
              const m1 = await supabase.rpc('admin_backfill_location_from_cache', { p_business_id: businessId })
              if (m1.error) console.warn('backfill location warn', m1.error)
            } catch (e3) {
              console.warn('backfill location error', e3)
            }
            try {
              const m2 = await supabase.rpc('admin_backfill_hours_from_cache', { p_business_id: businessId })
              if (m2.error) console.warn('backfill hours warn', m2.error)
            } catch (e4) {
              console.warn('backfill hours error', e4)
            }
          }

          success++
          if (typeof p.maxTotal === 'number' && p.maxTotal > 0 && success >= p.maxTotal) {
            pageToken = undefined
            break
          }
        } catch (e) {
          console.error('detail failure', e)
          try {
            errors.push(String(e))
          } catch (_) {}
          failures++
        }
      }

      pageToken = (nearby as any).nextPageToken
      if (!pageToken) break
      // Small delay to respect token readiness and QPS
      await sleep(800) // token readiness + QPS
    }
  } catch (e) {
    errorMsg = String(e)
    console.error('places-refresh top-level error', errorMsg)
    try { errors.push(errorMsg) } catch (_) {}
  }

  // record job run via RPC (best-effort)
  if (supabase) {
    try {
      const finishedAt = new Date().toISOString()
      const status = errorMsg ? 'failed' : 'success'
      const jobName = `places-refresh:${(errors[0]?.city ?? '')}` // placeholder; we will include params in result
      const result = {
        success,
        failures,
        errors: errors.slice(0, 10)
      }
      await supabase.rpc('admin_log_job_run', {
        p_job_name: 'places-refresh',
        p_started_at: startedAt,
        p_finished_at: finishedAt,
        p_status: status,
        p_result: result
      })
    } catch (_) {
      // ignore
    }
  }

  if (errorMsg) {
    return new Response(JSON.stringify({ ok: false, success, failures, skipped, error: errorMsg, errors: errors.slice(0, 10) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
  return new Response(JSON.stringify({ ok: true, success, failures, skipped, errors: errors.slice(0, 10) }), {
    headers: { 'content-type': 'application/json' }
  })
})

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withRetries<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let attempt = 0
  let lastErr: any
  while (attempt < maxAttempts) {
    try {
      return await fn()
    } catch (e: any) {
      lastErr = e
      attempt++
      // simple backoff: 400ms, 800ms, 1600ms ...
      const delay = 400 * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
  throw lastErr
}


