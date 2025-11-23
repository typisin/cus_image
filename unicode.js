/**
 * Turn Images into Unicode Converter
 * Converts images to ASCII/Unicode art with customizable settings
 */

class ImageToUnicodeConverter {
  constructor() {
    this.currentImage = null;
    this.lastAscii = '';
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
    const densitySlider = document.getElementById('densitySlider');
    const widthSlider = document.getElementById('widthSlider');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // File input
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    
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
        document.getElementById('convertBtn').disabled = false;
        const area = document.getElementById('uploadArea');
        area && area.classList.add('has-image');
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
    
    // 获取原图在页面中的实际展示尺寸
    const imgEl = document.getElementById('imagePreview');
    const w = imgEl ? imgEl.clientWidth : this.currentImage.width;
    const h = imgEl ? imgEl.clientHeight : this.currentImage.height;

    // 将unicode预览区域限制为与原图一致的宽高
    if (pane) {
      pane.style.width = w + 'px';
      pane.style.height = h + 'px';
    }
    if (out) {
      out.style.width = w + 'px';
      out.style.height = h + 'px';
      out.style.maxWidth = w + 'px';
      out.style.maxHeight = h + 'px';
      out.style.overflow = 'auto';
    }

    // 根据限制后的空间自适配字号
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
    const out = document.getElementById('unicodeOutput');
    const blob = new Blob([out.textContent || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unicode.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ImageToUnicodeConverter();
});