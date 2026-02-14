document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("image_box");
    const closeBtn = document.getElementsByClassName("close")[0];
    const captionText = document.getElementById("caption");

    // Variables for Zoom & Pan
    let scale = 1;
    let translateX = 0, translateY = 0;
    
    // Variables for Dragging (1 finger / Mouse)
    let isDragging = false;
    let startX = 0, startY = 0;

    // Variables for Pinching (2 fingers)
    let initialPinchDistance = 0;
    let initialScale = 1;
    let isPinching = false;

    // --- 1. OPEN MODAL ---
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('image_overlay')) {
            modal.style.display = "flex";
            modalImg.src = e.target.src;
            
            const altText = e.target.getAttribute("alt");
            if(captionText) captionText.innerHTML = altText ? altText : "";
            
            modalImg.classList.remove("zoom-out");
            document.body.style.overflow = "hidden"; // Lock background
            resetZoom();
        }
    });

    // --- 2. CLOSE MODAL ---
    function closeModal() {
        modalImg.classList.add("zoom-out");
        setTimeout(() => {
            modal.style.display = "none";
            modalImg.classList.remove("zoom-out");
            document.body.style.overflow = "auto"; 
        }, 200);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
    });

    // --- 3. TRANSFORMATION LOGIC ---

    function updateTransform() {
        // Prevent panning outside of image boundaries
        constrainPan();
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function constrainPan() {
        // Calculate max pan limits based on current zoom
        const viewportW = modal.clientWidth;
        const viewportH = modal.clientHeight;
        
        // Max allowed pan is half the difference between scaled image and viewport
        // If image is smaller than viewport, limit is 0 (centered)
        const maxPanX = Math.max(0, (viewportW * scale - viewportW) / 2);
        const maxPanY = Math.max(0, (viewportH * scale - viewportH) / 2);

        if (translateX > maxPanX) translateX = maxPanX;
        if (translateX < -maxPanX) translateX = -maxPanX;
        if (translateY > maxPanY) translateY = maxPanY;
        if (translateY < -maxPanY) translateY = -maxPanY;
    }

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        modalImg.style.transform = `translate(0px, 0px) scale(1)`;
        modalImg.style.cursor = "grab";
    }

    // --- 4. TOUCH EVENTS (PINCH & DRAG) ---

    modalImg.addEventListener("touchstart", function(e) {
        e.preventDefault(); // Stop default browser zoom/scroll

        // Handle 2 Fingers (Pinch)
        if (e.touches.length === 2) {
            isPinching = true;
            isDragging = false; // Disable drag while pinching
            initialPinchDistance = getDistance(e.touches);
            initialScale = scale;
        } 
        // Handle 1 Finger (Drag)
        else if (e.touches.length === 1 && scale > 1) {
            isDragging = true;
            isPinching = false;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
            modalImg.style.cursor = "grabbing";
        }
    }, {passive: false});

    modalImg.addEventListener("touchmove", function(e) {
        e.preventDefault();

        // Pinch Logic
        if (isPinching && e.touches.length === 2) {
            const currentDistance = getDistance(e.touches);
            const ratio = currentDistance / initialPinchDistance;
            
            // Update scale based on pinch ratio
            // Clamp scale between 1 and 5
            scale = Math.min(Math.max(1, initialScale * ratio), 5);
            updateTransform();
        }
        // Drag Logic
        else if (isDragging && e.touches.length === 1) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }, {passive: false});

    modalImg.addEventListener("touchend", function(e) {
        // If fingers lift, stop interactions
        isDragging = false;
        isPinching = false;
        modalImg.style.cursor = "grab";
        
        // Snap back if scale dipped below 1 (rubber band effect)
        if (scale < 1) {
            scale = 1;
            updateTransform();
        }
    });

    // Helper: Calculate distance between two touch points
    function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // --- 5. MOUSE EVENTS (DESKTOP) ---

    // Wheel Zoom
    modalImg.addEventListener("wheel", function(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.005; // Adjust sensitivity
        scale = Math.min(Math.max(1, scale + delta), 5);
        updateTransform();
    });

    // Double Click Zoom
    modalImg.addEventListener("dblclick", function() {
        if (scale > 1) {
            resetZoom();
        } else {
            scale = 2.5;
            updateTransform();
        }
    });

    // Mouse Drag
    modalImg.addEventListener("mousedown", function(e) {
        if (scale === 1) return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImg.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", function(e) {
        if (!isDragging || isPinching) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener("mouseup", function() {
        isDragging = false;
        modalImg.style.cursor = "grab";
    });
});