document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productGrid = document.querySelector('.product-grid');

    // View toggle (grid/list)
    viewButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            if (index === 0) { // List view
                productGrid.style.gridTemplateColumns = '1fr';
            } else { // Grid view
                // Responsive grid based on window width
                if (window.innerWidth > 992) {
                    productGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                } else if (window.innerWidth > 768) {
                    productGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                } else if (window.innerWidth > 576) {
                    productGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                } else {
                    productGrid.style.gridTemplateColumns = '1fr';
                }
            }
        });
    });
});