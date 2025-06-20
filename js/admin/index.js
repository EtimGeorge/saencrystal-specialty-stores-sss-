document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const loginError = document.getElementById('login-error');

  menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
  });

  form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Simple validation (replace with real authentication)
      if (username === 'admin' && password === 'password') {
          window.location.href = './dashboard.html';
      } else {
          loginError.textContent = 'Invalid username or password';
      }
  });
});
