function add_slick() {

    $(document).ready(function () {
        $('.product-slide').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            autoplay: true,
            infinite: true,
            autoplaySpeed: 3000,
            prevArrow: '<button type="button" class="slick-prev"><span class="glyphicon glyphicon-chevron-left"></span></button>',
            nextArrow: '<button type="button" class="slick-next"><span class="glyphicon glyphicon-chevron-right"></span></button>',
            responsive: [
                {
                    breakpoint: 1600,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        });
    });

    $(document).ready(function () {
        $('.slide-ads').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            loop: true,
            prevArrow: false,
            nextArrow: false,
            draggable: false,
            swipe: false,
        });
    });
}

// แสดงและซ่อนปุ่ม Back to Top
function handleBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// เพิ่ม animation เล็กๆ น้อยๆ
function addAnimations() {
    const items = document.querySelectorAll('.item');
    
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
    });
}

add_slick();
handleBackToTop();
window.addEventListener('DOMContentLoaded', addAnimations);