// Netlify Function: crypto-listings.js
// Endpoint: /api/crypto-listings

const MOCK_DATA = [
  { name: "Cardano", symbol: "ADA", price: 0.40, market_cap: 14000000000, percent_change_24h: 2.1, cmc_rank: 8 },
  { name: "Solana", symbol: "SOL", price: 180, market_cap: 80000000000, percent_change_24h: 4.5, cmc_rank: 5 },
  { name: "Polkadot", symbol: "DOT", price: 5.5, market_cap: 8000000000, percent_change_24h: -1.2, cmc_rank: 12 },
  { name: "Polygon", symbol: "MATIC", price: 0.50, market_cap: 5000000000, percent_change_24h: 3.8, cmc_rank: 15 },
  { name: "Chainlink", symbol: "LINK", price: 13, market_cap: 7000000000, percent_change_24h: 1.7, cmc_rank: 18 }
];

exports.handler = async (event, context) => {
  // Log everything for debugging
  console.log('🚀 crypto-listings function called');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Headers:', JSON.stringify(event.headers));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Accept both GET and POST for flexibility
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
      })
    };
  }

  try {
    const apiKey = process.env.CMC_API_KEY;
    
    // If no API key, return mock data immediately
    if (!apiKey) {
      console.log('⚠️ No CMC_API_KEY, returning mock data');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: MOCK_DATA,
          warning: 'Using mock data - CMC_API_KEY not configured',
          fallback: true,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Try CMC API with quick timeout
    console.log('📡 Fetching from CoinMarketCap API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD', {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CMC API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid CMC API response format');
      }

      const coins = data.data.slice(0, 100).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.quote?.USD?.price || 0,
        market_cap: coin.quote?.USD?.market_cap || 0,
        volume_24h: coin.quote?.USD?.volume_24h || 0,
        percent_change_24h: coin.quote?.USD?.percent_change_24h || 0,
        cmc_rank: coin.cmc_rank || 999
      }));

      console.log(`✅ CMC API Success: ${coins.length} coins fetched`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: coins,
          source: 'coinmarketcap',
          timestamp: new Date().toISOString()
        })
      };

    } catch (apiError) {
      clearTimeout(timeoutId);
      console.log('⚠️ CMC API failed, using fallback:', apiError.message);
      
      // Return mock data on API failure
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: MOCK_DATA,
          warning: `CMC API failed: ${apiError.message}`,
          fallback: true,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('❌ Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        data: MOCK_DATA,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};