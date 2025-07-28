const fetch = require('node-fetch');

console.log('CMC: Function loaded');

const MOCK_DATA = [
  { name: "Cardano", symbol: "ADA", price: 0.40, market_cap: 14000000000, percent_change_24h: 2.1 },
  { name: "Solana", symbol: "SOL", price: 180, market_cap: 80000000000, percent_change_24h: 4.5 },
  { name: "Polkadot", symbol: "DOT", price: 5.5, market_cap: 8000000000, percent_change_24h: -1.2 },
  { name: "Polygon", symbol: "MATIC", price: 0.50, market_cap: 5000000000, percent_change_24h: 3.8 },
  { name: "Chainlink", symbol: "LINK", price: 13, market_cap: 7000000000, percent_change_24h: 1.7 },
];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  console.log('CMC: Request received - Method:', event.httpMethod, 'Path:', event.path);

  // Check for node-fetch
  try {
    if (!fetch) {
      throw new Error('node-fetch not available');
    }
    console.log('CMC: node-fetch imported successfully');
  } catch (error) {
    console.error('CMC: node-fetch import error:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: MOCK_DATA,
        warning: 'node-fetch dependency missing',
        fallback: true
      })
    };
  }

  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) {
    console.error('CMC: Missing CMC_API_KEY environment variable');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: MOCK_DATA,
        warning: 'CMC_API_KEY not configured',
        fallback: true
      })
    };
  }

  // API call with retry logic for 429
  const fetchWithRetry = async (retryCount = 0) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('CMC API timeout after 8 seconds')), 8000)
    );

    try {
      console.log(`CMC: Attempting API call (attempt ${retryCount + 1})`);
      
      const response = await Promise.race([
        fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD', {
          method: 'GET',
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json',
            'User-Agent': 'Netlify-Function/1.0'
          },
          timeout: 7000
        }),
        timeoutPromise
      ]);

      console.log(`CMC: Response status: ${response.status}`);

      if (response.status === 429 && retryCount === 0) {
        console.log('CMC: Rate limit hit, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(1);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format - missing data array');
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
        headers,
        body: JSON.stringify({ 
          data: coins,
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      console.error(`CMC: API error (attempt ${retryCount + 1}):`, error.message);
      
      if (retryCount === 0 && (error.message.includes('429') || error.message.includes('rate'))) {
        console.log('CMC: Retrying after rate limit...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(1);
      }
      
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    console.error('CMC: Final error:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: MOCK_DATA,
        warning: `CMC API failed: ${error.message}`,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    };
  }
};