const fetch = require('node-fetch');

const MOCK_DATA = [
  { name: "Cardano", symbol: "ADA", price: 0.40, market_cap: 14000000000 },
  { name: "Solana", symbol: "SOL", price: 180, market_cap: 80000000000 },
  { name: "Polkadot", symbol: "DOT", price: 5.5, market_cap: 8000000000 },
  { name: "Polygon", symbol: "MATIC", price: 0.50, market_cap: 5000000000 },
  { name: "Chainlink", symbol: "LINK", price: 13, market_cap: 7000000000 },
];

exports.handler = async (event, context) => {
  console.log('CMC: Request to /api/crypto-listings');
  console.log('CMC: Method:', event.httpMethod);
  console.log('CMC: Path:', event.path);
  
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }
  
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) {
    console.error('CMC: Missing CMC_API_KEY environment variable');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Server configuration error', 
        data: MOCK_DATA,
        fallback: true,
        message: 'CMC_API_KEY not configured'
      }),
    };
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('CMC API timeout after 8 seconds')), 8000)
  );

  try {
    console.log('CMC: Fetching from CoinMarketCap API...');
    const response = await Promise.race([
      fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD', {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        },
      }),
      timeoutPromise,
    ]);

    if (!response.ok) {
      console.error(`CMC: API error - Status: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('CMC: Invalid response format - missing data array');
    }
    
    const coins = data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote?.USD?.price || 0,
      market_cap: coin.quote?.USD?.market_cap || 0,
      volume_24h: coin.quote?.USD?.volume_24h || 0,
      percent_change_24h: coin.quote?.USD?.percent_change_24h || 0,
      cmc_rank: coin.cmc_rank || 999
    }));

    console.log(`CMC: Success - ${coins.length} coins fetched`);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: coins }),
    };
  } catch (error) {
    console.error('CMC: Error:', error.message);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        data: MOCK_DATA, 
        warning: `CMC API failed: ${error.message}`,
        fallback: true,
        timestamp: new Date().toISOString()
      }),
    };
  }
};