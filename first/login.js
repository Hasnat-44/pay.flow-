// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');
const loginBtn = document.getElementById('loginBtn');
const successMessage = document.getElementById('successMessage');

// Error message elements
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Form validation state
let isFormValid = false;

// Password toggle functionality
passwordToggle.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = passwordToggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// Real-time email validation
emailInput.addEventListener('input', () => {
    validateEmail();
    updateFormValidity();
});

// Real-time password validation
passwordInput.addEventListener('input', () => {
    validatePassword();
    updateFormValidity();
});

// Email validation function
function validateEmail() {
    const email = emailInput.value.trim();
    
    if (!email) {
        showError(emailInput, emailError, 'Email is required');
        return false;
    }
    
    if (!emailPattern.test(email)) {
        showError(emailInput, emailError, 'Please enter a valid email address');
        return false;
    }
    
    clearError(emailInput, emailError);
    return true;
}

// Password validation function
function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        showError(passwordInput, passwordError, 'Password is required');
        return false;
    }
    
    if (password.length < 8) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters long');
        return false;
    }
    
    if (!passwordPattern.test(password)) {
        showError(passwordInput, passwordError, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return false;
    }
    
    clearError(passwordInput, passwordError);
    return true;
}

// Show error message
function showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear error message
function clearError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Update form validity
function updateFormValidity() {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    isFormValid = emailValid && passwordValid;
    
    loginBtn.disabled = !isFormValid;
}

// Show loading state
function showLoading() {
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = !isFormValid;
}

// Show success message
function showSuccess() {
    successMessage.style.display = 'flex';
    setTimeout(() => {
        // Redirect to dashboard or home page
        window.location.href = '/dashboard.html'; // Change this to your desired redirect URL
    }, 2000);
}

// Show error message
function showErrorMessage(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #ef4444;
        color: white;
        padding: 1rem;
        border-radius: 12px;
        text-align: center;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    // Insert after the form
    loginForm.parentNode.insertBefore(errorDiv, loginForm.nextSibling);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Form submission handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid) {
        validateEmail();
        validatePassword();
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Get form data
    const credentials = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
        rememberMe: document.getElementById('remember').checked
    };
    
    try {
        // Use auth service for login
        const result = await authService.login(credentials);
        
        if (result.success) {
            // Store remember me preference
            if (credentials.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Show success message
            showSuccess();
            
        } else {
            // Handle specific error cases
            let errorMessage = result.error || 'Login failed. Please try again.';
            
            if (errorMessage.includes('Invalid credentials')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('User not found')) {
                errorMessage = 'No account found with this email address.';
            } else if (errorMessage.includes('Account locked')) {
                errorMessage = 'Your account has been temporarily locked. Please try again later.';
            }
            
            showErrorMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle network errors - use demo login for testing
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('Network error - using demo login for testing');
            const demoResult = await authService.demoLogin();
            if (demoResult.success) {
                showSuccess();
                return;
            }
        }
        
        showErrorMessage('An error occurred during login. Please try again.');
    } finally {
        hideLoading();
    }
});

// Demo login function (for testing without backend)
async function demoLogin() {
    showLoading();
    
    try {
        const result = await authService.demoLogin();
        
        if (result.success) {
            // Store remember me preference
            if (document.getElementById('remember').checked) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            showSuccess();
        } else {
            showErrorMessage('Demo login failed. Please try again.');
        }
    } catch (error) {
        console.error('Demo login error:', error);
        showErrorMessage('Demo login failed. Please try again.');
    } finally {
        hideLoading();
    }
}

// Auto-fill demo credentials (for testing)
function fillDemoCredentials() {
    emailInput.value = 'demo@payflow.com';
    passwordInput.value = 'DemoPass123';
    validateEmail();
    validatePassword();
    updateFormValidity();
}

// Add demo login button for testing (remove in production)
const demoButton = document.createElement('button');
demoButton.type = 'button';
demoButton.textContent = 'Demo Login';
demoButton.className = 'demo-btn';
demoButton.style.cssText = `
    width: 100%;
    padding: 0.75rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s ease;
`;

demoButton.addEventListener('click', demoLogin);
loginForm.appendChild(demoButton);

// Add demo credentials button
const demoCredsButton = document.createElement('button');
demoCredsButton.type = 'button';
demoCredsButton.textContent = 'Fill Demo Credentials';
demoCredsButton.className = 'demo-creds-btn';
demoCredsButton.style.cssText = `
    width: 100%;
    padding: 0.5rem;
    background: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: all 0.3s ease;
`;

demoCredsButton.addEventListener('click', fillDemoCredentials);
loginForm.appendChild(demoCredsButton);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isFormValid) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        loginForm.reset();
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);
        updateFormValidity();
    }
});

// Focus management
emailInput.focus();

// Auto-save email to localStorage
emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim()) {
        localStorage.setItem('lastEmail', emailInput.value.trim());
    }
});

// Auto-fill last used email
window.addEventListener('load', () => {
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail && !emailInput.value) {
        emailInput.value = lastEmail;
        validateEmail();
        updateFormValidity();
    }
});

// Input focus effects
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Prevent form submission on Enter if form is invalid
loginForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isFormValid) {
        e.preventDefault();
        validateEmail();
        validatePassword();
    }
});

// Add ripple effect to buttons
[loginBtn, demoButton, demoCredsButton].forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const rippleCSS = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

console.log('Login form initialized successfully!');
console.log('Demo credentials: demo@payflow.com / DemoPass123'); 