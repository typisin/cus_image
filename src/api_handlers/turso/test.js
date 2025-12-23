import { createClient } from '@libsql/client'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url) {
    res.status(500).json({ error: 'Missing TURSO_DATABASE_URL' })
    return
  }
  if (!authToken) {
    res.status(500).json({ error: 'Missing TURSO_AUTH_TOKEN' })
    return
  }
  try {
    const client = createClient({ url, authToken })

    const ping = await client.execute('select 1 as ok')
    const now = await client.execute("select datetime('now') as now")
    let version
    try {
      version = await client.execute('select sqlite_version() as version')
    } catch (_) {
      version = { rows: [] }
    }

    res.status(200).json({
      connected: true,
      ok: Array.isArray(ping.rows) ? (ping.rows[0]?.ok === 1 || ping.rows[0]?.ok === '1') : true,
      now: Array.isArray(now.rows) ? now.rows[0]?.now : null,
      version: Array.isArray(version.rows) ? version.rows[0]?.version : null
    })
  } catch (e) {
    res.status(500).json({ error: 'Connection Failed', detail: e?.message || String(e) })
  }
}
