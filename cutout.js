// AI Cutout JavaScript Functionality

class AICutout {
    constructor() {
        this.originalImage = null;
        this.cutoutImage = null;
        this.token = '';
        this.selectedFile = null;
        this.fileId = null;
        this.cutoutBlobUrl = null;
        this.cutoutBlob = null;
        this.uploadSection = null;
        this.uploadSectionParent = null;
        this.uploadSectionNextSibling = null;
        
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
        const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');

        // Debug: Check if buttons exist
        console.log('Remove Background button found:', removeBackgroundBtn);

        // File input change
        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Button events
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadResult());
        if (removeBackgroundBtn) {
            removeBackgroundBtn.addEventListener('click', async () => {
                if (!this.selectedFile) {
                    alert('Please select a file first');
                    return;
                }
                
                try {
                    // Disable button and show loading state
                    removeBackgroundBtn.disabled = true;
                    removeBackgroundBtn.textContent = 'Processing...';
                    
                    // Detach upload section and show loading
                    this.detachUploadSection();
                    this.showResults(true);
                    this.showCutoutLoading(true);
                    
                    // Hide the placeholder and show the actual image container
                    this.showCutoutLoadingPlaceholder(false);
                    
                    // Upload file
                    console.log('Uploading file...');
                    const fileId = await this.uploadToServer(this.selectedFile);
                    console.log('File uploaded, ID:', fileId);
                    this.fileId = fileId;
                    
                    // Immediately start cutout process
                    console.log('Starting background removal...');
                    const workflowResult = await this.runWorkflow(this.fileId);
                    
                    // Process and display results
                    await this.processCutoutResult(workflowResult);
                    
                    // Hide loading state and reset button
                    this.showCutoutLoading(false);
                    removeBackgroundBtn.disabled = false;
                    removeBackgroundBtn.textContent = 'Remove Background';
                    
                } catch (err) {
                    console.error('Background removal failed:', err);
                    this.showCutoutLoading(false);
                    removeBackgroundBtn.disabled = false;
                    removeBackgroundBtn.textContent = 'Remove Background';
                    alert('Background removal failed. Please try again.');
                }
            });
        }

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => e.preventDefault());
        });
    }

    async handleCutoutClick() {
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
    }

    showUploadArea(show) {
        const uploadArea = document.getElementById('uploadArea');
        const uploadSection = document.querySelector('.upload-section');
        const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        
        if (uploadArea) uploadArea.style.display = show ? 'block' : 'none';
        if (uploadSection) uploadSection.style.display = show ? 'block' : 'none';
        
        // When hiding upload area, also hide the Remove Background button
        if (!show && removeBackgroundBtn) {
            removeBackgroundBtn.style.display = 'none';
        }
    }

    showResults(show) {
        const resultsSection = document.getElementById('resultsSection');
        const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        
        if (resultsSection) resultsSection.style.display = show ? 'block' : 'none';
        
        // Show/hide the Remove Background button when results are shown/hidden
        if (removeBackgroundBtn) {
            removeBackgroundBtn.style.display = show ? 'inline-block' : 'none';
        }
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
        
        // Switch to file-selected state: hide upload content, show centered button
        this.showFileSelectedState();
        
        // Show original image immediately in results section
        this.showOriginalImageImmediately();
    }
    
    showFileSelectedState() {
        const uploadContent = document.querySelector('.upload-content');
        const uploadArea = document.getElementById('uploadArea');
        
        if (!uploadContent || !uploadArea) return;
        
        // Add file-selected class to upload area for CSS-based styling
        uploadArea.classList.add('file-selected');
        
        // Don't show the Remove Background button here anymore
        // It will be shown when results are displayed
    }
    
    showFilePreview() {
        // Create and show image preview in upload area
        const uploadContent = document.querySelector('.upload-content');
        if (!uploadContent) return;
        
        // Remove existing preview if any
        const existingPreview = uploadContent.querySelector('.file-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Create preview element
        const previewDiv = document.createElement('div');
        previewDiv.className = 'file-preview';
        previewDiv.innerHTML = `
            <div class="preview-image-container">
                <img src="${this.originalImage}" alt="Selected image preview" class="preview-image">
            </div>
            <div class="file-info">
                <p class="file-name">${this.selectedFile.name}</p>
                <p class="file-size">${this.formatFileSize(this.selectedFile.size)}</p>
            </div>
        `;
        
        // Insert preview after upload title
        const uploadTitle = uploadContent.querySelector('.upload-title');
        if (uploadTitle) {
            uploadTitle.parentNode.insertBefore(previewDiv, uploadTitle.nextSibling);
        }
    }
    
    showRemoveBackgroundButton(show) {
        const removeBtn = document.getElementById('removeBackgroundBtn');
        if (removeBtn) {
            removeBtn.style.display = show ? 'inline-block' : 'none';
            if (show) {
                removeBtn.classList.add('visible');
            }
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showOriginalImageImmediately() {
        // Detach upload section and show results immediately after upload
        this.detachUploadSection();
        this.showResults(true);
        
        // Display original image in the results section
        const originalPreview = document.getElementById('originalImagePreview');
        if (originalPreview && this.originalImage) {
            originalPreview.src = this.originalImage;
        }
        
        // Hide the cutout result initially and show loading placeholder
        const cutoutPreview = document.getElementById('cutoutImagePreview');
        if (cutoutPreview) {
            cutoutPreview.style.display = 'none';
            // Show loading placeholder
            this.showCutoutLoadingPlaceholder(true);
        }
        
        // Hide download button initially
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    }
    
    showCutoutLoadingPlaceholder(show) {
        const cutoutPreview = document.getElementById('cutoutImagePreview');
        const container = cutoutPreview?.parentElement;
        
        if (!container) return;
        
        // Remove existing placeholder
        const existingPlaceholder = container.querySelector('.loading-placeholder');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        
        if (show) {
            const placeholder = document.createElement('div');
            placeholder.className = 'loading-placeholder';
            placeholder.innerHTML = `
                <div class="placeholder-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M8 13l3-3 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
                    </svg>
                </div>
                <p>Ready for AI cutout processing</p>
            `;
            container.appendChild(placeholder);
        }
    }

    displayOriginalImage() {
        const originalImageEl = document.getElementById('originalImage');
        originalImageEl.src = this.originalImage;
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        this.detachUploadSection();
    }

    detachUploadSection() {
        if (this.uploadSection) return;
        const section = document.querySelector('.upload-section');
        if (!section) return;
        this.uploadSection = section;
        this.uploadSectionParent = section.parentNode;
        this.uploadSectionNextSibling = section.nextSibling;
        this.uploadSection.remove();
    }

    restoreUploadSection() {
        if (!this.uploadSection || !this.uploadSectionParent) return;
        if (this.uploadSectionNextSibling) {
            this.uploadSectionParent.insertBefore(this.uploadSection, this.uploadSectionNextSibling);
        } else {
            this.uploadSectionParent.appendChild(this.uploadSection);
        }
        this.uploadSection = null;
        this.uploadSectionParent = null;
        this.uploadSectionNextSibling = null;
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
        const cutoutBtnInResults = document.getElementById('cutoutBtnInResults')
        
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
        
        // Show the cutout button in results and add click handler
        if (cutoutBtnInResults) {
            cutoutBtnInResults.style.display = 'inline-block';
            cutoutBtnInResults.onclick = async () => {
                await this.handleCutoutClick();
            };
            console.log('Cutout button in results is now visible and clickable');
        }
    }

    async processCutoutResult(workflowResult) {
        console.log('Processing cutout result:', workflowResult);
        
        // Display original image immediately (already shown after upload)
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
                this.cutoutImage = cutoutImageUrl;
                console.log('Displaying cutout image:', cutoutImageUrl);
                
                // **IMPORTANT: Make the image visible!**
                cutoutPreview.style.display = 'block';
                
                // Hide the loading overlay and placeholder
                this.showCutoutLoading(false);
                const container = cutoutPreview.parentElement;
                const existingPlaceholder = container.querySelector('.loading-placeholder');
                if (existingPlaceholder) {
                    existingPlaceholder.style.display = 'none';
                }
                
                // Show download button
                const downloadBtn = document.getElementById('downloadBtn');
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-flex';
                }

                fetch(cutoutImageUrl, { mode: 'cors' })
                    .then(res => res.blob())
                    .then(blob => {
                        if (this.cutoutBlobUrl) URL.revokeObjectURL(this.cutoutBlobUrl);
                        this.cutoutBlobUrl = URL.createObjectURL(blob);
                        this.cutoutBlob = blob;
                    })
                    .catch(() => {});
            } else {
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
        // Restore upload section back to DOM
        this.restoreUploadSection();
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.display = 'block';
            uploadArea.classList.remove('file-selected'); // Remove file-selected class
        }
        document.getElementById('imageInput').value = '';
        
        // Hide Remove Background button (now in new position)
        const removeBtn = document.getElementById('removeBackgroundBtn');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
        
        // Remove file preview
        const uploadContent = document.querySelector('.upload-content');
        if (uploadContent) {
            const existingPreview = uploadContent.querySelector('.file-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
        }
        
        // Reset buttons (legacy cleanup)
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
        if (this.cutoutBlobUrl) URL.revokeObjectURL(this.cutoutBlobUrl);
        this.cutoutBlobUrl = null;
        this.cutoutBlob = null;
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
        
        // Hide download button
        const downloadBtn = document.getElementById('downloadBtn')
        if (downloadBtn) downloadBtn.style.display = 'none'
        
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

        const filename = `ai-cutout-${Date.now()}.png`;
        if (window.showSaveFilePicker) {
            (async () => {
                try {
                    const blob = this.cutoutBlob || (await (await fetch(this.cutoutImage, { mode: 'cors' })).blob());
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    this.showToast('Download complete');
                } catch (e) {
                    const a = document.createElement('a');
                    const url = this.cutoutBlobUrl || this.cutoutImage;
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            })();
            return;
        }
        if (this.cutoutBlobUrl) {
            const a = document.createElement('a');
            a.href = this.cutoutBlobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }
        fetch(this.cutoutImage, { mode: 'cors' })
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .catch(() => {
                const link = document.createElement('a');
                link.download = filename;
                link.href = this.cutoutImage;
                link.click();
            });
    }

    showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

// Initialize the AI Cutout tool
console.log('Loading AICutout tool...');
new AICutout();