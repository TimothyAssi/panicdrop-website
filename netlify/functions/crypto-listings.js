exports.handler = async (event, context) => {
  console.log('🚀 Netlify Function: crypto-listings started');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('📡 Fetching data from CoinMarketCap API...');
    
    // Use native fetch() - no require needed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || '2606af60-3adf-4ccc-8fd1-5ae9529b6a1a',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error! status: ${response.status}, statusText: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ CoinMarketCap data fetched successfully:', data.data?.length || 0, 'cryptocurrencies');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('❌ CoinMarketCap API Error:', error.message);
    
    // Return fallback data with error info
    const fallbackData = {
      error: 'Failed to fetch live crypto data',
      message: error.message,
      timestamp: new Date().toISOString(),
      function: 'crypto-listings',
      environment: 'netlify-production',
      fallback: true,
      data: [
        {
          id: 1,
          name: "Bitcoin",
          symbol: "BTC", 
          quote: {
            USD: {
              price: 43250.50,
              market_cap: 847500000000,
              volume_24h: 15200000000,
              percent_change_7d: 5.2,
              percent_change_30d: 12.8
            }
          }
        },
        {
          id: 1027,
          name: "Ethereum",
          symbol: "ETH",
          quote: {
            USD: {
              price: 2645.75,
              market_cap: 318000000000,
              volume_24h: 8500000000,
              percent_change_7d: 3.8,
              percent_change_30d: 18.2
            }
          }
        }
      ]
    };
    
    return {
      statusCode: 200, // Return 200 so frontend gets fallback data
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fallbackData)
    };
  }
};