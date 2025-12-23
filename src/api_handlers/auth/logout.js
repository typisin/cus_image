export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    res.setHeader('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}

