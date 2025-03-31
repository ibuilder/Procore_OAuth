/**
 * Procore OAuth Client - Main Application
 * 
 * Initializes the application and sets up event handlers
 */

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements - Core sections
    const oauthForm = document.getElementById('oauth-form');
    const loginSection = document.getElementById('login-section');
    const loadingSection = document.getElementById('loading-section');
    const tokenSection = document.getElementById('token-section');
    const dataSection = document.getElementById('data-section');
    const errorCard = document.getElementById('error-card');
    const backToLoginBtn = document.getElementById('back-to-login');
    
    // DOM elements - Buttons
    const viewDataBtn = document.getElementById('view-data');
    const refreshTokenBtn = document.getElementById('refresh-token');
    const logoutBtn = document.getElementById('logout');
    const fetchProjectsBtn = document.getElementById('fetch-projects');
    const fetchCompaniesBtn = document.getElementById('fetch-companies');
    const fetchUsersBtn = document.getElementById('fetch-users');
    const fetchTasksBtn = document.getElementById('fetch-tasks');
    const fetchFilesBtn = document.getElementById('fetch-files');
    const refreshDashboardBtn = document.getElementById('refresh-dashboard');
    const fetchWebhooksBtn = document.getElementById('fetch-webhooks');
    const clearStorageBtn = document.getElementById('clear-storage');
    const exportSettingsBtn = document.getElementById('export-settings');
    const testConnectionBtn = document.getElementById('test-connection');
    const createSampleProjectBtn = document.getElementById('create-sample-project');
    
    // DOM elements - Forms
    const createProjectForm = document.getElementById('create-project-form');
    const uploadFileForm = document.getElementById('upload-file-form');
    const createWebhookForm = document.getElementById('create-webhook-form');
    const simulateWebhookForm = document.getElementById('simulate-webhook-form');
    const settingsForm = document.getElementById('settings-form');
    const preferencesForm = document.getElementById('preferences-form');
    
    // DOM elements - Selects
    const projectSelect = document.getElementById('project-select');
    const fileProjectSelect = document.getElementById('file-project-select');
    
    // Check for an authorization code in the URL (after redirect from Procore)
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');
    
    // Handle OAuth form submission
    oauthForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const clientId = document.getElementById('client-id').value.trim();
        const clientSecret = document.getElementById('client-secret').value.trim();
        const redirectUri = document.getElementById('redirect-uri').value.trim();
        const environment = document.querySelector('input[name="environment"]:checked').value;
        
        // Validate
        if (!clientId || !clientSecret || !redirectUri) {
            showError('Please fill in all required fields.');
            return;
        }

        // Save config
        oauthConfig = {
            clientId,
            clientSecret,
            redirectUri,
            environment
        };
        localStorage.setItem('procoreConfig', JSON.stringify(oauthConfig));

        // Redirect to Procore authorization endpoint
        const authUrl = `${getBaseUrl()}/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    });
    
    // Button click handlers
    viewDataBtn.addEventListener('click', function() {
        tokenSection.classList.add('hidden');
        dataSection.classList.remove('hidden');
    });
    
    fetchProjectsBtn.addEventListener('click', fetchProjects);
    fetchCompaniesBtn.addEventListener('click', fetchCompanies);
    fetchUsersBtn.addEventListener('click', fetchUsers);
    fetchTasksBtn.addEventListener('click', fetchTasks);
    fetchFilesBtn.addEventListener('click', fetchFiles);
    refreshDashboardBtn.addEventListener('click', updateDashboard);
    fetchWebhooksBtn.addEventListener('click', fetchWebhooks);
    refreshTokenBtn.addEventListener('click', refreshAccessToken);
    logoutBtn.addEventListener('click', logout);
    clearStorageBtn.addEventListener('click', clearAllStorage);
    exportSettingsBtn.addEventListener('click', exportSettings);
    testConnectionBtn.addEventListener('click', testApiConnection);
    createSampleProjectBtn.addEventListener('click', createSampleProject);
    backToLoginBtn.addEventListener('click', function() {
        errorCard.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
    
    // Form submissions
    createProjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createProject();
    });
    
    uploadFileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadFile();
    });
    
    createWebhookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createWebhook();
    });
    
    simulateWebhookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        simulateWebhookEvent();
    });
    
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    preferencesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        savePreferences();
    });
    
    // Project select change handlers
    projectSelect.addEventListener('change', function() {
        fetchTasksBtn.disabled = !this.value;
        if (this.value) {
            rememberProject(this.value);
        }
    });
    
    fileProjectSelect.addEventListener('change', function() {
        fetchFilesBtn.disabled = !this.value;
        document.getElementById('upload-file-btn').disabled = !this.value;
        if (this.value) {
            rememberProject(this.value);
        }
    });
    
    // Process auth code if present in URL
    if (authCode) {
        exchangeCodeForTokens(authCode);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
        showError(`Authorization error: ${error}`);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tokenData?.accessToken) {
        // Show token section if we have a stored token
        displayToken();
        
        // Initialize forms
        initializeSettingsForm();
        initializePreferencesForm();
        
        // Apply preferences
        applyPreferences();
        
        // Load last selected project if enabled
        loadLastProject();
        
        // Load default view if enabled
        loadDefaultView();
    } else {
        // Initialize settings form with saved config
        if (document.getElementById('client-id')) {
            document.getElementById('client-id').value = oauthConfig.clientId || '';
        }
        if (document.getElementById('client-secret')) {
            document.getElementById('client-secret').value = oauthConfig.clientSecret || '';
        }
        if (document.getElementById('redirect-uri')) {
            document.getElementById('redirect-uri').value = oauthConfig.redirectUri || 'http://localhost:8000/callback';
        }
        
        if (oauthConfig.environment === 'production') {
            const productionRadio = document.getElementById('production');
            if (productionRadio) productionRadio.checked = true;
        } else {
            const sandboxRadio = document.getElementById('sandbox');
            if (sandboxRadio) sandboxRadio.checked = true;
        }
    }
});