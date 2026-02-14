document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("image_box");
    const closeBtn = document.getElementsByClassName("close")[0];

    // Zoom & Pan Variables
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    // --- 1. OPEN MODAL LOGIC ---
    // Use event delegation for better performance with dynamic images
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('image_overlay')) {
            modal.style.display = "flex";
            modalImg.src = e.target.src;
            
            const altText = e.target.getAttribute("alt");
            if(captionText) captionText.innerHTML = altText ? altText : "";
            
            modalImg.classList.remove("zoom-out");
            document.body.style.overflow = "hidden"; // Lock background scroll
            
            resetZoom();
        }
    });

    // --- 2. CLOSE MODAL LOGIC ---
    function closeModal() {
        modalImg.classList.add("zoom-out");
        setTimeout(() => {
            modal.style.display = "none";
            modalImg.classList.remove("zoom-out");
            document.body.style.overflow = "auto"; // Unlock background scroll
        }, 200);
    }

    if(closeBtn) closeBtn.addEventListener("click", closeModal);
    
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- 3. ZOOM & PAN LOGIC ---

    function updateTransform() {
        // Enforce boundaries before applying transform
        constrainPan();
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    /**
     * Prevents the image from drifting off screen.
     * Calculates the maximum distance you are allowed to pan based on current scale.
     */
    function constrainPan() {
        // Get dimensions
        const rect = modalImg.getBoundingClientRect();
        
        // At scale 1, we shouldn't be able to pan at all.
        // As scale grows, the allowable pan distance grows.
        // Max Pan = (Scaled Dimension - Viewport Dimension) / 2
        
        // We use the image's natural size vs viewport to be precise, 
        // but a simpler approximation using the modal dimensions works well:
        const viewportW = modal.clientWidth;
        const viewportH = modal.clientHeight;
        
        // This estimate works because the image is centered by flexbox
        const maxX = (viewportW * scale - viewportW) / 2;
        const maxY = (viewportH * scale - viewportH) / 2;

        // If zoomed out (scale 1), max pan is 0.
        // Math.max(0, ...) prevents negative values if the image is smaller than screen
        const limitX = Math.max(0, maxX);
        const limitY = Math.max(0, maxY);

        // Clamp the values
        if (translateX > limitX) translateX = limitX;
        if (translateX < -limitX) translateX = -limitX;
        if (translateY > limitY) translateY = limitY;
        if (translateY < -limitY) translateY = -limitY;
    }

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        modalImg.style.transform = `translate(0px, 0px) scale(1)`;
        modalImg.style.cursor = "grab";
    }

    // A. WHEEL ZOOM (Desktop)
    modalImg.addEventListener("wheel", function(e) {
        e.preventDefault();
        
        const delta = e.deltaY * -0.01;
        // Restrict scale between 1x and 4x
        const newScale = Math.min(Math.max(1, scale + delta), 4);
        
        scale = newScale;
        updateTransform();
    });

    // B. DRAG / PAN LOGIC (Desktop & Mobile)
    modalImg.addEventListener("mousedown", startDrag);
    modalImg.addEventListener("touchstart", startDrag, {passive: false});

    function startDrag(e) {
        if (scale === 1) return; // Don't drag if not zoomed
        e.preventDefault();
        
        isDragging = true;
        modalImg.style.cursor = "grabbing";

        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        // We record the difference between current Mouse and current Translate
        startX = clientX - translateX;
        startY = clientY - translateY;
    }

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    function endDrag() {
        isDragging = false;
        modalImg.style.cursor = "grab";
    }

    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("touchmove", moveDrag, {passive: false});

    function moveDrag(e) {
        if (!isDragging) return;
        e.preventDefault(); 

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        translateX = clientX - startX;
        translateY = clientY - startY;

        updateTransform();
    }
    
    // C. DOUBLE CLICK TO TOGGLE ZOOM
    modalImg.addEventListener("dblclick", function() {
        if (scale > 1) {
            resetZoom();
        } else {
            scale = 2.5; // Instant zoom
            updateTransform();
        }
    });
});