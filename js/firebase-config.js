// Firebase Configuration and Authentication
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Authentication state management
let currentUser = null;
let isMember = false;

// Check if user is a course member
async function checkMembership(email) {
    try {
        const memberDoc = await getDoc(doc(db, 'members', email));
        if (memberDoc.exists()) {
            const data = memberDoc.data();
            return data.isMember === true;
        }
        return false;
    } catch (error) {
        console.error('Error checking membership:', error);
        return false;
    }
}

// Update UI based on authentication state
function updateToolsAccess(isAuthenticated, isMemberStatus) {
    const tools = document.querySelectorAll('.tool-container');
    const authButton = document.getElementById('auth-button');
    const userInfo = document.getElementById('user-info');
    
    tools.forEach(tool => {
        const overlay = tool.querySelector('.tool-overlay');
        const toolContent = tool.querySelector('.tool-content');
        
        if (isAuthenticated && isMemberStatus) {
            // Unlock tools for members
            if (overlay) overlay.style.display = 'none';
            if (toolContent) {
                toolContent.style.filter = 'none';
                toolContent.style.pointerEvents = 'auto';
            }
        } else {
            // Lock tools for non-members or unauthenticated users
            if (overlay) overlay.style.display = 'flex';
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
            userInfo.textContent = `Welcome, ${currentUser.email}${isMemberStatus ? ' (Member)' : ' (Not a member)'}`;
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
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Create account with email and password
async function createAccountWithEmail(email, password) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        await signInWithPopup(auth, googleProvider);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout
async function logout() {
    try {
        await signOut(auth);
        currentUser = null;
        isMember = false;
        updateToolsAccess(false, false);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
}

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        isMember = await checkMembership(user.email);
        updateToolsAccess(true, isMember);
        hideLoginModal();
    } else {
        currentUser = null;
        isMember = false;
        updateToolsAccess(false, false);
    }
});

// Export functions for global use
window.PanicDropAuth = {
    signInWithEmail,
    createAccountWithEmail,
    signInWithGoogle,
    logout,
    showLoginModal,
    hideLoginModal,
    getCurrentUser: () => currentUser,
    getIsMember: () => isMember
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial state
    updateToolsAccess(false, false);
});