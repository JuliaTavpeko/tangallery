const initAnimations = () => {
    const sections = document.querySelectorAll('[data-scroll-animation]');

    if (sections.length) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                gsap.to(entry.target, {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });

                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: '0px 0px 200px 0px',
            threshold: 0
        });

        sections.forEach((item) => {
            gsap.set(item, {
                opacity: 0,
                y: 30
            });

            observer.observe(item);
        });
    }

    const offerSections = document.querySelectorAll('.offer-section');

    offerSections.forEach((section) => {
        const logo = section.querySelector('[data-offer-animation-scale]');
        const offer = section.querySelector('[data-offer-animation]');
        const tag = section.querySelector('.offer__tag');
        const title = section.querySelector('.offer__title');
        const text = section.querySelector('.offer__text');
        const button = section.querySelector('.offer__button');
        const images = section.querySelectorAll('.offer__image');

        const elements = [
            tag,
            title,
            text,
            button,
            ...images,
        ].filter(Boolean);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top bottom-=100px',
                once: true,
            },
        });

        if (logo) {
            tl.fromTo(
                logo,
                {
                    scale: 0.7,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                }
            );
        }

        if (offer) {
            tl.fromTo(
                offer,
                {
                    opacity: 0,
                    y: 40,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                },
                '-=0.7'
            );
        }

        if (elements.length) {
            tl.fromTo(
                elements,
                {
                    opacity: 0,
                    y: 25,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'power3.out',
                },
                '-=0.4'
            );
        }
    });
};

window.addEventListener('load', initAnimations);