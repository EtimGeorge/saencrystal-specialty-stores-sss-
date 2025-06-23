// js/admin/admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const authToken = localStorage.getItem('adminAuthToken');
    // Allow access to index.html (login page) without a token
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('admin/') || window.location.pathname === '/admin';

    if (!authToken && !isLoginPage) {
        window.location.href = 'index.html'; // Redirect to login
        return; // Stop further execution
    }

    const adminUsernameEl = document.getElementById('admin-username');
    const logoutButton = document.getElementById('admin-logout-btn');

    // Display username if element exists and user info is in localStorage
    if (adminUsernameEl) {
        try {
            const adminUser = JSON.parse(localStorage.getItem('adminUser'));
            if (adminUser && adminUser.username) {
                adminUsernameEl.textContent = `User: ${adminUser.username}`;
            } else {
                adminUsernameEl.textContent = 'User: Admin'; // Fallback
            }
        } catch (e) {
            console.error("Error parsing adminUser from localStorage", e);
            adminUsernameEl.textContent = 'User: Admin'; // Fallback
        }
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'index.html'; // Redirect to login page
        });
    }

    // Active state for sidebar (simple version based on URL)
    const sidebarLinks = document.querySelectorAll('.admin-sidebar ul li a');
    // Get the current file name, e.g., "dashboard.html"
    const currentPathFileName = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);


    sidebarLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop();
        if (linkFile === currentPathFileName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Add admin-body class to body for admin-specific global styles
    // This is better than relying on @import for everything from client-styles
    // if admin styles should be more distinct.
    // For current setup where admin-styles.css imports client-styles.css,
    // this helps target admin body specifically if needed.
    if (!isLoginPage) { // Don't add to login page if it has its own body class from admin-styles.css
        document.body.classList.add('admin-body');
    }
});