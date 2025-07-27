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
    
    const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: 'What is Ethereum? Please provide a very brief 1-sentence answer.'
        }],
        temperature: 0.1,
        max_tokens: 100
      })
    });

    console.log('📨 Test response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Test API call failed:', errorText);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: `API test failed: ${testResponse.status} ${testResponse.statusText}`,
          debug: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            errorBody: errorText,
            hasApiKey: true,
            apiKeyPrefix: apiKey.substring(0, 10)
          }
        })
      };
    }

    const testData = await testResponse.json();
    console.log('✅ Test API call successful');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Perplexity API is working correctly',
        debug: {
          hasApiKey: true,
          apiKeyPrefix: apiKey.substring(0, 10),
          testResponse: {
            status: testResponse.status,
            content: testData.choices?.[0]?.message?.content || 'No content'
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