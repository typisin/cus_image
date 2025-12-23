import { getTursoClient, ensureAuthTables } from '../../../lib/tursoClient.js'
import { getTokenFromReq, verifyToken } from '../../../lib/auth.js'

export default async function handler(req, res) {
  try {
    await ensureAuthTables()
    const token = getTokenFromReq(req)
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    let payload
    try { payload = await verifyToken(token) } catch { res.status(401).json({ error: 'Unauthorized' }); return }
    const uid = Number(payload.sub)
    const client = getTursoClient()
    if (req.method === 'GET') {
      const r = await client.execute({ sql: 'select email, display_name from users where id = ?', args: [uid] })
      const row = r.rows && r.rows[0]
      if (!row) { res.status(404).json({ error: 'Not Found' }); return }
      const default_name = (row.email || '').split('@')[0]
      res.status(200).json({ email: row.email, display_name: row.display_name || null, default_name })
      return
    }
    if (req.method === 'PUT') {
      const body = await readBody(req)
      const name = body.display_name === '' ? null : (body.display_name || null)
      await client.execute({ sql: 'update users set display_name = ? where id = ?', args: [name, uid] })
      res.status(200).json({ display_name: name || null })
      return
    }
    res.status(405).json({ error: 'Method Not Allowed' })
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c })
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) }
    })
  })
}

