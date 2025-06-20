document.addEventListener('DOMContentLoaded', () => {
  // Simulated data fetching
  fetchStockData();

  function fetchStockData() {
      // Simulate fetching data with a timeout
      setTimeout(() => {
          // Simulated stock data
          const stockData = [
              { id: 101, name: 'Product A', category: 'Category 1', stock: 50, threshold: 20, status: 'Normal' },
              { id: 102, name: 'Product B', category: 'Category 2', stock: 10, threshold: 15, status: 'Low Stock' },
              { id: 103, name: 'Product C', category: 'Category 3', stock: 100, threshold: 30, status: 'Normal' },
              { id: 104, name: 'Product D', category: 'Category 1', stock: 5, threshold: 10, status: 'Low Stock' }
          ];

          const stockTableBody = document.getElementById('stock-table-body');
          stockTableBody.innerHTML = '';

          stockData.forEach(stock => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${stock.id}</td>
                  <td>${stock.name}</td>
                  <td>${stock.category}</td>
                  <td>${stock.stock}</td>
                  <td>${stock.threshold}</td>
                  <td class="${stock.status === 'Low Stock' ? 'low-stock' : 'normal-stock'}">${stock.status}</td>
              `;
              stockTableBody.appendChild(row);
          });
      }, 1000);
  }
});
