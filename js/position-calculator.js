// Position Calculator Logic

class PositionCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.hideResults();
    }

    initializeElements() {
        this.portfolioSizeInput = document.getElementById('portfolioSize');
        this.entryPriceInput = document.getElementById('entryPrice');
        this.stopLossInput = document.getElementById('stopLoss');
        this.riskPercentageInput = document.getElementById('riskPercentage');
        this.takeProfitInput = document.getElementById('takeProfitPrice');
        this.calculateBtn = document.getElementById('calculateBtn');
        
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.warningMessage = document.getElementById('warningMessage');
        this.targetHint = document.getElementById('targetHint');
        
        this.riskAmountEl = document.getElementById('riskAmount');
        this.riskPerTokenEl = document.getElementById('riskPerToken');
        this.positionSizeEl = document.getElementById('positionSize');
        this.investmentAmountEl = document.getElementById('investmentAmount');
        this.rewardRiskRatioEl = document.getElementById('rewardRiskRatio');
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculatePosition());
        
        // Allow Enter key to trigger calculation
        [this.portfolioSizeInput, this.entryPriceInput, this.stopLossInput, this.riskPercentageInput, this.takeProfitInput]
            .forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.calculatePosition();
                    }
                });
            });

        // Real-time validation and 3R hint
        this.stopLossInput.addEventListener('input', () => {
            this.validateInputs();
            this.updateTargetHint();
        });
        this.entryPriceInput.addEventListener('input', () => {
            this.validateInputs();
            this.updateTargetHint();
        });
    }

    validateInputs() {
        const entryPrice = parseFloat(this.entryPriceInput.value);
        const stopLoss = parseFloat(this.stopLossInput.value);

        if (entryPrice && stopLoss && stopLoss >= entryPrice) {
            this.showWarning();
            return false;
        } else {
            this.hideWarning();
            return true;
        }
    }

    showWarning() {
        this.warningMessage.classList.add('show');
    }

    hideWarning() {
        this.warningMessage.classList.remove('show');
    }

    updateTargetHint() {
        const entryPrice = parseFloat(this.entryPriceInput.value);
        const stopLoss = parseFloat(this.stopLossInput.value);

        if (entryPrice && stopLoss && stopLoss < entryPrice) {
            const riskPerToken = entryPrice - stopLoss;
            const target3R = entryPrice + (3 * riskPerToken);
            this.targetHint.textContent = `⚡ Target for 3R: $${this.formatNumber(target3R, 2)}`;
            this.targetHint.classList.add('show');
        } else {
            this.targetHint.classList.remove('show');
        }
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    formatPositionSize(positionSize) {
        // For very small numbers, show more decimals
        if (positionSize < 1) {
            return this.formatNumber(positionSize, 6);
        }
        // For numbers between 1-100, show 2 decimals
        else if (positionSize < 100) {
            return this.formatNumber(positionSize, 2);
        }
        // For larger numbers, show no decimals
        else {
            return this.formatNumber(positionSize, 0);
        }
    }

    calculatePosition() {
        // Get input values
        const portfolioSize = parseFloat(this.portfolioSizeInput.value);
        const entryPrice = parseFloat(this.entryPriceInput.value);
        const stopLoss = parseFloat(this.stopLossInput.value);
        const riskPercentage = parseFloat(this.riskPercentageInput.value);
        const takeProfit = parseFloat(this.takeProfitInput.value);

        // Validate inputs
        if (!this.isValidInput(portfolioSize, entryPrice, stopLoss, riskPercentage)) {
            this.showInputError();
            return;
        }

        // Check if stop loss is greater than entry price
        if (stopLoss >= entryPrice) {
            this.showWarning();
            this.hideResults();
            return;
        }

        this.hideWarning();

        // Perform calculations
        const results = this.performCalculations(portfolioSize, entryPrice, stopLoss, riskPercentage, takeProfit);
        
        // Display results
        this.displayResults(results);
        this.showResults();
    }

    isValidInput(portfolioSize, entryPrice, stopLoss, riskPercentage) {
        return portfolioSize > 0 && 
               entryPrice > 0 && 
               stopLoss > 0 && 
               riskPercentage > 0 && 
               riskPercentage <= 100;
    }

    showInputError() {
        alert('Please enter valid positive numbers for all fields. Risk percentage should be between 0.1% and 100%.');
    }

    performCalculations(portfolioSize, entryPrice, stopLoss, riskPercentage, takeProfit) {
        // Calculate risk amount (how much money we're willing to lose)
        const riskAmount = portfolioSize * (riskPercentage / 100);
        
        // Calculate risk per token (how much we lose per token if stop loss hits)
        const riskPerToken = entryPrice - stopLoss;
        
        // Calculate position size (how many tokens to buy)
        const positionSize = riskAmount / riskPerToken;
        
        // Calculate total investment amount
        const investmentAmount = positionSize * entryPrice;

        // Calculate reward-to-risk ratio if take profit is provided
        let rewardRiskRatio = null;
        if (takeProfit && takeProfit > entryPrice) {
            const rewardPerToken = takeProfit - entryPrice;
            rewardRiskRatio = rewardPerToken / riskPerToken;
        }

        return {
            riskAmount,
            riskPerToken,
            positionSize,
            investmentAmount,
            rewardRiskRatio
        };
    }

    displayResults(results) {
        // Update result values
        this.riskAmountEl.textContent = this.formatCurrency(results.riskAmount);
        this.riskPerTokenEl.textContent = this.formatCurrency(results.riskPerToken);
        this.positionSizeEl.textContent = `${this.formatPositionSize(results.positionSize)} tokens`;
        this.investmentAmountEl.textContent = this.formatCurrency(results.investmentAmount);
        
        // Update R/R ratio
        if (results.rewardRiskRatio !== null && results.rewardRiskRatio > 0) {
            this.rewardRiskRatioEl.textContent = `${this.formatNumber(results.rewardRiskRatio, 2)} R/R`;
        } else {
            this.rewardRiskRatioEl.textContent = '—';
        }

        // Add animation effect
        this.animateResults();
    }

    animateResults() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PositionCalculator();
});

// Example usage for testing (can be removed in production)
function populateExample() {
    document.getElementById('portfolioSize').value = '10000';
    document.getElementById('entryPrice').value = '50.00';
    document.getElementById('stopLoss').value = '45.00';
    document.getElementById('riskPercentage').value = '2';
    document.getElementById('takeProfitPrice').value = '65.00';
}

// Add example button functionality (optional)
if (document.getElementById('exampleBtn')) {
    document.getElementById('exampleBtn').addEventListener('click', populateExample);
}