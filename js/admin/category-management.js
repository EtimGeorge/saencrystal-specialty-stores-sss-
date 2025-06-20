document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('add-category-btn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const editCategoryModal = document.getElementById('editCategoryModal');
    const deleteCategoryModal = document.getElementById('deleteCategoryModal');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    const addCategoryForm = document.getElementById('add-category-form');
    const editCategoryForm = document.getElementById('edit-category-form');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const categoryTableBody = document.querySelector('#category-table tbody');

    let currentEditCategoryId = null;
    let currentDeleteCategoryId = null;

    // Simulated category data
    let simulatedCategories = [
        { id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
        { id: '2', name: 'Books', description: 'Books and literature' },
        { id: '3', name: 'Clothing', description: 'Apparel and fashion items' }
    ];

    // Modal functions
    const openModal = (modal) => modal.style.display = 'block';
    const closeModal = (modal) => modal.style.display = 'none';

    // Event listeners for modals
    addCategoryBtn.addEventListener('click', () => openModal(addCategoryModal));
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Fetch category data
    async function fetchCategoryData() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const categories = await response.json();
            populateCategoryTable(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Simulate category data
            console.log('Using simulated category data');
            populateCategoryTable(simulatedCategories);
        }
    }

    // Populate category table
    function populateCategoryTable(categories) {
        categoryTableBody.innerHTML = '';
        categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>
                    <button class="edit-btn btn" data-id="${category.id}">Edit</button>
                    <button class="delete-btn btn" data-id="${category.id}">Delete</button>
                </td>
            `;
            categoryTableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditCategoryModal(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openDeleteCategoryModal(e.target.dataset.id));
        });
    }

    // Add category
    addCategoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const categoryId = document.getElementById('category-id').value;
        const categoryName = document.getElementById('category-name').value;
        const categoryDescription = document.getElementById('category-description').value;

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: categoryId, name: categoryName, description: categoryDescription }),
            });

            if (!response.ok) throw new Error('Failed to add category');

            addCategoryForm.reset();
            closeModal(addCategoryModal);
            fetchCategoryData(); // Refresh the category list
        } catch (error) {
            console.error('Error adding category:', error);
            // Simulate adding a category
            console.log('Simulating category addition');
            simulatedCategories.push({ id: categoryId, name: categoryName, description: categoryDescription });
            addCategoryForm.reset();
            closeModal(addCategoryModal);
            populateCategoryTable(simulatedCategories);
        }
    });

    // Edit category
    function openEditCategoryModal(categoryId) {
        currentEditCategoryId = categoryId;
        // Fetch the category details and populate the form
        fetch(`/api/categories/${categoryId}`)
            .then(response => response.json())
            .then(category => {
                document.getElementById('edit-category-id').value = category.id;
                document.getElementById('edit-category-name').value = category.name;
                document.getElementById('edit-category-description').value = category.description;
                openModal(editCategoryModal);
            })
            .catch(error => {
                console.error('Error fetching category details:', error);
                // Simulate fetching category details
                console.log('Simulating category detail fetch');
                const category = simulatedCategories.find(c => c.id === categoryId);
                if (category) {
                    document.getElementById('edit-category-id').value = category.id;
                    document.getElementById('edit-category-name').value = category.name;
                    document.getElementById('edit-category-description').value = category.description;
                    openModal(editCategoryModal);
                }
            });
    }

    editCategoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const categoryName = document.getElementById('edit-category-name').value;
        const categoryDescription = document.getElementById('edit-category-description').value;

        try {
            const response = await fetch(`/api/categories/${currentEditCategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName, description: categoryDescription }),
            });

            if (!response.ok) throw new Error('Failed to update category');

            editCategoryForm.reset();
            closeModal(editCategoryModal);
            fetchCategoryData(); // Refresh the category list
        } catch (error) {
            console.error('Error updating category:', error);
            // Simulate updating a category
            console.log('Simulating category update');
            const categoryIndex = simulatedCategories.findIndex(c => c.id === currentEditCategoryId);
            if (categoryIndex !== -1) {
                simulatedCategories[categoryIndex].name = categoryName;
                simulatedCategories[categoryIndex].description = categoryDescription;
            }
            editCategoryForm.reset();
            closeModal(editCategoryModal);
            populateCategoryTable(simulatedCategories);
        }
    });

    // Delete category
    function openDeleteCategoryModal(categoryId) {
        currentDeleteCategoryId = categoryId;
        openModal(deleteCategoryModal);
    }

    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/categories/${currentDeleteCategoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete category');

            closeModal(deleteCategoryModal);
            fetchCategoryData(); // Refresh the category list
        } catch (error) {
            console.error('Error deleting category:', error);
            // Simulate deleting a category
            console.log('Simulating category deletion');
            simulatedCategories = simulatedCategories.filter(c => c.id !== currentDeleteCategoryId);
            closeModal(deleteCategoryModal);
            populateCategoryTable(simulatedCategories);
        }
    });

    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteCategoryModal));

    // Initial fetch of category data
    fetchCategoryData();
});