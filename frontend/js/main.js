const API_URL = 'http://127.0.0.1:5000/api';

// Main JS functions
document.addEventListener('DOMContentLoaded', function() {
    console.log('Library Management System loaded');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('login')) {
        // Redirect logged-in users from login page
        if (localStorage.getItem('userType') === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('studentEmail');
    window.location.href = 'index.html';
}

// Fetch API with authentication
async function fetchAPI(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        method,
        headers
    };
    
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (!response.ok) {
            let message = `API Error: ${response.status}`;
            try {
                const errorBody = await response.json();
                message = errorBody.message || errorBody.msg || message;
            } catch (_) {
                // If JSON parse fails, try plain text
                try {
                    const textBody = await response.text();
                    if (textBody) message = textBody;
                } catch (_) {
                    /* ignore */
                }
            }
            throw new Error(message);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Tab switching
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const activeBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}
