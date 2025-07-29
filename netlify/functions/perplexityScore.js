const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const apiKey = process.env.PPLX_API_KEY;
    if (!apiKey) throw new Error('PPLX_API_KEY ontbreekt');

    const { token } = JSON.parse(event.body || '{}');
    if (!token) throw new Error('Token ontbreekt');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [
          { role: 'user', content: `Rate ${token} cryptocurrency 0-100 based on market trends and sentiment.` }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error(`Perplexity API Error ${response.status}`);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};