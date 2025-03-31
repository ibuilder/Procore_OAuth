/**
 * Procore OAuth Client - Files Module
 * 
 * Handles file operations with Procore API
 */

// Fetch files for a project
async function fetchFiles() {
    const projectId = document.getElementById('file-project-select').value;
    if (!projectId) {
        showError('Please select a project first');
        return;
    }
    
    rememberProject(projectId);
    
    const files = await apiRequest(`/rest/v1.0/projects/${projectId}/files`);
    if (!files) return;
    
    const filesList = document.getElementById('files-list');
    
    filesList.innerHTML = '';
    if (files.length === 0) {
        filesList.innerHTML = '<p class="mt-3">No files found for this project.</p>';
    } else {
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${file.name || 'Unnamed File'}</h5>
                        <p class="mb-1">${file.description || 'No description'}</p>
                        <small>Uploaded: ${formatDate(file.created_at)}</small>
                        <small ${!appPreferences.showIds ? 'style="display:none"' : ''} class="ms-3">ID: ${file.id}</small>
                    </div>
                    <div>
                        <a href="${file.url}" target="_blank" class="btn btn-sm btn-primary">Download</a>
                    </div>
                </div>
            `;
            filesList.appendChild(item);
        });
    }
}

// Upload a file to a project
async function uploadFile() {
    const projectId = document.getElementById('file-project-select').value;
    if (!projectId) {
        showError('Please select a project first');
        return;
    }
    
    const fileInput = document.getElementById('file-upload');
    if (!fileInput.files || fileInput.files.length === 0) {
        showError('Please select a file to upload');
        return;
    }
    
    const file = fileInput.files[0];
    const description = document.getElementById('file-description').value;
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file[name]', file.name);
    formData.append('file[description]', description);
    formData.append('file[data]', file);
    
    const loadingSection = document.getElementById('loading-section');
    const uploadResult = document.getElementById('upload-result');
    
    loadingSection.classList.remove('hidden');
    
    try {
        // Check if token has expired
        if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
            await refreshAccessToken();
        }
        
        const url = `${getBaseUrl()}/rest/v1.0/projects/${projectId}/files`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenData.accessToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                await refreshAccessToken();
                return uploadFile();
            }
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        uploadResult.innerHTML = `
            <div class="alert alert-success">
                File "${file.name}" uploaded successfully!
            </div>
        `;
        
        // Reset form
        document.getElementById('upload-file-form').reset();
        
        // Refresh file list
        await fetchFiles();
    } catch (error) {
        uploadResult.innerHTML = `
            <div class="alert alert-danger">
                Upload failed: ${error.message}
            </div>
        `;
    } finally {
        loadingSection.classList.add('hidden');
    }
}