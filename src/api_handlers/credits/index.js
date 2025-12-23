import { getTokenFromReq, verifyToken } from '../../../lib/auth.js'
import { getCredits } from '../../../lib/credits.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const token = getTokenFromReq(req)
    if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
    let payload
    try { payload = await verifyToken(token) } catch { res.status(401).json({ error: 'Unauthorized' }); return }
    const uid = Number(payload.sub)
    const data = await getCredits(uid)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}

