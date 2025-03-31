# Procore OAuth Client

A comprehensive web application for interacting with the Procore API through OAuth authentication. This client provides a full suite of features for managing Procore projects, files, tasks, webhooks, and more.

## Features

### 1. Advanced Application Settings and Preferences

-   **Comprehensive Settings Panel**:
    -   OAuth configuration management with persistent storage
    -   Application preferences with customizable options
    -   Date format customization (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
    -   Control over UI elements like showing/hiding IDs
-   **User Experience Improvements**:
    -   Auto-refresh token functionality based on configurable intervals
    -   Remembering last selected project across sessions
    -   Auto-loading dashboard on authentication
    -   Format dates according to user preferences

### 2. Webhook Management System

-   **Webhook Creation and Management**:
    -   Create webhooks to monitor Procore resources (projects, tasks, files, users)
    -   Configure webhook events (create, update, delete)
    -   List active webhooks with ability to delete them
-   **Webhook Testing Tools**:
    -   Event simulation for testing webhook endpoints
    -   Custom payload support for testing specific scenarios

### 3. Enhanced Project Creation

-   **Sample Project Generator**:
    -   One-click project creation with realistic sample data
    -   Automatically sets dates, location, and description

### 4. Advanced Data Handling and Visualization

-   **Date Formatting and Display**:
    -   Customizable date formats across the application
    -   Consistent date display in all listings and forms
-   **Dashboard Visualizations**:
    -   Project status distribution chart
    -   Project timeline visualization
    -   Key statistics with dynamic updating

### 5. File Management System

-   **File Upload and Download**:
    -   Upload files to specific projects
    -   Download files with direct links
    -   File descriptions and metadata support

## Getting Started

### Prerequisites
- Web server (local or hosted)
- Procore API credentials (Client ID and Secret)
- Registered OAuth redirect URI

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/ibuilder/Procore_OAuth.git
   ```
2. Navigate to the project directory:
   ```
   cd procore-oauth-client
   ```
3. Set up your web server to serve the application files.
   - For local development, you can use PHP's built-in server:
     ```
     php -S localhost:8000
     ```
   - Or use any other web server of your choice.

4. Open the application in your web browser by navigating to your server address.

### Configuration
1. Register an application in your Procore Developer Portal
2. Obtain Client ID and Client Secret
3. Configure the redirect URI to match your deployment
4. Enter these credentials in the application settings

## Usage

### Authentication
1. Enter your Procore OAuth credentials
2. Select environment (Sandbox/Production)
3. Click "Connect to Procore"
4. Complete the authentication process

### Working with Projects
- View projects by clicking "Fetch Projects"
- Create new projects in the "Create Project" tab
- Generate a sample project with the "Create Sample Project" button

### Managing Files
1. Select a project from the dropdown
2. Click "Fetch Files" to view existing files
3. Upload new files with the file upload form

### Using Webhooks
1. Create webhooks by specifying name, URL, resources, and events
2. View and manage active webhooks
3. Test webhooks with the event simulator

### Customizing Settings
- Adjust application preferences in the Settings tab
- Configure token refresh intervals
- Set date format preferences
- Enable/disable auto-load dashboard

## Project Structure
- `index.html` - Main application HTML
- `css/styles.css` - Application styling
- `js/app.js` - Core application logic
- `js/auth.js` - Authentication functionality
- `js/config.js` - Configuration and preferences
- `js/dashboard.js` - Dashboard and visualizations
- `js/files.js` - File operations
- `js/projects.js` - Project management
- `js/settings.js` - Application settings
- `js/webhooks.js` - Webhook functionality

## Security Notes
- Client credentials are stored in the browser's localStorage
- Use HTTPS in production to secure data transmission
- Consider implementing additional security measures for sensitive environments

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Built for integration with the Procore API
- Uses Bootstrap for responsive design
- Chart.js for data visualization
