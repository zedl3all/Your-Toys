let currentProductId = null;

function openEditModal(productId) {
    currentProductId = productId;
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    document.getElementById('editProductName').value = 'Loading...';
    document.getElementById('editDescription').value = 'Loading...';
    
    // Reset any previous selections
    const categoriesSelect = document.getElementById('editCategories');
    Array.from(categoriesSelect.options).forEach(option => option.selected = false);

    fetch(`/manageProduct/product/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editDescription').value = product.description;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editAmount').value = product.amount;

            if (product.size && product.size.includes(':')) {
                const [x, y] = product.size.split(':');
                document.getElementById('number_x').value = x;
                document.getElementById('number_y').value = y;
            }

            // Handle multiple categories
            if (product.categories && product.categories.length > 0) {
                const categoryIds = product.categories.map(cat => cat.id);
                Array.from(categoriesSelect.options).forEach(option => {
                    option.selected = categoryIds.includes(parseInt(option.value));
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

        const categorySelect = document.getElementById('addCategories');
        if (categorySelect) {
            categorySelect.selectedIndex = 0;
        }
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

// Handle form submission for editing a product
document.addEventListener('DOMContentLoaded', function () {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;

            // Get all selected category values instead of just one
            const categorySelect = document.getElementById('editCategories');
            const selectedCategories = Array.from(categorySelect.selectedOptions)
                .map(option => parseInt(option.value));

            const jsonData = {
                productName: document.getElementById('editProductName').value,
                description: document.getElementById('editDescription').value,
                price: document.getElementById('editPrice').value,
                size: sizeRatio,
                amount: document.getElementById('editAmount').value,
                categories: selectedCategories  // Now contains all selected categories
            };

            fetch(`/manageProduct/products/${currentProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            })
                .then(response => response.json())
                .then(data => {
                    alert('Product updated successfully');
                    closeEditModal();
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error updating product:', error);
                    alert('Failed to update product');
                });
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const productName = document.getElementById('addProductName').value.trim();
            const description = document.getElementById('addDescription').value.trim();
            const price = document.getElementById('addPrice').value;
            const amount = document.getElementById('addAmount').value;

            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;

            const categorySelect = document.getElementById('addCategories');
            const selectedCategories = Array.from(categorySelect.selectedOptions)
                .map(option => parseInt(option.value));

            const productData = {
                productName: productName,
                description: description,
                price: price,
                size: sizeRatio,
                amount: amount,
                categories: selectedCategories
            };

            console.log('Sending data:', productData);

            fetch('/manageProduct/addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
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