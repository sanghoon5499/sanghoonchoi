document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("image_box");
    const captionText = document.getElementById("caption");
    const closeBtn = document.getElementsByClassName("close")[0];

    // Select all images with class 'image_overlay'
    const images = document.querySelectorAll("img");

    images.forEach(img => {
        img.addEventListener("click", function () {
            modal.style.display = "flex";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt ? this.alt : "";
            modalImg.classList.remove("zoom-out"); // Reset zoom-out animation
        });
    });

    function closeModal() {
        modalImg.classList.add("zoom-out"); // Apply zoom-out animation
        setTimeout(() => {
            modal.style.display = "none";
            modalImg.classList.remove("zoom-out");
        }, 300); // Match animation duration
    }

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });
});
