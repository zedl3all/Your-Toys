function toggleCustomSizeInput(selectElement) {
    const customSizeGroup = document.getElementById('custom-size-group');
    if (selectElement.value === 'etc') {
        customSizeGroup.style.display = 'block';
    } else {
        customSizeGroup.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const numberX = document.getElementById('number_x');
    const numberY = document.getElementById('number_y');
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

    function updateRatio(source, target, isXInput) {
        const value = parseInt(source.value);
        const minValue = isXInput ? originalX : originalY;

        if (!isNaN(value) && value >= minValue) {
            if (isXInput) {
                // If X is changed, multiply by ratio to get Y
                target.value = Math.round(value * ratio);
                return value;
            } else {
                // If Y is changed, divide by ratio to get X
                target.value = Math.round(value / ratio);
                return value;
            }
        } else if (source.value === '') {
            target.value = '';
            return isXInput ? lastValidX : lastValidY;
        } else {
            // Reset to minimum values if input is less than original ratio
            source.value = isXInput ? originalX : originalY;
            target.value = isXInput ? originalY : originalX;
            return isXInput ? originalX : originalY;
        }
    }

    numberX.addEventListener('input', function() {
        lastValidX = updateRatio(numberX, numberY, true);
        lastValidY = parseInt(numberY.value);
    });

    numberY.addEventListener('input', function() {
        lastValidY = updateRatio(numberY, numberX, false);
        lastValidX = parseInt(numberX.value);
    });
});