export const config = { runtime: 'nodejs' }

import fs from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const uploadUrl = process.env.COZE_UPLOAD_URL
    if (!uploadUrl) return res.status(500).json({ error: 'Missing server configuration' })
    const envToken = process.env.COZE_SAT
    const authHeader = req.headers['authorization'] || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const headerToken = req.headers['x-coze-token'] || req.headers['token'] || bearer
    const token = envToken || headerToken
    if (!token) return res.status(400).json({ error: 'token required' })

    let body
    try { body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}') } catch (e) { body = {} }
    const filePath = body.path
    if (!filePath || typeof filePath !== 'string') return res.status(400).json({ error: 'path required' })

    const absPath = filePath.startsWith('/') || filePath.match(/^[A-Za-z]:\\/) ? filePath : path.resolve(filePath)
    const st = await fs.stat(absPath)
    if (!st.isFile()) return res.status(400).json({ error: 'not a file' })
    const buffer = await fs.readFile(absPath)
    const filename = path.basename(absPath)

    const form = new FormData()
    form.append('file', new Blob([buffer]), filename)

    const resp = await fetch(uploadUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
    let data
    try { data = await resp.json() } catch (e) { data = null }
    if (!resp.ok) return res.status(resp.status).json({ error: (data && (data.error || data.msg)) || 'upload failed', data })
    const fileId = (data && (data.file_id || (data.data && data.data.id) || data.id)) || null
    return res.json({ file_id: fileId })
  } catch (err) {
    return res.status(500).json({ error: 'server error', detail: String(err && err.message || err) })
  }
}