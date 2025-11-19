export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const apiKey = process.env.VOLC_API_KEY
    const model = process.env.VOLC_ENDPOINT_ID || process.env.VOLC_MODEL
    if (!apiKey) {
      res.status(500).json({ error: 'Missing VOLC_API_KEY' })
      return
    }
    if (!model) {
      res.status(500).json({ error: 'Missing VOLC_ENDPOINT_ID or VOLC_MODEL' })
      return
    }
    const body = await readBody(req)
    const imageBase64 = body && body.imageBase64
    const detail = (body && body.detail) || 'low'
    const userText = (body && body.prompt) || 'Please describe this image in 1–2 sentences.'
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'imageBase64 required' })
      return
    }
    if (imageBase64.length > 12 * 1024 * 1024) {
      res.status(413).json({ error: 'Payload too large' })
      return
    }
    const payload = {
      model: model,
      messages: [
        { role: 'system', content: 'You describe images in concise, natural English.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image_url', image_url: { url: imageBase64, detail: detail } }
          ]
        }
      ]
    }
    const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })
    if (!r.ok) {
      const text = await r.text()
      res.status(r.status).json({ error: text || 'Upstream error' })
      return
    }
    const data = await r.json()
    let description = ''
    const choice = data && data.choices && data.choices[0]
    const msg = choice && choice.message
    const content = msg && msg.content
    if (typeof content === 'string') {
      description = content
    } else if (Array.isArray(content)) {
      const t = content.find((c) => c.type === 'text')
      description = (t && t.text) || ''
    }
    if (!description) {
      res.status(502).json({ error: 'Empty description' })
      return
    }
    res.status(200).json({ description })
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        const json = JSON.parse(data || '{}')
        resolve(json)
      } catch (_) {
        resolve({})
      }
    })
  })
}