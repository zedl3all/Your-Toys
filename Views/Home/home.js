function add_slick() {

    $(document).ready(function () {
        $('.product-slide').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
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

add_slick();