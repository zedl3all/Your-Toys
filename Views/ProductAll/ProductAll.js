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

    // Add overlay div to body
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Sidebar toggle functionality
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');

    sidebarCollapse.addEventListener('click', function() {
        sidebarWrapper.classList.add('active');
        overlay.classList.add('active');
    });

    // Add close button functionality
    sidebarClose.addEventListener('click', function() {
        sidebarWrapper.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', function() {
        sidebarWrapper.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close sidebar when window is resized above mobile breakpoint
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            sidebarWrapper.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // Add dropdown functionality
    const dropdownToggle = document.querySelector('[data-toggle="collapse"]');
    const chevronIcon = dropdownToggle.querySelector('.fa-chevron-down');
    
    dropdownToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        chevronIcon.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
    });

    // Initialize collapse functionality
    $('#categoryCollapse').collapse({
        toggle: false
    });

    // Bootstrap 5 collapse initialization
    const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));
    const collapseList = collapseElementList.map(function (collapseEl) {
        return new bootstrap.Collapse(collapseEl, {
            toggle: false
        });
    });

    // Category collapse icon rotation
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="collapse"]');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const icon = this.querySelector('.fa-chevron-down');
            icon.style.transform = this.getAttribute('aria-expanded') === 'true' 
                ? 'rotate(-180deg)' 
                : 'rotate(0deg)';
        });
    });

    // Mobile sidebar close on selection for better UX
    const mobileMenuItems = document.querySelectorAll('#sidebar .list-group-item');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sidebar = document.querySelector('#sidebar');
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebar);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        });
    });
});

function selectCategory(category) {
    console.log("Selected category:", category);
    // Add your category selection logic here
}