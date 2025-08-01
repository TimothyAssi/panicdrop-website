// DEMO AUTHENTICATION BLOCKED - THIS FILE SHOULD NOT BE LOADED
console.error('🚨🚨🚨 DEMO FILE DETECTED - AUTHENTICATION SYSTEM ERROR!');
console.error('🚨 The demo authentication file is still being served by Netlify cache!');
console.error('🚨 This means Netlify is serving an old cached version!');

// Immediately throw error to break demo functionality
throw new Error('DEMO AUTHENTICATION BLOCKED - NETLIFY CACHE ISSUE');

// If somehow this doesn't throw, block all functionality
window.PanicDropAuth = {
    signInWithEmail: () => ({ success: false, error: 'DEMO BLOCKED - NETLIFY CACHE ISSUE' }),
    createAccountWithEmail: () => ({ success: false, error: 'DEMO BLOCKED - NETLIFY CACHE ISSUE' }),
    signInWithGoogle: () => ({ success: false, error: 'DEMO BLOCKED - NETLIFY CACHE ISSUE' }),
    logout: () => ({ success: true }),
    showLoginModal: () => console.error('DEMO BLOCKED'),
    hideLoginModal: () => console.error('DEMO BLOCKED'),
    getCurrentUser: () => null,
    getIsMember: () => false
};

console.error('🚨 IF YOU SEE THIS, NETLIFY IS SERVING CACHED FILES!');