// ==========================================
// 1. CONFIGURATION
// ==========================================
// Base URL for your travel blog images
const BLOG_IMG_BASE = "https://storage.googleapis.com/sc-travel-blog/"; 

// ==========================================
// 2. The Model (Data)
// ==========================================
const blogs = [
    {
        title: "Korea",
        date: "May 6 - June 9, 2025",
        image: "Korea_Thumb_horizontal.png",
        link: "../travel_blogs/korea_2025.html",
        description: "A return to my roots in Korea, this trip was a chance to reconnect with family and friends, and explore new sides of a place I once knew. I discovered hidden gems and new perspectives on my past.",
        buttonText: "Full Story"
    },
    {
        title: "Japan",
        date: "Apr 26 - May 5, 2025",
        image: "Japan_Thumb_horizontal.png",
        link: "../travel_blogs/japan_2025.html",
        description: "A return to Japan felt both familiar and brand new. Join me on a two-week adventure of contrasts: from the streets of Tokyo to the peaks of Hakone, filled with amazing food and a newfound love for nama biru.",
        buttonText: "Full Story"
    },
    {
        title: "Montréal",
        date: "Sept 27 - Oct 12, 2024",
        image: "montreal.JPG",
        link: "../travel_blogs/montreal.html",
        description: "Boasting a strong French heritage, I was able to get a taste of French culture, cuisine, and architecture. Chock-full of interesting visuals in every corner of the city, it's worth taking the time to take in the views.",
        buttonText: "Full Story"
    },
    {
        title: "San Francisco<br />Los Angeles",
        date: "July 2 - July 18, 2024",
        image: "sfla.JPG",
        link: "../travel_blogs/SF_LA.html",
        description: "I finally know why every SF startup CEO and their mothers pair a Patagonia vest and a shirt; it's chillier than you think. But besides the climate, I had a blast enjoying some good food and good company.",
        buttonText: "Full Story"
    },
    // Add a blank object here if you have an odd number of posts
    // { title: "", date: "", image: "", link: "", description: "", buttonText: "" }
];

// ==========================================
// 3. The Adapter (ViewModel)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('blogs-container');
    const template = document.getElementById('blog-template');

    if (!container || !template) return;

    blogs.forEach(blog => {
        const clone = template.content.cloneNode(true);
        
        // --- IMAGE HANDLING ---
        const imgEl = clone.querySelector('.blog-image');
        if (blog.image) {
            imgEl.src = BLOG_IMG_BASE + blog.image;
            imgEl.alt = blog.title.replace("<br />", " "); // Clean alt text
        } else {
            const imgLink = clone.querySelector('a.image');
            if(imgLink) imgLink.remove();
        }

        // --- TEXT HANDLING ---
        clone.querySelector('.date').textContent = blog.date || "";
        
        // Use innerHTML for title to allow <br /> tags
        clone.querySelector('.blog-title').innerHTML = blog.title || "";
        
        clone.querySelector('.blog-desc').textContent = blog.description || "";

        // --- BUTTON HANDLING ---
        const btnEl = clone.querySelector('.blog-button');
        if (blog.buttonText) {
            btnEl.textContent = blog.buttonText;
            btnEl.href = blog.link;
        } else {
            const actionsUl = clone.querySelector('.actions');
            if(actionsUl) actionsUl.remove();
        }

        // --- LINK HANDLING ---
        if (blog.link) {
            const linkEls = clone.querySelectorAll('.blog-link');
            linkEls.forEach(link => link.href = blog.link);
        } else {
            const titleLink = clone.querySelector('.blog-title');
            if (titleLink) titleLink.removeAttribute('href');
        }

        container.appendChild(clone);
    });
});