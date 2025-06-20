document.addEventListener('DOMContentLoaded', function () {
  const notificationForm = document.getElementById('notificationForm');
  const notificationsList = document.getElementById('notifications');

  // Simulated data
  const notifications = [
      { title: 'New Product Added', message: 'A new product has been added to the inventory.' },
      { title: 'Stock Alert', message: 'Stock levels for a popular product are running low.' },
      { title: 'Order Received', message: 'A new order has been placed by a customer.' }
  ];

  // Display notifications
  notifications.forEach(notification => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${notification.title}</strong><p>${notification.message}</p>`;
      notificationsList.appendChild(li);
  });

  // Handle form submission
  notificationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('notificationTitle').value;
      const message = document.getElementById('notificationMessage').value;

      // Simulate sending a notification
      notificationsList.innerHTML += `
          <li>
              <strong>${title}</strong>
              <p>${message}</p>
          </li>
      `;

      // Clear the form
      notificationForm.reset();
  });
});
