document.addEventListener("DOMContentLoaded", function () {
    const openButton = document.getElementById("open-resume-popover");
    const closeButton = document.getElementById("close-resume-popover");
    const dialog = document.getElementById("resume-popover");
    const viewer = dialog && dialog.querySelector("iframe");

    if (!openButton || !closeButton || !dialog || !viewer) {
        return;
    }

    let previousBodyOverflow = "";

    openButton.addEventListener("click", function () {
        if (!viewer.dataset.loaded) {
            viewer.src = viewer.dataset.src;
            viewer.dataset.loaded = "true";
        }

        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
        closeButton.focus({ preventScroll: true });
    });

    closeButton.addEventListener("click", function () {
        dialog.close();
    });

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    dialog.addEventListener("close", function () {
        document.body.style.overflow = previousBodyOverflow;
        openButton.focus({ preventScroll: true });
    });
});
