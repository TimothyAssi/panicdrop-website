exports.handler = async (event, context) => {
  console.log('🚀 test-connection function called');
  
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
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'connected',
        message: 'Connected to Netlify Functions ✅',
        timestamp: new Date().toISOString(),
        function: 'test-connection',
        environment: process.env.NODE_ENV || 'production',
        nodeVersion: process.version,
        platform: process.platform,
        netlifyRegion: process.env.AWS_REGION || 'unknown'
      })
    };
  } catch (error) {
    console.error('❌ test-connection error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
        function: 'test-connection'
      })
    };
  }
};