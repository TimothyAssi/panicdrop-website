const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const apiKey = process.env.CMC_API_KEY;
    if (!apiKey) throw new Error('CMC_API_KEY ontbreekt');

    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD',
      {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error(`CMC API Error ${response.status}`);
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