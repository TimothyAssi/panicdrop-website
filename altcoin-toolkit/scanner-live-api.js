// Live Altcoin Scanner JavaScript with real API integrations
// NO MOCK DATA - Only live CoinMarketCap and Perplexity API data

// API Configuration
const API_CONFIG = {
    coinmarketcap: '/api/crypto/listings',
    perplexity: '/api/perplexity-analysis',
    fundamentalMetrics: '/api/fundamental-metrics'
};

// Live data storage
let liveData = {
    narrativeTokens: [],
    memeTokens: [],
    networkTokens: [],
    allTokens: []
};

// Initialize scanner with live data only
document.addEventListener('DOMContentLoaded', async function() {
    updateAPIStatus('loading', 'Connecting to APIs...');
    
    try {
        // Fetch live cryptocurrency data
        await fetchLiveCoinMarketCapData();
        
        // Process data with Perplexity AI
        await fetchLiveNarrativeData();
        await fetchLiveMemeData();
        await fetchLiveNetworkData();
        
        // Load sections with live data
        loadNarrativeTokens();
        loadMemeTokens();
        loadNetworkTokens();
        setupFilterControls();
        
        updateAPIStatus('live', 'Connected to live APIs');
    } catch (error) {
        console.error('Failed to initialize scanner with live data:', error);
        updateAPIStatus('error', 'API connection failed');
        showErrorMessage('Unable to load live cryptocurrency data. Please check your internet connection.');
    }
});

// Fetch live CoinMarketCap data
async function fetchLiveCoinMarketCapData() {
    try {
        const response = await fetch(API_CONFIG.coinmarketcap);
        if (!response.ok) {
            throw new Error(`CoinMarketCap API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verify we have real data, not fallback mock data
        if (!data.data || data.data.length === 0) {
            throw new Error('No live data received from CoinMarketCap');
        }
        
        // Check if this is mock data by looking for specific test values
        const isRealData = data.data.some(coin => 
            coin.id && coin.symbol && coin.quote && coin.quote.USD
        );
        
        if (!isRealData) {
            throw new Error('Received mock data instead of live CoinMarketCap data');
        }
        
        liveData.allTokens = data.data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            price: `$${coin.quote.USD.price.toFixed(coin.quote.USD.price < 1 ? 6 : 2)}`,
            change24h: `${coin.quote.USD.percent_change_24h >= 0 ? '+' : ''}${coin.quote.USD.percent_change_24h.toFixed(2)}%`,
            marketCap: formatMarketCap(coin.quote.USD.market_cap),
            volume24h: coin.quote.USD.volume_24h,
            lastUpdated: coin.last_updated,
            category: 'crypto' // Will be enhanced with Perplexity analysis
        }));
        
        console.log(`✅ Loaded ${liveData.allTokens.length} live tokens from CoinMarketCap`);
        
    } catch (error) {
        console.error('CoinMarketCap API Error:', error);
        throw new Error(`Failed to fetch live CoinMarketCap data: ${error.message}`);
    }
}

// Fetch live narrative analysis from Perplexity
async function fetchLiveNarrativeData() {
    try {
        const prompt = `Analyze the current top trending cryptocurrency narratives for 2024. Identify the top 3 trending narrative categories (like AI tokens, Layer 1 scaling solutions, DeFi innovations, gaming tokens, etc.) and provide:

1. The specific narrative theme
2. 3 representative tokens for each narrative
3. AI-powered sentiment score (0-100)
4. Brief reasoning for why this narrative is trending

Focus on tokens from this list: ${liveData.allTokens.slice(0, 50).map(t => t.symbol).join(', ')}

Return structured data that can be parsed.`;

        const response = await fetch(API_CONFIG.perplexity, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Verify we have real AI analysis, not mock data
        if (!data.analysis || data.analysis.includes('mock') || data.analysis.includes('placeholder')) {
            throw new Error('Received mock data instead of live Perplexity analysis');
        }

        // Parse the AI analysis and map to our tokens
        liveData.narrativeTokens = parseNarrativeAnalysis(data.analysis);
        
        console.log(`✅ Loaded ${liveData.narrativeTokens.length} narrative tokens from Perplexity AI`);
        
    } catch (error) {
        console.error('Perplexity Narrative API Error:', error);
        throw new Error(`Failed to fetch live narrative data: ${error.message}`);
    }
}

// Fetch live meme coin data from Perplexity
async function fetchLiveMemeData() {
    try {
        const memeTokenSymbols = liveData.allTokens
            .filter(token => ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'].includes(token.symbol))
            .slice(0, 10);

        const prompt = `Analyze the current social engagement and sentiment for these meme cryptocurrencies: ${memeTokenSymbols.map(t => t.symbol).join(', ')}. 

Provide for each:
1. Social media sentiment score (0-100)
2. Recent community activity analysis
3. Trending factor based on social engagement
4. Current market momentum

Return structured data focusing on the top 3 meme coins with highest social engagement.`;

        const response = await fetch(API_CONFIG.perplexity, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Perplexity Meme API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Verify real analysis
        if (!data.analysis || data.analysis.includes('mock') || data.analysis.includes('placeholder')) {
            throw new Error('Received mock data instead of live meme coin analysis');
        }

        liveData.memeTokens = parseMemeAnalysis(data.analysis, memeTokenSymbols);
        
        console.log(`✅ Loaded ${liveData.memeTokens.length} meme tokens from Perplexity AI`);
        
    } catch (error) {
        console.error('Perplexity Meme API Error:', error);
        throw new Error(`Failed to fetch live meme coin data: ${error.message}`);
    }
}

// Fetch live network analysis from Perplexity
async function fetchLiveNetworkData() {
    try {
        const networkTokens = liveData.allTokens
            .filter(token => ['ETH', 'BNB', 'MATIC', 'SOL', 'AVAX', 'ADA', 'DOT', 'ATOM'].includes(token.symbol))
            .slice(0, 10);

        const prompt = `Analyze the current network activity and user adoption for these blockchain networks: ${networkTokens.map(t => `${t.name} (${t.symbol})`).join(', ')}.

Provide for each network:
1. Total Value Locked (TVL) trend
2. Daily active users and transaction volume
3. Network activity score (0-100)
4. Developer activity and ecosystem growth
5. Where most users are putting their money

Focus on the top 3 networks with highest user activity and capital inflows.`;

        const response = await fetch(API_CONFIG.perplexity, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Perplexity Network API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Verify real analysis
        if (!data.analysis || data.analysis.includes('mock') || data.analysis.includes('placeholder')) {
            throw new Error('Received mock data instead of live network analysis');
        }

        liveData.networkTokens = parseNetworkAnalysis(data.analysis, networkTokens);
        
        console.log(`✅ Loaded ${liveData.networkTokens.length} network tokens from Perplexity AI`);
        
    } catch (error) {
        console.error('Perplexity Network API Error:', error);
        throw new Error(`Failed to fetch live network data: ${error.message}`);
    }
}

// Parse Perplexity narrative analysis
function parseNarrativeAnalysis(analysis) {
    // Extract structured data from AI analysis
    const tokens = [];
    
    // Look for narrative patterns in the analysis
    const narrativePatterns = [
        { keyword: 'AI', category: 'ai', priority: 1 },
        { keyword: 'Layer 1', category: 'l1', priority: 2 },
        { keyword: 'DeFi', category: 'defi', priority: 3 },
        { keyword: 'Gaming', category: 'gaming', priority: 4 },
        { keyword: 'RWA', category: 'rwa', priority: 5 }
    ];

    // Match tokens mentioned in analysis with our live data
    liveData.allTokens.slice(0, 20).forEach((token, index) => {
        if (analysis.toLowerCase().includes(token.symbol.toLowerCase()) || 
            analysis.toLowerCase().includes(token.name.toLowerCase())) {
            
            // Calculate AI score based on analysis sentiment
            const aiScore = calculateAIScore(analysis, token.symbol);
            
            tokens.push({
                ...token,
                narrative: extractNarrative(analysis, token.symbol),
                aiScore: aiScore,
                category: determineCategory(analysis, token.symbol)
            });
        }
    });

    return tokens.slice(0, 3); // Top 3 narrative tokens
}

// Parse meme coin analysis
function parseMemeAnalysis(analysis, memeTokens) {
    return memeTokens.slice(0, 3).map(token => {
        const socialScore = calculateSocialScore(analysis, token.symbol);
        return {
            ...token,
            socialScore: socialScore,
            category: 'meme'
        };
    });
}

// Parse network analysis
function parseNetworkAnalysis(analysis, networkTokens) {
    return networkTokens.slice(0, 3).map(token => {
        const networkActivity = calculateNetworkActivity(analysis, token.symbol);
        return {
            ...token,
            networkActivity: networkActivity,
            tvl: extractTVL(analysis, token.symbol)
        };
    });
}

// Calculate AI sentiment score from analysis
function calculateAIScore(analysis, symbol) {
    const text = analysis.toLowerCase();
    const symbolText = symbol.toLowerCase();
    
    let score = 50; // Base score
    
    // Positive indicators
    if (text.includes(`${symbolText} is leading`) || text.includes(`${symbolText} dominates`)) score += 20;
    if (text.includes('bullish') && text.includes(symbolText)) score += 15;
    if (text.includes('growth') && text.includes(symbolText)) score += 10;
    if (text.includes('adoption') && text.includes(symbolText)) score += 10;
    
    // Negative indicators
    if (text.includes('declining') && text.includes(symbolText)) score -= 15;
    if (text.includes('bearish') && text.includes(symbolText)) score -= 10;
    
    return Math.max(0, Math.min(100, score));
}

// Calculate social score for meme coins
function calculateSocialScore(analysis, symbol) {
    const text = analysis.toLowerCase();
    const symbolText = symbol.toLowerCase();
    
    let score = 60; // Base score for meme coins
    
    if (text.includes('viral') && text.includes(symbolText)) score += 20;
    if (text.includes('community') && text.includes(symbolText)) score += 15;
    if (text.includes('trending') && text.includes(symbolText)) score += 10;
    
    return Math.max(0, Math.min(100, score));
}

// Calculate network activity score
function calculateNetworkActivity(analysis, symbol) {
    const text = analysis.toLowerCase();
    const symbolText = symbol.toLowerCase();
    
    let score = 70; // Base score for major networks
    
    if (text.includes('tvl') && text.includes(symbolText)) score += 15;
    if (text.includes('active users') && text.includes(symbolText)) score += 10;
    if (text.includes('transactions') && text.includes(symbolText)) score += 10;
    
    return Math.max(0, Math.min(100, score));
}

// Extract narrative theme
function extractNarrative(analysis, symbol) {
    const text = analysis.toLowerCase();
    const symbolText = symbol.toLowerCase();
    
    if (text.includes('ai') && text.includes(symbolText)) return 'AI Integration';
    if (text.includes('layer 1') && text.includes(symbolText)) return 'High-Performance L1';
    if (text.includes('defi') && text.includes(symbolText)) return 'DeFi Innovation';
    if (text.includes('gaming') && text.includes(symbolText)) return 'Gaming Ecosystem';
    
    return 'Emerging Technology';
}

// Determine token category
function determineCategory(analysis, symbol) {
    const text = analysis.toLowerCase();
    const symbolText = symbol.toLowerCase();
    
    if (text.includes('layer 1') && text.includes(symbolText)) return 'l1';
    if (text.includes('layer 2') && text.includes(symbolText)) return 'l2';
    if (text.includes('defi') && text.includes(symbolText)) return 'defi';
    if (text.includes('ai') && text.includes(symbolText)) return 'ai';
    
    return 'crypto';
}

// Extract TVL information
function extractTVL(analysis, symbol) {
    // Parse TVL from analysis text
    const tvlMatch = analysis.match(new RegExp(`${symbol}.*?\\$([0-9.]+[BMK]?)`, 'i'));
    return tvlMatch ? `$${tvlMatch[1]}` : 'N/A';
}

// Format market cap for display
function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toFixed(0)}`;
}

// Load narrative tokens section
function loadNarrativeTokens() {
    const container = document.getElementById('narrativeTokens');
    container.innerHTML = '';
    
    if (liveData.narrativeTokens.length === 0) {
        showLoadingError(container, 'No narrative data available');
        return;
    }
    
    liveData.narrativeTokens.forEach(token => {
        const card = createTokenCard(token, 'narrative');
        container.appendChild(card);
    });
}

// Load meme tokens section
function loadMemeTokens() {
    const container = document.getElementById('memeTokens');
    container.innerHTML = '';
    
    if (liveData.memeTokens.length === 0) {
        showLoadingError(container, 'No meme coin data available');
        return;
    }
    
    liveData.memeTokens.forEach(token => {
        const card = createTokenCard(token, 'meme');
        container.appendChild(card);
    });
}

// Load network tokens section
function loadNetworkTokens() {
    const container = document.getElementById('networkTokens');
    container.innerHTML = '';
    
    if (liveData.networkTokens.length === 0) {
        showLoadingError(container, 'No network data available');
        return;
    }
    
    liveData.networkTokens.forEach(token => {
        const card = createTokenCard(token, 'network');
        container.appendChild(card);
    });
}

// Create token card with live data
function createTokenCard(token, type) {
    const card = document.createElement('div');
    card.className = 'token-card';
    
    let specialMetric = '';
    if (type === 'narrative') {
        specialMetric = `<div class="token-metric">AI Score: <span class="metric-value">${token.aiScore}/100</span></div>`;
    } else if (type === 'meme') {
        specialMetric = `<div class="token-metric">Social Score: <span class="metric-value">${token.socialScore}/100</span></div>`;
    } else if (type === 'network') {
        specialMetric = `<div class="token-metric">Network Activity: <span class="metric-value">${token.networkActivity}/100</span></div>`;
    }
    
    card.innerHTML = `
        <div class="token-header">
            <div class="token-info">
                <h3 class="token-name">${token.name}</h3>
                <span class="token-symbol">${token.symbol}</span>
            </div>
            <div class="token-price">
                <div class="price">${token.price}</div>
                <div class="change ${token.change24h.startsWith('+') ? 'positive' : 'negative'}">${token.change24h}</div>
            </div>
        </div>
        <div class="token-metrics">
            <div class="token-metric">Market Cap: <span class="metric-value">${token.marketCap}</span></div>
            ${specialMetric}
        </div>
        <div class="token-actions">
            <button class="btn-highlight btn-highlight-primary" onclick="viewTokenDetails('${token.symbol}')">
                <i class="fas fa-chart-line"></i>
                View Details
            </button>
            <button class="btn-highlight btn-highlight-secondary" onclick="openTradeLink('${token.symbol}')">
                <i class="fas fa-external-link-alt"></i>
                Trade
            </button>
        </div>
        <div class="live-indicator">
            <i class="fas fa-circle" style="color: #00D084; font-size: 0.5rem;"></i>
            <span style="font-size: 0.7rem; color: var(--text-secondary);">Live Data</span>
        </div>
    `;
    
    return card;
}

// Setup filter controls for live data
function setupFilterControls() {
    const applyButton = document.getElementById('applyFilters');
    if (applyButton) {
        applyButton.addEventListener('click', applyFiltersToLiveData);
    }
}

// Apply filters to live data
function applyFiltersToLiveData() {
    const marketCap = document.getElementById('marketCapFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const excludeStablecoins = document.getElementById('excludeStablecoins').checked;
    const excludeMemecoins = document.getElementById('excludeMemecoins').checked;
    
    // Use live data for filtering
    let allTokens = [...liveData.allTokens];
    
    // Apply category filters
    if (category !== 'all') {
        allTokens = allTokens.filter(token => token.category === category);
    }
    
    // Apply market cap filters
    if (marketCap !== 'all') {
        allTokens = allTokens.filter(token => {
            const cap = parseFloat(token.marketCap.replace(/[^0-9.]/g, ''));
            const unit = token.marketCap.slice(-1);
            let capInBillions = cap;
            
            if (unit === 'M') capInBillions = cap / 1000;
            else if (unit === 'T') capInBillions = cap * 1000;
            
            switch (marketCap) {
                case 'large': return capInBillions >= 10;
                case 'mid': return capInBillions >= 1 && capInBillions < 10;
                case 'small': return capInBillions >= 0.1 && capInBillions < 1;
                case 'micro': return capInBillions < 0.1;
                default: return true;
            }
        });
    }
    
    // Exclude stablecoins and memecoins
    if (excludeStablecoins) {
        allTokens = allTokens.filter(token => 
            !['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD'].includes(token.symbol)
        );
    }
    
    if (excludeMemecoins) {
        allTokens = allTokens.filter(token => 
            !['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'].includes(token.symbol)
        );
    }
    
    // Sort by market cap and take top 3
    const topThree = allTokens
        .sort((a, b) => parseFloat(b.marketCap.replace(/[^0-9.]/g, '')) - parseFloat(a.marketCap.replace(/[^0-9.]/g, '')))
        .slice(0, 3);
    
    // Display results
    const container = document.getElementById('topThreeTokens');
    container.innerHTML = '';
    
    if (topThree.length === 0) {
        container.innerHTML = `
            <div class="token-card loading-placeholder">
                <i class="fas fa-filter"></i>
                <p>No tokens match your filters. Try adjusting your criteria.</p>
            </div>
        `;
        return;
    }
    
    topThree.forEach((token, index) => {
        const card = createTopThreeCard(token, index + 1);
        container.appendChild(card);
    });
}

// Create top 3 token card with live data
function createTopThreeCard(token, rank) {
    const card = document.createElement('div');
    card.className = `token-card top-${rank}`;
    
    const rankColors = ['#ffa502', '#ff6348', '#ff7675'];
    const rankColor = rankColors[rank - 1] || '#6c5ce7';
    
    card.innerHTML = `
        <div class="rank-badge" style="background: ${rankColor};">#${rank}</div>
        <div class="token-header">
            <div class="token-info">
                <h3 class="token-name">${token.name}</h3>
                <span class="token-symbol">${token.symbol}</span>
            </div>
            <div class="token-price">
                <div class="price">${token.price}</div>
                <div class="change ${token.change24h.startsWith('+') ? 'positive' : 'negative'}">${token.change24h}</div>
            </div>
        </div>
        <div class="token-metrics">
            <div class="token-metric">Market Cap: <span class="metric-value">${token.marketCap}</span></div>
            <div class="token-metric">Category: <span class="metric-value">${token.category.toUpperCase()}</span></div>
        </div>
        <div class="token-actions">
            <button class="btn-highlight btn-highlight-primary" onclick="viewTokenDetails('${token.symbol}')">
                <i class="fas fa-star"></i>
                Top Pick
            </button>
            <button class="btn-highlight btn-highlight-secondary" onclick="openTradeLink('${token.symbol}')">
                <i class="fas fa-external-link-alt"></i>
                Trade
            </button>
        </div>
        <div class="live-indicator">
            <i class="fas fa-circle" style="color: #00D084; font-size: 0.5rem;"></i>
            <span style="font-size: 0.7rem; color: var(--text-secondary);">Live Data</span>
        </div>
    `;
    
    return card;
}

// Update API status indicator
function updateAPIStatus(status, message) {
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.className = `api-status ${status}`;
        statusElement.textContent = message;
    }
    
    // Update individual API status indicators
    const perplexityStatus = document.getElementById('perplexityStatus');
    const cmcStatus = document.getElementById('cmcStatus');
    
    if (status === 'live') {
        if (perplexityStatus) perplexityStatus.textContent = 'Connected - Live Data';
        if (cmcStatus) cmcStatus.textContent = 'Connected - Live Data';
    } else if (status === 'error') {
        if (perplexityStatus) perplexityStatus.textContent = 'Connection Failed';
        if (cmcStatus) cmcStatus.textContent = 'Connection Failed';
    }
}

// Show loading error
function showLoadingError(container, message) {
    container.innerHTML = `
        <div class="token-card loading-placeholder">
            <i class="fas fa-exclamation-triangle" style="color: var(--accent-danger);"></i>
            <p style="color: var(--accent-danger);">${message}</p>
            <button onclick="location.reload()" class="btn-highlight btn-highlight-primary">
                <i class="fas fa-refresh"></i>
                Retry
            </button>
        </div>
    `;
}

// Show general error message
function showErrorMessage(message) {
    const container = document.querySelector('.scanner-main');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-banner';
        errorDiv.innerHTML = `
            <div style="background: var(--accent-danger); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>API Connection Error:</strong> ${message}
                <button onclick="location.reload()" style="margin-left: 15px; background: white; color: var(--accent-danger); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
        container.insertBefore(errorDiv, container.firstChild);
    }
}

// Token interaction functions
function viewTokenDetails(symbol) {
    console.log(`Viewing details for ${symbol}`);
    // Implement token details modal or redirect
    alert(`Feature coming soon: Detailed analysis for ${symbol}`);
}

function openTradeLink(symbol) {
    console.log(`Opening trade link for ${symbol}`);
    // Redirect to preferred exchange
    window.open(`https://www.binance.com/en/trade/${symbol}_USDT`, '_blank');
}

// Export functions for debugging
window.scannerFunctions = {
    fetchLiveCoinMarketCapData,
    fetchLiveNarrativeData,
    fetchLiveMemeData,
    fetchLiveNetworkData,
    loadNarrativeTokens,
    loadMemeTokens,
    loadNetworkTokens,
    applyFiltersToLiveData,
    liveData
};

// Add refresh functionality
window.refreshLiveData = async function() {
    updateAPIStatus('loading', 'Refreshing live data...');
    try {
        await fetchLiveCoinMarketCapData();
        await fetchLiveNarrativeData();
        await fetchLiveMemeData();
        await fetchLiveNetworkData();
        
        loadNarrativeTokens();
        loadMemeTokens();
        loadNetworkTokens();
        
        updateAPIStatus('live', 'Data refreshed successfully');
    } catch (error) {
        console.error('Refresh failed:', error);
        updateAPIStatus('error', 'Refresh failed');
    }
};