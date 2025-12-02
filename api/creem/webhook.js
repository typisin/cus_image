import crypto from 'crypto'
import { getTursoClient, ensureAuthTables } from '../../lib/tursoClient.js'
import { grantCredits } from '../../lib/credits.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return }
  try {
    const rid = Math.random().toString(36).slice(2)
    console.log('[Webhook] start', { rid })
    const secret = process.env.CREEM_WEBHOOK_SECRET
    if (!secret) { res.status(500).json({ error: 'Missing webhook secret' }); return }
    const sig = getSignatureFromReq(req)
    const raw = await readRaw(req)
    const sigOk = checkSig(String(sig || '').trim(), raw, secret)
    console.log('[Webhook] sig', { rid, present: !!sig, ok: sigOk })
    if (!sigOk) { res.status(401).json({ error: 'Invalid signature' }); return }
    let payload
    try { payload = JSON.parse(raw) } catch { res.status(400).json({ error: 'Bad payload' }); return }
    console.log('[Webhook] payload', { rid, keys: Object.keys(payload || {}) })
    const orderId = payload.order_id || (payload.order && payload.order.id) || payload.id || null
    const status = payload.status || (payload.order && payload.order.status) || payload.event || null
    const email = (
      payload.buyer_email ||
      (payload.customer && payload.customer.email) ||
      payload.customer ||
      (payload.order && payload.order.customer) ||
      ''
    ).toLowerCase()
    const meta = payload.metadata || (payload.order && payload.order.metadata) || {}
    const productId = payload.product_id || (payload.order && payload.order.product_id) || null
    const paid = status === 'paid' || status === 'payment_succeeded' || status === 'success' || status === 'completed'
    console.log('[Webhook] status', { rid, status, paid })
    if (!paid) { res.status(200).json({ ok: true }); return }
    if (!orderId) { res.status(400).json({ error: 'Missing order id' }); return }
    const amountEnv = process.env.CREDIT_GRANT_STANDARD_PACK
    const amount = amountEnv ? Number(amountEnv) : 100
    await ensureAuthTables()
    const client = getTursoClient()
    await ensurePurchasesTable()
    const existing = await client.execute({ sql: 'select id from purchases where order_id = ?', args: [String(orderId)] })
    console.log('[Webhook] dedupe', { rid, orderId, duplicate: !!(existing.rows && existing.rows.length) })
    if (existing.rows && existing.rows.length) { res.status(200).json({ ok: true, duplicate: true }); return }
    let uid = null
    if (meta && (meta.user_id || meta.userId || meta.uid)) {
      uid = Number(meta.user_id || meta.userId || meta.uid)
    }
    else if (email) {
      const u = await client.execute({ sql: 'select id from users where lower(email) = ?', args: [email] })
      if (u.rows && u.rows.length) { uid = Number(u.rows[0].id) }
    }
    console.log('[Webhook] map', { rid, email, metaKeys: Object.keys(meta || {}), uid })
    if (!uid) { res.status(400).json({ error: 'User not found' }); return }
    await grantCredits(uid, amount, 365)
    console.log('[Webhook] grant', { rid, uid, amount })
    await client.execute({ sql: 'insert into purchases(order_id, user_id, product_id, amount, created_at) values(?, ?, ?, ?, datetime("now"))', args: [String(orderId), uid, productId || null, amount] })
    console.log('[Webhook] done', { rid, orderId })
    res.status(200).json({ ok: true })
  } catch (e) { res.status(500).json({ error: 'Server Error' }) }
}

function readRaw(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c })
    req.on('end', () => { resolve(data || '') })
  })
}

function getSignatureFromReq(req){
  const h = req.headers || {}
  const candidates = [
    'x-creem-signature','X-Creem-Signature',
    'x-creem-signature-sha256','X-Creem-Signature-SHA256',
    'x-webhook-signature','X-Webhook-Signature',
    'x-signature','X-Signature',
    'signature','Signature'
  ]
  for (const k of candidates){ if (h[k]) return h[k] }
  try {
    const u = new URL(req.url, 'http://localhost')
    const qp = ['x-creem-signature','x-webhook-signature','signature','sig','s']
    for (const q of qp){ const v = u.searchParams.get(q); if (v) return v }
  } catch {}
  return ''
}

function checkSig(headerSig, raw, secret) {
  try {
    if (!headerSig) return false
    const clean = headerSig.replace(/^sha256=/i, '')
    const hHex = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    const hBase64 = crypto.createHmac('sha256', secret).update(raw).digest('base64')
    const a = Buffer.from(clean, 'hex')
    const b = Buffer.from(hHex, 'hex')
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true
    return clean === hHex || clean === hBase64
  } catch { return false }
}

async function ensurePurchasesTable() {
  const client = getTursoClient()
  await client.execute('create table if not exists purchases (id integer primary key, order_id text unique not null, user_id integer not null, product_id text, amount integer not null, created_at text not null)')
}
