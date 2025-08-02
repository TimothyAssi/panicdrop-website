// Firebase Configuration and Authentication - REAL VERSION
// This uses actual Firebase with your Google account
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// import { firebaseEnvConfig } from './firebase-config-env.js'; // Not used - using hardcoded key

console.log('🔥 Loading REAL Firebase Configuration - DEMO SHOULD BE GONE...');
console.log('🚨 If you see member@example.com user, there is a bug!');

// Firebase configuration - SECURE CREDENTIALS FOR PRODUCTION
const firebaseConfig = {
    apiKey: "AIzaSyCVEHZMqM1qiyFxrnA0nOtNSZH_tuCVcMQ", // TEMP: Direct key for deployment
    authDomain: "altcoinprofittoolkit.firebaseapp.com",
    projectId: "altcoinprofittoolkit",
    storageBucket: "altcoinprofittoolkit.firebasestorage.app",
    messagingSenderId: "149868892734",
    appId: "1:149868892734:web:472de9d46c7a5f8362f76f",
    measurementId: "G-34Q90ZPHNT"
};

// Initialize Firebase
let app, auth, db, googleProvider;
let currentUser = null;
let isMember = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('✅ Firebase initialized successfully with REAL production credentials');
    console.log('🔥 Project: altcoinprofittoolkit');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('Please check your Firebase project settings and credentials.');
    
    // Prevent any authentication functionality when Firebase fails
    auth = null;
    db = null;
    googleProvider = null;
}

// Check if user is a course member
async function checkMembership(email) {
    console.log('🔍 Checking membership for:', email);
    
    try {
        const memberDoc = await getDoc(doc(db, 'members', email));
        if (memberDoc.exists()) {
            const data = memberDoc.data();
            const isMemberResult = data.isMember === true;
            console.log('✅ Membership check result:', isMemberResult);
            return isMemberResult;
        }
        console.log('❌ No membership record found for:', email);
        return false;
    } catch (error) {
        console.error('❌ Error checking membership:', error);
        return false;
    }
}

// Update UI based on authentication state
function updateToolsAccess(isAuthenticated, isMemberStatus) {
    console.log('🔄 Updating tools access - Auth:', isAuthenticated, 'Member:', isMemberStatus);
    
    const tools = document.querySelectorAll('.tool-container');
    const authButton = document.getElementById('auth-button');
    const userInfo = document.getElementById('user-info');
    
    tools.forEach(tool => {
        const overlay = tool.querySelector('.tool-overlay');
        const toolContent = tool.querySelector('.tool-content');
        
        if (isAuthenticated && isMemberStatus) {
            // Unlock tools for members
            if (overlay) {
                overlay.style.display = 'none';
                console.log('🔓 Tools unlocked');
            }
            if (toolContent) {
                toolContent.style.filter = 'none';
                toolContent.style.pointerEvents = 'auto';
            }
        } else {
            // Lock tools for non-members or unauthenticated users
            if (overlay) {
                overlay.style.display = 'flex';
                console.log('🔒 Tools locked');
            }
            if (toolContent) {
                toolContent.style.filter = 'blur(3px)';
                toolContent.style.pointerEvents = 'none';
            }
        }
    });
    
    // Update auth button and user info
    if (isAuthenticated) {
        if (authButton) {
            authButton.textContent = 'Logout';
            authButton.onclick = logout;
        }
        if (userInfo) {
            const displayName = currentUser.displayName || currentUser.email;
            userInfo.textContent = `Welcome, ${displayName}${isMemberStatus ? ' (Member)' : ' (Not a member)'}`;
            userInfo.style.display = 'block';
        }
    } else {
        if (authButton) {
            authButton.textContent = 'Sign In';
            authButton.onclick = showLoginModal;
        }
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    console.log('📧 Attempting email sign in for:', email);
    
    if (!auth) {
        return { success: false, error: 'Firebase not initialized. Please set up your Firebase configuration.' };
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Email sign in successful');
        return { success: true };
    } catch (error) {
        console.error('❌ Email sign in failed:', error);
        return { success: false, error: error.message };
    }
}

// Create account with email and password
async function createAccountWithEmail(email, password) {
    console.log('👤 Creating account for:', email);
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Account created successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Account creation failed:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    console.log('🔑 Attempting Google sign in...');
    
    if (!auth || !googleProvider) {
        return { success: false, error: 'Firebase not initialized. Please set up your Firebase configuration.' };
    }
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('✅ Google sign in successful for:', user.email);
        console.log('👤 User info:', {
            email: user.email,
            name: user.displayName,
            photo: user.photoURL
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Google sign in failed:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup blocked. Please allow popups for this site.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Logout
async function logout() {
    console.log('🚪 Logging out...');
    
    try {
        // Try Firebase signOut if auth is available
        if (auth) {
            await signOut(auth);
        }
        
        // Always clear our local state
        currentUser = null;
        isMember = false;
        
        // Clear any localStorage/sessionStorage that might contain cached auth
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
                    localStorage.removeItem(key);
                    console.log('🧹 Cleared cached key:', key);
                }
            });
        } catch (e) {
            console.log('Note: Could not clear localStorage');
        }
        
        // Update UI to logged-out state
        updateToolsAccess(false, false);
        console.log('✅ Logout successful - user should see Sign In button now');
        return { success: true };
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Even if Firebase logout fails, clear our local state
        currentUser = null;
        isMember = false;
        updateToolsAccess(false, false);
        return { success: false, error: error.message };
    }
}

// Show login modal
function showLoginModal() {
    console.log('🔓 Opening login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Login modal opened');
    } else {
        console.error('❌ Login modal not found!');
    }
}

// Hide login modal
function hideLoginModal() {
    console.log('🔒 Closing login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('✅ Login modal closed');
    }
}

// Auth state observer
if (auth) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('🎯 User signed in:', user.email);
            currentUser = user;
            isMember = await checkMembership(user.email);
            updateToolsAccess(true, isMember);
            hideLoginModal();
            
            if (isMember) {
                console.log('🎉 Welcome back, course member!');
            } else {
                console.log('ℹ️ User signed in but not a course member');
            }
        } else {
            console.log('👋 User signed out');
            currentUser = null;
            isMember = false;
            updateToolsAccess(false, false);
        }
    });
}

// Export functions for global use
window.PanicDropAuth = {
    signInWithEmail,
    createAccountWithEmail,
    signInWithGoogle,
    logout,
    showLoginModal,
    hideLoginModal,
    getCurrentUser: () => {
        if (currentUser && currentUser.email === 'member@example.com') {
            console.error('🚨 CRITICAL BUG: Demo user detected in real config!');
            console.error('🚨 This should NEVER happen - demo user found:', currentUser);
            console.trace('🚨 Stack trace of demo user detection');
        }
        return currentUser;
    },
    getIsMember: () => isMember
};

// Also make showLoginModal directly available for onclick handlers
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;

console.log('🔥 REAL Firebase PanicDropAuth initialized');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, setting up initial state');
    
    // Check for any cached authentication data that shouldn't be there
    const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase') || key.includes('auth') || key.includes('user')
    );
    
    if (cacheKeys.length > 0) {
        console.log('🚨 Found cached auth data that needs clearing:', cacheKeys);
        cacheKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🧹 Cleared cached authentication data');
    }
    
    // Check if somehow a demo user got set (this should never happen)
    if (currentUser && currentUser.email === 'member@example.com') {
        console.error('🚨 Demo user detected on page load - clearing it');
        currentUser = null;
        isMember = false;
    }
    
    // Set up initial state (locked until user signs in)
    updateToolsAccess(false, false);
    console.log('🔒 Initial state set - tools locked until authentication');
    console.log('🔘 Sign In button should be visible now');
});