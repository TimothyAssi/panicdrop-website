// Perplexity Scoring Function - Get AI-powered metrics for token scoring
// Returns structured JSON data for transparent 0-100 scoring system

exports.handler = async function(event, context) {
    console.log('🚀 Perplexity Scoring API started');
    
    // Handle CORS
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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { tokens } = JSON.parse(event.body);
        
        if (!tokens || !Array.isArray(tokens)) {
            throw new Error('Invalid tokens array provided');
        }

        const apiKey = process.env.PPLX_API_KEY;
        if (!apiKey) {
            throw new Error('Perplexity API key not configured');
        }

        console.log(`📊 Processing ${tokens.length} tokens for scoring`);

        // Process tokens in batches to avoid rate limits
        const scoredTokens = [];
        const batchSize = 3;
        
        for (let i = 0; i < tokens.length; i += batchSize) {
            const batch = tokens.slice(i, i + batchSize);
            const batchPromises = batch.map(token => getTokenScoreData(token, apiKey));
            const batchResults = await Promise.allSettled(batchPromises);
            
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    scoredTokens.push(result.value);
                } else {
                    console.error(`❌ Token scoring failed for ${batch[index].symbol}:`, result.reason);
                    // Provide fallback scoring data
                    scoredTokens.push(createFallbackScore(batch[index]));
                }
            });
            
            // Rate limiting delay
            if (i + batchSize < tokens.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                tokens: scoredTokens,
                timestamp: new Date().toISOString(),
                source: 'perplexity-ai'
            })
        };

    } catch (error) {
        console.error('❌ Perplexity Scoring Error:', error);
        
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Get AI-powered scoring data for a single token
async function getTokenScoreData(token, apiKey) {
    const prompt = `Analyze ${token.name} (${token.symbol}) cryptocurrency for scoring metrics. 

Return ONLY valid JSON with this exact structure:
{
  "symbol": "${token.symbol}",
  "narrativeMomentum": {
    "mentions7d": <number 0-100>,
    "mentions30d": <number 0-100>, 
    "buzzwordMatch": <number 0-100>,
    "recentCatalysts": <number 0-100>
  },
  "socialHype": {
    "socialVolume": <number 0-100>,
    "followersGrowth": <number 0-100>,
    "engagementRatio": <number 0-100>,
    "memeBoost": <number 0-20>
  },
  "networkUsage": {
    "activeAddresses": <number 0-100>,
    "transactionGrowth": <number 0-100>,
    "tvlChange": <number 0-100>,
    "feeActivity": <number 0-100>
  },
  "fundamentalStrength": {
    "supplyTrend": <number 0-100>,
    "unlockRisk": <number 0-100>,
    "holderConcentration": <number 0-100>,
    "liquidityDepth": <number 0-100>
  }
}

Base scores on current market data and recent trends. Use realistic values.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 1000,
            temperature: 0.1
        })
    });

    if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
        throw new Error('No content received from Perplexity');
    }

    // Extract JSON from response
    let jsonData;
    try {
        // Try to find JSON block in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonData = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('No JSON found in response');
        }
    } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        throw new Error('Invalid JSON response from AI');
    }

    // Validate JSON structure
    if (!validateScoreStructure(jsonData)) {
        throw new Error('Invalid score structure received');
    }

    return jsonData;
}

// Validate the score data structure
function validateScoreStructure(data) {
    const requiredFields = [
        'symbol',
        'narrativeMomentum',
        'socialHype', 
        'networkUsage',
        'fundamentalStrength'
    ];
    
    const subFields = {
        narrativeMomentum: ['mentions7d', 'mentions30d', 'buzzwordMatch', 'recentCatalysts'],
        socialHype: ['socialVolume', 'followersGrowth', 'engagementRatio', 'memeBoost'],
        networkUsage: ['activeAddresses', 'transactionGrowth', 'tvlChange', 'feeActivity'],
        fundamentalStrength: ['supplyTrend', 'unlockRisk', 'holderConcentration', 'liquidityDepth']
    };

    // Check main fields
    for (const field of requiredFields) {
        if (!data[field]) {
            console.error(`❌ Missing field: ${field}`);
            return false;
        }
    }

    // Check sub-fields
    for (const [category, fields] of Object.entries(subFields)) {
        for (const field of fields) {
            if (typeof data[category][field] !== 'number') {
                console.error(`❌ Invalid field type: ${category}.${field}`);
                return false;
            }
        }
    }

    return true;
}

// Create fallback score data when AI fails
function createFallbackScore(token) {
    console.log(`⚠️ Using fallback scores for ${token.symbol}`);
    
    // Generate realistic fallback scores based on token data
    const baseScore = Math.max(20, 100 - (token.rank || 50));
    const variance = () => Math.random() * 20 - 10; // ±10 variance
    
    return {
        symbol: token.symbol,
        narrativeMomentum: {
            mentions7d: Math.max(0, Math.min(100, baseScore + variance())),
            mentions30d: Math.max(0, Math.min(100, baseScore + variance())),
            buzzwordMatch: Math.max(0, Math.min(100, baseScore + variance())),
            recentCatalysts: Math.max(0, Math.min(100, baseScore + variance()))
        },
        socialHype: {
            socialVolume: Math.max(0, Math.min(100, baseScore + variance())),
            followersGrowth: Math.max(0, Math.min(100, baseScore + variance())),
            engagementRatio: Math.max(0, Math.min(100, baseScore + variance())),
            memeBoost: token.category === 'meme' ? Math.random() * 20 : 0
        },
        networkUsage: {
            activeAddresses: Math.max(0, Math.min(100, baseScore + variance())),
            transactionGrowth: Math.max(0, Math.min(100, baseScore + variance())),
            tvlChange: Math.max(0, Math.min(100, baseScore + variance())),
            feeActivity: Math.max(0, Math.min(100, baseScore + variance()))
        },
        fundamentalStrength: {
            supplyTrend: Math.max(0, Math.min(100, baseScore + variance())),
            unlockRisk: Math.max(0, Math.min(100, baseScore + variance())),
            holderConcentration: Math.max(0, Math.min(100, baseScore + variance())),
            liquidityDepth: Math.max(0, Math.min(100, baseScore + variance()))
        },
        fallback: true
    };
}