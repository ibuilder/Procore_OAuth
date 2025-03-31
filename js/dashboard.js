/**
 * Procore OAuth Client - Dashboard Module
 * 
 * Handles dashboard visualizations and statistics
 */

// Chart variables
let statusChart = null;
let timelineChart = null;

// Update dashboard with data
async function updateDashboard() {
    const loadingSection = document.getElementById('loading-section');
    loadingSection.classList.remove('hidden');
    
    try {
        // Fetch required data
        const projects = await apiRequest('/rest/v1.0/projects');
        const users = await apiRequest('/rest/v1.0/users');
        
        if (!projects || !users) return;
        
        // Update statistics tiles
        document.getElementById('total-projects').textContent = projects.length;
        document.getElementById('total-users').textContent = users.length;
        
        const activeProjects = projects.filter(p => p.status === 'active');
        document.getElementById('active-projects').textContent = activeProjects.length;
        
        // Collect total tasks (this is a simple approximation - in a real app you'd use a proper API endpoint)
        let totalTasks = 0;
        for (const project of projects.slice(0, 3)) { // Limit to avoid too many requests
            const tasks = await apiRequest(`/rest/v1.0/projects/${project.id}/tasks`);
            if (tasks) {
                totalTasks += tasks.length;
            }
        }
        document.getElementById('total-tasks').textContent = totalTasks;
        
        // Create status chart
        createStatusChart(projects);
        
        // Create timeline chart
        createTimelineChart(projects);
        
    } catch (error) {
        showError(`Dashboard update failed: ${error.message}`);
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Create project status distribution chart
function createStatusChart(projects) {
    // Count projects by status
    const statusCounts = {};
    
    projects.forEach(project => {
        const status = project.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    // Define colors for each status
    const colors = [
        '#4CAF50', // active
        '#FF9800', // pending
        '#2196F3', // planning
        '#F44336', // closed
        '#9C27B0', // other statuses
        '#795548',
        '#607D8B'
    ];
    
    const ctx = document.getElementById('status-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (statusChart) {
        statusChart.destroy();
    }
    
    // Create new chart
    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Project Status Distribution'
                }
            }
        }
    });
}

// Create projects timeline chart
function createTimelineChart(projects) {
    // Filter projects with start and end dates
    const projectsWithDates = projects.filter(p => p.start_date && p.finish_date).slice(0, 10);
    
    // Sort by start date
    projectsWithDates.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    const labels = projectsWithDates.map(p => p.name);
    const startDates = projectsWithDates.map(p => new Date(p.start_date));
    const durations = projectsWithDates.map(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.finish_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days
    });
    
    const ctx = document.getElementById('timeline-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    // Create new chart
    timelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Project Duration (days)',
                data: durations,
                backgroundColor: '#f47e42',
                borderColor: '#e05c12',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Project Timelines'
                }
            }
        }
    });
}