// js/client/register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('customer-register-form');
    const registerError = document.getElementById('customer-register-error'); // Get the error message div
    const customerAuthTokenKey = 'saencrystalCustomerAuthToken';
    const customerUserKey = 'saencrystalCustomerUser';

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nameInput = registerForm.querySelector('input[id="register-fullname"]');
            const emailInput = registerForm.querySelector('input[id="register-email"]');
            const passwordInput = registerForm.querySelector('input[id="register-password"]');
            const confirmPasswordInput = registerForm.querySelector('input[id="register-confirm-password"]');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

            if (!name || !email || !password || !confirmPassword) {
                if (registerError) registerError.textContent = 'Please fill in all fields.';
                return;
            }

            if (password !== confirmPassword) {
                if (registerError) registerError.textContent = 'Passwords do not match. Please try again.';
                return;
            }

            // Simulate successful registration & login
            if (registerError) registerError.textContent = ''; // Clear previous errors
            localStorage.setItem(customerAuthTokenKey, 'mock_customer_token_def456_new_user');
            localStorage.setItem(customerUserKey, JSON.stringify({ email: email, name: name }));

            alert('Registration successful (simulated)! You are now logged in. Redirecting to your profile...');

            // Redirect to profile page. Since register.html is in client/, profile.html is a sibling.
            window.location.href = 'profile.html';
        });
    }
});
