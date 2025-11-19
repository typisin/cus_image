// AI Cutout JavaScript Functionality

class AICutout {
    constructor() {
        this.originalImage = null;
        this.cutoutImage = null;
        this.token = '';
        this.selectedFile = null;
        this.fileId = null;
        
        console.log('AICutout constructor called');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM ready - initializing event listeners');
                this.initializeEventListeners();
            });
        } else {
            console.log('DOM already ready - initializing event listeners immediately');
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const tokenInput = document.getElementById('tokenInput');
        const saveTokenBtn = document.getElementById('saveTokenBtn');
        const doUploadBtn = document.getElementById('doUploadBtn');
        const doCutoutBtn = document.getElementById('doCutoutBtn');

        // Debug: Check if buttons exist
        console.log('Upload button found:', doUploadBtn);
        console.log('Cutout button found:', doCutoutBtn);
        console.log('Cutout button initial classes:', doCutoutBtn ? doCutoutBtn.className : 'null');
        console.log('Cutout button initial style:', doCutoutBtn ? doCutoutBtn.style.display : 'null');

        // File input change
        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Button events
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => {
                this.token = tokenInput && tokenInput.value ? tokenInput.value.trim() : '';
                console.log('Token saved:', this.token ? 'present' : 'missing');
            });
        }
        if (doUploadBtn) {
            doUploadBtn.addEventListener('click', async () => {
                if (!this.selectedFile) {
                    alert('Please select a file first');
                    return;
                }
                try {
                    const fileId = await this.uploadToServer(this.selectedFile);
                    console.log('File uploaded, ID:', fileId);
                    
                    // Store fileId for cutout process
                    this.fileId = fileId;
                    this.showUploadResult(fileId);
                    
                    // Show cutout button and hide upload button
                    console.log('Showing cutout button, hiding upload button');
                    console.log('Upload button element:', doUploadBtn);
                    console.log('Cutout button element:', doCutoutBtn);
                    
                    // Force button visibility check
                    console.log('Before visibility change:');
                    if (doUploadBtn) {
                        console.log('Upload button display:', window.getComputedStyle(doUploadBtn).display);
                        console.log('Upload button classes:', doUploadBtn.className);
                    }
                    if (doCutoutBtn) {
                        console.log('Cutout button display:', window.getComputedStyle(doCutoutBtn).display);
                        console.log('Cutout button classes:', doCutoutBtn.className);
                    }
                    
                    if (doUploadBtn) {
                        doUploadBtn.classList.add('hidden');
                        doUploadBtn.classList.remove('visible');
                        console.log('Upload button hidden - new classes:', doUploadBtn.className);
                    }
                    if (doCutoutBtn) {
                        doCutoutBtn.classList.remove('hidden');
                        doCutoutBtn.classList.add('visible');
                        console.log('Cutout button shown - new classes:', doCutoutBtn.className);
                        console.log('Cutout button new display:', window.getComputedStyle(doCutoutBtn).display);
                    }
                } catch (err) {
                    console.error(err);
                    alert('Upload failed. Please retry.');
                }
            });
        }
        if (doCutoutBtn) {
            doCutoutBtn.addEventListener('click', async () => {
                if (!this.fileId) {
                    alert('Please upload a file first');
                    return;
                }
                try {
                    // Show loading state
                    this.showCutoutLoading(true);
                    
                    // Run workflow
                    const workflowResult = await this.runWorkflow(this.fileId);
                    
                    // Process and display results
                    await this.processCutoutResult(workflowResult);
                    
                    // Hide loading state
                    this.showCutoutLoading(false);
                } catch (err) {
                    console.error(err);
                    this.showCutoutLoading(false);
                    alert('Cutout failed. Please retry.');
                }
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
        if (!file) return;
        if (!this.validateImageFile(file)) return;
        this.selectedFile = file;
        this.displayFileInfo(file);
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
        if (!this.validateImageFile(file)) return;
        this.selectedFile = file;
        this.displayFileInfo(file);
    }

    displayFileInfo(file) {
        const pathEl = document.getElementById('selectedFilePath');
        if (pathEl) pathEl.textContent = file.name;
        
        // Store file for processing
        this.selectedFile = file;
        
        // Create object URL for preview
        if (this.originalImage) {
            URL.revokeObjectURL(this.originalImage);
        }
        this.originalImage = URL.createObjectURL(file);
    }

    displayOriginalImage() {
        const originalImageEl = document.getElementById('originalImage');
        originalImageEl.src = this.originalImage;
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    }

    // simplified flow: no workflow run

    // simplified flow: no workflow polling

    async runWorkflow(fileId) {
        // 不指定workflowId，让后端使用环境变量
        
        console.log('Running workflow with file_id:', fileId);
        
        const payload = {
            file_id: fileId
            // 不传递workflow_id，让后端使用环境变量
        };
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            const res = await fetch('/api/coze/workflow/run', { 
                method: 'POST', 
                body: JSON.stringify(payload), 
                headers 
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Workflow failed:', res.status, errorText);
                throw new Error(`Workflow failed: ${res.status} - ${errorText}`);
            }
            
            const result = await res.json();
            console.log('Workflow success:', result);
            return result;
        } catch (error) {
            console.error('Workflow error:', error);
            throw error;
        }
    }

    async uploadToServer(file) {
        console.log('Uploading with token:', this.token ? 'present' : 'missing')
        
        const fd = new FormData()
        fd.append('file', file)
        
        const headers = {}
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
            console.log('Token being sent:', this.token.substring(0, 10) + '...')
        }
        
        try {
            const res = await fetch('/api/coze/upload', { method: 'POST', body: fd, headers })
            
            if (!res.ok) {
                const errorText = await res.text()
                console.error('Upload failed:', res.status, errorText)
                throw new Error(`Upload failed: ${res.status} - ${errorText}`)
            }
            
            const result = await res.json()
            console.log('Upload success:', result)
            return result.file_id
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    }

    showUploadResult(fileId) {
        console.log('Showing upload result for fileId:', fileId);
        const section = document.getElementById('uploadResultSection')
        const idEl = document.getElementById('resultFileId')
        const copyBtn = document.getElementById('copyFileIdBtn')
        
        if (section) {
            section.style.display = 'block';
            console.log('Results section displayed');
        }
        const uploadArea = document.getElementById('uploadArea')
        if (uploadArea) uploadArea.style.display = 'none'
        
        // 显示文件ID
        if (idEl) {
            idEl.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <strong>File ID:</strong> ${fileId}
                </div>
                <div style="margin-bottom: 16px; color: var(--gray-600); font-size: 14px;">
                    Click "Start AI Cutout" to process your image
                </div>
            `
        }
        
        if (copyBtn) {
          copyBtn.onclick = () => {
            const textToCopy = `File ID: ${fileId}`
            navigator.clipboard?.writeText(textToCopy)
          }
        }
    }

    async processCutoutResult(workflowResult) {
        console.log('Processing cutout result:', workflowResult);
        
        // Show the cutout results grid
        const cutoutResults = document.getElementById('cutoutResults');
        if (cutoutResults) {
            cutoutResults.style.display = 'grid';
        }
        
        // Display original image
        const originalPreview = document.getElementById('originalImagePreview');
        if (originalPreview && this.originalImage) {
            originalPreview.src = this.originalImage;
        }
        
        // Use the image_url from the workflow response (enhanced by backend)
        let cutoutImageUrl = workflowResult?.image_url;
        
        // Fallback: try to extract from data if image_url is not available
        if (!cutoutImageUrl && workflowResult && workflowResult.data) {
            try {
                const resultData = typeof workflowResult.data === 'string' ? JSON.parse(workflowResult.data) : workflowResult.data;
                
                if (resultData.output && resultData.output.image_url) {
                    cutoutImageUrl = resultData.output.image_url;
                } else if (resultData.image_url) {
                    cutoutImageUrl = resultData.image_url;
                } else if (resultData.url) {
                    cutoutImageUrl = resultData.url;
                } else if (typeof resultData.output === 'string' && resultData.output.startsWith('http')) {
                    cutoutImageUrl = resultData.output;
                }
            } catch (e) {
                console.log('Could not parse workflow result data:', e);
            }
        }
        
        // Display cutout result
        const cutoutPreview = document.getElementById('cutoutImagePreview');
        if (cutoutPreview) {
            if (cutoutImageUrl) {
                cutoutPreview.src = cutoutImageUrl;
                this.cutoutImage = cutoutImageUrl; // Store for download
                console.log('Displaying cutout image:', cutoutImageUrl);
            } else {
                // Show placeholder if no image URL found
                cutoutPreview.style.display = 'none';
                const container = cutoutPreview.parentElement;
                const placeholder = document.createElement('div');
                placeholder.className = 'placeholder-result';
                placeholder.innerHTML = `
                    <div class="placeholder-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 13l3-3 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
                        </svg>
                    </div>
                    <p>AI cutout result will appear here</p>
                `;
                container.appendChild(placeholder);
                console.log('No image URL found in workflow result');
            }
        }
    }

    showCutoutLoading(show) {
        const loadingOverlay = document.getElementById('cutoutLoading');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
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
        const section = document.getElementById('uploadResultSection')
        if (section) section.style.display = 'none'
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('imageInput').value = '';
        
        // Reset buttons
        const uploadBtn = document.getElementById('doUploadBtn');
        const cutoutBtn = document.getElementById('doCutoutBtn');
        if (uploadBtn) {
            uploadBtn.classList.remove('hidden');
            uploadBtn.classList.add('visible');
        }
        if (cutoutBtn) {
            cutoutBtn.classList.add('hidden');
            cutoutBtn.classList.remove('visible');
        }
        
        // Reset images
        if (this.originalImage) {
            URL.revokeObjectURL(this.originalImage);
        }
        this.originalImage = null;
        this.cutoutImage = null;
        this.selectedFile = null;
        this.fileId = null;
        
        const idEl = document.getElementById('resultFileId')
        if (idEl) idEl.textContent = ''
        const pathEl = document.getElementById('selectedFilePath')
        if (pathEl) pathEl.textContent = ''
        
        // Hide cutout results
        const cutoutResults = document.getElementById('cutoutResults')
        if (cutoutResults) cutoutResults.style.display = 'none'
        
        // Reset image previews
        const originalPreview = document.getElementById('originalImagePreview')
        if (originalPreview) originalPreview.src = ''
        const cutoutPreview = document.getElementById('cutoutImagePreview')
        if (cutoutPreview) {
            cutoutPreview.src = ''
            cutoutPreview.style.display = 'block'
        }
        
        // Remove any placeholders
        const containers = document.querySelectorAll('.image-preview-container');
        containers.forEach(container => {
            const placeholder = container.querySelector('.placeholder-result');
            if (placeholder) {
                placeholder.remove();
            }
        });
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
console.log('Loading AICutout tool...');
new AICutout();