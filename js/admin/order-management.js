document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

  const filterButtons = {
    all: document.getElementById('all-orders'),
    pending: document.getElementById('pending-orders'),
    shipped: document.getElementById('shipped-orders'),
    delivered: document.getElementById('delivered-orders'),
    cancelled: document.getElementById('cancelled-orders')
  };

  Object.keys(filterButtons).forEach(key => {
    filterButtons[key].addEventListener('click', () => {
      fetchOrders(key);
    });
  });

  // Fetch orders from API or use simulated data
  async function fetchOrders(status) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?status=${status}`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const orders = await response.json();
      displayOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to simulated data
      const simulatedOrders = getSimulatedOrders(status);
      displayOrders(simulatedOrders);
    }
  }

  // Simulated order data
  function getSimulatedOrders(status) {
    const allOrders = [
      { id: 201, customer: 'John Doe', product: 'Product A', quantity: 2, price: 50, status: 'Pending' },
      { id: 202, customer: 'Jane Smith', product: 'Product B', quantity: 1, price: 20, status: 'Shipped' },
      { id: 203, customer: 'Jim Brown', product: 'Product C', quantity: 5, price: 100, status: 'Delivered' },
      { id: 204, customer: 'Nancy White', product: 'Product D', quantity: 3, price: 75, status: 'Cancelled' }
    ];
    return status === 'all' ? allOrders : allOrders.filter(order => order.status.toLowerCase() === status);
  }

  // Display orders in the table
  function displayOrders(orders) {
    const orderTableBody = document.getElementById('order-table-body');
    orderTableBody.innerHTML = '';

    orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.product}</td>
        <td>${order.quantity}</td>
        <td>${order.price}</td>
        <td>${order.status}</td>
        <td>
          <button class="action-button view" data-order-id="${order.id}">View</button>
          <button class="action-button edit" data-order-id="${order.id}">Edit</button>
          <button class="action-button delete" data-order-id="${order.id}">Delete</button>
        </td>
      `;
      orderTableBody.appendChild(row);
    });
  }

  const viewOrderModal = document.getElementById('viewOrderModal');
  const editOrderModal = document.getElementById('editOrderModal');
  const deleteOrderModal = document.getElementById('deleteOrderModal');
  const closeModalBtns = document.querySelectorAll('.close-btn');
  const editOrderForm = document.getElementById('edit-order-form');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

  let currentOrderId = null;

  // Function to open a modal
  const openModal = (modal) => {
    modal.style.display = 'block';
  };

  // Function to close a modal
  const closeModal = (modal) => {
    modal.style.display = 'none';
  };

  // Event listeners for closing modals
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
  });

  // Close modals when clicking outside of the modal content
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  });

  // Function to open the view order modal
  async function openViewOrderModal(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const orderDetails = await response.json();
      displayOrderDetails(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to simulated data
      const simulatedOrderDetails = getSimulatedOrderDetails(orderId);
      displayOrderDetails(simulatedOrderDetails);
    }
  }

  // Function to get simulated order details
  function getSimulatedOrderDetails(orderId) {
    return {
      id: orderId,
      customerName: 'John Doe',
      product: 'Product Name',
      quantity: 2,
      totalPrice: '$100',
      status: 'Pending'
    };
  }

  // Function to display order details in the view modal
  function displayOrderDetails(orderDetails) {
    document.getElementById('order-details').innerHTML = `
      <p><strong>Order ID:</strong> ${orderDetails.id}</p>
      <p><strong>Customer Name:</strong> ${orderDetails.customerName}</p>
      <p><strong>Product:</strong> ${orderDetails.product}</p>
      <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
      <p><strong>Total Price:</strong> ${orderDetails.totalPrice}</p>
      <p><strong>Status:</strong> ${orderDetails.status}</p>
    `;
    openModal(viewOrderModal);
  }

  // Function to open the edit order modal
  async function openEditOrderModal(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const orderDetails = await response.json();
      populateEditForm(orderDetails);
    } catch (error) {
      console.error('Error fetching order details for edit:', error);
      // Fallback to simulated data
      const simulatedOrderDetails = getSimulatedOrderDetails(orderId);
      populateEditForm(simulatedOrderDetails);
    }
  }

  // Function to populate the edit form
  function populateEditForm(orderDetails) {
    document.getElementById('edit-order-id').value = orderDetails.id;
    document.getElementById('edit-customer-name').value = orderDetails.customerName;
    document.getElementById('edit-product').value = orderDetails.product;
    document.getElementById('edit-quantity').value = orderDetails.quantity;
    document.getElementById('edit-total-price').value = orderDetails.totalPrice;
    document.getElementById('edit-status').value = orderDetails.status;

    openModal(editOrderModal);
  }

  // Function to open the delete order modal
  function openDeleteOrderModal(orderId) {
    currentOrderId = orderId;
    openModal(deleteOrderModal);
  }

  // Event listener for editing an order
  editOrderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedOrderDetails = {
      id: document.getElementById('edit-order-id').value,
      customerName: document.getElementById('edit-customer-name').value,
      product: document.getElementById('edit-product').value,
      quantity: document.getElementById('edit-quantity').value,
      totalPrice: document.getElementById('edit-total-price').value,
      status: document.getElementById('edit-status').value,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${updatedOrderDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrderDetails),
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      console.log('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      // Simulated successful update
      console.log('Simulated order update:', updatedOrderDetails);
    }

    closeModal(editOrderModal);
    fetchOrders('all'); // Refresh the order list
  });

  // Event listener for confirming order deletion
  confirmDeleteBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${currentOrderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      console.log(`Order ${currentOrderId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting order:', error);
      // Simulated successful deletion
      console.log(`Simulated: Order ${currentOrderId} deleted`);
    }

    closeModal(deleteOrderModal);
    fetchOrders('all'); // Refresh the order list
  });

  // Event listener for canceling order deletion
  cancelDeleteBtn.addEventListener('click', () => {
    closeModal(deleteOrderModal);
  });

  // Event delegation for order actions
  const orderTableBody = document.getElementById('order-table-body');
  orderTableBody.addEventListener('click', (event) => {
    const orderId = event.target.dataset.orderId;
    if (event.target.classList.contains('view')) {
      openViewOrderModal(orderId);
    } else if (event.target.classList.contains('edit')) {
      openEditOrderModal(orderId);
    } else if (event.target.classList.contains('delete')) {
      openDeleteOrderModal(orderId);
    }
  });

  // Initial load of all orders
  fetchOrders('all');
});