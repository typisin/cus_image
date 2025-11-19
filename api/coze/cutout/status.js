export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const runId = url.searchParams.get('run_id')
  if (!runId) return new Response(JSON.stringify({ error: 'run_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const statusUrl = process.env.COZE_WORKFLOW_STATUS_URL
  if (!statusUrl) return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  const clientToken = req.headers.get('x-coze-token') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.headers.get('token')
  if (!clientToken) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const target = statusUrl.includes('?') ? `${statusUrl}&run_id=${encodeURIComponent(runId)}` : `${statusUrl}?run_id=${encodeURIComponent(runId)}`
  const headers = { Authorization: `Bearer ${clientToken}` }
  const res = await fetch(target, { headers })
  let data
  try { data = await res.json() } catch (e) { data = null }
  if (!res.ok) return new Response(JSON.stringify({ error: data?.error || 'status query failed' }), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  const status = data?.status || data?.data?.status
  const result = data?.result || data?.data?.result
  return new Response(JSON.stringify({ status, result }), { headers: { 'Content-Type': 'application/json' } })
}