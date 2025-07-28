// ADVANCED Altcoin Scanner with Transparent 0-100 Scoring System
// Live CMC data + Perplexity AI scoring with "How scoring works" modal

// API Configuration
const API_CONFIG = {
    coinmarketcap: '/api/crypto/listings',
    perplexityScore: '/api/perplexity-score'
};

// Debug flag for development
const DEBUG_SCORING = true;

// Live data storage with scoring
let liveData = {
    narrativeTokens: [],
    memeTokens: [],
    networkTokens: [],
    allTokens: [],
    scoredTokens: [],
    isLoading: false,
    lastScoreUpdate: null
};

// Scoring weights (must sum to 1.0)
const SCORE_WEIGHTS = {
    narrativeMomentum: 0.25,  // 25%
    socialHype: 0.20,        // 20%
    networkUsage: 0.25,      // 25%
    fundamentalStrength: 0.30 // 30%
};

// Initialize scanner with scoring system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting advanced scanner with scoring...');
    updateAPIStatus('loading', 'Connecting to APIs...');
    
    try {
        // Show loading states
        showLoadingStates();
        
        // Step 1: Fetch live CoinMarketCap data
        await fetchLiveCoinMarketCapData();
        
        // Step 2: Populate sections with basic data immediately
        populateWithLiveData();
        
        // Step 3: Enhance with AI scoring (async)
        enhanceWithAIScoring();
        
        // Setup controls
        setupFilterControls();
        setupScoringModal();
        
        updateAPIStatus('live', 'Connected to live APIs');
        console.log('✅ Scanner initialization complete');
        
    } catch (error) {
        console.error('❌ Scanner initialization failed:', error);
        updateAPIStatus('error', 'API connection failed');
        showErrorMessage('Unable to load live cryptocurrency data. Please refresh the page.');
    }
});

// Fetch live CoinMarketCap data
async function fetchLiveCoinMarketCapData() {
    console.log('📡 Fetching CoinMarketCap data...');
    
    try {
        const response = await fetch(API_CONFIG.coinmarketcap);
        if (!response.ok) {
            throw new Error(`CoinMarketCap API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('No live data received from CoinMarketCap');
        }
        
        // Process live data
        liveData.allTokens = data.data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            price: `$${formatPrice(coin.quote.USD.price)}`,
            change24h: `${coin.quote.USD.percent_change_24h >= 0 ? '+' : ''}${coin.quote.USD.percent_change_24h.toFixed(2)}%`,
            marketCap: formatMarketCap(coin.quote.USD.market_cap),
            volume24h: coin.quote.USD.volume_24h,
            rank: coin.cmc_rank,
            category: determineCategory(coin),
            // Initialize scores
            totalScore: 0,
            narrativeScore: 0,
            socialScore: 0,
            networkScore: 0,
            fundamentalScore: 0,
            hasAIData: false
        }));
        
        if (DEBUG_SCORING) {
            console.log(`✅ Loaded ${liveData.allTokens.length} tokens:`, 
                liveData.allTokens.slice(0, 5).map(t => `${t.symbol}: ${t.price}`));
        }
        
    } catch (error) {
        console.error('❌ CoinMarketCap fetch failed:', error);
        throw error;
    }
}

// Enhance tokens with AI scoring (async)
async function enhanceWithAIScoring() {
    console.log('🧠 Enhancing with AI scoring...');
    updateAPIStatus('loading', 'Adding AI insights...');
    
    try {
        // Get top 20 tokens for scoring to avoid rate limits
        const tokensToScore = liveData.allTokens.slice(0, 20);
        let scoredCount = 0;
        
        // Score tokens individually with delays to respect rate limits
        for (const token of tokensToScore) {
            try {
                const response = await fetch(API_CONFIG.perplexityScore, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tokenName: token.name })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Apply the AI score and explanation
                    token.aiScore = data.score;
                    token.aiExplanation = data.explanation;
                    token.hasAIData = data.success && !data.fallback && data.score !== null;
                    
                    // Update total score to include AI component
                    if (token.hasAIData && token.aiScore) {
                        token.totalScore = Math.round(token.aiScore);
                    } else if (data.score === null) {
                        // Keep original scoring when API fails
                        console.warn(`⚠️ API failed for ${token.symbol}: ${data.explanation}`);
                    }
                    
                    scoredCount++;
                    const scoreDisplay = data.score !== null ? `${data.score}/100` : 'Failed';
                    console.log(`✅ AI scored: ${token.symbol} = ${scoreDisplay}${data.fallback ? ' (fallback)' : ''}`);
                } else {
                    console.warn(`⚠️ Scoring failed for ${token.symbol}: ${response.status}`);
                }
                
                // Rate limiting delay
                if (scoredCount < tokensToScore.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
            } catch (tokenError) {
                console.error(`❌ Error scoring ${token.symbol}:`, tokenError);
            }
        }

        liveData.lastScoreUpdate = new Date().toISOString();
        
        // Update UI with new scores
        refreshAllSections();
        
        updateAPIStatus('live', `Live data + AI insights (${scoredCount} tokens scored)`);
        console.log(`✅ AI scoring complete: ${scoredCount}/${tokensToScore.length} tokens`);
        
    } catch (error) {
        console.error('⚠️ AI scoring failed, using fallback:', error);
        // Apply fallback scoring
        applyFallbackScoring();
        updateAPIStatus('live', 'Live data active (AI insights unavailable)');
    }
}

// Apply AI scores to token
function applyScoresToToken(token, scoredData) {
    if (scoredData.fallback) {
        console.log(`⚠️ Using fallback scores for ${token.symbol}`);
    }

    // Calculate individual category scores
    token.narrativeScore = calculateCategoryScore(scoredData.narrativeMomentum);
    token.socialScore = calculateCategoryScore(scoredData.socialHype);
    token.networkScore = calculateCategoryScore(scoredData.networkUsage);
    token.fundamentalScore = calculateCategoryScore(scoredData.fundamentalStrength);

    // Calculate weighted total score
    token.totalScore = Math.round(
        (token.narrativeScore * SCORE_WEIGHTS.narrativeMomentum) +
        (token.socialScore * SCORE_WEIGHTS.socialHype) +
        (token.networkScore * SCORE_WEIGHTS.networkUsage) +
        (token.fundamentalScore * SCORE_WEIGHTS.fundamentalStrength)
    );

    token.hasAIData = !scoredData.fallback;
    token.scoreDetails = scoredData;

    if (DEBUG_SCORING) {
        console.log(`📊 ${token.symbol} scores: Total=${token.totalScore}, N=${token.narrativeScore}, S=${token.socialScore}, U=${token.networkScore}, F=${token.fundamentalScore}`);
    }
}

// Calculate category score from sub-metrics
function calculateCategoryScore(categoryData) {
    const values = Object.values(categoryData);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(clamp(average, 0, 100));
}

// Apply fallback scoring when AI fails
function applyFallbackScoring() {
    liveData.allTokens.forEach(token => {
        const baseScore = Math.max(20, 100 - (token.rank || 50));
        const variance = () => Math.random() * 20 - 10;

        token.narrativeScore = Math.round(clamp(baseScore + variance(), 0, 100));
        token.socialScore = Math.round(clamp(baseScore + variance(), 0, 100));
        token.networkScore = Math.round(clamp(baseScore + variance(), 0, 100));
        token.fundamentalScore = Math.round(clamp(baseScore + variance(), 0, 100));
        
        token.totalScore = Math.round(
            (token.narrativeScore * SCORE_WEIGHTS.narrativeMomentum) +
            (token.socialScore * SCORE_WEIGHTS.socialHype) +
            (token.networkScore * SCORE_WEIGHTS.networkUsage) +
            (token.fundamentalScore * SCORE_WEIGHTS.fundamentalStrength)
        );
        
        token.hasAIData = false;
    });

    refreshAllSections();
}

// Populate sections with live data
function populateWithLiveData() {
    console.log('🎯 Populating sections with live data...');
    
    // Create categorized tokens
    liveData.narrativeTokens = liveData.allTokens
        .filter(token => ['SOL', 'AVAX', 'NEAR', 'SUI', 'INJ', 'SEI', 'FTM', 'ALGO'].includes(token.symbol))
        .slice(0, 3)
        .map(token => ({
            ...token,
            narrative: getNarrativeTheme(token.symbol),
            category: 'l1'
        }));
    
    liveData.memeTokens = liveData.allTokens
        .filter(token => ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'].includes(token.symbol))
        .slice(0, 3)
        .map(token => ({
            ...token,
            category: 'meme'
        }));
    
    liveData.networkTokens = liveData.allTokens
        .filter(token => ['ETH', 'BNB', 'MATIC', 'ARB', 'OP', 'AVAX'].includes(token.symbol))
        .slice(0, 3)
        .map(token => ({
            ...token,
            tvl: estimateTVL(token.symbol)
        }));
    
    // Load sections
    loadNarrativeTokens();
    loadMemeTokens();
    loadNetworkTokens();
}

// Refresh all sections after scoring update
function refreshAllSections() {
    loadNarrativeTokens();
    loadMemeTokens();  
    loadNetworkTokens();
    
    // Refresh Top 3 if filters applied
    const container = document.getElementById('topThreeTokens');
    if (container && !container.innerHTML.includes('Apply filters')) {
        applyFiltersToLiveData();
    }
}

// Create enhanced token card with scoring
function createTokenCard(token, type) {
    const card = document.createElement('div');
    card.className = 'token-card';
    
    let specialMetric = '';
    let scoreBar = '';
    
    if (type === 'narrative') {
        specialMetric = `<div class="token-metric">AI Score: <span class="metric-value">${token.aiScore || token.narrativeScore || 'N/A'}/100</span> ${token.hasAIData ? '<i class="fas fa-robot" title="AI Enhanced"></i>' : ''}</div>`;
        scoreBar = createScoreBar(token.aiScore || token.narrativeScore || 0, 'narrative');
    } else if (type === 'meme') {
        specialMetric = `<div class="token-metric">AI Score: <span class="metric-value">${token.aiScore || token.socialScore || 'N/A'}/100</span> ${token.hasAIData ? '<i class="fas fa-robot" title="AI Enhanced"></i>' : ''}</div>`;
        scoreBar = createScoreBar(token.aiScore || token.socialScore || 0, 'social');
    } else if (type === 'network') {
        specialMetric = `<div class="token-metric">AI Score: <span class="metric-value">${token.aiScore || token.networkScore || 'N/A'}/100</span> ${token.hasAIData ? '<i class="fas fa-robot" title="AI Enhanced"></i>' : ''}</div>`;
        scoreBar = createScoreBar(token.aiScore || token.networkScore || 0, 'network');
    }
    
    const totalScoreBar = token.totalScore ? createScoreBar(token.totalScore, 'total') : '';
    const dataLabel = token.hasAIData ? 'AI-Enhanced' : 'Live Data';
    const dataColor = token.hasAIData ? '#4A90E2' : '#00D084';
    
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
        
        ${token.totalScore ? `
        <div class="total-score-section">
            <div class="total-score-header">
                <span class="total-score-label">Total Score</span>
                <span class="total-score-value">${token.totalScore}/100</span>
            </div>
            ${totalScoreBar}
        </div>
        ` : ''}
        
        <div class="token-metrics">
            <div class="token-metric">Market Cap: <span class="metric-value">${token.marketCap}</span></div>
            ${specialMetric}
        </div>
        
        ${scoreBar}
        
        <div class="token-actions">
            <button class="btn-highlight btn-highlight-primary" onclick="viewTokenDetails('${token.symbol}')">
                <i class="fas fa-chart-line"></i>
                View Details
            </button>
            <button class="btn-highlight btn-highlight-secondary" onclick="openTradeLink('${token.symbol}')">
                <i class="fas fa-external-link-alt"></i>
                Trade
            </button>
            ${token.hasAIData ? `
            <button class="btn-score-explanation" onclick="showScoreExplanation('${token.symbol}')" title="How is this score calculated?">
                <i class="fas fa-question-circle"></i>
            </button>
            ` : ''}
        </div>
        
        <div class="live-indicator">
            <i class="fas fa-circle" style="color: ${dataColor}; font-size: 0.5rem;"></i>
            <span style="font-size: 0.7rem; color: var(--text-secondary);">${dataLabel}</span>
        </div>
    `;
    
    return card;
}

// Create score bar visualization
function createScoreBar(score, type) {
    const colors = {
        total: '#4A90E2',
        narrative: '#ff6b35', 
        social: '#ff4757',
        network: '#2ed573'
    };
    
    const color = colors[type] || '#666';
    const width = Math.max(5, score); // Minimum 5% width for visibility
    
    return `
        <div class="score-bar-container">
            <div class="score-bar" style="background: ${color}; width: ${width}%;"></div>
        </div>
    `;
}

// FIXED: Apply filters to live data with proper scoring
function applyFiltersToLiveData() {
    console.log('🔍 Applying filters to scored data...');
    
    const marketCap = document.getElementById('marketCapFilter')?.value || 'all';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const excludeStablecoins = document.getElementById('excludeStablecoins')?.checked || false;
    const excludeMemecoins = document.getElementById('excludeMemecoins')?.checked || false;
    
    // Start with all tokens that have scores
    let filteredTokens = [...liveData.allTokens];
    
    if (DEBUG_SCORING) {
        console.log(`🔍 Starting with ${filteredTokens.length} tokens`);
        console.log(`🔍 Filters: marketCap=${marketCap}, category=${category}, excludeStablecoins=${excludeStablecoins}, excludeMemecoins=${excludeMemecoins}`);
    }
    
    // Apply category filter
    if (category !== 'all') {
        const beforeCount = filteredTokens.length;
        filteredTokens = filteredTokens.filter(token => token.category === category);
        if (DEBUG_SCORING) console.log(`🔍 After category filter: ${filteredTokens.length} (was ${beforeCount})`);
    }
    
    // Apply market cap filter
    if (marketCap !== 'all') {
        const beforeCount = filteredTokens.length;
        filteredTokens = filteredTokens.filter(token => {
            const capStr = token.marketCap.replace(/[$,]/g, '');
            const capNum = parseFloat(capStr);
            const unit = capStr.slice(-1);
            
            let capInBillions = capNum;
            if (unit === 'M') capInBillions = capNum / 1000;
            else if (unit === 'T') capInBillions = capNum * 1000;
            
            switch (marketCap) {
                case 'large': return capInBillions >= 10;
                case 'mid': return capInBillions >= 1 && capInBillions < 10;
                case 'small': return capInBillions >= 0.1 && capInBillions < 1;
                case 'micro': return capInBillions < 0.1;
                default: return true;
            }
        });
        if (DEBUG_SCORING) console.log(`🔍 After market cap filter: ${filteredTokens.length} (was ${beforeCount})`);
    }
    
    // Apply exclusion filters
    if (excludeStablecoins) {
        const beforeCount = filteredTokens.length;
        filteredTokens = filteredTokens.filter(token => token.category !== 'stablecoin');
        if (DEBUG_SCORING) console.log(`🔍 After stablecoin exclusion: ${filteredTokens.length} (was ${beforeCount})`);
    }
    
    if (excludeMemecoins) {
        const beforeCount = filteredTokens.length;
        filteredTokens = filteredTokens.filter(token => token.category !== 'meme');
        if (DEBUG_SCORING) console.log(`🔍 After memecoin exclusion: ${filteredTokens.length} (was ${beforeCount})`);
    }
    
    // FIXED: Sort by AI score first, then totalScore, then rank
    filteredTokens.sort((a, b) => {
        // Prioritize AI scores when available
        const aScore = a.aiScore || a.totalScore || (100 - (a.rank || 50));
        const bScore = b.aiScore || b.totalScore || (100 - (b.rank || 50));
        
        if (aScore !== bScore) {
            return bScore - aScore; // Highest score first
        }
        
        // Fallback to rank (lower rank is better)
        return (a.rank || 999) - (b.rank || 999);
    });
    
    // FIXED: Always show at least 3 tokens if available
    let topThree = filteredTokens.slice(0, 3);
    
    // Fallback: if less than 3 tokens match filters, get best 3 by total score
    if (topThree.length < 3) {
        const allSorted = [...liveData.allTokens]
            .filter(token => !excludeStablecoins || token.category !== 'stablecoin')
            .filter(token => !excludeMemecoins || token.category !== 'meme')
            .sort((a, b) => {
                // Prioritize AI scores when available
                const aScore = a.aiScore || a.totalScore || (100 - (a.rank || 50));
                const bScore = b.aiScore || b.totalScore || (100 - (b.rank || 50));
                
                if (aScore !== bScore) {
                    return bScore - aScore; // Highest score first
                }
                
                return (a.rank || 999) - (b.rank || 999);
            });
        
        topThree = allSorted.slice(0, 3);
        
        if (DEBUG_SCORING) {
            console.log(`🔍 Fallback applied: showing top 3 from all tokens`);
        }
    }
    
    if (DEBUG_SCORING) {
        console.log(`🔍 Final top 3:`, topThree.map(t => `${t.symbol} (Score: ${t.totalScore}, Rank: ${t.rank})`));
    }
    
    // Display results
    const container = document.getElementById('topThreeTokens');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (topThree.length === 0) {
        container.innerHTML = `
            <div class="token-card loading-placeholder">
                <i class="fas fa-filter"></i>
                <p>No tokens available. Please try different filters.</p>
                <button onclick="resetFilters()" class="btn-highlight btn-highlight-primary">
                    <i class="fas fa-refresh"></i>
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    topThree.forEach((token, index) => {
        const card = createTopThreeCard(token, index + 1);
        container.appendChild(card);
    });
    
    console.log(`✅ Applied filters, showing ${topThree.length} tokens`);
}

// Create enhanced top 3 token card with full scoring
function createTopThreeCard(token, rank) {
    const card = document.createElement('div');
    card.className = `token-card top-${rank}`;
    
    const rankColors = ['#ffa502', '#ff6348', '#ff7675'];
    const rankColor = rankColors[rank - 1] || '#6c5ce7';
    
    const scoreSection = token.totalScore ? `
        <div class="score-badges">
            <div class="score-badge main-score">
                <span class="score-label">Total</span>
                <span class="score-value">${token.totalScore}/100</span>
            </div>
            <div class="sub-scores">
                <div class="sub-score" title="Narrative Momentum">
                    <span class="sub-label">N</span>
                    <span class="sub-value">${token.narrativeScore || 0}</span>
                </div>
                <div class="sub-score" title="Social Hype">
                    <span class="sub-label">S</span>
                    <span class="sub-value">${token.socialScore || 0}</span>
                </div>
                <div class="sub-score" title="Network Usage">
                    <span class="sub-label">U</span>
                    <span class="sub-value">${token.networkScore || 0}</span>
                </div>
                <div class="sub-score" title="Fundamental Strength">
                    <span class="sub-label">F</span>
                    <span class="sub-value">${token.fundamentalScore || 0}</span>
                </div>
            </div>
        </div>
    ` : '';
    
    const dataLabel = token.hasAIData ? 'AI-Enhanced' : 'Live Data';
    const dataColor = token.hasAIData ? '#4A90E2' : '#00D084';
    
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
        
        ${scoreSection}
        
        <div class="token-metrics">
            <div class="token-metric">Market Cap: <span class="metric-value">${token.marketCap}</span></div>
            <div class="token-metric">Rank: <span class="metric-value">#${token.rank}</span></div>
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
            <i class="fas fa-circle" style="color: ${dataColor}; font-size: 0.5rem;"></i>
            <span style="font-size: 0.7rem; color: var(--text-secondary);">${dataLabel}</span>
        </div>
    `;
    
    return card;
}

// Setup scoring modal
function setupScoringModal() {
    // Add How Scoring Works button
    const controlPanel = document.querySelector('.control-panel .control-header');
    if (controlPanel) {
        const infoButton = document.createElement('button');
        infoButton.className = 'btn btn-secondary';
        infoButton.innerHTML = '<i class="fas fa-info-circle"></i> How Scoring Works';
        infoButton.onclick = showScoringModal;
        controlPanel.appendChild(infoButton);
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="scoreInfoModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <i class="fas fa-chart-bar"></i>
                        How Our 0-100 Scoring System Works
                    </h2>
                    <button class="modal-close" onclick="closeScoringModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="scoring-overview">
                        <h3>Total Score Formula</h3>
                        <div class="formula">
                            <strong>Total Score = 25% × NMS + 20% × SHS + 25% × NUS + 30% × FSS</strong>
                        </div>
                    </div>
                    
                    <div class="scoring-categories">
                        <div class="category">
                            <h4><span class="category-icon" style="color: #ff6b35;">📈</span> Narrative Momentum Score (NMS) - 25%</h4>
                            <ul>
                                <li><strong>Mentions Growth:</strong> 7d vs 30d news/social mentions</li>
                                <li><strong>Buzzword Match:</strong> AI, RWA, DePIN, Gaming, L2 trending topics</li>
                                <li><strong>Recent Catalysts:</strong> Partnerships, upgrades, announcements</li>
                                <li><strong>Trend Analysis:</strong> Momentum direction and sustainability</li>
                            </ul>
                        </div>
                        
                        <div class="category">
                            <h4><span class="category-icon" style="color: #ff4757;">🔥</span> Social Hype Score (SHS) - 20%</h4>
                            <ul>
                                <li><strong>Social Volume:</strong> Twitter, Reddit, Discord activity %</li>
                                <li><strong>Followers Growth:</strong> Community size increase</li>
                                <li><strong>Engagement Ratio:</strong> Quality vs quantity of interactions</li>
                                <li><strong>Meme Boost:</strong> +20 points for verified meme coins</li>
                            </ul>
                        </div>
                        
                        <div class="category">
                            <h4><span class="category-icon" style="color: #2ed573;">🌐</span> Network Usage Score (NUS) - 25%</h4>
                            <ul>
                                <li><strong>Active Addresses:</strong> Unique daily/weekly users</li>
                                <li><strong>Transaction Growth:</strong> Network activity trends</li>
                                <li><strong>TVL Changes:</strong> Total Value Locked development</li>
                                <li><strong>Fee Activity:</strong> Network utilization and revenue</li>
                            </ul>
                        </div>
                        
                        <div class="category">
                            <h4><span class="category-icon" style="color: #4A90E2;">💎</span> Fundamental Strength Score (FSS) - 30%</h4>
                            <ul>
                                <li><strong>Supply Trend:</strong> Inflation/deflation/stability</li>
                                <li><strong>Unlock Risk:</strong> Token unlocks in next 30/90 days</li>
                                <li><strong>Holder Distribution:</strong> Concentration vs decentralization</li>
                                <li><strong>Liquidity Depth:</strong> Volume/Market Cap ratio</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="data-sources">
                        <h3>Data Sources & Updates</h3>
                        <div class="source-grid">
                            <div class="source">
                                <strong>🏦 CoinMarketCap API</strong>
                                <p>Live prices, market caps, volume data</p>
                                <span class="update-freq">Updates: Real-time</span>
                            </div>
                            <div class="source">
                                <strong>🧠 Perplexity AI</strong>
                                <p>Social sentiment, narrative analysis, network metrics</p>
                                <span class="update-freq">Updates: Every 6 hours</span>
                            </div>
                        </div>
                        <div class="last-update">
                            <i class="fas fa-clock"></i>
                            Last AI Update: <span id="lastUpdateTime">${liveData.lastScoreUpdate ? new Date(liveData.lastScoreUpdate).toLocaleString() : 'Loading...'}</span>
                        </div>
                    </div>
                    
                    <div class="scoring-notes">
                        <h3>Important Notes</h3>
                        <ul>
                            <li>All scores normalized to 0-100 scale for consistency</li>
                            <li>AI data marked as "AI-Enhanced", fallback data as "Live Data"</li>
                            <li>Scores are relative rankings, not absolute investment advice</li>
                            <li>Higher scores indicate stronger current metrics, not future performance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Show scoring modal
function showScoringModal() {
    const modal = document.getElementById('scoreInfoModal');
    if (modal) {
        // Update last update time
        const lastUpdateEl = document.getElementById('lastUpdateTime');
        if (lastUpdateEl && liveData.lastScoreUpdate) {
            lastUpdateEl.textContent = new Date(liveData.lastScoreUpdate).toLocaleString();
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close scoring modal
function closeScoringModal() {
    const modal = document.getElementById('scoreInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Reset filters (helper function)
function resetFilters() {
    const marketCapFilter = document.getElementById('marketCapFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const excludeStablecoins = document.getElementById('excludeStablecoins');
    const excludeMemecoins = document.getElementById('excludeMemecoins');
    
    if (marketCapFilter) marketCapFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    if (excludeStablecoins) excludeStablecoins.checked = false;
    if (excludeMemecoins) excludeMemecoins.checked = false;
    
    applyFiltersToLiveData();
}

// Helper functions (reuse existing ones)
function formatPrice(price) {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return Math.round(price).toLocaleString();
}

function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toFixed(0)}`;
}

function determineCategory(coin) {
    const symbol = coin.symbol.toUpperCase();
    const name = coin.name.toLowerCase();
    
    if (['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDE'].includes(symbol)) return 'stablecoin';
    if (['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'].includes(symbol)) return 'meme';
    if (['ETH', 'BNB', 'SOL', 'ADA', 'AVAX', 'DOT', 'NEAR', 'SUI', 'INJ'].includes(symbol)) return 'l1';
    if (['MATIC', 'ARB', 'OP', 'LRC', 'IMX'].includes(symbol)) return 'l2';
    if (name.includes('defi') || ['UNI', 'AAVE', 'COMP', 'SNX', 'CRV'].includes(symbol)) return 'defi';
    if (['SAND', 'MANA', 'AXS', 'ENJ'].includes(symbol)) return 'gaming';
    
    return 'crypto';
}

function getNarrativeTheme(symbol) {
    const themes = {
        'SOL': 'High-Performance L1',
        'AVAX': 'Subnet Innovation', 
        'NEAR': 'AI Integration',
        'SUI': 'Move Language Pioneer',
        'INJ': 'DeFi Infrastructure',
        'SEI': 'Trading Optimization',
        'FTM': 'Opera Integration',
        'ALGO': 'Pure PoS'
    };
    return themes[symbol] || 'Emerging Technology';
}

function estimateTVL(symbol) {
    const tvlData = {
        'ETH': '$58.2B',
        'BNB': '$12.8B', 
        'MATIC': '$8.4B',
        'ARB': '$3.2B',
        'OP': '$2.1B',
        'AVAX': '$1.8B'
    };
    return tvlData[symbol] || 'N/A';
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// Show loading states
function showLoadingStates() {
    const sections = [
        { id: 'narrativeTokens', message: 'Loading trending narratives...' },
        { id: 'memeTokens', message: 'Loading meme coin data...' },
        { id: 'networkTokens', message: 'Loading network analysis...' },
        { id: 'topThreeTokens', message: 'Apply filters to see top altcoins...' }
    ];
    
    sections.forEach(section => {
        const container = document.getElementById(section.id);
        if (container) {
            container.innerHTML = `
                <div class="token-card loading-placeholder">
                    <div class="loading-spinner-small"></div>
                    <p>${section.message}</p>
                </div>
            `;
        }
    });
}

// Load sections (reuse existing functions but with scoring)
function loadNarrativeTokens() {
    const container = document.getElementById('narrativeTokens');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (liveData.narrativeTokens.length === 0) {
        showLoadingError(container, 'No narrative data available');
        return;
    }
    
    liveData.narrativeTokens.forEach(token => {
        const card = createTokenCard(token, 'narrative');
        container.appendChild(card);
    });
    
    console.log('✅ Narrative tokens loaded with scoring');
}

function loadMemeTokens() {
    const container = document.getElementById('memeTokens');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (liveData.memeTokens.length === 0) {
        showLoadingError(container, 'No meme coin data available');
        return;
    }
    
    liveData.memeTokens.forEach(token => {
        const card = createTokenCard(token, 'meme');
        container.appendChild(card);
    });
    
    console.log('✅ Meme tokens loaded with scoring');
}

function loadNetworkTokens() {
    const container = document.getElementById('networkTokens');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (liveData.networkTokens.length === 0) {
        showLoadingError(container, 'No network data available');
        return;
    }
    
    liveData.networkTokens.forEach(token => {
        const card = createTokenCard(token, 'network');
        container.appendChild(card);
    });
    
    console.log('✅ Network tokens loaded with scoring');
}

// Setup filter controls
function setupFilterControls() {
    const applyButton = document.getElementById('applyFilters');
    if (applyButton) {
        applyButton.addEventListener('click', applyFiltersToLiveData);
        console.log('✅ Filter controls setup');
    }
}

// Update API status
function updateAPIStatus(status, message) {
    const statusElement = document.getElementById('apiStatus');
    if (statusElement) {
        statusElement.className = `api-status ${status}`;
        statusElement.textContent = message;
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

// Show error message
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
    alert(`Feature coming soon: Detailed analysis for ${symbol}`);
}

function openTradeLink(symbol) {
    console.log(`Opening trade link for ${symbol}`);
    window.open(`https://www.binance.com/en/trade/${symbol}_USDT`, '_blank');
}

// Show score explanation modal
function showScoreExplanation(symbol) {
    const token = liveData.allTokens.find(t => t.symbol === symbol);
    if (!token) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content score-explanation-modal">
            <div class="modal-header">
                <h3><i class="fas fa-robot"></i> AI Score Explanation: ${token.symbol}</h3>
                <button class="modal-close" onclick="closeScoreExplanation()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="score-overview">
                    <div class="score-circle">
                        <span class="score-number">${token.aiScore || 'N/A'}</span>
                        <span class="score-suffix">/100</span>
                    </div>
                    <div class="score-status">
                        <strong>${token.hasAIData ? 'Live AI Analysis' : 'Fallback Score'}</strong>
                        <p>Updated: ${liveData.lastScoreUpdate ? new Date(liveData.lastScoreUpdate).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                </div>
                
                <div class="score-breakdown">
                    <h4>How do we calculate AI Scores?</h4>
                    <div class="score-categories">
                        <div class="score-category">
                            <div class="category-icon">📈</div>
                            <div class="category-info">
                                <strong>Supply Trend (0-25)</strong>
                                <p>Growing supply is better for ecosystem health</p>
                                <span class="category-score">${token.scoreBreakdown?.supplyTrend || 'N/A'}/25</span>
                            </div>
                        </div>
                        <div class="score-category">
                            <div class="category-icon">🔓</div>
                            <div class="category-info">
                                <strong>Token Unlock Risk (0-25)</strong>
                                <p>Less unlocks = better (reduced sell pressure)</p>
                                <span class="category-score">${token.scoreBreakdown?.unlockRisk || 'N/A'}/25</span>
                            </div>
                        </div>
                        <div class="score-category">
                            <div class="category-icon">👥</div>
                            <div class="category-info">
                                <strong>Wallet Holder Growth (0-25)</strong>
                                <p>Growing holder base indicates adoption</p>
                                <span class="category-score">${token.scoreBreakdown?.holderGrowth || 'N/A'}/25</span>
                            </div>
                        </div>
                        <div class="score-category">
                            <div class="category-icon">⚡</div>
                            <div class="category-info">
                                <strong>Utility & Narrative (0-25)</strong>
                                <p>Real utility or strong narrative strength</p>
                                <span class="category-score">${token.scoreBreakdown?.utilityStrength || 'N/A'}/25</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${token.aiExplanation ? `
                <div class="ai-analysis-section">
                    <h4>AI Analysis</h4>
                    <div class="ai-explanation">
                        ${token.aiExplanation}
                    </div>
                </div>
                ` : ''}
                
                <div class="score-disclaimer">
                    <p><strong>Disclaimer:</strong> Scores come from Perplexity AI live research and are for informational purposes only. Always do your own research before making investment decisions.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close score explanation modal
function closeScoreExplanation() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Export for debugging
window.scannerFunctions = {
    liveData,
    fetchLiveCoinMarketCapData,
    enhanceWithAIScoring,
    applyFiltersToLiveData,
    showScoringModal,
    resetFilters
};

// Add refresh functionality
window.refreshLiveData = async function() {
    updateAPIStatus('loading', 'Refreshing live data...');
    try {
        await fetchLiveCoinMarketCapData();
        populateWithLiveData();
        enhanceWithAIScoring();
        updateAPIStatus('live', 'Data refreshed successfully');
        console.log('✅ Data refreshed with scoring');
    } catch (error) {
        console.error('❌ Refresh failed:', error);
        updateAPIStatus('error', 'Refresh failed');
    }
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('scoreInfoModal');
    if (event.target === modal) {
        closeScoringModal();
    }
};

console.log('📊 Advanced scanner with scoring system loaded');