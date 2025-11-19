export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  const uploadUrl = process.env.COZE_UPLOAD_URL
  if (!uploadUrl) return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  const envToken = process.env.COZE_SAT
  const clientToken = req.headers.get('x-coze-token') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.headers.get('token')
  const token = envToken || clientToken
  if (!token) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const inForm = await req.formData()
  const file = inForm.get('file')
  if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const fd = new FormData()
  fd.append('file', file, file.name || 'upload')
  const headers = { Authorization: `Bearer ${token}` }
  const res = await fetch(uploadUrl, { method: 'POST', headers, body: fd })
  let data
  try { data = await res.json() } catch (e) { data = null }
  if (!res.ok) return new Response(JSON.stringify({ error: data?.error || data || 'upload failed' }), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  const fileId = data?.file_id || data?.data?.file_id || data?.id
  return new Response(JSON.stringify({ file_id: fileId }), { headers: { 'Content-Type': 'application/json' } })
}