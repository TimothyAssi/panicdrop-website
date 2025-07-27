# Altcoin Strength Scanner - Documentation

## Overview

The Altcoin Strength Scanner is a professional-grade cryptocurrency analysis tool developed by Timothy Assi, eToro Elite Popular Investor since 2021. The tool provides comprehensive fundamental analysis of cryptocurrencies using AI-powered research and a sophisticated scoring methodology.

## Scoring Methodology

### Core Principle
The scanner replaces traditional price-based scoring (% gains) with **fundamental metrics analysis** using real-time data from Perplexity AI. No mock data is used - all analysis is based on live research and market data.

### Scoring Scale
- **Individual Metrics**: 0-10 points each
- **Total Metrics**: 20 fundamental metrics
- **Maximum Score**: 100 points total
- **Calculation**: Sum of all individual metric scores

## The 20 Fundamental Metrics

### 1. Token Economics & Supply (5 Metrics)

#### 1.1 Token Unlock Schedule (0-10 points)
- **Purpose**: Evaluates upcoming token supply releases
- **Scoring**:
  - 10 points: ≤5% unlocks in next 12 months
  - 8 points: 6-15% unlocks
  - 6 points: 16-30% unlocks
  - 4 points: 31-50% unlocks
  - 2 points: >50% unlocks
- **Risk Factor**: High unlock schedules can create selling pressure

#### 1.2 Total Value Locked (TVL) (0-10 points)
- **Purpose**: Measures protocol utility and adoption
- **Scoring**:
  - 10 points: >$1B TVL
  - 9 points: $500M-$1B
  - 8 points: $100M-$500M
  - 7 points: $50M-$100M
  - 6 points: $10M-$50M
  - 4 points: $1M-$10M
  - 2 points: <$1M
- **Significance**: Higher TVL indicates stronger protocol usage

#### 1.3 Supply Dynamics (0-10 points)
- **Purpose**: Analyzes token supply mechanics
- **Scoring**:
  - 10 points: Deflationary (token burns)
  - 8 points: Stable supply
  - 7 points: Low inflation (≤2% annually)
  - 5 points: Moderate inflation (3-5%)
  - 3 points: High inflation (6-10%)
  - 1 point: Very high inflation (>10%)

#### 1.4 Market Capitalization (0-10 points)
- **Purpose**: Assesses market size and stability
- **Scoring**:
  - 10 points: >$50B (Mega-cap)
  - 9 points: $10B-$50B (Large-cap)
  - 8 points: $1B-$10B (Mid-cap)
  - 7 points: $500M-$1B
  - 6 points: $100M-$500M (Small-cap)
  - 5 points: $50M-$100M
  - 4 points: $10M-$50M (Micro-cap)
  - 3 points: $1M-$10M (Nano-cap)
  - 2 points: <$1M

#### 1.5 Token Distribution (0-10 points)
- **Purpose**: Evaluates concentration risk
- **Scoring**:
  - 10 points: ≤20% held by top 10 wallets
  - 8 points: 21-35% concentration
  - 6 points: 36-50% concentration
  - 4 points: 51-70% concentration
  - 2 points: >70% concentration
- **Risk Factor**: High concentration increases manipulation risk

### 2. Network Activity & Adoption (5 Metrics)

#### 2.1 Active Addresses (0-10 points)
- **Purpose**: Measures real user engagement
- **Scoring**:
  - 10 points: >100k active addresses
  - 9 points: 50k-100k
  - 8 points: 25k-50k
  - 7 points: 10k-25k
  - 6 points: 5k-10k
  - 5 points: 1k-5k
  - 4 points: 500-1k
  - 2 points: <500

#### 2.2 Transaction Volume (0-10 points)
- **Purpose**: Indicates network utilization
- **Scoring**:
  - 10 points: >$1B daily transaction volume
  - 9 points: $500M-$1B
  - 8 points: $100M-$500M
  - 7 points: $50M-$100M
  - 6 points: $10M-$50M
  - 5 points: $1M-$10M
  - 3 points: <$1M

#### 2.3 Protocol Revenue (0-10 points)
- **Purpose**: Evaluates business model sustainability
- **Scoring**:
  - 10 points: >$10M monthly revenue
  - 9 points: $5M-$10M
  - 8 points: $1M-$5M
  - 7 points: $500k-$1M
  - 6 points: $100k-$500k
  - 5 points: $10k-$100k
  - 3 points: <$10k

#### 2.4 Users (0-10 points)
- **Purpose**: Measures adoption scale
- **Scoring**:
  - 10 points: >1M active users
  - 9 points: 500k-1M
  - 8 points: 100k-500k
  - 7 points: 50k-100k
  - 6 points: 10k-50k
  - 5 points: 1k-10k
  - 3 points: <1k

#### 2.5 Fully Diluted Valuation (FDV) (0-10 points)
- **Purpose**: Assesses valuation efficiency
- **Scoring**:
  - 10 points: $1B-$10B (optimal range)
  - 9 points: $10B-$50B
  - 8 points: $500M-$1B
  - 8 points: $100M-$500M
  - 6 points: $10M-$100M or >$50B
  - 4 points: <$10M or >$100B

### 3. Technical & Development (5 Metrics)

#### 3.1 Development Activity (0-10 points)
- **Purpose**: Measures ongoing development
- **Scoring**:
  - 10 points: >100 GitHub commits (30 days)
  - 9 points: 50-100 commits
  - 8 points: 25-50 commits
  - 7 points: 10-25 commits
  - 6 points: 5-10 commits
  - 5 points: 1-5 commits
  - 2 points: 0 commits

#### 3.2 Security Audits (0-10 points)
- **Purpose**: Evaluates security posture
- **Scoring**:
  - 10 points: ≥5 completed audits
  - 9 points: 3-4 audits
  - 8 points: 2 audits
  - 7 points: 1 audit
  - 3 points: 0 audits

#### 3.3 On-Chain Activity (0-10 points)
- **Purpose**: Assesses usage trends
- **Scoring**:
  - 10 points: Increasing trend
  - 7 points: Stable trend
  - 3 points: Decreasing trend
  - 5 points: No clear trend

#### 3.4 Liquidity (0-10 points)
- **Purpose**: Measures market depth
- **Scoring**:
  - 10 points: >$100M total liquidity
  - 9 points: $50M-$100M
  - 8 points: $25M-$50M
  - 7 points: $10M-$25M
  - 6 points: $5M-$10M
  - 5 points: $1M-$5M
  - 3 points: <$1M

#### 3.5 Trading Volume (0-10 points)
- **Purpose**: Indicates market interest
- **Scoring**:
  - 10 points: >$1B daily volume
  - 9 points: $500M-$1B
  - 8 points: $100M-$500M
  - 7 points: $50M-$100M
  - 6 points: $10M-$50M
  - 5 points: $1M-$10M
  - 3 points: <$1M

### 4. Market & Community (5 Metrics)

#### 4.1 Community Size (0-10 points)
- **Purpose**: Measures social engagement
- **Scoring**:
  - 10 points: >1M combined followers
  - 9 points: 500k-1M
  - 8 points: 100k-500k
  - 7 points: 50k-100k
  - 6 points: 10k-50k
  - 5 points: 1k-10k
  - 3 points: <1k

#### 4.2 Partnerships (0-10 points)
- **Purpose**: Evaluates ecosystem integration
- **Scoring**:
  - 10 points: ≥20 major partnerships
  - 9 points: 15-19 partnerships
  - 8 points: 10-14 partnerships
  - 7 points: 5-9 partnerships
  - 6 points: 3-4 partnerships
  - 5 points: 1-2 partnerships
  - 3 points: 0 partnerships

#### 4.3 Ecosystem Flows (0-10 points)
- **Purpose**: Measures cross-chain activity
- **Scoring**:
  - 10 points: >$1B ecosystem flows
  - 9 points: $500M-$1B
  - 8 points: $100M-$500M
  - 7 points: $50M-$100M
  - 6 points: $10M-$50M
  - 5 points: $1M-$10M
  - 3 points: <$1M

#### 4.4 Price-to-Fees Ratio (P/F) (0-10 points)
- **Purpose**: Assesses valuation efficiency
- **Scoring**:
  - 10 points: P/F ≤20 (undervalued)
  - 8 points: P/F 21-50
  - 6 points: P/F 51-100
  - 4 points: P/F 101-200
  - 2 points: P/F >200 (overvalued)

#### 4.5 Market Cap to TVL Ratio (0-10 points)
- **Purpose**: Evaluates protocol valuation
- **Scoring**:
  - 10 points: Ratio ≤1 (undervalued)
  - 9 points: Ratio 1.1-2
  - 8 points: Ratio 2.1-5
  - 6 points: Ratio 5.1-10
  - 4 points: Ratio 10.1-20
  - 2 points: Ratio >20 (overvalued)

## Technical Implementation

### Data Sources
- **Primary**: Perplexity AI API for real-time fundamental research
- **Secondary**: CoinMarketCap API for market data
- **Fallback**: Basic algorithmic scoring for API failures

### API Integration
- **Model**: `sonar-pro` (Perplexity AI)
- **Request Format**: Structured JSON with specific metric queries
- **Response Processing**: JSON parsing with multiple fallback strategies
- **Caching**: Client-side analysis caching for performance

### Scoring Algorithm
1. **Fetch** real-time data via Perplexity AI
2. **Parse** metrics into standardized format
3. **Score** each metric individually (0-10)
4. **Aggregate** all scores (max 100 points)
5. **Display** with detailed breakdown

### Hybrid Loading System
- **Fast Loading**: Basic CoinMarketCap scoring for immediate display
- **Enhanced Analysis**: On-demand Perplexity AI analysis for detailed metrics
- **Progressive Enhancement**: Background fundamental analysis loading

## User Interface Features

### Design Elements
- **Color Scheme**: Professional blue (#0C63FF) and gold (#D4AF37)
- **Layout**: Card-based responsive design
- **Typography**: Inter and Plus Jakarta Sans fonts
- **Iconography**: Font Awesome 6.4.0 icons

### Key Sections
1. **Hero Section**: Tool introduction and credibility indicators
2. **Control Panel**: Refresh, settings, and export functionality
3. **Stats Overview**: Summary metrics and performance indicators
4. **Token Grid**: Interactive cards with core metrics
5. **Detailed Modal**: Comprehensive analysis with 20 metrics

### Interactive Features
- **Live Data**: Real-time API connectivity status
- **Deep Analysis**: AI-powered fundamental analysis on demand
- **Responsive Design**: Mobile and desktop optimization
- **Modal System**: Detailed token analysis overlays

## Professional Credentials

### Created By: Timothy Assi
- **Status**: eToro Elite Popular Investor (since 2021)
- **Following**: 9,000+ followers
- **Copiers**: 320+ active copiers
- **Product**: €350 lifetime Altcoin Profit Toolkit course

### Tool Positioning
- **Target Audience**: Serious cryptocurrency investors
- **Use Case**: Fundamental analysis and due diligence
- **Advantage**: AI-powered real-time research
- **Differentiator**: 20-metric comprehensive scoring

## Access & Authentication

### Login System
- **Integration**: Existing member authentication
- **Preservation**: All current member access maintained
- **Security**: No changes to authentication flow
- **Compatibility**: Full backward compatibility

### Course Integration
- **Product**: Part of Altcoin Profit Toolkit
- **Access**: Available to course members
- **Updates**: Continuous improvements and enhancements
- **Support**: Professional customer support

## Technical Requirements

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript**: ES6+ support required
- **Responsive**: Mobile and tablet optimized
- **Performance**: Progressive loading for optimal speed

### API Dependencies
- **Perplexity AI**: Primary analysis engine
- **CoinMarketCap**: Market data provider
- **Netlify Functions**: Serverless backend
- **Font Awesome**: Icon library

## Deployment & Maintenance

### Hosting
- **Platform**: Netlify (automatic deployments)
- **Repository**: GitHub integration
- **Functions**: Serverless API endpoints
- **CDN**: Global content delivery

### Updates
- **Frequency**: Regular improvements and bug fixes
- **API Model**: Currently using `sonar-pro` model
- **Monitoring**: Comprehensive error logging and debugging
- **Fallbacks**: Multiple data source redundancy

---

**Last Updated**: January 2025  
**Version**: 2.0 (Complete Rebuild)  
**Documentation**: Comprehensive 20-metric system