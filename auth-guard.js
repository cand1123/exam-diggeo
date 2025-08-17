// Authentication Guard for Admin Pages
// Include this script in all admin pages to protect them

(function() {
    'use strict';

    // Check if user is authenticated
    function checkAuth() {
        const token = localStorage.getItem('adminToken');
        const data = localStorage.getItem('adminData');
        
        if (!token || !data) {
            redirectToLogin();
            return false;
        }
        
        try {
            const adminData = JSON.parse(data);
            
            // Validate token
            if (!isValidToken(token)) {
                clearAuthData();
                redirectToLogin();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error parsing admin data:', error);
            clearAuthData();
            redirectToLogin();
            return false;
        }
    }

    // Validate token
    function isValidToken(token) {
        if (!token || !token.startsWith('admin_')) {
            return false;
        }
        
        const tokenParts = token.split('_');
        if (tokenParts.length < 2) {
            return false;
        }
        
        const tokenTime = parseInt(tokenParts[1]);
        const currentTime = Date.now();
        const tokenAge = currentTime - tokenTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        return tokenAge < maxAge;
    }

    // Redirect to login
    function redirectToLogin() {
        window.location.href = 'login-admin.html';
    }

    // Clear authentication data
    function clearAuthData() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('rememberMe');
    }

    // Logout function
    function logout() {
        clearAuthData();
        redirectToLogin();
    }

    // Setup auto-logout
    function setupAutoLogout() {
        const inactivityTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        let inactivityTimer;
        
        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                alert('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
                logout();
            }, inactivityTimeout);
        }
        
        // Reset timer on user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });
        
        // Start the timer
        resetInactivityTimer();
    }

    // Get admin data
    function getAdminData() {
        const data = localStorage.getItem('adminData');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Error parsing admin data:', error);
                return null;
            }
        }
        return null;
    }

    // Get admin token
    function getAdminToken() {
        return localStorage.getItem('adminToken');
    }

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', function() {
        if (checkAuth()) {
            // User is authenticated, setup auto-logout
            setupAutoLogout();
            
            // Display admin info if elements exist
            displayAdminInfo();
        }
    });

    // Display admin information
    function displayAdminInfo() {
        const adminData = getAdminData();
        if (!adminData) return;

        // Update admin name if element exists
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            if (adminData.fullName) {
                adminNameElement.textContent = adminData.fullName;
            } else if (adminData.username) {
                adminNameElement.textContent = adminData.username;
            } else {
                adminNameElement.textContent = 'Admin';
            }
        }

        // Update login time if element exists
        const loginTimeElement = document.getElementById('loginTime');
        if (loginTimeElement && adminData.loginTime) {
            const loginDate = new Date(adminData.loginTime);
            const formattedTime = loginDate.toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            loginTimeElement.textContent = formattedTime;
        }
    }

    // Add logout button functionality
    function setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Apakah Anda yakin ingin keluar dari sistem admin?')) {
                    logout();
                }
            });
        }
    }

    // Setup logout button when DOM is ready
    document.addEventListener('DOMContentLoaded', setupLogoutButton);

    // Add keyboard shortcut for logout (Ctrl+L)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar dari sistem admin?')) {
                logout();
            }
        }
    });

    // Add session refresh on focus
    window.addEventListener('focus', function() {
        const token = getAdminToken();
        if (token && !isValidToken(token)) {
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            logout();
        }
    });

    // Export functions for use in other scripts
    window.authGuard = {
        checkAuth,
        logout,
        getAdminData,
        getAdminToken,
        isValidToken,
        setupAutoLogout,
        displayAdminInfo
    };

    // Auto-redirect if not authenticated
    if (!checkAuth()) {
        // This will redirect to login page
        return;
    }

})();
