/**
 * Procore OAuth Client - Configuration Module
 * 
 * Handles application configuration and preferences
 */

// OAuth configuration
let oauthConfig = JSON.parse(localStorage.getItem('procoreConfig')) || {
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:8000/callback',
    environment: 'sandbox'
};

// Application preferences
let appPreferences = JSON.parse(localStorage.getItem('procorePreferences')) || {
    autoRefresh: 30,
    showIds: true,
    autoLoadDashboard: true,
    rememberLastProject: false,
    dateFormat: 'MM/DD/YYYY'
};

// Get base URL based on environment
function getBaseUrl() {
    return oauthConfig.environment === 'production' 
        ? 'https://api.procore.com' 
        : 'https://sandbox.procore.com';
}

// Format date according to preferences
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const format = appPreferences.dateFormat;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return dateStr;
    }
}

// Apply preferences to UI elements
function applyPreferences() {
    // Apply showIds preference
    document.querySelectorAll('.list-group-item small').forEach(el => {
        if (el.textContent.startsWith('ID:')) {
            el.style.display = appPreferences.showIds ? 'inline' : 'none';
        }
    });
    
    // Set up auto-refresh if enabled
    if (tokenData?.accessToken && appPreferences.autoRefresh > 0) {
        // Clear any existing auto-refresh timer
        if (window.autoRefreshTimer) {
            clearInterval(window.autoRefreshTimer);
        }
        
        // Set new timer
        window.autoRefreshTimer = setInterval(() => {
            // Only refresh if token is getting close to expiry
            const timeRemaining = tokenData.expiresAt - Date.now();
            const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
            
            if (timeRemaining < refreshThreshold) {
                refreshAccessToken();
                console.log('Token auto-refreshed');
            }
        }, appPreferences.autoRefresh * 60 * 1000);
    }
}

// Remember last selected project if preference is enabled
function rememberProject(projectId) {
    if (appPreferences.rememberLastProject && projectId) {
        localStorage.setItem('lastProjectId', projectId);
    }
}

// Load last selected project if preference is enabled
function loadLastProject() {
    if (appPreferences.rememberLastProject) {
        const lastProjectId = localStorage.getItem('lastProjectId');
        if (lastProjectId) {
            const projectSelect = document.getElementById('project-select');
            const fileProjectSelect = document.getElementById('file-project-select');
            
            if (projectSelect) projectSelect.value = lastProjectId;
            if (fileProjectSelect) fileProjectSelect.value = lastProjectId;
            
            // Enable buttons
            const fetchTasksBtn = document.getElementById('fetch-tasks');
            const fetchFilesBtn = document.getElementById('fetch-files');
            const uploadFileBtn = document.getElementById('upload-file-btn');
            
            if (fetchTasksBtn) fetchTasksBtn.disabled = false;
            if (fetchFilesBtn) fetchFilesBtn.disabled = false;
            if (uploadFileBtn) uploadFileBtn.disabled = false;
        }
    }
}

// Load default view when authorized
function loadDefaultView() {
    if (appPreferences.autoLoadDashboard) {
        // Programmatically click on dashboard tab
        const dashboardTab = document.getElementById('dashboard-tab');
        if (dashboardTab) dashboardTab.click();
        
        // Load dashboard data
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
}