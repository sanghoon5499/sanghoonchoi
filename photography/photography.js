// ==========================================
// 1. CONFIGURATION
// ==========================================
const PHOTO_IMG_BASE = "https://storage.googleapis.com/sc-photography/";

// ==========================================
// 2. The Model (Data - Grouped by "Trip")
// ==========================================
const sanghoon = "Sanghoon Choi";
const posts = [
    {
        id: "japan_trip",
        avatar: "avatar.png", 
        username: sanghoon,
        content: [
            { filename: "cat_street_edited.jpg", location: "Shibuya, Tokyo", caption: "Cat Street. A busy intersection in front of Mr Brothers Cut Club" },
            { filename: "car.JPG", location: "Okubo, Tokyo", caption: "1986 Suzuki Cervo with RS Watanabes" },
            { filename: "ginza_edited.jpg", location: "Ginza, Tokyo", caption: "A quiet slice of the workday in Ginza" },
            { filename: "kamakura_beach_edited.jpg", location: "Kamakura, Kanagawa", caption: "Mt. Fuji from the beaches of Kamakura" },
            { filename: "train_guy.JPG", location: "Hakone, Kanagawa", caption: "The train operator notices my camera" },
            { filename: "hakone2_edited.jpg", location: "Hakone, Kanagawa", caption: "Mt. Hakone as seen from Mt. Ashigara" },
            { filename: "nara_gate_edited.jpg", location: "Nara Park, Nara", caption: "One of many Torii gates in the park" },
            { filename: "nara_man_edited.jpg", location: "Nara Park, Nara", caption: "Street crossing" },
            { filename: "kimono_shop.JPG", location: "Nakagyo, Kyoto", caption: "Kimono rental service" },
            { filename: "singer.JPG", location: "Hyogo, Kobe", caption: "A young girl watches a performer" },
            { filename: "osaka_rain_edited.jpg", location: "Nishinari Ward, Osaka", caption: "A rainy but still busy street in Osaka" }
        ]
    },
    {
        id: "korea_trip",
        avatar: "avatar.png", 
        username: sanghoon,
        content: [
            { filename: "palace1_edited.jpg", location: "Gwanghwamun, Seoul", caption: "Hanbok experience at Gwanghwamun" },
            { filename: "umbrella.JPG", location: "Bay National Garden, Suncheon", caption: "A couple rests under a large sunshade" },
            { filename: "fennec_fox.jpg", location: "Bay National Garden, Suncheon", caption: "A fennec fox sunbathes under the blistering sun" },
            { filename: "rx72.JPG", location: "Seongsu, Seoul", caption: "Keisuke Takahashi's RX-7 from Initial D" },
            { filename: "lightshow_silhouettes.JPG", location: "Expo Park, Daejeon", caption: "Watershow at the '93 Expo Tower" },
            { filename: "grinders.JPG", location: "Seopjikoji, Jeju Island", caption: "A coffee museum boasting their collection of antique grinders" }
        ]
    },
    {
        id: "canada_life",
        avatar: "avatar.png", 
        username: sanghoon,
        content: [
            { filename: "pizza.JPG", location: "Toronto, Ontario", caption: "Pizzeria Libretto" },
            { filename: "stcatherines.JPG", location: "St. Catharines, Ontario", caption: "Toronto from St. Catherines' beach" }
        ]
    }
];

// ==========================================
// 3. The Controller (Render & Logic)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('instagram-feed');
    const template = document.getElementById('insta-post-template');

    if (!container || !template) return;

    posts.forEach(post => {
        // 1. Clone Template
        const clone = template.content.cloneNode(true);
        
        // 2. Select Elements
        const carousel = clone.querySelector('.insta-carousel');
        const prevZone = clone.querySelector('.nav-zone.prev');
        const nextZone = clone.querySelector('.nav-zone.next');
        const locationEl = clone.querySelector('.location');
        const captionEl = clone.querySelector('.caption-text');
        
        // 3. Populate Data
        clone.querySelectorAll('.username').forEach(el => el.textContent = post.username);
        locationEl.textContent = post.content[0].location;
        captionEl.textContent = post.content[0].caption;

        // 4. Define the Zone Update Logic FIRST (so we can use it in loop)
        const updateZones = () => {
            const tolerance = 10;
            const scrollLeft = carousel.scrollLeft;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            // Start Logic
            if (scrollLeft <= tolerance) {
                prevZone.classList.add('hidden');
            } else {
                prevZone.classList.remove('hidden');
            }

            // End Logic
            // If maxScroll is 0 (images loading), don't hide 'next' yet.
            if (maxScroll > 0 && scrollLeft >= maxScroll - tolerance) {
                nextZone.classList.add('hidden');
            } else {
                nextZone.classList.remove('hidden');
            }
        };

        // 5. Build Carousel & Attach Load Listeners
        post.content.forEach((item) => {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'carousel-item';
            
            const img = document.createElement('img');
            img.src = PHOTO_IMG_BASE + item.filename;
            img.alt = item.caption;
            img.dataset.location = item.location;
            img.dataset.caption = item.caption;
            img.classList.add('image_overlay'); 
            
            // CRITICAL FIX: Re-check buttons when this image finishes loading
            img.onload = () => {
                updateZones();
            };

            imgDiv.appendChild(img);
            carousel.appendChild(imgDiv);
        });

        // 6. Scroll Listeners
        if (prevZone) {
            prevZone.addEventListener('click', (e) => {
                e.stopPropagation(); 
                carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
            });
        }

        if (nextZone) {
            nextZone.addEventListener('click', (e) => {
                e.stopPropagation(); 
                carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
            });
        }

        carousel.addEventListener('scroll', updateZones);
        
        // Initial check (in case cached)
        setTimeout(updateZones, 100);

        // 7. Download Button Logic
        const dotsBtn = clone.querySelector('.options-btn');
        if(dotsBtn) {
            dotsBtn.addEventListener('click', () => {
                const visibleImg = getVisibleImage(carousel);
                if (visibleImg) {
                    const link = document.createElement('a');
                    link.href = visibleImg.src;
                    link.download = visibleImg.src.split('/').pop();
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        }

        // 8. Append to DOM
        container.appendChild(clone);

        // 9. Setup IntersectionObserver
        setupObserver(carousel, locationEl, captionEl);
    });
});

/**
 * Observer for updating Location/Caption
 */
function setupObserver(carousel, locationEl, captionEl) {
    const options = {
        root: carousel,
        threshold: 0.6 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img) {
                    locationEl.textContent = img.dataset.location;
                    captionEl.textContent = img.dataset.caption;
                }
            }
        });
    }, options);

    carousel.querySelectorAll('.carousel-item').forEach(item => observer.observe(item));
}

function getVisibleImage(carousel) {
    const scrollLeft = carousel.scrollLeft;
    const width = carousel.offsetWidth;
    const index = Math.round(scrollLeft / width);
    const items = carousel.querySelectorAll('img');
    return items[index] || items[0];
}