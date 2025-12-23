import { getTursoClient, ensureCreditsTables } from './tursoClient.js'

export async function grantCredits(userId, amount = 10, ttlDays = 30) {
  await ensureCreditsTables()
  const client = getTursoClient()
  await client.execute({
    sql: 'insert into credits_grants(user_id, amount, amount_used, granted_at, expires_at) values(?, ?, 0, datetime("now"), datetime("now", "+" || ? || " days"))',
    args: [userId, amount, String(ttlDays)]
  })
}

export async function getCredits(userId) {
  await ensureCreditsTables()
  const client = getTursoClient()
  const grantsRes = await client.execute({ sql: 'select id, amount, amount_used, granted_at, expires_at from credits_grants where user_id = ? order by datetime(expires_at) asc, id asc', args: [userId] })
  const nowRes = await client.execute('select datetime("now") as now')
  const now = nowRes.rows && nowRes.rows[0] && nowRes.rows[0].now
  const grants = (grantsRes.rows || []).map((g) => {
    const remaining = Math.max(0, Number(g.amount) - Number(g.amount_used || 0))
    const expired = g.expires_at <= now
    return { id: g.id, amount: Number(g.amount), amount_used: Number(g.amount_used || 0), remaining, granted_at: g.granted_at, expires_at: g.expires_at, expired }
  })
  const consumptionsRes = await client.execute({ sql: 'select id, grant_id, amount, used_at, reason from credits_consumptions where user_id = ? order by datetime(used_at) desc, id desc limit 200', args: [userId] })
  const consumptions = (consumptionsRes.rows || []).map((c) => ({ id: c.id, grant_id: c.grant_id, amount: Number(c.amount), used_at: c.used_at, reason: c.reason }))
  const total_available = grants.filter((g) => !g.expired).reduce((sum, g) => sum + g.remaining, 0)
  const total_granted = grants.reduce((sum, g) => sum + g.amount, 0)
  const total_used = grants.reduce((sum, g) => sum + g.amount_used, 0)
  return { summary: { total_available, total_granted, total_used }, grants, consumptions }
}

export async function consumeCredits(userId, amount, reason) {
  await ensureCreditsTables()
  const client = getTursoClient()
  const nowRes = await client.execute('select datetime("now") as now')
  const now = nowRes.rows && nowRes.rows[0] && nowRes.rows[0].now
  const grantsRes = await client.execute({ sql: 'select id, amount, amount_used, expires_at from credits_grants where user_id = ? and datetime(expires_at) > datetime(?) order by datetime(expires_at) asc, id asc', args: [userId, now] })
  let remainingNeed = Number(amount)
  const grants = grantsRes.rows || []
  const totalAvailable = grants.reduce((sum, g) => sum + Math.max(0, Number(g.amount) - Number(g.amount_used || 0)), 0)
  if (remainingNeed > totalAvailable) {
    return { insufficient: true, needed: remainingNeed, available: totalAvailable }
  }
  await client.execute('BEGIN')
  try {
    for (const g of grants) {
      if (remainingNeed <= 0) break
      const gRemaining = Math.max(0, Number(g.amount) - Number(g.amount_used || 0))
      if (gRemaining <= 0) continue
      const use = Math.min(gRemaining, remainingNeed)
      await client.execute({ sql: 'update credits_grants set amount_used = amount_used + ? where id = ?', args: [use, g.id] })
      await client.execute({ sql: 'insert into credits_consumptions(user_id, grant_id, amount, used_at, reason) values(?, ?, ?, datetime("now"), ?)', args: [userId, g.id, use, reason || null] })
      remainingNeed -= use
    }
    await client.execute('COMMIT')
  } catch (e) {
    await client.execute('ROLLBACK')
    throw e
  }
  return await getCredits(userId)
}

