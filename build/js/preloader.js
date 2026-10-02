const initPreloader = () => {
    const preloader = document.querySelector('[data-preloader]');
    const slider = preloader?.querySelector('[data-preloader-slider]');

    if (!preloader || !slider) return;

    let position = 0;
    let direction = 1;
    let lastTime = performance.now();

    const speed = 0.08;
    const barWidth = 40;
    const maxPosition = slider.clientWidth - barWidth;

    const animate = (time) => {
        const delta = time - lastTime;
        lastTime = time;

        position += direction * speed * delta;

        if (position >= maxPosition) {
            position = maxPosition;
            direction = -1;
        }

        if (position <= 0) {
            position = 0;
            direction = 1;
        }

        slider.style.setProperty('--preloader-position', `${position}px`);

        requestAnimationFrame(animate);
    };

    const hidePreloader = () => {
        preloader.style.opacity = '0';

        setTimeout(() => {
            preloader.remove();
        }, 800);
    };

    requestAnimationFrame(animate);

    setTimeout(hidePreloader, 3000);
};

initPreloader();