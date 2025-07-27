exports.handler = async function(event, context) {
  console.log('🔧 Perplexity Debug Function Started');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Check API key
    const apiKey = process.env.PPLX_API_KEY;
    console.log('🔑 API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('🔑 Full API Key length:', apiKey ? apiKey.length : 0);
    console.log('🔑 API Key starts with pplx-:', apiKey ? apiKey.startsWith('pplx-') : 'N/A');
    
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'PPLX_API_KEY environment variable not set',
          debug: {
            hasApiKey: false,
            env: Object.keys(process.env).filter(key => key.includes('PPLX'))
          }
        })
      };
    }

    // Test basic API call
    console.log('🧪 Testing basic Perplexity API call...');
    
    const testHeaders = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    // Test sonar-pro model
    const testBody = {
      "model": "sonar-pro",
      "messages": [
        {
          "role": "user",
          "content": "Test: What is Ethereum?"
        }
      ]
    };

    console.log("🔁 Sending to Perplexity:", testBody);
    console.log("📋 Headers:", testHeaders);
    console.log("🧠 Prompt:", testBody.messages[0].content);
    console.log("✅ Model:", testBody.model);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: testHeaders,
      body: JSON.stringify(testBody)
    });

    console.log('📨 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API call failed:', errorText);
      console.error('📋 Failed Request Headers:', JSON.stringify(testHeaders, null, 2));
      console.error('📤 Failed Request Body:', JSON.stringify(testBody, null, 2));
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: `API test failed: ${response.status} ${response.statusText}`,
          debug: {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText,
            hasApiKey: true,
            apiKeyPrefix: apiKey.substring(0, 10),
            requestHeaders: testHeaders,
            requestBody: testBody,
            responseHeaders: Object.fromEntries(response.headers.entries())
          }
        })
      };
    }

    const data = await response.json();
    console.log('✅ API call successful:', data);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Perplexity API working with sonar-pro model',
        debug: {
          hasApiKey: true,
          apiKeyPrefix: apiKey.substring(0, 10),
          model: testBody.model,
          response: {
            status: response.status,
            content: data.choices?.[0]?.message?.content || 'No content'
          }
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('🔥 Debug function error:', error);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        debug: {
          stack: error.stack,
          name: error.name
        },
        timestamp: new Date().toISOString()
      })
    };
  }
};