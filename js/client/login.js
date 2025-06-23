// js/client/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('customer-login-form');
    const loginError = document.getElementById('customer-login-error'); // Get the error message div
    const customerAuthTokenKey = 'saencrystalCustomerAuthToken';
    const customerUserKey = 'saencrystalCustomerUser';

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');

            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                if (loginError) loginError.textContent = 'Please enter both email and password.';
                // alert('Please enter email and password.'); // Alternative feedback
                return;
            }

            // Simulate login check (e.g., accept any non-empty or specific credentials)
            // For this simulation, any non-empty email and password will work,
            // or you can use specific credentials like "user@example.com" / "password123"
            let isValidLogin = false;
            if (email === "user@example.com" && password === "password123") {
                isValidLogin = true;
            } else if (email && password) {
                // For broader testing, accept any non-empty fields if not the specific credentials
                // In a real app, this branch wouldn't exist or would be part of a proper backend validation
                console.warn("Simulated login with generic credentials. Use user@example.com and password123 for specific mock user.");
                isValidLogin = true;
            }


            if (isValidLogin) {
                if (loginError) loginError.textContent = ''; // Clear any previous error
                localStorage.setItem(customerAuthTokenKey, 'mock_customer_token_abc789');
                // Simulate fetching user details or use generic ones
                const userName = (email === "user@example.com") ? "Valued Customer" : "Test User";
                localStorage.setItem(customerUserKey, JSON.stringify({ email: email, name: userName }));

                alert('Login successful (simulated)! Redirecting to your profile...');

                // Redirect to profile page. Since login.html is in client/, profile.html is a sibling.
                window.location.href = 'profile.html';
            } else {
                // This else block might not be reached with current broad validation.
                // To make it reachable, remove the `else if (email && password)` block above.
                if (loginError) loginError.textContent = 'Invalid email or password. Please try again.';
                localStorage.removeItem(customerAuthTokenKey);
                localStorage.removeItem(customerUserKey);
            }
        });
    }
});
