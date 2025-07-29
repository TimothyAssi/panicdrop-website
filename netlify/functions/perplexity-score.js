// Netlify Function: perplexity-score.js
// Endpoint: /api/perplexity-score

let lastRequestTime = 0;

const FALLBACK_SCORES = {
  'Cardano': 68, 'ADA': 68,
  'Solana': 75, 'SOL': 75,
  'Polkadot': 62, 'DOT': 62,
  'Polygon': 70, 'MATIC': 70,
  'Chainlink': 72, 'LINK': 72,
  'Bitcoin': 85, 'BTC': 85,
  'Ethereum': 82, 'ETH': 82
};

// Rate limiting helper
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minInterval = 1000; // 1 second between requests
  
  if (timeSinceLastRequest < minInterval) {
    const waitTime = minInterval - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

// Extract score from Perplexity response
function extractScore(content) {
  const patterns = [
    /Score:\s*(\d+)/i,
    /(\d{1,2})[\/\s]*(?:out of\s*)?100/i,
    /(\d{1,2})\/100/i,
    /rating[:\s]*(\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 100) {
        return score;
      }
    }
  }
  
  return 50; // Default fallback
}

// Clean explanation text
function cleanExplanation(content, tokenName) {
  let explanation = content
    .replace(/^Score:\s*\d+\.?\s*/i, '')
    .replace(/^\d+[\/\s]*(?:out of\s*)?100\.?\s*/i, '')
    .trim();

  if (!explanation || explanation.length < 10) {
    explanation = `Analysis for ${tokenName}: moderate market performance with balanced risk factors.`;
  }

  return explanation;
}

exports.handler = async (event, context) => {
  // Log everything for debugging
  console.log('🧠 perplexity-score function called');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Body:', event.body);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed. Use POST.',
        allowedMethods: ['POST']
      })
    };
  }

  // Parse request body
  let tokenName;
  try {
    const body = JSON.parse(event.body || '{}');
    tokenName = body.tokenName;
    
    if (!tokenName) {
      console.log('❌ Missing tokenName in request body');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing tokenName in request body',
          example: { tokenName: 'Bitcoin' }
        })
      };
    }
    
    console.log(`🔍 Processing request for token: ${tokenName}`);
  } catch (parseError) {
    console.log('❌ Invalid JSON in request body:', parseError.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Invalid JSON in request body',
        example: { tokenName: 'Bitcoin' }
      })
    };
  }

  try {
    const apiKey = process.env.PPLX_API_KEY;
    
    // If no API key, return fallback immediately
    if (!apiKey) {
      console.log('⚠️ No PPLX_API_KEY, returning fallback score');
      const fallbackScore = FALLBACK_SCORES[tokenName] || (50 + Math.floor(Math.random() * 30));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          score: fallbackScore,
          explanation: `Mock analysis for ${tokenName}: moderate market interest with standard risk assessment.`,
          tokenName,
          warning: 'Using fallback data - PPLX_API_KEY not configured',
          fallback: true,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Rate limiting
    await enforceRateLimit();
    
    console.log(`📡 Calling Perplexity API for ${tokenName}...`);
    
    // Call Perplexity API with 6-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-medium-online',
          messages: [{
            role: 'user',
            content: `Rate ${tokenName} cryptocurrency 0-100 based on current market trends and sentiment. Format: "Score: [number]. [brief analysis]"`
          }],
          max_tokens: 100,
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        throw new Error('Invalid PPLX_API_KEY - check your Perplexity API key');
      }

      if (response.status === 429) {
        throw new Error('Rate limit exceeded - please wait before retrying');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content) {
        throw new Error('No content received from Perplexity API');
      }

      const score = extractScore(content);
      const explanation = cleanExplanation(content, tokenName);

      console.log(`✅ Perplexity Success: ${tokenName} scored ${score}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          score,
          explanation,
          tokenName,
          source: 'perplexity',
          timestamp: new Date().toISOString()
        })
      };

    } catch (apiError) {
      clearTimeout(timeoutId);
      console.log(`⚠️ Perplexity API failed for ${tokenName}:`, apiError.message);
      
      // Return fallback on API failure
      const fallbackScore = FALLBACK_SCORES[tokenName] || (45 + Math.floor(Math.random() * 25));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          score: fallbackScore,
          explanation: `Mock analysis for ${tokenName}: moderate market interest with standard risk factors.`,
          tokenName,
          warning: `Perplexity API failed: ${apiError.message}`,
          fallback: true,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error(`❌ Function error for ${tokenName}:`, error);
    
    const fallbackScore = FALLBACK_SCORES[tokenName] || (45 + Math.floor(Math.random() * 25));
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        score: fallbackScore,
        explanation: `Mock analysis for ${tokenName}: moderate market interest with standard risk factors.`,
        tokenName,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};