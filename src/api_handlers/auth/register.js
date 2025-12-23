import bcrypt from 'bcryptjs'
import { getTursoClient, ensureAuthTables } from '../../../lib/tursoClient.js'
import { grantCredits } from '../../../lib/credits.js'
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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).json({ error: 'Invalid email' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password too short' })
      return
    }
    const client = getTursoClient()
    const exists = await client.execute({ sql: 'select id from users where email = ?', args: [email] })
    if (exists.rows && exists.rows.length) {
      res.status(409).json({ error: 'Email exists' })
      return
    }
    const hash = await bcrypt.hash(password, 10)
    const ins = await client.execute({ sql: 'insert into users(email, password_hash, created_at) values(?, ?, datetime("now"))', args: [email, hash] })
    const userId = ins.lastInsertRowid
    await client.execute({ sql: 'insert into user_identities(user_id, provider, provider_id, created_at) values(?, ?, ?, datetime("now"))', args: [userId, 'email', email] })
    await grantCredits(Number(userId), 10, 30)
    const token = await signToken({ sub: String(userId), email })
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
