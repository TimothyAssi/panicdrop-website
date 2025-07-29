const https = require('https');

let lastRequestTime = 0;

// Fallback scores for common tokens
const FALLBACK_SCORES = {
  'Cardano': 68, 'ADA': 68,
  'Solana': 75, 'SOL': 75,
  'Polkadot': 62, 'DOT': 62,
  'Polygon': 70, 'MATIC': 70,
  'Chainlink': 72, 'LINK': 72,
  'Bitcoin': 85, 'BTC': 85,
  'Ethereum': 82, 'ETH': 82
};

// HTTP request helper for POST requests
function makePostRequest(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: response.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(8000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
    
    request.write(body);
    request.end();
  });
}

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
  console.log('🧠 Perplexity API Function called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let tokenName;
  try {
    const body = JSON.parse(event.body || '{}');
    tokenName = body.tokenName;
    if (!tokenName) {
      throw new Error('Missing tokenName in request body');
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request: provide tokenName' })
    };
  }

  const apiKey = process.env.PPLX_API_KEY;
  
  // Return fallback data if no API key
  if (!apiKey) {
    console.log('⚠️ No PPLX_API_KEY found, returning fallback score');
    const fallbackScore = FALLBACK_SCORES[tokenName] || (50 + Math.floor(Math.random() * 30));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        score: fallbackScore,
        explanation: `Mock analysis for ${tokenName}: moderate market interest with standard risk assessment.`,
        tokenName,
        warning: 'Using fallback data - PPLX_API_KEY not configured',
        fallback: true
      })
    };
  }

  try {
    // Rate limiting
    await enforceRateLimit();
    
    console.log(`🔍 Analyzing ${tokenName} with Perplexity...`);
    
    const requestBody = JSON.stringify({
      model: 'sonar-medium-online',
      messages: [{
        role: 'user',
        content: `Rate ${tokenName} cryptocurrency 0-100 based on current market trends and sentiment. Format: "Score: [number]. [brief analysis]"`
      }],
      max_tokens: 100,
      temperature: 0.3
    });

    const response = await makePostRequest(
      'api.perplexity.ai',
      '/chat/completions',
      {
        'Authorization': `Bearer ${apiKey}`
      },
      requestBody
    );

    if (response.status === 401) {
      throw new Error('Invalid PPLX_API_KEY');
    }

    if (response.status !== 200) {
      throw new Error(`Perplexity API returned status ${response.status}`);
    }

    const content = response.data.choices?.[0]?.message?.content || '';
    
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
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error(`❌ Perplexity API Error for ${tokenName}:`, error.message);
    
    const fallbackScore = FALLBACK_SCORES[tokenName] || (45 + Math.floor(Math.random() * 25));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        score: fallbackScore,
        explanation: `Mock analysis for ${tokenName}: moderate market interest with standard risk factors.`,
        tokenName,
        warning: `Perplexity API failed: ${error.message}`,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};