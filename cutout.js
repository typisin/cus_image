// AI Cutout JavaScript Functionality

class AICutout {
    constructor() {
        this.originalImage = null;
        this.cutoutImage = null;
        this.token = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const tokenInput = document.getElementById('tokenInput');
        const saveTokenBtn = document.getElementById('saveTokenBtn');

        // File input change
        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Button events
        resetBtn.addEventListener('click', () => this.reset());
        downloadBtn.addEventListener('click', () => this.downloadResult());
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => {
                this.token = tokenInput && tokenInput.value ? tokenInput.value.trim() : '';
            });
        }

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

    async processImage(file) {
        if (!this.validateImageFile(file)) {
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            this.originalImage = e.target.result;
            this.displayOriginalImage();
            try {
              const fileId = await this.uploadToServer(file)
              await this.performWorkflow(fileId)
            } catch (err) {
              console.error(err)
              this.showError('Upload or workflow failed. Please retry.')
            }
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

    async performWorkflow(fileId) {
        const processingIndicator = document.getElementById('processingIndicator');
        const cutoutImageEl = document.getElementById('cutoutImage');
        const placeholderResult = document.getElementById('placeholderResult');
        processingIndicator.style.display = 'flex';
        placeholderResult.style.display = 'block';
        cutoutImageEl.style.display = 'none';
        const runHeaders = { 'Content-Type': 'application/json' }
        if (this.token) runHeaders['x-coze-token'] = this.token
        const runRes = await fetch('/api/coze/cutout/run', { method: 'POST', headers: runHeaders, body: JSON.stringify({ file_id: fileId }) })
        if (!runRes.ok) throw new Error('workflow run failed')
        const { run_id } = await runRes.json()
        const result = await this.pollStatus(run_id)
        const imageUrl = result?.image_url || result?.url || result?.dataUrl
        if (!imageUrl) throw new Error('no result image')
        this.cutoutImage = imageUrl
        cutoutImageEl.src = this.cutoutImage
        processingIndicator.style.display = 'none';
        placeholderResult.style.display = 'none';
        cutoutImageEl.style.display = 'block';
    }

    async pollStatus(runId) {
        const start = Date.now()
        const timeoutMs = 120000
        const intervalMs = 1500
        while (Date.now() - start < timeoutMs) {
            const statusHeaders = {}
            if (this.token) statusHeaders['x-coze-token'] = this.token
            const res = await fetch(`/api/coze/cutout/status?run_id=${encodeURIComponent(runId)}`, { headers: statusHeaders })
            if (!res.ok) throw new Error('status fetch failed')
            const { status, result } = await res.json()
            if (status === 'succeeded' || status === 'completed') return result
            if (status === 'failed' || status === 'error') throw new Error('workflow failed')
            await new Promise(r => setTimeout(r, intervalMs))
        }
        throw new Error('workflow timeout')
    }

    async uploadToServer(file) {
        const fd = new FormData()
        fd.append('file', file)
        const headers = {}
        if (this.token) headers['x-coze-token'] = this.token
        const res = await fetch('/api/coze/upload', { method: 'POST', body: fd, headers })
        if (!res.ok) throw new Error('upload failed')
        const { file_id } = await res.json()
        return file_id
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