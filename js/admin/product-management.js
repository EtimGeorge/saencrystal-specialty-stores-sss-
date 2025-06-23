// js/admin/product-management.js
document.addEventListener('DOMContentLoaded', () => {
    const productListSection = document.getElementById('product-list-section');
    const addEditProductSection = document.getElementById('add-edit-product-section');
    const addNewProductBtn = document.getElementById('add-new-product-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productForm = document.getElementById('product-form');
    const productsTableBody = document.querySelector('#products-table tbody');
    const formTitle = document.getElementById('form-title');
    const productIdField = document.getElementById('product-id'); // Hidden input for ID

    // Sample Data
    let sampleDepartments = [
        { id: 'dept_1', name: 'Grocery & Food' },
        { id: 'dept_2', name: 'Bakery' },
        { id: 'dept_3', name: 'Tech & Electronics'}
    ];
    let sampleCategories = {
        'dept_1': [{ id: 'cat_1a', name: 'Fresh Produce' }, { id: 'cat_1b', name: 'Dry Goods' }],
        'dept_2': [{ id: 'cat_2a', name: 'Cakes' }, { id: 'cat_2b', name: 'Breads' }],
        'dept_3': [{ id: 'cat_3a', name: 'Gadgets'}, {id: 'cat_3b', name: 'Audio'}]
    };
    // Ensure sampleProducts match the data structure used by the form and table
    let sampleProducts = [
        { id: 'prod_1', name: 'Sample Product Alpha', sku: 'SKU001', description: 'Short desc for Alpha', detailedDescription: 'Detailed long description for Alpha.', price: 1200.00, stockQuantity: 150, departmentId: 'dept_1', categoryId: 'cat_1a', imageUrlMain: 'https://via.placeholder.com/50x50.png?text=P1', imageUrls: [], isActive: true, isFeatured: false, departmentName: 'Grocery & Food', categoryName: 'Fresh Produce' },
        { id: 'prod_2', name: 'Another Product Beta', sku: 'SKU002', description: 'Short desc for Beta', detailedDescription: 'Detailed long description for Beta, very tasty.', price: 3500.00, stockQuantity: 75, departmentId: 'dept_2', categoryId: 'cat_2a', imageUrlMain: 'https://via.placeholder.com/50x50.png?text=P2', imageUrls: [], isActive: false, isFeatured: true, departmentName: 'Bakery', categoryName: 'Cakes' }
    ];

    function populateDropdown(selectElement, items, defaultOptionText = 'Select Option') {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    }

    const departmentSelect = document.getElementById('product-department');
    const categorySelect = document.getElementById('product-category');

    if (departmentSelect) {
        populateDropdown(departmentSelect, sampleDepartments, 'Select Department');
    }

    if (departmentSelect && categorySelect) {
        departmentSelect.addEventListener('change', function() { // Use function keyword for 'this' or pass element
            const selectedDeptId = this.value;
            const categories = sampleCategories[selectedDeptId] || [];
            populateDropdown(categorySelect, categories, 'Select Category');
        });
    }

    function renderProductsTable() {
        if (!productsTableBody) return;
        productsTableBody.innerHTML = '';
        sampleProducts.forEach(p => {
            const row = productsTableBody.insertRow();
            row.innerHTML = `
                <td><img src="${p.imageUrlMain || 'https://via.placeholder.com/50x50.png?text=Img'}" alt="${p.name}" class="table-product-image"></td>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>${p.departmentName}</td>
                <td>${p.categoryName}</td>
                <td>₦${p.price.toFixed(2)}</td>
                <td>${p.stockQuantity}</td>
                <td><span class="status-${p.isActive ? 'active' : 'inactive'}">${p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${p.isFeatured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn btn-sm btn-edit" data-product-id="${p.id}">Edit</button>
                    <button class="btn btn-sm btn-delete btn-danger" data-product-id="${p.id}">Delete</button>
                </td>`;
        });
        attachTableButtonListeners();
    }

    function showForm(isEdit = false, product = null) {
        if (!addEditProductSection || !productListSection || !formTitle || !productForm || !productIdField || !departmentSelect || !categorySelect) return;

        addEditProductSection.style.display = 'block';
        productListSection.style.display = 'none';
        productForm.reset();
        productIdField.value = ''; // Clear hidden ID field
        populateDropdown(departmentSelect, sampleDepartments, 'Select Department'); // Reset dropdowns
        populateDropdown(categorySelect, [], 'Select Category');


        if (isEdit && product) {
            formTitle.textContent = `Edit Product: ${product.name}`;
            productIdField.value = product.id; // Set the hidden ID field for submission
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-sku').value = product.sku;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-detailed-description').value = product.detailedDescription || '';
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock-quantity').value = product.stockQuantity;
            departmentSelect.value = product.departmentId;

            const event = new Event('change'); // Trigger change to populate categories
            departmentSelect.dispatchEvent(event);

            // Set category after categories are populated (use timeout to ensure DOM update)
            setTimeout(() => {
                if(categorySelect) categorySelect.value = product.categoryId;
            }, 0);

            document.getElementById('product-image-main').value = product.imageUrlMain || '';
            // Assuming product-image-others might be a text input for comma-separated URLs for simplicity here
            document.getElementById('product-image-others').value = product.imageUrls ? product.imageUrls.join(', ') : '';
            document.getElementById('product-status').value = String(product.isActive); // Boolean to string for select
            document.getElementById('product-featured').checked = product.isFeatured;
        } else {
            formTitle.textContent = 'Add New Product';
        }
    }

    function hideForm() {
        if (!addEditProductSection || !productListSection || !productForm || !productIdField) return;
        addEditProductSection.style.display = 'none';
        productListSection.style.display = 'block';
        productForm.reset();
        productIdField.value = '';
    }

    if (addNewProductBtn) {
        addNewProductBtn.addEventListener('click', () => showForm(false));
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideForm);
    }

    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(productForm);
            const submittedData = {};
            formData.forEach((value, key) => {
                submittedData[key] = value;
            });

            // Prepare data object matching sampleProducts structure
            const productData = {
                id: submittedData['product-id'] || `prod_${Date.now()}`, // Use existing ID or generate new
                name: submittedData['product-name'],
                sku: submittedData['product-sku'],
                description: submittedData['product-description'],
                detailedDescription: submittedData['product-detailed-description'],
                price: parseFloat(submittedData['product-price']),
                stockQuantity: parseInt(submittedData['product-stock-quantity'], 10),
                departmentId: submittedData['product-department'],
                categoryId: submittedData['product-category'],
                imageUrlMain: submittedData['product-image-main'],
                imageUrls: submittedData['product-image-others'] ? submittedData['product-image-others'].split(',').map(url => url.trim()) : [],
                isActive: submittedData['product-status'] === 'true',
                isFeatured: formData.has('product-featured'), // Checkbox: 'product-featured' is the name attribute
            };

            const dept = sampleDepartments.find(d => d.id === productData.departmentId);
            const catList = sampleCategories[productData.departmentId] || [];
            const cat = catList.find(c => c.id === productData.categoryId);
            productData.departmentName = dept ? dept.name : 'N/A';
            productData.categoryName = cat ? cat.name : 'N/A';

            if (submittedData['product-id']) { // If there's an ID, it's an edit
                const index = sampleProducts.findIndex(p => p.id === submittedData['product-id']);
                if (index > -1) {
                    sampleProducts[index] = productData; // Replace with new data
                    alert(`Product "${productData.name}" updated (simulated).`);
                }
            } else { // Add new
                sampleProducts.push(productData);
                alert(`Product "${productData.name}" added (simulated).`);
            }
            hideForm();
            renderProductsTable();
        });
    }

    function attachTableButtonListeners() {
        if(!productsTableBody) return;
        productsTableBody.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button');
            if (!targetButton) return;

            const productId = targetButton.dataset.productId;

            if (targetButton.classList.contains('btn-edit')) {
                const productToEdit = sampleProducts.find(p => p.id === productId);
                if (productToEdit) showForm(true, productToEdit);
            } else if (targetButton.classList.contains('btn-delete')) {
                if (confirm(`Are you sure you want to delete product ID ${productId}? (Simulated)`)) {
                    sampleProducts = sampleProducts.filter(p => p.id !== productId);
                    alert(`Product ID ${productId} deleted (simulated).`);
                    renderProductsTable();
                }
            }
        });
    }

    if (productsTableBody) {
        renderProductsTable(); // Initial render
    } else {
        console.warn("Product table body not found for initial render.");
    }
});