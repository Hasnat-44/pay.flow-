// Demo API Service for PayFlow Dashboard
// This simulates real API responses for testing purposes

class DemoAPI {
    constructor() {
        this.baseURL = 'https://api.payflow.com/v1';
        this.demoData = this.generateDemoData();
        this.requestDelay = 800; // Simulate network delay
    }

    // Generate demo data
    generateDemoData() {
        return {
            wallet: {
                balance: 24567.89,
                currency: 'USD',
                lastUpdated: new Date().toISOString()
            },
            transactions: [
                {
                    id: 'txn_001',
                    type: 'income',
                    amount: 150.00,
                    status: 'completed',
                    recipientName: 'Sarah Johnson',
                    recipientEmail: 'sarah@example.com',
                    description: 'Payment received for freelance work',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_002',
                    type: 'expense',
                    amount: -15.99,
                    status: 'pending',
                    recipientName: 'Netflix Subscription',
                    recipientEmail: 'billing@netflix.com',
                    description: 'Monthly subscription payment',
                    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_003',
                    type: 'transfer',
                    amount: -500.00,
                    status: 'completed',
                    recipientName: 'Savings Account',
                    recipientEmail: 'savings@bank.com',
                    description: 'Transfer to savings account',
                    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_004',
                    type: 'income',
                    amount: 75.50,
                    status: 'completed',
                    recipientName: 'Mike Wilson',
                    recipientEmail: 'mike@example.com',
                    description: 'Reimbursement for lunch',
                    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_005',
                    type: 'expense',
                    amount: -89.99,
                    status: 'completed',
                    recipientName: 'Amazon Purchase',
                    recipientEmail: 'orders@amazon.com',
                    description: 'Electronics purchase',
                    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_006',
                    type: 'income',
                    amount: 200.00,
                    status: 'completed',
                    recipientName: 'Emily Davis',
                    recipientEmail: 'emily@example.com',
                    description: 'Consultation fee',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_007',
                    type: 'expense',
                    amount: -45.75,
                    status: 'completed',
                    recipientName: 'Gas Station',
                    recipientEmail: 'gas@station.com',
                    description: 'Fuel purchase',
                    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'txn_008',
                    type: 'transfer',
                    amount: 1000.00,
                    status: 'completed',
                    recipientName: 'Checking Account',
                    recipientEmail: 'checking@bank.com',
                    description: 'Transfer from savings',
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                }
            ],
            stats: {
                totalIncome: 45230.00,
                totalExpenses: 20662.11,
                transactionCount: 1247,
                monthlyGrowth: 12.5,
                expenseGrowth: -3.1,
                transactionGrowth: 15.3
            },
            activity: [
                {
                    id: 'act_001',
                    type: 'payment',
                    title: 'Payment Received',
                    description: 'From: Sarah Johnson',
                    amount: 150.00,
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'act_002',
                    type: 'transfer',
                    title: 'Payment Pending',
                    description: 'To: Netflix Subscription',
                    amount: -15.99,
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'act_003',
                    type: 'transfer',
                    title: 'Transfer Completed',
                    description: 'To: Savings Account',
                    amount: -500.00,
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'act_004',
                    type: 'card_added',
                    title: 'Card Added',
                    description: 'Visa ending in 1234',
                    amount: null,
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            user: {
                id: 'user_001',
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar: 'https://via.placeholder.com/40x40/2563eb/ffffff?text=JD',
                lastLogin: new Date().toISOString()
            }
        };
    }

    // Simulate API request
    async makeRequest(endpoint, options = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));

        // Simulate random network errors (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Network error - please try again');
        }

        // Route to appropriate handler
        switch (endpoint) {
            case '/wallet/balance':
                return this.getWalletBalance();
            case '/transactions':
                return this.getTransactions(options);
            case '/dashboard/stats':
                return this.getDashboardStats();
            case '/activity/recent':
                return this.getRecentActivity(options);
            case '/user/profile':
                return this.getUserProfile();
            case '/transfers/send':
                return this.sendMoney(options.body);
            case '/health':
                return this.getHealthStatus();
            default:
                throw new Error('Endpoint not found');
        }
    }

    // Get wallet balance
    async getWalletBalance() {
        // Simulate balance fluctuation
        const fluctuation = (Math.random() - 0.5) * 100; // ±$50
        this.demoData.wallet.balance += fluctuation;
        this.demoData.wallet.lastUpdated = new Date().toISOString();

        return {
            success: true,
            data: {
                balance: this.demoData.wallet.balance,
                currency: this.demoData.wallet.currency,
                lastUpdated: this.demoData.wallet.lastUpdated
            }
        };
    }

    // Get transactions
    async getTransactions(options = {}) {
        const { limit = 20, offset = 0, type, status } = options;
        
        let filteredTransactions = [...this.demoData.transactions];

        // Apply filters
        if (type) {
            filteredTransactions = filteredTransactions.filter(t => t.type === type);
        }
        if (status) {
            filteredTransactions = filteredTransactions.filter(t => t.status === status);
        }

        // Apply pagination
        const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

        return {
            success: true,
            data: {
                transactions: paginatedTransactions,
                total: filteredTransactions.length,
                limit,
                offset,
                hasMore: offset + limit < filteredTransactions.length
            }
        };
    }

    // Get dashboard stats
    async getDashboardStats() {
        // Simulate stats fluctuation
        const incomeFluctuation = (Math.random() - 0.5) * 1000; // ±$500
        const expenseFluctuation = (Math.random() - 0.5) * 500; // ±$250
        const transactionFluctuation = Math.floor((Math.random() - 0.5) * 10); // ±5

        this.demoData.stats.totalIncome += incomeFluctuation;
        this.demoData.stats.totalExpenses += expenseFluctuation;
        this.demoData.stats.transactionCount += transactionFluctuation;

        return {
            success: true,
            data: this.demoData.stats
        };
    }

    // Get recent activity
    async getRecentActivity(options = {}) {
        const { limit = 10 } = options;
        
        return {
            success: true,
            data: {
                activities: this.demoData.activity.slice(0, limit)
            }
        };
    }

    // Get user profile
    async getUserProfile() {
        return {
            success: true,
            data: this.demoData.user
        };
    }

    // Send money
    async sendMoney(transferData) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create new transaction
        const newTransaction = {
            id: `txn_${Date.now()}`,
            type: 'transfer',
            amount: -transferData.amount,
            status: 'completed',
            recipientName: transferData.recipientName || transferData.recipientEmail,
            recipientEmail: transferData.recipientEmail,
            description: transferData.message || 'Money transfer',
            createdAt: new Date().toISOString()
        };

        // Add to transactions list
        this.demoData.transactions.unshift(newTransaction);

        // Update wallet balance
        this.demoData.wallet.balance -= transferData.amount;

        // Add to activity
        const newActivity = {
            id: `act_${Date.now()}`,
            type: 'transfer',
            title: 'Money Sent',
            description: `To: ${transferData.recipientName || transferData.recipientEmail}`,
            amount: -transferData.amount,
            timestamp: new Date().toISOString()
        };
        this.demoData.activity.unshift(newActivity);

        return {
            success: true,
            data: {
                transactionId: newTransaction.id,
                status: 'completed',
                message: 'Transfer completed successfully'
            }
        };
    }

    // Get health status
    async getHealthStatus() {
        return {
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };
    }

    // Add random transaction (for demo purposes)
    addRandomTransaction() {
        const types = ['income', 'expense', 'transfer'];
        const statuses = ['completed', 'pending', 'failed'];
        const names = ['Alice Smith', 'Bob Johnson', 'Carol Davis', 'David Wilson', 'Eve Brown'];
        const descriptions = [
            'Payment for services',
            'Subscription renewal',
            'Transfer between accounts',
            'Refund processed',
            'Monthly payment'
        ];

        const randomTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: types[Math.floor(Math.random() * types.length)],
            amount: Math.random() > 0.5 ? 
                (Math.random() * 500 + 10) : 
                -(Math.random() * 200 + 5),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            recipientName: names[Math.floor(Math.random() * names.length)],
            recipientEmail: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '.')}@example.com`,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            createdAt: new Date().toISOString()
        };

        this.demoData.transactions.unshift(randomTransaction);

        // Update wallet balance if completed
        if (randomTransaction.status === 'completed') {
            this.demoData.wallet.balance += randomTransaction.amount;
        }

        return randomTransaction;
    }

    // Update demo data periodically
    startDataSimulation() {
        setInterval(() => {
            // 30% chance to add a new transaction
            if (Math.random() < 0.3) {
                this.addRandomTransaction();
                console.log('Demo: New transaction added');
            }

            // Update wallet balance slightly
            const fluctuation = (Math.random() - 0.5) * 50; // ±$25
            this.demoData.wallet.balance += fluctuation;
        }, 30000); // Every 30 seconds
    }
}

// Initialize demo API
const demoAPI = new DemoAPI();

// Start data simulation
demoAPI.startDataSimulation();

// Export for use
window.DemoAPI = DemoAPI;
window.demoAPI = demoAPI;

console.log('Demo API Service initialized'); 