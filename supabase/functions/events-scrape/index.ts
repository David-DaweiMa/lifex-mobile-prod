import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// DOM parser for HTML selector-based extraction (WASM build works on Edge Runtime)
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import { getServiceClient } from '../_shared/supabaseClient.ts'

type RunParams = {
  source?: 'eventfinda' | 'free-ics' | 'html-extract' | string
  city?: string
  windowDays?: number
  pageSize?: number
  maxPages?: number
  dryRun?: boolean
  feedUrls?: string[]
  html?: {
    listingUrls?: string[]
    urlBase?: string
    // Optional simple patterns. If provided, these will be used for extraction.
    // itemPattern should capture blocks; then title/url/date/venue patterns are applied per block.
    itemPattern?: string
    titlePattern?: string
    urlPattern?: string
    datePattern?: string
    venuePattern?: string
    // Optional DOM selector-based extraction (takes precedence if provided)
    itemSelector?: string
    titleSelector?: string
    urlSelector?: string
    dateSelector?: string
    venueSelector?: string
  }
}

type ScrapeItem = {
  source: string
  external_id: string
  title?: string
  description?: string
  starts_at?: string
  ends_at?: string
  timezone?: string
  venue_name?: string
  city?: string
  url?: string
  raw: unknown
}

async function fetchEventfinda(params: Required<Pick<RunParams, 'city' | 'windowDays' | 'pageSize' | 'maxPages'>>): Promise<ScrapeItem[]> {
  const baseUrl = Deno.env.get('EVENTFINDA_BASE_URL') || 'https://api.eventfinda.co.nz/v2/events.json'
  const auth = Deno.env.get('EVENTFINDA_AUTH') // e.g., 'Basic <base64>'
  if (!auth) return []

  const items: ScrapeItem[] = []
  const now = new Date()
  const until = new Date(now.getTime() + params.windowDays * 86400000)

  for (let page = 1; page <= params.maxPages; page++) {
    const url = new URL(baseUrl)
    // Conservative query params (exact API may differ; adjust when configuring)
    url.searchParams.set('rows', String(params.pageSize))
    url.searchParams.set('page', String(page))
    if (params.city) url.searchParams.set('q', params.city)
    url.searchParams.set('order', 'date')

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth, Accept: 'application/json' }
    })
    if (!res.ok) break
    const json = await res.json().catch(() => null) as any
    const arr: any[] = (json?.events || json?.results || []) as any[]
    if (!Array.isArray(arr) || arr.length === 0) break

    for (const ev of arr) {
      const startIso: string | undefined = ev?.datetime_start || ev?.start || ev?.starts_at
      const startDate = startIso ? new Date(startIso) : undefined
      if (startDate && startDate > until) continue
      items.push({
        source: 'eventfinda',
        external_id: String(ev?.id ?? ev?.guid ?? ev?.url ?? crypto.randomUUID()),
        title: ev?.name || ev?.title,
        description: ev?.description || ev?.summary,
        starts_at: startIso,
        ends_at: ev?.datetime_end || ev?.end || ev?.ends_at,
        timezone: ev?.timezone || 'Pacific/Auckland',
        venue_name: ev?.venue?.name || ev?.venue?.title,
        city: ev?.location?.city || ev?.venue?.city || ev?.city,
        url: ev?.url,
        raw: ev
      })
    }
  }
  return items
}

// --- Generic helpers ---
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function fetchWithRetry(url: string, init: RequestInit = {}, attempts = 3, baseDelayMs = 300): Promise<Response> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      lastErr = new Error(`HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }
    const delay = baseDelayMs * Math.pow(2, i)
    await sleep(delay)
  }
  throw lastErr
}

// --- Minimal ICS parser (VEVENT only) ---
function parseIcsDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  // Handle forms like 20250131T190000Z or 20250131T190000
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (m) {
    const [, y, mo, d, h, mi, s, z] = m
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}${z ? 'Z' : ''}`
    return new Date(iso).toISOString()
  }
  // All-day events like 20250131
  const d = value.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (d) {
    const [, y, mo, dd] = d
    return new Date(`${y}-${mo}-${dd}T00:00:00Z`).toISOString()
  }
  // Fallback: try Date parse
  const dt = new Date(value)
  return isNaN(dt.getTime()) ? undefined : dt.toISOString()
}

function parseICS(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const events: Array<Record<string, string>> = []
  let curr: Record<string, string> | null = null
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (line.startsWith('BEGIN:VEVENT')) {
      curr = {}
      continue
    }
    if (line.startsWith('END:VEVENT')) {
      if (curr) events.push(curr)
      curr = null
      continue
    }
    if (!curr) continue
    // Handle folded lines (RFC5545): lines starting with space are continuations
    while (i + 1 < lines.length && /^\s/.test(lines[i + 1])) {
      line += lines[++i].slice(1)
    }
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const propPart = line.slice(0, sep)
    const val = line.slice(sep + 1)
    const name = propPart.split(';', 1)[0].toUpperCase()
    curr[name] = val
  }
  return events
}

async function fetchICSFeeds(params: { feedUrls: string[]; windowDays: number }): Promise<ScrapeItem[]> {
  const items: ScrapeItem[] = []
  const now = new Date()
  const until = new Date(now.getTime() + params.windowDays * 86400000)
  const seen = new Set<string>()

  for (const feedUrl of params.feedUrls) {
    try {
      const res = await fetchWithRetry(feedUrl, { headers: { Accept: 'text/calendar,text/plain,*/*' } }, 3, 250)
      const text = await res.text()
      const events = parseICS(text)
      const host = (() => { try { return new URL(feedUrl).host } catch { return 'ics' } })()

      for (const ev of events) {
        const uid = ev['UID'] || `${feedUrl}#${ev['DTSTART'] || crypto.randomUUID()}`
        if (seen.has(uid)) continue
        seen.add(uid)

        const startsIso = parseIcsDate(ev['DTSTART'])
        const endsIso = parseIcsDate(ev['DTEND'])
        const startDate = startsIso ? new Date(startsIso) : undefined
        if (startDate && startDate > until) continue

        items.push({
          source: `ics:${host}`,
          external_id: uid,
          title: ev['SUMMARY'] || undefined,
          description: ev['DESCRIPTION'] || undefined,
          starts_at: startsIso,
          ends_at: endsIso,
          timezone: 'Pacific/Auckland',
          venue_name: ev['LOCATION'] || undefined,
          city: undefined,
          url: ev['URL'] || undefined,
          raw: ev
        })
      }
    } catch (_e) {
      // swallow per-feed errors; they will be reflected in job result counters
    }
    await sleep(300)
  }
  return items
}

// --- Generic HTML extractor (lightweight, regex-based) ---
function safeBuildRegex(pattern?: string, flags = 'gi'): RegExp | null {
  if (!pattern) return null
  try { return new RegExp(pattern, flags) } catch { return null }
}

function htmlDecode(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function absolutizeUrl(href: string, base?: string): string {
  if (!href) return href
  if (/^https?:\/\//i.test(href)) return href
  if (href.startsWith('//')) return 'https:' + href
  if (!base) return href
  try { return new URL(href, base).toString() } catch { return href }
}

async function fetchHtmlExtract(params: Required<Pick<RunParams, 'windowDays'>> & { html: NonNullable<RunParams['html']> }): Promise<ScrapeItem[]> {
  const { html, windowDays } = params
  const listingUrls = Array.isArray(html.listingUrls) ? html.listingUrls.filter(Boolean) : []
  if (listingUrls.length === 0) return []

  const itemRe = safeBuildRegex(html.itemPattern || '<a[^>]+href=\"[^\"]+\"[\s\S]*?<\/a>')
  const titleRe = safeBuildRegex(html.titlePattern || '>([^<]{3,200})<')
  const urlRe = safeBuildRegex(html.urlPattern || 'href=\"([^\"]+)\"')
  const dateRe = safeBuildRegex(html.datePattern || '(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}-\d{2}-\d{2})')
  const venueRe = safeBuildRegex(html.venuePattern || '(?:Venue|Location)[:\s]*([^<\n\r]{3,120})')

  const items: ScrapeItem[] = []
  const now = new Date()
  const until = new Date(now.getTime() + windowDays * 86400000)
  const seen = new Set<string>()

  for (const url of listingUrls) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'text/html,*/*' } })
      if (!res.ok) { await sleep(200); continue }
      const htmlText = await res.text()
      // DOM selector path (preferred if selectors provided)
      if (html.itemSelector || html.titleSelector || html.urlSelector || html.dateSelector || html.venueSelector) {
        try {
          const doc = new DOMParser().parseFromString(htmlText, 'text/html') as any
          if (doc) {
            const nodeList = html.itemSelector ? doc.querySelectorAll(html.itemSelector) : []
            const nodeArray = Array.from(nodeList || []) as any[]
            for (const node of nodeArray) {
              const titleNode = html.titleSelector ? node.querySelector(html.titleSelector) : node.querySelector('a, h3, h2')
              const hrefNode = html.urlSelector ? node.querySelector(html.urlSelector) : node.querySelector('a[href]')
              const dateNode = html.dateSelector ? node.querySelector(html.dateSelector) : node.querySelector('time,[datetime]')
              const venueNode = html.venueSelector ? node.querySelector(html.venueSelector) : null

              const title = titleNode?.textContent?.trim() || ''
              const href = hrefNode?.getAttribute?.('href') || ''
              const dateStr = dateNode?.getAttribute?.('datetime') || dateNode?.textContent?.trim() || ''
              const venue = venueNode?.textContent?.trim() || undefined

              if (!title && !href) continue
              const absUrl = absolutizeUrl(href, html.urlBase || url)
              const uid = absUrl || (title + dateStr)
              if (!uid || seen.has(uid)) continue

              let startsIso: string | undefined
              if (dateStr) {
                const parsed = Date.parse(dateStr)
                if (!isNaN(parsed)) startsIso = new Date(parsed).toISOString()
              }
              if (startsIso) {
                const sd = new Date(startsIso)
                if (sd > until) { seen.add(uid); continue }
              }

              items.push({
                source: 'html:dom',
                external_id: uid,
                title: title || undefined,
                description: undefined,
                starts_at: startsIso,
                ends_at: undefined,
                timezone: 'Pacific/Auckland',
                venue_name: venue,
                city: undefined,
                url: absUrl || undefined,
                raw: undefined
              })
              seen.add(uid)
              if (items.length >= 300) break
            }
          }
        } catch (_) {
          // continue to regex fallbacks
        }
      }

      if (!itemRe) continue
      let blocks = htmlText.match(itemRe) || []

      for (const block of blocks) {
        const href = urlRe ? (urlRe.exec(block)?.[1] || '') : ''
        const title = titleRe ? htmlDecode(titleRe.exec(block)?.[1]?.trim() || '') : ''
        const dateStr = dateRe ? dateRe.exec(block)?.[1] : undefined
        const venue = venueRe ? venueRe.exec(block)?.[1]?.trim() : undefined

        const absUrl = absolutizeUrl(href, html.urlBase || url)
        const uid = absUrl || (title + (dateStr || ''))
        if (!uid || seen.has(uid)) continue

        let startsIso: string | undefined
        if (dateStr) {
          const parsed = Date.parse(dateStr)
          if (!isNaN(parsed)) startsIso = new Date(parsed).toISOString()
        }
        if (startsIso) {
          const sd = new Date(startsIso)
          if (sd > until) continue
        }

        items.push({
          source: 'html:generic',
          external_id: uid,
          title: title || undefined,
          description: undefined,
          starts_at: startsIso,
          ends_at: undefined,
          timezone: 'Pacific/Auckland',
          venue_name: venue,
          city: undefined,
          url: absUrl || undefined,
          raw: { block }
        })
        seen.add(uid)
      }

      // Fallback A: scan anchors with nearby date context if no blocks extracted
      if (blocks.length === 0) {
        const anchorRe = /<a[^>]+href=\"([^\"]+)\"[^>]*>([\s\S]{0,200}?)<\/a>/gi
        let m: RegExpExecArray | null
        // use exec loop to access index on global regex
        while ((m = anchorRe.exec(htmlText)) !== null) {
          const href = m[1]
          const inner = m[2] || ''
          const title = htmlDecode(inner.replace(/<[^>]+>/g, '').trim()).slice(0, 200)
          // look back 200 chars for a date pattern
          const start = Math.max(0, (m.index || 0) - 200)
          const ctx = htmlText.slice(start, m.index || 0) + inner
          const dtm = dateRe ? dateRe.exec(ctx) : null
          if (!title) continue

          const absUrl = absolutizeUrl(href, html.urlBase || url)
          const uid = absUrl || (title + (dtm?.[1] || ''))
          if (!uid || seen.has(uid)) continue

          let startsIso: string | undefined
          if (dtm?.[1]) {
            const parsed = Date.parse(dtm[1])
            if (!isNaN(parsed)) startsIso = new Date(parsed).toISOString()
          }
          if (startsIso) {
            const sd = new Date(startsIso)
            if (sd > until) { seen.add(uid); continue }
          }

          items.push({
            source: 'html:generic',
            external_id: uid,
            title: title || undefined,
            description: undefined,
            starts_at: startsIso,
            ends_at: undefined,
            timezone: 'Pacific/Auckland',
            venue_name: undefined,
            city: undefined,
            url: absUrl || undefined,
            raw: { anchor: m[0] }
          })
          seen.add(uid)
        }
      }

      // Fallback B: collect anchors that look like event detail links (pattern-based), even without date
      if (items.length === 0) {
        const host = (() => { try { return new URL(url).host } catch { return '' } })()
        const pathHint = host.includes('ourauckland') ? '/events/'
          : host.includes('aucklandlive.co.nz') ? '/shows/'
          : host.includes('aucklandmuseum') ? '/visit/whatson/'
          : '/events'

        const anchorRe2 = /<a[^>]+href=\"([^\"]+)\"[^>]*>([\s\S]{0,200}?)<\/a>/gi
        let m2: RegExpExecArray | null
        const collected: ScrapeItem[] = []
        while ((m2 = anchorRe2.exec(htmlText)) !== null) {
          const href = m2[1]
          const inner = m2[2] || ''
          const title = htmlDecode(inner.replace(/<[^>]+>/g, '').trim())
          if (!href || !title || title.length < 3) continue
          const absUrl = absolutizeUrl(href, html.urlBase || url)
          try {
            const u = new URL(absUrl)
            if (!u.pathname || !u.pathname.toLowerCase().includes(pathHint)) continue
          } catch { continue }

          const uid = absUrl
          if (seen.has(uid)) continue
          collected.push({
            source: 'html:generic',
            external_id: uid,
            title,
            description: undefined,
            starts_at: undefined,
            ends_at: undefined,
            timezone: 'Pacific/Auckland',
            venue_name: undefined,
            city: undefined,
            url: absUrl,
            raw: { anchor: m2[0] }
          })
          seen.add(uid)
          if (collected.length >= 100) break
        }
        if (collected.length > 0) {
          items.push(...collected)
        }
      }

      // Fallback C: JSON-LD Event extraction
      if (items.length === 0) {
        const scriptRe = /<script[^>]+type=\"application\/ld\+json\"[^>]*>([\s\S]*?)<\/script>/gi
        let sm: RegExpExecArray | null
        const collected: ScrapeItem[] = []
        while ((sm = scriptRe.exec(htmlText)) !== null) {
          const jsonText = sm[1]
          try {
            const data = JSON.parse(jsonText)
            const candidates = Array.isArray(data) ? data : [data]
            for (const node of candidates) {
              if (!node) continue
              // Some pages wrap graph in @graph
              const graph = Array.isArray(node['@graph']) ? node['@graph'] : [node]
              for (const g of graph) {
                const type = (g['@type'] || g['type'] || '').toString()
                if (!/Event/i.test(type)) continue
                const name = (g['name'] || '').toString()
                const startDate = (g['startDate'] || g['start_time'] || '').toString()
                const endDate = (g['endDate'] || g['end_time'] || '').toString()
                const urlProp = (g['url'] || g['@id'] || '').toString()
                const loc = g['location']
                const venueName = loc && typeof loc === 'object' ? (loc['name'] || '').toString() : undefined

                if (!name && !urlProp) continue
                const absUrl = absolutizeUrl(urlProp, html.urlBase || url)
                const uid = absUrl || (name + startDate)
                if (!uid || seen.has(uid)) continue

                let startsIso: string | undefined
                if (startDate) {
                  const parsed = Date.parse(startDate)
                  if (!isNaN(parsed)) startsIso = new Date(parsed).toISOString()
                }
                if (startsIso) {
                  const sd = new Date(startsIso)
                  if (sd > until) { seen.add(uid); continue }
                }

                collected.push({
                  source: 'html:jsonld',
                  external_id: uid,
                  title: name || undefined,
                  description: undefined,
                  starts_at: startsIso,
                  ends_at: endDate ? new Date(endDate).toISOString() : undefined,
                  timezone: 'Pacific/Auckland',
                  venue_name: venueName,
                  city: undefined,
                  url: absUrl || undefined,
                  raw: g
                })
                seen.add(uid)
                if (collected.length >= 200) break
              }
              if (collected.length >= 200) break
            }
          } catch {
            // ignore malformed JSON-LD blocks
          }
          if (collected.length >= 200) break
        }
        if (collected.length > 0) {
          items.push(...collected)
        }
      }
    } catch (_) {
      // ignore page-level errors
    }
    await sleep(350)
  }
  return items
}

serve(async (req) => {
  const supabase = getServiceClient()
  const startedAt = new Date().toISOString()
  let status: 'success' | 'failed' = 'success'
  let result: Record<string, unknown> = {}

  try {
    const params = (await req.json().catch(() => ({}))) as RunParams
    const source = params.source ?? 'eventfinda'
    const city = params.city?.trim() || ''
    const windowDays = params.windowDays ?? 60
    const pageSize = Math.min(Math.max(params.pageSize ?? 50, 1), 200)
    const maxPages = Math.min(Math.max(params.maxPages ?? 2, 1), 20)
    const dryRun = params.dryRun ?? false
    const feedUrls = Array.isArray(params.feedUrls) ? params.feedUrls.filter(Boolean) : []

    let items: ScrapeItem[] = []
    if (source === 'eventfinda') {
      items = await fetchEventfinda({ city, windowDays, pageSize, maxPages })
    } else if (source === 'free-ics') {
      if (feedUrls.length > 0) {
        items = await fetchICSFeeds({ feedUrls, windowDays })
      } else {
        items = []
      }
    }

    if (dryRun) {
      result = { source, city, windowDays, pageSize, maxPages, scraped: items.length, dryRun: true }
    } else {
      if (items.length > 0) {
        const { error } = await supabase.rpc('admin_upsert_event_scrape_cache_batch', {
          p_items: items as unknown as Record<string, unknown>[]
        })
        if (error) throw error
      }
      result = { source, city, windowDays, pageSize, maxPages, scraped: items.length, dryRun: false }
    }

    await supabase.rpc('admin_log_job_run', {
      p_job_name: 'events-scrape',
      p_started_at: startedAt,
      p_finished_at: new Date().toISOString(),
      p_status: status,
      p_result: result as unknown as Record<string, unknown>
    })

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    status = 'failed'
    result = { error: String(e) }
    await supabase.rpc('admin_log_job_run', {
      p_job_name: 'events-scrape',
      p_started_at: startedAt,
      p_finished_at: new Date().toISOString(),
      p_status: status,
      p_result: result as unknown as Record<string, unknown>
    }).catch(() => null)

    return new Response(JSON.stringify({ ok: false, ...result }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})



