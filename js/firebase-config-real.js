// Firebase Configuration - Analytics Only
// Authentication removed - all tools are now freely accessible

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

console.log('🔥 Loading Firebase Configuration for Analytics...');

// Firebase configuration - for analytics only
const firebaseConfig = {
    apiKey: "AIzaSyCVEHZMqM1qiyFxrnA0nOtNSZH_tuCVcMQ",
    authDomain: "altcoinprofittoolkit.firebaseapp.com",
    projectId: "altcoinprofittoolkit",
    storageBucket: "altcoinprofittoolkit.firebasestorage.app",
    messagingSenderId: "149868892734",
    appId: "1:149868892734:web:472de9d46c7a5f8362f76f",
    measurementId: "G-34Q90ZPHNT"
};

// Initialize Firebase for analytics
let app, analytics;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log('✅ Firebase analytics initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// Initialize on page load - unlock all tools by default
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, unlocking all tools...');
    unlockAllTools();
});

// Unlock all tools function
function unlockAllTools() {
    console.log('🔓 Tools unlocked - all tools are now freely accessible');
    
    const tools = document.querySelectorAll('.tool-container');
    tools.forEach(tool => {
        const overlay = tool.querySelector('.tool-overlay');
        const toolContent = tool.querySelector('.tool-content');
        
        // Remove any overlays or locks
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (toolContent) {
            toolContent.style.filter = 'none';
            toolContent.style.pointerEvents = 'auto';
        }
    });

    // Hide any auth UI elements that might still exist
    hideAuthElements();
}

// Hide authentication UI elements
function hideAuthElements() {
    const authButton = document.getElementById('auth-button');
    const userInfo = document.getElementById('user-info');
    const loginModal = document.getElementById('login-modal');
    
    if (authButton) {
        authButton.style.display = 'none';
    }
    if (userInfo) {
        userInfo.style.display = 'none';
    }
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

// Export simplified functions for any remaining references
window.PanicDropAuth = {
    getCurrentUser: () => null,
    getIsMember: () => true  // Always return true since tools are free
};

console.log('🎉 All tools are now freely accessible - no authentication required!');