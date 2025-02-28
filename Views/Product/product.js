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

    function debounce(func, delay) {
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    function calculatePrice(x, y) {
        let price;

        // Calculate price based on the specific ratio characteristics
        if (Math.abs(x - y) < 0.001) { // Use small epsilon for float comparison
            price = basePrice * x;
            console.log("Using equal sides formula");
        } else if (Math.max(x, y) / Math.min(x, y) > 5) {
            price = basePrice * ((x + y) / 2);
            console.log("Using average formula for extreme ratio");
        } else if (Math.max(x, y) / Math.min(x, y) > 2) {
            price = basePrice * Math.max(x, y);
            console.log("Using maximum formula for unbalanced ratio");
        } else {
            price = basePrice * (x * y);
            console.log("Using product formula for standard ratio");
        }

        // Format with commas and 2 decimal places
        const formattedPrice = parseFloat(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        totalPriceElement.textContent = `${formattedPrice}฿`;
        return price;
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

    calculatePrice(originalX, originalY);
});