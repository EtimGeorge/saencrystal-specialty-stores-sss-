// js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    fetchOrderSummary();
    setupFormValidation();
});

async function fetchOrderSummary() {
    try {
        const response = await fetch('/api/order-summary');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orderSummary = await response.json();
        displayOrderSummary(orderSummary);
    } catch (error) {
        console.error('Error fetching order summary:', error);
        simulateOrderSummary();
    }
}

function simulateOrderSummary() {
    const simulatedOrderSummary = {
        items: [
            { name: 'Simulated Product 1', quantity: 2, price: 29.99 },
            { name: 'Simulated Product 2', quantity: 1, price: 39.99 },
        ],
        total: 99.97
    };
    displayOrderSummary(simulatedOrderSummary);
}

function displayOrderSummary(orderSummary) {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';

    orderSummary.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('summary-item');
        itemElement.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItemsContainer.appendChild(itemElement);
    });

    document.getElementById('order-total').textContent = `$${orderSummary.total.toFixed(2)}`;
}

function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await submitOrder();
        }
    });
}

function validateForm() {
    // Add your form validation logic here
    // Return true if the form is valid, false otherwise
    return true;
}

async function submitOrder() {
    const formData = new FormData(document.getElementById('checkout-form'));
    const orderData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        handleOrderSuccess(result);
    } catch (error) {
        console.error('Error submitting order:', error);
        simulateOrderSubmission();
    }
}

function simulateOrderSubmission() {
    console.log('Simulated order submission');
    handleOrderSuccess({ orderId: 'SIMULATED-123' });
}

function handleOrderSuccess(result) {
    // Redirect to a thank you page or display a success message
    alert(`Order placed successfully! Your order ID is: ${result.orderId}`);
    // In a real application, you'd typically redirect to a thank you page:
    // window.location.href = `thank-you.html?orderId=${result.orderId}`;
}

// Add these utility functions for form validation
function validateRequired(value) {
    return value.trim() !== '';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateCreditCard(cardNumber) {
    // Implement credit card validation logic
    // This is a simple check for demonstration purposes
    return cardNumber.replace(/\s/g, '').length === 16;
}

function validateExpiryDate(expiryDate) {
    const [month, year] = expiryDate.split('/');
    const now = new Date();
    const expiryDateObj = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    return expiryDateObj > now;
}

function validateCVV(cvv) {
    return cvv.length === 3 || cvv.length === 4;
}