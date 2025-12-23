import { createClient } from '@libsql/client'

let cached

export function getTursoClient() {
  if (cached) return cached
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url) throw new Error('Missing TURSO_DATABASE_URL')
  if (!authToken) throw new Error('Missing TURSO_AUTH_TOKEN')
  cached = createClient({ url, authToken })
  return cached
}

let ensured = false

export async function ensureUsageTable() {
  if (ensured) return
  const client = getTursoClient()
  await client.execute(
    'create table if not exists usage_logs (id integer primary key, route text not null, ts text not null, extra text)'
  )
  ensured = true
}

export async function logUsage(route, extraObj) {
  await ensureUsageTable()
  const client = getTursoClient()
  const extra = JSON.stringify(extraObj || {})
  await client.execute({
    sql: 'insert into usage_logs(route, ts, extra) values(?, datetime("now"), ?)',
    args: [route, extra]
  })
}

let authEnsured = false

export async function ensureAuthTables() {
  if (authEnsured) return
  const client = getTursoClient()
  await client.execute('create table if not exists users (id integer primary key, email text unique not null, password_hash text, display_name text, created_at text not null)')
  await client.execute('create table if not exists user_identities (id integer primary key, user_id integer not null, provider text not null, provider_id text not null, email_verified integer default 0, created_at text not null)')
  await client.execute('create unique index if not exists idx_identities_provider_pid on user_identities(provider, provider_id)')
  await client.execute('create index if not exists idx_identities_user on user_identities(user_id)')
  authEnsured = true
}

let creditsEnsured = false

export async function ensureCreditsTables() {
  if (creditsEnsured) return
  const client = getTursoClient()
  await client.execute('create table if not exists credits_grants (id integer primary key, user_id integer not null, amount integer not null, amount_used integer not null default 0, granted_at text not null, expires_at text not null)')
  await client.execute('create index if not exists idx_credits_grants_user_exp on credits_grants(user_id, expires_at)')
  await client.execute('create table if not exists credits_consumptions (id integer primary key, user_id integer not null, grant_id integer not null, amount integer not null, used_at text not null, reason text)')
  creditsEnsured = true
}
