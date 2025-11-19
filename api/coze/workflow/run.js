export const config = { runtime: 'edge' }

export default async function handler(req) {
  console.log('=== Workflow Run API Debug ===')
  
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  
  const workflowUrl = 'https://api.coze.cn/v1/workflow/run'
  const envToken = process.env.COZE_SAT
  const clientToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-coze-token') || req.headers.get('token')
  const token = envToken || clientToken
  
  console.log('Environment token present:', !!envToken)
  console.log('Client token present:', !!clientToken)
  console.log('Final token present:', !!token)
  
  if (!token) return new Response(JSON.stringify({ error: 'token required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  
  try {
    let body
    try { 
      body = await req.json() 
    } catch (e) { 
      return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    
    const { file_id, workflow_id } = body
    const envWorkflowId = process.env.COZE_WORKFLOW_Cutout_ID
    const finalWorkflowId = workflow_id || envWorkflowId
    
    console.log('Received file_id:', file_id)
    console.log('Received workflow_id:', workflow_id)
    console.log('Environment workflow_id:', envWorkflowId)
    console.log('Final workflow_id:', finalWorkflowId)
    
    if (!file_id) return new Response(JSON.stringify({ error: 'file_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    if (!finalWorkflowId) return new Response(JSON.stringify({ error: 'workflow_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    
    // 按照curl命令格式构建参数
    const payload = {
      workflow_id: finalWorkflowId,
      parameters: {
        input: JSON.stringify({file_id: file_id})
      }
    };
    
    console.log('Sending workflow request with curl format:', JSON.stringify(payload, null, 2));
    
    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(workflowUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
      
      console.log('Workflow response status:', res.status);
      
      let responseData;
      try { 
        responseData = await res.json();
        console.log('Workflow response data:', JSON.stringify(responseData, null, 2));
      } catch (e) {
        const text = await res.text();
        console.log('Workflow response text:', text);
        return new Response(JSON.stringify({ error: 'Invalid JSON response', raw_text: text }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      
      if (res.ok) {
        console.log('✅ Workflow SUCCESS');
        
        // Enhanced data extraction for image URLs
        let processedData = responseData?.data;
        let imageUrl = null;
        
        // Try to extract image URL from different possible formats
        if (processedData) {
          try {
            // If data is a JSON string, parse it
            const dataObj = typeof processedData === 'string' ? JSON.parse(processedData) : processedData;
            
            // Look for image URL in various possible locations
            if (dataObj.output) {
              if (dataObj.output.image_url) {
                imageUrl = dataObj.output.image_url;
              } else if (typeof dataObj.output === 'string' && dataObj.output.startsWith('http')) {
                imageUrl = dataObj.output;
              }
            } else if (dataObj.image_url) {
              imageUrl = dataObj.image_url;
            } else if (dataObj.url) {
              imageUrl = dataObj.url;
            }
            
            console.log('Extracted image URL:', imageUrl);
          } catch (e) {
            console.log('Could not parse workflow data for image URL extraction:', e);
          }
        }
        
        const result = {
          code: responseData?.code,
          msg: responseData?.msg,
          data: responseData?.data,
          log_id: responseData?.detail?.logid,
          image_url: imageUrl,
          execute_id: responseData?.execute_id
        };
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
      } else {
        const errorMsg = responseData?.msg || responseData?.error || 'Workflow failed';
        console.log(`❌ Workflow failed: ${errorMsg}`);
        return new Response(JSON.stringify({ 
          error: errorMsg, 
          code: responseData?.code,
          detail: responseData?.detail 
        }), { 
          status: res.status, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    } catch (error) {
      console.log(`❌ Workflow exception: ${error.message}`);
      return new Response(JSON.stringify({ error: 'Workflow request failed', detail: error.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
  } catch (error) {
    console.error('Workflow API error:', error)
    return new Response(JSON.stringify({ error: 'server error', detail: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}