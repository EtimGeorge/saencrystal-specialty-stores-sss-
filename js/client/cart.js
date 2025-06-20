// js/client/cart.js

const CART_STORAGE_KEY = 'saencrystalCart';

function getCartItemsFromStorage() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCartItemsToStorage(cartItems) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function loadCartDisplay() {
    const cartItems = getCartItemsFromStorage();
    displayCartItems(cartItems);
    updateCartSummary(cartItems);
}

function displayCartItems(cartItems) {
    const emptyCartMessageEl = document.getElementById('empty-cart-message');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummaryEl = document.querySelector('.cart-summary');

    if (!cartItemsContainer) { // Should only be true if not on cart page.
        return;
    }

    if (cartItems.length === 0) {
        if (emptyCartMessageEl) emptyCartMessageEl.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        if (cartSummaryEl) cartSummaryEl.style.display = 'none';
    } else {
        if (emptyCartMessageEl) emptyCartMessageEl.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        if (cartSummaryEl) cartSummaryEl.style.display = 'block';

        cartItems.forEach(item => {
            const itemElement = createCartItemElement(item);
            cartItemsContainer.appendChild(itemElement);
        });
    }
}

function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    const price = parseFloat(item.price); // Ensure price is a number
    const itemIdStr = String(item.id).replace(/'/g, "\\'"); // Basic escaping for string IDs

    itemElement.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p class="item-price">Price: ₦${price.toFixed(2)}</p>
            <div class="item-quantity-controls">
                <label for="qty-${itemIdStr}">Quantity:</label>
                <div class="quantity-buttons">
                    <button class="quantity-btn" onclick="updateQuantity('${itemIdStr}', ${item.quantity - 1})">-</button>
                    <input type="number" id="qty-${itemIdStr}" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity('${itemIdStr}', parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateQuantity('${itemIdStr}', ${item.quantity + 1})">+</button>
                </div>
            </div>
        </div>
        <div class="cart-item-total-price">
            <p>Total: ₦${(price * item.quantity).toFixed(2)}</p>
        </div>
        <div class="cart-item-remove">
            <button class="remove-btn" onclick="removeItem('${itemIdStr}')">Remove</button>
        </div>
    `;
    return itemElement;
}

// Making updateQuantity and removeItem globally accessible for inline event handlers
window.updateQuantity = async function(itemId, newQuantity) {
    newQuantity = parseInt(newQuantity);

    let cartItems = getCartItemsFromStorage();
    const itemIndex = cartItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        if (newQuantity < 1) {
            // If quantity becomes less than 1, remove the item
            cartItems.splice(itemIndex, 1);
        } else {
            cartItems[itemIndex].quantity = newQuantity;
        }
        saveCartItemsToStorage(cartItems);
        loadCartDisplay(); // Reloads the cart display from storage
        updateMiniCartDisplay(); // Update mini cart as well
    }
}

window.removeItem = async function(itemId) {
    let cartItems = getCartItemsFromStorage();
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCartItemsToStorage(cartItems);
    loadCartDisplay();
    updateMiniCartDisplay();
}

function updateCartSummary(cartItems) {
    const cartSummaryElement = document.querySelector('.cart-summary');
    if (!cartSummaryElement) { // Guard clause if not on cart page
        return;
    }

    const subtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price); // Ensure price is a number
        return total + price * item.quantity;
    }, 0);

    // Assuming tax is 0 for now or handled server-side during actual checkout
    const tax = 0; // Example: subtotal * 0.0;
    const total = subtotal + tax;

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₦${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₦${total.toFixed(2)}`;
}

function addToCart(productId, productName, productPrice, productImage, quantity = 1) { // Added quantity parameter with default 1
    let cartItems = getCartItemsFromStorage();
    const existingItemIndex = cartItems.findIndex(item => item.id === productId);

    // Remove currency symbols and convert to float
    const priceString = String(productPrice).replace(/[^0-9.-]+/g,"");
    const price = parseFloat(priceString);

    if (isNaN(price)) {
        console.error("Invalid product price:", productPrice);
        alert("Error: Product price is invalid.");
        return;
    }

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity; // Use the quantity parameter
    } else {
        cartItems.push({
            id: productId,
            name: productName,
            price: price, // Store as number
            quantity: quantity, // Use the quantity parameter
            image: productImage
        });
    }
    saveCartItemsToStorage(cartItems);
    alert(productName + (quantity > 1 ? ` (x${quantity})` : '') + " added to cart!");
    updateMiniCartDisplay();
}
window.addToCart = addToCart; // Expose to global scope for button onclicks

function updateMiniCartDisplay() {
    const cartItems = getCartItemsFromStorage();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartCountElement = document.getElementById('cart-item-count'); // Assuming you have this in your header
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
    console.log("Mini cart updated. Total items:", totalItems);
}

// Initialize cart display and mini-cart on page load
document.addEventListener('DOMContentLoaded', () => {
    // This check ensures loadCartDisplay only runs on the cart page
    if (document.querySelector('.cart-page')) {
        loadCartDisplay();
    }
    updateMiniCartDisplay(); // Update mini-cart on all pages
});

// Checkout button event listener (if on cart page)
const checkoutButton = document.getElementById('checkout-button');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        // Before redirecting, save the final cart state.
        // This is already implicitly done by updateQuantity/removeItem.
        // If there were direct manipulations not saved, save here.
        // saveCartItemsToStorage(getCartItemsFromStorage()); // Example if needed
        window.location.href = 'checkout.html';
    });
}