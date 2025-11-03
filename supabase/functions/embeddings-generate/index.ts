import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { getServiceClient } from '../_shared/supabaseClient.ts'

type RunParams = {
  scope?: 'full' | 'incremental'
  model?: string
  provider?: string
  batchSize?: number
  dryRun?: boolean
}

serve(async (req) => {
  try {
    const supabase = getServiceClient()
    const params = (await req.json().catch(() => ({}))) as RunParams
    const startedAt = new Date().toISOString()

    // TODO: implement embedding generation against ai.business_corpus
    const processed = 0

    await supabase.from('ops.job_runs').insert({
      job_key: 'embeddings-generate',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      params: params as unknown as Record<string, unknown>,
      success_count: processed,
      failure_count: 0,
      status: 'success'
    })

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})



