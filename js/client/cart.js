// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    fetchCartItems();
});

async function fetchCartItems() {
    try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const cartItems = await response.json();
        displayCartItems(cartItems);
        updateCartSummary(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        simulateCartItems();
    }
}

function simulateCartItems() {
    const simulatedCartItems = [
        { id: 1, name: 'Simulated Product 1', price: 29.99, quantity: 2, image: '/assets/images/client/products/product1.jpg' },
        { id: 2, name: 'Simulated Product 2', price: 39.99, quantity: 1, image: '/assets/images/client/products/product2.jpg' },
    ];
    displayCartItems(simulatedCartItems);
    updateCartSummary(simulatedCartItems);
}

function displayCartItems(cartItems) {
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const itemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
    });
}

function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-price">$${item.price.toFixed(2)}</p>
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
        </div>
        <button onclick="removeItem(${item.id})">Remove</button>
    `;
    return itemElement;
}

async function updateQuantity(itemId, newQuantity) {
    try {
        const response = await fetch(`/api/cart/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId, quantity: newQuantity }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const updatedCart = await response.json();
        displayCartItems(updatedCart);
        updateCartSummary(updatedCart);
    } catch (error) {
        console.error('Error updating cart:', error);
        simulateUpdateQuantity(itemId, newQuantity);
    }
}

function simulateUpdateQuantity(itemId, newQuantity) {
    console.log(`Simulated: Updated quantity for item ${itemId} to ${newQuantity}`);
    fetchCartItems(); // Refresh the cart to reflect changes
}

async function removeItem(itemId) {
    try {
        const response = await fetch(`/api/cart/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const updatedCart = await response.json();
        displayCartItems(updatedCart);
        updateCartSummary(updatedCart);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        simulateRemoveItem(itemId);
    }
}

function simulateRemoveItem(itemId) {
    console.log(`Simulated: Removed item ${itemId} from cart`);
    fetchCartItems(); // Refresh the cart to reflect changes
}

function updateCartSummary(cartItems) {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // Assuming 10% tax rate
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

document.getElementById('checkout-button').addEventListener('click', () => {
    window.location.href = 'checkout.html';
});