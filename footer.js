class CusFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h4 class="footer-title">CusImage</h4>
              <p class="footer-text">Professional AI image describer & smart image tools.</p>
            </div>
            <div class="footer-section">
              <h4 class="footer-title">Tools</h4>
              <ul class="footer-list">
                <li><a href="/image-describer" class="footer-link">Image Describer</a></li>
                <li><a href="/ai-cutout" class="footer-link">AI Cutout</a></li>
                <li><a href="/turn-images-into-unicode" class="footer-link">Turn Images into Unicode</a></li>
                <li><a href="/images-for-fb-cover" class="footer-link">Fb Covers</a></li>
                <li><a href="/400x400-black-image" class="footer-link">400x400 Black Image</a></li>
                <li><a href="/blank-image" class="footer-link">Blank Image</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4 class="footer-title">Friends</h4>
              <ul class="footer-list">
                <li><a href="https://aistage.net" title="AIStage" target="_blank" rel="noopener noreferrer" class="footer-link">AIStage</a></li>
                <li><a href="https://artiverse.app/ai/fluxproweb-com-image-to-prompt/" title="Free Image to Prompt AI" target="_blank" rel="noopener noreferrer" class="footer-link">Free Image to Prompt AI</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p class="footer-text">© 2025 CusImage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }
}
customElements.define('cus-footer', CusFooter);
