(function () {
    const script = document.currentScript;
    const mediaBase = script ? script.dataset.mediaBase : "";
    const audioBase = script ? script.dataset.audioBase : "";

    document.addEventListener("DOMContentLoaded", function () {
        const mediaElements = document.querySelectorAll(".js-dynamic-image, .js-dynamic-audio");

        mediaElements.forEach((element) => {
            const filename = element.dataset.filename;
            const isAudio = element.classList.contains("js-dynamic-audio");
            const resourceBase = element.dataset.mediaBase || (isAudio ? audioBase : mediaBase);

            if (!filename || !resourceBase) {
                return;
            }

            if (element.tagName === "IMG") {
                element.loading = "lazy";
                element.decoding = "async";
            } else if (element.tagName === "VIDEO") {
                element.preload = "metadata";
            }

            element.src = resourceBase + filename;

            if (element.tagName === "VIDEO") {
                element.load();
            } else if (element.tagName === "SOURCE") {
                const parentMedia = element.closest("audio, video");
                if (parentMedia) {
                    parentMedia.load();
                }
            }
        });
    });
})();
