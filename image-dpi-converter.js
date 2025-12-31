document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const workspace = document.getElementById('workspace');
  const preview = document.getElementById('preview');

  const kpiName = document.getElementById('kpiName');
  const kpiType = document.getElementById('kpiType');
  const kpiSize = document.getElementById('kpiSize');
  const kpiDpi = document.getElementById('kpiDpi');

  const dpiInput = document.getElementById('dpiInput');
  const convertBtn = document.getElementById('convertBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('status');

  let originalFile = null;
  let originalBytes = null;
  let originalMeta = null;
  let outputBlobUrl = null;
  let outputFileName = null;
  let outputMime = null;

  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = text || '';
  };

  const resetOutput = () => {
    if (outputBlobUrl) URL.revokeObjectURL(outputBlobUrl);
    outputBlobUrl = null;
    outputFileName = null;
    outputMime = null;
    if (downloadBtn) {
      downloadBtn.disabled = true;
    }
  };

  const resetAll = () => {
    resetOutput();
    setStatus('');
    originalFile = null;
    originalBytes = null;
    originalMeta = null;
    if (preview && preview.src) {
      URL.revokeObjectURL(preview.src);
      preview.removeAttribute('src');
    }
    if (workspace) workspace.style.display = 'none';
    if (dropZone) dropZone.style.display = '';
    if (fileInput) fileInput.value = '';
    if (kpiName) kpiName.textContent = '—';
    if (kpiType) kpiType.textContent = '—';
    if (kpiSize) kpiSize.textContent = '—';
    if (kpiDpi) kpiDpi.textContent = '—';
  };

  const formatBytes = (n) => {
    const v = Number(n) || 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
    if (v < 1024 * 1024 * 1024) return `${(v / (1024 * 1024)).toFixed(1)} MB`;
    return `${(v / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const clampInt = (value, min, max) => {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  };

  const isPng = (bytes) => {
    if (!bytes || bytes.length < 8) return false;
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  };

  const isJpeg = (bytes) => {
    if (!bytes || bytes.length < 2) return false;
    return bytes[0] === 0xff && bytes[1] === 0xd8;
  };

  const u32be = (bytes, off) =>
    (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];

  const writeU32be = (out, off, value) => {
    out[off] = (value >>> 24) & 0xff;
    out[off + 1] = (value >>> 16) & 0xff;
    out[off + 2] = (value >>> 8) & 0xff;
    out[off + 3] = value & 0xff;
  };

  const writeU16be = (out, off, value) => {
    out[off] = (value >>> 8) & 0xff;
    out[off + 1] = value & 0xff;
  };

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const parsePngDpi = (bytes) => {
    if (!isPng(bytes)) return { ok: false, reason: 'Not a PNG' };
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const length = u32be(bytes, offset);
      const typeStart = offset + 4;
      const dataStart = offset + 8;
      const dataEnd = dataStart + length;
      const crcEnd = dataEnd + 4;
      if (crcEnd > bytes.length) break;

      const type = String.fromCharCode(bytes[typeStart], bytes[typeStart + 1], bytes[typeStart + 2], bytes[typeStart + 3]);
      if (type === 'pHYs' && length === 9) {
        const xppu = u32be(bytes, dataStart);
        const yppu = u32be(bytes, dataStart + 4);
        const unit = bytes[dataStart + 8];
        if (unit === 1) {
          const xdpi = xppu * 0.0254;
          const ydpi = yppu * 0.0254;
          return { ok: true, xdpi, ydpi, source: 'pHYs' };
        }
        return { ok: true, xdpi: null, ydpi: null, source: 'pHYs (unit unspecified)' };
      }
      if (type === 'IEND') break;
      offset = crcEnd;
    }
    return { ok: true, xdpi: null, ydpi: null, source: 'none' };
  };

  const parseJpegDpi = (bytes) => {
    if (!isJpeg(bytes)) return { ok: false, reason: 'Not a JPEG' };
    let i = 2;
    while (i + 4 <= bytes.length) {
      if (bytes[i] !== 0xff) {
        i += 1;
        continue;
      }
      while (i < bytes.length && bytes[i] === 0xff) i += 1;
      if (i >= bytes.length) break;
      const marker = bytes[i];
      i += 1;
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > bytes.length) break;
      const segLen = (bytes[i] << 8) | bytes[i + 1];
      const segStart = i + 2;
      const segEnd = segStart + segLen - 2;
      if (segEnd > bytes.length) break;

      if (marker === 0xe0 && segLen >= 16) {
        const id0 = bytes[segStart];
        const id1 = bytes[segStart + 1];
        const id2 = bytes[segStart + 2];
        const id3 = bytes[segStart + 3];
        const id4 = bytes[segStart + 4];
        if (id0 === 0x4a && id1 === 0x46 && id2 === 0x49 && id3 === 0x46 && id4 === 0x00) {
          const units = bytes[segStart + 7];
          const x = (bytes[segStart + 8] << 8) | bytes[segStart + 9];
          const y = (bytes[segStart + 10] << 8) | bytes[segStart + 11];
          if (units === 1) return { ok: true, xdpi: x, ydpi: y, source: 'JFIF' };
          if (units === 2) {
            const xdpi = x * 2.54;
            const ydpi = y * 2.54;
            return { ok: true, xdpi, ydpi, source: 'JFIF (dpcm)' };
          }
          return { ok: true, xdpi: null, ydpi: null, source: 'JFIF (no units)' };
        }
      }
      i = segEnd;
    }
    return { ok: true, xdpi: null, ydpi: null, source: 'none' };
  };

  const buildPngPhysChunk = (dpi) => {
    const ppm = Math.max(1, Math.round(dpi / 0.0254));
    const data = new Uint8Array(9);
    writeU32be(data, 0, ppm >>> 0);
    writeU32be(data, 4, ppm >>> 0);
    data[8] = 1;
    const type = new Uint8Array([0x70, 0x48, 0x59, 0x73]);
    const crcInput = new Uint8Array(type.length + data.length);
    crcInput.set(type, 0);
    crcInput.set(data, type.length);
    const crc = crc32(crcInput);

    const out = new Uint8Array(4 + 4 + data.length + 4);
    writeU32be(out, 0, data.length);
    out.set(type, 4);
    out.set(data, 8);
    writeU32be(out, 8 + data.length, crc);
    return out;
  };

  const updatePngDpi = (bytes, dpi) => {
    if (!isPng(bytes)) throw new Error('Unsupported file');

    const phys = buildPngPhysChunk(dpi);
    let offset = 8;
    let iendOffset = -1;
    let physOffset = -1;
    let physLength = 0;

    while (offset + 12 <= bytes.length) {
      const length = u32be(bytes, offset);
      const typeStart = offset + 4;
      const dataStart = offset + 8;
      const dataEnd = dataStart + length;
      const crcEnd = dataEnd + 4;
      if (crcEnd > bytes.length) break;
      const type = String.fromCharCode(bytes[typeStart], bytes[typeStart + 1], bytes[typeStart + 2], bytes[typeStart + 3]);
      if (type === 'pHYs' && length === 9) {
        physOffset = offset;
        physLength = crcEnd - offset;
        break;
      }
      if (type === 'IEND') {
        iendOffset = offset;
        break;
      }
      offset = crcEnd;
    }

    if (physOffset >= 0) {
      const out = new Uint8Array(bytes.length);
      out.set(bytes, 0);
      out.set(phys, physOffset);
      return out;
    }

    if (iendOffset < 0) throw new Error('Invalid PNG');
    const out = new Uint8Array(bytes.length + phys.length);
    out.set(bytes.slice(0, iendOffset), 0);
    out.set(phys, iendOffset);
    out.set(bytes.slice(iendOffset), iendOffset + phys.length);
    return out;
  };

  const updateJpegDpi = (bytes, dpi) => {
    if (!isJpeg(bytes)) throw new Error('Unsupported file');
    const target = clampInt(dpi, 1, 1200);

    let i = 2;
    while (i + 4 <= bytes.length) {
      if (bytes[i] !== 0xff) {
        i += 1;
        continue;
      }
      while (i < bytes.length && bytes[i] === 0xff) i += 1;
      if (i >= bytes.length) break;
      const marker = bytes[i];
      i += 1;
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > bytes.length) break;
      const segLen = (bytes[i] << 8) | bytes[i + 1];
      const segStart = i + 2;
      const segEnd = segStart + segLen - 2;
      if (segEnd > bytes.length) break;

      if (marker === 0xe0 && segLen >= 16) {
        const id0 = bytes[segStart];
        const id1 = bytes[segStart + 1];
        const id2 = bytes[segStart + 2];
        const id3 = bytes[segStart + 3];
        const id4 = bytes[segStart + 4];
        if (id0 === 0x4a && id1 === 0x46 && id2 === 0x49 && id3 === 0x46 && id4 === 0x00) {
          const out = new Uint8Array(bytes.length);
          out.set(bytes);
          out[segStart + 7] = 1;
          writeU16be(out, segStart + 8, target);
          writeU16be(out, segStart + 10, target);
          return out;
        }
      }
      i = segEnd;
    }

    const app0 = new Uint8Array(2 + 2 + 14);
    app0[0] = 0xff;
    app0[1] = 0xe0;
    app0[2] = 0x00;
    app0[3] = 0x10;
    app0[4] = 0x4a;
    app0[5] = 0x46;
    app0[6] = 0x49;
    app0[7] = 0x46;
    app0[8] = 0x00;
    app0[9] = 0x01;
    app0[10] = 0x02;
    app0[11] = 0x01;
    writeU16be(app0, 12, target);
    writeU16be(app0, 14, target);
    app0[16] = 0x00;
    app0[17] = 0x00;

    const out = new Uint8Array(bytes.length + app0.length);
    out[0] = 0xff;
    out[1] = 0xd8;
    out.set(app0, 2);
    out.set(bytes.slice(2), 2 + app0.length);
    return out;
  };

  const renderMeta = () => {
    if (!originalFile || !originalMeta) return;
    if (kpiName) kpiName.textContent = originalFile.name || '—';
    if (kpiType) kpiType.textContent = originalFile.type ? originalFile.type.toUpperCase() : '—';
    if (kpiSize) kpiSize.textContent = formatBytes(originalFile.size);
    if (kpiDpi) {
      if (originalMeta.xdpi && originalMeta.ydpi) {
        const x = Number(originalMeta.xdpi);
        const y = Number(originalMeta.ydpi);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const xTxt = x % 1 === 0 ? String(x) : x.toFixed(2);
          const yTxt = y % 1 === 0 ? String(y) : y.toFixed(2);
          kpiDpi.textContent = `DPI: ${xTxt} × ${yTxt}`;
          return;
        }
      }
      kpiDpi.textContent = 'DPI: Unknown';
    }
  };

  const handleBytes = async (file) => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    originalBytes = bytes;
    if (isPng(bytes)) {
      originalMeta = parsePngDpi(bytes);
      return { ok: true, kind: 'png' };
    }
    if (isJpeg(bytes)) {
      originalMeta = parseJpegDpi(bytes);
      return { ok: true, kind: 'jpeg' };
    }
    originalMeta = null;
    return { ok: false, error: 'Unsupported format. Please upload a PNG or JPEG.' };
  };

  const showFile = async (file) => {
    resetOutput();
    setStatus('');
    if (!file) return;
    const isOkType = /^image\/(png|jpeg)$/.test(file.type) || /\.(png|jpe?g)$/i.test(file.name || '');
    if (!isOkType) {
      setStatus('Unsupported format. Please upload a PNG or JPEG.');
      return;
    }
    originalFile = file;
    if (preview) {
      const url = URL.createObjectURL(file);
      preview.src = url;
    }
    const parsed = await handleBytes(file);
    if (!parsed.ok) {
      setStatus(parsed.error || 'Failed to read file.');
      resetAll();
      return;
    }
    renderMeta();
    if (dropZone) dropZone.style.display = 'none';
    if (workspace) workspace.style.display = 'grid';
    setStatus('Ready. Choose a target DPI and click Update DPI.');
  };

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) showFile(f);
    });

    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (f) showFile(f);
    });
  }

  document.querySelectorAll('[data-dpi]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-dpi');
      if (dpiInput) dpiInput.value = String(clampInt(v, 1, 1200));
      resetOutput();
      setStatus('Ready. Click Update DPI.');
    });
  });

  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      resetOutput();
      if (!originalFile || !originalBytes) {
        setStatus('Please upload an image first.');
        return;
      }
      const dpi = clampInt(dpiInput && dpiInput.value ? dpiInput.value : 300, 1, 1200);
      if (dpiInput) dpiInput.value = String(dpi);
      try {
        let outBytes;
        if (isPng(originalBytes)) {
          outBytes = updatePngDpi(originalBytes, dpi);
          outputMime = 'image/png';
        } else if (isJpeg(originalBytes)) {
          outBytes = updateJpegDpi(originalBytes, dpi);
          outputMime = 'image/jpeg';
        } else {
          setStatus('Unsupported format. Please upload a PNG or JPEG.');
          return;
        }

        const extMatch = (originalFile.name || '').match(/\.(png|jpe?g)$/i);
        const ext = extMatch ? extMatch[1].toLowerCase() : (outputMime === 'image/png' ? 'png' : 'jpg');
        const base = (originalFile.name || 'image').replace(/\.(png|jpe?g)$/i, '');
        outputFileName = `${base}-${dpi}dpi.${ext === 'jpeg' ? 'jpg' : ext}`;
        const blob = new Blob([outBytes], { type: outputMime });
        outputBlobUrl = URL.createObjectURL(blob);
        if (downloadBtn) downloadBtn.disabled = false;
        setStatus(`Done. DPI updated to ${dpi}. Download is ready.`);
      } catch (err) {
        setStatus(err && err.message ? err.message : 'Failed to update DPI.');
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!outputBlobUrl) {
        setStatus('Nothing to download yet. Click Update DPI first.');
        return;
      }
      const a = document.createElement('a');
      a.href = outputBlobUrl;
      a.download = outputFileName || `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetAll();
    });
  }
});

