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
      console.log('🚫 Blocked unauthorized screenshot analysis request:', { origin, referer });
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Forbidden: Invalid request origin'
        })
      };
    }
    
    console.log('✅ Authorized screenshot analysis request from:', origin || referer);

    const { base64Image, prompt } = JSON.parse(event.body || '{}');

    if (!base64Image || !prompt) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Missing base64Image or prompt in request body'
        })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable missing');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'OpenAI API key not configured'
        })
      };
    }

    console.log('📸 Analyzing screenshot with OpenAI GPT-4 Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}` 
              } 
            }
          ]
        }],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API Error ${response.status}:`, errorText);
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: `OpenAI API Error: ${response.status}`,
          details: errorText
        })
      };
    }

    const data = await response.json();
    console.log('✅ Screenshot analysis completed successfully');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error('❌ Screenshot analysis error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Screenshot analysis failed',
        details: err.message
      })
    };
  }
};