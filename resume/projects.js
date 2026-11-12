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
        const image = clone.querySelector(".project-image");

        image.src = data.imageBase + project.image;
        image.alt = project.title;

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

        container.appendChild(clone);
    });
});
