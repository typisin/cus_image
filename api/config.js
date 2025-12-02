export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const checkout_url = process.env.CREEM_CHECKOUT_URL || null
    const credit_grant = process.env.CREDIT_GRANT_STANDARD_PACK ? Number(process.env.CREDIT_GRANT_STANDARD_PACK) : null
    res.status(200).json({ checkout_url, credit_grant })
  } catch (e) {
    res.status(500).json({ error: 'Server Error' })
  }
}
