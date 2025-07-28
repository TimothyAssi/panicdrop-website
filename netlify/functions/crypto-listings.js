// Import fetch for Node.js environment
const fetch = require('node-fetch');

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
    // Check if API key is available
    if (!process.env.CMC_API_KEY) {
      console.error('❌ CMC_API_KEY environment variable not set');
      throw new Error('CMC_API_KEY environment variable not set');
    }

    console.log('📡 Fetching data from CoinMarketCap API...');
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
    });
    
    // Create API request
    const apiRequest = fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100&sort=market_cap&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    // Race between API call and timeout
    const response = await Promise.race([apiRequest, timeoutPromise]);

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
          cmc_rank: 1,
          quote: {
            USD: {
              price: 43250.50,
              market_cap: 847500000000,
              volume_24h: 15200000000,
              percent_change_24h: 2.5,
              percent_change_7d: 5.2,
              percent_change_30d: 12.8
            }
          }
        },
        {
          id: 1027,
          name: "Ethereum",
          symbol: "ETH",
          cmc_rank: 2,
          quote: {
            USD: {
              price: 2645.75,
              market_cap: 318000000000,
              volume_24h: 8500000000,
              percent_change_24h: 1.8,
              percent_change_7d: 3.8,
              percent_change_30d: 18.2
            }
          }
        },
        {
          id: 825,
          name: "Tether",
          symbol: "USDT",
          cmc_rank: 3,
          quote: {
            USD: {
              price: 1.0001,
              market_cap: 91000000000,
              volume_24h: 28000000000,
              percent_change_24h: 0.01,
              percent_change_7d: 0.05,
              percent_change_30d: 0.1
            }
          }
        },
        {
          id: 1839,
          name: "BNB",
          symbol: "BNB",
          cmc_rank: 4,
          quote: {
            USD: {
              price: 315.20,
              market_cap: 48000000000,
              volume_24h: 1200000000,
              percent_change_24h: 1.2,
              percent_change_7d: 4.1,
              percent_change_30d: 15.3
            }
          }
        },
        {
          id: 52,
          name: "XRP",
          symbol: "XRP",
          cmc_rank: 5,
          quote: {
            USD: {
              price: 0.52,
              market_cap: 28000000000,
              volume_24h: 950000000,
              percent_change_24h: -0.8,
              percent_change_7d: 2.1,
              percent_change_30d: 8.7
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