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
    
    const testHeaders = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    // Try multiple API formats to find the working one
    const testFormats = [
      {
        name: "Format 1: Basic",
        body: {
          "model": "llama-3-sonar-small-32k-online",
          "messages": [
            {
              "role": "user",
              "content": "What is Ethereum?"
            }
          ]
        }
      },
      {
        name: "Format 2: With stream false",
        body: {
          "model": "llama-3-sonar-small-32k-online",
          "messages": [
            {
              "role": "user",
              "content": "What is Ethereum?"
            }
          ],
          "stream": false
        }
      },
      {
        name: "Format 3: pplx-7b-chat model",
        body: {
          "model": "pplx-7b-chat",
          "messages": [
            {
              "role": "user",
              "content": "What is Ethereum?"
            }
          ],
          "stream": false
        }
      }
    ];

    let testResults = [];

    for (const format of testFormats) {
      console.log(`🧪 Testing ${format.name}...`);
      console.log('🔍 Request Body:', JSON.stringify(format.body, null, 2));
      
      try {
        const formatResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: testHeaders,
          body: JSON.stringify(format.body)
        });

        console.log(`📨 ${format.name} response status:`, formatResponse.status);
        
        if (formatResponse.ok) {
          const formatData = await formatResponse.json();
          testResults.push({
            format: format.name,
            success: true,
            status: formatResponse.status,
            content: formatData.choices?.[0]?.message?.content || 'No content'
          });
          console.log(`✅ ${format.name} SUCCESS!`);
          break; // Use the first working format
        } else {
          const errorText = await formatResponse.text();
          testResults.push({
            format: format.name,
            success: false,
            status: formatResponse.status,
            error: errorText
          });
          console.error(`❌ ${format.name} failed:`, errorText);
        }
      } catch (error) {
        testResults.push({
          format: format.name,
          success: false,
          error: error.message
        });
        console.error(`💥 ${format.name} threw error:`, error.message);
      }
    }

    const testBody = testFormats[0].body; // Keep original for response format

    console.log('🔍 Test Request Headers:', JSON.stringify(testHeaders, null, 2));
    console.log('🔍 Test Request Body:', JSON.stringify(testBody, null, 2));
    
    // Check if any format succeeded
    const successfulTest = testResults.find(result => result.success);
    
    if (successfulTest) {
      console.log('✅ Found working API format!', successfulTest.format);
    } else {
      console.error('❌ All API formats failed');
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: successfulTest ? true : false,
        message: successfulTest ? `Perplexity API working with ${successfulTest.format}` : 'All API formats failed',
        debug: {
          hasApiKey: true,
          apiKeyPrefix: apiKey.substring(0, 10),
          testResults: testResults,
          workingFormat: successfulTest || null,
          requestHeaders: testHeaders
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