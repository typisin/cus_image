export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  const runUrl = process.env.COZE_WORKFLOW_RUN_URL
  const workflowId = process.env.COZE_WORKFLOW_ID
  if (!runUrl || !workflowId) return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  const clientToken = req.headers.get('x-coze-token') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.headers.get('token')
  if (!clientToken) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  let body
  try { body = await req.json() } catch (e) { body = null }
  const fileId = body?.file_id
  if (!fileId) return new Response(JSON.stringify({ error: 'file_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const payload = { workflow_id: workflowId, file_id: fileId }
  // 同时兼容部分工作流需要通过 parameters 传参的情况
  payload.parameters = { file_id: fileId }
  const headers = { Authorization: `Bearer ${clientToken}`, 'Content-Type': 'application/json' }
  const res = await fetch(runUrl, { method: 'POST', headers, body: JSON.stringify(payload) })
  let data
  try { data = await res.json() } catch (e) { data = null }
  if (!res.ok) return new Response(JSON.stringify({ error: data?.error || 'workflow run failed' }), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  const runId = data?.run_id || data?.data?.run_id || data?.id
  return new Response(JSON.stringify({ run_id: runId }), { headers: { 'Content-Type': 'application/json' } })
}