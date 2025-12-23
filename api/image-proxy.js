export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost')
    const raw = urlObj.searchParams.get('url')
    if (!raw) {
      res.status(400).json({ error: 'url required' })
      return
    }

    let target
    try {
      target = new URL(raw)
    } catch {
      res.status(400).json({ error: 'invalid url' })
      return
    }

    const protocol = (target.protocol || '').toLowerCase()
    if (protocol !== 'https:' && protocol !== 'http:') {
      res.status(400).json({ error: 'invalid protocol' })
      return
    }

    const allowHosts = (process.env.IMAGE_PROXY_ALLOW_HOSTS || 'cdn.abeiai.com')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)

    const host = (target.hostname || '').toLowerCase()
    if (!allowHosts.includes(host)) {
      res.status(403).json({ error: 'host not allowed' })
      return
    }

    const upstream = await fetch(target.toString(), { redirect: 'follow', method: req.method })
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'upstream failed' })
      return
    }

    const contentType = upstream.headers.get('content-type') || ''
    if (!/^image\//i.test(contentType)) {
      res.status(415).json({ error: 'Unsupported Media Type' })
      return
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('X-Content-Type-Options', 'nosniff')

    if (req.method === 'HEAD') {
      res.status(200).end()
      return
    }

    const ab = await upstream.arrayBuffer()
    const buf = Buffer.from(ab)
    res.status(200).end(buf)
  } catch {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
