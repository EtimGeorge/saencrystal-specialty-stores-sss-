document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    const productTableBody = document.getElementById('productTableBody');
    const viewProductModal = document.getElementById('viewProductModal');
    const editProductModal = document.getElementById('editProductModal');
    const deleteProductModal = document.getElementById('deleteProductModal');
    const editProductForm = document.getElementById('editProductForm');
    const confirmDeleteProduct = document.getElementById('confirmDeleteProduct');
    const cancelDeleteProduct = document.getElementById('cancelDeleteProduct');

    let currentProductId = null;
    let products = [];

    // Simulated product data
    function simulateProductData() {
        return [
            { id: 1, name: 'Product 1', category: 'Category A', price: 19529.99, stock: 100 },
            { id: 0o2, name: 'Product 2', category: 'Category B', price: 29089.99, stock: 50 },
            { id: 3, name: 'Product 3', category: 'Category A', price: 25899.99, stock: 75 }
        ];
    }

    // Fetch products (simulated)
    function fetchProducts() {
        try {
            // Simulating API call
            products = simulateProductData();
            displayProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Display products in the table
    function displayProducts() {
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>&#8358;${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="view" onclick="viewProduct(${product.id})">View</button>
                    <button class="edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="delete" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    }

    // Add new product
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newProduct = {
            id: products.length + 1,
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value)
        };
        products.push(newProduct);
        displayProducts();
        productForm.reset();
    });

    // View product
    window.viewProduct = function(id) {
        const product = products.find(p => p.id === id);
        const viewProductDetails = document.getElementById('viewProductDetails');
        viewProductDetails.innerHTML = `
            <p><strong>ID:</strong> ${product.id}</p>
            <p><strong>Name:</strong> ${product.name}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${product.stock}</p>
        `;
        viewProductModal.style.display = 'block';
    };

    // Edit product
    window.editProduct = function(id) {
        currentProductId = id;
        const product = products.find(p => p.id === id);
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock;
        editProductModal.style.display = 'block';
    };

    editProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const updatedProduct = {
            id: currentProductId,
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            stock: parseInt(document.getElementById('editProductStock').value)
        };
        const index = products.findIndex(p => p.id === currentProductId);
        products[index] = updatedProduct;
        displayProducts();
        editProductModal.style.display = 'none';
    });

    // Delete product
    window.deleteProduct = function(id) {
        currentProductId = id;
        deleteProductModal.style.display = 'block';
    };

    confirmDeleteProduct.addEventListener('click', function() {
        products = products.filter(p => p.id !== currentProductId);
        displayProducts();
        deleteProductModal.style.display = 'none';
    });

    cancelDeleteProduct.addEventListener('click', function() {
        deleteProductModal.style.display = 'none';
    });

    // Close modals when clicking on the close button or outside the modal
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            viewProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
            deleteProductModal.style.display = 'none';
        });
    });

    window.onclick = function(event) {
        if (event.target === viewProductModal || event.target === editProductModal || event.target === deleteProductModal) {
            viewProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
            deleteProductModal.style.display = 'none';
        }
    };

    // Initial fetch of products
    fetchProducts();
});