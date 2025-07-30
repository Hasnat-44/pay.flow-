// DOM Elements
const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordToggle = document.getElementById('passwordToggle');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const registerBtn = document.getElementById('registerBtn');
const successMessage = document.getElementById('successMessage');

// Password strength elements
const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordRequirements = document.getElementById('passwordRequirements');

// Error message elements
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[a-zA-Z\s]{2,50}$/;

// Form validation state
let isFormValid = false;

// Password toggle functionality
passwordToggle.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = passwordToggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

confirmPasswordToggle.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    
    const icon = confirmPasswordToggle.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

// Real-time validation
fullNameInput.addEventListener('input', () => {
    validateName();
    updateFormValidity();
});

emailInput.addEventListener('input', () => {
    validateEmail();
    updateFormValidity();
});

passwordInput.addEventListener('input', () => {
    validatePassword();
    checkPasswordStrength();
    updateFormValidity();
});

confirmPasswordInput.addEventListener('input', () => {
    validateConfirmPassword();
    updateFormValidity();
});

// Name validation
function validateName() {
    const name = fullNameInput.value.trim();
    
    if (!name) {
        showError(fullNameInput, nameError, 'Full name is required');
        return false;
    }
    
    if (!namePattern.test(name)) {
        showError(fullNameInput, nameError, 'Please enter a valid name (2-50 characters, letters only)');
        return false;
    }
    
    clearError(fullNameInput, nameError);
    return true;
}

// Email validation
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

// Password validation
function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        showError(passwordInput, passwordError, 'Password is required');
        hidePasswordStrength();
        return false;
    }
    
    if (password.length < 8) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters long');
        return false;
    }
    
    // Check password requirements
    const requirements = checkPasswordRequirements(password);
    const metRequirements = requirements.filter(req => req.met).length;
    
    if (metRequirements < 4) {
        showError(passwordInput, passwordError, 'Password does not meet all requirements');
        return false;
    }
    
    clearError(passwordInput, passwordError);
    return true;
}

// Confirm password validation
function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
        showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
        return false;
    }
    
    clearError(confirmPasswordInput, confirmPasswordError);
    return true;
}

// Password strength checker
function checkPasswordStrength() {
    const password = passwordInput.value;
    
    if (!password) {
        hidePasswordStrength();
        return;
    }
    
    let strength = 0;
    let strengthLevel = '';
    let strengthColor = '';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Determine strength level
    if (strength <= 2) {
        strengthLevel = 'Weak';
        strengthColor = '#ef4444';
    } else if (strength <= 4) {
        strengthLevel = 'Fair';
        strengthColor = '#f59e0b';
    } else if (strength <= 6) {
        strengthLevel = 'Good';
        strengthColor = '#3b82f6';
    } else {
        strengthLevel = 'Strong';
        strengthColor = '#10b981';
    }
    
    // Update strength indicator
    showPasswordStrength(strengthLevel, strengthColor);
    updatePasswordRequirements(password);
}

// Show password strength indicator
function showPasswordStrength(level, color) {
    passwordStrength.classList.add('show');
    strengthFill.className = `strength-fill ${level.toLowerCase()}`;
    strengthText.textContent = `Password strength: ${level}`;
    strengthText.style.color = color;
}

// Hide password strength indicator
function hidePasswordStrength() {
    passwordStrength.classList.remove('show');
    passwordRequirements.classList.remove('show');
}

// Check password requirements
function checkPasswordRequirements(password) {
    return [
        { type: 'length', met: password.length >= 8 },
        { type: 'uppercase', met: /[A-Z]/.test(password) },
        { type: 'lowercase', met: /[a-z]/.test(password) },
        { type: 'number', met: /[0-9]/.test(password) },
        { type: 'special', met: /[^A-Za-z0-9]/.test(password) }
    ];
}

// Update password requirements display
function updatePasswordRequirements(password) {
    const requirements = checkPasswordRequirements(password);
    
    requirements.forEach(req => {
        const requirementElement = document.querySelector(`[data-requirement="${req.type}"]`);
        if (requirementElement) {
            if (req.met) {
                requirementElement.classList.add('met');
            } else {
                requirementElement.classList.remove('met');
            }
        }
    });
    
    passwordRequirements.classList.add('show');
}

// Show error message
function showError(input, errorElement, message) {
    input.classList.add('error');
    input.classList.remove('valid');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear error message
function clearError(input, errorElement) {
    input.classList.remove('error');
    input.classList.add('valid');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Update form validity
function updateFormValidity() {
    const nameValid = validateName();
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    const confirmPasswordValid = validateConfirmPassword();
    const termsAccepted = document.getElementById('terms').checked;
    
    isFormValid = nameValid && emailValid && passwordValid && confirmPasswordValid && termsAccepted;
    registerBtn.disabled = !isFormValid;
}

// Terms checkbox validation
document.getElementById('terms').addEventListener('change', updateFormValidity);

// Show loading state
function showLoading() {
    registerBtn.classList.add('loading');
    registerBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    registerBtn.classList.remove('loading');
    registerBtn.disabled = !isFormValid;
}

// Show success message
function showSuccess() {
    successMessage.style.display = 'flex';
    setTimeout(() => {
        // Redirect to login page
        window.location.href = 'login.html';
    }, 2000);
}

// Show error message
function showErrorMessage(message) {
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
    
    registerForm.parentNode.insertBefore(errorDiv, registerForm.nextSibling);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Form submission handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid) {
        validateName();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Get form data
    const userData = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
        agreeToTerms: document.getElementById('terms').checked
    };
    
    try {
        // Use auth service for registration
        const result = await authService.register(userData);
        
        if (result.success) {
            // Show success message
            showSuccess();
            
        } else {
            // Handle specific error cases
            let errorMessage = result.error || 'Registration failed. Please try again.';
            
            if (errorMessage.includes('Email already exists')) {
                errorMessage = 'An account with this email already exists.';
            } else if (errorMessage.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (errorMessage.includes('Password too weak')) {
                errorMessage = 'Please choose a stronger password.';
            }
            
            showErrorMessage(errorMessage);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle network errors - use demo registration for testing
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('Network error - using demo registration for testing');
            const demoResult = await authService.demoRegister(userData);
            if (demoResult.success) {
                showSuccess();
                return;
            }
        }
        
        showErrorMessage('An error occurred during registration. Please try again.');
    } finally {
        hideLoading();
    }
});

// Demo registration function
async function demoRegister() {
    showLoading();
    
    try {
        const userData = {
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            agreeToTerms: document.getElementById('terms').checked
        };
        
        const result = await authService.demoRegister(userData);
        
        if (result.success) {
            showSuccess();
        } else {
            showErrorMessage('Demo registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Demo registration error:', error);
        showErrorMessage('Demo registration failed. Please try again.');
    } finally {
        hideLoading();
    }
}

// Auto-fill demo data
function fillDemoData() {
    fullNameInput.value = 'John Doe';
    emailInput.value = 'john.doe@example.com';
    passwordInput.value = 'SecurePass123!';
    confirmPasswordInput.value = 'SecurePass123!';
    document.getElementById('terms').checked = true;
    
    validateName();
    validateEmail();
    validatePassword();
    checkPasswordStrength();
    validateConfirmPassword();
    updateFormValidity();
}

// Add demo buttons for testing
const demoButton = document.createElement('button');
demoButton.type = 'button';
demoButton.textContent = 'Demo Register';
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

demoButton.addEventListener('click', demoRegister);
registerForm.appendChild(demoButton);

const demoDataButton = document.createElement('button');
demoDataButton.type = 'button';
demoDataButton.textContent = 'Fill Demo Data';
demoDataButton.className = 'demo-data-btn';
demoDataButton.style.cssText = `
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

demoDataButton.addEventListener('click', fillDemoData);
registerForm.appendChild(demoDataButton);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isFormValid) {
            registerForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        registerForm.reset();
        clearError(fullNameInput, nameError);
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);
        clearError(confirmPasswordInput, confirmPasswordError);
        hidePasswordStrength();
        updateFormValidity();
    }
});

// Focus management
fullNameInput.focus();

// Input focus effects
[fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Prevent form submission on Enter if form is invalid
registerForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isFormValid) {
        e.preventDefault();
        validateName();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
    }
});

// Add ripple effect to buttons
[registerBtn, demoButton, demoDataButton].forEach(button => {
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

console.log('Registration form initialized successfully!');
console.log('Demo data: John Doe / john.doe@example.com / SecurePass123!'); 