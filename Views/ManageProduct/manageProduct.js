let currentProductId = null;

function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('status-notification');
    
    // Always create a new notification to ensure animation plays
    if (notification) {
        notification.remove();
    }
    
    notification = document.createElement('div');
    notification.id = 'status-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(45deg, #FFC107, #ffdb4d);
        color: #333;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        z-index: 1000;
        font-weight: 500;
    `;
    
    // Update and show notification
    notification.innerHTML = `<i class="fas fa-bell me-2"></i> ${message}`;
    document.body.appendChild(notification);
    
    // Remove after animation completes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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

            // Set the product image in the preview
            if (product.image) {
                const editImagePreview = document.getElementById('editImagePreview');
                editImagePreview.src = `/Asset/Product/${product.image}`;
                editImagePreview.style.opacity = '1';
                editImagePreview.nextElementSibling.style.display = 'none';
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
    
    // Reset image preview to placeholder
    const imagePreview = document.getElementById('editImagePreview');
    const noImageText = imagePreview.nextElementSibling;
    imagePreview.src = '/Asset/placeholder-image.webp';
    imagePreview.style.opacity = '0.5';
    noImageText.style.display = 'block';
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
    
    // Reset image preview to placeholder
    const imagePreview = document.getElementById('addImagePreview');
    const noImageText = imagePreview.nextElementSibling;
    imagePreview.src = '/Asset/placeholder-image.webp';
    imagePreview.style.opacity = '0.5';
    noImageText.style.display = 'block';
}

function removeProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/manageProduct/product/${productId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Product deleted successfully');
                    window.location.reload();
                } else {
                    showNotification('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to delete product');
            });
    }
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');
    if (event.target == editModal) {
        closeEditModal();
    }
    if (event.target == addModal) {
        closeAddModal();
    }
}

// Add this function after your existing functions

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const noImageText = preview.nextElementSibling;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.opacity = '1';
            noImageText.style.display = 'none';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '/Asset/placeholder-image.webp';
        preview.style.opacity = '0.5';
        noImageText.style.display = 'block';
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
                showNotification('Please select at least one category');
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
                    showNotification('Product updated successfully');
                    closeEditModal();
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to update product');
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
                showNotification('Please select at least one category');
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
                        showNotification('Product added successfully');
                        closeAddModal();
                        window.location.reload();
                    } else {
                        showNotification('Failed to add product: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to add product');
                });
        });
    }
});

