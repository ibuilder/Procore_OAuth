/**
 * Procore OAuth Client - Projects Module
 * 
 * Handles project operations with Procore API
 */

// Fetch projects from Procore
async function fetchProjects() {
    const projects = await apiRequest('/rest/v1.0/projects');
    if (!projects) return;
    
    const projectsList = document.getElementById('projects-list');
    const projectSelect = document.getElementById('project-select');
    const fileProjectSelect = document.getElementById('file-project-select');
    
    // Clear previous project list
    projectsList.innerHTML = '';
    
    // Also update the project select dropdown
    projectSelect.innerHTML = '<option selected value="">Choose a project...</option>';
    fileProjectSelect.innerHTML = '<option selected value="">Choose a project...</option>';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="mt-3">No projects found.</p>';
    } else {
        projects.forEach(project => {
            // Add to projects list
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${project.name}</h5>
                    <small>ID: ${project.id}</small>
                </div>
                <p class="mb-1">${project.address || 'No address'}</p>
                <small>${project.status || 'Unknown status'}</small>
            `;
            projectsList.appendChild(item);
            
            // Add to project select dropdowns
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
            
            const fileOption = document.createElement('option');
            fileOption.value = project.id;
            fileOption.textContent = project.name;
            fileProjectSelect.appendChild(fileOption);
        });
    }
    
    document.getElementById('data-section').classList.remove('hidden');
    
    // Apply preferences to newly added items
    applyPreferences();
}

// Fetch companies from Procore
async function fetchCompanies() {
    const companies = await apiRequest('/rest/v1.0/companies');
    if (!companies) return;
    
    const companiesList = document.getElementById('companies-list');
    
    companiesList.innerHTML = '';
    if (companies.length === 0) {
        companiesList.innerHTML = '<p class="mt-3">No companies found.</p>';
    } else {
        companies.forEach(company => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${company.name}</h5>
                    <small>ID: ${company.id}</small>
                </div>
                <p class="mb-1">Country: ${company.country_code || 'Not specified'}</p>
                <small>Phone: ${company.phone || 'Not provided'}</small>
            `;
            companiesList.appendChild(item);
        });
    }
    
    document.getElementById('data-section').classList.remove('hidden');
    
    // Apply preferences to newly added items
    applyPreferences();
}

// Fetch users from Procore
async function fetchUsers() {
    const users = await apiRequest('/rest/v1.0/users');
    if (!users) return;
    
    const usersList = document.getElementById('users-list');
    
    usersList.innerHTML = '';
    if (users.length === 0) {
        usersList.innerHTML = '<p class="mt-3">No users found.</p>';
    } else {
        users.forEach(user => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${user.name}</h5>
                    <small>ID: ${user.id}</small>
                </div>
                <p class="mb-1">Email: ${user.email || 'No email'}</p>
                <small>Role: ${user.employee_type || 'Not specified'}</small>
            `;
            usersList.appendChild(item);
        });
    }
    
    document.getElementById('data-section').classList.remove('hidden');
    
    // Apply preferences to newly added items
    applyPreferences();
}

// Fetch tasks from Procore
async function fetchTasks() {
    const projectId = document.getElementById('project-select').value;
    if (!projectId) {
        showError('Please select a project first');
        return;
    }
    
    rememberProject(projectId);
    
    const tasks = await apiRequest(`/rest/v1.0/projects/${projectId}/tasks`);
    if (!tasks) return;
    
    const tasksList = document.getElementById('tasks-list');
    
    tasksList.innerHTML = '';
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="mt-3">No tasks found for this project.</p>';
    } else {
        tasks.forEach(task => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${task.name || 'Unnamed Task'}</h5>
                    <small ${!appPreferences.showIds ? 'style="display:none"' : ''}>ID: ${task.id}</small>
                </div>
                <p class="mb-1">Status: ${task.status || 'No status'}</p>
                <div>
                    <small class="me-2">Start: ${formatDate(task.start_date) || 'Not set'}</small>
                    <small>End: ${formatDate(task.end_date) || 'Not set'}</small>
                </div>
            `;
            tasksList.appendChild(item);
        });
    }
    
    document.getElementById('data-section').classList.remove('hidden');
}

// Create a new project
async function createProject() {
    const projectName = document.getElementById('project-name').value;
    if (!projectName) {
        showError('Project name is required');
        return;
    }
    
    const createResult = document.getElementById('create-result');
    
    const projectData = {
        project: {
            name: projectName,
            address: document.getElementById('project-address').value,
            city: document.getElementById('project-city').value,
            state_code: document.getElementById('project-state').value,
            zip: document.getElementById('project-zip').value,
            country_code: document.getElementById('project-country').value,
            start_date: document.getElementById('project-start-date').value || null,
            finish_date: document.getElementById('project-end-date').value || null,
            description: document.getElementById('project-description').value
        }
    };
    
    const result = await apiRequest('/rest/v1.0/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
    });
    
    if (result) {
        createResult.innerHTML = `
            <div class="alert alert-success">
                Project "${result.name}" created successfully with ID: ${result.id}
            </div>
        `;
        
        // Reset form
        document.getElementById('create-project-form').reset();
        
        // Refresh project list
        await fetchProjects();
    } else {
        createResult.innerHTML = `
            <div class="alert alert-danger">
                Failed to create project. Please check your inputs and try again.
            </div>
        `;
    }
}

// Create sample project with pre-filled data
function createSampleProject() {
    // Populate form with sample data
    document.getElementById('project-name').value = `Sample Project ${new Date().toLocaleDateString()}`;
    document.getElementById('project-address').value = '123 Construction Way';
    document.getElementById('project-city').value = 'San Francisco';
    document.getElementById('project-state').value = 'CA';
    document.getElementById('project-zip').value = '94105';
    document.getElementById('project-country').value = 'US';
    
    // Set start date to today
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    document.getElementById('project-start-date').value = todayFormatted;
    
    // Set end date to 6 months from now
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    const endDateFormatted = endDate.toISOString().split('T')[0];
    document.getElementById('project-end-date').value = endDateFormatted;
    
    // Set description
    document.getElementById('project-description').value = 'This is a sample project created using the Procore OAuth Client.';
}