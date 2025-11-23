;(function(){
  var gallery = null
  var statusEl = null
  var refreshBtn = null

  function setStatus(html, show){
    if (!statusEl) return
    statusEl.style.display = show ? 'flex' : 'none'
    statusEl.innerHTML = html || ''
  }

  function render(items){
    if (!gallery) return
    if (!Array.isArray(items) || items.length === 0){
      gallery.innerHTML = '<div class="center-layout" style="min-height:120px"><p>No images found</p></div>'
      return
    }
    var html = items.map(function(it){
      var u = it && it.imageUrl
      var t = it && (it.title || '')
      var d = it && (it.description || '')
      var safeTitle = t ? String(t) : ''
      var safeDesc = d ? String(d) : ''
      var img = u ? '<img src="'+u+'" alt="'+(safeTitle||'FB Cover')+'" loading="lazy" />' : ''
      var title = safeTitle ? '<div class="fb-card-title">'+safeTitle+'</div>' : ''
      var desc = safeDesc ? '<div class="fb-card-desc">'+safeDesc+'</div>' : ''
      var click = u ? ' onclick="window.open(\''+u+'\',\'_blank\')"' : ''
      return '<div class="fb-card"'+click+'>'+img+title+desc+'</div>'
    }).join('')
    gallery.innerHTML = html
  }

  async function load(){
    try{
      setStatus('<p>Loading...</p>', true)
      gallery.innerHTML = ''
      var r = await fetch('/api/feishu/fb-covers')
      if (!r.ok){
        var txt = await r.text()
        setStatus('<p style="color:var(--error)">Failed to load: '+(txt||r.status)+'</p>', true)
        return
      }
      var data = await r.json()
      setStatus('', false)
      render(data && data.items || [])
    }catch(e){
      setStatus('<p style="color:var(--error)">Network error. Please retry.</p>', true)
    }
  }

  function init(){
    gallery = document.getElementById('fb-gallery')
    statusEl = document.getElementById('fb-gallery-status')
    refreshBtn = document.getElementById('refreshBtn')
    if (refreshBtn){
      refreshBtn.addEventListener('click', load)
    }
    load()
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
