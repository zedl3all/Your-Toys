// Simple function to view bill image
function viewImages(billSrc, productSrc) {
    const modal = document.getElementById('imageModal');
    const billImage = document.getElementById('billImage');
    const productImage = document.getElementById('productImage');

    // Set image sources
    billImage.src = billSrc;
    productImage.src = productSrc;

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
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }

    window.addEventListener('click', function (event) {
        const modal = document.getElementById('imageModal');
        if (event.target === modal) {
            closeImageModal();
        }
    });
});