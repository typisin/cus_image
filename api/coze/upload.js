export const config = { runtime: 'edge' }

export default async function handler(req) {
  console.log('=== Upload API Debug ===')
  console.log('Method:', req.method)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  
  const uploadUrl = 'https://api.coze.cn/v1/files/upload'
  const envToken = process.env.COZE_SAT
  const clientToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-coze-token') || req.headers.get('token')
  const token = envToken || clientToken
  
  console.log('Environment token present:', !!envToken)
  console.log('Client token present:', !!clientToken)
  console.log('Final token present:', !!token)
  console.log('Using token:', token ? token.substring(0, 10) + '...' : 'none')
  
  if (!token) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  
  try {
    const inForm = await req.formData()
    const file = inForm.get('file')
    console.log('File received:', !!file)
    console.log('File name:', file?.name)
    console.log('File size:', file?.size)
    
    if (!file) return new Response(JSON.stringify({ error: 'file required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    
    const fd = new FormData()
  fd.append('file', file, file.name || 'upload')
  
  // 不要手动设置Content-Type，让浏览器自动处理multipart边界
  const headers = { 
    'Authorization': `Bearer ${token}`
  }
  
  console.log('Sending request to Coze API...')
  console.log('Request headers:', headers)
  console.log('FormData entries:')
  for (let [key, value] of fd.entries()) {
    console.log(`${key}:`, value.name || value)
  }
  
  const res = await fetch(uploadUrl, { method: 'POST', headers, body: fd })
    
    console.log('Coze API response status:', res.status)
    console.log('Coze API response headers:', Object.fromEntries(res.headers.entries()))
    
    let data
    try { 
      data = await res.json() 
      console.log('Coze API response data:', data)
    } catch (e) { 
      console.log('Failed to parse JSON response:', e)
      data = null 
    }
    
    if (!res.ok) {
      const errorMsg = data?.msg || data?.error || data || 'upload failed'
      console.log('Upload failed:', errorMsg)
      return new Response(JSON.stringify({ error: errorMsg }), { status: res.status, headers: { 'Content-Type': 'application/json' } })
    }
    
    const fileId = data?.file_id || data?.data?.file_id || data?.data?.id || data?.id
    console.log('Upload successful, file_id:', fileId)
    console.log('Available data fields:', Object.keys(data || {}))
    console.log('Available data.data fields:', data?.data ? Object.keys(data.data) : 'no data.data')
    return new Response(JSON.stringify({ file_id: fileId }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Upload API error:', error)
    return new Response(JSON.stringify({ error: 'server error', detail: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}