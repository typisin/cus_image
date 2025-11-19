/**
 * Image to Unicode Converter
 * Converts images to ASCII/Unicode art with customizable settings
 */

class ImageToUnicodeConverter {
  constructor() {
    this.currentImage = null;
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
  }
  
  initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const densitySlider = document.getElementById('densitySlider');
    const widthSlider = document.getElementById('widthSlider');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
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
    
    // Result actions
    copyBtn.addEventListener('click', () => this.copyResult());
    downloadBtn.addEventListener('click', () => this.downloadResult());
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
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  updatePreview() {
    if (!this.currentImage) return;
    
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for preview
    const maxSize = 300;
    const scale = Math.min(maxSize / this.currentImage.width, maxSize / this.currentImage.height);
    canvas.width = this.currentImage.width * scale;
    canvas.height = this.currentImage.height * scale;
    
    ctx.drawImage(this.currentImage, 0, 0, canvas.width, canvas.height);
  }
  
  updateDensityDisplay(e) {
    document.getElementById('densityValue').textContent = e.target.value;
  }
  
  updateWidthDisplay(e) {
    document.getElementById('widthValue').textContent = e.target.value;
  }
  
  convertImage() {
    if (!this.currentImage) return;
    
    const density = parseFloat(document.getElementById('densitySlider').value);
    const outputWidth = parseInt(document.getElementById('widthSlider').value);
    const charsetType = document.getElementById('charsetSelect').value;
    const charset = this.charSets[charsetType];
    
    // Calculate dimensions
    const aspectRatio = this.currentImage.height / this.currentImage.width;
    const outputHeight = Math.floor(outputWidth * aspectRatio * 0.5 * density); // 0.5 to account for character height
    
    // Set canvas size for processing
    this.canvas.width = outputWidth;
    this.canvas.height = outputHeight;
    
    // Draw and process image
    this.ctx.drawImage(this.currentImage, 0, 0, outputWidth, outputHeight);
    const imageData = this.ctx.getImageData(0, 0, outputWidth, outputHeight);
    
    // Convert to ASCII
    const ascii = this.imageDataToAscii(imageData, charset);
    
    // Display result
    document.getElementById('unicodeOutput').textContent = ascii;
    document.getElementById('unicodePreview').textContent = ascii;
    document.getElementById('resultSection').style.display = 'block';
    
    // Scroll to result
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
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
  
  copyResult() {
    const output = document.getElementById('unicodeOutput');
    const text = output.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyBtn');
      const originalText = btn.textContent;
      btn.textContent = '已复制!';
      btn.style.background = 'var(--success)';
      btn.style.color = 'white';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      const btn = document.getElementById('copyBtn');
      btn.textContent = '已复制!';
      setTimeout(() => {
        btn.textContent = '复制';
      }, 2000);
    });
  }
  
  downloadResult() {
    const output = document.getElementById('unicodeOutput');
    const text = output.textContent;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unicode-art.txt';
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