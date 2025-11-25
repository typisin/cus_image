export const config = { runtime: 'edge' }

export default async function handler(req) {
  console.log('=== Describer Workflow API Start ===', { method: req.method, url: ' /api/coze/describer/run ' })
  if (req.method !== 'POST') {
    console.log('Non-POST request received')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }
  const workflowUrl = 'https://api.coze.cn/v1/workflow/run'
  const envToken = process.env.COZE_SAT
  const clientToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-coze-token') || req.headers.get('token')
  const token = envToken || clientToken
  console.log('Token presence', { envToken: !!envToken, clientToken: !!clientToken, final: !!token })
  if (!token) {
    console.log('Missing token')
    return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
  let body
  try { body = await req.json() } catch (e) { console.log('Invalid JSON body', e?.message); return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  const image = body && body.image
  const promptStyle = body && body.prompt_style
  const workflowId = process.env.COZE_WORKFLOW_Describer_ID
  console.log('Request fields', { imageLen: image ? (''+image).length : 0, promptStyle, hasWorkflowId: !!workflowId })
  if (!image) { console.log('Missing image'); return new Response(JSON.stringify({ error: 'image required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  if (!workflowId) { console.log('Missing workflow id env'); return new Response(JSON.stringify({ error: 'workflow_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }
  const payload = { workflow_id: workflowId, parameters: { image: image, prompt_style: promptStyle || 'Brief' } }
  console.log('Prepared payload', { workflow_id: payload.workflow_id, hasImage: !!payload.parameters.image, promptStyle: payload.parameters.prompt_style })
  async function postWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }
  async function postWithRetry(url, options, attempts, timeoutMs) {
    let lastError = null;
    for (let i = 0; i < attempts; i++) {
      const delay = i === 0 ? 0 : Math.min(3000, 500 * Math.pow(3, i - 1));
      if (delay) await new Promise(r => setTimeout(r, delay));
      try {
        console.time(`coze_workflow_request_${i+1}`)
        const res = await postWithTimeout(url, options, timeoutMs);
        console.timeEnd(`coze_workflow_request_${i+1}`)
        if (res.status >= 500) { lastError = new Error(`upstream_${res.status}`); console.log('Retry on 5xx', res.status); continue; }
        return res;
      } catch (e) {
        lastError = e;
        console.log('Retry on exception', e?.message);
      }
    }
    throw lastError || new Error('upstream_failed');
  }
  try {
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    const options = { method: 'POST', headers, body: JSON.stringify(payload) }
    const res = await postWithRetry(workflowUrl, options, 3, 15000)
    console.log('Workflow response status', res.status)
    let responseData
    try { responseData = await res.json(); console.log('Workflow response json keys', Object.keys(responseData || {})) } catch (e) { const text = await res.text(); console.log('Workflow response non-json length', text.length); return new Response(JSON.stringify({ error: 'Invalid JSON response', raw_text: text }), { status: 500, headers: { 'Content-Type': 'application/json' } }) }
    if (res.ok) {
      let processed = responseData?.data
      let text = null
      try {
        const obj = typeof processed === 'string' ? JSON.parse(processed) : processed
        if (obj) {
          if (obj.output && typeof obj.output === 'object' && obj.output.text) text = obj.output.text
          else if (obj.text) text = obj.text
          else if (typeof obj.output === 'string') text = obj.output
        }
      } catch (e) { console.log('Parse data error', e?.message) }
      console.log('Extracted text length', text ? text.length : 0)
      const result = { code: responseData?.code, msg: responseData?.msg, data: responseData?.data, log_id: responseData?.detail?.logid, text: text, execute_id: responseData?.execute_id }
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    } else {
      const errorMsg = responseData?.msg || responseData?.error || 'Workflow failed'
      console.log('Workflow failed', { status: res.status, errorMsg, code: responseData?.code })
      const payload = { error: errorMsg, code: responseData?.code, detail: responseData?.detail, retryable: res.status >= 500, upstream_status: res.status }
      return new Response(JSON.stringify(payload), { status: res.status, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    console.log('Workflow exception', error?.message)
    return new Response(JSON.stringify({ error: 'upstream_timeout_or_exception', detail: error.message, retryable: true }), { status: 504, headers: { 'Content-Type': 'application/json' } })
  }
}
