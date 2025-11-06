import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { getServiceClient } from '../_shared/supabaseClient.ts'

type RunParams = {
  sources?: { type: 'html' | 'rss', url: string, city?: string, retailer?: string }[]
  city?: string
  dryRun?: boolean
}

type SpecialItem = {
  source: string
  external_id: string
  title?: string | null
  description?: string | null
  price?: number | null
  currency?: string | null
  brand?: string | null
  retailer_name?: string | null
  store_name?: string | null
  city?: string | null
  url?: string | null
  image_url?: string | null
  valid_from?: string | null
  valid_to?: string | null
  raw?: Record<string, unknown>
}

function absolutize(href: string, base: string): string {
  try { return new URL(href, base).toString() } catch { return href }
}

function extractPrice(text: string): { price?: number, currency?: string } {
  const t = text || ''
  // NZD patterns like $12 or $12.99
  const m = t.match(/\$\s?(\d+(?:[.,]\d{1,2})?)/)
  if (m) {
    const raw = m[1].replace(',', '.')
    const price = Number(raw)
    if (!Number.isNaN(price)) return { price, currency: 'NZD' }
  }
  return {}
}

serve(async (req) => {
  try {
    const supabase = getServiceClient()
    const params = (await req.json().catch(() => ({}))) as RunParams
    const startedAt = new Date().toISOString()

    const sources = params.sources ?? []
    const cityDefault = params.city ?? null
    const dryRun = params.dryRun ?? true

    const out: SpecialItem[] = []

    for (const s of sources) {
      const siteUrl = s.url
      const retailer = s.retailer ?? null
      const city = s.city ?? cityDefault
      try {
        if (s.type === 'html') {
          const res = await fetch(siteUrl, { headers: { 'user-agent': 'Mozilla/5.0 LifexBot/1.0' } })
          const html = await res.text()
          // naive anchor scan
          const aRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
          const textRe = />([^<]{3,120})</
          const seen = new Set<string>()
          let m: RegExpExecArray | null
          while ((m = aRe.exec(html)) && out.length < 400) {
            const href = m[1]
            const abs = absolutize(href, siteUrl)
            if (seen.has(abs)) continue
            seen.add(abs)
            const inner = m[2]
            const txm = textRe.exec(`<x>${inner}</x>`) // cheap strip
            const title = (txm && txm[1]?.trim()) || null
            const { price, currency } = extractPrice(inner)
            // heuristics: only keep anchors that look like specials
            if (!(/deal|special|offer|save|sale|discount/i.test(inner))) continue
            out.push({
              source: `html:${new URL(siteUrl).host}`,
              external_id: abs,
              title,
              description: null,
              price: price ?? null,
              currency: currency ?? null,
              brand: null,
              retailer_name: retailer,
              store_name: null,
              city: city ?? null,
              url: abs,
              image_url: null,
              raw: { from: siteUrl }
            })
          }
        } else if (s.type === 'rss') {
          const res = await fetch(siteUrl)
          const xml = await res.text()
          const itemRe = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?(?:<description>([\s\S]*?)<\/description>)?[\s\S]*?<\/item>/gi
          let m: RegExpExecArray | null
          while ((m = itemRe.exec(xml)) && out.length < 400) {
            const title = m[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || null
            const link = m[2]?.trim()
            const desc = (m[3]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim()) || null
            const { price, currency } = extractPrice(`${title} ${desc}`)
            out.push({
              source: `rss:${new URL(siteUrl).host}`,
              external_id: link,
              title,
              description: desc,
              price: price ?? null,
              currency: currency ?? null,
              brand: null,
              retailer_name: retailer,
              store_name: null,
              city: city ?? null,
              url: link,
              image_url: null,
              raw: { from: siteUrl }
            })
          }
        }
      } catch (_) {
        // ignore single source failures
      }
    }

    let scraped = out.length
    if (!dryRun && scraped > 0) {
      const { error } = await supabase.rpc('admin_upsert_special_scrape_cache_batch', { p_items: out as unknown as Record<string, unknown>[] })
      if (error) throw new Error(error.message)
    }

    await supabase.from('ops.job_runs').insert({
      job_key: 'specials-scrape',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      params: params as unknown as Record<string, unknown>,
      success_count: scraped,
      failure_count: 0,
      status: 'success'
    })

    return new Response(JSON.stringify({ ok: true, scraped, dryRun: dryRun }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})



