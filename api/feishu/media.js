let RATE = { windowMs: 60 * 1000, max: 60 }
const buckets = new Map()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const urlObj = new URL(req.url, 'http://localhost')
    const token = urlObj.searchParams.get('file_token')
    if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) {
      res.status(400).json({ error: 'file_token required' })
      return
    }
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || (req.socket && req.socket.remoteAddress) || 'unknown'
    const now = Date.now()
    const bucket = buckets.get(ip) || { reset: now + RATE.windowMs, count: 0 }
    if (now > bucket.reset) { bucket.count = 0; bucket.reset = now + RATE.windowMs }
    bucket.count += 1
    buckets.set(ip, bucket)
    if (bucket.count > RATE.max) {
      res.status(429).json({ error: 'Too Many Requests' })
      return
    }
    const appId = process.env.FEISHU_APP_ID
    const appSecret = process.env.FEISHU_APP_SECRET
    const preset = process.env.FEISHU_TENANT_ACCESS_TOKEN
    let accessToken = preset || ''
    if (!accessToken) {
      if (!appId || !appSecret) {
        res.status(500).json({ error: 'Missing FEISHU_APP_ID or FEISHU_APP_SECRET' })
        return
      }
      const r = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret })
      })
      if (!r.ok) {
        const t = await r.text()
        res.status(r.status).json({ error: t || 'Failed to get token' })
        return
      }
      const j = await r.json()
      accessToken = j.tenant_access_token || j.access_token || ''
      if (!accessToken) {
        res.status(502).json({ error: 'No token' })
        return
      }
    }
    const tmpUrlApi = `https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=${encodeURIComponent(token)}`
    let fileRes = null
    let fileType = ''
    let buf = null
    const tmpRes = await fetch(tmpUrlApi, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (tmpRes.ok) {
      const data = await tmpRes.json()
      let tmp = ''
      if (data && data.data) {
        tmp = data.data.tmp_download_url || data.data.url || ''
        const list = data.data.file_list || data.data.urls || data.data.items
        if (!tmp && Array.isArray(list) && list[0]) {
          tmp = list[0].tmp_download_url || list[0].url || ''
        }
      }
      if (tmp) {
        const r2 = await fetch(tmp)
        if (r2.ok) {
          fileRes = r2
          fileType = r2.headers.get('content-type') || ''
          const ab = await r2.arrayBuffer()
          buf = Buffer.from(ab)
        }
      }
    }
    if (!buf) {
      const direct = `https://open.feishu.cn/open-apis/drive/v1/medias/${encodeURIComponent(token)}/download`
      const r3 = await fetch(direct, { headers: { Authorization: `Bearer ${accessToken}` } })
      if (!r3.ok) {
        const t = await r3.text()
        res.status(r3.status).json({ error: t || 'Download failed' })
        return
      }
      fileRes = r3
      fileType = r3.headers.get('content-type') || ''
      const ab = await r3.arrayBuffer()
      buf = Buffer.from(ab)
    }
    if (!fileType) fileType = 'application/octet-stream'
    if (!/^image\//.test(fileType)) {
      res.status(415).json({ error: 'Unsupported Media Type' })
      return
    }
    res.setHeader('Content-Type', fileType)
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.status(200).end(buf)
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
