const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { token } = JSON.parse(event.body || '{}');

    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) throw new Error('PPLX_API_KEY ontbreekt');

    const body = {
      model: 'sonar-medium-online',
      messages: [
        { role: 'user', content: `Rate ${token} cryptocurrency 0-100 with short analysis` }
      ],
      max_tokens: 100,
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