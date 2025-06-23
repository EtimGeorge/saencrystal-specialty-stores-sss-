// js/admin/order-management.js
document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.querySelector('#orders-table tbody');
    const orderDetailSection = document.getElementById('order-detail-section');
    const closeOrderDetailBtn = document.getElementById('close-order-detail-btn');
    const orderDetailTitle = document.getElementById('order-detail-title');
    const orderDetailContentArea = document.getElementById('order-detail-content-area');
    const orderStatusUpdateSelect = document.getElementById('order-status-update');
    const saveOrderStatusBtn = document.getElementById('save-order-status-btn');
    let currentEditingOrderId = null;

    // Ensure all elements are present before proceeding
    if (!ordersTableBody || !orderDetailSection || !closeOrderDetailBtn || !orderDetailTitle || !orderDetailContentArea || !orderStatusUpdateSelect || !saveOrderStatusBtn) {
        console.warn('One or more elements for order management are missing from the DOM on order-management.html.');
        // return; // Optionally return if critical elements are missing and page can't function
    }

    let sampleOrders = [
        { id: 'ORD1001', customerEmail: 'customer1@example.com', date: '2024-07-20', totalAmount: 15500.00, status: 'pending_confirmation', items: [{product_name:'Sample Product Alpha', quantity:1, price_per_unit:5000, total_price: 5000}, {product_name:'Another Product Beta', quantity:3, price_per_unit:3500, total_price: 10500}], shippingAddress: '123 Main St, Lagos', customerName: 'John Doe', customerPhone: '08012345678' },
        { id: 'ORD1002', customerEmail: 'another@example.com', date: '2024-07-19', totalAmount: 8250.00, status: 'shipped', items: [{product_name:'Product Gamma', quantity:2, price_per_unit:2000, total_price: 4000}, {product_name:'Delta Drink', quantity:1, price_per_unit:4250, total_price: 4250}], shippingAddress: '456 Oak Ave, Abuja', customerName: 'Jane Smith', customerPhone: '09087654321' },
        { id: 'ORD1003', customerEmail: 'guest@example.com', date: '2024-07-18', totalAmount: 22000.00, status: 'delivered', items: [{product_name:'Epsilon Bread', quantity:1, price_per_unit:10000, total_price: 10000}, {product_name:'Sample Product Alpha', quantity:2, price_per_unit:6000, total_price: 12000}], shippingAddress: '789 Pine Rd, Ibadan', customerName: 'Guest User', customerPhone: 'N/A' }
    ];

    const statusClasses = { // For styling status badges
        pending_confirmation: 'status-pending',
        confirmed: 'status-processing',
        processing: 'status-processing',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled',
        refunded: 'status-refunded',
        default: 'status-default'
    };
    const statusDisplayNames = { // For user-friendly display
        pending_confirmation: 'Pending Confirmation',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded'
    };


    function renderOrdersTable() {
        if (!ordersTableBody) return;
        ordersTableBody.innerHTML = '';
        sampleOrders.forEach(order => {
            const row = ordersTableBody.insertRow();
            const displayStatus = statusDisplayNames[order.status] || order.status.charAt(0).toUpperCase() + order.status.slice(1);
            const statusClass = statusClasses[order.status] || statusClasses.default;
            row.innerHTML = `
                <td><a href="#" class="order-id-link" data-order-id="${order.id}">${order.id}</a></td>
                <td>${order.customerName || order.customerEmail}</td>
                <td>${order.date}</td>
                <td>₦${order.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
                <td><button class="btn btn-sm btn-view-details" data-order-id="${order.id}">View Details</button></td>`;
        });
        attachOrderActionListeners();
    }

    function displayOrderDetails(orderId) {
        const order = sampleOrders.find(o => o.id === orderId);
        if (!order || !orderDetailSection || !orderDetailTitle || !orderDetailContentArea || !orderStatusUpdateSelect) {
            console.error("Cannot display order details, critical elements missing or order not found.");
            return;
        }

        currentEditingOrderId = orderId;
        orderDetailTitle.textContent = `Order Details: #${order.id}`;

        let itemsHtml = '<ul class="order-items-list">'; // Added class for styling
        order.items.forEach(item => {
            itemsHtml += `<li>${item.product_name || item.name} (x${item.quantity}) - ₦${item.total_price.toFixed(2)}</li>`;
        });
        itemsHtml += '</ul>';

        const displayStatus = statusDisplayNames[order.status] || order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const statusClass = statusClasses[order.status] || statusClasses.default;

        orderDetailContentArea.innerHTML = `
            <p><strong>Customer Name:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Customer Email:</strong> ${order.customerEmail}</p>
            <p><strong>Customer Phone:</strong> ${order.customerPhone || 'N/A'}</p>
            <hr>
            <p><strong>Order Date:</strong> ${order.date}</p>
            <p><strong>Total Amount:</strong> ₦${order.totalAmount.toFixed(2)}</p>
            <p><strong>Current Status:</strong> <span class="status-badge ${statusClass}">${displayStatus}</span></p>
            <p><strong>Shipping Address:</strong> ${order.shippingAddress || 'N/A'}</p>
            <hr>
            <p><strong>Items:</strong></p>${itemsHtml}
        `;
        orderStatusUpdateSelect.value = order.status; // Set dropdown to current status
        orderDetailSection.style.display = 'block';
        orderDetailSection.classList.add('active');
    }

    if (closeOrderDetailBtn) {
        closeOrderDetailBtn.addEventListener('click', () => {
            if(orderDetailSection) {
                orderDetailSection.style.display = 'none';
                orderDetailSection.classList.remove('active');
            }
            currentEditingOrderId = null;
        });
    }

    if (saveOrderStatusBtn && orderStatusUpdateSelect) {
        saveOrderStatusBtn.addEventListener('click', () => {
            if (!currentEditingOrderId) return;
            const newStatus = orderStatusUpdateSelect.value;
            const orderIndex = sampleOrders.findIndex(o => o.id === currentEditingOrderId);
            if (orderIndex > -1) {
                sampleOrders[orderIndex].status = newStatus;
                alert(`Order ${currentEditingOrderId} status updated to ${statusDisplayNames[newStatus] || newStatus} (simulated).`);
                renderOrdersTable();
                if(orderDetailSection) {
                    orderDetailSection.style.display = 'none';
                    orderDetailSection.classList.remove('active');
                }
                currentEditingOrderId = null;
            }
        });
    }

    function attachOrderActionListeners() {
        if (!ordersTableBody) return;
        ordersTableBody.addEventListener('click', function(event){ // Use event delegation
            const targetElement = event.target.closest('[data-order-id]'); // Get closest element with data-order-id
            if(!targetElement) return;

            const orderId = targetElement.dataset.orderId;
            if(targetElement.classList.contains('btn-view-details') || targetElement.classList.contains('order-id-link')) {
                 if(event.target.tagName === 'A') event.preventDefault(); // Prevent link navigation for order ID link
                 displayOrderDetails(orderId);
            }
        });
    }

    if (ordersTableBody) {
        renderOrdersTable(); // Initial render
    } else {
        // This console.warn might be hit if the script is included on pages other than order-management.html
        // or if the HTML structure doesn't match.
        // console.warn("Orders table body not found for initial render on this page.");
    }
});