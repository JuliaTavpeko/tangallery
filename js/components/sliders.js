/*
Документация по работе в шаблоне:
Документация слайдера: https://swiperjs.com/
Сниппет(HTML): swiper
*/
import Swiper from 'swiper';
import { Navigation, Thumbs, Pagination, Autoplay } from 'swiper/modules';

function initSliders() {

    if (document.querySelector('[data-swiper]')) {
        new Swiper('[data-swiper]', {
            modules: [Navigation, Pagination, Autoplay],
            loop: true,
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 500,
            pagination: {
                el: '[data-intro-primary-pagination]',
                clickable: true,
            },
            // Arrows
            navigation: {
                nextEl: '[data-intro-primary-next]',
                prevEl: '[data-intro-primary-prev]',
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            on: {}
        });
    }


}

window.addEventListener("load", initSliders);