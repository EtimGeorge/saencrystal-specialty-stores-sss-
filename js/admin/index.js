document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const menuToggle = document.getElementById('menu-toggle'); // Keep if header becomes visible/used
  const navLinks = document.getElementById('nav-links');   // Keep if header becomes visible/used
  const loginError = document.getElementById('login-error');

  if (menuToggle && navLinks) { // Only add listener if elements exist
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
  }

  if (form) { // Ensure form exists before adding listener
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const username = usernameInput ? usernameInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        // Simulate login check
        if (username === 'admin' && password === 'password') {
            if(loginError) loginError.textContent = '';
            localStorage.setItem('adminAuthToken', 'mock_admin_token_xyz123'); // Simulate token
            localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'administrator' }));
            window.location.href = 'dashboard.html'; // Relative to current admin/ folder
        } else {
            if(loginError) loginError.textContent = 'Invalid username or password.';
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminUser');
        }
    });
  }
});
