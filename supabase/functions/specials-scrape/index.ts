import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { getServiceClient } from '../_shared/supabaseClient.ts'

type RunParams = {
  source?: string
  city?: string
  siteUrl?: string
  dryRun?: boolean
}

serve(async (req) => {
  try {
    const supabase = getServiceClient()
    const params = (await req.json().catch(() => ({}))) as RunParams
    const startedAt = new Date().toISOString()

    // TODO: implement scraping logic per source; write to catalog.special_scrape_cache
    const scraped = 0

    await supabase.from('ops.job_runs').insert({
      job_key: 'specials-scrape',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      params: params as unknown as Record<string, unknown>,
      success_count: scraped,
      failure_count: 0,
      status: 'success'
    })

    return new Response(JSON.stringify({ ok: true, scraped }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})



