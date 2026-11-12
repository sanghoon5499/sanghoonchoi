(function () {
    const script = document.currentScript;
    const mediaBase = script ? script.dataset.mediaBase : "";
    const audioBase = script ? script.dataset.audioBase : "";
    const preferWebp = script ? script.dataset.preferWebp === "true" : false;

    function getWebpUrl(originalUrl) {
        const suffixIndex = originalUrl.search(/[?#]/);
        const suffix = suffixIndex === -1 ? "" : originalUrl.slice(suffixIndex);
        const path = suffixIndex === -1 ? originalUrl : originalUrl.slice(0, suffixIndex);
        const slashIndex = path.lastIndexOf("/");
        const extensionIndex = path.lastIndexOf(".");

        if (extensionIndex <= slashIndex) {
            return originalUrl;
        }

        const directory = path.slice(0, slashIndex + 1);
        const filename = path.slice(slashIndex + 1, extensionIndex);
        return `${directory}webp/${filename}.webp${suffix}`;
    }

    function setImageSource(image, originalUrl, shouldPreferWebp = preferWebp) {
        image.loading = "lazy";
        image.decoding = "async";
        image.dataset.originalSrc = originalUrl;

        if (!shouldPreferWebp) {
            image.src = originalUrl;
            return;
        }

        image.addEventListener("error", function useOriginalImage() {
            image.src = originalUrl;
        }, { once: true });
        image.src = getWebpUrl(originalUrl);
    }

    window.siteMedia = {
        getWebpUrl,
        setImageSource,
    };

    document.addEventListener("DOMContentLoaded", function () {
        const mediaElements = document.querySelectorAll(".js-dynamic-image, .js-dynamic-audio");

        mediaElements.forEach((element) => {
            const filename = element.dataset.filename;
            const isAudio = element.classList.contains("js-dynamic-audio");
            const resourceBase = element.dataset.mediaBase || (isAudio ? audioBase : mediaBase);

            if (!filename || !resourceBase) {
                return;
            }

            const originalUrl = resourceBase + filename;

            if (element.tagName === "IMG") {
                setImageSource(element, originalUrl);
            } else {
                element.src = originalUrl;
            }

            if (element.tagName === "VIDEO") {
                element.preload = "metadata";
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
