export function getSATFromReq(req) {
  const envToken = process.env.COZE_SAT
  const h = req.headers
  const authHeader = h.get('authorization')
  const clientToken = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null) || h.get('x-coze-token') || h.get('x-coze-sat') || h.get('token')
  const cookieStr = h.get('cookie') || ''
  const cookieMatch = /(?:^|;\s*)(?:coze_sat|token)=([^;]+)/.exec(cookieStr)
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
  let queryToken = null
  try { const u = new URL(req.url); queryToken = u.searchParams.get('sat') || u.searchParams.get('token') } catch (e) { queryToken = null }
  const final = envToken || clientToken || cookieToken || queryToken
  return { token: final, source: envToken ? 'env' : (clientToken ? 'header' : (cookieToken ? 'cookie' : (queryToken ? 'query' : null))) }
}

export function getSATFromNodeReq(req) {
  const envToken = process.env.COZE_SAT
  const authHeader = req.headers['authorization']
  const clientToken = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null) || req.headers['x-coze-token'] || req.headers['x-coze-sat'] || req.headers['token']
  const cookieStr = req.headers['cookie'] || ''
  const cookieMatch = /(?:^|;\s*)(?:coze_sat|token)=([^;]+)/.exec(cookieStr)
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
  let queryToken = null
  try { const u = new URL(req.url, 'http://localhost'); queryToken = u.searchParams.get('sat') || u.searchParams.get('token') } catch (e) { queryToken = null }
  const final = envToken || clientToken || cookieToken || queryToken
  return { token: final, source: envToken ? 'env' : (clientToken ? 'header' : (cookieToken ? 'cookie' : (queryToken ? 'query' : null))) }
}
