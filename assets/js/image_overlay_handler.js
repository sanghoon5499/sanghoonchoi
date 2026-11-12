document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("image_box");
    const captionText = document.getElementById("caption");

    if (!modal || !modalImg || !captionText) {
        return;
    }

    const closeBtn = modal.querySelector(".close");
    const zoomEnabled = modal.dataset.zoomable === "true";
    const configuredCloseDuration = Number.parseInt(modal.dataset.closeDuration || "300", 10);
    const closeDuration = Number.isFinite(configuredCloseDuration) ? configuredCloseDuration : 300;

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-label", "Image preview");
    modal.setAttribute("aria-describedby", "caption");
    modal.tabIndex = -1;

    let triggerElement = null;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let isPinching = false;
    let startX = 0;
    let startY = 0;
    let initialPinchDistance = 0;
    let initialScale = 1;
    let previousBodyOverflow = "";

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        modalImg.style.transform = "translate(0px, 0px) scale(1)";
        modalImg.style.cursor = zoomEnabled ? "grab" : "default";
    }

    function openModal(image) {
        const originalSource = image.dataset.originalSrc || image.src;
        triggerElement = image;
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        modalImg.src = originalSource;
        modalImg.dataset.originalSrc = originalSource;
        modalImg.alt = image.alt || "";
        captionText.textContent = image.alt || "";
        modalImg.classList.remove("zoom-out");

        if (zoomEnabled) {
            previousBodyOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            resetZoom();
        }

        modal.focus({ preventScroll: true });
    }

    function closeModal() {
        modalImg.classList.add("zoom-out");
        setTimeout(() => {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
            modalImg.classList.remove("zoom-out");

            if (zoomEnabled) {
                document.body.style.overflow = previousBodyOverflow;
                resetZoom();
            }

            if (triggerElement) {
                triggerElement.focus({ preventScroll: true });
            }
        }, closeDuration);
    }

    document.body.addEventListener("click", function (event) {
        const target = event.target;
        const image = target && typeof target.closest === "function"
            ? target.closest("img.image_overlay")
            : null;

        if (image) {
            openModal(image);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (modal.style.display !== "flex") {
            return;
        }

        if (event.key === "Escape") {
            closeModal();
        } else if (event.key === "Tab") {
            event.preventDefault();
            modal.focus({ preventScroll: true });
        }
    });

    if (!zoomEnabled) {
        return;
    }

    function constrainPan() {
        const viewportWidth = modal.clientWidth;
        const viewportHeight = modal.clientHeight;
        const maxPanX = Math.max(0, (viewportWidth * scale - viewportWidth) / 2);
        const maxPanY = Math.max(0, (viewportHeight * scale - viewportHeight) / 2);

        translateX = Math.min(Math.max(translateX, -maxPanX), maxPanX);
        translateY = Math.min(Math.max(translateY, -maxPanY), maxPanY);
    }

    function updateTransform() {
        constrainPan();
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function getPinchDistance(touches) {
        const deltaX = touches[0].clientX - touches[1].clientX;
        const deltaY = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    modalImg.addEventListener("touchstart", function (event) {
        event.preventDefault();

        if (event.touches.length === 2) {
            isPinching = true;
            isDragging = false;
            initialPinchDistance = getPinchDistance(event.touches);
            initialScale = scale;
        } else if (event.touches.length === 1 && scale > 1) {
            isDragging = true;
            isPinching = false;
            startX = event.touches[0].clientX - translateX;
            startY = event.touches[0].clientY - translateY;
            modalImg.style.cursor = "grabbing";
        }
    }, { passive: false });

    modalImg.addEventListener("touchmove", function (event) {
        event.preventDefault();

        if (isPinching && event.touches.length === 2) {
            const currentDistance = getPinchDistance(event.touches);
            scale = Math.min(Math.max(1, initialScale * currentDistance / initialPinchDistance), 5);
            updateTransform();
        } else if (isDragging && event.touches.length === 1) {
            translateX = event.touches[0].clientX - startX;
            translateY = event.touches[0].clientY - startY;
            updateTransform();
        }
    }, { passive: false });

    modalImg.addEventListener("touchend", function () {
        isDragging = false;
        isPinching = false;
        modalImg.style.cursor = "grab";
    });

    modalImg.addEventListener("wheel", function (event) {
        event.preventDefault();
        const delta = event.deltaY * -0.005;
        scale = Math.min(Math.max(1, scale + delta), 5);
        updateTransform();
    });

    modalImg.addEventListener("dblclick", function () {
        if (scale > 1) {
            resetZoom();
        } else {
            scale = 2.5;
            updateTransform();
        }
    });

    modalImg.addEventListener("mousedown", function (event) {
        if (scale === 1) {
            return;
        }

        event.preventDefault();
        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        modalImg.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", function (event) {
        if (!isDragging || isPinching) {
            return;
        }

        event.preventDefault();
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
    });

    window.addEventListener("mouseup", function () {
        isDragging = false;
        modalImg.style.cursor = "grab";
    });
});
