export const config = { runtime: 'nodejs' }

import fs from 'node:fs'
import path from 'node:path'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const uploadUrl = process.env.COZE_UPLOAD_URL
  const sat = process.env.COZE_SAT
  if (!uploadUrl || !sat) return res.status(500).json({ error: 'Missing server configuration' })
  let body
  try { body = await new Promise((resolve, reject) => { let data=''; req.on('data', c=>data+=c); req.on('end', ()=>{ try{ resolve(JSON.parse(data||'{}')) }catch(e){ reject(e) } }); }) } catch (e) { body = null }
  const filePath = body?.file_path
  if (!filePath) return res.status(400).json({ error: 'file_path required' })
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  if (!fs.existsSync(absPath)) return res.status(400).json({ error: 'file not found' })
  const stat = fs.statSync(absPath)
  if (!stat.isFile()) return res.status(400).json({ error: 'not a file' })
  const stream = fs.createReadStream(absPath)
  const fd = new FormData()
  fd.append('file', stream, path.basename(absPath))
  const resp = await fetch(uploadUrl, { method: 'POST', headers: { Authorization: `Bearer ${sat}` }, body: fd })
  let data
  try { data = await resp.json() } catch (e) { data = null }
  if (!resp.ok) return res.status(resp.status).json({ error: data?.error || data || 'upload failed' })
  const fileId = data?.file_id || data?.data?.file_id || data?.id
  return res.json({ file_id: fileId })
}