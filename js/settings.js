/**
 * Procore OAuth Client - Settings Module
 * 
 * Handles application settings and preferences
 */

// Save settings
function saveSettings() {
    const clientId = document.getElementById('settings-client-id').value;
    const clientSecret = document.getElementById('settings-client-secret').value;
    const redirectUri = document.getElementById('settings-redirect-uri').value;
    const environment = document.querySelector('input[name="settings-environment"]:checked')?.value;
    const settingsForm = document.getElementById('settings-form');
    
    if (!clientId || !clientSecret || !redirectUri || !environment) {
        showError('Please fill in all required settings fields.');
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
    
    // Show success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = 'Settings saved successfully!';
    settingsForm.appendChild(alertDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Save preferences
function savePreferences() {
    const preferencesForm = document.getElementById('preferences-form');
    
    appPreferences = {
        autoRefresh: parseInt(document.getElementById('auto-refresh').value) || 30,
        showIds: document.getElementById('show-ids').checked,
        autoLoadDashboard: document.getElementById('auto-load-dashboard').checked,
        rememberLastProject: document.getElementById('remember-last-project').checked,
        dateFormat: document.getElementById('date-format').value
    };
    
    localStorage.setItem('procorePreferences', JSON.stringify(appPreferences));
    
    // Show success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = 'Preferences saved successfully!';
    preferencesForm.appendChild(alertDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
    
    // Apply preferences
    applyPreferences();
}

// Initialize settings form with current config
function initializeSettingsForm() {
    document.getElementById('settings-client-id').value = oauthConfig.clientId || '';
    document.getElementById('settings-client-secret').value = oauthConfig.clientSecret || '';
    document.getElementById('settings-redirect-uri').value = oauthConfig.redirectUri || '';
    
    if (oauthConfig.environment === 'production') {
        document.getElementById('settings-production').checked = true;
    } else {
        document.getElementById('settings-sandbox').checked = true;
    }
}

// Initialize preferences form with current preferences
function initializePreferencesForm() {
    document.getElementById('auto-refresh').value = appPreferences.autoRefresh;
    document.getElementById('show-ids').checked = appPreferences.showIds;
    document.getElementById('auto-load-dashboard').checked = appPreferences.autoLoadDashboard;
    document.getElementById('remember-last-project').checked = appPreferences.rememberLastProject;
    document.getElementById('date-format').value = appPreferences.dateFormat;
}

// Clear all stored data
function clearAllStorage() {
    if (confirm('Are you sure you want to clear all stored data? This will log you out.')) {
        localStorage.removeItem('procoreTokens');
        localStorage.removeItem('procoreConfig');
        localStorage.removeItem('procorePreferences');
        localStorage.removeItem('lastProjectId');
        
        // Reload the page
        window.location.reload();
    }
}

// Export settings
function exportSettings() {
    const exportData = {
        config: JSON.parse(localStorage.getItem('procoreConfig') || '{}'),
        preferences: JSON.parse(localStorage.getItem('procorePreferences') || '{}')
    };
    
    // Create a blob and download link
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procore_app_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Test API connection
async function testApiConnection() {
    const testConnectionBtn = document.getElementById('test-connection');
    const result = await apiRequest('/rest/v1.0/me');
    
    if (result) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.innerHTML = `
            <strong>Connection successful!</strong><br>
            Connected as: ${result.name} (${result.email})<br>
            User ID: ${result.id}
        `;
        
        // Append after the test button
        testConnectionBtn.parentNode.appendChild(alertDiv);
        
        // Remove message after a few seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}