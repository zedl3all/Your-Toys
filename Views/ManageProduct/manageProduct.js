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
            // Fetch product details and populate the form
            fetch(`/getProduct/${productId}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('editProductName').value = data.productName;
                    document.getElementById('editDescription').value = data.description;
                    document.getElementById('editPrice').value = data.price;
                    document.getElementById('editSize').value = data.size;
                    document.getElementById('editAmount').value = data.amount;
                    // Handle image upload if needed
                })
                .catch(error => console.error('Error fetching product details:', error));

            // Display the modal
            document.getElementById('editModal').style.display = 'block';
        }

        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        // Close the modal when clicking outside of it
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // Handle form submission
        document.getElementById('editForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            const productId = formData.get('productId'); // Ensure you have a hidden input for productId in the form

            fetch(`/updateProduct/${productId}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Product updated successfully!');
                    closeEditModal();
                    // Optionally, refresh the page or update the product row in the table
                } else {
                    alert('Failed to update product: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('An error occurred while updating the product.');
            });
        });