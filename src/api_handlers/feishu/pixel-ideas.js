export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const appId = process.env.FEISHU_APP_ID
    const appSecret = process.env.FEISHU_APP_SECRET
    const presetToken = process.env.FEISHU_TENANT_ACCESS_TOKEN
    
    // Use Env var or fallback to the URL provided
    const appToken = process.env.FEISHU_BITABLE_APP_TOKEN || 'D8pgb7iGvakdyfsXPqZci1jPnCD'
    const tableId = process.env.FEISHU_BITABLE_TABLE_ID || 'tblW2TYCevgHUVxY'
    const viewId = process.env.FEISHU_BITABLE_VIEW_ID || 'vewp80nCFn'
    
    let accessToken = presetToken || ''
    
    if (!accessToken) {
      if (!appId || !appSecret) {
        console.error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET in env')
        res.status(500).json({ error: 'Missing FEISHU_APP_ID or FEISHU_APP_SECRET environment variables' })
        return
      }
      
      const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret })
      })
      
      if (!tokenRes.ok) {
        const txt = await tokenRes.text()
        console.error('Feishu Token Error:', txt)
        res.status(tokenRes.status).json({ error: `Failed to get tenant_access_token: ${txt}` })
        return
      }
      
      const tokenData = await tokenRes.json()
      accessToken = tokenData && (tokenData.tenant_access_token || tokenData.access_token)
      
      if (!accessToken) {
        console.error('Feishu Token Response missing token:', tokenData)
        res.status(502).json({ error: 'Missing access token in Feishu response' })
        return
      }
    }
    
    const url = new URL(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`)
    url.searchParams.set('page_size', '100')
    if (viewId) url.searchParams.set('view_id', viewId)
    
    const recRes = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    
    if (!recRes.ok) {
      const txt = await recRes.text()
      console.error('Feishu Records Error:', txt)
      res.status(recRes.status).json({ error: `Failed to list records: ${txt}` })
      return
    }
    
    const recData = await recRes.json()
    const records = (recData && recData.data && recData.data.items) || (recData && recData.data && recData.data.records) || []
    
    function localUrlFromToken(token) {
      return token ? `/api/feishu/media?file_token=${encodeURIComponent(token)}` : ''
    }
    
    const items = records.map((r) => {
      const fields = r && (r.fields || (r.record && r.record.fields)) || {}
      
      // Extract fields based on user's table structure
      const title = fields['title'] || fields['Title'] || ''
      const theme = fields['theme'] || fields['Theme'] || ''
      const path = fields['path'] || fields['Path'] || ''
      
      // Logic for Image URL: Prefer 'cdn' field, fallback to 'images' attachment
      let imageUrl = ''
      
      // 1. Check 'cdn' field (text/link)
      const cdnField = fields['cdn'] || fields['CDN']
      if (cdnField) {
         if (typeof cdnField === 'string') {
             imageUrl = cdnField
         } else if (Array.isArray(cdnField) && cdnField[0] && cdnField[0].text) {
             imageUrl = cdnField[0].text // Link field often returns array of objects
         } else if (typeof cdnField === 'object' && cdnField.text) {
             imageUrl = cdnField.text
         } else if (typeof cdnField === 'object' && cdnField.link) {
             imageUrl = cdnField.link
         }
      }
      
      // 2. Fallback to 'images' attachment if no cdn
      if (!imageUrl) {
          const imagesField = fields['image'] || fields['Image'] || fields['images'] || fields['Images']
          if (Array.isArray(imagesField) && imagesField.length > 0) {
              const fileToken = imagesField[0].file_token
              if (fileToken) {
                  imageUrl = localUrlFromToken(fileToken)
              }
          }
      }
      
      return {
        id: r.id,
        title,
        theme,
        path,
        imageUrl
      }
    }).filter(item => item.imageUrl) // Only return items with images
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    res.status(200).json({ items })
    
  } catch (e) {
    console.error('API Catch Error:', e)
    res.status(500).json({ error: `Internal Server Error: ${e.message}` })
  }
}
