// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const refreshTransactionsBtn = document.getElementById('refreshTransactions');
const filterTransactionsBtn = document.getElementById('filterTransactions');
const transactionsTableBody = document.getElementById('transactionsTableBody');

// API Service
let payflowAPI;

// Sample transaction data
const transactions = [
    {
        id: 1,
        name: 'Sarah Johnson',
        type: 'income',
        amount: 150.00,
        status: 'completed',
        date: '2024-01-15T10:30:00',
        description: 'Payment received for freelance work'
    },
    {
        id: 2,
        name: 'Netflix Subscription',
        type: 'expense',
        amount: -15.99,
        status: 'pending',
        date: '2024-01-15T09:15:00',
        description: 'Monthly subscription payment'
    },
    {
        id: 3,
        name: 'Savings Account',
        type: 'transfer',
        amount: -500.00,
        status: 'completed',
        date: '2024-01-14T16:45:00',
        description: 'Transfer to savings account'
    },
    {
        id: 4,
        name: 'Mike Wilson',
        type: 'income',
        amount: 75.50,
        status: 'completed',
        date: '2024-01-14T14:20:00',
        description: 'Reimbursement for lunch'
    },
    {
        id: 5,
        name: 'Amazon Purchase',
        type: 'expense',
        amount: -89.99,
        status: 'completed',
        date: '2024-01-14T11:30:00',
        description: 'Electronics purchase'
    },
    {
        id: 6,
        name: 'Emily Davis',
        type: 'income',
        amount: 200.00,
        status: 'completed',
        date: '2024-01-13T15:10:00',
        description: 'Consultation fee'
    },
    {
        id: 7,
        name: 'Gas Station',
        type: 'expense',
        amount: -45.75,
        status: 'completed',
        date: '2024-01-13T08:45:00',
        description: 'Fuel purchase'
    },
    {
        id: 8,
        name: 'Checking Account',
        type: 'transfer',
        amount: 1000.00,
        status: 'completed',
        date: '2024-01-12T12:00:00',
        description: 'Transfer from savings'
    }
];

// Mobile menu functionality
mobileMenuToggle.addEventListener('click', () => {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

mobileMenuClose.addEventListener('click', () => {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Math.abs(amount));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
}

// Create transaction row
function createTransactionRow(transaction) {
    const row = document.createElement('tr');
    
    const isPositive = transaction.amount > 0;
    const amountClass = isPositive ? 'positive' : 'negative';
    const amountSign = isPositive ? '+' : '';
    
    row.innerHTML = `
        <td>
            <div class="transaction-info">
                <div class="transaction-avatar">
                    ${getInitials(transaction.name)}
                </div>
                <div class="transaction-details">
                    <h4>${transaction.name}</h4>
                    <p>${transaction.description}</p>
                </div>
            </div>
        </td>
        <td>
            <span class="transaction-type ${transaction.type}">
                <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : transaction.type === 'expense' ? 'arrow-down' : 'exchange-alt'}"></i>
                ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </span>
        </td>
        <td>
            <span class="transaction-amount ${amountClass}">
                ${amountSign}${formatCurrency(transaction.amount)}
            </span>
        </td>
        <td>
            <span class="transaction-status ${transaction.status}">
                <i class="fas fa-${transaction.status === 'completed' ? 'check' : transaction.status === 'pending' ? 'clock' : 'times'}"></i>
                ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
        </td>
        <td>
            <span class="transaction-date">${formatDate(transaction.date)}</span>
        </td>
        <td>
            <div class="transaction-actions">
                <button class="action-btn" onclick="viewTransaction(${transaction.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editTransaction(${transaction.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="deleteTransaction(${transaction.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Populate transactions table
function populateTransactionsTable(transactionsToShow = transactions) {
    transactionsTableBody.innerHTML = '';
    
    transactionsToShow.forEach(transaction => {
        const row = createTransactionRow(transaction);
        transactionsTableBody.appendChild(row);
    });
}

// Refresh transactions
async function refreshTransactions() {
    const refreshBtn = refreshTransactionsBtn.querySelector('i');
    refreshBtn.classList.add('loading');
    
    try {
        if (payflowAPI) {
            // Use API service
            await payflowAPI.manualRefresh();
        } else {
            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add a new transaction for demo
            const newTransaction = {
                id: transactions.length + 1,
                name: 'Demo Transaction',
                type: 'income',
                amount: 25.00,
                status: 'completed',
                date: new Date().toISOString(),
                description: 'Demo transaction added'
            };
            
            transactions.unshift(newTransaction);
            populateTransactionsTable();
            
            // Show notification
            showNotification('Transactions refreshed successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to refresh transactions:', error);
        showNotification('Failed to refresh transactions', 'error');
    } finally {
        refreshBtn.classList.remove('loading');
    }
}

// Filter transactions
function filterTransactions() {
    const filterOptions = ['all', 'income', 'expense', 'transfer'];
    const currentFilter = filterTransactionsBtn.getAttribute('data-filter') || 'all';
    const currentIndex = filterOptions.indexOf(currentFilter);
    const nextFilter = filterOptions[(currentIndex + 1) % filterOptions.length];
    
    filterTransactionsBtn.setAttribute('data-filter', nextFilter);
    
    let filteredTransactions = transactions;
    
    if (nextFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === nextFilter);
    }
    
    populateTransactionsTable(filteredTransactions);
    
    // Update filter button text
    const filterIcon = filterTransactionsBtn.querySelector('i');
    filterIcon.className = `fas fa-${nextFilter === 'all' ? 'filter' : nextFilter === 'income' ? 'arrow-up' : nextFilter === 'expense' ? 'arrow-down' : 'exchange-alt'}`;
    
    showNotification(`Filtered by: ${nextFilter.charAt(0).toUpperCase() + nextFilter.slice(1)}`, 'info');
}

// Transaction actions
function viewTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        showNotification(`Viewing transaction: ${transaction.name}`, 'info');
        // Here you would typically open a modal with transaction details
    }
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        showNotification(`Editing transaction: ${transaction.name}`, 'info');
        // Here you would typically open an edit form
    }
}

function deleteTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        if (confirm(`Are you sure you want to delete the transaction "${transaction.name}"?`)) {
            const index = transactions.findIndex(t => t.id === id);
            transactions.splice(index, 1);
            populateTransactionsTable();
            showNotification(`Transaction "${transaction.name}" deleted successfully!`, 'success');
        }
    }
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listeners
refreshTransactionsBtn.addEventListener('click', refreshTransactions);
filterTransactionsBtn.addEventListener('click', filterTransactions);

// Quick action buttons
document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.querySelector('span').textContent;
        showNotification(`${action} feature coming soon!`, 'info');
    });
});

// Animate stats on scroll
function animateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    statCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Update wallet balance with animation
function updateWalletBalance() {
    const balanceElement = document.querySelector('.stat-amount');
    const currentBalance = parseFloat(balanceElement.textContent.replace(/[^0-9.-]+/g, ''));
    const targetBalance = 24678.89; // Target balance
    
    let current = currentBalance;
    const increment = (targetBalance - currentBalance) / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetBalance) || (increment < 0 && current <= targetBalance)) {
            current = targetBalance;
            clearInterval(timer);
        }
        balanceElement.textContent = `$${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, 50);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshTransactions();
    }
    
    // Ctrl/Cmd + F to filter
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        filterTransactions();
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Initialize dashboard
async function initDashboard() {
    // Check authentication
    if (!authService.isUserAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info in UI
    updateUserInfo();
    
    // Initialize API service
    await initializeAPIService();
    
    // Load initial data
    await loadDashboardData();
    
    // Set up animations
    animateStats();
    
    // Set up logout functionality
    setupLogout();
    
    console.log('Dashboard initialized successfully!');
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
    
    // Add logout to mobile menu
    const mobileLogoutLink = document.querySelector('.mobile-nav-link[href="index.html"]');
    if (mobileLogoutLink) {
        mobileLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }
}

// Initialize API service
async function initializeAPIService() {
    try {
        // Check if API service is available
        if (typeof PayFlowAPI !== 'undefined') {
            payflowAPI = new PayFlowAPI();
            console.log('API service initialized');
        } else {
            console.log('API service not available, using demo data');
            payflowAPI = null;
        }
    } catch (error) {
        console.error('Failed to initialize API service:', error);
        payflowAPI = null;
    }
}

// Load dashboard data
async function loadDashboardData() {
    if (payflowAPI) {
        try {
            // Load data from API
            await payflowAPI.refreshDashboardData();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Fallback to demo data
            populateTransactionsTable();
        }
    } else {
        // Use demo data
        populateTransactionsTable();
    }
}

// Auto-refresh transactions every 5 minutes
setInterval(() => {
    // Simulate new transactions
    const shouldAddTransaction = Math.random() > 0.7; // 30% chance
    
    if (shouldAddTransaction) {
        const newTransaction = {
            id: Date.now(),
            name: 'Auto Transaction',
            type: Math.random() > 0.5 ? 'income' : 'expense',
            amount: Math.random() > 0.5 ? Math.random() * 100 : -Math.random() * 50,
            status: 'completed',
            date: new Date().toISOString(),
            description: 'Automated transaction'
        };
        
        transactions.unshift(newTransaction);
        populateTransactionsTable();
    }
}, 300000); // 5 minutes

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Add ripple effect to buttons
document.querySelectorAll('.btn, .btn-icon, .action-btn, .quick-action-btn').forEach(button => {
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