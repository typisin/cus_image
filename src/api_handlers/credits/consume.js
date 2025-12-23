import { getTokenFromReq, verifyToken } from '../../../lib/auth.js'
import { consumeCredits } from '../../../lib/credits.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const token = getTokenFromReq(req)
    if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
    let payload
    try { payload = await verifyToken(token) } catch { res.status(401).json({ error: 'Unauthorized' }); return }
    const uid = Number(payload.sub)
    const body = await readBody(req)
    const amount = Number(body.amount || 0)
    const reason = body.reason || null
    if (!Number.isFinite(amount) || amount <= 0) { res.status(400).json({ error: 'Invalid amount' }); return }
    const result = await consumeCredits(uid, amount, reason)
    if (result && result.insufficient) { res.status(402).json({ error: 'Insufficient credits', available: result.available, needed: result.needed }); return }
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c })
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) } })
  })
}

