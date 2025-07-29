// debug-fix.js - Complete Dashboard Fix
const TOKENS = ['ADA', 'SOL', 'DOT', 'MATIC', 'LINK'];

// Store tokens globally for access in other functions
window.currentTokens = [];

async function fetchWithTimeout(url, options, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initializeDashboardFixed() {
  console.log('🚀 Initializing dashboard with complete fixes...');
  
  const topAltcoinsDiv = document.getElementById('top-altcoins') || 
                        document.getElementById('topThreeTokens') ||
                        document.querySelector('.top-three-section .tokens-grid');
  
  if (!topAltcoinsDiv) {
    console.error('❌ Top altcoins container not found. Looking for #top-altcoins, #topThreeTokens, or .top-three-section .tokens-grid');
    showError('UI container not found. Please check HTML structure.');
    return;
  }

  topAltcoinsDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><p>🔄 Loading cryptocurrency data...</p></div>';

  // Step 1: Fetch CMC data
  let coins = [];
  try {
    console.log('📡 Fetching CMC data...');
    const response = await fetchWithTimeout('/api/crypto-listings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 CMC Response status:', response.status);
    const data = await response.json();
    console.log('📡 CMC Response data:', data);
    
    coins = data.data || [];
    if (data.warning) {
      console.warn('⚠️ CMC Warning:', data.warning);
    }
    if (data.fallback) {
      console.warn('⚠️ Using CMC fallback data');
    }
  } catch (error) {
    console.error('❌ CMC fetch failed:', error.message);
    coins = [
      { name: "Cardano", symbol: "ADA", price: 0.40, market_cap: 14000000000, percent_change_24h: 2.1 },
      { name: "Solana", symbol: "SOL", price: 180, market_cap: 80000000000, percent_change_24h: 4.5 },
      { name: "Polkadot", symbol: "DOT", price: 5.5, market_cap: 8000000000, percent_change_24h: -1.2 },
      { name: "Polygon", symbol: "MATIC", price: 0.50, market_cap: 5000000000, percent_change_24h: 3.8 },
      { name: "Chainlink", symbol: "LINK", price: 13, market_cap: 7000000000, percent_change_24h: 1.7 },
    ];
  }

  // Step 2: Update UI with loading state
  topAltcoinsDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><p>🧠 Getting AI scores...</p></div>';

  // Step 3: Fetch Perplexity scores for target tokens
  const scoredTokens = [];
  for (let i = 0; i < TOKENS.length; i++) {
    const token = TOKENS[i];
    const coinData = coins.find(c => c.symbol === token);
    
    try {
      console.log(`🔍 Analyzing ${token}... (${i + 1}/${TOKENS.length})`);
      
      const response = await fetchWithTimeout('/api/perplexity-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenName: coinData?.name || token }),
      });
      
      console.log(`📡 Perplexity Response status for ${token}:`, response.status);
      const data = await response.json();
      console.log(`📡 Perplexity Response data for ${token}:`, data);
      
      const scoredToken = {
        name: coinData?.name || token,
        symbol: token,
        price: coinData?.price || 0,
        market_cap: coinData?.market_cap || 0,
        percent_change_24h: coinData?.percent_change_24h || 0,
        score: data.score || 50,
        explanation: data.explanation || `No analysis available for ${token}.`,
        hasAIData: !data.fallback && !data.warning,
        warning: data.warning
      };
      
      scoredTokens.push(scoredToken);
      
      if (data.warning) {
        console.warn(`⚠️ Perplexity Warning for ${token}:`, data.warning);
      }
      
      // Rate limiting: 1-second delay between requests (except for last)
      if (i < TOKENS.length - 1) {
        console.log('⏱️ Rate limiting: waiting 1 second...');
        await delay(1000);
      }
      
    } catch (error) {
      console.error(`❌ Perplexity fetch failed for ${token}:`, error.message);
      scoredTokens.push({
        name: coinData?.name || token,
        symbol: token,
        price: coinData?.price || 0,
        market_cap: coinData?.market_cap || 0,
        percent_change_24h: coinData?.percent_change_24h || 0,
        score: 45 + Math.floor(Math.random() * 20), // 45-64 range
        explanation: `Mock analysis for ${token}: moderate market interest with standard risk factors.`,
        hasAIData: false,
        fallback: true
      });
    }
  }

  // Store globally for access in other functions
  window.currentTokens = scoredTokens;

  // Step 4: Update UI with results
  updateTopThreeFixed(scoredTokens);
  
  console.log('✅ Dashboard initialization complete');
}

function updateTopThreeFixed(tokens) {
  console.log('🏆 Updating Top 3 altcoins...');
  
  const topAltcoinsDiv = document.getElementById('top-altcoins') || 
                        document.getElementById('topThreeTokens') ||
                        document.querySelector('.top-three-section .tokens-grid');
  
  if (!topAltcoinsDiv) {
    console.error('❌ Top altcoins container not found');
    return;
  }

  // Filter out major coins and sort by score
  const topAltcoins = tokens
    .filter(token => !['BTC', 'ETH', 'USDT', 'USDC'].includes(token.symbol))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log('🎯 Top 3 altcoins:', topAltcoins.map(t => `${t.symbol}: ${t.score}`));

  if (topAltcoins.length === 0) {
    topAltcoinsDiv.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 10px;">
        <p>❌ No altcoin data available.</p>
        <button onclick="initializeDashboardFixed()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          🔄 Retry
        </button>
      </div>
    `;
    return;
  }

  topAltcoinsDiv.innerHTML = topAltcoins.map((token, index) => {
    const rank = index + 1;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const rankColor = rankColors[rank - 1] || '#666';
    
    return `
      <div class="token-card" style="
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        margin: 10px;
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-width: 300px;
      ">
        <div style="
          position: absolute;
          top: -10px;
          right: -10px;
          background: ${rankColor};
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          z-index: 10;
        ">
          #${rank}
        </div>
        
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 5px 0; font-size: 1.2rem; color: #333;">${token.name}</h3>
          <span style="
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
          ">${token.symbol}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #333;">$${formatPrice(token.price)}</div>
            <div style="color: ${token.percent_change_24h >= 0 ? '#28a745' : '#dc3545'}; font-size: 0.9rem;">
              ${token.percent_change_24h >= 0 ? '+' : ''}${token.percent_change_24h.toFixed(2)}%
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.9rem; color: #666;">Market Cap</div>
            <div style="font-size: 0.9rem; font-weight: 600; color: #333;">$${formatMarketCap(token.market_cap)}</div>
          </div>
        </div>
        
        <div style="
          margin: 15px 0;
          padding: 12px;
          background: rgba(0, 123, 255, 0.1);
          border-radius: 6px;
          border-left: 4px solid #007bff;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 600; color: #333;">AI Score</span>
            <span style="font-weight: 700; color: #007bff; font-size: 1.1rem;">
              ${token.score}/100
              ${token.hasAIData ? '🤖' : ''}
            </span>
          </div>
          <div style="width: 100%; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
            <div style="
              width: ${token.score}%;
              height: 100%;
              background: ${getScoreColor(token.score)};
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 15px;">
          <button onclick="viewTokenDetailsFixed('${token.symbol}')" style="
            flex: 1;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
          ">
            📊 View Details
          </button>
          <button onclick="showScoringModalFixed()" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
          ">
            ❓
          </button>
        </div>
        
        ${token.warning ? `
        <div style="margin-top: 10px; font-size: 0.8rem; color: #856404; background: #fff3cd; padding: 8px; border-radius: 4px;">
          ⚠️ ${token.warning}
        </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function viewTokenDetailsFixed(symbol) {
  console.log(`👁️ Viewing details for ${symbol}`);
  
  const token = window.currentTokens?.find(t => t.symbol === symbol);
  
  if (!token) {
    showError(`Token data not found for ${symbol}. Try refreshing the page.`);
    return;
  }

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'token-details-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333; display: flex; align-items: center; gap: 10px;">
          🔍 ${token.name} (${symbol}) Analysis
          ${token.hasAIData ? '🤖' : ''}
        </h3>
        <button onclick="this.closest('.token-details-modal').remove()" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
        ">&times;</button>
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      ">
        <div>
          <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Current Price</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #333;">$${formatPrice(token.price)}</div>
          <div style="color: ${token.percent_change_24h >= 0 ? '#28a745' : '#dc3545'}; font-size: 0.9rem;">
            ${token.percent_change_24h >= 0 ? '+' : ''}${token.percent_change_24h.toFixed(2)}% (24h)
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">AI Score</div>
          <div style="font-size: 2rem; font-weight: 700; color: #007bff;">${token.score}/100</div>
          <div style="font-size: 0.8rem; color: ${token.hasAIData ? '#28a745' : '#ffc107'};">
            ${token.hasAIData ? '✅ Live AI Data' : '⚠️ Fallback Data'}
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 15px 0; color: #333; display: flex; align-items: center; gap: 8px;">
          🤖 AI Analysis
        </h4>
        <div style="
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          line-height: 1.6;
          color: #555;
        ">
          ${token.explanation}
        </div>
      </div>
      
      <div style="
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 15px;
        border-radius: 6px;
        font-size: 0.85rem;
        color: #856404;
      ">
        <strong>⚠️ Disclaimer:</strong> This analysis is AI-generated and for informational purposes only. 
        Always conduct your own research before making investment decisions.
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showScoringModalFixed() {
  console.log('📖 Showing scoring modal...');
  
  const modal = document.createElement('div');
  modal.className = 'scoring-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333;">🤖 How AI Scoring Works</h3>
        <button onclick="this.closest('.scoring-modal').remove()" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        ">&times;</button>
      </div>
      
      <p style="margin-bottom: 25px; color: #666; line-height: 1.6; font-size: 1rem;">
        Scores (0-100) are generated by Perplexity AI based on comprehensive analysis of multiple factors:
      </p>
      
      <div style="margin-bottom: 25px;">
        <div style="
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 1.5rem;">📈</span>
            <strong style="color: #333; font-size: 1.1rem;">Market Trends</strong>
          </div>
          <p style="margin: 0; color: #666;">
            Price movements, trading volume, technical indicators, and overall market momentum
          </p>
        </div>
        
        <div style="
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #e8f5e8, #f8f9fa);
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 1.5rem;">💬</span>
            <strong style="color: #333; font-size: 1.1rem;">Social Sentiment</strong>
          </div>
          <p style="margin: 0; color: #666;">
            Community discussions, news coverage, social media activity, and public perception
          </p>
        </div>
        
        <div style="
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #fff3e0, #f8f9fa);
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 1.5rem;">🚀</span>
            <strong style="color: #333; font-size: 1.1rem;">Adoption Metrics</strong>
          </div>
          <p style="margin: 0; color: #666;">
            Real-world usage, partnerships, ecosystem development, and institutional adoption
          </p>
        </div>
      </div>
      
      <div style="
        background: #f0f8ff;
        border: 1px solid #b3d9ff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      ">
        <h4 style="margin: 0 0 10px 0; color: #1565c0;">Score Ranges</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <div style="text-align: center;">
            <div style="background: #4caf50; color: white; padding: 5px; border-radius: 4px; font-weight: bold;">80-100</div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">Excellent</div>
          </div>
          <div style="text-align: center;">
            <div style="background: #ffc107; color: white; padding: 5px; border-radius: 4px; font-weight: bold;">60-79</div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">Good</div>
          </div>
          <div style="text-align: center;">
            <div style="background: #ff9800; color: white; padding: 5px; border-radius: 4px; font-weight: bold;">40-59</div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">Fair</div>
          </div>
          <div style="text-align: center;">
            <div style="background: #f44336; color: white; padding: 5px; border-radius: 4px; font-weight: bold;">0-39</div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">Poor</div>
          </div>
        </div>
      </div>
      
      <div style="
        font-size: 0.85rem;
        color: #666;
        border-top: 1px solid #eee;
        padding-top: 15px;
        text-align: center;
      ">
        <strong>Note:</strong> AI analysis is updated regularly but should not be considered financial advice.
        <br>Scores are based on current data and may change as market conditions evolve.
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Utility functions
function formatPrice(price) {
  if (!price || price === 0) return '0.00';
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 100) return price.toFixed(2);
  return Math.round(price).toLocaleString();
}

function formatMarketCap(marketCap) {
  if (!marketCap || marketCap === 0) return '0';
  if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(1)}T`;
  if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`;
  if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`;
  return marketCap.toLocaleString();
}

function getScoreColor(score) {
  if (score >= 80) return '#4caf50'; // Green
  if (score >= 60) return '#ffc107'; // Yellow
  if (score >= 40) return '#ff9800'; // Orange
  return '#f44336'; // Red
}

function showError(message) {
  console.error('🚨 Error:', message);
  
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    z-index: 1000;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  errorDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <strong>⚠️ Error:</strong><br>
        ${message}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        padding: 0;
      ">&times;</button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDashboardFixed);
} else {
  // DOM already loaded, initialize immediately
  initializeDashboardFixed();
}

// Export functions for global access
window.initializeDashboardFixed = initializeDashboardFixed;
window.viewTokenDetailsFixed = viewTokenDetailsFixed;
window.showScoringModalFixed = showScoringModalFixed;

console.log('🔧 Complete dashboard fixes loaded! Auto-initializing...');