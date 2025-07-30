// Authentication Service for PayFlow
class AuthService {
    constructor() {
        this.tokenKey = 'payflow_auth_token';
        this.refreshTokenKey = 'payflow_refresh_token';
        this.userKey = 'payflow_user_data';
        this.tokenExpiryKey = 'payflow_token_expiry';
        this.isAuthenticated = false;
        this.user = null;
        this.tokenRefreshTimer = null;
        
        // Initialize auth service
        this.init();
    }

    // Initialize authentication service
    init() {
        // Check for existing token on page load
        this.checkExistingAuth();
        
        // Set up token refresh monitoring
        this.setupTokenRefresh();
        
        // Set up request interceptor for automatic token attachment
        this.setupRequestInterceptor();
        
        console.log('Auth Service initialized');
    }

    // Check for existing authentication
    checkExistingAuth() {
        const token = this.getToken();
        const refreshToken = this.getRefreshToken();
        
        if (token && refreshToken) {
            // Check if token is still valid
            if (this.isTokenValid(token)) {
                this.isAuthenticated = true;
                this.user = this.getUserData();
                this.setupTokenRefresh();
                console.log('Existing authentication found and valid');
                return true;
            } else {
                // Token expired, try to refresh
                this.refreshAuthToken();
            }
        }
        
        return false;
    }

    // Login user
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Store tokens and user data
            this.setToken(data.accessToken);
            this.setRefreshToken(data.refreshToken);
            this.setUserData(data.user);
            this.setTokenExpiry(data.expiresIn);
            
            this.isAuthenticated = true;
            this.user = data.user;
            
            // Set up token refresh
            this.setupTokenRefresh();
            
            console.log('Login successful');
            return { success: true, user: data.user };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Store tokens and user data
            this.setToken(data.accessToken);
            this.setRefreshToken(data.refreshToken);
            this.setUserData(data.user);
            this.setTokenExpiry(data.expiresIn);
            
            this.isAuthenticated = true;
            this.user = data.user;
            
            // Set up token refresh
            this.setupTokenRefresh();
            
            console.log('Registration successful');
            return { success: true, user: data.user };
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout user
    logout() {
        // Clear all stored data
        this.clearAuthData();
        
        // Clear refresh timer
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
            this.tokenRefreshTimer = null;
        }
        
        this.isAuthenticated = false;
        this.user = null;
        
        // Redirect to login page
        window.location.href = 'login.html';
        
        console.log('Logout successful');
    }

    // Refresh authentication token
    async refreshAuthToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            this.logout();
            return false;
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            
            // Update tokens
            this.setToken(data.accessToken);
            this.setRefreshToken(data.refreshToken);
            this.setTokenExpiry(data.expiresIn);
            
            // Set up next refresh
            this.setupTokenRefresh();
            
            console.log('Token refreshed successfully');
            return true;
            
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    // Set up automatic token refresh
    setupTokenRefresh() {
        // Clear existing timer
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }

        const token = this.getToken();
        if (!token) return;

        // Calculate when to refresh (5 minutes before expiry)
        const expiryTime = this.getTokenExpiry();
        const currentTime = Date.now();
        const refreshTime = expiryTime - currentTime - (5 * 60 * 1000); // 5 minutes before expiry

        if (refreshTime > 0) {
            this.tokenRefreshTimer = setTimeout(() => {
                this.refreshAuthToken();
            }, refreshTime);
        } else {
            // Token is already expired or close to expiry, refresh immediately
            this.refreshAuthToken();
        }
    }

    // Set up request interceptor for automatic token attachment
    setupRequestInterceptor() {
        // Override fetch to automatically add auth headers
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Add auth headers if user is authenticated
            if (this.isAuthenticated && this.getToken()) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${this.getToken()}`,
                    'X-Requested-With': 'XMLHttpRequest'
                };
            }

            try {
                const response = await originalFetch(url, options);
                
                // Handle 401 responses (unauthorized)
                if (response.status === 401) {
                    // Try to refresh token
                    const refreshSuccess = await this.refreshAuthToken();
                    
                    if (refreshSuccess) {
                        // Retry the original request with new token
                        options.headers = {
                            ...options.headers,
                            'Authorization': `Bearer ${this.getToken()}`,
                            'X-Requested-With': 'XMLHttpRequest'
                        };
                        return await originalFetch(url, options);
                    } else {
                        // Refresh failed, logout user
                        this.logout();
                        throw new Error('Authentication failed');
                    }
                }
                
                return response;
                
            } catch (error) {
                console.error('Request error:', error);
                throw error;
            }
        };
    }

    // Check if token is valid
    isTokenValid(token) {
        if (!token) return false;
        
        try {
            // Decode JWT token (without verification for client-side expiry check)
            const payload = this.decodeToken(token);
            
            if (!payload) return false;
            
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
            
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Decode JWT token
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }

    // Get token from localStorage
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Set token in localStorage
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    // Get refresh token from localStorage
    getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    // Set refresh token in localStorage
    setRefreshToken(refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    // Get user data from localStorage
    getUserData() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Set user data in localStorage
    setUserData(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Get token expiry time
    getTokenExpiry() {
        const expiry = localStorage.getItem(this.tokenExpiryKey);
        return expiry ? parseInt(expiry) : 0;
    }

    // Set token expiry time
    setTokenExpiry(expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    }

    // Clear all authentication data
    clearAuthData() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenExpiryKey);
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated && this.getToken() && this.isTokenValid(this.getToken());
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Update user data
    updateUserData(userData) {
        this.user = { ...this.user, ...userData };
        this.setUserData(this.user);
    }

    // Handle authentication errors
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        if (error.status === 401) {
            // Unauthorized - try to refresh token
            this.refreshAuthToken();
        } else if (error.status === 403) {
            // Forbidden - logout user
            this.logout();
        }
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            errors: {
                length: password.length < minLength,
                uppercase: !hasUpperCase,
                lowercase: !hasLowerCase,
                numbers: !hasNumbers,
                special: !hasSpecialChar
            }
        };
    }

    // Demo login for testing (remove in production)
    async demoLogin() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoUser = {
            id: 'user_001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://via.placeholder.com/40x40/2563eb/ffffff?text=JD'
        };
        
        const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.demo';
        const demoRefreshToken = 'refresh_token_demo';
        
        // Store demo data
        this.setToken(demoToken);
        this.setRefreshToken(demoRefreshToken);
        this.setUserData(demoUser);
        this.setTokenExpiry(3600); // 1 hour
        
        this.isAuthenticated = true;
        this.user = demoUser;
        
        this.setupTokenRefresh();
        
        console.log('Demo login successful');
        return { success: true, user: demoUser };
    }

    // Demo registration for testing (remove in production)
    async demoRegister(userData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const demoUser = {
            id: 'user_' + Date.now(),
            name: userData.fullName,
            email: userData.email,
            avatar: `https://via.placeholder.com/40x40/2563eb/ffffff?text=${userData.fullName.split(' ').map(n => n[0]).join('')}`
        };
        
        const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.demo';
        const demoRefreshToken = 'refresh_token_demo';
        
        // Store demo data
        this.setToken(demoToken);
        this.setRefreshToken(demoRefreshToken);
        this.setUserData(demoUser);
        this.setTokenExpiry(3600); // 1 hour
        
        this.isAuthenticated = true;
        this.user = demoUser;
        
        this.setupTokenRefresh();
        
        console.log('Demo registration successful');
        return { success: true, user: demoUser };
    }
}

// Initialize auth service
const authService = new AuthService();

// Export for use in other files
window.AuthService = AuthService;
window.authService = authService;

console.log('Auth Service loaded'); 