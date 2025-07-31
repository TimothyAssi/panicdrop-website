const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Security check: Only allow requests from panicdrop.com
    const origin = event.headers.origin || event.headers.Origin;
    const referer = event.headers.referer || event.headers.Referer;
    
    const allowedDomain = 'https://panicdrop.com';
    const isValidOrigin = origin === allowedDomain;
    const isValidReferer = referer && referer.startsWith(allowedDomain);
    
    // Block requests that don't come from the allowed domain
    if (!isValidOrigin && !isValidReferer) {
      console.log('🚫 Blocked unauthorized request:', { origin, referer });
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Forbidden: Invalid request origin',
          score: 0
        })
      };
    }
    
    console.log('✅ Authorized request from:', origin || referer);

    const { token, maxTokens } = JSON.parse(event.body || '{}');

    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) throw new Error('PPLX_API_KEY ontbreekt');

    // Use the token as the full prompt, or create a default prompt
    const promptContent = token || 'Provide cryptocurrency analysis';
    
    const body = {
      model: 'sonar',
      messages: [
        { role: 'user', content: promptContent }
      ],
      max_tokens: maxTokens || 1000,
      temperature: 0.3
    };

    console.log('➡️ Sending to Perplexity:', JSON.stringify(body));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Log raw response tekst als het fout gaat
    if (!response.ok) {
      const raw = await response.text();
      console.error(`❌ Perplexity API Error ${response.status}:`, raw);
      throw new Error(`Perplexity API Error ${response.status}: ${raw}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error('❌ Catch error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: err.message,
        score: 50,
        explanation: 'Mock fallback - Perplexity API gaf een fout.'
      })
    };
  }
};