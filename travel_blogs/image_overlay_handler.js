document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("image_box");
    const captionText = document.getElementById("caption");

    if (!modal || !modalImg || !captionText) {
        return;
    }

    const closeBtn = modal.querySelector(".close");
    const images = document.querySelectorAll("img.image_overlay");

    images.forEach((img) => {
        img.addEventListener("click", function () {
            modal.style.display = "flex";
            modalImg.src = this.src;
            captionText.textContent = this.alt || "";
            modalImg.classList.remove("zoom-out");
        });
    });

    function closeModal() {
        modalImg.classList.add("zoom-out");
        setTimeout(() => {
            modal.style.display = "none";
            modalImg.classList.remove("zoom-out");
        }, 300);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });
});
