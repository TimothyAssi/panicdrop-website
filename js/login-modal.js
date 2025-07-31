// Login Modal Management
document.addEventListener('DOMContentLoaded', () => {
    // Create login modal HTML
    const modalHTML = `
        <div id="login-modal" class="auth-modal" style="display: none;">
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>Sign In to Access Tools</h2>
                    <button class="auth-modal-close" onclick="hideLoginModal()">&times;</button>
                </div>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="showAuthTab('signin')">Sign In</button>
                    <button class="auth-tab" onclick="showAuthTab('signup')">Create Account</button>
                </div>
                
                <div id="signin-tab" class="auth-tab-content active">
                    <form id="signin-form" class="auth-form">
                        <div class="auth-form-group">
                            <label for="signin-email">Email</label>
                            <input type="email" id="signin-email" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signin-password">Password</label>
                            <input type="password" id="signin-password" required>
                        </div>
                        <button type="submit" class="auth-button primary">Sign In</button>
                        <div id="signin-error" class="auth-error"></div>
                    </form>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <button id="google-signin" class="auth-button google">
                        <i class="fab fa-google"></i>
                        Sign in with Google
                    </button>
                </div>
                
                <div id="signup-tab" class="auth-tab-content">
                    <form id="signup-form" class="auth-form">
                        <div class="auth-form-group">
                            <label for="signup-email">Email</label>
                            <input type="email" id="signup-email" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signup-password">Password (min 6 characters)</label>
                            <input type="password" id="signup-password" minlength="6" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="signup-confirm">Confirm Password</label>
                            <input type="password" id="signup-confirm" minlength="6" required>
                        </div>
                        <button type="submit" class="auth-button primary">Create Account</button>
                        <div id="signup-error" class="auth-error"></div>
                    </form>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <button id="google-signup" class="auth-button google">
                        <i class="fab fa-google"></i>
                        Sign up with Google
                    </button>
                </div>
                
                <div class="auth-modal-footer">
                    <p><strong>Note:</strong> Tools are available only for course members. <a href="course.html">Get course access</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Insert modal into body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners
    setupAuthEventListeners();
});

// Show/hide auth tabs
function showAuthTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Use proper string interpolation
    const activeTab = document.querySelector(`[onclick="showAuthTab('${tabName}')"]`);
    const activeContent = document.getElementById(`${tabName}-tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // Clear any error messages
    document.querySelectorAll('.auth-error').forEach(error => error.textContent = '');
}

// Show login modal
function showLoginModal() {
    console.log('Opening login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Login modal opened');
    } else {
        console.error('Login modal not found!');
    }
}

// Hide login modal
function hideLoginModal() {
    console.log('Closing login modal...');
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Login modal closed');
    }
}

// Set up event listeners for auth forms
function setupAuthEventListeners() {
    console.log('Setting up authentication event listeners...');
    
    // Sign in form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Sign in form submitted');
            
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            const errorElement = document.getElementById('signin-error');
            
            console.log('Attempting to sign in with email:', email);
            errorElement.textContent = '';
            
            try {
                if (window.PanicDropAuth && window.PanicDropAuth.signInWithEmail) {
                    const result = await window.PanicDropAuth.signInWithEmail(email, password);
                    if (!result.success) {
                        console.error('Sign in failed:', result.error);
                        errorElement.textContent = result.error;
                    } else {
                        console.log('Sign in successful!');
                    }
                } else {
                    console.error('PanicDropAuth not available');
                    errorElement.textContent = 'Authentication system not ready. Please refresh the page.';
                }
            } catch (error) {
                console.error('Sign in error:', error);
                errorElement.textContent = 'Sign in failed. Please try again.';
            }
        });
    }
    
    // Sign up form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Sign up form submitted');
            
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            const errorElement = document.getElementById('signup-error');
            
            console.log('Attempting to create account with email:', email);
            errorElement.textContent = '';
            
            if (password !== confirm) {
                errorElement.textContent = 'Passwords do not match';
                return;
            }
            
            try {
                if (window.PanicDropAuth && window.PanicDropAuth.createAccountWithEmail) {
                    const result = await window.PanicDropAuth.createAccountWithEmail(email, password);
                    if (!result.success) {
                        console.error('Sign up failed:', result.error);
                        errorElement.textContent = result.error;
                    } else {
                        console.log('Account created successfully!');
                    }
                } else {
                    console.error('PanicDropAuth not available');
                    errorElement.textContent = 'Authentication system not ready. Please refresh the page.';
                }
            } catch (error) {
                console.error('Sign up error:', error);
                errorElement.textContent = 'Account creation failed. Please try again.';
            }
        });
    }
    
    // Google sign in buttons
    const googleSigninBtn = document.getElementById('google-signin');
    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', async () => {
            console.log('Google sign in clicked');
            
            try {
                if (window.PanicDropAuth && window.PanicDropAuth.signInWithGoogle) {
                    const result = await window.PanicDropAuth.signInWithGoogle();
                    if (!result.success) {
                        console.error('Google sign in failed:', result.error);
                        document.getElementById('signin-error').textContent = result.error;
                    } else {
                        console.log('Google sign in successful!');
                    }
                } else {
                    console.error('PanicDropAuth not available');
                    document.getElementById('signin-error').textContent = 'Authentication system not ready. Please refresh the page.';
                }
            } catch (error) {
                console.error('Google sign in error:', error);
                document.getElementById('signin-error').textContent = 'Google sign in failed. Please try again.';
            }
        });
    }
    
    const googleSignupBtn = document.getElementById('google-signup');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', async () => {
            console.log('Google sign up clicked');
            
            try {
                if (window.PanicDropAuth && window.PanicDropAuth.signInWithGoogle) {
                    const result = await window.PanicDropAuth.signInWithGoogle();
                    if (!result.success) {
                        console.error('Google sign up failed:', result.error);
                        document.getElementById('signup-error').textContent = result.error;
                    } else {
                        console.log('Google sign up successful!');
                    }
                } else {
                    console.error('PanicDropAuth not available');
                    document.getElementById('signup-error').textContent = 'Authentication system not ready. Please refresh the page.';
                }
            } catch (error) {
                console.error('Google sign up error:', error);
                document.getElementById('signup-error').textContent = 'Google sign up failed. Please try again.';
            }
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                hideLoginModal();
            }
        });
    }
    
    console.log('Authentication event listeners set up successfully');
}

// Make functions globally available
window.showAuthTab = showAuthTab;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;