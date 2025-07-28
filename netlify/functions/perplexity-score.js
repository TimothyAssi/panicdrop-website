const fetch = require('node-fetch');

let lastRequestTime = 0;

exports.handler = async (event) => {
  console.log('Perplexity: Request received');
  console.log('Perplexity: Method:', event.httpMethod);
  console.log('Perplexity: Body:', event.body);
  
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }
  
  if (event.httpMethod !== 'POST') {
    console.error('Perplexity: Invalid method -', event.httpMethod);
    return { 
      statusCode: 405, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.PPLX_API_KEY;
  if (!apiKey) {
    console.error('Perplexity: Missing PPLX_API_KEY environment variable');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Server configuration error', 
        score: 50, 
        explanation: 'Mock analysis: API key not configured.',
        fallback: true
      }),
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
    console.error('Perplexity: Invalid request body:', error.message);
    return { 
      statusCode: 400, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid request: provide tokenName' }) 
    };
  }

  // Rate limiting: 1-second delay between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    const delayNeeded = 1000 - timeSinceLastRequest;
    console.log(`Perplexity: Rate limiting - waiting ${delayNeeded}ms`);
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  lastRequestTime = Date.now();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Perplexity API timeout after 8 seconds')), 8000)
  );

  try {
    console.log(`Perplexity: Fetching score for ${tokenName}`);
    const response = await Promise.race([
      fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar-medium-online',
          messages: [
            {
              role: 'user',
              content: `Evaluate ${tokenName} based on market trends, sentiment, and adoption. Return a score (0-100) and a brief explanation (2-3 sentences). Format: Score: X. Explanation: [text].`,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      }),
      timeoutPromise,
    ]);

    if (!response.ok) {
      console.error(`Perplexity: API error - Status: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }
    
    console.log(`Perplexity: Raw response for ${tokenName}:`, content);
    
    // Extract score from content
    const scoreMatch = content.match(/Score:\s*(\d+)/i);
    let score = 50; // Default fallback
    
    if (scoreMatch) {
      score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    } else {
      // Try alternative patterns
      const altScoreMatch = content.match(/(\d{1,3})[\/\s]*(?:out of )?100/i) || 
                           content.match(/(\d{1,3})%/i) ||
                           content.match(/rating[:\s]*(\d{1,3})/i);
      if (altScoreMatch) {
        score = Math.min(100, Math.max(0, parseInt(altScoreMatch[1])));
      } else {
        // Sentiment analysis fallback
        const positiveWords = ['bullish', 'positive', 'strong', 'growth', 'good', 'excellent'];
        const negativeWords = ['bearish', 'negative', 'weak', 'decline', 'poor', 'bad'];
        
        const lowerContent = content.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
        
        if (positiveCount > negativeCount) {
          score = 70 + Math.floor(Math.random() * 20); // 70-89
        } else if (negativeCount > positiveCount) {
          score = 30 + Math.floor(Math.random() * 20); // 30-49
        } else {
          score = 50 + Math.floor(Math.random() * 20); // 50-69
        }
      }
    }
    
    // Extract explanation
    const explanationMatch = content.match(/Explanation:\s*(.+)/i);
    let explanation = explanationMatch ? explanationMatch[1].trim() : content.trim();
    
    // Clean up explanation
    explanation = explanation.replace(/^(Score:\s*\d+\.?\s*)/i, '').trim();
    if (!explanation) {
      explanation = `Analysis for ${tokenName}: moderate market interest based on current trends.`;
    }

    console.log(`Perplexity: Success for ${tokenName} - Score: ${score}, Explanation length: ${explanation.length}`);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        score, 
        explanation,
        tokenName,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error(`Perplexity: Failed for ${tokenName}:`, error.message);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        score: 50,
        explanation: `Mock analysis for ${tokenName}: moderate market interest.`,
        tokenName,
        warning: `Perplexity API failed: ${error.message}`,
        fallback: true,
        timestamp: new Date().toISOString()
      }),
    };
  }
};