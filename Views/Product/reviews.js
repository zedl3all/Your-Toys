document.addEventListener('DOMContentLoaded', function() {
    // Star rating selection functionality
    const starItems = document.querySelectorAll('.star-item');
    const ratingValue = document.getElementById('ratingValue');
    
    // Handle star hover effects
    starItems.forEach(star => {
        // When hovering over a star
        star.addEventListener('mouseenter', function() {
            const hoverValue = parseInt(this.dataset.value);
            
            starItems.forEach(s => {
                const starValue = parseInt(s.dataset.value);
                if (starValue <= hoverValue) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                    s.classList.add('text-warning');
                }
            });
        });
        
        // When moving away from stars
        star.addEventListener('mouseleave', function() {
            const selectedRating = parseInt(ratingValue.value) || 0;
            
            starItems.forEach(s => {
                const starValue = parseInt(s.dataset.value);
                if (starValue <= selectedRating) {
                    // Keep selected stars filled
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                    s.classList.add('text-warning');
                } else {
                    // Reset unselected stars
                    s.classList.remove('bi-star-fill', 'text-warning');
                    s.classList.add('bi-star');
                }
            });
        });
        
        // When clicking a star
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            ratingValue.value = value;
            
            // Update visual state of all stars
            starItems.forEach(s => {
                const starValue = parseInt(s.dataset.value);
                if (starValue <= value) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill', 'active', 'text-warning');
                } else {
                    s.classList.remove('bi-star-fill', 'active', 'text-warning');
                    s.classList.add('bi-star');
                }
            });
        });
    });
    
    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    const submitReviewBtn = document.getElementById('submitReview');
    const reviewModal = document.getElementById('reviewModal');
    
    submitReviewBtn.addEventListener('click', function() {
        if (!validateReviewForm()) {
            return;
        }
        
        // Get form data
        const rating = parseInt(ratingValue.value);
        const title = document.getElementById('reviewTitle').value.trim();
        const content = document.getElementById('reviewContent').value.trim();
        
        // Generate demo user data (in a real application, this would come from authentication)
        const username = getRandomUsername();
        const avatarUrl = `https://ui-avatars.com/api/?name=${username.replace(' ', '+')}&background=random`;
        
        // Create timestamp
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        
        // Add review to DOM
        addReviewToDOM({
            username,
            avatarUrl,
            rating,
            title,
            content,
            date: formattedDate
        });
        
        // Update review statistics
        updateReviewStatistics(rating);
        
        // Reset form and close modal
        resetReviewForm();
        const modalInstance = bootstrap.Modal.getInstance(reviewModal);
        modalInstance.hide();
        
        // Show success message
        showToast('Review submitted successfully!');
    });
    
    // Form validation
    function validateReviewForm() {
        const rating = parseInt(ratingValue.value);
        const title = document.getElementById('reviewTitle').value.trim();
        const content = document.getElementById('reviewContent').value.trim();
        
        if (rating === 0 || isNaN(rating)) {
            showValidationError('Please select a star rating');
            return false;
        }
        
        if (title === '') {
            showValidationError('Please enter a review title');
            return false;
        }
        
        if (content === '') {
            showValidationError('Please enter your review');
            return false;
        }
        
        return true;
    }
    
    function showValidationError(message) {
        // Create alert if it doesn't exist
        let alertElement = document.querySelector('#reviewFormAlert');
        if (!alertElement) {
            alertElement = document.createElement('div');
            alertElement.id = 'reviewFormAlert';
            alertElement.className = 'alert alert-danger alert-dismissible fade show mt-3';
            alertElement.innerHTML = `
                <span id="alertMessage"></span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            reviewForm.parentNode.insertBefore(alertElement, reviewForm);
        }
        
        // Show the message
        document.getElementById('alertMessage').textContent = message;
        alertElement.style.display = 'block';
    }
    
    function resetReviewForm() {
        reviewForm.reset();
        ratingValue.value = 0;
        
        // Reset star visuals
        starItems.forEach(s => {
            s.classList.remove('bi-star-fill', 'active', 'text-warning');
            s.classList.add('bi-star');
        });
        
        // Hide any validation errors
        const alertElement = document.querySelector('#reviewFormAlert');
        if (alertElement) {
            alertElement.style.display = 'none';
        }
    }
    
    // Helper functions
    function getRandomUsername() {
        const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Reese', 'Avery'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    function createStarsHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="bi bi-star-fill text-warning"></i>';
            } else if (i - 0.5 === rating) {
                stars += '<i class="bi bi-star-half text-warning"></i>';
            } else {
                stars += '<i class="bi bi-star text-warning"></i>';
            }
        }
        return stars;
    }
    
    function addReviewToDOM(reviewData) {
        const reviewsContainer = document.querySelector('.reviews-container');
        
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item pb-4 mb-4 border-bottom';
        reviewElement.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <div class="avatar me-3">
                    <img src="${reviewData.avatarUrl}" class="rounded-circle" width="48" alt="${reviewData.username}">
                </div>
                <div>
                    <h5 class="mb-0">${reviewData.username}</h5>
                    <div class="text-muted small">Posted on ${reviewData.date}</div>
                </div>
                <div class="stars ms-auto">
                    ${createStarsHTML(reviewData.rating)}
                </div>
            </div>
            <h6 class="review-title fw-bold">${reviewData.title}</h6>
            <p class="review-text">${reviewData.content}</p>
        `;
        
        // Add to the top of the reviews list
        if (reviewsContainer.firstChild) {
            reviewsContainer.insertBefore(reviewElement, reviewsContainer.firstChild);
        } else {
            reviewsContainer.appendChild(reviewElement);
        }
        
        // Add animation effect
        setTimeout(() => {
            reviewElement.classList.add('fade-in');
        }, 10);
    }
    
    function updateReviewStatistics(newRating) {
        // Get current values
        const avgRatingElement = document.querySelector('.display-3.fw-bold');
        const reviewCountText = document.querySelector('.text-muted.mb-0');
        
        const currentAvg = parseFloat(avgRatingElement.textContent);
        const reviewCount = parseInt(reviewCountText.textContent.match(/\d+/)[0]);
        const newCount = reviewCount + 1;
        
        // Calculate new average rating
        const newAvg = ((currentAvg * reviewCount) + newRating) / newCount;
        const formattedAvg = newAvg.toFixed(1);
        
        // Update display
        avgRatingElement.textContent = formattedAvg;
        reviewCountText.textContent = `Based on ${newCount} reviews`;
        
        // Update star display
        const starsContainer = document.querySelector('.col-md-4.text-center .mb-2');
        starsContainer.innerHTML = createStarsHTML(newAvg);
        
        // Update progress bar for this rating
        const progressBars = document.querySelectorAll('.progress-bar');
        const percentTexts = document.querySelectorAll('.d-flex.align-items-center .text-muted.ms-3');
        
        // In a real app, this would be calculated from all reviews
        // For demo purposes, just increment the progress bar for this rating
        const index = 5 - newRating; // 5 stars is at index 0
        if (index >= 0 && index < progressBars.length) {
            const currentWidth = parseInt(progressBars[index].style.width) || 0;
            const increment = Math.min(100 - currentWidth, 5); // Increment by at most 5%
            const newWidth = currentWidth + increment;
            
            progressBars[index].style.width = `${newWidth}%`;
            percentTexts[index].textContent = `${newWidth}%`;
        }
    }
    
    function showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastElement = document.createElement('div');
        toastElement.className = 'toast align-items-center text-white bg-success border-0';
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastElement);
        
        // Initialize and show the toast
        const toast = new bootstrap.Toast(toastElement, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        toast.show();
        
        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }
    
    // Reset form when modal is closed
    reviewModal.addEventListener('hidden.bs.modal', function() {
        resetReviewForm();
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            animation: fadeIn 0.6s ease-in-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});