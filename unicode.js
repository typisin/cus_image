/**
 * Turn Images into Unicode Converter
 * Converts images to ASCII/Unicode art with customizable settings
 */

class ImageToUnicodeConverter {
  constructor() {
    this.currentImage = null;
    this.lastAscii = '';
    this.hasImage = false;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Character sets for different styles
    this.charSets = {
      standard: ' .:-=+*#%@',
      blocks: ' ░▒▓█',
      simple: ' .-:#',
      detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\//tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
    };
    
    this.initializeEventListeners();
    this.initializePaneHeights();
  }
  
  initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const emptyState = uploadArea && uploadArea.querySelector('.empty-state');
    const uploadBtn = emptyState && emptyState.querySelector('.upload-btn');
    const densitySlider = document.getElementById('densitySlider');
    const widthSlider = document.getElementById('widthSlider');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // File input
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Drag and drop
    uploadArea.addEventListener('dragenter', (e) => e.preventDefault());
    uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    // 仅在空态时允许容器点击触发文件选择，且忽略按钮本身的点击
    uploadArea.addEventListener('click', (e) => {
      if (this.hasImage) return;
      if (e.target && e.target.closest('.upload-btn')) return;
      fileInput && fileInput.click();
    });

    // 当空态层启用 pointer-events 时，确保拖拽事件同样可用
    if (emptyState) {
      ['dragenter','dragover','dragleave','drop'].forEach(evt => {
        emptyState.addEventListener(evt, (e) => e.preventDefault());
      });
      emptyState.addEventListener('dragover', (e) => this.handleDragOver(e));
      emptyState.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      emptyState.addEventListener('drop', (e) => this.handleDrop(e));
    }

    if (uploadBtn) {
      uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
    
    // Controls
    densitySlider.addEventListener('input', (e) => this.updateDensityDisplay(e));
    widthSlider.addEventListener('input', (e) => this.updateWidthDisplay(e));
    convertBtn.addEventListener('click', () => this.convertImage());
    
    downloadBtn.addEventListener('click', () => this.downloadResult());

    window.addEventListener('resize', () => {
      this.initializePaneHeights();
      if (this.lastAscii) this.fitAsciiToPane();
    });
  }
  
  handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
  }
  
  handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
  }
  
  handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }
  
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }
  
  processFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件！');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.updatePreview();
        const previewEl = document.getElementById('imagePreview');
        if (previewEl) previewEl.style.display = 'block';
        const area = document.getElementById('uploadArea');
        const rs = area && area.querySelector('.result-state');
        const es = area && area.querySelector('.empty-state');
        const uPane = document.getElementById('unicodePane');
        const iPane = document.getElementById('imagePane');
        if (rs) rs.style.display = 'block';
        if (es) es.style.display = 'none';
        uPane && uPane.classList.add('hidden');
        iPane && iPane.classList.remove('hidden');
        document.getElementById('convertBtn').disabled = false;
        area && area.classList.add('has-image');
        this.hasImage = true;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  updatePreview() {
    if (!this.currentImage) return;
    const el = document.getElementById('imagePreview');
    el.src = this.currentImage.src;
  }
  
  updateDensityDisplay(e) {
    document.getElementById('densityValue').textContent = e.target.value;
  }
  
  updateWidthDisplay(e) {
    document.getElementById('widthValue').textContent = e.target.value;
  }
  
  convertImage() {
    if (!this.currentImage) return;
    
    const outputWidth = parseInt(document.getElementById('widthSlider').value);
    
    // 关键：考虑字符的宽高比例
    // 等宽字符的宽度大约是高度的0.6倍，所以需要调整高度计算
    const charAspectRatio = 0.6; // 字符宽度与高度的比例
    const imageAspectRatio = this.currentImage.height / this.currentImage.width;
    
    // 调整输出高度以保持视觉上的正确比例
    const adjustedAspectRatio = imageAspectRatio / charAspectRatio;
    const outputHeight = Math.floor(outputWidth * adjustedAspectRatio);
    
    // 获取字符集
    const charsetSelect = document.getElementById('charsetSelect');
    const charset = this.charSets[charsetSelect.value] || this.charSets.standard;
    
    // 创建临时canvas进行转换
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = outputWidth;
    tempCanvas.height = outputHeight;
    
    // 绘制图片到临时canvas
    tempCtx.drawImage(this.currentImage, 0, 0, outputWidth, outputHeight);
    
    // 获取图像数据
    const imageData = tempCtx.getImageData(0, 0, outputWidth, outputHeight);
    
    // 转换为ASCII
    const asciiArt = this.imageDataToAscii(imageData, charset);
    this.lastAscii = asciiArt;
    
    // 显示结果并设置与原图一致的显示尺寸
    const out = document.getElementById('unicodeOutput');
    const pane = document.getElementById('unicodePane');
    
    out.textContent = asciiArt;
    pane && pane.classList.remove('hidden');

    const imgEl = document.getElementById('imagePreview');
    const targetW = imgEl ? imgEl.clientWidth : this.currentImage.width;
    const targetH = imgEl ? imgEl.clientHeight : this.currentImage.height;

    let canvas = document.getElementById('unicodeCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'unicodeCanvas';
      canvas.className = 'unicode-canvas';
      pane && pane.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const lines = asciiArt.split('\n');
    const rows = Math.max(1, lines.length);
    const cols = Math.max(1, Math.max(...lines.map(l => l.length)));

    const charWidthFactor = 0.6;
    const cellW = Math.max(6, Math.floor(targetW / cols));
    const cellH = Math.max(6, Math.floor(targetH / rows));
    const fontSize = Math.max(6, Math.min(cellH, Math.floor(cellW / charWidthFactor)));
    canvas.width = cols * cellW;
    canvas.height = rows * cellH;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111827';
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace`;
    ctx.textBaseline = 'top';

    for (let y = 0; y < rows; y++) {
      const line = lines[y] || '';
      for (let x = 0; x < line.length; x++) {
        const ch = line[x];
        ctx.fillText(ch, x * cellW, y * cellH);
      }
    }

    // 显示为可预览的等比例图片
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    if (out) out.style.display = 'none';
    
    this.fitAsciiToPane();
  }

  initializePaneHeights() {
    const area = document.getElementById('uploadArea');
    if (!area) return;
    const h = area.clientHeight || 600;
    const paneH = Math.max(200, Math.floor(h / 2));
    area.style.setProperty('--pane-h', paneH + 'px');
  }

  adjustContainerHeight(asciiText, outputElement, paneElement) {
    if (!outputElement || !paneElement) return;
    
    const lines = asciiText.split('\n');
    const lineCount = lines.length;
    const maxChars = Math.max(...lines.map(line => line.length));
    
    // 计算所需的最小高度（基于字符大小和行数）
    const baseFontSize = 12;
    const lineHeight = 1.1;
    const charHeight = baseFontSize * lineHeight;
    const minHeight = Math.max(400, lineCount * charHeight + 120); // 加上header和padding
    
    // 设置最小高度
    paneElement.style.minHeight = minHeight + 'px';
    outputElement.style.minHeight = (lineCount * charHeight + 20) + 'px';
    
    // 确保父容器也适应
    const contentPane = paneElement.closest('.content-pane');
    if (contentPane) {
      contentPane.style.minHeight = (minHeight + 40) + 'px';
    }
  }
  
  fitAsciiToPane() {
    const out = document.getElementById('unicodeOutput');
    const pane = document.getElementById('unicodePane');
    if (!out || !pane || !this.lastAscii) return;
    
    const text = this.lastAscii;
    const lines = text.split('\n');
    const linesCount = Math.max(1, lines.length);
    const maxLen = Math.max(...lines.map(l => l.length));
    const paneWidth = pane.clientWidth - 32; // 减去padding
    const paneHeight = pane.clientHeight - 80; // 减去header高度
    const lineHeightFactor = 1.1;
    const charWidthFactor = 0.6; // 字符宽高比例因子
    
    // 计算合适的字体大小，考虑字符宽高比例
    const fsV = Math.max(6, Math.floor(paneHeight / (linesCount * lineHeightFactor)));
    const fsH = Math.max(6, Math.floor(paneWidth / (Math.max(1, maxLen) * charWidthFactor)));
    const fontSize = Math.max(6, Math.min(fsV, fsH, 20));
    
    out.style.fontSize = fontSize + 'px';
    out.style.lineHeight = lineHeightFactor;
    
    // 确保内容完全可见并维持比例
    out.style.whiteSpace = 'pre';
    out.style.overflow = 'auto';
    out.style.wordBreak = 'break-all';
    out.style.letterSpacing = '0px';
  }
  
  imageDataToAscii(imageData, charset) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let result = '';
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Convert to grayscale
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        // Map to character
        const charIndex = Math.floor((gray / 255) * (charset.length - 1));
        line += charset[charIndex];
      }
      result += line + '\n';
    }
    
    return result;
  }
  
  
  
  downloadResult() {
    const canvas = document.getElementById('unicodeCanvas');
    const url = canvas ? canvas.toDataURL('image/png') : URL.createObjectURL(new Blob([''], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = canvas ? 'unicode.png' : 'unicode.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  bindResultStopPropagation() {
    const selectors = ['#imagePreview', '#unicodePane', '#unicodeOutput', '#contentGrid'];
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.addEventListener('click', (e) => e.stopPropagation());
    });
  }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new ImageToUnicodeConverter();
  app.bindResultStopPropagation();
});
