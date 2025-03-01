let currentProductId = null;

function openEditModal(productId) {
    currentProductId = productId;
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    
    document.getElementById('editProductName').value = 'Loading...';
    document.getElementById('editDescription').value = 'Loading...';
    document.getElementById('editCategories').value = '';
    
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
            
            if (product.categories && product.categories.length > 0) {
                document.getElementById('editCategories').value = product.categories[0].id;
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
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function removeProduct(productId) {
    if (confirm('Are you sure you want to remove this product?')) {
        fetch(`/removeProduct/${productId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Product removed successfully!');
                    location.reload();
                } else {
                    alert('Failed to remove product: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error removing product:', error);
                alert('An error occurred while removing the product.');
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

// Update your form submission handler to combine the ratio fields
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;
            
            const categoryId = document.getElementById('editCategories').value;
            
            const categories = categoryId ? [parseInt(categoryId)] : [];
            
            const jsonData = {
                productName: document.getElementById('editProductName').value,
                description: document.getElementById('editDescription').value,
                price: document.getElementById('editPrice').value,
                size: sizeRatio,
                amount: document.getElementById('editAmount').value,
                categories: categories  // ส่งเป็นอาร์เรย์เพื่อให้เข้ากับโค้ดเดิม
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

document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productName = document.getElementById('addProductName').value.trim();
            const description = document.getElementById('addDescription').value.trim();
            const price = document.getElementById('addPrice').value;
            const amount = document.getElementById('addAmount').value;
            
            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;
            
            const categoryId = document.getElementById('addCategories').value;
            
            const productData = {
                productName: productName,
                description: description,
                price: price,
                size: sizeRatio,
                amount: amount,
                categories: categoryId ? [parseInt(categoryId)] : []
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