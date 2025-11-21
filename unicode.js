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
    const aspectRatio = this.currentImage.height / this.currentImage.width;
    const outputHeight = Math.floor(outputWidth * aspectRatio);
    
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
    
    // 转换为ASCII/Unicode艺术
    const asciiArt = this.imageDataToAscii(imageData, charset);
    this.lastAscii = asciiArt;
    const out = document.getElementById('unicodeOutput');
    out.textContent = asciiArt;
    this.fitAsciiToPane();
  }

  initializePaneHeights() {
    const area = document.getElementById('uploadArea');
    if (!area) return;
    const h = area.clientHeight || 600;
    const paneH = Math.max(200, Math.floor(h / 2));
    area.style.setProperty('--pane-h', paneH + 'px');
  }

  fitAsciiToPane() {
    const out = document.getElementById('unicodeOutput');
    const pane = document.getElementById('unicodePane');
    if (!out || !pane || !this.lastAscii) return;
    const text = this.lastAscii;
    const lines = text.split('\n');
    const linesCount = Math.max(1, lines.length);
    const maxLen = Math.max(...lines.map(l => l.length));
    const paneWidth = pane.clientWidth;
    const paneHeight = pane.clientHeight;
    const lineHeightFactor = 1.1;
    const charWidthFactor = 0.6;
    const fsV = Math.max(8, Math.floor(paneHeight / (linesCount * lineHeightFactor)));
    const fsH = Math.max(8, Math.floor(paneWidth / (Math.max(1, maxLen) * charWidthFactor)));
    const fontSize = Math.max(8, Math.min(fsV, fsH, 24));
    out.style.fontSize = fontSize + 'px';
    out.style.lineHeight = lineHeightFactor;
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