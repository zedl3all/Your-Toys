let currentProductId = null;

function openEditModal(productId) {
    console.log("Opening edit modal for product ID:", productId);
    currentProductId = productId;

    const modal = document.getElementById('editModal');
    document.getElementById('editModal').style.display = 'block';

    document.getElementById('editProductName').value = 'Loading...';
    document.getElementById('editDescription').value = 'Loading...';

    // Fetch product details and populate the form
    // fetch(`/getProduct/${productId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById('editProductName').value = data.productName;
    //         document.getElementById('editDescription').value = data.description;
    //         document.getElementById('editPrice').value = data.price;
    //         document.getElementById('editSize').value = data.size;
    //         document.getElementById('editAmount').value = data.amount;
    //         // Show the modal
    //         document.getElementById('editModal').style.display = 'block';
    //     })
    //     .catch(error => {
    //         console.error('Error fetching product details:', error);
    //     });
    fetch(`/manageProduct/product/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Product data received:", data);
            // Populate form with product data
            document.getElementById('editProductName').value = data.name;
            document.getElementById('editDescription').value = data.description;
            document.getElementById('editPrice').value = data.price;
            
            // Handle the ratio split for the new number_x and number_y fields
            if (data.size && data.size.includes(':')) {
                const [x, y] = data.size.split(':');
                document.getElementById('number_x').value = x;
                document.getElementById('number_y').value = y;
                // Set the aspect ratio data attribute
                document.getElementById('number_x').dataset.aspectRatio = data.size;
            } else {
                // Default values if size format is unexpected
                document.getElementById('number_x').value = 1;
                document.getElementById('number_y').value = 1;
            }

            document.getElementById('editAmount').value = data.amount;
            
            // Add hidden field for product ID if needed
            let idField = document.getElementById('productId');
            if (!idField) {
                idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'productId';
                idField.name = 'id';
                document.getElementById('editForm').appendChild(idField);
            }
            idField.value = productId;
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
            alert('Failed to load product data. Please try again.');
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
            
            // Combine ratio fields into the size field
            const x = document.getElementById('number_x').value;
            const y = document.getElementById('number_y').value;
            const sizeRatio = `${x}:${y}`;
            
            const jsonData = {
                productName: document.getElementById('editProductName').value,
                description: document.getElementById('editDescription').value,
                price: document.getElementById('editPrice').value,
                size: sizeRatio,
                amount: document.getElementById('editAmount').value
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