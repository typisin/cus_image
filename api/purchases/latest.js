import { getTokenFromReq, verifyToken } from '../../lib/auth.js'
import { getTursoClient } from '../../lib/tursoClient.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method Not Allowed' }); return }
  try {
    const token = getTokenFromReq(req)
    if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
    let payload
    try { payload = await verifyToken(token) } catch { res.status(401).json({ error: 'Unauthorized' }); return }
    const uid = Number(payload.sub)
    const client = getTursoClient()
    await client.execute('create table if not exists purchases (id integer primary key, order_id text unique not null, user_id integer not null, product_id text, amount integer not null, created_at text not null)')
    const r = await client.execute({ sql: 'select order_id, product_id, amount, created_at from purchases where user_id = ? order by id desc limit 1', args: [uid] })
    const row = r.rows && r.rows[0] || null
    res.status(200).json({ latest: row || null })
  } catch (e) { res.status(500).json({ error: 'Server Error' }) }
}
