function changeStatus(id, status) {
    // Get the status element
    const statusElement = document.getElementById(id);

    // Remove all existing status classes
    statusElement.classList.remove('status-waiting', 'status-packing', 'status-success', 'status-failed');

    // Add animation class
    statusElement.classList.add('status-changing');

    // Add appropriate status class
    switch (status) {
        case 'Waiting for packing':
            statusElement.classList.add('status-waiting');
            break;
        case 'Packing':
            statusElement.classList.add('status-packing');
            break;
        case 'Success':
            statusElement.classList.add('status-success');
            break;
        case 'Failed':
            statusElement.classList.add('status-failed');
            break;
    }

    // Update the text
    statusElement.innerText = status;

    // Remove animation class after animation completes
    setTimeout(() => {
        statusElement.classList.remove('status-changing');
    }, 500);

    // Show notification
    showNotification(`Order status updated to "${status}"`);

    // Send request to update status in the database
    let order_id = id.replace("status-", "");

    fetch('/updateOrderStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: parseInt(order_id), status: status })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                showNotification(`Failed to update status: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to update status');
        });
}

function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('status-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'status-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #FFC107;
            color: #333;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
            z-index: 1000;
            transform: translateY(100px);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;
        document.body.appendChild(notification);
    }

    // Update and show notification
    notification.textContent = message;
    notification.style.transform = 'translateY(0)';

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
    }, 3000);
}

// Simple function to view bill image
function viewImage(imageSrc) {
    // Get modal elements
    const modal = document.getElementById('imageModal');
    const billImage = document.getElementById('billImage');

    // Log for debugging
    console.log('Opening image:', imageSrc);

    // Set image source
    billImage.src = imageSrc;

    // Display the modal
    modal.style.display = 'block';
}

// Function to close modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Close modal when clicking the X button
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }

    // Close modal when clicking outside the image
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal) {
            closeImageModal();
        }
    });
});