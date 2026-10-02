"use strict"

// Бегущие строки
// Бегущие строки
const initMarquee = () => {
    const marquees = document.querySelectorAll('[data-marquee]');

    if (!marquees.length) return;

    marquees.forEach((marquee) => {
        const sources = Array.from(
            marquee.querySelectorAll('[data-marquee-item]')
        );

        if (!sources.length) return;

        const speed = parseFloat(marquee.dataset.marqueeSpeed) || 50;
        const direction = marquee.dataset.marqueeDirection || 'left';

        let position = 0;
        let startPosition = 0;
        let step = 0;
        let lastTime = performance.now();

        const prepare = () => {
            marquee.innerHTML = '';

            const items = [];
            const count = 30;

            for (let i = 0; i < count; i++) {
                sources.forEach((source) => {
                    const item = source.cloneNode(true);

                    marquee.appendChild(item);
                    items.push(item);
                });
            }

            if (items.length > 1) {
                step = items[1].offsetLeft - items[0].offsetLeft;
            }

            if (!step) {
                step = items[0].offsetWidth;
            }

            const trackWidth = marquee.scrollWidth;
            const lineWidth = marquee.parentElement.offsetWidth;

            if (direction === 'right') {
                startPosition = lineWidth - trackWidth;
            } else {
                startPosition = 0;
            }

            position = startPosition;

            marquee.style.transform =
                `translate3d(${position}px, 0, 0)`;

            lastTime = performance.now();
        };

        const animate = (time) => {
            const delta = (time - lastTime) / 1000;

            lastTime = time;

            // Не учитываем время, проведённое во время неактивной вкладки
            if (delta > 0.1) {
                requestAnimationFrame(animate);
                return;
            }

            const movement = speed * delta;

            if (direction === 'right') {
                position += movement;

                if (position >= startPosition + step) {
                    position -= step;
                }
            } else {
                position -= movement;

                if (position <= startPosition - step) {
                    position += step;
                }
            }

            marquee.style.transform =
                `translate3d(${position}px, 0, 0)`;

            requestAnimationFrame(animate);
        };

        prepare();

        window.addEventListener('resize', prepare);

        requestAnimationFrame(animate);
    });
};

window.addEventListener('load', initMarquee);
// Header nav
function initNavigation() {
    const nav = document.querySelector('.nav');

    if (!nav) {
        return;
    }

    const layout = nav.querySelector('.nav__layout');

    if (!layout) {
        return;
    }

    // Находим только пункты, у которых есть дочернее меню
    const dropdownItems = nav.querySelectorAll(
        '.nav__item:has(> .nav__child)'
    );

    if (!dropdownItems.length) {
        return;
    }

    dropdownItems.forEach((item) => {
        const child = item.querySelector(':scope > .nav__child');

        if (!child) {
            return;
        }

        /**
         * Наведение на пункт меню
         */
        item.addEventListener('mouseenter', () => {
            // Закрываем остальные открытые пункты
            dropdownItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove('is-open');
                }
            });

            // Открываем дочернее меню
            item.classList.add('is-open');

            // Показываем затемнение
            layout.classList.add('is-open');
        });

        /**
         * Уход мыши с пункта.
         *
         * .nav__child находится внутри .nav__item,
         * поэтому переход курсора из .nav__link
         * в .nav__child не вызовет mouseleave.
         */
        item.addEventListener('mouseleave', () => {
            item.classList.remove('is-open');

            // Скрываем затемнение
            layout.classList.remove('is-open');
        });
    });
}
document.addEventListener('DOMContentLoaded', initNavigation);

// Показ \ скрытие текстового блока
// Показ / скрытие текстового блока
const initTextCollapse = () => {
    const collapses = document.querySelectorAll('[data-collapse]');

    if (!collapses.length) return;

    collapses.forEach((collapse) => {
        const content = collapse.querySelector('.text-collapse__content');
        const control = collapse.querySelector('[data-collapse-control]');

        if (!content || !control) return;

        const styles = getComputedStyle(content);
        const maxHeight = parseFloat(styles.maxHeight);

        if (!maxHeight) return;

        // Небольшой запас, чтобы последняя строка
        // никогда не обрезалась браузером.
        const collapsedHeight = maxHeight + 10;

        if (content.scrollHeight <= collapsedHeight + 1) {
            control.hidden = true;
            content.style.maxHeight = 'none';

            return;
        }

        content.style.maxHeight = `${collapsedHeight}px`;

        control.addEventListener('click', () => {
            if (collapse.classList.contains('open')) {
                content.style.maxHeight = `${content.scrollHeight}px`;

                requestAnimationFrame(() => {
                    collapse.classList.remove('open');
                    content.style.maxHeight = `${collapsedHeight}px`;
                });
            } else {
                collapse.classList.add('open');
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
        });
    });
};
document.addEventListener('DOMContentLoaded', initTextCollapse);


// Слайдеры
const initSliders = () => {
    if (document.querySelector('[data-promo]')) {
        new Swiper('[data-promo]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            pagination: {
                el: '[data-promo-pagination]',
                clickable: true,
            },
            // Arrows
            navigation: {
                nextEl: '[data-promo-next]',
                prevEl: '[data-promo-prev]',
            },
            breakpoints: {
                1024: {
                    spaceBetween: 16,
                    slidesPerView: 4,
                },
                1240: {
                    spaceBetween: 24,
                    slidesPerView: 4,
                },
            },
            on: {}
        });
    }

    if (document.querySelector('[data-new-items]')) {
        new Swiper('[data-new-items]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            breakpoints: {
                768: {
                    spaceBetween: 16,
                    slidesPerView: 3,
                },
                1240: {
                    spaceBetween: 24,
                    slidesPerView: 3,
                },
            },
            on: {}
        });
    }

    if (document.querySelectorAll('[data-collections]').length > 0) {

        document.querySelectorAll('[data-collections]').forEach(collections => {

            const slider = collections.querySelector('[data-collections-slider]');
            const navPrev = collections.querySelector('[data-collections-prev]');
            const navNext = collections.querySelector('[data-collections-next]');

            if (!slider) return;

            new Swiper(slider, {
                loop: false,
                observer: true,
                observeParents: true,
                slidesPerView: 'auto',
                spaceBetween: 0,
                speed: 500,
                navigation: {
                    nextEl: navNext,
                    prevEl: navPrev,
                },
                breakpoints: {
                    768: {
                        spaceBetween: 16,
                        slidesPerView: 3,
                    },
                    1024: {
                        spaceBetween: 16,
                        slidesPerView: 4,
                    },
                    1240: {
                        spaceBetween: 24,
                        slidesPerView: 4,
                    },
                }
            });
        });
    }

    if (document.querySelector('[data-reviews]')) {
        new Swiper('[data-reviews]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            navigation: {
                nextEl: '[data-reviews-next]',
                prevEl: '[data-reviews-prev]',
            },
            breakpoints: {
                768: {
                    spaceBetween: 0,
                    slidesPerView: 'auto',
                },
                1024: {
                    spaceBetween: 16,
                    slidesPerView: 3,
                },
                1240: {
                    spaceBetween: 24,
                    slidesPerView: 3,
                },
            },
            on: {}
        });
    }

    if (document.querySelector('[data-abc]')) {
        new Swiper('[data-abc]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            breakpoints: {
                768: {
                    spaceBetween: 10,
                    slidesPerView: 'auto',
                }
            },
            on: {}
        });
    }


    if (document.querySelector('[data-product-gallery]')) {

        const productThumbs = new Swiper('[data-product-thumbs]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 3,
            spaceBetween: 24,
            watchSlidesProgress: true,
            speed: 500,
            on: {}
        });

        const productGallery = new Swiper('[data-product-gallery]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 20,
            speed: 500,
            thumbs: {
                swiper: productThumbs,
            },
            on: {}
        });
    }
}
window.addEventListener('load', initSliders);

// Избранное
const addFavorite = () => {
    const favoriteButtons = document.querySelectorAll('[data-add-favorite]');

    if (!favoriteButtons.length) return;

    favoriteButtons.forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            item.classList.toggle('added');
        })
    })
}
document.addEventListener('DOMContentLoaded', addFavorite);

// Фиксация шапки
const initStickyHeader = () => {
    const header = document.querySelector('.header');

    if (!header) return;

    const observerTarget = document.createElement('div');
    observerTarget.className = 'header-observer';

    header.before(observerTarget);

    const observer = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('is-fixed', !entry.isIntersecting);
            document.body.classList.toggle('header-fixed', !entry.isIntersecting);
        },
        {
            threshold: 0,
        }
    );

    observer.observe(observerTarget);
}
document.addEventListener('DOMContentLoaded', initStickyHeader);

// Мобильное / боковое меню
const appMenu = () => {
    const BREAKPOINT = 1280;

    const menu = document.querySelector('.app-menu');
    const navToggle = document.querySelectorAll('[data-menu-toggle]');
    const menuItemToggle = document.querySelectorAll('.menu-item__toggle');
    const menuBack = document.querySelectorAll('.app-menu__back');

    if (!menu) return;

    // Открытие / закрытие самого меню
    navToggle.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();

            document.body.classList.toggle('nav-open');

            // При закрытии меню закрываем все открытые пункты
            if (!document.body.classList.contains('nav-open')) {
                menu.classList.remove('is-lock');

                menu.querySelectorAll('.app-menu__item.is-open').forEach((item) => {
                    item.classList.remove('is-open');
                });
            }

            return false;
        });
    });

    // Открытие / закрытие вложенного меню
    menuItemToggle.forEach((toggle) => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();

            const item = toggle.closest('.app-menu__item');

            if (!item) return;

            const child = item.querySelector(':scope > .app-menu__child');

            if (!child) return;

            const isOpen = item.classList.contains('is-open');

            item.classList.toggle('is-open', !isOpen);
            menu.classList.toggle('is-lock', !isOpen);

            return false;
        });
    });

    // Кнопка "Назад"
    menuBack.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();

            const child = element.closest('.app-menu__child');

            if (!child) return;

            const item = child.parentElement;

            if (!item) return;

            item.classList.remove('is-open');
            menu.classList.remove('is-lock');

            return false;
        });
    });

    // При изменении ширины окна
    window.addEventListener('resize', () => {
        if (window.innerWidth <= BREAKPOINT) {
            menu.querySelectorAll('.app-menu__item.is-open').forEach((item) => {
                item.classList.remove('is-open');
            });

            menu.classList.remove('is-lock');
        }
    });
};
document.addEventListener('DOMContentLoaded', appMenu);

// Боковые панели
const side = () => {

    const sides = document.querySelectorAll('[data-side]');
    const overlay = document.querySelector('.side-overlay');
    const openButtons = document.querySelectorAll('[data-side-open]');
    const closeButtons = document.querySelectorAll('[data-side-close]');

    if (!sides.length) return;

    let activeSide = null;

    const getSide = name => {
        return document.querySelector(`[data-side="${name}"]`);
    };

    const lockScroll = () => {
        document.documentElement.classList.add('side-open');
    };

    const unlockScroll = () => {
        document.documentElement.classList.remove('side-open');
    };

    const open = name => {

        const target = getSide(name);

        if (!target) return;

        if (activeSide && activeSide !== target) {
            activeSide.classList.remove('is-open');
        }

        target.classList.add('is-open');
        overlay?.classList.add('is-open');

        lockScroll();

        activeSide = target;

    };

    const close = () => {

        activeSide?.classList.remove('is-open');
        overlay?.classList.remove('is-open');

        unlockScroll();

        activeSide = null;

    };

    const toggle = name => {

        const target = getSide(name);

        if (!target) return;

        if (target === activeSide && target.classList.contains('is-open')) {
            close();
            return;
        }

        open(name);

    };

    const isOpen = name => {

        const target = getSide(name);

        return target?.classList.contains('is-open') ?? false;

    };

    openButtons.forEach(button => {

        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            open(button.dataset.sideOpen);
        });

    });

    closeButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            close();
        });
    });

    return {
        open,
        close,
        toggle,
        isOpen
    };

};

// Меню категории.
const categoriesNav = () => {
    if (document.querySelector('[data-categories]')) {

        const categories = document.querySelectorAll('[data-category-item]');
        categories.forEach(category => {
            category.addEventListener('click', (event) => {
                event.preventDefault();
                categories.forEach(item => {
                    item.classList.remove('is-active');
                })
                category.classList.add('is-active');
            })
        })

        new Swiper('[data-categories]', {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            breakpoints: {
                768: {
                    spaceBetween: 10,
                    slidesPerView: 'auto',
                },
            },
            on: {}
        });
    }
}
document.addEventListener('DOMContentLoaded', categoriesNav);

const customSelect = () => {

    const selects = document.querySelectorAll('[data-select]');

    if (!selects.length) return;


    const closeAll = (except = null) => {

        selects.forEach(select => {

            if (select !== except) {
                select.classList.remove('is-open');
            }

        });

    };


    const triggerChange = input => {

        input.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );

    };


    const reset = filter => {

        const selects = filter.querySelectorAll('[data-select]');


        selects.forEach(select => {

            const input = select.querySelector('[data-select-input]');
            const active = select.querySelector('[data-select-active]');
            const items = select.querySelectorAll('[data-select-item]');


            if (input) {

                input.value = 0;

                triggerChange(input);

            }


            if (active) {

                active.textContent = active.dataset.selectActive;

            }


            items.forEach(item => {

                item.classList.remove('is-active');

            });


            select.classList.remove(
                'is-selected',
                'is-open'
            );

        });

    };


    selects.forEach(select => {

        const control = select.querySelector('[data-select-control]');
        const active = select.querySelector('[data-select-active]');
        const input = select.querySelector('[data-select-input]');
        const items = select.querySelectorAll('[data-select-item]');


        if (!control || !active || !input) return;


        control.addEventListener('click', e => {

            e.stopPropagation();

            closeAll(select);

            select.classList.toggle('is-open');

        });


        items.forEach(item => {

            item.addEventListener('click', () => {

                const value = item.dataset.selectItem;

                active.textContent = value;
                input.value = value;

                select.classList.add('is-selected');
                select.classList.remove('is-open');


                items.forEach(i => {

                    i.classList.toggle('is-active', i === item);

                });


                triggerChange(input);

            });

        });

    });


    document.addEventListener('click', () => {

        closeAll();

    });


    document.querySelectorAll('[data-filter]').forEach(filter => {

        const filterReset = filter.querySelector('[data-filter-reset]');


        filterReset?.addEventListener('click', e => {

            e.preventDefault();

            reset(filter);

        });

    });


    document.querySelectorAll('[data-select-input]').forEach(input => {

        input.addEventListener('change', () => {

            const filter = input.closest('[data-filter]');

            if (!filter) return;


            if (typeof filtersControl !== 'undefined') {
                filtersControl.update();
            }


            filterChange(
                filter.dataset.filterUrl,
                filter.dataset.filterTarget
            );

        });

    });

};
document.addEventListener('DOMContentLoaded', customSelect);

// Filters
const initFilter = () => {
    const filters = document.querySelector('[data-catalog-filters]');

    if (!filters) return;

    const BREAKPOINT = 1260;
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);

    let swiper = null;

    const swiperOptions = {
        loop: false,
        observer: true,
        observeParents: true,
        slidesPerView: 'auto',
        spaceBetween: 0,
        speed: 500,
        breakpoints: {
            768: {
                spaceBetween: 10,
                slidesPerView: 'auto',
            },
        },
    };

    const updateSwiper = () => {
        if (!swiper) return;

        requestAnimationFrame(() => {
            swiper.update();
        });
    };

    const createSwiper = () => {
        if (swiper) return;

        swiper = new Swiper(filters, swiperOptions);
    };

    const destroySwiper = () => {
        if (!swiper) return;

        swiper.destroy(true, true);
        swiper = null;
    };

    const handleBreakpoint = (event) => {
        if (event.matches) {
            createSwiper();
        } else {
            destroySwiper();
        }
    };

    // Следим только за [data-select], находящимся внутри этого Swiper
    const select = filters.querySelector('[data-select]');

    if (select) {
        const observer = new MutationObserver(() => {
            updateSwiper();
        });

        observer.observe(select, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        });
    }


    // Начальная инициализация
    handleBreakpoint(mediaQuery);

    // Отслеживаем переход через breakpoint
    mediaQuery.addEventListener('change', handleBreakpoint);
};
window.addEventListener('load', initFilter);

const resetFilter = () => {
    // Обработка фильтров
    const filterItems = document.querySelectorAll('[data-filter]');

    filterItems.forEach((filter) => {
        const reset = filter.querySelector('[data-filter-reset]');
        const all = filter.querySelector('[data-filter-all]');
        const checkboxes = filter.querySelectorAll('input[type="checkbox"]');

        // Сбросить все checkbox
        if (reset) {
            reset.addEventListener('click', () => {
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });
            });
        }

        // Отметить все checkbox
        if (all) {
            all.addEventListener('click', () => {
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = true;
                });
            });
        }
    });
}
window.addEventListener('load', resetFilter);

// Выбор интервала.

const rangeInit = () => {
    const rangeSliders = document.querySelectorAll('[data-range]');

    if (!rangeSliders) return;

    rangeSliders.forEach((el) => {
        const rangeSlider = el.querySelector('[data-range-slider]');
        const rangeInputs = el.querySelectorAll('[data-range-input]');
        const rangeFrom = el.querySelector('[data-range-from]');
        const rangeTo = el.querySelector('[data-range-to]');

        const rangeStart = rangeSlider.dataset.start.split(',').map(Number);
        const rangeMin = Number(rangeSlider.dataset.min);
        const rangeMax = Number(rangeSlider.dataset.max);
        const postfix = rangeSlider.dataset.inputPostfix || '';

        const formatValue = (value) => {
            const number = Math.round(Number(value));
            return postfix ? `${number}${postfix}` : `${number}`;
        };

        const parseValue = (value) => {
            const number = value.replace(/\D/g, '');
            return number ? Number(number) : '';
        };

        noUiSlider.create(rangeSlider, {
            start: rangeStart,
            connect: true,
            range: {
                min: rangeMin,
                max: rangeMax,
            },
        });

        // Начальные значения
        rangeInputs.forEach((input, index) => {
            input.value = formatValue(rangeStart[index]);
        });

        // Слайдер → инпуты
        rangeSlider.noUiSlider.on('update', (values, handle) => {
            if (handle) {
                rangeTo.innerHTML = values[handle];
            } else {
                rangeFrom.innerHTML = values[handle];
            }
        });
    });
}
window.addEventListener('load', rangeInit);

const Spoilers = () => {

    const updateLenis = () => {
        setTimeout(() => {
            window.lenis?.resize();

            if (window.ScrollTrigger) {
                ScrollTrigger.refresh();
            }
        }, 250);
    };


    document.addEventListener('click', (event) => {

        const control = event.target.closest('[data-spoiler-control]');
        if (!control) return;


        const spoilerItem = control.closest('[data-spoiler]');
        if (!spoilerItem) return;


        const spoilerContent = spoilerItem.querySelector('[data-spoiler-content]');
        if (!spoilerContent) return;


        const spoilerIsOpen = spoilerItem.classList.contains('open');
        const spoilersGroup = control.closest('[data-spoilers]');


        if (spoilersGroup) {

            if (!spoilerIsOpen) {

                spoilersGroup.querySelectorAll('[data-spoiler]').forEach(elem => {

                    if (elem.classList.contains('open')) {

                        slidetoggle.hide(
                            elem.querySelector('[data-spoiler-content]'),
                            {
                                miliseconds: 200,
                            }
                        );

                        elem.classList.remove('open');
                    }

                });


                slidetoggle.show(
                    spoilerContent,
                    {
                        miliseconds: 200,
                    }
                );

                spoilerItem.classList.add('open');

                updateLenis();

            }

        } else {

            slidetoggle.toggle(
                spoilerContent,
                {
                    miliseconds: 200,
                }
            );

            spoilerItem.classList.toggle('open');

            updateLenis();

        }

    });

};

// Фильтр Бренды
const brandFilter = () => {
    const abc = document.querySelector('[data-abc]');

    if (!abc) return;

    new Swiper(abc, {
        loop: false,
        observer: true,
        observeParents: true,
        slidesPerView: 'auto',
        spaceBetween: 0,
        speed: 500,
        breakpoints: {
            768: {
                spaceBetween: 10,
                slidesPerView: 'auto',
            }
        },
        on: {}
    });

    const abcArray = abc.querySelectorAll('[data-abc-item]');
    abcArray.forEach(elem => {
        elem.addEventListener('click', (event) => {
            event.preventDefault();
            abcArray.forEach(item => {
                item.classList.remove('is-active');
            })
            elem.classList.add('is-active');
        })
    })
}
window.addEventListener('load', brandFilter);

const initModal = () => {
    // Modal Fancybox
    Fancybox.bind("[data-fancybox]", {
        autoFocus: false,
        Thumbs: false,
        hideScrollbar: false,
        // Thumbs: {
        //     type: "classic",
        // },
    });

    Fancybox.bind("[data-modal]", {
        autoFocus: false,
        closeButton: false,
        hideScrollbar: false,
        dragToClose: false,
        Carousel: {
            Panzoom: {
                touch: false,
            },
        },
    });
}
window.addEventListener('load', initModal);

const initPurchase = () => {
    const purchases = document.querySelectorAll('[data-purchase]');

    if (!purchases.length) return;

    const values = document.querySelectorAll('[data-purchase-value]');

    const updatePurchases = (newValue) => {
        values.forEach((value) => {
            const min = Number(value.min) || 0;
            const max = Number(value.max) || Infinity;

            newValue = Math.max(min, Math.min(newValue, max));

            value.value = newValue;
        });

        purchases.forEach((purchase) => {
            if (newValue < 1) {
                purchase.classList.remove('is-added');
            } else {
                purchase.classList.add('is-added');
            }
        });
    };

    purchases.forEach((purchase) => {
        const button = purchase.querySelector('[data-purchase-button]');
        const controls = purchase.querySelectorAll('[data-purchase-control]');

        if (button) {
            button.addEventListener('click', () => {
                updatePurchases(1);
            });
        }

        controls.forEach((control) => {
            control.addEventListener('click', () => {
                const value = purchase.querySelector('[data-purchase-value]');

                if (!value) return;

                let current = Number(value.value) || 0;

                if (control.dataset.purchaseControl === 'plus') {
                    current++;
                }

                if (control.dataset.purchaseControl === 'minus') {
                    current--;
                }

                updatePurchases(current);
            });
        });
    });

    values.forEach((value) => {
        value.addEventListener('change', () => {
            updatePurchases(Number(value.value) || 0);
        });
    });
};
document.addEventListener('DOMContentLoaded', initPurchase);

const initBuyItem = () => {
    const buys = document.querySelectorAll('[data-buy]');

    if (!buys.length) return;

    buys.forEach((buy) => {
        const button = buy.querySelector('[data-buy-button]');
        const value = buy.querySelector('[data-buy-value]');
        const controls = buy.querySelectorAll('[data-buy-control]');

        if (!value) return;

        const updateBuy = (newValue) => {
            const min = Number(value.min) || 0;
            const max = Number(value.max) || Infinity;

            newValue = Math.max(min, Math.min(newValue, max));

            value.value = newValue;

            if (newValue < 1) {
                buy.classList.remove('is-added');
            } else {
                buy.classList.add('is-added');
            }
        };

        if (button) {
            button.addEventListener('click', () => {
                updateBuy(1);
            });
        }

        controls.forEach((control) => {
            control.addEventListener('click', () => {
                let current = Number(value.value) || 0;

                if (control.dataset.buyControl === 'plus') {
                    current++;
                }

                if (control.dataset.buyControl === 'minus') {
                    current--;
                }

                updateBuy(current);
            });
        });

        value.addEventListener('change', () => {
            updateBuy(Number(value.value) || 0);
        });
    });
};

document.addEventListener('DOMContentLoaded', initBuyItem);


// Rating
const initRating = () => {
    const ratings = document.querySelectorAll('[data-rating]');

    if (!ratings.length) return;

    ratings.forEach((elem) => {
        initRating(elem);
    });

    // Init single rating
    function initRating(rating) {
        let ratingItem;
        let ratingActive;
        let ratingValue;

        initRatingVars(rating);
        setRatingActiveWidth();

        if (rating.dataset.readonly !== 'true') {
            setRating(rating);
        }

        function initRatingVars(rating) {
            ratingItem = rating;
            ratingActive = rating.querySelector('[data-rating-active]');
            ratingValue = rating.querySelector('[data-rating-value]');
        }

        function setRatingActiveWidth(index = ratingItem.dataset.rating) {
            const ratingActiveWidth = index / 0.05;

            ratingActive.style.width = `${ratingActiveWidth}%`;
        }

        function setRating(rating) {
            const ratingItems = rating.querySelectorAll('[data-rating-item]');

            ratingItems.forEach((elem) => {
                elem.addEventListener('mouseenter', () => {
                    setRatingActiveWidth(elem.dataset.ratingItem);
                });

                elem.addEventListener('mouseleave', () => {
                    setRatingActiveWidth();
                });

                elem.addEventListener('click', () => {
                    const newRating = elem.dataset.ratingItem;

                    if (ratingValue) {
                        ratingValue.innerHTML = newRating;
                    }

                    ratingItem.dataset.rating = newRating;

                    setRatingActiveWidth(newRating);
                });
            });
        }
    }
};
document.addEventListener('DOMContentLoaded', initRating);


// Показ \ скрытие комментария
// Раскрытие комментариев
// Раскрытие комментариев
const initComments = () => {
    const comments = document.querySelectorAll('[data-comment]');

    if (!comments.length) return;

    comments.forEach((comment) => {
        const text = comment.querySelector('.comment__text');
        const control = comment.querySelector('[data-comment-control]');

        if (!text || !control) return;

        const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
        const collapsedHeight = lineHeight * 3;

        if (text.scrollHeight <= collapsedHeight + 1) {
            control.hidden = true;
            text.style.maxHeight = 'none';

            return;
        }

        text.style.maxHeight = `${collapsedHeight}px`;

        control.addEventListener('click', () => {
            if (comment.classList.contains('open')) {
                text.style.maxHeight = `${text.scrollHeight}px`;

                requestAnimationFrame(() => {
                    comment.classList.remove('open');
                    text.style.maxHeight = `${collapsedHeight}px`;
                });
            } else {
                comment.classList.add('open');
                text.style.maxHeight = `${text.scrollHeight}px`;
            }
        });
    });
};
document.addEventListener('DOMContentLoaded', initComments);

// Tags
// Tags
const initTags = () => {
    const tags = document.querySelector('[data-tags]');

    if (!tags) return;

    const BREAKPOINT = 1024;
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);

    let tagSlider = null;

    const initSwiper = () => {
        if (tagSlider) return;

        tagSlider = new Swiper(tags, {
            loop: false,
            observer: true,
            observeParents: true,
            slidesPerView: 'auto',
            spaceBetween: 0,
            speed: 500,
            breakpoints: {
                768: {
                    spaceBetween: 10,
                    slidesPerView: 'auto',
                }
            }
        });
    };

    const destroySwiper = () => {
        if (!tagSlider) return;

        tagSlider.destroy(true, true);
        tagSlider = null;
    };

    const toggleSwiper = () => {
        if (mediaQuery.matches) {
            initSwiper();
        } else {
            destroySwiper();
        }
    };

    const tagsButtons = tags.querySelectorAll('[data-tags-btn]');

    tagsButtons.forEach((elem) => {
        elem.addEventListener('click', (event) => {
            event.preventDefault();

            tagsButtons.forEach((item) => {
                item.classList.remove('is-active');
            });

            elem.classList.add('is-active');
        });
    });

    toggleSwiper();
    mediaQuery.addEventListener('change', toggleSwiper);
};
window.addEventListener('load', initTags);

// FAQ
const initFaq = () => {
    const faqControl = document.querySelector('[data-faq-control]');
    if (!faqControl) return;

    const faqButtons = faqControl.querySelectorAll('[data-faq-button]');

    new Swiper(faqControl, {
        loop: false,
        observer: true,
        observeParents: true,
        slidesPerView: 'auto',
        spaceBetween: 0,
        speed: 500,
        breakpoints: {
            768: {
                spaceBetween: 10,
                slidesPerView: 'auto',
            },
            1240: {
                spaceBetween: 14,
                slidesPerView: 'auto',
            }
        }
    });

    faqButtons.forEach((elem) => {
        elem.addEventListener('click', (event) => {
            event.preventDefault();

            faqButtons.forEach((item) => {
                item.classList.remove('is-active');
            });

            elem.classList.add('is-active');
        });
    });
}
window.addEventListener('load', initFaq);

// Меню в личном кабинете
const initAccountNav = () => {
    const accountNav = document.querySelector('[data-account-nav]');
    const toggle = document.querySelector('[data-account-nav-toggle]');

    if (!accountNav || !toggle) return;

    const mediaQuery = window.matchMedia('(max-width: 1259px)');

    const closeMenu = () => {
        accountNav.classList.remove('is-open');
    };

    toggle.addEventListener('click', (e) => {
        if (!mediaQuery.matches) return;

        e.stopPropagation();
        accountNav.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
        if (!mediaQuery.matches) return;

        if (!accountNav.contains(e.target)) {
            closeMenu();
        }
    });

    mediaQuery.addEventListener('change', (e) => {
        if (!e.matches) {
            closeMenu();
        }
    });
};
window.addEventListener('load', initAccountNav);

const initQuantity = () => {
    const containers = document.querySelectorAll('[data-quantity]');

    containers.forEach(container => {
        const input = container.querySelector('[data-quantity-value]');
        const up = container.querySelector('[data-quantity-up]');
        const down = container.querySelector('[data-quantity-down]');

        if (!input) return;

        up?.addEventListener('click', () => {
            input.stepUp();
            input.dispatchEvent(new Event('change', {bubbles: true}));
        });

        down?.addEventListener('click', () => {
            input.stepDown();
            input.dispatchEvent(new Event('change', {bubbles: true}));
        });
    });
};

window.addEventListener('load', initQuantity);

// Меню в выбора подарка
const initGift = () => {
    const gifts = document.querySelectorAll('[data-gift]');

    if (!gifts.length) return;

    gifts.forEach((gift) => {
        const control = gift.querySelector('[data-gift-control]');

        if (!control) return;

        control.addEventListener('click', (e) => {
            e.stopPropagation();

            gift.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!gift.contains(e.target)) {
                gift.classList.remove('is-open');
            }
        });
    });
};
window.addEventListener('load', initGift);

const initStickyCategories = () => {
    const catalogCategories = document.querySelector('.catalog-categories');

    if (catalogCategories) {
        const stickyOffset = 60;

        const checkCatalogCategories = () => {
            const top = catalogCategories.getBoundingClientRect().top;

            catalogCategories.classList.toggle(
                'is-sticky',
                top <= stickyOffset
            );


            document.body.classList.toggle(
                'is-categories-sticky',
                top <= stickyOffset
            );
        };

        window.addEventListener('scroll', checkCatalogCategories, { passive: true });
        window.addEventListener('resize', checkCatalogCategories);

        checkCatalogCategories();
    }
}
window.addEventListener('load', initStickyCategories);

const stickyProductBar = () => {
    const PRODUCT_BAR_BREAKPOINT = 1260;
    const PRODUCT_BAR_OFFSET = 200;

    const productBar = document.querySelector('.product-bar');

    if (productBar) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateProductBar = () => {
            const currentScrollY = window.scrollY;
            const isDesktop = window.innerWidth >= PRODUCT_BAR_BREAKPOINT;
            const isScrollingDown = currentScrollY > lastScrollY;
            const isScrollingUp = currentScrollY < lastScrollY;

            if (!isDesktop) {
                productBar.classList.remove('is-show');
                document.body.classList.remove('is-show-bar');
            } else if (isScrollingDown && currentScrollY > PRODUCT_BAR_OFFSET) {
                productBar.classList.add('is-show');
                document.body.classList.add('is-show-bar');
            } else if (isScrollingUp && currentScrollY <= PRODUCT_BAR_OFFSET) {
                productBar.classList.remove('is-show');
                document.body.classList.remove('is-show-bar');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProductBar);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', updateProductBar);
    }
}
window.addEventListener('load', stickyProductBar);


const initLoginSwitcher = () => {
    const switcher = document.querySelector('[data-login-switcher]');
    const email = document.querySelector('[data-login-email]');
    const phone = document.querySelector('[data-login-phone]');

    if (!switcher || !email || !phone) return;

    const toggle = (element, show) => {
        if (show) {
            element.hidden = false;
            element.style.height = '0';
            element.style.opacity = '0';
            element.style.overflow = 'hidden';

            requestAnimationFrame(() => {
                element.style.height = `${element.scrollHeight}px`;
                element.style.opacity = '1';
            });

            element.addEventListener('transitionend', () => {
                if (show) {
                    element.style.height = 'auto';
                    element.style.overflow = '';
                }
            }, {once: true});

            return;
        }

        element.style.height = `${element.scrollHeight}px`;
        element.style.opacity = '1';
        element.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            element.style.height = '0';
            element.style.opacity = '0';
        });

        element.addEventListener('transitionend', () => {
            if (!show) {
                element.hidden = true;
            }
        }, {once: true});
    };

    const update = (animate = true) => {
        const isPhone = switcher.checked;

        if (!animate) {
            email.hidden = isPhone;
            phone.hidden = !isPhone;

            email.style.height = isPhone ? '0' : 'auto';
            phone.style.height = isPhone ? 'auto' : '0';
            email.style.opacity = isPhone ? '0' : '1';
            phone.style.opacity = isPhone ? '1' : '0';

            return;
        }

        toggle(email, !isPhone);
        toggle(phone, isPhone);
    };

    switcher.addEventListener('change', () => update());

    update(false);
};
initLoginSwitcher();

const initSearchToggle = () => {
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-search-toggle]');

        if (!toggle) return;

        document.body.classList.toggle('search-open');
    });
};

initSearchToggle();

document.addEventListener('DOMContentLoaded', initLoginSwitcher);

document.addEventListener('DOMContentLoaded', () => {
    const sideController = side();
    const filtersSubmit = document.querySelectorAll('[data-filter-submit]');

    if (!filtersSubmit) return;

    filtersSubmit.forEach((filter) => {

        filter.addEventListener('click', () => {
            sideController.close();
        });
    })
});


window.addEventListener('load', function (e) {

    Spoilers()
});
