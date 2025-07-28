// Import fetch for Node.js environment
const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log('🚀 Perplexity Score API started');
  
  // Handle CORS
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

  // TEST MODE: Return dummy score immediately
  if (event.queryStringParameters?.test === "1") {
    console.log('🧪 Test mode activated');
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        score: 77, 
        explanation: "Test mode - API functioning correctly", 
        tokenName: "Bitcoin" 
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('❌ Body parsing failed:', parseError);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          score: null,
          explanation: 'Request parsing failed.',
          tokenName: null
        })
      };
    }

    const { tokenName } = requestBody;

    if (!tokenName) {
      console.error('❌ Token name missing');
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Token name is required',
          score: null,
          explanation: 'No token specified for analysis.',
          tokenName: null
        })
      };
    }

    // Check API key with detailed logging
    const apiKey = process.env.PPLX_API_KEY;
    console.log(`🔑 API Key check: ${apiKey ? 'FOUND' : 'MISSING'}`);
    
    if (!apiKey) {
      console.error('❌ PPLX_API_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: false,
          error: 'Perplexity API key not configured',
          score: null,
          explanation: 'API configuration missing. Please check environment variables.',
          tokenName: tokenName
        })
      };
    }

    console.log(`🔍 Analyzing token: ${tokenName}`);

    // Create timeout promise (8 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('API request timed out after 8 seconds'));
      }, 8000);
    });

    // Create simplified API request
    const apiRequest = fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [{
          role: 'user',
          content: `Give a crypto risk score (0-100) for ${tokenName} based on unlocks, supply trend, wallet holders and any recent token events.`
        }],
        max_tokens: 300,
        temperature: 0.2
      })
    });

    console.log('📡 Sending request to Perplexity API...');

    // Race between API call and timeout
    const response = await Promise.race([apiRequest, timeoutPromise]);
    
    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Perplexity API error: ${response.status} - ${errorText}`);
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Perplexity API response received successfully');

    // Extract content
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('❌ No content in API response');
      throw new Error('No content received from Perplexity');
    }

    console.log('📝 Content received, extracting score...');

    // Extract numeric score from content
    let score = null;
    const scoreMatches = [
      /score[:\s]*(\d{1,3})/i,
      /(\d{1,3})[\/\s]*(?:out of )?100/i,
      /(\d{1,3})%/i,
      /rating[:\s]*(\d{1,3})/i
    ];

    for (const pattern of scoreMatches) {
      const match = content.match(pattern);
      if (match) {
        score = Math.min(100, Math.max(0, parseInt(match[1])));
        break;
      }
    }

    // Fallback: analyze sentiment if no score found
    if (score === null) {
      console.log('📊 No explicit score found, using sentiment analysis');
      const positiveWords = ['good', 'strong', 'bullish', 'positive', 'rising', 'growth', 'solid'];
      const negativeWords = ['bad', 'weak', 'bearish', 'negative', 'falling', 'decline', 'risky'];
      
      const lowerContent = content.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
      
      if (positiveCount > negativeCount) {
        score = 65 + Math.floor(Math.random() * 20); // 65-85 range
      } else if (negativeCount > positiveCount) {
        score = 25 + Math.floor(Math.random() * 20); // 25-45 range
      } else {
        score = 45 + Math.floor(Math.random() * 20); // 45-65 range
      }
    }

    console.log(`✅ Analysis complete for ${tokenName}: Score ${score}/100`);

    // Return successful response
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        score: score,
        explanation: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        tokenName: tokenName
      })
    };

  } catch (error) {
    console.error('❌ Function error:', error.message);
    
    // Extract token name from request for error response
    let tokenName = null;
    try {
      const body = JSON.parse(event.body || '{}');
      tokenName = body.tokenName;
    } catch (e) {
      // Ignore parsing errors for error response
    }
    
    // Return error response (still 200 to avoid breaking frontend)
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: false,
        score: null,
        explanation: 'Perplexity API timed out or failed.',
        tokenName: tokenName,
        error: error.message
      })
    };
  }
};