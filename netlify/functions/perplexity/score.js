const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const apiKey = process.env.PPLX_API_KEY;
    const body = JSON.parse(event.body || "{}");
    const tokenName = body.token || "Bitcoin";

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [{
          role: 'user',
          content: `Rate ${tokenName} cryptocurrency 0-100 based on current market trends and sentiment. Format: "Score: [number]."`
        }],
        max_tokens: 100,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};