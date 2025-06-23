// js/admin/inventory-overview.js
document.addEventListener('DOMContentLoaded', () => {
    const inventoryTableBody = document.querySelector('#inventory-table tbody');
    const filterDepartmentSelect = document.getElementById('filter-department');
    const filterCategorySelect = document.getElementById('filter-category'); // Assuming this will be populated based on department
    const filterStockStatusSelect = document.getElementById('filter-stock-status');
    const applyFiltersBtn = document.getElementById('apply-inventory-filters-btn');

    // Summary card elements - Ensure these IDs match the dashboard HTML if reusing stats there, or make them unique
    const totalItemsEl = document.getElementById('total-items-stat');
    const lowStockItemsEl = document.getElementById('low-stock-stat');
    const outOfStockItemsEl = document.getElementById('out-of-stock-stat');
    const mostStockedEl = document.getElementById('most-stocked-item-stat');

    if (!inventoryTableBody && (!totalItemsEl || !lowStockItemsEl || !outOfStockItemsEl || !mostStockedEl)) {
        // If neither table nor all stat elements are present, this script might be on the wrong page or HTML is incomplete.
        // console.warn("Required elements for inventory overview not found on this page.");
        // return; // Exit if this script should only run on inventory-overview.html with all parts
    }

    // Sample Data (consistent with product management for product names/SKUs)
    let sampleInventory = [
        { id:'prod_1', productName: 'Sample Product Alpha', sku: 'SKU001', department: 'Grocery & Food', departmentId: 'dept_1', category: 'Fresh Produce', categoryId: 'cat_1a', currentStock: 150 },
        { id:'prod_2', productName: 'Another Product Beta', sku: 'SKU002', department: 'Bakery', departmentId: 'dept_2', category: 'Cakes', categoryId: 'cat_2a', currentStock: 5 },
        { id:'prod_3', productName: 'Product Gamma', sku: 'SKU003', department: 'Tech & Electronics', departmentId: 'dept_3', category: 'Gadgets', categoryId: 'cat_3a', currentStock: 0 },
        { id:'prod_4', productName: 'Delta Drink', sku: 'SKU004', department: 'Grocery & Food', departmentId: 'dept_1', category: 'Beverages', categoryId: 'cat_1c', currentStock: 200 },
        { id:'prod_5', productName: 'Epsilon Bread', sku: 'SKU005', department: 'Bakery', departmentId: 'dept_2', category: 'Breads', categoryId: 'cat_2b', currentStock: 8 }
    ];

    // From product-management.js - should ideally be shared or fetched
    let sampleDepartments = [
        { id: 'dept_1', name: 'Grocery & Food' },
        { id: 'dept_2', name: 'Bakery' },
        { id: 'dept_3', name: 'Tech & Electronics'}
    ];
    let sampleCategories = { // Matched category IDs to sampleInventory for consistency
        'dept_1': [{ id: 'cat_1a', name: 'Fresh Produce' }, { id: 'cat_1b', name: 'Dry Goods' }, { id: 'cat_1c', name: 'Beverages'}],
        'dept_2': [{ id: 'cat_2a', name: 'Cakes' }, { id: 'cat_2b', name: 'Breads' }],
        'dept_3': [{ id: 'cat_3a', name: 'Gadgets'}, {id: 'cat_3b', name: 'Audio'}]
    };

    function populateDropdown(selectElement, items, defaultOptionText = 'Select Option', valueField = 'id', textField = 'name') {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            selectElement.appendChild(option);
        });
    }

    if (filterDepartmentSelect) {
        populateDropdown(filterDepartmentSelect, sampleDepartments, 'All Departments');
        filterDepartmentSelect.addEventListener('change', function() {
            const selectedDeptId = this.value;
            const categories = sampleCategories[selectedDeptId] || [];
            populateDropdown(filterCategorySelect, categories, 'All Categories');
        });
    }

    if (filterCategorySelect) {
        populateDropdown(filterCategorySelect, [], 'All Categories'); // Initial empty state
    }


    function getStockStatus(stock) {
        if (stock === 0) return { text: 'Out of Stock', class: 'status-out-of-stock status-badge' };
        if (stock > 0 && stock < 10) return { text: 'Low Stock', class: 'status-low-stock status-badge' };
        if (stock >= 10) return { text: 'In Stock', class: 'status-in-stock status-badge' };
        return { text: 'Unknown', class: 'status-default status-badge'}; // Fallback for undefined/NaN stock
    }

    function renderInventoryTable(inventoryToRender) {
        if (!inventoryTableBody) return;
        inventoryTableBody.innerHTML = '';
        inventoryToRender.forEach(item => {
            const status = getStockStatus(item.currentStock);
            const row = inventoryTableBody.insertRow();
            row.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.sku}</td>
                <td>${item.department}</td>
                <td>${item.category}</td>
                <td>${item.currentStock}</td>
                <td><span class="${status.class}">${status.text}</span></td>`;
        });
    }

    function updateSummaryCards(inventory) {
         if (!totalItemsEl || !lowStockItemsEl || !outOfStockItemsEl || !mostStockedEl) {
            return;
         }

         const totalStockSum = inventory.reduce((sum, item) => sum + (Number.isInteger(item.currentStock) ? item.currentStock : 0), 0);
         const lowStockCount = inventory.filter(item => item.currentStock > 0 && item.currentStock < 10).length;
         const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;

         let mostStockedItemDetails = 'N/A';
         if (inventory.length > 0) {
             // Filter out items with no stock before finding the max, unless all items are 0 stock
             const stockedInventory = inventory.filter(item => item.currentStock > 0);
             if(stockedInventory.length > 0) {
                const mostStocked = stockedInventory.reduce((max, item) => item.currentStock > max.currentStock ? item : max, stockedInventory[0]);
                mostStockedItemDetails = `${mostStocked.productName} (${mostStocked.currentStock})`;
             } else {
                mostStockedItemDetails = 'None in stock';
             }
         }

         totalItemsEl.textContent = totalStockSum;
         lowStockItemsEl.textContent = lowStockCount;
         outOfStockItemsEl.textContent = outOfStockCount;
         mostStockedEl.textContent = mostStockedItemDetails;
    }

    function applyAllFilters() {
         const deptFilterVal = filterDepartmentSelect ? filterDepartmentSelect.value : '';
         const catFilterVal = filterCategorySelect ? filterCategorySelect.value : '';
         const stockStatusFilterVal = filterStockStatusSelect ? filterStockStatusSelect.value : '';

         let filtered = sampleInventory.filter(item => {
             if (deptFilterVal && item.departmentId !== deptFilterVal) return false;
             if (catFilterVal && item.categoryId !== catFilterVal) return false;

             if (stockStatusFilterVal) {
                 if (stockStatusFilterVal === 'low_stock' && !(item.currentStock > 0 && item.currentStock < 10)) return false;
                 if (stockStatusFilterVal === 'out_of_stock' && item.currentStock !== 0) return false;
                 if (stockStatusFilterVal === 'in_stock' && (item.currentStock === 0 || (item.currentStock > 0 && item.currentStock <10))) return false; // Corrected in_stock logic
             }
             return true;
         });
         renderInventoryTable(filtered);
         updateSummaryCards(filtered);
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAllFilters);
    }

    // Initial load
    applyAllFilters();
});
