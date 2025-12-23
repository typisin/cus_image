document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('pixel-grid');
    const colorPicker = document.getElementById('color-picker');
    const sizeSelect = document.getElementById('grid-size');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const toolBtns = document.querySelectorAll('.tool-btn');
    
    // Modal Elements
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirmBtn = document.getElementById('modal-confirm');
    const modalCancelBtn = document.getElementById('modal-cancel');
    let currentConfirmCallback = null;

    let isDrawing = false;
    let currentColor = '#000000';
    let currentTool = 'pencil'; // pencil, eraser
    let gridSize = 32;
    
    // Initialize
    initGrid(gridSize);
    
    const pendingImportUrl = localStorage.getItem('pending_pixel_import_url');
    if (pendingImportUrl) {
        const targetW = parseInt(localStorage.getItem('pending_pixel_target_w'));
        const targetH = parseInt(localStorage.getItem('pending_pixel_target_h'));

        const img = new Image();
        img.onload = () => {
            processImportedImage(img, targetW, targetH);
            const origW = localStorage.getItem('pending_pixel_original_w');
            const origH = localStorage.getItem('pending_pixel_original_h');
            if (origW && origH) {
                gridContainer.dataset.originalW = origW;
                gridContainer.dataset.originalH = origH;
            }

            localStorage.removeItem('pending_pixel_import_url');
            localStorage.removeItem('pending_pixel_target_w');
            localStorage.removeItem('pending_pixel_target_h');
            localStorage.removeItem('pending_pixel_original_w');
            localStorage.removeItem('pending_pixel_original_h');
        };
        img.src = pendingImportUrl;
    } else {
        const pendingImport = localStorage.getItem('pending_pixel_import');
        if (pendingImport) {
            const w = parseInt(localStorage.getItem('pending_pixel_w'));
            const h = parseInt(localStorage.getItem('pending_pixel_h'));
            
            if (w && h) {
                initGrid(w, h);
            } else {
                const size = parseInt(localStorage.getItem('pending_pixel_size') || '32');
                if (size) {
                    gridSize = size;
                    if (sizeSelect) sizeSelect.value = size;
                    initGrid(gridSize, gridSize);
                }
            }
            
            const img = new Image();
            img.onload = () => {
                processImportedImage(img);
                const origW = localStorage.getItem('pending_pixel_original_w');
                const origH = localStorage.getItem('pending_pixel_original_h');
                if (origW && origH) {
                    gridContainer.dataset.originalW = origW;
                    gridContainer.dataset.originalH = origH;
                }
                
                localStorage.removeItem('pending_pixel_import');
                localStorage.removeItem('pending_pixel_size');
                localStorage.removeItem('pending_pixel_w');
                localStorage.removeItem('pending_pixel_h');
                localStorage.removeItem('pending_pixel_original_w');
                localStorage.removeItem('pending_pixel_original_h');
            };
            img.src = pendingImport;
        }
    }

    // Modal Functions
    function showModal(message, onConfirm) {
        modalMessage.textContent = message;
        currentConfirmCallback = onConfirm;
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
        currentConfirmCallback = null;
    }

    modalConfirmBtn.addEventListener('click', () => {
        if (currentConfirmCallback) {
            currentConfirmCallback();
        }
        hideModal();
    });

    modalCancelBtn.addEventListener('click', hideModal);

    // Event Listeners
    if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            gridSize = val;
            initGrid(val, val);
        });
    }
    
    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
        // Automatically switch to pencil when picking color
        setActiveTool('pencil');
    });

    // Preset palette clicks
    document.querySelectorAll('.palette-color').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentColor = e.target.dataset.color;
            colorPicker.value = currentColor;
            setActiveTool('pencil');
        });
    });
    
    clearBtn.addEventListener('click', () => {
        showModal('Clear canvas?', () => {
            initGrid(gridSize);
        });
    });
    
    exportBtn.addEventListener('click', exportArt);
    
    // Import Logic
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                showModal('This will overwrite your current canvas. Continue?', () => {
                    processImportedImage(img);
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        
        // Reset input so same file can be selected again
        e.target.value = '';
    });

    function processImportedImage(img, targetW, targetH) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        const w = (targetW && Number.isFinite(targetW) && targetW > 0) ? targetW : naturalW;
        const h = (targetH && Number.isFinite(targetH) && targetH > 0) ? targetH : naturalH;
        
        canvas.width = w;
        canvas.height = h;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        
        // Clear and rebuild grid with actual image dimensions
        initGrid(w, h);
        
        for (let i = 0; i < w * h; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            const a = data[i * 4 + 3];
            
            const cell = gridContainer.children[i];
            if (!cell) continue;
            
            // Only set color if not fully transparent
            if (a > 10) { // Threshold for transparency
                // Convert RGB to Hex
                const hex = rgbToHex(r, g, b);
                cell.style.backgroundColor = hex;
            }
        }
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActiveTool(e.target.closest('.tool-btn').dataset.tool);
        });
    });
    
    document.body.addEventListener('mousedown', () => isDrawing = true);
    document.body.addEventListener('mouseup', () => isDrawing = false);
    
    function setActiveTool(tool) {
        currentTool = tool;
        toolBtns.forEach(btn => {
            if(btn.dataset.tool === tool) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function initGrid(width, height) {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        
        // Dynamically set container size based on aspect ratio
        // We use a base size and scale it
        const toolbarEl = document.querySelector('.toolbar');
        const editorEl = document.querySelector('.editor-container');
        const pageContainer = document.querySelector('.container');

        const toolbarW = toolbarEl ? toolbarEl.getBoundingClientRect().width : 0;
        const gapPx = editorEl ? parseFloat(getComputedStyle(editorEl).columnGap || getComputedStyle(editorEl).gap || '0') : 0;
        const padL = pageContainer ? parseFloat(getComputedStyle(pageContainer).paddingLeft || '0') : 0;
        const padR = pageContainer ? parseFloat(getComputedStyle(pageContainer).paddingRight || '0') : 0;
        const availableW = window.innerWidth - toolbarW - gapPx - padL - padR;
        const baseSize = Math.min(Math.max(200, availableW), 600);
        if (width >= height) {
            gridContainer.style.width = `${baseSize}px`;
            gridContainer.style.height = `${(height / width) * baseSize}px`;
        } else {
            gridContainer.style.height = `${baseSize}px`;
            gridContainer.style.width = `${(width / height) * baseSize}px`;
        }

        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');
            cell.classList.add('pixel-cell');
            cell.addEventListener('mousedown', paint);
            cell.addEventListener('mouseover', paint);
            gridContainer.appendChild(cell);
        }
    }
    
    function paint(e) {
        if (e.type === 'mouseover' && !isDrawing) return;
        
        if (currentTool === 'pencil') {
            e.target.style.backgroundColor = currentColor;
        } else if (currentTool === 'eraser') {
            e.target.style.backgroundColor = 'transparent';
        }
    }
    
    function exportArt() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get actual dimensions from grid container
        const cols = gridContainer.style.gridTemplateColumns.split('repeat(')[1].split(',')[0];
        const rows = gridContainer.style.gridTemplateRows.split('repeat(')[1].split(',')[0];
        const w = parseInt(cols);
        const h = parseInt(rows);

        // Determine output dimensions
        let outputW, outputH;
        const origW = gridContainer.dataset.originalW;
        const origH = gridContainer.dataset.originalH;

        if (origW && origH) {
            outputW = parseInt(origW);
            outputH = parseInt(origH);
        } else {
            // Default scale if no original dimensions (e.g. started from scratch)
            const scale = 20;
            outputW = w * scale;
            outputH = h * scale;
        }

        canvas.width = outputW;
        canvas.height = outputH;
        
        const cells = document.querySelectorAll('.pixel-cell');
        const cellW = outputW / w;
        const cellH = outputH / h;

        cells.forEach((cell, index) => {
            const row = Math.floor(index / w);
            const col = index % w;
            const color = cell.style.backgroundColor;
            
            if (color && color !== 'transparent' && color !== '') {
                ctx.fillStyle = color;
                // Use floor/ceil to avoid gaps between pixels due to rounding
                ctx.fillRect(
                    Math.floor(col * cellW), 
                    Math.floor(row * cellH), 
                    Math.ceil(cellW), 
                    Math.ceil(cellH)
                );
            }
        });
        
        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
});
