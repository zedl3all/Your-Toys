/**
 * Cart Management JavaScript
 * Handles product detail modals, QR code generation, and payment processing
 */

// ===== MODAL MANAGEMENT =====
/**
 * Generic modal display functions
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== PRODUCT DETAIL MODAL =====
/**
 * Shows product detail in modal
 * @param {HTMLElement} productElement - Button element with product data
 */
function showDetailModal(productElement) {
    try {
        // Extract the product data
        const productData = JSON.parse(productElement.getAttribute('data-product'));

        // Set modal content
        document.getElementById('modalProductName').textContent = productData.name;
        document.getElementById('modalProductDetail').textContent = productData.detail || 'No specific details provided';
        document.getElementById('modalProductPrice').textContent = productData.price.toFixed(2);
        document.getElementById('modalProductSize').textContent = productData.size || '1:1';
        document.getElementById('modalProductQuantity').textContent = productData.quantity;

        // Check if there's a custom uploaded image
        const productImage = document.getElementById('modalProductImage');
        if (productData.img) {
            // Use the custom uploaded image from Customize folder
            productImage.src = `/Asset/Customize/${productData.img}`;
            productImage.alt = `${productData.name} - Custom Design`;
        } else {
            // Use the default product image
            productImage.src = `/Asset/Product/${productData.image || 'dummy.jpg'}`;
            productImage.alt = productData.name;
        }

        // Display modal
        showModal('productDetailModal');
    } catch (error) {
        console.error('Error displaying product details:', error);
    }
}

function closeProductDetailModal() {
    closeModal('productDetailModal');
}

// ===== QR CODE PAYMENT MODAL =====
/**
 * Generates QR code and shows payment modal
 */
function generateQR() {
    try {
        const amount = document.getElementById('total-value').innerText;
        const promptpay = '0875513773'; // PromptPay ID

        // Show modal with loading indication
        document.getElementById('qrModal').style.display = 'block';
        document.getElementById('qrContainer').innerHTML = '<div class="loading">Generating QR code...</div>';

        // Format display values
        document.getElementById('promptpayDisplay').textContent = 'ID: ' +
            promptpay.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        document.getElementById('amountDisplay').textContent = '฿ ' + parseFloat(amount).toFixed(2);

        // Fetch QR code from server
        fetch('/getqr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount,
                format: 'json'
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('qrContainer').innerHTML = data.qrCode;
                document.getElementById('uploadSection').style.display = 'block';
            })
            .catch(error => {
                document.getElementById('qrContainer').innerHTML =
                    '<p class="error">Error generating QR code. Please try again.</p>';
                console.error('Error:', error);
            });
    } catch (error) {
        console.error('Error in generateQR:', error);
    }
}

function closeQRModal() {
    closeModal('qrModal');

    // Reset upload section for next use
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('paymentProof').value = '';
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('uploadStatus').textContent = '';
    document.getElementById('uploadStatus').className = 'upload-status';
}

// ===== PAYMENT PROOF UPLOAD =====
/**
 * Handle payment proof file selection
 */
function handleFileSelection(event) {
    const file = event.target.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    const previewContainer = document.getElementById('previewContainer');

    if (file) {
        // Enable upload button
        uploadBtn.disabled = false;

        // Preview the selected image
        const imagePreview = document.getElementById('imagePreview');
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            previewContainer.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        uploadBtn.disabled = true;
        previewContainer.style.display = 'none';
    }
}

/**
 * Handle payment proof upload
 */
function uploadPaymentProof() {
    const fileInput = document.getElementById('paymentProof');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('uploadStatus');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Try getting userId from URL first, then localStorage as backup
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('userId'); // Get from URL query parameter
    
    // If not in URL, try localStorage
    if (!userId) {
        userId = localStorage.getItem('user_id');
    }

    if (!userId) {
        statusDiv.textContent = 'User ID not found. Please log in again.';
        statusDiv.className = 'upload-status status-error';
        return;
    }

    console.log('Using userId:', userId); // Debug output

    if (!file) {
        statusDiv.textContent = 'Please select a file first';
        statusDiv.className = 'upload-status status-error';
        return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('paymentProof', file);
    formData.append('userId', userId);
    formData.append('amount', document.getElementById('total-value').innerText);

    // Disable button and show loading state
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    statusDiv.textContent = 'Uploading your payment proof...';
    statusDiv.className = 'upload-status';

    // Send the file to server with better error handling
    fetch('/upload-payment-proof', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    throw new Error(text || 'Server error');
                }
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            statusDiv.textContent = 'Payment proof uploaded successfully! Redirecting to orders...';
            statusDiv.className = 'upload-status status-success';
            uploadBtn.textContent = 'Uploaded ✓';

            setTimeout(() => {
                window.location.href = `/AllOrder/${userId}`;
            }, 2000);
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        statusDiv.textContent = 'Error uploading payment proof: ' + error.message;
        statusDiv.className = 'upload-status status-error';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Try Again';
    });
}

// ===== EVENT LISTENERS =====
// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // File input listener
    const paymentProofInput = document.getElementById('paymentProof');
    if (paymentProofInput) {
        paymentProofInput.addEventListener('change', handleFileSelection);
    }

    // Upload button listener
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadPaymentProof);
    }
});

document.getElementById('modalProductImage').onerror = function () {
    // If the image fails to load, fall back to a default image
    this.src = '/Asset/Product/dummy.jpg';
    console.log('Failed to load image, using fallback image');
};
