document.addEventListener('DOMContentLoaded', async () => {
    const marqueeContainer = document.getElementById('home-marquee-container');
    if (!marqueeContainer) return;

    try {
        const response = await fetch('/api/feishu/pixel-ideas');
        if (!response.ok) return;
        
        const data = await response.json();
        const allIdeas = data.items || [];
        
        if (allIdeas.length === 0) return;

        // Shuffle and pick 30 items to have enough for two rows
        const shuffled = allIdeas.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 30);
        
        // Split into two rows
        const midPoint = Math.ceil(selected.length / 2);
        const row1Items = selected.slice(0, midPoint);
        const row2Items = selected.slice(midPoint);

        const escAttr = (v) => {
            return String(v || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
        };

        const toImportUrl = (url) => {
            const u = String(url || '');
            if (/^https?:\/\//i.test(u)) return `/api/image-proxy?url=${encodeURIComponent(u)}`;
            return u;
        };

        const queueImportToEditor = (imageUrl, naturalW, naturalH) => {
            const w = Number(naturalW) || 0;
            const h = Number(naturalH) || 0;
            const maxDim = 128;
            const scale = (w > 0 && h > 0) ? Math.max(1, Math.ceil(Math.max(w, h) / maxDim)) : 1;
            const targetW = (w > 0) ? Math.max(1, Math.round(w / scale)) : 0;
            const targetH = (h > 0) ? Math.max(1, Math.round(h / scale)) : 0;

            localStorage.removeItem('pending_pixel_import');
            localStorage.removeItem('pending_pixel_size');
            localStorage.removeItem('pending_pixel_w');
            localStorage.removeItem('pending_pixel_h');

            localStorage.setItem('pending_pixel_import_url', toImportUrl(imageUrl));
            if (targetW && targetH) {
                localStorage.setItem('pending_pixel_target_w', String(targetW));
                localStorage.setItem('pending_pixel_target_h', String(targetH));
                localStorage.setItem('pending_pixel_original_w', String(targetW * 20));
                localStorage.setItem('pending_pixel_original_h', String(targetH * 20));
            }
            window.location.href = '/pixel-editor';
        };

        // Function to create track HTML
        const createTrackHtml = (items, isReverse = false) => {
            // Duplicate items to ensure smooth infinite scroll
            const trackItems = [...items, ...items, ...items]; 
            
            return `
                <div class="marquee-track ${isReverse ? 'reverse' : ''}">
                    ${trackItems.map(idea => {
                        // Extract theme string properly
                        let theme = 'IDEA';
                        if (idea.theme) {
                            if (Array.isArray(idea.theme)) {
                                theme = idea.theme[0] || 'IDEA';
                            } else {
                                theme = idea.theme;
                            }
                        }
                        
                        return `
                        <div class="marquee-item" data-theme="${escAttr(theme)}" data-image-url="${escAttr(idea.imageUrl)}" style="cursor: pointer;">
                            <img src="${idea.imageUrl}" alt="${idea.title || 'Pixel Art Idea'}" style="width:100%; height:100%; object-fit: contain; image-rendering: pixelated;" loading="lazy">
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
        };

        marqueeContainer.innerHTML = `
            ${createTrackHtml(row1Items, false)}
            ${createTrackHtml(row2Items, true)}
        `;

        marqueeContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.marquee-item');
            if (!item) return;
            const imageUrl = item.dataset.imageUrl || '';
            if (!imageUrl) return;
            const imgEl = item.querySelector('img');
            queueImportToEditor(imageUrl, imgEl && imgEl.naturalWidth, imgEl && imgEl.naturalHeight);
        });
        
    } catch (e) {
        return;
    }
});
