/**
 * Procore OAuth Client - Webhooks Module
 * 
 * Handles webhook operations with Procore API
 */

// Create a webhook
async function createWebhook() {
    const name = document.getElementById('webhook-name').value;
    const url = document.getElementById('webhook-url').value;
    const webhookResult = document.getElementById('webhook-result');
    
    if (!name || !url) {
        webhookResult.innerHTML = '<div class="alert alert-danger">Name and URL are required.</div>';
        return;
    }
    
    // Get selected resources
    const resources = [];
    ['project', 'task', 'file', 'user'].forEach(resource => {
        if (document.getElementById(`resource-${resource}`).checked) {
            resources.push(resource);
        }
    });
    
    // Get selected events
    const events = [];
    ['create', 'update', 'delete'].forEach(event => {
        if (document.getElementById(`event-${event}`).checked) {
            events.push(event);
        }
    });
    
    if (resources.length === 0 || events.length === 0) {
        webhookResult.innerHTML = '<div class="alert alert-danger">Please select at least one resource and one event.</div>';
        return;
    }
    
    // Prepare webhook data
    const webhookData = {
        webhook: {
            name: name,
            url: url,
            events: events.map(event => {
                return resources.map(resource => `${resource}.${event}`);
            }).flat()
        }
    };
    
    const result = await apiRequest('/rest/v1.0/webhooks', {
        method: 'POST',
        body: JSON.stringify(webhookData)
    });
    
    if (result) {
        webhookResult.innerHTML = `
            <div class="alert alert-success">
                Webhook "${result.name}" created successfully with ID: ${result.id}
            </div>
        `;
        
        // Reset form
        document.getElementById('create-webhook-form').reset();
        
        // Refresh webhooks list
        await fetchWebhooks();
    } else {
        webhookResult.innerHTML = `
            <div class="alert alert-danger">
                Failed to create webhook. Please check your inputs and try again.
            </div>
        `;
    }
}

// Fetch webhooks
async function fetchWebhooks() {
    const webhooks = await apiRequest('/rest/v1.0/webhooks');
    if (!webhooks) return;
    
    const webhooksList = document.getElementById('webhooks-list');
    const webhookSelect = document.getElementById('webhook-select');
    
    webhooksList.innerHTML = '';
    webhookSelect.innerHTML = '<option value="">Choose webhook...</option>';
    
    if (webhooks.length === 0) {
        webhooksList.innerHTML = '<p class="mt-3">No webhooks found.</p>';
    } else {
        webhooks.forEach(webhook => {
            // Add to webhooks list
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${webhook.name}</h6>
                        <p class="mb-1 small text-truncate">${webhook.url}</p>
                        <small>${webhook.events.join(', ')}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-danger delete-webhook" data-id="${webhook.id}">Delete</button>
                    </div>
                </div>
            `;
            webhooksList.appendChild(item);
            
            // Add event listener for delete button
            const deleteBtn = item.querySelector('.delete-webhook');
            deleteBtn.addEventListener('click', () => deleteWebhook(webhook.id));
            
            // Add to webhook select dropdown
            const option = document.createElement('option');
            option.value = webhook.id;
            option.textContent = webhook.name;
            webhookSelect.appendChild(option);
        });
    }
}

// Delete webhook
async function deleteWebhook(id) {
    if (!confirm('Are you sure you want to delete this webhook?')) {
        return;
    }
    
    const result = await apiRequest(`/rest/v1.0/webhooks/${id}`, {
        method: 'DELETE'
    });
    
    if (result !== null) {
        // Refresh webhooks list
        await fetchWebhooks();
    }
}

// Simulate webhook event
async function simulateWebhookEvent() {
    const webhookId = document.getElementById('webhook-select').value;
    const simulationResult = document.getElementById('simulation-result');
    
    if (!webhookId) {
        simulationResult.innerHTML = '<div class="alert alert-danger">Please select a webhook to test.</div>';
        return;
    }
    
    const eventType = document.getElementById('event-type').value;
    const resourceType = document.getElementById('resource-type').value;
    let payloadData = document.getElementById('payload-data').value;
    
    try {
        // Parse custom payload if provided, or use default
        let payload = {};
        if (payloadData) {
            payload = JSON.parse(payloadData);
        } else {
            // Create a default payload based on resource type
            payload = {
                id: Math.floor(Math.random() * 10000),
                name: `Test ${resourceType}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
        
        const simulationData = {
            event_type: `${resourceType}.${eventType}`,
            resource_id: payload.id,
            payload: payload
        };
        
        const result = await apiRequest(`/rest/v1.0/webhooks/${webhookId}/test`, {
            method: 'POST',
            body: JSON.stringify(simulationData)
        });
        
        if (result) {
            simulationResult.innerHTML = `
                <div class="alert alert-success">
                    Webhook event simulated successfully! Check your endpoint for the delivered payload.
                </div>
            `;
        } else {
            simulationResult.innerHTML = `
                <div class="alert alert-danger">
                    Failed to simulate webhook event. Please check your inputs and try again.
                </div>
            `;
        }
    } catch (error) {
        simulationResult.innerHTML = `
            <div class="alert alert-danger">
                Error: ${error.message}
            </div>
        `;
    }
}