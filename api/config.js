export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const checkout_url = process.env.CREEM_CHECKOUT_URL || null
    res.status(200).json({ checkout_url })
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}
