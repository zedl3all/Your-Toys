function updateAmount(productId, change) {
            const amountElement = document.getElementById(`amount-${productId}`);
            let currentAmount = parseInt(amountElement.value);
            currentAmount += change;
            if (currentAmount < 0) {
                currentAmount = 0;
            }
            amountElement.value = currentAmount;
        }

        function updateAmountDirectly(productId) {
            const amountElement = document.getElementById(`amount-${productId}`);
            let currentAmount = parseInt(amountElement.value);
            if (currentAmount < 0) {
                currentAmount = 0;
                amountElement.value = currentAmount;
            }
        }
function openEditModal(productId) {
            document.getElementById('editModal').style.display = 'block';

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
        window.onclick = function(event) {
            const editModal = document.getElementById('editModal');
            const addModal = document.getElementById('addModal');
            if (event.target == editModal) {
                editModal.style.display = 'none';
            }
            if (event.target == addModal) {
                addModal.style.display = 'none';
            }
        }