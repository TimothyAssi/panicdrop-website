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

    // Secure API key access from environment
    const apiKey = process.env.PPLX_API_KEY;
    
    if (!apiKey) {
      throw new Error('PPLX_API_KEY environment variable not set');
    }

    // Enhanced research prompt for comprehensive analysis
    const prompt = `Provide an in-depth fundamental analysis of the ${coinName} (${coinSymbol}) cryptocurrency project. Include its use case, tokenomics, key investors, competitors, network activity, and reasons for recent price movement. Also explain if it's worth watching right now.

Please structure your response with these specific sections:

## Overview
Brief introduction to ${coinName} and what makes it unique in the crypto space.

## Use Case & Value Proposition  
What problem does ${coinName} solve? What is its core value proposition and target market?

## Tokenomics
Token supply, distribution, staking mechanisms, burn mechanisms, and economic incentives.

## Investors & Backers
Key institutional investors, venture capital firms, and notable backers supporting the project.

## Competitors & Market Position
Main competitors and how ${coinName} differentiates itself in the market.

## Recent Developments or Catalysts
Recent news, partnerships, updates, or events that could impact price and adoption.

## Strength Score Explanation
Based on the current market data showing a strength score of ${score}/100, explain why this score makes sense given the project's fundamentals, market performance, and technical indicators.

## ⚠️ Risks / Weaknesses
Key risks, challenges, regulatory concerns, and potential weaknesses investors should be aware of.

## ✅ Summary Verdict
Overall assessment: Is ${coinName} worth watching? Investment potential rating and key reasons.

## Why This Coin Matters
**Bold summary in 1-2 bullet points explaining the most important reasons why ${coinName} stands out in the current market.**

Please provide detailed, factual analysis based on current market data and project fundamentals.`;

    // Call Perplexity API with secure key
    console.log('🚀 Perplexity API request triggered');
    console.log('🔑 Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for comprehensive analysis
    
    const requestHeaders = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    const requestBody = {
      "model": "sonar-pro",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    };
    
    console.log("🔁 Sending to Perplexity:", requestBody);
    console.log("📋 Headers:", requestHeaders);
    console.log("🧠 Prompt:", prompt);
    console.log("✅ Model:", requestBody.model);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📨 Response status:', response.status, response.statusText);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Perplexity API error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Perplexity analysis completed successfully');
    console.log('📄 Full response data:', JSON.stringify(data, null, 2));
    
    const analysis = data.choices?.[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('No analysis content received from Perplexity API');
    }

    // Parse and structure the analysis response
    const structuredAnalysis = parseAnalysisIntoSections(analysis);

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
        structured: structuredAnalysis,
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
    
    // Return structured fallback analysis
    const fallbackAnalysis = generateFallbackAnalysis(event.body ? JSON.parse(event.body) : {});

    return {
      statusCode: 200, // Return 200 so frontend gets fallback
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        result: fallbackAnalysis.raw,
        structured: fallbackAnalysis.structured,
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Parse analysis text into structured sections
function parseAnalysisIntoSections(analysisText) {
  const sections = {
    overview: '',
    useCase: '',
    tokenomics: '',
    investors: '',
    competitors: '',
    developments: '',
    scoreExplanation: '',
    risks: '',
    summary: '',
    whyMatters: ''
  };

  const sectionMap = {
    'overview': ['## Overview', '## Introduction'],
    'useCase': ['## Use Case & Value Proposition', '## Use Case', '## Value Proposition'],
    'tokenomics': ['## Tokenomics', '## Token Economics'],
    'investors': ['## Investors & Backers', '## Investors', '## Backers'],
    'competitors': ['## Competitors & Market Position', '## Competitors', '## Market Position'],
    'developments': ['## Recent Developments or Catalysts', '## Recent Developments', '## Catalysts'],
    'scoreExplanation': ['## Strength Score Explanation', '## Score Explanation'],
    'risks': ['## ⚠️ Risks / Weaknesses', '## Risks', '## Weaknesses'],
    'summary': ['## ✅ Summary Verdict', '## Summary', '## Verdict'],
    'whyMatters': ['## Why This Coin Matters', '## Why Important']
  };

  // Split by sections and map content
  const allSections = analysisText.split('##').filter(section => section.trim());
  
  allSections.forEach(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();
    
    // Find matching section
    for (const [key, patterns] of Object.entries(sectionMap)) {
      if (patterns.some(pattern => title.includes(pattern.replace('## ', '').toLowerCase()))) {
        sections[key] = content;
        break;
      }
    }
  });

  return sections;
}

// Generate fallback analysis when API fails
function generateFallbackAnalysis(coinData) {
  const { coinName = 'This cryptocurrency', coinSymbol = 'CRYPTO', category = 'crypto' } = coinData;
  
  const structured = {
    overview: `${coinName} is a digital asset in the ${category} sector. Due to technical limitations, we cannot provide a live analysis at this moment.`,
    useCase: 'Live analysis temporarily unavailable. Please check the project\'s official documentation for use case details.',
    tokenomics: 'Token economics data unavailable. Refer to official project documentation.',
    investors: 'Investor information unavailable at this time.',
    competitors: 'Competitive analysis unavailable. Research similar projects in the market.',
    developments: 'Recent developments data unavailable. Check official project channels.',
    scoreExplanation: 'Score explanation unavailable due to technical limitations.',
    risks: 'Risk assessment unavailable. Always conduct thorough research before investing.',
    summary: '⚠️ Live analysis temporarily unavailable. Please try again later or consult multiple sources for investment decisions.',
    whyMatters: '**Analysis service temporarily down**\n• Check official project documentation\n• Consult multiple research sources'
  };

  const raw = Object.entries(structured)
    .map(([key, content]) => `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n${content}`)
    .join('\n\n');

  return { structured, raw };
}