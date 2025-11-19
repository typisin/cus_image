// AI Cutout JavaScript Functionality

class AICutout {
    constructor() {
        this.originalImage = null;
        this.cutoutImage = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        // File input change
        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Button events
        resetBtn.addEventListener('click', () => this.reset());
        downloadBtn.addEventListener('click', () => this.downloadResult());

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => e.preventDefault());
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
            this.processImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }

    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPG, PNG, or WebP)');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return false;
        }

        return true;
    }

    processImage(file) {
        if (!this.validateImageFile(file)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = e.target.result;
            this.displayOriginalImage();
            this.performAICutout();
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImage() {
        const originalImageEl = document.getElementById('originalImage');
        originalImageEl.src = this.originalImage;
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    }

    async performAICutout() {
        const processingIndicator = document.getElementById('processingIndicator');
        const cutoutImageEl = document.getElementById('cutoutImage');
        const placeholderResult = document.getElementById('placeholderResult');

        // Show processing indicator
        processingIndicator.style.display = 'flex';
        placeholderResult.style.display = 'block';
        cutoutImageEl.style.display = 'none';

        try {
            // Simulate AI processing time
            await this.simulateAICutout();
            
            // For demo purposes, create a simple cutout effect
            // In a real implementation, this would call an AI API
            const cutoutResult = await this.createSimpleCutout(this.originalImage);
            
            this.cutoutImage = cutoutResult;
            cutoutImageEl.src = this.cutoutImage;
            
            // Hide processing indicator and show result
            processingIndicator.style.display = 'none';
            placeholderResult.style.display = 'none';
            cutoutImageEl.style.display = 'block';
            
        } catch (error) {
            console.error('AI Cutout failed:', error);
            this.showError('AI processing failed. Please try again.');
            processingIndicator.style.display = 'none';
        }
    }

    async simulateAICutout() {
        // Simulate processing time between 2-4 seconds
        const processingTime = 2000 + Math.random() * 2000;
        return new Promise(resolve => setTimeout(resolve, processingTime));
    }

    async createSimpleCutout(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Create a simple mask effect (simulate cutout)
                // This is a basic implementation - real AI would be much more sophisticated
                ctx.drawImage(img, 0, 0);
                
                // Create a radial gradient mask
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.globalCompositeOperation = 'destination-in';
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add a white background
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageSrc;
        });
    }

    showError(message) {
        const placeholderResult = document.getElementById('placeholderResult');
        placeholderResult.innerHTML = `
            <div class="placeholder-icon" style="background: var(--error-light, #fef2f2); color: var(--error, #ef4444);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <p style="color: var(--error, #ef4444);">${message}</p>
        `;
    }

    reset() {
        // Reset to initial state
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('imageInput').value = '';
        
        // Reset images
        this.originalImage = null;
        this.cutoutImage = null;
        document.getElementById('originalImage').src = '';
        document.getElementById('cutoutImage').src = '';
        
        // Reset placeholder
        const placeholderResult = document.getElementById('placeholderResult');
        placeholderResult.innerHTML = `
            <div class="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h10a3 3 0 0 1 3 3v10" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="17" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 17l10-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <p>AI is processing your image...</p>
        `;
    }

    downloadResult() {
        if (!this.cutoutImage) {
            alert('No result to download');
            return;
        }

        const link = document.createElement('a');
        link.download = `ai-cutout-${Date.now()}.png`;
        link.href = this.cutoutImage;
        link.click();
    }
}

// Initialize the AI Cutout tool
document.addEventListener('DOMContentLoaded', () => {
    new AICutout();
});