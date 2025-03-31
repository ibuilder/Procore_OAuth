/**
 * Procore OAuth Client - Authentication Module
 * 
 * Handles OAuth authentication flow with Procore API
 */

// Token data storage
let tokenData = JSON.parse(localStorage.getItem('procoreTokens'));

// Generic API request function with token validation
async function apiRequest(endpoint, options = {}) {
    if (!tokenData?.accessToken) {
        showError('No access token available');
        return null;
    }

    // Check if token has expired
    if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        await refreshAccessToken();
        if (!tokenData?.accessToken) {
            return null;
        }
    }

    const loadingSection = document.getElementById('loading-section');
    loadingSection.classList.remove('hidden');

    try {
        const url = `${getBaseUrl()}${endpoint}`;
        const requestOptions = {
            headers: {
                'Authorization': `Bearer ${tokenData.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                await refreshAccessToken();
                // Retry the request
                return apiRequest(endpoint, options);
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        showError(`API error: ${error.message}`);
        return null;
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code) {
    const loadingSection = document.getElementById('loading-section');
    const loginSection = document.getElementById('login-section');
    
    loadingSection.classList.remove('hidden');
    loginSection.classList.add('hidden');

    try {
        const tokenUrl = `${getBaseUrl()}/oauth/token`;
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                client_id: oauthConfig.clientId,
                client_secret: oauthConfig.clientSecret,
                redirect_uri: oauthConfig.redirectUri
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || 'Failed to obtain access token');
        }

        // Store tokens
        tokenData = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + (data.expires_in * 1000)
        };
        localStorage.setItem('procoreTokens', JSON.stringify(tokenData));

        // Show token section
        displayToken();
    } catch (error) {
        showError(`Authentication error: ${error.message}`);
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Refresh access token
async function refreshAccessToken() {
    if (!tokenData?.refreshToken) {
        showError('No refresh token available');
        return;
    }

    const loadingSection = document.getElementById('loading-section');
    const tokenSection = document.getElementById('token-section');
    const dataSection = document.getElementById('data-section');
    
    loadingSection.classList.remove('hidden');
    tokenSection.classList.add('hidden');
    dataSection.classList.add('hidden');

    try {
        const tokenUrl = `${getBaseUrl()}/oauth/token`;
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: tokenData.refreshToken,
                client_id: oauthConfig.clientId,
                client_secret: oauthConfig.clientSecret
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || 'Failed to refresh token');
        }

        // Update stored tokens
        tokenData = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || tokenData.refreshToken,
            expiresAt: Date.now() + (data.expires_in * 1000)
        };
        localStorage.setItem('procoreTokens', JSON.stringify(tokenData));

        // Show updated token
        displayToken();
        
        return true;
    } catch (error) {
        showError(`Token refresh error: ${error.message}`);
        return false;
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Display token information
function displayToken() {
    if (!tokenData?.accessToken) {
        return;
    }

    const loginSection = document.getElementById('login-section');
    const loadingSection = document.getElementById('loading-section');
    const tokenSection = document.getElementById('token-section');
    const accessTokenDisplay = document.getElementById('access-token');
    
    // Show token section
    loginSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    tokenSection.classList.remove('hidden');
    
    // Display token (first 15 chars)
    const tokenPreview = tokenData.accessToken.substring(0, 15) + '...';
    accessTokenDisplay.textContent = tokenPreview;
    
    // If auto-load dashboard is enabled, go straight to data section
    if (appPreferences.autoLoadDashboard) {
        // Programmatically click the view data button
        document.getElementById('view-data').click();
        
        // Load dashboard data
        setTimeout(() => {
            document.getElementById('dashboard-tab').click();
            updateDashboard();
        }, 500);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('procoreTokens');
    tokenData = null;
    
    // Clear all data lists
    document.getElementById('projects-list').innerHTML = '';
    document.getElementById('companies-list').innerHTML = '';
    document.getElementById('users-list').innerHTML = '';
    document.getElementById('tasks-list').innerHTML = '';
    document.getElementById('project-select').innerHTML = '<option selected value="">Choose a project...</option>';
    
    // Reset UI state
    document.getElementById('token-section').classList.add('hidden');
    document.getElementById('data-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    
    // Clear the URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Helper function to show an error
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorCard = document.getElementById('error-card');
    const loginSection = document.getElementById('login-section');
    const loadingSection = document.getElementById('loading-section');
    const tokenSection = document.getElementById('token-section');
    const dataSection = document.getElementById('data-section');
    
    errorMessage.textContent = message;
    errorCard.classList.remove('hidden');
    loginSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    tokenSection.classList.add('hidden');
    dataSection.classList.add('hidden');
    
    console.error(message);
}