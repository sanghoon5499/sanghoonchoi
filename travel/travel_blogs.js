document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("blogs-container");
    const template = document.getElementById("blog-template");
    const data = window.siteContent && window.siteContent.travelBlogs;

    if (!container || !template || !data) {
        return;
    }

    container.classList.toggle("has-odd-cards", data.items.length % 2 === 1);

    data.items.forEach((blog) => {
        const clone = template.content.cloneNode(true);
        const image = clone.querySelector(".blog-image");
        const title = clone.querySelector(".blog-title");

        const originalImageUrl = data.imageBase + blog.image;
        window.siteMedia.setImageSource(image, originalImageUrl);
        image.alt = blog.titleLine2 ? `${blog.title} ${blog.titleLine2}` : blog.title;

        title.textContent = blog.title;
        if (blog.titleLine2) {
            title.appendChild(document.createElement("br"));
            title.appendChild(document.createTextNode(blog.titleLine2));
        }

        clone.querySelector(".date").textContent = blog.date;
        clone.querySelector(".blog-desc").textContent = blog.description;

        clone.querySelectorAll(".blog-link").forEach((link) => {
            link.href = blog.link;
        });

        const button = clone.querySelector(".blog-button");
        button.href = blog.link;
        button.textContent = blog.buttonText;

        container.appendChild(clone);
    });
});
