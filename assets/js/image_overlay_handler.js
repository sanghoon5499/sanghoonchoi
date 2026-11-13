document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.createElement("dialog");
    dialog.className = "image-popover";
    dialog.setAttribute("aria-label", "Image preview");

    const content = document.createElement("div");
    content.className = "image-popover__content";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "image-popover__close";
    closeButton.setAttribute("aria-label", "Close image preview");
    closeButton.textContent = "×";

    const stage = document.createElement("div");
    stage.className = "image-popover__stage";

    const preview = document.createElement("img");
    preview.className = "image-popover__image";
    preview.alt = "";
    preview.draggable = false;

    const footer = document.createElement("div");
    footer.className = "image-popover__footer";

    const caption = document.createElement("p");
    caption.className = "image-popover__caption";

    const originalLink = document.createElement("a");
    originalLink.className = "image-popover__original";
    originalLink.target = "_blank";
    originalLink.rel = "noopener noreferrer";
    originalLink.textContent = "Open original";

    stage.appendChild(preview);
    footer.appendChild(caption);
    footer.appendChild(originalLink);
    content.appendChild(closeButton);
    content.appendChild(stage);
    content.appendChild(footer);
    dialog.appendChild(content);
    document.body.appendChild(dialog);

    let triggerImage = null;
    let previousBodyOverflow = "";
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let isPinching = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function constrainPan() {
        const maximumX = Math.max(0, (preview.clientWidth * scale - stage.clientWidth) / 2);
        const maximumY = Math.max(0, (preview.clientHeight * scale - stage.clientHeight) / 2);
        translateX = clamp(translateX, -maximumX, maximumX);
        translateY = clamp(translateY, -maximumY, maximumY);
    }

    function updateTransform() {
        constrainPan();
        preview.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        preview.classList.toggle("is-zoomed", scale > 1);
    }

    function resetTransform() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }

    function getTouchDistance(touches) {
        const deltaX = touches[0].clientX - touches[1].clientX;
        const deltaY = touches[0].clientY - touches[1].clientY;
        return Math.hypot(deltaX, deltaY);
    }

    function openPopover(image) {
        const previewSource = image.currentSrc || image.src;
        const originalSource = image.dataset.originalSrc || previewSource;

        triggerImage = image;
        preview.src = previewSource;
        preview.alt = image.alt || "";
        caption.textContent = image.alt || "";
        caption.hidden = !image.alt;
        originalLink.href = originalSource;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
        resetTransform();
        closeButton.focus({ preventScroll: true });
    }

    function closePopover() {
        if (dialog.open) {
            dialog.close();
        }
    }

    document.body.addEventListener("click", function (event) {
        const target = event.target;
        const image = target && typeof target.closest === "function"
            ? target.closest("img.image_overlay")
            : null;

        if (image) {
            openPopover(image);
        }
    });

    closeButton.addEventListener("click", closePopover);

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            closePopover();
        }
    });

    dialog.addEventListener("close", function () {
        document.body.style.overflow = previousBodyOverflow;
        resetTransform();
        preview.removeAttribute("src");

        if (triggerImage) {
            triggerImage.focus({ preventScroll: true });
        }
    });

    preview.addEventListener("touchstart", function (event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            isPinching = true;
            isDragging = false;
            pinchStartDistance = getTouchDistance(event.touches);
            pinchStartScale = scale;
        } else if (event.touches.length === 1 && scale > 1) {
            event.preventDefault();
            isDragging = true;
            isPinching = false;
            dragStartX = event.touches[0].clientX - translateX;
            dragStartY = event.touches[0].clientY - translateY;
        }
    }, { passive: false });

    preview.addEventListener("touchmove", function (event) {
        if (isPinching && event.touches.length === 2) {
            event.preventDefault();
            const distance = getTouchDistance(event.touches);
            scale = clamp(pinchStartScale * distance / pinchStartDistance, 1, 5);
            updateTransform();
        } else if (isDragging && event.touches.length === 1) {
            event.preventDefault();
            translateX = event.touches[0].clientX - dragStartX;
            translateY = event.touches[0].clientY - dragStartY;
            updateTransform();
        }
    }, { passive: false });

    preview.addEventListener("touchend", function () {
        isDragging = false;
        isPinching = false;
    });

    preview.addEventListener("wheel", function (event) {
        event.preventDefault();
        scale = clamp(scale - event.deltaY * 0.005, 1, 5);
        updateTransform();
    }, { passive: false });

    preview.addEventListener("dblclick", function () {
        scale = scale > 1 ? 1 : 2.5;
        translateX = 0;
        translateY = 0;
        updateTransform();
    });

    preview.addEventListener("mousedown", function (event) {
        if (scale === 1) {
            return;
        }

        event.preventDefault();
        isDragging = true;
        dragStartX = event.clientX - translateX;
        dragStartY = event.clientY - translateY;
    });

    window.addEventListener("mousemove", function (event) {
        if (!isDragging || isPinching) {
            return;
        }

        translateX = event.clientX - dragStartX;
        translateY = event.clientY - dragStartY;
        updateTransform();
    });

    window.addEventListener("mouseup", function () {
        isDragging = false;
    });
});
