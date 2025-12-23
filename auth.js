async function req(url, options){
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }, options||{}))
  const t = await r.text()
  try{ return { ok: r.ok, status: r.status, data: JSON.parse(t) } }catch{ return { ok: r.ok, status: r.status, data: { error: t } } }
}

async function refreshProfile(){
  const r = await req('/api/auth/profile')
  if (r.ok){
    const d = r.data
    const name = d.display_name || d.default_name
    document.getElementById('who').textContent = name ? `Signed in as: ${name}` : 'Not signed in'
    document.getElementById('displayName').value = d.display_name || ''
  } else {
    document.getElementById('who').textContent = 'Not signed in'
  }
}

document.getElementById('register').addEventListener('click', async ()=>{
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const r = await req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
  if (!r.ok && r.status === 409) {
    const l = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  } else if (r.ok) {
    const l = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  }
  await refreshProfile()
})

document.getElementById('login').addEventListener('click', async ()=>{
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const r = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  await refreshProfile()
})

document.getElementById('saveName').addEventListener('click', async ()=>{
  const display_name = document.getElementById('displayName').value
  const r = await req('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ display_name }) })
  await refreshProfile()
})

refreshProfile()
