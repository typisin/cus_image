import bcrypt from 'bcryptjs'
import { getTursoClient, ensureAuthTables } from '../../../lib/tursoClient.js'
import { signToken, setAuthCookie } from '../../../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    await ensureAuthTables()
    const body = await readBody(req)
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''
    const client = getTursoClient()
    const r = await client.execute({ sql: 'select id, password_hash from users where email = ?', args: [email] })
    const row = r.rows && r.rows[0]
    if (!row || !row.password_hash) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const ok = await bcrypt.compare(password, row.password_hash)
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = await signToken({ sub: String(row.id), email })
    setAuthCookie(res, token)
    res.status(200).json({ ok: true })
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

