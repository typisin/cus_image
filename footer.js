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
                <li><a href="/turn-image-into-pixel-art" class="footer-link">Turn Image into Pixel Art</a></li>
                <li><a href="/turn-images-into-unicode" class="footer-link">Turn Images into Unicode</a></li>
                <li><a href="/image-dpi-converter" class="footer-link">Image DPI Converter</a></li>
                <li><a href="/convert-jpeg-to-jpg" class="footer-link">JPEG to JPG</a></li>
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
    .support-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px}
    .support-modal{width:420px;max-width:92vw;background:rgba(7,11,22,0.86);border-radius:20px;border:1px solid rgba(231,238,252,0.14);box-shadow:0 24px 80px rgba(0,0,0,0.55);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,Helvetica,Arial}
    .support-modal header{padding:16px 18px;border-bottom:1px solid rgba(231,238,252,0.12);font-weight:800;font-size:16px;letter-spacing:0.01em;color:rgba(231,238,252,0.92);display:flex;justify-content:space-between;align-items:center}
    .support-modal .body{padding:18px}
    .support-close{width:36px;height:36px;border:1px solid rgba(231,238,252,0.16);border-radius:12px;background:rgba(231,238,252,0.06);color:rgba(231,238,252,0.78);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 120ms ease, background 220ms ease, border-color 220ms ease, color 220ms ease}
    .support-close:hover{background:rgba(231,238,252,0.10);border-color:rgba(34,211,238,0.45);color:rgba(231,238,252,0.92)}
    .support-close:active{transform:translateY(1px)}
    .support-row{display:flex;gap:10px;align-items:center;margin-top:10px}
    .support-email{flex:1;padding:12px 14px;border:1px solid rgba(231,238,252,0.18);border-radius:12px;font-size:14px;color:rgba(231,238,252,0.92);background:rgba(7,11,22,0.62);user-select:all}
    .support-btn{padding:12px 14px;border:1px solid rgba(231,238,252,0.16);border-radius:999px;background:linear-gradient(135deg, rgba(91, 140, 255, 1), rgba(34, 211, 238, 0.92));color:rgba(7, 11, 22, 0.96);font-weight:800;letter-spacing:0.01em;cursor:pointer;transition:transform 120ms ease, box-shadow 220ms ease, filter 220ms ease}
    .support-btn:hover{transform:translateY(-1px);box-shadow:0 16px 40px rgba(0,0,0,0.35);filter:saturate(1.08) brightness(1.02)}
    .support-btn:active{transform:translateY(0);box-shadow:0 2px 10px rgba(0,0,0,0.25)}
    .support-toast{margin-top:12px;font-size:12px;color:rgba(34,211,238,0.92);display:none}
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
