;(function(){
  var input = document.getElementById('textInput');
  var styleSelect = document.getElementById('styleSelect');
  var orientRadios = document.querySelectorAll('input[name="orient"]');
  var svg = document.getElementById('previewSvg');
  var generateBtn = document.getElementById('generateBtn');
  var downloadSvgBtn = document.getElementById('downloadSvgBtn');
  var downloadPngBtn = document.getElementById('downloadPngBtn');
  var rotateBtn = document.getElementById('rotateBtn');
  var resetBtn = document.getElementById('resetBtn');
  var animWrap = document.getElementById('animWrap');
  var errorMsg = document.getElementById('errorMsg');
  var overlay = document.getElementById('loadingOverlay');

  var fontsReady = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){ fontsReady = true; overlay.style.display = 'none'; });
  } else { fontsReady = true; }

  var usageKey = 'cus_ambigram_usage';
  function inc(name){
    try { var d = localStorage.getItem(usageKey); var j = d ? JSON.parse(d) : {}; j[name] = (j[name]||0)+1; localStorage.setItem(usageKey, JSON.stringify(j)); } catch(e){}
  }

  var styles = {
    classic: { family: 'Cinzel, serif', weight: '600', spacing: 1 },
    modern: { family: 'Inter, system-ui, sans-serif', weight: '600', spacing: 0 },
    gothic: { family: 'UnifrakturMaguntia, serif', weight: '400', spacing: 0 },
    script: { family: 'Great Vibes, cursive', weight: '400', spacing: 0 },
    geometric: { family: 'Orbitron, sans-serif', weight: '600', spacing: 2 }
  };

  function currentOrient(){
    for (var i=0;i<orientRadios.length;i++){ if (orientRadios[i].checked) return orientRadios[i].value; }
    return 'rotational';
  }

  function validate(t){
    if (!t || !t.trim()) return 'Please enter text';
    if (t.trim().length > 24) return 'Text too long (≤24)';
    return '';
  }

  function clearSvg(){ while (svg.firstChild) svg.removeChild(svg.firstChild); }

  function drawText(t){
    var st = styles[styleSelect.value] || styles.modern;
    var orient = currentOrient();
    clearSvg();
    
    var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    var filter = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filter.setAttribute('id','shadow');
    filter.innerHTML = '<feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>';
    defs.appendChild(filter);
    svg.appendChild(defs);

    var bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
    bg.setAttribute('x','0'); bg.setAttribute('y','0'); bg.setAttribute('width','600'); bg.setAttribute('height','320'); bg.setAttribute('fill','transparent');
    svg.appendChild(bg);
    
    var g1 = document.createElementNS('http://www.w3.org/2000/svg','g');
    var g2 = document.createElementNS('http://www.w3.org/2000/svg','g');
    
    var y = 160;
    var x = 300;
    
    var baseSize = 72;
    var len = t.length;
    var fontSize = len > 0 ? Math.min(baseSize, (560 / len) * 1.6) : baseSize;
    if (len > 10) fontSize = Math.min(baseSize, (560 / len) * 1.8);
    
    function applyStyle(el) {
        el.setAttribute('x', String(x));
        el.setAttribute('y', String(y));
        el.setAttribute('fill', '#1f2937');
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('dominant-baseline','middle');
        el.setAttribute('font-family', st.family);
        el.setAttribute('font-weight', st.weight);
        el.setAttribute('font-size', String(fontSize));
        el.setAttribute('filter', 'url(#shadow)'); 
        if (st.spacing) el.setAttribute('letter-spacing', String(st.spacing));
        el.textContent = t;
    }

    var text1 = document.createElementNS('http://www.w3.org/2000/svg','text');
    applyStyle(text1);
    
    var text2 = document.createElementNS('http://www.w3.org/2000/svg','text');
    applyStyle(text2);
    
    if (orient === 'vertical') { 
        g2.setAttribute('transform','translate(600,0) scale(-1,1)'); 
    } else if (orient === 'horizontal') { 
        g2.setAttribute('transform','translate(0,320) scale(1,-1)'); 
    } else { 
        g2.setAttribute('transform','rotate(180 300 160)'); 
    }
    
    g1.appendChild(text1);
    g2.appendChild(text2);
    svg.appendChild(g1);
    svg.appendChild(g2);
  }

  function render(){
    var t = input.value || '';
    var err = validate(t);
    if (err){ errorMsg.textContent = err; errorMsg.style.display = 'block'; clearSvg(); return; }
    errorMsg.style.display = 'none';
    if (!fontsReady){ overlay.style.display = 'flex'; setTimeout(function(){ overlay.style.display = 'none'; drawText(t); }, 600); return; }
    drawText(t);
  }

  function downloadSvg(){
    inc('download_svg');
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg.outerHTML;
    var blob = new Blob([xml], {type:'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'ambigram.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadPng(){
    inc('download_png');
    var s = new XMLSerializer().serializeToString(svg);
    var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    var img = new Image();
    img.onload = function(){
      var canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 640;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      var png = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = png; a.download = 'ambigram.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.src = url;
  }

  function rotate(){
    var r = svg.getAttribute('data-rotated') === '1';
    if (r){ svg.style.transform = ''; svg.setAttribute('data-rotated','0'); }
    else { svg.style.transform = 'rotate(180deg)'; svg.setAttribute('data-rotated','1'); }
  }

  function reset(){ input.value=''; clearSvg(); errorMsg.style.display='none'; }

  function strongRotate(){
    if (!animWrap) return;
    animWrap.classList.add('rotate-strong');
    var handler = function(){ animWrap.classList.remove('rotate-strong'); animWrap.removeEventListener('animationend', handler); };
    animWrap.addEventListener('animationend', handler);
    setTimeout(function(){ animWrap.classList.remove('rotate-strong'); }, 1500);
  }

  input.addEventListener('input', function(){ inc('preview_update'); render(); });
  styleSelect.addEventListener('change', function(){ inc('style_change'); render(); });
  for (var i=0;i<orientRadios.length;i++){ orientRadios[i].addEventListener('change', function(){ render(); }); }
  generateBtn.addEventListener('click', function(){ inc('generate_click'); render(); });
  downloadSvgBtn.addEventListener('click', function(){ downloadSvg(); });
  downloadPngBtn.addEventListener('click', function(){ downloadPng(); });
  rotateBtn.addEventListener('click', function(){ rotate(); });
  resetBtn.addEventListener('click', function(){ reset(); });
  // Trigger strong rotation on rotate action
  rotateBtn.addEventListener('click', function(){ strongRotate(); });

  var allBtns = document.querySelectorAll('.btn');
  for (var i=0;i<allBtns.length;i++){
    allBtns[i].addEventListener('click', (function(btn){
      return function(){
        btn.classList.add('spin');
        setTimeout(function(){ btn.classList.remove('spin'); }, 600);
      };
    })(allBtns[i]));
  }

  // Auto show strong rotation briefly after generate
  var originalRender = render;
  render = function(){
    originalRender();
    strongRotate();
  };
})();
