class CusFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h4 class="footer-title">CusImage</h4>
              <p class="footer-text">Retro Pixel Art & Unicode Tools.</p>
            </div>
            <div class="footer-section">
              <h4 class="footer-title">Tools</h4>
              <ul class="footer-list">
                <li><a href="/pixel-editor" class="footer-link">Pixel Editor</a></li>
                <li><a href="/turn-image-into-pixel-art" class="footer-link">Turn Image into Pixel Art</a></li>
                <li><a href="/turn-images-into-unicode" class="footer-link">Turn Images into Unicode</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4 class="footer-title">Resources</h4>
              <ul class="footer-list">
                <li><a href="/terms-of-service" class="footer-link">Terms of Service</a></li>
                <li><a href="/privacy-policy" class="footer-link">Privacy Policy</a></li>
                <li><a href="#" class="footer-link support-link">Support</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p class="footer-text">© 2025 CusImage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
    const s = this.querySelector('.support-link');
    if (s) {
      s.addEventListener('click', function(e){
        e.preventDefault();
        ensureSupportStyles();
        showSupportModal('tuyoupeng1997@163.com');
      });
    }
  }
}
customElements.define('cus-footer', CusFooter);

function ensureSupportStyles(){
  if (document.getElementById('support-modal-style')) return;
  const css = document.createElement('style');
  css.id = 'support-modal-style';
  css.textContent = `
    .support-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;z-index:9999}
    .support-modal{width:360px;max-width:90vw;background:#fff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,0.12);font-family:Inter,system-ui,sans-serif}
    .support-modal header{padding:16px 20px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:18px;color:#111;display:flex;justify-content:space-between;align-items:center}
    .support-modal .body{padding:20px}
    .support-close{width:32px;height:32px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#6b7280;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}
    .support-close:hover{background:#f3f4f6;color:#111}
    .support-row{display:flex;gap:8px;align-items:center}
    .support-email{flex:1;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;color:#1f2937;background:#f9fafb;user-select:all}
    .support-btn{padding:10px 12px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-weight:500;cursor:pointer}
    .support-btn:hover{background:#1d4ed8}
    .support-toast{margin-top:10px;font-size:12px;color:#2563eb;display:none}
    .support-toast.show{display:block}
  `;
  document.head.appendChild(css);
}

function showSupportModal(email){
  const bd = document.createElement('div');
  bd.className = 'support-backdrop';
  const m = document.createElement('div');
  m.className = 'support-modal';
  const h = document.createElement('header');
  const title = document.createElement('div'); title.textContent = 'Support';
  const x = document.createElement('button'); x.className = 'support-close'; x.textContent = '×';
  h.appendChild(title); h.appendChild(x);
  const body = document.createElement('div'); body.className = 'body';
  const hint = document.createElement('div'); hint.textContent = 'For any questions, please contact:'; hint.style.marginBottom = '8px';
  const row = document.createElement('div'); row.className = 'support-row';
  const emailBox = document.createElement('input'); emailBox.className = 'support-email'; emailBox.value = email; emailBox.readOnly = true;
  const copy = document.createElement('button'); copy.className = 'support-btn'; copy.textContent = 'Copy';
  const toast = document.createElement('div'); toast.className = 'support-toast'; toast.textContent = 'Email copied';
  row.appendChild(emailBox); row.appendChild(copy);
  body.appendChild(hint); body.appendChild(row); body.appendChild(toast);
  m.appendChild(h); m.appendChild(body); bd.appendChild(m);
  document.body.appendChild(bd);
  function close(){ bd.remove(); }
  bd.addEventListener('click', function(e){ if (e.target === bd) close(); });
  x.addEventListener('click', close);
  copy.addEventListener('click', async function(){
    try { if (navigator.clipboard) await navigator.clipboard.writeText(emailBox.value); }
    catch(e){}
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 1500);
  });
}
