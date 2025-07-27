// Trade Journal JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const tradeForm = document.getElementById('tradeForm');
    const clearFormBtn = document.getElementById('clearForm');
    const downloadCSVBtn = document.getElementById('downloadCSV');
    const clearAllTradesBtn = document.getElementById('clearAllTrades');
    const tradesTableBody = document.getElementById('tradesTableBody');
    const noTradesMessage = document.getElementById('noTradesMessage');
    
    // Form inputs
    const entryInput = document.getElementById('entry');
    const stopLossInput = document.getElementById('stopLoss');
    const positionSizeInput = document.getElementById('positionSize');
    const riskPerTradeInput = document.getElementById('riskPerTrade');
    const threeRInput = document.getElementById('threeR');
    const target1Input = document.getElementById('target1');
    const exitPriceInput = document.getElementById('exitPrice');
    const tradeResultInput = document.getElementById('tradeResult');
    const rMultipleOutcomeInput = document.getElementById('rMultipleOutcome');
    const estimatedProfitInput = document.getElementById('estimatedProfit');
    
    // Storage key
    const STORAGE_KEY = 'tradeJournalData';
    
    // Load trades from localStorage
    function loadTrades() {
        const tradesData = localStorage.getItem(STORAGE_KEY);
        return tradesData ? JSON.parse(tradesData) : [];
    }
    
    // Save trades to localStorage
    function saveTrades(trades) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    }
    
    // Generate unique ID for trades
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Calculate 3R automatically
    function calculate3R() {
        const entry = parseFloat(entryInput.value);
        const stopLoss = parseFloat(stopLossInput.value);
        
        if (entry && stopLoss && entry > stopLoss) {
            const risk = entry - stopLoss;
            const threeR = entry + (risk * 3);
            threeRInput.value = threeR.toFixed(8);
        } else {
            threeRInput.value = '';
        }
        
        // Also calculate estimated profit when 3R changes
        calculateEstimatedProfit();
    }
    
    // Calculate estimated profit at TP1
    function calculateEstimatedProfit() {
        const entry = parseFloat(entryInput.value);
        const target1 = parseFloat(target1Input.value);
        const positionSize = parseFloat(positionSizeInput.value);
        
        if (entry && target1 && positionSize && target1 > entry) {
            const profit = (target1 - entry) * positionSize;
            estimatedProfitInput.value = profit.toFixed(2);
        } else {
            estimatedProfitInput.value = '';
        }
    }
    
    // Calculate R-Multiple outcome
    function calculateRMultiple() {
        const entry = parseFloat(entryInput.value);
        const stopLoss = parseFloat(stopLossInput.value);
        const exitPrice = parseFloat(exitPriceInput.value);
        const riskPerTrade = parseFloat(riskPerTradeInput.value);
        
        if (entry && stopLoss && exitPrice && riskPerTrade && entry > stopLoss) {
            const riskPerUnit = entry - stopLoss;
            const profitLossPerUnit = exitPrice - entry;
            const rMultiple = profitLossPerUnit / riskPerUnit;
            rMultipleOutcomeInput.value = rMultiple.toFixed(2);
            
            // Auto-set trade result based on R-Multiple
            if (rMultiple > 0.1) {
                tradeResultInput.value = 'Win';
            } else if (rMultiple < -0.1) {
                tradeResultInput.value = 'Loss';
            } else {
                tradeResultInput.value = 'Break Even';
            }
        } else {
            rMultipleOutcomeInput.value = '';
        }
    }
    
    // Add event listeners for auto-calculations
    entryInput.addEventListener('input', function() {
        calculate3R();
        calculateEstimatedProfit();
        calculateRMultiple();
    });
    
    stopLossInput.addEventListener('input', function() {
        calculate3R();
        calculateRMultiple();
    });
    
    positionSizeInput.addEventListener('input', calculateEstimatedProfit);
    target1Input.addEventListener('input', calculateEstimatedProfit);
    exitPriceInput.addEventListener('input', calculateRMultiple);
    riskPerTradeInput.addEventListener('input', calculateRMultiple);
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }
    
    // Format number with appropriate decimal places
    function formatNumber(value) {
        if (!value) return '';
        const num = parseFloat(value);
        return num < 1 ? num.toFixed(8) : num.toFixed(2);
    }
    
    // Get Bitcoin Compass badge HTML
    function getCompassBadge(compass) {
        const classes = {
            'Green': 'green',
            'Orange': 'orange',
            'Red': 'red'
        };
        return `<span class="compass-badge ${classes[compass]}">${compass}</span>`;
    }
    
    // Get row class based on Bitcoin Compass
    function getRowClass(compass) {
        const classes = {
            'Green': 'compass-green',
            'Orange': 'compass-orange',
            'Red': 'compass-red'
        };
        return classes[compass] || '';
    }
    
    // Create table row HTML
    function createTableRow(trade) {
        return `
            <tr class="${getRowClass(trade.bitcoinCompass)}" data-id="${trade.id}">
                <td>${formatDate(trade.entryDate)}</td>
                <td>${trade.altcoin}</td>
                <td>${getCompassBadge(trade.bitcoinCompass)}</td>
                <td>${trade.entryStrategy}</td>
                <td>${trade.exitStrategy}</td>
                <td>${formatNumber(trade.entry)}</td>
                <td>${formatNumber(trade.stopLoss)}</td>
                <td>${formatNumber(trade.positionSize)}</td>
                <td>$${formatNumber(trade.riskPerTrade)}</td>
                <td>${formatNumber(trade.threeR)}</td>
                <td>${formatNumber(trade.target1)}</td>
                <td>${formatNumber(trade.target2)}</td>
                <td>${formatNumber(trade.target3)}</td>
                <td>${formatDate(trade.exitDate)}</td>
                <td>${formatNumber(trade.exitPrice)}</td>
                <td>${trade.tradeResult || ''}</td>
                <td>${formatNumber(trade.rMultipleOutcome)}</td>
                <td>$${formatNumber(trade.estimatedProfit)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editTrade('${trade.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTrade('${trade.id}')">Delete</button>
                </td>
            </tr>
        `;
    }
    
    // Update statistics
    function updateStats() {
        const trades = loadTrades();
        const totalTrades = trades.length;
        
        // Update total trades
        document.getElementById('totalTrades').textContent = totalTrades;
        
        // Calculate win rate based on closed trades
        const closedTrades = trades.filter(trade => trade.tradeResult && trade.tradeResult !== '');
        const wins = closedTrades.filter(trade => trade.tradeResult === 'Win').length;
        const winRate = closedTrades.length > 0 ? (wins / closedTrades.length * 100) : 0;
        document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
        
        // Calculate average R-Multiple
        const tradesWithRMultiple = trades.filter(trade => trade.rMultipleOutcome && trade.rMultipleOutcome !== '');
        const avgRMultiple = tradesWithRMultiple.length > 0 
            ? tradesWithRMultiple.reduce((sum, trade) => sum + parseFloat(trade.rMultipleOutcome), 0) / tradesWithRMultiple.length 
            : 0;
        document.getElementById('averageRMultiple').textContent = avgRMultiple.toFixed(2);
        
        // Calculate total estimated profit
        const totalEstProfit = trades.reduce((sum, trade) => {
            return sum + (parseFloat(trade.estimatedProfit) || 0);
        }, 0);
        document.getElementById('totalEstProfit').textContent = '$' + totalEstProfit.toFixed(2);
    }
    
    // Render trades table
    function renderTrades() {
        const trades = loadTrades();
        
        if (trades.length === 0) {
            tradesTableBody.innerHTML = '';
            noTradesMessage.style.display = 'block';
        } else {
            noTradesMessage.style.display = 'none';
            tradesTableBody.innerHTML = trades
                .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
                .map(trade => createTableRow(trade))
                .join('');
        }
        
        updateStats();
    }
    
    // Add new trade
    function addTrade(tradeData) {
        const trades = loadTrades();
        const newTrade = {
            id: generateId(),
            ...tradeData,
            createdAt: new Date().toISOString()
        };
        
        trades.push(newTrade);
        saveTrades(trades);
        renderTrades();
        showMessage('Trade added successfully!', 'success');
    }
    
    // Edit trade
    window.editTrade = function(tradeId) {
        const trades = loadTrades();
        const trade = trades.find(t => t.id === tradeId);
        
        if (trade) {
            // Populate form with trade data
            Object.keys(trade).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = trade[key];
                }
            });
            
            // Update form submit to edit mode
            tradeForm.dataset.editId = tradeId;
            const submitBtn = tradeForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Trade';
            submitBtn.classList.add('btn-warning');
            
            // Scroll to form
            tradeForm.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Delete trade
    window.deleteTrade = function(tradeId) {
        if (confirm('Are you sure you want to delete this trade?')) {
            const trades = loadTrades();
            const filteredTrades = trades.filter(t => t.id !== tradeId);
            saveTrades(filteredTrades);
            renderTrades();
            showMessage('Trade deleted successfully!', 'success');
        }
    };
    
    // Show message
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.trade-form-container');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // Clear form
    function clearForm() {
        tradeForm.reset();
        tradeForm.removeAttribute('data-edit-id');
        const submitBtn = tradeForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Trade';
        submitBtn.classList.remove('btn-warning');
        threeRInput.value = '';
        rMultipleOutcomeInput.value = '';
        estimatedProfitInput.value = '';
    }
    
    // Handle form submission
    tradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(tradeForm);
        const tradeData = {};
        
        // Convert form data to object
        for (let [key, value] of formData.entries()) {
            tradeData[key] = value;
        }
        
        // Check if editing
        const editId = tradeForm.dataset.editId;
        if (editId) {
            // Update existing trade
            const trades = loadTrades();
            const tradeIndex = trades.findIndex(t => t.id === editId);
            if (tradeIndex !== -1) {
                trades[tradeIndex] = { ...trades[tradeIndex], ...tradeData };
                saveTrades(trades);
                renderTrades();
                showMessage('Trade updated successfully!', 'success');
                clearForm();
            }
        } else {
            // Add new trade
            addTrade(tradeData);
            clearForm();
        }
    });
    
    // Clear form button
    clearFormBtn.addEventListener('click', clearForm);
    
    // Download CSV
    downloadCSVBtn.addEventListener('click', function() {
        const trades = loadTrades();
        
        if (trades.length === 0) {
            showMessage('No trades to export!', 'error');
            return;
        }
        
        // CSV headers
        const headers = [
            'Entry Date', 'Altcoin', 'Bitcoin Market Compass', 'Entry Strategy', 'Exit Strategy',
            'Entry', 'Stop Loss', 'Position Size', 'Risk per Trade', '3R', 'Target 1', 'Target 2', 'Target 3', 
            'Exit Date', 'Exit Price', 'Trade Result', 'R-Multiple Outcome', 'Estimated Profit at TP1', 
            'Comment Pre-Trade', 'Comment During Trade', 'Comment Post Trade'
        ];
        
        // Convert trades to CSV format
        const csvContent = [
            headers.join(','),
            ...trades.map(trade => [
                trade.entryDate,
                trade.altcoin,
                trade.bitcoinCompass,
                trade.entryStrategy,
                trade.exitStrategy,
                trade.entry,
                trade.stopLoss,
                trade.positionSize,
                trade.riskPerTrade,
                trade.threeR,
                trade.target1,
                trade.target2,
                trade.target3,
                trade.exitDate,
                trade.exitPrice,
                trade.tradeResult,
                trade.rMultipleOutcome,
                trade.estimatedProfit,
                `"${trade.commentPreTrade || ''}"`,
                `"${trade.commentDuringTrade || ''}"`,
                `"${trade.commentPostTrade || ''}"`
            ].join(','))
        ].join('\\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `trade-journal-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('CSV exported successfully!', 'success');
    });
    
    // Clear all trades
    clearAllTradesBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all trades? This action cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            renderTrades();
            showMessage('All trades cleared successfully!', 'success');
        }
    });
    
    // Initialize
    renderTrades();
    
    // Add form validation
    const requiredFields = tradeForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('invalid', function() {
            this.setCustomValidity('This field is required');
        });
        
        field.addEventListener('input', function() {
            this.setCustomValidity('');
        });
    });
    
    // Add number input validation
    const numberInputs = tradeForm.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.setCustomValidity('Please enter a positive number');
            } else {
                this.setCustomValidity('');
            }
        });
    });
    
    // Auto-resize textareas
    const textareas = tradeForm.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
});

// Note: Mobile navigation is handled by script.js