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

        let price;
        console.log(`Input values: x=${x}, y=${y}, basePrice=${basePrice}`);

        // Convert to numeric values
        x = parseFloat(x);
        y = parseFloat(y);

        // Validate inputs
        if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) {
            console.log("Invalid input values, using defaults");
            x = originalX;
            y = originalY;
        }

        // Calculate ratio outside conditionals for cleaner code
        const ratio = Math.max(x, y) / Math.min(x, y);
        console.log(`Ratio (max/min): ${ratio}`);

        // Reset price calculation
        if (Math.abs(x - y) < 0.001) { // Use epsilon for float comparison
            price = basePrice * x;
            console.log(`Equal sides formula: ${basePrice} * ${x} = ${price}`);
        } else if (ratio > 5) {
            price = basePrice * ((x + y) / 2);
            console.log(`Average formula for extreme ratio: ${basePrice} * (${x} + ${y})/2 = ${price}`);
        } else if (ratio > 2) {
            price = basePrice * Math.max(x, y);
            console.log(`Maximum formula for unbalanced ratio: ${basePrice} * ${Math.max(x, y)} = ${price}`);
        } else {
            price = basePrice * (x * y);
            console.log(`Product formula for standard ratio: ${basePrice} * (${x} * ${y}) = ${price}`);
        }

        console.log(`Final price for ratio ${x}:${y} = ${price}`);

        // Format with commas and 2 decimal places
        const formattedPrice = parseFloat(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        clearTimeout(debounceTimer);
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