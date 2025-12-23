import { getTursoClient, ensureUsageTable } from '../../../lib/tursoClient.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    await ensureUsageTable()
    const client = getTursoClient()
    const rows = await client.execute('select id, route, ts, extra from usage_logs order by id desc limit 10')
    res.status(200).json({ rows: rows.rows || [] })
  } catch (e) {
    res.status(500).json({ error: 'Query Failed', detail: e?.message || String(e) })
  }
}

