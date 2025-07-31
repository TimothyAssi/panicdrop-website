// Firebase Configuration and Authentication - DEMO VERSION
// This is a demo version that simulates authentication without requiring Firebase setup
// Replace with firebase-config.js after setting up your Firebase project

console.log('Loading Firebase Demo Configuration...');

// Demo authentication state management
let currentUser = null;
let isMember = false;

// Simulate checking membership
async function checkMembership(email) {
    console.log('Demo: Checking membership for:', email);
    
    // Demo: Simulate some emails as members
    const demoMembers = [
        'member@example.com',
        'test@panicdrop.com',
        'demo@member.com'
    ];
    
    const isDemo = demoMembers.includes(email.toLowerCase());
    console.log('Demo: User is member:', isDemo);
    return isDemo;
}

// Update UI based on authentication state
function updateToolsAccess(isAuthenticated, isMemberStatus) {
    console.log('Demo: Updating tools access - Auth:', isAuthenticated, 'Member:', isMemberStatus);
    
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
                console.log('Demo: Tool unlocked');
            }
            if (toolContent) {
                toolContent.style.filter = 'none';
                toolContent.style.pointerEvents = 'auto';
            }
        } else {
            // Lock tools for non-members or unauthenticated users
            if (overlay) {
                overlay.style.display = 'flex';
                console.log('Demo: Tool locked');
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

// Demo sign in with email and password
async function signInWithEmail(email, password) {
    console.log('Demo: Sign in attempt with email:', email);
    
    try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo: Simple validation
        if (email && password && password.length >= 6) {
            currentUser = { email: email };
            isMember = await checkMembership(email);
            updateToolsAccess(true, isMember);
            hideLoginModal();
            console.log('Demo: Sign in successful');
            return { success: true };
        } else {
            throw new Error('Invalid email or password (min 6 characters)');
        }
    } catch (error) {
        console.error('Demo: Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Demo create account with email and password
async function createAccountWithEmail(email, password) {
    console.log('Demo: Create account attempt with email:', email);
    
    try {
        // Simulate account creation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo: Simple validation
        if (email && password && password.length >= 6) {
            currentUser = { email: email };
            isMember = await checkMembership(email);
            updateToolsAccess(true, isMember);
            hideLoginModal();
            console.log('Demo: Account created successfully');
            return { success: true };
        } else {
            throw new Error('Invalid email or password (min 6 characters)');
        }
    } catch (error) {
        console.error('Demo: Create account error:', error);
        return { success: false, error: error.message };
    }
}

// Demo sign in with Google
async function signInWithGoogle() {
    console.log('Demo: Google sign in attempt');
    
    try {
        // Show user that something is happening
        const buttons = document.querySelectorAll('#google-signin, #google-signup');
        buttons.forEach(btn => {
            btn.textContent = 'Signing in...';
            btn.disabled = true;
        });
        
        // Simulate Google auth delay (shorter for better UX)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Demo: Simulate successful Google auth with a member email
        const demoGoogleUser = 'member@example.com'; // This is in our demo members list
        currentUser = { email: demoGoogleUser };
        isMember = await checkMembership(demoGoogleUser);
        updateToolsAccess(true, isMember);
        hideLoginModal();
        
        console.log('Demo: Google sign in successful for:', demoGoogleUser);
        console.log('Demo: User is member:', isMember);
        
        return { success: true };
    } catch (error) {
        console.error('Demo: Google sign in error:', error);
        return { success: false, error: error.message };
    } finally {
        // Restore button states
        const buttons = document.querySelectorAll('#google-signin, #google-signup');
        buttons.forEach(btn => {
            btn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
            btn.disabled = false;
        });
    }
}

// Logout
async function logout() {
    console.log('Demo: Logout attempt');
    
    try {
        currentUser = null;
        isMember = false;
        updateToolsAccess(false, false);
        console.log('Demo: Logout successful');
        return { success: true };
    } catch (error) {
        console.error('Demo: Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Show login modal
function showLoginModal() {
    console.log('Demo: Opening login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Demo: Login modal opened');
    } else {
        console.error('Demo: Login modal not found!');
    }
}

// Hide login modal
function hideLoginModal() {
    console.log('Demo: Closing login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Demo: Login modal closed');
    }
}

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

// Also make showLoginModal directly available for onclick handlers
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;

console.log('Demo: PanicDropAuth initialized:', window.PanicDropAuth);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Demo: DOM loaded, setting up initial state');
    // Set up initial state (locked)
    updateToolsAccess(false, false);
    console.log('Demo: Initial state set - tools locked');
});