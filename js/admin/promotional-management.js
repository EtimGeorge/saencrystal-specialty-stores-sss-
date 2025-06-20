document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = {
        all: document.getElementById('all-promos'),
        active: document.getElementById('active-promos'),
        expired: document.getElementById('expired-promos')
    };

    Object.keys(filterButtons).forEach(key => {
        filterButtons[key].addEventListener('click', () => {
            fetchPromotions(key);
        });
    });

    fetchPromotions('all');

    const addPromoForm = document.getElementById('add-promo-form');
    addPromoForm.addEventListener('submit', event => {
        event.preventDefault();
        addPromotion();
    });

    // Modal setup
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeButtons = document.getElementsByClassName('close');

    Array.from(closeButtons).forEach(button => {
        button.onclick = () => {
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        }
    });

    window.onclick = event => {
        if (event.target == editModal || event.target == deleteModal) {
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        }
    };

    document.getElementById('edit-promo-form').addEventListener('submit', event => {
        event.preventDefault();
        updatePromotion();
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        deletePromotion(document.getElementById('deleteModal').dataset.promoId);
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    // Set up an interval to check for expired promotions every minute
    setInterval(checkExpiredPromotions, 60000);
});

function fetchPromotions(type) {
    fetch(`/api/promotions?type=${type}`)
        .then(response => response.json())
        .then(data => {
            displayPromotions(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated feedbacks
            const simulatedData = [
                { id: 401, title: 'Summer Sale', description: 'Up to 50% off on summer items', status: 'Active', start: '2023-06-01T00:00', end: '2023-08-31T23:59' },
                { id: 402, title: 'Winter Clearance', description: 'End of season sale', status: 'Expired', start: '2023-01-01T00:00', end: '2023-03-31T23:59' },
                { id: 403, title: 'Spring Specials', description: 'Discounts on new arrivals', status: 'Active', start: '2023-04-01T00:00', end: '2023-05-31T23:59' }
            ];
            const filteredData = type === 'all' ? simulatedData : simulatedData.filter(promo => promo.status.toLowerCase() === type);
            displayPromotions(filteredData);
        });
}

function displayPromotions(promotions) {
    const promoTableBody = document.getElementById('promo-table-body');
    promoTableBody.innerHTML = '';

    promotions.forEach(promo => {
        const row = document.createElement('tr');
        const now = new Date();
        const endDate = new Date(promo.end);
        const isExpired = endDate < now;
        
        if (isExpired) {
            row.classList.add('expired');
            promo.status = 'Expired';
        }

        row.innerHTML = `
            <td>${promo.id}</td>
            <td>${promo.title}</td>
            <td>${promo.description}</td>
            <td>${formatDateTime(promo.start)}</td>
            <td>${formatDateTime(promo.end)}</td>
            <td>${promo.status}</td>
            <td>
                <button class="action-button edit" onclick="editPromo(${promo.id})">Edit</button>
                <button class="action-button delete" onclick="deletePromo(${promo.id})">Delete</button>
            </td>
        `;
        promoTableBody.appendChild(row);
    });
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
}

function addPromotion() {
    const newPromo = {
        title: document.getElementById('promo-title').value,
        description: document.getElementById('promo-description').value,
        start: document.getElementById('promo-start').value,
        end: document.getElementById('promo-end').value,
        status: document.getElementById('promo-status').value
    };

    fetch('/api/promotions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPromo),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            document.getElementById('add-promo-form').reset();
            fetchPromotions('all');
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated feedback
            alert('New promotion added successfully (simulated)');
            document.getElementById('add-promo-form').reset();
            fetchPromotions('all');
        });
}

function editPromo(promoId) {
    fetch(`/api/promotions/${promoId}`)
        .then(response => response.json())
        .then(data => {
            populateEditForm(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated feedback
            const simulatedPromo = {
                id: promoId,
                title: 'Simulated Promo',
                description: 'This is a simulated promotion for editing',
                start: '2023-07-01T00:00',
                end: '2023-07-31T23:59',
                status: 'Active'
            };
            populateEditForm(simulatedPromo);
        });

    document.getElementById('editModal').style.display = 'block';
}

function populateEditForm(promo) {
    document.getElementById('edit-promo-id').value = promo.id;
    document.getElementById('edit-promo-title').value = promo.title;
    document.getElementById('edit-promo-description').value = promo.description;
    document.getElementById('edit-promo-start').value = promo.start;
    document.getElementById('edit-promo-end').value = promo.end;
    document.getElementById('edit-promo-status').value = promo.status.toLowerCase();
}

function updatePromotion() {
    const updatedPromo = {
        id: document.getElementById('edit-promo-id').value,
        title: document.getElementById('edit-promo-title').value,
        description: document.getElementById('edit-promo-description').value,
        start: document.getElementById('edit-promo-start').value,
        end: document.getElementById('edit-promo-end').value,
        status: document.getElementById('edit-promo-status').value
    };

    fetch(`/api/promotions/${updatedPromo.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPromo),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            document.getElementById('editModal').style.display = 'none';
            fetchPromotions('all');
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated feedback
            alert('Promotion updated successfully (simulated)');
            document.getElementById('editModal').style.display = 'none';
            fetchPromotions('all');
        });
}

function deletePromo(promoId) {
    document.getElementById('deleteModal').style.display = 'block';
    document.getElementById('deleteModal').dataset.promoId = promoId;
}

function deletePromotion(promoId) {
    fetch(`/api/promotions/${promoId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            document.getElementById('deleteModal').style.display = 'none';
            fetchPromotions('all');
        })
        .catch(error => {
            console.error('Error:', error);
            // Simulated feedback
            alert('Promotion deleted successfully (simulated)');
            document.getElementById('deleteModal').style.display = 'none';
            fetchPromotions('all');
        });
}

function checkExpiredPromotions() {
    const now = new Date();
    const rows = document.querySelectorAll('#promo-table-body tr');
    
    rows.forEach(row => {
        const endDate = new Date(row.cells[4].textContent);
        if (endDate < now && row.cells[5].textContent !== 'Expired') {
            row.classList.add('expired');
            row.cells[5].textContent = 'Expired';
        }
    });
}