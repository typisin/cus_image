export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    const appId = process.env.FEISHU_APP_ID
    const appSecret = process.env.FEISHU_APP_SECRET
    const presetToken = process.env.FEISHU_TENANT_ACCESS_TOKEN
    const appToken = process.env.FEISHU_BITABLE_APP_TOKEN || 'D8pgb7iGvakdyfsXPqZci1jPnCD'
    const tableId = process.env.FEISHU_BITABLE_TABLE_ID || 'tblW2TYCevgHUVxY'
    const viewId = process.env.FEISHU_BITABLE_VIEW_ID || 'vewp80nCFn'
    const imageFieldName = process.env.FEISHU_IMAGE_FIELD_NAME
    let accessToken = presetToken || ''
    if (!accessToken) {
      if (!appId || !appSecret) {
        res.status(500).json({ error: 'Missing FEISHU_APP_ID or FEISHU_APP_SECRET', need_env: ['FEISHU_APP_ID','FEISHU_APP_SECRET'], optional_env: ['FEISHU_TENANT_ACCESS_TOKEN'] })
        return
      }
      const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret })
      })
      if (!tokenRes.ok) {
        const txt = await tokenRes.text()
        res.status(tokenRes.status).json({ error: txt || 'Failed to get tenant_access_token' })
        return
      }
      const tokenData = await tokenRes.json()
      accessToken = tokenData && (tokenData.tenant_access_token || tokenData.access_token)
      if (!accessToken) {
        res.status(502).json({ error: 'Missing access token in response' })
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
      res.status(recRes.status).json({ error: txt || 'Failed to list records' })
      return
    }
    const recData = await recRes.json()
    const records = (recData && recData.data && recData.data.items) || (recData && recData.data && recData.data.records) || []
    function localUrlFromToken(token) {
      return token ? `/api/feishu/media?file_token=${encodeURIComponent(token)}` : ''
    }
    const itemsPromises = records.map(async (r) => {
      const fields = r && (r.fields || (r.record && r.record.fields)) || {}
      let imageUrl = ''
      if (imageFieldName && fields[imageFieldName]) {
        const val = fields[imageFieldName]
        if (Array.isArray(val) && val[0] && val[0].file_token) imageUrl = localUrlFromToken(val[0].file_token)
        else if (Array.isArray(val) && val[0] && val[0].url) imageUrl = val[0].url
        else if (typeof val === 'string') imageUrl = val
      }
      if (!imageUrl) {
        for (const k in fields) {
          const v = fields[k]
          if (Array.isArray(v) && v.length && v[0]) {
            const o = v[0]
            if (o.file_token) { imageUrl = localUrlFromToken(o.file_token); break }
            if (o.url) { imageUrl = o.url; break }
          }
          if (typeof v === 'string' && /^https?:\/\//.test(v)) { imageUrl = v; break }
        }
      }
      const title = fields && (fields.Title || fields.title || fields.Name || fields.name || '')
      const description = fields && (fields.Description || fields.description || '')
      return { id: r.id || '', title, description, imageUrl }
    })
    const allItems = (await Promise.all(itemsPromises)).filter((it) => it.imageUrl)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ items: allItems })
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
