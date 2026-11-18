document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("projects-container");
    const template = document.getElementById("project-template");
    const data = window.siteContent && window.siteContent.projects;

    if (!container || !template || !data) {
        return;
    }

    container.classList.toggle("has-odd-cards", data.items.length % 2 === 1);

    data.items.forEach((project) => {
        const clone = template.content.cloneNode(true);
        const imageLink = clone.querySelector("a.image");
        const image = clone.querySelector(".project-image");

        if (project.image) {
            const originalImageUrl = data.imageBase + project.image;

            image.loading = "lazy";
            image.decoding = "async";
            image.alt = project.title;

            function hideUnavailableImage() {
                imageLink.remove();
            }

            if (project.webpImage) {
                image.addEventListener("error", function useOriginalImage() {
                    image.addEventListener("error", hideUnavailableImage, { once: true });
                    image.src = originalImageUrl;
                }, { once: true });
                image.src = data.imageBase + project.webpImage;
            } else {
                image.addEventListener("error", hideUnavailableImage, { once: true });
                image.src = originalImageUrl;
            }
        } else {
            imageLink.remove();
        }

        clone.querySelector(".date").textContent = project.date;
        clone.querySelector(".project-title").textContent = project.title;
        clone.querySelector(".project-desc").textContent = project.description;
        clone.querySelector(".project-tech").textContent = project.techStack;

        clone.querySelectorAll(".project-link").forEach((link) => {
            link.href = project.link;
        });

        const button = clone.querySelector(".project-button");
        button.href = project.link;
        button.textContent = project.buttonText;

        if (project.liveLink) {
            const liveAction = clone.querySelector(".project-live-action");
            const liveButton = clone.querySelector(".project-live-button");

            liveButton.href = project.liveLink;
            liveButton.textContent = project.liveButtonText;
            liveAction.hidden = false;
        }

        container.appendChild(clone);
    });
});
