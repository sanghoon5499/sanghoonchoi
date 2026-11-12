document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("instagram-feed");
    const template = document.getElementById("insta-post-template");
    const data = window.siteContent && window.siteContent.photography;

    if (!container || !template || !data) {
        return;
    }

    data.collections.forEach((collection) => {
        const clone = template.content.cloneNode(true);
        const carousel = clone.querySelector(".insta-carousel");
        const previousZone = clone.querySelector(".nav-zone.prev");
        const nextZone = clone.querySelector(".nav-zone.next");
        const location = clone.querySelector(".location");
        const caption = clone.querySelector(".caption-text");

        clone.querySelectorAll(".username").forEach((element) => {
            element.textContent = data.username;
        });

        location.textContent = collection.photos[0].location;
        caption.textContent = collection.photos[0].caption;

        const updateNavigation = function () {
            const tolerance = 10;
            const maximumScroll = carousel.scrollWidth - carousel.clientWidth;

            previousZone.classList.toggle("hidden", carousel.scrollLeft <= tolerance);
            nextZone.classList.toggle(
                "hidden",
                maximumScroll > 0 && carousel.scrollLeft >= maximumScroll - tolerance,
            );
        };

        collection.photos.forEach((photo) => {
            const item = document.createElement("div");
            item.className = "carousel-item";

            const image = document.createElement("img");
            image.src = data.imageBase + photo.filename;
            image.alt = photo.caption;
            image.dataset.location = photo.location;
            image.dataset.caption = photo.caption;
            image.classList.add("image_overlay");
            image.addEventListener("load", updateNavigation);

            item.appendChild(image);
            carousel.appendChild(item);
        });

        previousZone.addEventListener("click", function (event) {
            event.stopPropagation();
            carousel.scrollBy({ left: -carousel.clientWidth, behavior: "smooth" });
        });

        nextZone.addEventListener("click", function (event) {
            event.stopPropagation();
            carousel.scrollBy({ left: carousel.clientWidth, behavior: "smooth" });
        });

        carousel.addEventListener("scroll", updateNavigation);
        setTimeout(updateNavigation, 100);

        clone.querySelector(".options-btn").addEventListener("click", function () {
            const visibleImage = getVisibleImage(carousel);
            if (!visibleImage) {
                return;
            }

            const link = document.createElement("a");
            link.href = visibleImage.src;
            link.download = visibleImage.src.split("/").pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        container.appendChild(clone);
        observeVisibleImage(carousel, location, caption);
    });
});

function observeVisibleImage(carousel, location, caption) {
    const observer = new IntersectionObserver(function () {
        const image = getVisibleImage(carousel);
        if (image) {
            location.textContent = image.dataset.location;
            caption.textContent = image.dataset.caption;
        }
    }, {
        root: carousel,
        threshold: 0.6,
    });

    carousel.querySelectorAll(".carousel-item").forEach((item) => {
        observer.observe(item);
    });
}

function getVisibleImage(carousel) {
    const index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    const images = carousel.querySelectorAll("img");
    return images[index] || images[0];
}
