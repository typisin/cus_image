export default async function handler(req, res) {
  console.log('=== Upload API Debug ===')
  console.log('Method:', req.method)
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'unknown', 'VERCEL_REGION:', process.env.VERCEL_REGION || 'unknown')
  
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  
  const uploadUrl = 'https://api.coze.cn/v1/files/upload'
  let token, source
  try { const r = (await import('../../lib/env.js')).getSATFromNodeReq(req); token = r.token; source = r.source } catch (e) { token = process.env.COZE_SAT || null; source = 'env' }
  
  console.log('Token source:', source || 'none')
  console.log('Final token present:', !!token)
  
  if (!token) { res.status(400).json({ error: 'token required' }); return }
  
  try {
    const contentType = req.headers['content-type'] || ''
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    await new Promise((resolve) => req.on('end', resolve))
    const body = Buffer.concat(chunks)
    if (!/multipart\/form-data/i.test(contentType)) {
      res.status(400).json({ error: 'file required' })
      return
    }
    
    console.log('Forwarding request to Coze API...')
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': contentType }
    const upstream = await fetch(uploadUrl, { method: 'POST', headers, body })
    const raw = await upstream.text()
    let data = null
    try { data = raw ? JSON.parse(raw) : null } catch {}
    console.log('Coze API response status:', upstream.status)
    if (!upstream.ok) {
      const msg = (data && (data.msg || data.error)) || raw || 'upload failed'
      res.status(upstream.status).json({ error: msg, code: data?.code, raw_text: raw })
      return
    }
    const fileId = data?.file_id || data?.data?.file_id || data?.data?.id || data?.id
    res.status(200).json({ file_id: fileId })
  } catch (error) {
    console.error('Upload API error:', error)
    res.status(500).json({ error: 'server error', detail: error.message })
  }
}
