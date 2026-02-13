// ==========================================
// 1. CONFIGURATION
// ==========================================
// TODO: Replace this with the actual URL to your projects folder on Google Cloud
const PROJECT_IMG_BASE = "https://storage.googleapis.com/sc-other/projects/"; 

// ==========================================
// 2. The Model (Data)
// ==========================================
const projects = [
    {
        title: "Cafe Logger",
        date: "Aug 19, 2025",
        // Just the filename now!
        image: "cafe_logger_usage.JPG", 
        link: "https://github.com/sanghoon5499/Cafe-Logger",
        description: "Cafe Logger is an app designed for coffee nerds interested in keeping track of the drinks they've had from a certain cafe, or beans that were noteworthy.",
        techStack: "Made with a focus on a clean architecture via MVVM with modern Jetpack libraries (Compose, Activity, Fragment)",
        buttonText: "Github"
    },
    {
        title: "RRT Planner",
        date: "Apr 9, 2025",
        image: "rrt.png",
        link: "https://github.com/sanghoon5499/RRT_Path_Planning",
        description: "A modified RRT algorithm designed to solve the \"Reach-Avoid-Stay\" problem for a drone in 2D, generating a feasible, collision-free path to a target zone.",
        techStack: "Using Python, NumPy, and Matplotlib, a graph-based search algorithm was implemented and further optimized with goal bias and proportional gain factor.",
        buttonText: "Github"
    },
    {
        title: "EasyLang",
        date: "Sept 15, 2019",
        image: "easylang_usage.JPG",
        link: "https://devpost.com/software/easylang-r8haoj",
        description: "EasyLang is a prototype app designed to help newcomers to Canada overcome language barriers by using the phone's camera to identify surrounding objects for real-time translations.",
        techStack: "Made with a focus on machine learning and augmented reality, using tools like ML-Kit and Firebase Cloud API with Android Studio.",
        buttonText: "Devpost"
    },
    // BLANK CELL (To fix borders on odd-numbered lists)
    {
        title: "",
        date: "",
        image: "", 
        link: "",
        description: "",
        techStack: "",
        buttonText: ""
    }
];

// ==========================================
// 3. The Adapter (ViewModel)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-container');
    const template = document.getElementById('project-template');

    if (!container || !template) return;

    projects.forEach(project => {
        const clone = template.content.cloneNode(true);
        
        // --- IMAGE HANDLING WITH CLOUD LOADING ---
        const imgEl = clone.querySelector('.project-image');
        
        if (project.image) {
            // Combine Base URL + Filename
            imgEl.src = PROJECT_IMG_BASE + project.image;
            imgEl.alt = project.title;
        } else {
            // If blank (for the dummy cell), remove the image area entirely
            const imgLink = clone.querySelector('a.image');
            if(imgLink) imgLink.remove();
        }

        // --- TEXT HANDLING ---
        clone.querySelector('.date').textContent = project.date || "";
        clone.querySelector('.project-title').textContent = project.title || "";
        clone.querySelector('.project-desc').textContent = project.description || "";
        clone.querySelector('.project-tech').textContent = project.techStack || "";

        // --- BUTTON HANDLING ---
        const btnEl = clone.querySelector('.project-button');
        if (project.buttonText) {
            btnEl.textContent = project.buttonText;
            btnEl.href = project.link;
        } else {
            const actionsUl = clone.querySelector('.actions');
            if(actionsUl) actionsUl.remove();
        }

        // --- LINK HANDLING ---
        if (project.link) {
            const linkEls = clone.querySelectorAll('.project-link');
            linkEls.forEach(link => link.href = project.link);
        } else {
            const titleLink = clone.querySelector('.project-title');
            if (titleLink) titleLink.removeAttribute('href');
        }

        container.appendChild(clone);
    });
});