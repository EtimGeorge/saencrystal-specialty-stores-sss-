// js/category.js

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  setupFilters();
  setupPagination();
});

async function fetchProducts() {
  try {
      const response = await fetch('/api/products');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const products = await response.json();
      displayProducts(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      simulateProducts(); // Run simulation if API fails
  }
}

function simulateProducts() {
  const simulatedProducts = [
      { id: 1, name: 'Simulated Product 1', price: 19.99, image: '/assets/images/client/products/product1.jpg' },
      { id: 2, name: 'Simulated Product 2', price: 29.99, image: '/assets/images/client/products/product2.jpg' },
      { id: 3, name: 'Simulated Product 3', price: 39.99, image: '/assets/images/client/products/product3.jpg' },
      { id: 4, name: 'Simulated Product 4', price: 59.99, image: '/assets/images/client/products/product3.jpg' },
      // Add more simulated products as needed
  ];
  displayProducts(simulatedProducts);
}

function displayProducts(products) {
  const productGrid = document.querySelector('.product-grid');
  productGrid.innerHTML = ''; // Clear existing products
  products.forEach(product => {
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
      <button onclick="addToCart(${product.id})">Add to Cart</button>
  `;
  return card;
}

async function setupFilters() {
  try {
      const response = await fetch('/api/filters');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const filters = await response.json();
      displayFilters(filters);
  } catch (error) {
      console.error('Error fetching filters:', error);
      simulateFilters(); // Run simulation if API fails
  }
}

function simulateFilters() {
  const simulatedFilters = [
      { id: 'category', name: 'Category', options: ['Electronics', 'Clothing', 'Books'] },
      { id: 'price', name: 'Price Range', options: ['Under $25', '$25 - $50', 'Over $50'] },
      // Add more simulated filters as needed
  ];
  displayFilters(simulatedFilters);
}

function displayFilters(filters) {
  const filterSection = document.querySelector('.category-filters');
  filters.forEach(filter => {
      const filterElement = createFilterElement(filter);
      filterSection.appendChild(filterElement);
  });
}

function createFilterElement(filter) {
  const filterDiv = document.createElement('div');
  filterDiv.classList.add('filter');
  filterDiv.innerHTML = `
      <h3>${filter.name}</h3>
      <select id="${filter.id}">
          ${filter.options.map(option => `<option value="${option}">${option}</option>`).join('')}
      </select>
  `;
  return filterDiv;
}

async function setupPagination() {
  try {
      const response = await fetch('/api/product-count');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const { totalProducts } = await response.json();
      displayPagination(totalProducts);
  } catch (error) {
      console.error('Error fetching product count:', error);
      simulatePagination(); // Run simulation if API fails
  }
}

function simulatePagination() {
  const simulatedTotalProducts = 50; // Simulated total number of products
  displayPagination(simulatedTotalProducts);
}

function displayPagination(totalProducts) {
  const productsPerPage = 12; // Adjust as needed
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const paginationSection = document.querySelector('.pagination');
  paginationSection.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.onclick = () => changePage(i);
      paginationSection.appendChild(pageButton);
  }
}

function changePage(pageNumber) {
  console.log(`Changing to page ${pageNumber}`);
  // Implement page change logic here
  // This would typically involve fetching products for the selected page
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
      simulateAddToCart(productId); // Run simulation if API fails
  }
}

function simulateAddToCart(productId) {
  console.log(`Simulated: Product ${productId} added to cart`);
  // Update cart UI here (simulated)
}