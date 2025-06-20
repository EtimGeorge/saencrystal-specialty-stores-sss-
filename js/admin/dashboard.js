document.addEventListener('DOMContentLoaded', () => {

  // Simulated data fetching
  fetchData();

  function fetchData() {
      // Simulate fetching data with a timeout
      setTimeout(() => {
          // Simulated data
          const data = {
              totalProducts: 125,
              totalCategories: 25,
              pendingOrders: 30,
              unreadFeedback: 5,
              recentActivities: [
                  'Added 10 new products.',
                  'Updated 3 product categories.',
                  'Shipped 20 orders.',
                  'Responded to 2 customer feedbacks.'
              ]
          };

          // Update the DOM with the fetched data
          document.getElementById('total-products').innerText = `Total Products: ${data.totalProducts}`;
          document.getElementById('total-categories').innerText = `Total Categories: ${data.totalCategories}`;
          document.getElementById('pending-orders').innerText = `Pending Orders: ${data.pendingOrders}`;
          document.getElementById('unread-feedback').innerText = `Unread Feedback: ${data.unreadFeedback}`;

          const recentActivitiesList = document.getElementById('recent-activities');
          recentActivitiesList.innerHTML = '';
          data.recentActivities.forEach(activity => {
              const listItem = document.createElement('li');
              listItem.innerHTML = `<i class="fas fa-check"></i> ${activity}`;
              recentActivitiesList.appendChild(listItem);
          });
      }, 1000);
  }
});
