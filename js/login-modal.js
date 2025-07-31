// Login Modal Management
document.addEventListener('DOMContentLoaded', () => {
    // Create login modal HTML
    const modalHTML = `
        <div id="login-modal" class="auth-modal" style="display: none;">
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>Sign In to Access Tools</h2>
                    <button class="auth-modal-close" onclick="PanicDropAuth.hideLoginModal()">&times;</button>
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
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(\`[onclick="showAuthTab('\${tabName}')"]\`).classList.add('active');
    document.getElementById(\`\${tabName}-tab\`).classList.add('active');
    
    // Clear any error messages
    document.querySelectorAll('.auth-error').forEach(error => error.textContent = '');
}

// Set up event listeners for auth forms
function setupAuthEventListeners() {
    // Sign in form
    document.getElementById('signin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const errorElement = document.getElementById('signin-error');
        
        errorElement.textContent = '';
        
        const result = await PanicDropAuth.signInWithEmail(email, password);
        if (!result.success) {
            errorElement.textContent = result.error;
        }
    });
    
    // Sign up form
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const errorElement = document.getElementById('signup-error');
        
        errorElement.textContent = '';
        
        if (password !== confirm) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }
        
        const result = await PanicDropAuth.createAccountWithEmail(email, password);
        if (!result.success) {
            errorElement.textContent = result.error;
        }
    });
    
    // Google sign in buttons
    document.getElementById('google-signin').addEventListener('click', async () => {
        const result = await PanicDropAuth.signInWithGoogle();
        if (!result.success) {
            document.getElementById('signin-error').textContent = result.error;
        }
    });
    
    document.getElementById('google-signup').addEventListener('click', async () => {
        const result = await PanicDropAuth.signInWithGoogle();
        if (!result.success) {
            document.getElementById('signup-error').textContent = result.error;
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('login-modal').addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            PanicDropAuth.hideLoginModal();
        }
    });
}

// Make showAuthTab global
window.showAuthTab = showAuthTab;