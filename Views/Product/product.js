function toggleCustomSizeInput(selectElement) {
    const customSizeGroup = document.getElementById('custom-size-group');
    if (selectElement.value === 'etc') {
        customSizeGroup.style.display = 'block';
    } else {
        customSizeGroup.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const numberX = document.getElementById('number_x');
    const numberY = document.getElementById('number_y');
    const basePrice = parseFloat(document.getElementById('basePrice').value);
    const totalPriceElement = document.getElementById('totalPrice');
    let lastValidX = 1;
    let lastValidY = 1;
    let debounceTimer;
    let isTyping = false;

    // Get aspect ratio from data attribute and set initial values
    const aspectRatio = numberX.dataset.aspectRatio || '1:1';
    const [originalX, originalY] = aspectRatio.split(':').map(Number);
    const ratio = originalY / originalX;

    // Set minimum values based on original ratio
    numberX.min = originalX;
    numberY.min = originalY;

    numberX.step = "0.1";
    numberY.step = "0.1";

    numberX.value = originalX;
    numberY.value = originalY;
    lastValidX = originalX;
    lastValidY = originalY;

    // Add quantity controls
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    const maxQuantity = parseInt(quantityInput.getAttribute('max')) || 99;

    function debounce(func, delay) {
        return function () {
            clearTimeout(debounceTimer);
            const context = this;
            const args = arguments;
            totalPriceElement.textContent = "Calculating...";
            debounceTimer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    function calculatePrice(x, y) {
        totalPriceElement.textContent = "Calculating...";

        x = parseFloat(x);
        y = parseFloat(y);
        const quantity = parseInt(quantityInput.value) || 1;
        const basePrice = parseFloat(document.getElementById('basePrice').value);

        // Use shared function if available, otherwise fall back to inline calculation
        let totalPrice;
        if (typeof window.calculatePrice === 'function') {
            const result = window.calculatePrice(basePrice, x, y, quantity);
            totalPrice = result.totalPrice;
        } else {
            // Fallback to your existing calculation logic
            if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) {
                x = originalX;
                y = originalY;
            }

            const ratio = Math.max(x, y) / Math.min(x, y);

            let unitPrice;
            if (Math.abs(x - y) < 0.001) {
                unitPrice = basePrice * x;
            } else if (ratio > 5) {
                unitPrice = basePrice * ((x + y) / 2);
            } else if (ratio > 2) {
                unitPrice = basePrice * Math.max(x, y);
            } else {
                unitPrice = basePrice * (x * y);
            }

            totalPrice = unitPrice * quantity;
        }

        // Format with commas and 2 decimal places
        const formattedPrice = totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        clearTimeout(debounceTimer);
        totalPriceElement.textContent = `${formattedPrice}฿`;

        return totalPrice;
    }

    const debouncedCalculate = debounce(function (x, y) {
        calculatePrice(x, y);
    }, 500); // 500ms delay

    numberX.addEventListener('input', function () {
        isTyping = true;
        const xValue = parseFloat(this.value) || 0;

        if (xValue > 0) {
            debouncedCalculate(xValue, parseFloat(numberY.value) || 0);
        }
    });

    numberY.addEventListener('input', function () {
        isTyping = true;
        const yValue = parseFloat(this.value) || 0;

        if (yValue > 0) {
            debouncedCalculate(parseFloat(numberX.value) || 0, yValue);
        }
    });

    numberX.addEventListener('blur', function () {
        isTyping = false;
        enforceRatio('x');
    });

    numberY.addEventListener('blur', function () {
        isTyping = false;
        enforceRatio('y');
    });

    // Enforce ratio when user is done typing
    function enforceRatio(sourceField) {
        let xValue = parseFloat(numberX.value) || 0;
        let yValue = parseFloat(numberY.value) || 0;

        // Ensure minimum values
        if (xValue < originalX) xValue = originalX;
        if (yValue < originalY) yValue = originalY;

        if (sourceField === 'x') {
            yValue = (xValue * ratio).toFixed(1);
        } else {
            xValue = (yValue / ratio).toFixed(1);
        }

        numberX.value = xValue;
        numberY.value = yValue;
        lastValidX = xValue;
        lastValidY = yValue;

        calculatePrice(xValue, yValue);
    }

    // Add event listeners for quantity buttons
    decreaseBtn.addEventListener('click', function () {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            calculatePrice(numberX.value, numberY.value);
        }
    });

    increaseBtn.addEventListener('click', function () {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < maxQuantity) {
            quantityInput.value = currentValue + 1;
            calculatePrice(numberX.value, numberY.value);
        } else {
            // Optional: Provide feedback that max quantity is reached
            quantityInput.classList.add('is-invalid');
            setTimeout(() => quantityInput.classList.remove('is-invalid'), 500);
        }
    });

    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css';
        document.head.appendChild(iconLink);
    }

    quantityInput.addEventListener('change', function () {
        let value = parseInt(this.value) || 1;
        // Enforce both minimum and maximum values
        value = Math.max(1, Math.min(value, maxQuantity));
        this.value = value;

        calculatePrice(numberX.value, numberY.value);
    });

    calculatePrice(originalX, originalY);
});

function addToCart(productId) {
    const userId = localStorage.getItem('user_id');
    const quantity = document.getElementById('quantity').value || 1;
    const specify = document.getElementById('specify').value || '';

    // Fix the ratio parameter construction
    const ratioX = document.getElementById('number_x').value || 1;
    const ratioY = document.getElementById('number_y').value || 1;
    const ratio = `${ratioX}:${ratioY}`;

    if (!userId) {
        alert('Please log in to add items to your cart');
        window.location.href = '/login';
        return;
    }

    // Log data being sent
    console.log('Adding to cart:', {
        productId: productId,
        userId: userId,
        quantity: quantity,
        specify: specify,
        ratio: ratio
    });

    // Properly encode parameters for URL
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('quantity', quantity);
    params.append('specify', specify);
    params.append('ratio', ratio);

    // Redirect with properly encoded parameters
    window.location.href = `/cart/add/${productId}?${params.toString()}`;
}