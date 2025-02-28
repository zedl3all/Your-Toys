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

    function updateRatio(source, target, isXInput) {
        const value = parseFloat(source.value);
        const minValue = isXInput ? originalX : originalY;

        if (!isNaN(value) && value >= minValue) {
            if (isXInput) {
                const newY = (value * ratio).toFixed(1); // Round to 1 decimal place
                target.value = newY;
                calculatePrice(value, parseFloat(newY));
                return value;
            } else {
                const newX = (value / ratio).toFixed(1); // Round to 1 decimal place
                target.value = newX;
                calculatePrice(parseFloat(newX), value);
                return value;
            }
        } else if (source.value === '') {
            target.value = '';
            return isXInput ? lastValidX : lastValidY;
        } else {
            source.value = isXInput ? originalX : originalY;
            target.value = isXInput ? originalY : originalX;
            calculatePrice(originalX, originalY);
            return isXInput ? originalX : originalY;
        }
    }

    // Initial price calculation
    calculatePrice(originalX, originalY);

    numberX.addEventListener('input', function () {
        lastValidX = updateRatio(numberX, numberY, true);
        lastValidY = parseFloat(numberY.value);
    });

    numberY.addEventListener('input', function () {
        lastValidY = updateRatio(numberY, numberX, false);
        lastValidX = parseFloat(numberX.value);
    });
});