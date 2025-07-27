exports.handler = async function(event, context) {
  console.log('🚀 Netlify Function: perplexity-analysis started');
  
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    const { coinName, coinSymbol, category, marketCap, price, score } = JSON.parse(event.body || '{}');
    
    if (!coinName || !coinSymbol) {
      throw new Error('Missing required parameters: coinName and coinSymbol');
    }

    console.log(`📊 Analyzing ${coinName} (${coinSymbol}) in ${category} category`);

    // Create detailed analysis prompt
    const prompt = `
As an expert crypto analyst, provide a comprehensive deep-dive analysis for the cryptocurrency "${coinName}" (${coinSymbol}), which is categorized under "${category}". 

The coin currently has:
- Market Cap: $${marketCap || 'Unknown'}
- Price: $${price || 'Unknown'} 
- Strength Score: ${score || 'Unknown'}/100

Please provide a structured analysis with the following sections:

## 🔍 Project Overview
What does ${coinName} do and how does it work? Explain the core technology and use case.

## 🚀 Competitive Advantage & Roadmap
What makes ${coinName} unique? What are their key partnerships and future plans?

## ⚠️ Risks & Challenges
What are the main risks, regulatory concerns, and technical challenges?

## 💰 Tokenomics & Economics
Token supply, distribution, staking mechanisms, and economic model.

## 👥 Community & Development
Developer activity, community size, social presence, and ecosystem growth.

## 📈 Score Justification
Why ${coinName} received its current strength score of ${score || 'this'}/100 based on market performance, technology, and fundamentals.

## ✅ Key Summary Points
3-5 bullet points summarizing the most important investment considerations.

Structure your response with clear headers and detailed explanations for each section. Focus on factual, actionable insights.
`;

    // Call Perplexity API with native fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PPLX_API_KEY || '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'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        temperature: 0.3,
        max_tokens: 2000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Perplexity API error! status: ${response.status}, statusText: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Perplexity analysis completed successfully');
    
    const analysis = data.choices?.[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('No analysis content received from Perplexity API');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        result: analysis,
        coin: {
          name: coinName,
          symbol: coinSymbol,
          category: category,
          marketCap: marketCap,
          price: price,
          score: score
        },
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Perplexity Analysis Error:', error.message);
    
    // Return fallback analysis
    const fallbackAnalysis = `
## 🔍 Project Overview
${event.body ? JSON.parse(event.body).coinName : 'This cryptocurrency'} is a digital asset in the ${event.body ? JSON.parse(event.body).category : 'crypto'} sector. Due to technical limitations, we cannot provide a live analysis at this moment.

## 📊 Current Status
- Analysis service temporarily unavailable
- Please try again later or check external sources
- Error: ${error.message}

## ✅ Key Summary Points
• Live analysis temporarily unavailable
• Check coin's official documentation
• Monitor market trends and community updates
• Consider multiple sources for investment decisions
`;

    return {
      statusCode: 200, // Return 200 so frontend gets fallback
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        result: fallbackAnalysis,
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};