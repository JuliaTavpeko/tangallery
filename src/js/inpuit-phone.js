"use strict"

const initPhoneFields = () => {
    const phoneFields = document.querySelectorAll('[data-phone]');

    phoneFields.forEach((phone) => {
        const phoneCode = phone.querySelector('[data-phone-code]');
        const control = phone.querySelector('[data-phone-control]');
        const active = phone.querySelector('[data-phone-active]');
        const input = phone.querySelector('[data-phone-input]');
        const items = phone.querySelectorAll('[data-phone-item]');

        if (!phoneCode || !control || !active || !input || !items.length) return;

        let maskInstance = null;

        const setMask = (mask) => {
            if (!mask) return;

            if (maskInstance) {
                maskInstance.destroy();
            }

            const imaskPattern = mask.replaceAll('_', '0');

            maskInstance = IMask(input, {
                mask: imaskPattern,
            });

            input.placeholder = mask;
        };

        const setActive = (item) => {
            const flag = item.querySelector('.phone-code__flag');
            const mask = item.dataset.phoneItem;

            if (flag) {
                active.innerHTML = flag.outerHTML;
            }

            setMask(mask);
        };

        control.addEventListener('click', () => {
            phoneCode.classList.toggle('is-open');
        });

        items.forEach((item) => {
            item.addEventListener('click', () => {
                setActive(item);
                phoneCode.classList.remove('is-open');
            });
        });

        setActive(items[0]);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-phone]')) return;

        document.querySelectorAll('[data-phone-code].is-open').forEach((phoneCode) => {
            phoneCode.classList.remove('is-open');
        });
    });
};
window.addEventListener('load', initPhoneFields);