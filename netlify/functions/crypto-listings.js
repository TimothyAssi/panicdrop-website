const https = require('https');

// Mock data fallback
const MOCK_DATA = [
  { name: "Cardano", symbol: "ADA", price: 0.40, market_cap: 14000000000, percent_change_24h: 2.1, cmc_rank: 8 },
  { name: "Solana", symbol: "SOL", price: 180, market_cap: 80000000000, percent_change_24h: 4.5, cmc_rank: 5 },
  { name: "Polkadot", symbol: "DOT", price: 5.5, market_cap: 8000000000, percent_change_24h: -1.2, cmc_rank: 12 },
  { name: "Polygon", symbol: "MATIC", price: 0.50, market_cap: 5000000000, percent_change_24h: 3.8, cmc_rank: 15 },
  { name: "Chainlink", symbol: "LINK", price: 13, market_cap: 7000000000, percent_change_24h: 1.7, cmc_rank: 18 }
];

// HTTP request helper using Node.js built-in https module
function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: response.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(8000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

exports.handler = async (event, context) => {
  console.log('🚀 CMC API Function called');
  
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

  const apiKey = process.env.CMC_API_KEY;
  
  // Return mock data if no API key
  if (!apiKey) {
    console.log('⚠️ No CMC_API_KEY found, returning mock data');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: MOCK_DATA,
        warning: 'Using mock data - CMC_API_KEY not configured',
        fallback: true
      })
    };
  }

  try {
    console.log('📡 Fetching from CoinMarketCap API...');
    
    const response = await makeRequest(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD',
      {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    );

    if (response.status !== 200) {
      throw new Error(`CMC API returned status ${response.status}`);
    }

    const coins = response.data.data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote?.USD?.price || 0,
      market_cap: coin.quote?.USD?.market_cap || 0,
      volume_24h: coin.quote?.USD?.volume_24h || 0,
      percent_change_24h: coin.quote?.USD?.percent_change_24h || 0,
      cmc_rank: coin.cmc_rank || 999
    }));

    console.log(`✅ CMC Success: ${coins.length} coins fetched`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: coins,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ CMC API Error:', error.message);
    
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