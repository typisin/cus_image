import { SignJWT, jwtVerify } from 'jose'

export function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('Missing JWT_SECRET')
  return new TextEncoder().encode(s)
}

export async function signToken(payload) {
  const secret = getSecret()
  return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
}

export async function verifyToken(token) {
  const secret = getSecret()
  const r = await jwtVerify(token, secret)
  return r.payload
}

export function getTokenFromReq(req) {
  const h = req.headers
  const auth = h.authorization || h.Authorization
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '')
  const cookie = h.cookie || h.Cookie
  if (!cookie) return null
  const m = /(?:^|;\s*)token=([^;]+)/.exec(cookie)
  return m ? decodeURIComponent(m[1]) : null
}

export function setAuthCookie(res, token) {
  const cookie = `token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  res.setHeader('Set-Cookie', cookie)
}
