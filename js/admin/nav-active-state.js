document.addEventListener('DOMContentLoaded', () => {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.nav-links a');

  // Function to set active class
  function setActiveLink() {
      const currentPage = window.location.pathname.split('/').pop();

      navLinks.forEach(link => {
          if (link.getAttribute('href') === currentPage) {
              link.classList.add('active');
          } else {
              link.classList.remove('active');
          }
      });
  }

  // Set active link on page load
  setActiveLink();

  // Add click event listeners to each link
  navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          // Remove active class from all links
          navLinks.forEach(l => l.classList.remove('active'));
          // Add active class to clicked link
          e.target.classList.add('active');
      });
  });
});