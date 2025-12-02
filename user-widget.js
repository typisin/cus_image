function q(s) { return document.querySelector(s); }

async function req(u, o) {
  const r = await fetch(u, Object.assign({ headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }, o || {}));
  const t = await r.text();
  try { return { ok: r.ok, status: r.status, data: JSON.parse(t) }; } catch { return { ok: r.ok, status: r.status, data: { error: t } }; }
}

function createEl(tag, attrs) {
  const e = document.createElement(tag);
  if (attrs) Object.assign(e, attrs);
  return e;
}

function injectStyles() {
  if (q('#user-widget-style')) return;
  const s = createEl('style');
  s.id = 'user-widget-style';
  s.textContent = `
    :root { --chip-height: 32px; }
    .user-area { display: flex; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
    .user-btn { padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; background: #fff; color: #111; cursor: pointer; transition: 150ms ease; }
    .user-btn:disabled { opacity: .6; cursor: wait; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #111; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: 150ms ease; border: 1px solid transparent; }
    .user-avatar:hover { opacity: 0.9; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .user-credits { font-size: 12px; color: #111; padding: 0 12px; height: var(--chip-height); line-height: var(--chip-height); display: flex; align-items: center; justify-content: center; text-align: center; border: 1px solid #e5e7eb; border-radius: 20px; background: #fff; cursor: pointer; transition: 150ms ease; }
    .user-credits:hover { background: #f3f4f6; }
    .user-loading { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top-color: #111; border-radius: 50%; animation: user-spin 0.8s linear infinite; }
    @keyframes user-spin { to { transform: rotate(360deg); } }

    .user-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .user-modal { width: 400px; max-width: 90vw; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,0.12); font-family: Inter, system-ui, sans-serif; }
    .user-modal header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 18px; color: #111; display: flex; justify-content: space-between; align-items: center; }
    .user-modal .body { padding: 20px; max-height: 70vh; overflow-y: auto; }
    .user-close { width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .user-close:hover { background: #f3f4f6; color: #111; }
    .skeleton-line { height: 14px; border-radius: 8px; background: #f3f4f6; margin: 6px 0; }
    .user-hint { font-size: 12px; color: #6b7280; margin-top: 4px; }

    /* Utility Classes */
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-800 { color: #1f2937; }
    .text-blue-600 { color: #2563eb; }
    .bg-gray-50 { background-color: #f9fafb; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    .mb-1 { margin-bottom: 4px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-4 { margin-bottom: 16px; }
    .p-3 { padding: 12px; }
    .gap-2 { gap: 8px; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .w-full { width: 100%; }
    .card-item { border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; padding: 12px; margin-bottom: 8px; transition: transform 0.2s; }
    .card-item:hover { transform: translateY(-2px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .row { display: flex; gap: 10px; margin-top: 16px; }
    .row button { flex: 1; padding: 10px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: 0.2s; }
    .row button:first-child { background: #2563eb; color: #fff; }
    .row button:first-child:hover { background: #1d4ed8; }
    .row button:last-child { background: #f3f4f6; color: #1f2937; }
    .row button:last-child:hover { background: #e5e7eb; }
    label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; margin-top: 12px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; }
    input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  `;
  document.head.appendChild(s);
}

function showModal(title, bodyBuilder) {
  injectStyles();
  const bd = createEl('div', { className: 'user-modal-backdrop' });
  const m = createEl('div', { className: 'user-modal' });
  const h = createEl('header');
  const ht = createEl('div'); ht.textContent = title;
  const x = createEl('button'); x.className = 'user-close'; x.textContent = '×';
  const b = createEl('div', { className: 'body' });
  h.appendChild(ht); h.appendChild(x); m.appendChild(h); m.appendChild(b); bd.appendChild(m);
  document.body.appendChild(bd);
  const close = () => { bd.remove(); };
  bd.addEventListener('click', e => { if (e.target === bd) close(); });
  x.addEventListener('click', close);
  bodyBuilder(b, close);
  return { close };
}

async function refresh() {
  const btn = q('#user-login-btn');
  const avatar = q('#user-avatar');
  const creditsBadge = q('#user-credits-balance');
  const loading = q('#user-loading-indicator');
  
  const r = await req('/api/auth/profile');
  
  // Remove loading indicator if it exists
  if (loading) loading.style.display = 'none';

  if (r.ok) {
    const d = r.data;
    const show = d.display_name || d.default_name || d.email;
    
    // Store name for usage in modals
    if (avatar) avatar.dataset.name = show;

    if (btn) btn.style.display = 'none';
    
    if (avatar) {
      avatar.textContent = (show || 'U').substring(0, 1).toUpperCase();
      avatar.style.display = 'flex';
    }
    
    const cr = await req('/api/credits');
    if (cr.ok && creditsBadge) {
      creditsBadge.textContent = 'Credits: ' + (cr.data.summary && cr.data.summary.total_available || 0);
      creditsBadge.style.display = 'inline';
    }
  } else {
    if (btn) btn.style.display = 'inline-block';
    if (avatar) avatar.style.display = 'none';
    if (creditsBadge) creditsBadge.style.display = 'none';
  }
}

function mount() {
  injectStyles();
  const host = q('.header .container');
  if (!host) return;
  
  let area = q('.user-area');
  if (!area) {
    area = createEl('div', { className: 'user-area' });
    const dropdown = q('.nav-dropdown');
    if (dropdown && dropdown.parentElement) {
      dropdown.parentElement.appendChild(area);
    } else {
      host.appendChild(area);
    }
  }
  
  // Clear area to ensure correct order if re-mounting
  area.innerHTML = '';

  const loading = createEl('div', { id: 'user-loading-indicator', className: 'user-loading' });
  const btn = createEl('button', { id: 'user-login-btn', className: 'user-btn', textContent: 'Login', style: 'display: none' });
  // Removed #user-profile wrapper, using flat structure
  const avatar = createEl('div', { id: 'user-avatar', className: 'user-avatar', style: 'display: none' });
  const creditsBadge = createEl('span', { id: 'user-credits-balance', className: 'user-credits', style: 'display: none' });

  // Order: Credits, Avatar, Login (Loading is temp)
  area.appendChild(creditsBadge);
  area.appendChild(avatar);
  area.appendChild(btn);
  area.appendChild(loading);

  // Login Handler
  btn.addEventListener('click', () => {
    showModal('Login / Register', (box, close) => {
      const emailLabel = createEl('label'); emailLabel.textContent = 'Email';
      const email = createEl('input'); email.type = 'email'; email.placeholder = 'you@example.com';
      const passLabel = createEl('label'); passLabel.textContent = 'Password';
      const pass = createEl('input'); pass.type = 'password'; pass.placeholder = 'minimum 6 characters';
      const row = createEl('div', { className: 'row' });
      const reg = createEl('button'); reg.textContent = 'Register';
      const log = createEl('button'); log.textContent = 'Login';
      row.appendChild(reg); row.appendChild(log);
      box.appendChild(emailLabel); box.appendChild(email); box.appendChild(passLabel); box.appendChild(pass); box.appendChild(row);
      
      const setLoading = (el, flag) => { el.disabled = !!flag; el.textContent = flag ? 'Loading…' : (el === reg ? 'Register' : 'Login'); };
      const doLogin = async () => {
        setLoading(log, true);
        await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value.trim(), password: pass.value }) });
        setLoading(log, false);
        await refresh();
        close();
      };
      
      reg.addEventListener('click', async () => {
        setLoading(reg, true);
        const r = await req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: email.value.trim(), password: pass.value }) });
        setLoading(reg, false);
        if (!r.ok && r.status === 409) { await doLogin(); }
        else if (r.ok) { await doLogin(); }
      });
      log.addEventListener('click', async () => { await doLogin(); });
    });
  });

  // Avatar Handler (User Info & Logout)
  avatar.addEventListener('click', async () => {
    const pr = await req('/api/auth/profile');
    if (!pr.ok) { btn.click(); return; }
    
    showModal('User Info', (box, close) => {
      const nLabel = createEl('div', { className: 'text-xs text-gray-500 font-semibold mb-1' }); nLabel.textContent = 'Display Name';
      const n = createEl('div', { className: 'text-base text-gray-800 mb-4 font-medium' });
      n.textContent = (pr.data.display_name || pr.data.default_name || pr.data.email);
      
      const eLabel = createEl('div', { className: 'text-xs text-gray-500 font-semibold mb-1' }); eLabel.textContent = 'Email Address';
      const e = createEl('div', { className: 'text-base text-gray-800 mb-4 font-medium' });
      e.textContent = (pr.data.email || '');
      
      const row = createEl('div', { className: 'row' });
      const logout = createEl('button'); logout.textContent = 'Logout';
      
      const edit = createEl('button'); edit.textContent = 'Edit Name';
      edit.style.background = '#fff'; edit.style.color = '#111'; edit.style.border = '1px solid #ddd';
      
      row.appendChild(edit);
      row.appendChild(logout);
      
      box.appendChild(nLabel); box.appendChild(n);
      box.appendChild(eLabel); box.appendChild(e);
      box.appendChild(row);

      edit.addEventListener('click', () => {
        box.innerHTML = '';
        const label = createEl('label'); label.textContent = 'New Display Name';
        const input = createEl('input'); input.value = n.textContent;
        const row2 = createEl('div', { className: 'row' });
        const save = createEl('button'); save.textContent = 'Save';
        const cancel = createEl('button'); cancel.textContent = 'Cancel';
        
        row2.appendChild(save); row2.appendChild(cancel);
        box.appendChild(label); box.appendChild(input); box.appendChild(row2);
        
        save.addEventListener('click', async () => {
            save.disabled = true; save.textContent = 'Saving...';
            await req('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ display_name: input.value }) });
            await refresh();
            close();
        });
        cancel.addEventListener('click', close);
      });
      
      logout.addEventListener('click', async () => {
        logout.disabled = true; logout.textContent = 'Loading…';
        await req('/api/auth/logout', { method: 'POST' });
        await refresh();
        close();
      });
    });
  });

  // Credits Handler
  creditsBadge.addEventListener('click', () => {
    showModal('Credits', async (box, close) => {
      // Show loading initially
      box.innerHTML = '<div class="user-loading" style="margin: 20px auto;"></div><p style="text-align:center;color:#666;font-size:14px;">Loading credits...</p>';
      
      const r = await req('/api/credits');
      if (!r.ok) { 
        close(); 
        btn.click(); 
        return; 
      }
      
      // Clear loading
      box.innerHTML = '';

      const userName = avatar.dataset.name || '';
      const emailLine = createEl('div', { className: 'text-sm text-gray-600 mb-2' });
      emailLine.textContent = 'Signed in as: ' + userName;
      
      const total = createEl('div', { className: 'text-xl font-bold text-blue-600 mb-4' });
      total.textContent = 'Total Available: ' + (r.data.summary && r.data.summary.total_available || 0);
      
      box.appendChild(emailLine); box.appendChild(total);
      
      const gTitle = createEl('div', { className: 'text-base font-semibold text-gray-800 mt-4 mb-2' }); gTitle.textContent = 'Grants'; box.appendChild(gTitle);
      const gList = createEl('div', { className: 'flex flex-col gap-2' });
      const grants = r.data.grants || [];
      if (grants.length === 0) {
        const empty = createEl('div', { className: 'text-sm text-gray-500' }); empty.textContent = 'No active grants.';
        gList.appendChild(empty);
      } else {
        grants.forEach((g) => {
          const row = createEl('div', { className: 'card-item' });
          const top = createEl('div', { className: 'flex justify-between mb-1 font-medium text-sm text-gray-800' });
          top.textContent = `Amt: ${g.amount} | Rem: ${g.remaining}`;
          const bot = createEl('div', { className: 'text-xs text-gray-500' });
          bot.textContent = `Expires: ${g.expires_at ? g.expires_at.split(' ')[0] : 'Never'}`;
          row.appendChild(top); row.appendChild(bot);
          gList.appendChild(row);
        });
      }
      box.appendChild(gList);
      
      const cTitle = createEl('div', { className: 'text-base font-semibold text-gray-800 mt-4 mb-2' }); cTitle.textContent = 'Consumptions'; box.appendChild(cTitle);
      const cList = createEl('div', { className: 'flex flex-col gap-2' });
      const consumptions = r.data.consumptions || [];
      if (consumptions.length === 0) {
        const empty = createEl('div', { className: 'text-sm text-gray-500' }); empty.textContent = 'No recent activity.';
        cList.appendChild(empty);
      } else {
        consumptions.forEach((c) => {
          const row = createEl('div', { className: 'card-item' });
          const top = createEl('div', { className: 'flex justify-between mb-1 font-medium text-sm text-gray-800' });
          top.textContent = `Amt: ${c.amount} | ${c.reason || '-'}`;
          const bot = createEl('div', { className: 'text-xs text-gray-500' });
          bot.textContent = `Used: ${c.used_at ? c.used_at.split(' ')[0] : '-'}`;
          row.appendChild(top); row.appendChild(bot);
          cList.appendChild(row);
        });
      }
      box.appendChild(cList);
    });
  });
  
  refresh();
}

document.addEventListener('DOMContentLoaded', mount);
