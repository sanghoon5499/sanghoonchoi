window.siteContent = window.siteContent || {};

window.siteContent.projects = {
    imageBase: "https://storage.googleapis.com/sc-other/projects/",
    items: [
        {
            title: "Cafe Logger",
            date: "Aug 19, 2025",
            image: "cafe_logger_usage.JPG",
            link: "https://github.com/sanghoon5499/Cafe-Logger",
            description: "Cafe Logger is an app designed for coffee nerds interested in keeping track of the drinks they've had from a certain cafe, or beans that were noteworthy.",
            techStack: "Made with a focus on a clean architecture via MVVM with modern Jetpack libraries (Compose, Activity, Fragment)",
            buttonText: "Github",
        },
        {
            title: "RRT Planner",
            date: "Apr 9, 2025",
            image: "rrt.png",
            link: "https://github.com/sanghoon5499/RRT_Path_Planning",
            description: "A modified RRT algorithm designed to solve the \"Reach-Avoid-Stay\" problem for a drone in 2D, generating a feasible, collision-free path to a target zone.",
            techStack: "Using Python, NumPy, and Matplotlib, a graph-based search algorithm was implemented and further optimized with goal bias and proportional gain factor.",
            buttonText: "Github",
        },
        {
            title: "EasyLang",
            date: "Sept 15, 2019",
            image: "easylang_usage.JPG",
            link: "https://devpost.com/software/easylang-r8haoj",
            description: "EasyLang is a prototype app designed to help newcomers to Canada overcome language barriers by using the phone's camera to identify surrounding objects for real-time translations.",
            techStack: "Made with a focus on machine learning and augmented reality, using tools like ML-Kit and Firebase Cloud API with Android Studio.",
            buttonText: "Devpost",
        },
    ],
};
