// DOM Elements
const sendMoneyForm = document.getElementById('sendMoneyForm');
const recipientEmail = document.getElementById('recipientEmail');
const recipientNameInput = document.getElementById('recipientNameInput');
const amount = document.getElementById('amount');
const message = document.getElementById('message');
const sendButton = document.getElementById('sendButton');
const searchRecipientBtn = document.getElementById('searchRecipient');

// Error message elements
const emailError = document.getElementById('emailError');
const nameError = document.getElementById('nameError');
const amountError = document.getElementById('amountError');

// Info display elements
const recipientInfo = document.getElementById('recipientInfo');
const recipientName = document.getElementById('recipientName');
const recipientEmailDisplay = document.getElementById('recipientEmailDisplay');
const charCount = document.getElementById('charCount');
const feeAmount = document.getElementById('feeAmount');
const totalAmount = document.getElementById('totalAmount');

// Summary elements
const summaryRecipient = document.getElementById('summaryRecipient');
const summaryAmount = document.getElementById('summaryAmount');
const summaryFee = document.getElementById('summaryFee');
const summaryTotal = document.getElementById('summaryTotal');

// Modal elements
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[a-zA-Z\s]{2,50}$/;

// Form validation state
let isFormValid = false;

// Transfer fee calculation (2.9% + $0.30 for card payments, free for wallet)
const TRANSFER_FEE_RATE = 0.029;
const TRANSFER_FEE_FIXED = 0.30;

// Available balance
const AVAILABLE_BALANCE = 24567.89;

// Sample recipient data for demo
const sampleRecipients = {
    'sarah@example.com': { name: 'Sarah Johnson', verified: true },
    'mike@example.com': { name: 'Mike Wilson', verified: true },
    'emily@example.com': { name: 'Emily Davis', verified: true },
    'john@example.com': { name: 'John Smith', verified: true },
    'lisa@example.com': { name: 'Lisa Brown', verified: true }
};

// Real-time email validation
recipientEmail.addEventListener('input', () => {
    validateEmail();
    updateFormValidity();
    updateSummary();
});

// Real-time name validation
recipientNameInput.addEventListener('input', () => {
    validateName();
    updateFormValidity();
    updateSummary();
});

// Real-time amount validation and calculations
amount.addEventListener('input', () => {
    validateAmount();
    calculateFees();
    updateSummary();
    updateFormValidity();
});

// Real-time message character count
message.addEventListener('input', () => {
    updateCharCount();
    updateSummary();
});

// Payment method change
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        calculateFees();
        updateSummary();
    });
});

// Search recipient functionality
searchRecipientBtn.addEventListener('click', () => {
    searchRecipient();
});

// Email validation function
function validateEmail() {
    const email = recipientEmail.value.trim();
    
    if (!email) {
        showError(recipientEmail, emailError, 'Recipient email is required');
        hideRecipientInfo();
        return false;
    }
    
    if (!emailPattern.test(email)) {
        showError(recipientEmail, emailError, 'Please enter a valid email address');
        hideRecipientInfo();
        return false;
    }
    
    // Check if recipient exists in our system
    if (sampleRecipients[email]) {
        showRecipientInfo(sampleRecipients[email]);
        clearError(recipientEmail, emailError);
    } else {
        showRecipientInfo({ name: 'New Recipient', verified: false });
        clearError(recipientEmail, emailError);
    }
    
    return true;
}

// Name validation function
function validateName() {
    const name = recipientNameInput.value.trim();
    
    if (name && !namePattern.test(name)) {
        showError(recipientNameInput, nameError, 'Please enter a valid name (2-50 characters, letters only)');
        return false;
    }
    
    clearError(recipientNameInput, nameError);
    return true;
}

// Amount validation function
function validateAmount() {
    const amountValue = parseFloat(amount.value);
    
    if (!amount.value) {
        showError(amount, amountError, 'Amount is required');
        return false;
    }
    
    if (isNaN(amountValue) || amountValue <= 0) {
        showError(amount, amountError, 'Please enter a valid amount greater than 0');
        return false;
    }
    
    if (amountValue < 1) {
        showError(amount, amountError, 'Minimum transfer amount is $1.00');
        return false;
    }
    
    if (amountValue > 10000) {
        showError(amount, amountError, 'Maximum transfer amount is $10,000');
        return false;
    }
    
    // Check if user has sufficient balance
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const totalWithFees = calculateTotalWithFees(amountValue, selectedMethod);
    
    if (selectedMethod === 'wallet' && totalWithFees > AVAILABLE_BALANCE) {
        showError(amount, amountError, `Insufficient balance. Available: $${AVAILABLE_BALANCE.toFixed(2)}`);
        return false;
    }
    
    clearError(amount, amountError);
    return true;
}

// Calculate transfer fees
function calculateFees() {
    const amountValue = parseFloat(amount.value) || 0;
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    let fee = 0;
    
    if (selectedMethod === 'card') {
        fee = (amountValue * TRANSFER_FEE_RATE) + TRANSFER_FEE_FIXED;
    }
    
    feeAmount.textContent = `$${fee.toFixed(2)}`;
    totalAmount.textContent = `$${(amountValue + fee).toFixed(2)}`;
}

// Calculate total with fees
function calculateTotalWithFees(amount, method) {
    if (method === 'card') {
        return amount + (amount * TRANSFER_FEE_RATE) + TRANSFER_FEE_FIXED;
    }
    return amount;
}

// Update character count
function updateCharCount() {
    const count = message.value.length;
    charCount.textContent = count;
    
    if (count > 180) {
        charCount.style.color = '#ef4444';
    } else if (count > 150) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#64748b';
    }
}

// Show recipient info
function showRecipientInfo(recipient) {
    recipientName.textContent = recipient.name;
    recipientEmailDisplay.textContent = recipientEmail.value.trim();
    
    if (recipient.verified) {
        recipientInfo.style.display = 'flex';
        recipientInfo.style.borderColor = '#10b981';
        recipientInfo.style.background = '#f0fdf4';
    } else {
        recipientInfo.style.display = 'flex';
        recipientInfo.style.borderColor = '#f59e0b';
        recipientInfo.style.background = '#fffbeb';
    }
}

// Hide recipient info
function hideRecipientInfo() {
    recipientInfo.style.display = 'none';
}

// Search recipient
function searchRecipient() {
    const email = recipientEmail.value.trim();
    
    if (!email) {
        showNotification('Please enter an email address to search', 'error');
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        if (sampleRecipients[email]) {
            showRecipientInfo(sampleRecipients[email]);
            showNotification(`Found recipient: ${sampleRecipients[email].name}`, 'success');
        } else {
            showRecipientInfo({ name: 'New Recipient', verified: false });
            showNotification('Recipient not found in our system', 'info');
        }
    }, 1000);
}

// Update form validity
function updateFormValidity() {
    const emailValid = validateEmail();
    const nameValid = validateName();
    const amountValid = validateAmount();
    const confirmChecked = document.getElementById('confirmTransfer').checked;
    
    isFormValid = emailValid && nameValid && amountValid && confirmChecked;
    sendButton.disabled = !isFormValid;
}

// Update summary
function updateSummary() {
    const email = recipientEmail.value.trim();
    const name = recipientNameInput.value.trim();
    const amountValue = parseFloat(amount.value) || 0;
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const fee = selectedMethod === 'card' ? (amountValue * TRANSFER_FEE_RATE) + TRANSFER_FEE_FIXED : 0;
    const total = amountValue + fee;
    
    // Update recipient summary
    if (email) {
        if (name) {
            summaryRecipient.textContent = `${name} (${email})`;
        } else if (sampleRecipients[email]) {
            summaryRecipient.textContent = `${sampleRecipients[email].name} (${email})`;
        } else {
            summaryRecipient.textContent = email;
        }
    } else {
        summaryRecipient.textContent = 'Not specified';
    }
    
    // Update amount summary
    summaryAmount.textContent = `$${amountValue.toFixed(2)}`;
    summaryFee.textContent = `$${fee.toFixed(2)}`;
    summaryTotal.textContent = `$${total.toFixed(2)}`;
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

// Show loading state
function showLoading() {
    sendButton.classList.add('loading');
    sendButton.disabled = true;
}

// Hide loading state
function hideLoading() {
    sendButton.classList.remove('loading');
    sendButton.disabled = !isFormValid;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Show success modal
function showSuccessModal(transactionData) {
    document.getElementById('transactionId').textContent = transactionData.transactionId;
    document.getElementById('modalRecipient').textContent = transactionData.recipient;
    document.getElementById('modalAmount').textContent = transactionData.amount;
    document.getElementById('modalDate').textContent = transactionData.date;
    
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Show error modal
function showErrorModal(message) {
    errorMessage.textContent = message;
    errorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    successModal.classList.remove('active');
    errorModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Form submission handler
sendMoneyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid) {
        validateEmail();
        validateName();
        validateAmount();
        showNotification('Please fix the errors and try again', 'error');
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Get form data
    const formData = {
        recipientEmail: recipientEmail.value.trim(),
        recipientName: recipientNameInput.value.trim(),
        amount: parseFloat(amount.value),
        message: message.value.trim(),
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        saveRecipient: document.getElementById('saveRecipient').checked
    };
    
    try {
        // Simulate API call with fetch
        const response = await fetch('/api/send-money', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (response.ok) {
            const data = await response.json();
            
            // Show success modal
            showSuccessModal({
                transactionId: data.transactionId || 'TXN' + Date.now(),
                recipient: formData.recipientName || formData.recipientEmail,
                amount: `$${formData.amount.toFixed(2)}`,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            });
            
            // Save recipient if requested
            if (formData.saveRecipient) {
                localStorage.setItem('savedRecipients', JSON.stringify([
                    ...JSON.parse(localStorage.getItem('savedRecipients') || '[]'),
                    { email: formData.recipientEmail, name: formData.recipientName }
                ]));
            }
            
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Transfer failed');
        }
        
    } catch (error) {
        console.error('Transfer error:', error);
        
        let errorMessage = 'An error occurred while processing your transfer. Please try again.';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            // Network error - simulate successful transfer for demo
            console.log('Network error - simulating successful transfer for demo purposes');
            showSuccessModal({
                transactionId: 'TXN' + Date.now(),
                recipient: formData.recipientName || formData.recipientEmail,
                amount: `$${formData.amount.toFixed(2)}`,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            });
            return;
        }
        
        if (error.message.includes('Insufficient funds')) {
            errorMessage = 'Insufficient funds in your account.';
        } else if (error.message.includes('Invalid recipient')) {
            errorMessage = 'The recipient email address is invalid or not registered.';
        } else if (error.message.includes('Transfer limit exceeded')) {
            errorMessage = 'Transfer amount exceeds your daily limit.';
        }
        
        showErrorModal(errorMessage);
    } finally {
        hideLoading();
    }
});

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        sendMoneyForm.reset();
        clearError(recipientEmail, emailError);
        clearError(recipientNameInput, nameError);
        clearError(amount, amountError);
        hideRecipientInfo();
        updateCharCount();
        calculateFees();
        updateSummary();
        updateFormValidity();
        showNotification('Form has been reset', 'info');
    }
}

// Fill demo data
function fillDemoData() {
    recipientEmail.value = 'sarah@example.com';
    recipientNameInput.value = 'Sarah Johnson';
    amount.value = '150.00';
    message.value = 'Payment for freelance work - Thank you!';
    document.getElementById('confirmTransfer').checked = true;
    
    validateEmail();
    validateName();
    validateAmount();
    updateCharCount();
    calculateFees();
    updateSummary();
    updateFormValidity();
    
    showNotification('Demo data filled successfully!', 'success');
}

// Show recent recipients
function showRecentRecipients() {
    const savedRecipients = JSON.parse(localStorage.getItem('savedRecipients') || '[]');
    
    if (savedRecipients.length === 0) {
        showNotification('No saved recipients found', 'info');
        return;
    }
    
    let message = 'Recent recipients:\n';
    savedRecipients.forEach(recipient => {
        message += `• ${recipient.name} (${recipient.email})\n`;
    });
    
    alert(message);
}

// Show transfer limits
function showTransferLimits() {
    const limits = `
Transfer Limits:
• Daily Limit: $10,000
• Monthly Limit: $50,000
• Minimum Transfer: $1.00
• Maximum Transfer: $10,000 per transaction

Fees:
• PayFlow Wallet: Free
• Credit/Debit Card: 2.9% + $0.30
    `;
    
    alert(limits);
}

// Modal actions
function sendAnother() {
    closeModal();
    resetForm();
}

function retryTransfer() {
    closeModal();
    // Form data is still there, just retry submission
    sendMoneyForm.dispatchEvent(new Event('submit'));
}

// Confirm transfer checkbox
document.getElementById('confirmTransfer').addEventListener('change', updateFormValidity);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isFormValid) {
            sendMoneyForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Click outside modal to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
});

// Initialize form
function initForm() {
    // Check authentication
    if (!authService.isUserAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info in UI
    updateUserInfo();
    
    // Set up logout functionality
    setupLogout();
    
    updateCharCount();
    calculateFees();
    updateSummary();
    updateFormValidity();
    
    // Focus on email input
    recipientEmail.focus();
    
    console.log('Send money form initialized successfully!');
    console.log('Demo recipient: sarah@example.com');
}

// Update user information in the UI
function updateUserInfo() {
    const user = authService.getCurrentUser();
    if (user) {
        // Update user name in navigation
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.name;
        });
        
        // Update user avatar
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        userAvatarElements.forEach(element => {
            element.src = user.avatar;
            element.alt = user.name;
        });
    }
}

// Set up logout functionality
function setupLogout() {
    // Add logout event listeners
    const logoutButtons = document.querySelectorAll('.logout-btn, .nav-link[href="index.html"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initForm);

// Add ripple effect to buttons
document.querySelectorAll('.btn, .quick-action-btn').forEach(button => {
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