document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const previewArea = document.getElementById('preview-area');
    const previewCanvas = document.getElementById('preview-canvas');
    const pixelSizeInput = document.getElementById('pixel-size');
    const pixelSizeValue = document.getElementById('pixel-size-value');
    const rePixelateBtn = document.getElementById('re-pixelate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const newImageBtn = document.getElementById('new-image-btn');

    let originalImage = null;
    let currentPixelSize = parseInt(pixelSizeInput && pixelSizeInput.value ? pixelSizeInput.value : '10', 10);

    // Custom Modal Logic
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalTitle = document.querySelector('.modal-title');
    let currentConfirmCallback = null;

    function showModal(message, onConfirm = null, isAlert = false) {
        if (!modal) return alert(message); // Fallback
        modalMessage.textContent = message;
        currentConfirmCallback = onConfirm;
        
        if (isAlert) {
            if (modalTitle) modalTitle.textContent = 'NOTICE';
            if (modalCancel) modalCancel.style.display = 'none';
            if (modalConfirm) modalConfirm.textContent = 'OK';
            currentConfirmCallback = () => {}; 
        } else {
            if (modalTitle) modalTitle.textContent = 'CONFIRM ACTION';
            if (modalCancel) modalCancel.style.display = 'block';
            if (modalConfirm) modalConfirm.textContent = 'CONFIRM';
        }
        
        modal.style.display = 'flex';
    }

    function hideModal() {
        if (modal) modal.style.display = 'none';
        currentConfirmCallback = null;
    }

    if (modalCancel) modalCancel.addEventListener('click', hideModal);
    if (modalConfirm) modalConfirm.addEventListener('click', () => {
        if (currentConfirmCallback) {
            currentConfirmCallback();
        }
        hideModal();
    });
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    }

    // Handle File Upload
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (uploadZone) {
        uploadZone.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });

        // Drag and Drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--pixel-secondary)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--pixel-border)';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--pixel-border)';
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }

    const syncPixelSizeUI = (value) => {
        const safe = Number.isFinite(value) ? value : 10;
        currentPixelSize = safe;
        if (pixelSizeValue) pixelSizeValue.textContent = String(safe);
    };

    if (pixelSizeInput) {
        syncPixelSizeUI(parseInt(pixelSizeInput.value || '10', 10));
        pixelSizeInput.addEventListener('input', (e) => {
            const next = parseInt(e.target.value || '10', 10);
            syncPixelSizeUI(next);
            if (originalImage) pixelatePreview(originalImage, currentPixelSize);
        });
    }

    if (rePixelateBtn) {
        rePixelateBtn.addEventListener('click', () => {
            if (originalImage) {
                pixelatePreview(originalImage, currentPixelSize);
            }
        });
    }

    if (newImageBtn) {
        newImageBtn.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!originalImage) {
                showModal('Please upload an image first.', null, true);
                return;
            }

            const exportCanvas = document.createElement('canvas');
            const sourceWidth = originalImage.naturalWidth || originalImage.width;
            const sourceHeight = originalImage.naturalHeight || originalImage.height;
            renderPixelated(originalImage, currentPixelSize, exportCanvas, sourceWidth, sourceHeight);

            const link = document.createElement('a');
            link.download = `pixel-art-${Date.now()}.png`;
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
        });
    }

    function handleFileSelect(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
        // 不要在这里清空 e.target.value，否则可能导致某些浏览器逻辑异常
        // 我们改为在 handleFile 成功后或需要时重置
    }

    function handleFile(file) {
        if (!file || !file.type.match('image.*')) {
            showModal('Please upload an image file', null, true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                if (uploadZone) uploadZone.style.display = 'none';
                if (previewArea) {
                    previewArea.style.display = 'flex';
                    // 滚动到预览区域
                    previewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                pixelatePreview(img, currentPixelSize);
                
                // 成功加载后重置 input，以便下次可以选择同一张图
                if (fileInput) fileInput.value = '';
            };
            img.onerror = () => {
                showModal('Failed to load image. Please try another file.', null, true);
                if (fileInput) fileInput.value = '';
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            showModal('Error reading file.', null, true);
            if (fileInput) fileInput.value = '';
        };
        reader.readAsDataURL(file);
    }

    function renderPixelated(img, pixelSize, targetCanvas, targetWidth, targetHeight) {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        const safePixelSize = Math.max(1, Number.isFinite(pixelSize) ? pixelSize : 10);
        
        // 计算缩放后的整数尺寸，尽量保持原始比例
        const wSmall = Math.max(1, Math.round(sourceWidth / safePixelSize));
        const hSmall = Math.max(1, Math.round(sourceHeight / safePixelSize));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = wSmall;
        offCanvas.height = hSmall;
        const offCtx = offCanvas.getContext('2d');
        offCtx.imageSmoothingEnabled = false;
        offCtx.clearRect(0, 0, wSmall, hSmall);
        offCtx.drawImage(img, 0, 0, wSmall, hSmall);

        // 设置目标 canvas 尺寸为请求的尺寸（通常是原图尺寸）
        targetCanvas.width = targetWidth;
        targetCanvas.height = targetHeight;
        
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        
        // 关键修复：直接将 offCanvas 完整绘制到 targetCanvas，由 drawImage 处理缩放
        // 这样可以确保比例完全由 targetCanvas.width/height 决定
        ctx.drawImage(offCanvas, 0, 0, wSmall, hSmall, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    function pixelatePreview(img, pixelSize) {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        // 使用 renderPixelated 来渲染，它现在正确处理原始比例
        // 不需要在这里重置 canvas 尺寸，renderPixelated 会处理
        renderPixelated(img, pixelSize, previewCanvas, w, h);
    }

    function snapEditorGridSize(maxDim) {
        const options = [16, 32, 64];
        let best = options[0];
        let bestDiff = Math.abs(maxDim - best);
        for (let i = 1; i < options.length; i++) {
            const diff = Math.abs(maxDim - options[i]);
            if (diff < bestDiff) {
                best = options[i];
                bestDiff = diff;
            }
        }
        return best;
    }

    function drawContain(ctx, imgOrCanvas, targetWidth, targetHeight) {
        const w = imgOrCanvas.width;
        const h = imgOrCanvas.height;
        const scale = Math.min(targetWidth / w, targetHeight / h);
        const drawW = Math.max(1, Math.round(w * scale));
        const drawH = Math.max(1, Math.round(h * scale));
        const dx = Math.floor((targetWidth - drawW) / 2);
        const dy = Math.floor((targetHeight - drawH) / 2);
        ctx.drawImage(imgOrCanvas, 0, 0, w, h, dx, dy, drawW, drawH);
    }
});
