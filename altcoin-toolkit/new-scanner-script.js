// New Altcoin Scanner JavaScript with 4-section layout
// Mock data structures for development

const mockData = {
    narrativeTokens: [
        {
            symbol: 'SOL',
            name: 'Solana',
            price: '$98.45',
            change24h: '+12.3%',
            narrative: 'High-Performance L1',
            aiScore: 85,
            marketCap: '$42.5B',
            category: 'l1'
        },
        {
            symbol: 'AVAX',
            name: 'Avalanche',
            price: '$36.78',
            change24h: '+8.7%',
            narrative: 'Subnet Innovation',
            aiScore: 78,
            marketCap: '$14.2B',
            category: 'l1'
        },
        {
            symbol: 'NEAR',
            name: 'NEAR Protocol',
            price: '$5.67',
            change24h: '+15.2%',
            narrative: 'AI Integration',
            aiScore: 82,
            marketCap: '$6.1B',
            category: 'l1'
        }
    ],
    memeTokens: [
        {
            symbol: 'DOGE',
            name: 'Dogecoin',
            price: '$0.087',
            change24h: '+5.4%',
            socialScore: 92,
            marketCap: '$12.4B',
            category: 'meme'
        },
        {
            symbol: 'SHIB',
            name: 'Shiba Inu',
            price: '$0.0000089',
            change24h: '+3.2%',
            socialScore: 88,
            marketCap: '$5.2B',
            category: 'meme'
        },
        {
            symbol: 'PEPE',
            name: 'Pepe',
            price: '$0.0000012',
            change24h: '+18.7%',
            socialScore: 85,
            marketCap: '$1.8B',
            category: 'meme'
        }
    ],
    networkTokens: [
        {
            symbol: 'ETH',
            name: 'Ethereum',
            price: '$2,345.67',
            change24h: '+4.5%',
            tvl: '$58.2B',
            networkActivity: 95,
            marketCap: '$282.1B',
            category: 'l1'
        },
        {
            symbol: 'BNB',
            name: 'BNB Chain',
            price: '$312.45',
            change24h: '+2.1%',
            tvl: '$12.8B',
            networkActivity: 88,
            marketCap: '$48.3B',
            category: 'l1'
        },
        {
            symbol: 'MATIC',
            name: 'Polygon',
            price: '$0.89',
            change24h: '+6.8%',
            tvl: '$8.4B',
            networkActivity: 84,
            marketCap: '$8.2B',
            category: 'l2'
        }
    ]
};

// Initialize scanner
document.addEventListener('DOMContentLoaded', function() {
    loadNarrativeTokens();
    loadMemeTokens();
    loadNetworkTokens();
    setupFilterControls();
    updateAPIStatus();
});

// Load narrative-based tokens
function loadNarrativeTokens() {
    const container = document.getElementById('narrativeTokens');
    container.innerHTML = '';
    
    mockData.narrativeTokens.forEach(token => {
        const card = createTokenCard(token, 'narrative');
        container.appendChild(card);
    });
}

// Load meme coins
function loadMemeTokens() {
    const container = document.getElementById('memeTokens');
    container.innerHTML = '';
    
    mockData.memeTokens.forEach(token => {
        const card = createTokenCard(token, 'meme');
        container.appendChild(card);
    });
}

// Load network-based tokens
function loadNetworkTokens() {
    const container = document.getElementById('networkTokens');
    container.innerHTML = '';
    
    mockData.networkTokens.forEach(token => {
        const card = createTokenCard(token, 'network');
        container.appendChild(card);
    });
}

// Create token card
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
            <button class="btn-highlight btn-highlight-primary">
                <i class="fas fa-chart-line"></i>
                View Details
            </button>
            <button class="btn-highlight btn-highlight-secondary">
                <i class="fas fa-external-link-alt"></i>
                Trade
            </button>
        </div>
    `;
    
    return card;
}

// Setup filter controls
function setupFilterControls() {
    const applyButton = document.getElementById('applyFilters');
    applyButton.addEventListener('click', applyFilters);
}

// Apply filters to top 3 section
function applyFilters() {
    const marketCap = document.getElementById('marketCapFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const excludeStablecoins = document.getElementById('excludeStablecoins').checked;
    const excludeMemecoins = document.getElementById('excludeMemecoins').checked;
    
    // Combine all tokens for filtering
    let allTokens = [
        ...mockData.narrativeTokens,
        ...mockData.networkTokens
    ];
    
    // Add memecoins only if not excluded
    if (!excludeMemecoins) {
        allTokens = [...allTokens, ...mockData.memeTokens];
    }
    
    // Apply filters
    let filteredTokens = allTokens.filter(token => {
        // Category filter
        if (category !== 'all' && token.category !== category) {
            return false;
        }
        
        // Market cap filter
        if (marketCap !== 'all') {
            const cap = parseFloat(token.marketCap.replace(/[^0-9.]/g, ''));
            switch (marketCap) {
                case 'large':
                    if (cap < 10) return false;
                    break;
                case 'mid':
                    if (cap < 1 || cap >= 10) return false;
                    break;
                case 'small':
                    if (cap < 0.1 || cap >= 1) return false;
                    break;
                case 'micro':
                    if (cap >= 0.1) return false;
                    break;
            }
        }
        
        return true;
    });
    
    // Sort by AI score or social score
    filteredTokens.sort((a, b) => {
        const scoreA = a.aiScore || a.socialScore || a.networkActivity || 0;
        const scoreB = b.aiScore || b.socialScore || b.networkActivity || 0;
        return scoreB - scoreA;
    });
    
    // Take top 3
    const topThree = filteredTokens.slice(0, 3);
    
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

// Create top 3 token card with ranking
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
            <button class="btn-highlight btn-highlight-primary">
                <i class="fas fa-star"></i>
                Top Pick
            </button>
            <button class="btn-highlight btn-highlight-secondary">
                <i class="fas fa-external-link-alt"></i>
                Trade
            </button>
        </div>
    `;
    
    return card;
}

// Update API status
function updateAPIStatus() {
    // Simulate API status updates
    setTimeout(() => {
        document.getElementById('perplexityStatus').textContent = 'Connected';
        document.getElementById('cmcStatus').textContent = 'Connected';
    }, 2000);
}

// Placeholder functions for future API integration
async function fetchPerplexityData(query) {
    // This will connect to Perplexity API when deployed
    console.log('Fetching Perplexity data for:', query);
    return { success: true, data: mockData };
}

async function fetchCoinMarketCapData() {
    // This will connect to CoinMarketCap API when deployed
    console.log('Fetching CoinMarketCap data...');
    return { success: true, data: mockData };
}

// Export functions for testing
window.scannerFunctions = {
    loadNarrativeTokens,
    loadMemeTokens,
    loadNetworkTokens,
    applyFilters,
    fetchPerplexityData,
    fetchCoinMarketCapData
};