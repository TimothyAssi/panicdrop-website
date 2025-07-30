const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    console.log('🔍 CMC API function called');
    const apiKey = process.env.CMC_API_KEY;
    if (!apiKey) {
      console.error('❌ CMC_API_KEY environment variable missing');
      throw new Error('CMC_API_KEY missing - check Netlify environment variables');
    }

    console.log('✅ CMC API key found, making request...');
    const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log('📡 CMC API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ CMC API Error:', response.status, errorText);
      throw new Error(`CMC API Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ CMC API success - received', data.data?.length || 0, 'cryptocurrencies');

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('❌ CMC Function Error:', err.message);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: err.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};