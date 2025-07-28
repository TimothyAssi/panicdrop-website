const fetch = require('node-fetch');

console.log('Perplexity: Function loaded');

let lastRequestTime = 0;

exports.handler = async (event) => {
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

  console.log('Perplexity: Request received - Method:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check for node-fetch
  try {
    if (!fetch) {
      throw new Error('node-fetch not available');
    }
    console.log('Perplexity: node-fetch imported successfully');
  } catch (error) {
    console.error('Perplexity: node-fetch import error:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        score: 50,
        explanation: 'Mock analysis: node-fetch dependency missing.',
        fallback: true
      })
    };
  }

  const apiKey = process.env.PPLX_API_KEY;
  if (!apiKey) {
    console.error('Perplexity: Missing PPLX_API_KEY environment variable');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        score: 50,
        explanation: 'Mock analysis: PPLX_API_KEY not configured.',
        fallback: true
      })
    };
  }

  let tokenName;
  try {
    const body = JSON.parse(event.body || '{}');
    tokenName = body.tokenName;
    if (!tokenName) {
      throw new Error('Missing tokenName in request body');
    }
    console.log(`Perplexity: Processing request for ${tokenName}`);
  } catch (error) {
    console.error('Perplexity: Invalid request body:', error.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request: provide tokenName' })
    };
  }

  // Enhanced rate limiting with 429 handling
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const baseDelay = 1000; // 1 second base delay
  
  if (timeSinceLastRequest < baseDelay) {
    const delayNeeded = baseDelay - timeSinceLastRequest;
    console.log(`Perplexity: Rate limiting - waiting ${delayNeeded}ms`);
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  lastRequestTime = Date.now();

  // API call with retry logic for 429
  const fetchWithRetry = async (retryCount = 0) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Perplexity API timeout after 8 seconds')), 8000)
    );

    try {
      console.log(`Perplexity: Attempting API call for ${tokenName} (attempt ${retryCount + 1})`);
      
      const response = await Promise.race([
        fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'Netlify-Function/1.0'
          },
          body: JSON.stringify({
            model: 'sonar-medium-online',
            messages: [{
              role: 'user',
              content: `Rate ${tokenName} cryptocurrency 0-100 based on trends and sentiment. Reply format: "Score: [number]. [brief explanation]"`
            }],
            max_tokens: 80,
            temperature: 0.3
          }),
          timeout: 7000
        }),
        timeoutPromise
      ]);

      console.log(`Perplexity: Response status for ${tokenName}: ${response.status}`);

      if (response.status === 429 && retryCount === 0) {
        console.log('Perplexity: Rate limit hit, waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(1);
      }

      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid PPLX_API_KEY');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Perplexity: Raw response for ${tokenName}:`, JSON.stringify(data));

      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content) {
        throw new Error('No content received from Perplexity API');
      }

      // Simplified parsing
      let score = 50;
      let explanation = content.trim();

      // Extract score with multiple patterns
      const scorePatterns = [
        /Score:\s*(\d+)/i,
        /(\d{1,2})[\/\s]*(?:out of\s*)?100/i,
        /(\d{1,2})\/100/i,
        /(\d{1,2})%/i,
        /rating[:\s]*(\d{1,2})/i
      ];

      for (const pattern of scorePatterns) {
        const match = content.match(pattern);
        if (match) {
          const extractedScore = parseInt(match[1]);
          if (extractedScore >= 0 && extractedScore <= 100) {
            score = extractedScore;
            break;
          }
        }
      }

      // Clean explanation
      explanation = explanation
        .replace(/^Score:\s*\d+\.?\s*/i, '')
        .replace(/^\d+[\/\s]*(?:out of\s*)?100\.?\s*/i, '')
        .trim();

      if (!explanation || explanation.length < 10) {
        explanation = `Analysis for ${tokenName}: moderate market performance with standard risk factors.`;
      }

      console.log(`Perplexity: Success for ${tokenName} - Score: ${score}`);
      
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
      console.error(`Perplexity: API error for ${tokenName} (attempt ${retryCount + 1}):`, error.message);
      
      if (retryCount === 0 && (error.message.includes('429') || error.message.includes('rate'))) {
        console.log('Perplexity: Retrying after rate limit...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(1);
      }
      
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error(`Perplexity: Final error for ${tokenName}:`, error.message);
    
    // Generate fallback score based on token
    const fallbackScores = {
      'Cardano': 65, 'ADA': 65,
      'Solana': 75, 'SOL': 75,
      'Polkadot': 60, 'DOT': 60,
      'Polygon': 70, 'MATIC': 70,
      'Chainlink': 68, 'LINK': 68
    };
    
    const fallbackScore = fallbackScores[tokenName] || (45 + Math.floor(Math.random() * 20));
    
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