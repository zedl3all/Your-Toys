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
    const grandPriceElement = document.getElementById('grandPrice');
    let lastValidX = 1;
    let lastValidY = 1;

    // Get aspect ratio from data attribute and set initial values
    const aspectRatio = numberX.dataset.aspectRatio || '1:1';
    const [originalX, originalY] = aspectRatio.split(':').map(Number);
    const ratio = originalY / originalX; // Calculate the ratio multiplier

    // Set minimum values based on original ratio
    numberX.min = originalX;
    numberY.min = originalY;

    numberX.value = originalX;
    numberY.value = originalY;
    lastValidX = originalX;
    lastValidY = originalY;

    function calculatePrice(x, y) {
        const area = x * y;
        const grandPrice = (area * basePrice).toFixed(2);
        grandPriceElement.textContent = `${grandPrice}฿`;
        return grandPrice;
    }

    function updateRatio(source, target, isXInput) {
        const value = parseInt(source.value);
        const minValue = isXInput ? originalX : originalY;

        if (!isNaN(value) && value >= minValue) {
            if (isXInput) {
                const newY = Math.round(value * ratio);
                target.value = newY;
                calculatePrice(value, newY);
                return value;
            } else {
                const newX = Math.round(value / ratio);
                target.value = newX;
                calculatePrice(newX, value);
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
        lastValidY = parseInt(numberY.value);
    });

    numberY.addEventListener('input', function () {
        lastValidY = updateRatio(numberY, numberX, false);
        lastValidX = parseInt(numberX.value);
    });
});