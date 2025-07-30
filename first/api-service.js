// API Service for PayFlow Dashboard
class PayFlowAPI {
    constructor() {
        this.baseURL = 'https://api.payflow.com/v1'; // Replace with your actual API base URL
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds cache
        this.refreshInterval = 30000; // 30 seconds refresh
        this.isRefreshing = false;
        
        // Initialize API service
        this.init();
    }

    // Initialize the API service
    init() {
        // Set up automatic token refresh
        this.setupTokenRefresh();
        
        // Set up periodic data refresh
        this.setupDataRefresh();
        
        console.log('PayFlow API Service initialized');
    }

    // Set up automatic token refresh
    setupTokenRefresh() {
        // Check token every 5 minutes
        setInterval(() => {
            this.refreshAuthToken();
        }, 300000);
    }

    // Set up periodic data refresh
    setupDataRefresh() {
        setInterval(() => {
            this.refreshDashboardData();
        }, this.refreshInterval);
    }

    // Get auth headers
    getAuthHeaders() {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    // Make API request with error handling
    async makeRequest(endpoint, options = {}) {
        // Check if demo API is available for testing
        if (window.demoAPI) {
            console.log('Using demo API for testing');
            return await window.demoAPI.makeRequest(endpoint, options);
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            // Handle specific error cases
            if (error.message.includes('401')) {
                this.handleAuthError();
            } else if (error.message.includes('403')) {
                this.handleForbiddenError();
            } else if (error.message.includes('429')) {
                this.handleRateLimitError();
            }
            
            return { success: false, error: error.message };
        }
    }

    // Handle authentication errors
    handleAuthError() {
        console.log('Authentication error - redirecting to login');
        authService.logout();
    }

    // Handle forbidden errors
    handleForbiddenError() {
        console.log('Access forbidden - insufficient permissions');
        this.showNotification('Access denied. Please contact support.', 'error');
    }

    // Handle rate limit errors
    handleRateLimitError() {
        console.log('Rate limit exceeded - slowing down requests');
        this.showNotification('Too many requests. Please wait a moment.', 'warning');
    }

    // Refresh authentication token
    async refreshAuthToken() {
        return await authService.refreshAuthToken();
    }

    // Get wallet balance
    async getWalletBalance() {
        const cacheKey = 'wallet_balance';
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const result = await this.makeRequest('/wallet/balance');
        
        if (result.success) {
            this.setCachedData(cacheKey, result.data);
            return result.data;
        }
        
        return null;
    }

    // Get transaction history
    async getTransactionHistory(limit = 20, offset = 0, filters = {}) {
        const cacheKey = `transactions_${limit}_${offset}_${JSON.stringify(filters)}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            ...filters
        });

        const result = await this.makeRequest(`/transactions?${queryParams}`);
        
        if (result.success) {
            this.setCachedData(cacheKey, result.data);
            return result.data;
        }
        
        return null;
    }

    // Get dashboard statistics
    async getDashboardStats() {
        const cacheKey = 'dashboard_stats';
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const result = await this.makeRequest('/dashboard/stats');
        
        if (result.success) {
            this.setCachedData(cacheKey, result.data);
            return result.data;
        }
        
        return null;
    }

    // Get recent activity
    async getRecentActivity(limit = 10) {
        const cacheKey = `recent_activity_${limit}`;
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const result = await this.makeRequest(`/activity/recent?limit=${limit}`);
        
        if (result.success) {
            this.setCachedData(cacheKey, result.data);
            return result.data;
        }
        
        return null;
    }

    // Send money
    async sendMoney(transferData) {
        const result = await this.makeRequest('/transfers/send', {
            method: 'POST',
            body: JSON.stringify(transferData)
        });

        if (result.success) {
            // Clear cache to force refresh
            this.clearCache();
            return result.data;
        }
        
        return null;
    }

    // Get user profile
    async getUserProfile() {
        const cacheKey = 'user_profile';
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const result = await this.makeRequest('/user/profile');
        
        if (result.success) {
            this.setCachedData(cacheKey, result.data);
            return result.data;
        }
        
        return null;
    }

    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Refresh all dashboard data
    async refreshDashboardData() {
        if (this.isRefreshing) {
            return; // Prevent multiple simultaneous refreshes
        }

        this.isRefreshing = true;
        
        try {
            // Refresh all data in parallel
            const [balance, transactions, stats, activity] = await Promise.allSettled([
                this.getWalletBalance(),
                this.getTransactionHistory(),
                this.getDashboardStats(),
                this.getRecentActivity()
            ]);

            // Update UI with new data
            this.updateDashboardUI({
                balance: balance.status === 'fulfilled' ? balance.value : null,
                transactions: transactions.status === 'fulfilled' ? transactions.value : null,
                stats: stats.status === 'fulfilled' ? stats.value : null,
                activity: activity.status === 'fulfilled' ? activity.value : null
            });

            console.log('Dashboard data refreshed successfully');
            
        } catch (error) {
            console.error('Failed to refresh dashboard data:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    // Update dashboard UI with new data
    updateDashboardUI(data) {
        // Update wallet balance
        if (data.balance) {
            this.updateWalletBalance(data.balance);
        }

        // Update transaction history
        if (data.transactions) {
            this.updateTransactionHistory(data.transactions);
        }

        // Update statistics
        if (data.stats) {
            this.updateStatistics(data.stats);
        }

        // Update recent activity
        if (data.activity) {
            this.updateRecentActivity(data.activity);
        }

        // Show refresh indicator
        this.showRefreshIndicator();
    }

    // Update wallet balance display
    updateWalletBalance(balanceData) {
        const balanceElement = document.querySelector('.stat-amount');
        if (balanceElement && balanceData.balance !== undefined) {
            const currentBalance = parseFloat(balanceElement.textContent.replace(/[^0-9.-]+/g, ''));
            const newBalance = balanceData.balance;
            
            // Animate balance change
            this.animateBalanceChange(currentBalance, newBalance, balanceElement);
        }
    }

    // Animate balance change
    animateBalanceChange(from, to, element) {
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = from + (to - from) * this.easeInOutQuad(progress);
            element.textContent = `$${current.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Easing function for smooth animation
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Update transaction history
    updateTransactionHistory(transactions) {
        const tableBody = document.getElementById('transactionsTableBody');
        if (tableBody && transactions.transactions) {
            // Clear existing rows
            tableBody.innerHTML = '';
            
            // Add new transaction rows
            transactions.transactions.forEach(transaction => {
                const row = this.createTransactionRow(transaction);
                tableBody.appendChild(row);
            });
        }
    }

    // Create transaction row
    createTransactionRow(transaction) {
        const row = document.createElement('tr');
        
        const isPositive = transaction.amount > 0;
        const amountClass = isPositive ? 'positive' : 'negative';
        const amountSign = isPositive ? '+' : '';
        
        row.innerHTML = `
            <td>
                <div class="transaction-info">
                    <div class="transaction-avatar">
                        ${this.getInitials(transaction.recipientName || transaction.recipientEmail)}
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.recipientName || transaction.recipientEmail}</h4>
                        <p>${transaction.description || 'Transaction'}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="transaction-type ${transaction.type}">
                    <i class="fas fa-${this.getTransactionIcon(transaction.type)}"></i>
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
            </td>
            <td>
                <span class="transaction-amount ${amountClass}">
                    ${amountSign}$${Math.abs(transaction.amount).toFixed(2)}
                </span>
            </td>
            <td>
                <span class="transaction-status ${transaction.status}">
                    <i class="fas fa-${this.getStatusIcon(transaction.status)}"></i>
                    ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
            </td>
            <td>
                <span class="transaction-date">${this.formatDate(transaction.createdAt)}</span>
            </td>
            <td>
                <div class="transaction-actions">
                    <button class="action-btn" onclick="viewTransaction('${transaction.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editTransaction('${transaction.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteTransaction('${transaction.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    // Get transaction icon
    getTransactionIcon(type) {
        const icons = {
            'income': 'arrow-up',
            'expense': 'arrow-down',
            'transfer': 'exchange-alt',
            'payment': 'credit-card',
            'refund': 'undo'
        };
        return icons[type] || 'exchange-alt';
    }

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            'completed': 'check',
            'pending': 'clock',
            'failed': 'times',
            'cancelled': 'ban'
        };
        return icons[status] || 'clock';
    }

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }

    // Format date
    formatDate(dateString) {
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

    // Update statistics
    updateStatistics(stats) {
        // Update income
        const incomeElement = document.querySelector('.stat-card:nth-child(2) .stat-amount');
        if (incomeElement && stats.totalIncome !== undefined) {
            incomeElement.textContent = `$${stats.totalIncome.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        }

        // Update expenses
        const expensesElement = document.querySelector('.stat-card:nth-child(3) .stat-amount');
        if (expensesElement && stats.totalExpenses !== undefined) {
            expensesElement.textContent = `$${stats.totalExpenses.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`;
        }

        // Update transaction count
        const transactionsElement = document.querySelector('.stat-card:nth-child(4) .stat-amount');
        if (transactionsElement && stats.transactionCount !== undefined) {
            transactionsElement.textContent = stats.transactionCount.toLocaleString();
        }
    }

    // Update recent activity
    updateRecentActivity(activity) {
        const activityList = document.querySelector('.activity-list');
        if (activityList && activity.activities) {
            activityList.innerHTML = '';
            
            activity.activities.forEach(item => {
                const activityItem = this.createActivityItem(item);
                activityList.appendChild(activityItem);
            });
        }
    }

    // Create activity item
    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        item.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${this.formatDate(activity.timestamp)}</span>
            </div>
            <div class="activity-amount ${activity.amount > 0 ? 'positive' : activity.amount < 0 ? 'negative' : 'neutral'}">
                ${activity.amount > 0 ? '+' : ''}${activity.amount ? `$${activity.amount.toFixed(2)}` : '-'}
            </div>
        `;
        
        return item;
    }

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            'payment': 'check',
            'transfer': 'exchange-alt',
            'card_added': 'credit-card',
            'login': 'sign-in-alt',
            'logout': 'sign-out-alt'
        };
        return icons[type] || 'info';
    }

    // Show refresh indicator
    showRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = `
            <i class="fas fa-sync-alt fa-spin"></i>
            <span>Data updated</span>
        `;
        indicator.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(indicator);
            }, 300);
        }, 2000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
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
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // Manual refresh
    async manualRefresh() {
        this.showNotification('Refreshing data...', 'info');
        await this.refreshDashboardData();
        this.showNotification('Data refreshed successfully!', 'success');
    }

    // Get API status
    async getAPIStatus() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Initialize API service
const payflowAPI = new PayFlowAPI();

// Export for use in other files
window.PayFlowAPI = PayFlowAPI;
window.payflowAPI = payflowAPI; 