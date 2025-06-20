// js/product-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const productId = getProductIdFromUrl();
    fetchProductDetails(productId);
    fetchRelatedProducts(productId);
});

function getProductIdFromUrl() {
    // Extract product ID from URL
    // This is a placeholder implementation. Adjust according to your URL structure.
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        simulateProductDetails(productId);
    }
}

function simulateProductDetails(productId) {
    const simulatedProduct = {
        id: productId,
        name: `Simulated Product ${productId}`,
        price: 99.99,
        description: 'This is a simulated product description. It would typically contain detailed information about the product.',
        image: '/assets/images/client/products/simulated-product.jpg',
        options: {
            size: ['Small', 'Medium', 'Large'],
            color: ['Red', 'Blue', 'Green']
        }
    };
    displayProductDetails(simulatedProduct);
}

function displayProductDetails(product) {
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('product-description').textContent = product.description;

    const imageElement = document.createElement('img');
    imageElement.src = product.image;
    imageElement.alt = product.name;
    document.querySelector('.product-image').appendChild(imageElement);

    const optionsContainer = document.querySelector('.product-options');
    for (const [optionName, optionValues] of Object.entries(product.options)) {
        const select = document.createElement('select');
        select.name = optionName;
        select.id = optionName;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Select ${optionName}`;
        select.appendChild(defaultOption);

        optionValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        const label = document.createElement('label');
        label.htmlFor = optionName;
        label.textContent = `${optionName.charAt(0).toUpperCase() + optionName.slice(1)}:`;

        optionsContainer.appendChild(label);
        optionsContainer.appendChild(select);
    }

    document.getElementById('add-to-cart').addEventListener('click', () => {
        const productId = product.id; // Assuming product.id is available in this scope
        const productName = document.getElementById('product-name').textContent;
        const productPriceText = document.getElementById('product-price').textContent; // e.g., "$99.99" or "₦99.99"
        const productImage = document.getElementById('main-product-image').src;
        const quantity = parseInt(document.getElementById('quantity-input').value) || 1;

        // Use the global addToCart function from cart.js
        if (window.addToCart) {
            window.addToCart(productId, productName, productPriceText, productImage, quantity);
        } else {
            console.error("addToCart function not found. Ensure cart.js is loaded before product-details.js or that addToCart is globally available.");
            alert("Error: Could not add to cart. Functionality missing.");
        }
    });
}

async function fetchRelatedProducts(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/related`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const relatedProducts = await response.json();
        displayRelatedProducts(relatedProducts);
    } catch (error) {
        console.error('Error fetching related products:', error);
        simulateRelatedProducts();
    }
}

function simulateRelatedProducts() {
    const simulatedRelatedProducts = [
        { id: 101, name: 'Related Product 1', price: 79.99, image: '/assets/images/client/products/related-1.jpg' },
        { id: 102, name: 'Related Product 2', price: 89.99, image: '/assets/images/client/products/related-2.jpg' },
        { id: 103, name: 'Related Product 3', price: 69.99, image: '/assets/images/client/products/related-3.jpg' },
    ];
    displayRelatedProducts(simulatedRelatedProducts);
}

function displayRelatedProducts(relatedProducts) {
    const productGrid = document.querySelector('.product-grid');
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button onclick="viewProductDetails(${product.id})">View Details</button>
    `;
    return card;
}

function viewProductDetails(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

async function addToCart(productId) {
    try {
        const response = await fetch('/api/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(`Product ${productId} added to cart`);
        // Update cart UI here
    } catch (error) {
        console.error('Error adding product to cart:', error);
        simulateAddToCart(productId);
    }
}

function simulateAddToCart(productId) {
    console.log(`Simulated: Product ${productId} added to cart`);
    // Update cart UI here (simulated)
}

// Remove the old local addToCart and simulateAddToCart functions as they are replaced by the global one from cart.js
/*
async function addToCart(productId) {
    try {
        const response = await fetch('/api/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(`Product ${productId} added to cart`);
        // Update cart UI here
    } catch (error) {
        console.error('Error adding product to cart:', error);
        simulateAddToCart(productId);
    }
}

function simulateAddToCart(productId) {
    console.log(`Simulated: Product ${productId} added to cart`);
    // Update cart UI here (simulated)
}
*/