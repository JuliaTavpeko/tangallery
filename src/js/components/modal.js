import { Fancybox } from "@fancyapps/ui/dist/fancybox/";

function initModal() {

    Fancybox.bind("[data-fancybox]", {
        autoFocus: false,
        Thumbs: false,
        // Thumbs: {
        //     type: "classic",
        // },
    });

    Fancybox.bind("[data-modal]", {
        autoFocus: false,
        closeButton: false,
        Carousel: {
            Zoomable:
                {
                    Panzoom: {
                        touch: false,
                    },
                },
        },
    });
}

window.addEventListener("load", initModal);