// Theme Toggle Logic
const themeToggleKey = 'saencrystal-theme-preference';
const darkThemeClass = 'dark-theme';

// Function to apply the theme based on preference
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add(darkThemeClass);
    } else {
        document.body.classList.remove(darkThemeClass);
    }
    updateToggleButtons(theme);
}

// Function to update toggle button text/icons
function updateToggleButtons(currentTheme) {
    const newIcon = currentTheme === 'dark' ? '🌙' : '☀️'; // Moon for dark, Sun for light
    const newTitle = currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';

    const headerToggleIcon = document.querySelector('#theme-toggle-header .theme-icon-header');
    const footerToggleIcon = document.querySelector('#theme-toggle-footer .theme-icon-footer');
    const headerToggleButton = document.getElementById('theme-toggle-header');
    const footerToggleButton = document.getElementById('theme-toggle-footer');

    if (headerToggleIcon) {
        headerToggleIcon.textContent = newIcon;
    }
    if (headerToggleButton) {
        headerToggleButton.setAttribute('title', newTitle);
    }
    if (footerToggleIcon) {
        footerToggleIcon.textContent = newIcon;
    }
    if (footerToggleButton) {
        footerToggleButton.setAttribute('title', newTitle);
    }
}

// Function to handle the toggle action
function toggleThemeAction() {
    const isCurrentlyDark = document.body.classList.contains(darkThemeClass);
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    localStorage.setItem(themeToggleKey, newTheme);
    applyTheme(newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle logic (existing)
  const menuToggle = document.getElementById('menu-toggle');
  const menuCancel = document.getElementById('menu-cancel');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && menuCancel && navLinks) { // Added checks for robustness
    menuToggle.addEventListener('click', () => {
        navLinks.classList.add('active');
        menuToggle.style.display = 'none';
        menuCancel.style.display = 'flex';
    });

    menuCancel.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.style.display = 'flex';
        menuCancel.style.display = 'none';
    });
  }

  // Theme toggle initialization
  const savedTheme = localStorage.getItem(themeToggleKey);
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let initialTheme = 'light'; // Default theme

  if (savedTheme) { // User has a saved preference
      initialTheme = savedTheme;
  } else if (prefersDarkScheme) { // User has OS preference for dark, and no saved preference
      initialTheme = 'dark';
  }

  applyTheme(initialTheme); // Apply theme on initial load

  // Add event listeners to toggle buttons
  const headerToggle = document.getElementById('theme-toggle-header');
  const footerToggle = document.getElementById('theme-toggle-footer');

  if (headerToggle) {
      headerToggle.addEventListener('click', toggleThemeAction);
  }
  if (footerToggle) {
      footerToggle.addEventListener('click', toggleThemeAction);
  }

  // Customer Auth Link Management
  const customerAuthTokenKey = 'saencrystalCustomerAuthToken';
  const customerUserKey = 'saencrystalCustomerUser'; // For storing mock user info

  const loginLink = document.querySelector('.nav-item-login');
  const registerLink = document.querySelector('.nav-item-register');
  const profileLink = document.querySelector('.nav-item-profile');
  const logoutLink = document.querySelector('.nav-item-logout');
  const customerLogoutButton = document.getElementById('customer-logout-link');

  function updateAuthNavLinks() {
      const token = localStorage.getItem(customerAuthTokenKey);
      if (token) { // User is "logged in"
          if (loginLink) loginLink.style.display = 'none';
          if (registerLink) registerLink.style.display = 'none';
          if (profileLink) profileLink.style.display = 'list-item';
          if (logoutLink) logoutLink.style.display = 'list-item';
          document.body.classList.add('customer-logged-in');
      } else { // User is "logged out"
          if (loginLink) loginLink.style.display = 'list-item';
          if (registerLink) registerLink.style.display = 'list-item';
          if (profileLink) profileLink.style.display = 'none';
          if (logoutLink) logoutLink.style.display = 'none';
          document.body.classList.remove('customer-logged-in');
      }
  }

  if (customerLogoutButton) {
      customerLogoutButton.addEventListener('click', (event) => {
          event.preventDefault();
          localStorage.removeItem(customerAuthTokenKey);
          localStorage.removeItem(customerUserKey);
          alert('You have been logged out (simulated).');
          updateAuthNavLinks();
          // Optional: redirect to home or login page
          // Check if current page is not index.html or in client/ before redirecting to ../index.html
          if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
             // Check if we are inside client/ subdirectory
             if (window.location.pathname.includes('/client/')) {
                window.location.href = '../index.html';
             } else {
                // This case might not be hit if all pages are either root index or in client/
                // but as a fallback, redirect to root index
                window.location.href = '/index.html';
             }
          } else if (window.location.pathname.includes('/client/')) {
            // if on a page like /client/index.html (though we moved it) or /client/someotherpage.html not index
            // and we want to go to the root index.html
             window.location.href = '../index.html';
          }
          // If already on root index.html, no redirect needed, just update links.
      });
  }

  updateAuthNavLinks(); // Call on every page load to set initial state of nav links
});