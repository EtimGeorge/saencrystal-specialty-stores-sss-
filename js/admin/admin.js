document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const menuCancel = document.getElementById('menu-cancel');
    const navLinks = document.getElementById('nav-links');

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
});