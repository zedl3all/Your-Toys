function toggleCustomSizeInput(selectElement) {
        const customSizeGroup = document.getElementById('custom-size-group');
        if (selectElement.value === 'etc') {
            customSizeGroup.style.display = 'block';
        } else {
            customSizeGroup.style.display = 'none';
        }
    }