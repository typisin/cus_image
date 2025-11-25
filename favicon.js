(function(){
  function setIconUrl(url){
    var rels = ['icon','shortcut icon'];
    for (var i=0;i<rels.length;i++){
      var rel = rels[i];
      var link = document.querySelector('link[rel="'+rel+'"]');
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', rel); document.head.appendChild(link); }
      link.setAttribute('type','image/png');
      link.setAttribute('href', url);
    }
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) { apple = document.createElement('link'); apple.setAttribute('rel','apple-touch-icon'); document.head.appendChild(apple); }
    apple.setAttribute('href', url);
  }

  function setIconFallback(){
    var size = 64;
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0,0,size,size);
    g.addColorStop(0,'#111');
    g.addColorStop(1,'#3b82f6');
    if (ctx.roundRect) { ctx.fillStyle = g; ctx.roundRect(4,4,size-8,size-8,14); ctx.fill(); }
    else { ctx.fillStyle = g; ctx.fillRect(4,4,size-8,size-8); }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CI', size/2, size/2 + 2);
    setIconUrl(c.toDataURL('image/png'));
  }

  function fromLogoImage(){
    var imgEl = document.querySelector('.logo img');
    if (!imgEl) return false;
    var size = 64;
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    function drawFrom(el){
      var scale = Math.min(size / el.naturalWidth, size / el.naturalHeight);
      var w = el.naturalWidth * scale, h = el.naturalHeight * scale;
      var x = (size - w) / 2, y = (size - h) / 2;
      ctx.clearRect(0,0,size,size);
      ctx.drawImage(el, x, y, w, h);
      setIconUrl(c.toDataURL('image/png'));
    }
    if (imgEl.complete && imgEl.naturalWidth > 0){
      try { drawFrom(imgEl); } catch(e) { setIconFallback(); }
    } else {
      imgEl.addEventListener('load', function(){ try { drawFrom(imgEl); } catch(e) { setIconFallback(); } });
      imgEl.addEventListener('error', setIconFallback);
    }
    return true;
  }

  function fromInlineSVG(){
    var svgEl = document.querySelector('.logo svg');
    if (!svgEl) return false;
    var clone = svgEl.cloneNode(true);
    clone.setAttribute('width','64');
    clone.setAttribute('height','64');
    var str = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([str], { type: 'image/svg+xml' });
    var objUrl = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function(){
      var size = 64;
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var ctx = c.getContext('2d');
      var scale = Math.min(size / img.width, size / img.height);
      var w = img.width * scale, h = img.height * scale;
      var x = (size - w) / 2, y = (size - h) / 2;
      ctx.clearRect(0,0,size,size);
      ctx.drawImage(img, x, y, w, h);
      try { URL.revokeObjectURL(objUrl); } catch(e) {}
      setIconUrl(c.toDataURL('image/png'));
    };
    img.onerror = function(){ setIconFallback(); };
    img.src = objUrl;
    return true;
  }

  try { if (!fromLogoImage() && !fromInlineSVG()) setIconFallback(); } catch(e) { setIconFallback(); }
})();
;(function(){
  var h = location.hostname; var isLocal = /^(localhost|127\.0\.0\.1)$/.test(h);
  if(!isLocal){
    var s = document.createElement('script'); s.defer = true; s.src = '/_vercel/insights/script.js';
    s.onerror = function(){ var a = document.createElement('script'); a.defer = true; a.src = '/_vercel/analytics/script.js'; a.onerror = function(){}; document.head.appendChild(a); };
    document.head.appendChild(s);
  }
})();
