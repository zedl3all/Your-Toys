let currentProductId = null;

function openEditModal(productId) {
    currentProductId = productId;
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    document.getElementById('editProductName').value = 'Loading...';
    document.getElementById('editDescription').value = 'Loading...';

    // Reset checkboxes (uncheck all)
    document.querySelectorAll('#editModal input[name="category[]"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    fetch(`/manageProduct/product/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editDescription').value = product.description;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editAmount').value = product.amount;

            // Set ratio values if available
            if (product.size) {
                const [x, y] = product.size.split(':');
                document.getElementById('number_x').value = x || 1;
                document.getElementById('number_y').value = y || 1;
            }

            // Check appropriate category checkboxes
            if (product.categories && product.categories.length > 0) {
                const categoryIds = product.categories.map(cat => cat.id);
                document.querySelectorAll('#editModal input[name="category[]"]').forEach(checkbox => {
                    checkbox.checked = categoryIds.includes(parseInt(checkbox.value));
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load product data');
            closeEditModal();
        });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'block';

    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.reset();

        document.getElementById('addProductName').value = '';
        document.getElementById('addDescription').value = '';
        document.getElementById('addPrice').value = '';
        document.getElementById('addAmount').value = '';

        document.getElementById('number_x').value = '1';
        document.getElementById('number_y').value = '1';

        document.querySelectorAll('#addModal input[name="category[]"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function removeProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/manageProduct/product/${productId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Product deleted successfully');
                    window.location.reload();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete product');
            });
    }
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
    if (event.target == addModal) {
        addModal.style.display = 'none';
    }
}

// Update form submission handlers
document.addEventListener('DOMContentLoaded', function () {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get selected categories from checkboxes
            const selectedCategories = [];
            document.querySelectorAll('#editModal input[name="category[]"]:checked').forEach(checkbox => {
                selectedCategories.push(parseInt(checkbox.value));
            });

            // Validate at least one category is selected
            if (selectedCategories.length === 0) {
                const container = document.querySelector('#editModal .category-checkbox-container');
                container.classList.add('is-invalid');
                const feedback = document.getElementById('edit-category-feedback');
                feedback.style.display = 'block !important';
                alert('Please select at least one category');
                return false;
            }

            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;

            const formData = new FormData();
            formData.append('productName', document.getElementById('editProductName').value);
            formData.append('description', document.getElementById('editDescription').value);
            formData.append('price', document.getElementById('editPrice').value);
            formData.append('size', sizeRatio);
            formData.append('amount', document.getElementById('editAmount').value);
            formData.append('categories', JSON.stringify(selectedCategories));
            formData.append('image', document.getElementById('editImage').files[0]);

            fetch(`/manageProduct/editproducts/${currentProductId}`, {
                method: 'PUT',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    alert('Product updated successfully');
                    closeEditModal();
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to update product');
                });
        });
    }

    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get selected categories from checkboxes
            const selectedCategories = [];
            document.querySelectorAll('#addModal input[name="category[]"]:checked').forEach(checkbox => {
                selectedCategories.push(parseInt(checkbox.value));
            });

            // Validate at least one category is selected
            if (selectedCategories.length === 0) {
                const container = document.querySelector('#addModal .category-checkbox-container');
                container.classList.add('is-invalid');
                const feedback = document.getElementById('add-category-feedback');
                feedback.style.display = 'block !important';
                alert('Please select at least one category');
                return false;
            }

            const productName = document.getElementById('addProductName').value.trim();
            const description = document.getElementById('addDescription').value.trim();
            const price = document.getElementById('addPrice').value;
            const amount = document.getElementById('addAmount').value;

            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;

            const formData = new FormData();
            formData.append('productName', productName);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('amount', amount);
            formData.append('number_x', x);
            formData.append('number_y', y);
            formData.append('image', document.getElementById('addImage').files[0]);
            formData.append('categories', JSON.stringify(selectedCategories));

            fetch('/manageProduct/addProduct', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Product added successfully');
                        closeAddModal();
                        window.location.reload();
                    } else {
                        alert('Failed to add product: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to add product');
                });
        });
    }
});

