/**
 * Load Projects Data from Supabase
 */

async function loadProjects() {
    try {
        // Fetch projects from Supabase
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('is_visible', true)
            .order('is_featured', { ascending: false })
            .order('display_order', { ascending: true })
            .execute();

        if (error) throw new Error(error);

        if (!data || data.length === 0) {
            throw new Error('No projects data found');
        }

        const container = document.querySelector(".swiper-wrapper");
        if (!container) return;

        // Clear container
        container.innerHTML = "";

        // Inject projects dynamically
        data.forEach(proj => {
            const div = document.createElement("div");
            div.className = "projectContent swiper-slide";
            div.innerHTML = `
        <img src="${proj.image_url}" alt="${proj.title} project" class="projectImage" loading="lazy"/>
        <div>
          <span class="projectSubtitle">${proj.subtitle}</span>
          <h1 class="projectTitle">${proj.title}</h1>
          <a href="${proj.project_link}" target="_blank" rel="noopener noreferrer" class="projectButton">
            ${proj.link_text} <i class="ri-arrow-right-line"></i>
          </a>
        </div>`;
            container.appendChild(div);
        });

        // Initialize Swiper after content is loaded
        setTimeout(() => {
            const swiper = new Swiper('.swiper', {
                loop: false,
                slidesPerView: 2,
                spaceBetween: 30,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true,
                    dynamicBullets: true,
                },
                preventClicks: false,
                preventClicksPropagation: false,
                breakpoints: {
                    340: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    },
                    576: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    767: {
                        slidesPerView: 1,
                        spaceBetween: 30,
                    },
                    1023: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    1200: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                },
            });

            // Update Swiper
            swiper.update();
        }, 100);

        console.log('Projects data loaded successfully from Supabase');
    } catch (error) {
        console.error('Failed to load projects from Supabase:', error);

        // Fallback to JSON file
        console.log('Attempting fallback to JSON file...');
        try {
            const response = await fetch("assets/json/projects.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (!data || data.length === 0) {
                throw new Error('No projects data found');
            }

            const container = document.querySelector(".swiper-wrapper");
            if (!container) return;

            container.innerHTML = "";

            // Inject projects dynamically
            data.forEach(proj => {
                const div = document.createElement("div");
                div.className = "projectContent swiper-slide";
                div.innerHTML = `
          <img src="${proj.img}" alt="${proj.title} project" class="projectImage" loading="lazy"/>
          <div>
            <span class="projectSubtitle">${proj.subtitle}</span>
            <h1 class="projectTitle">${proj.title}</h1>
            <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="projectButton">
              ${proj.linkText} <i class="ri-arrow-right-line"></i>
            </a>
          </div>`;
                container.appendChild(div);
            });

            // Initialize Swiper
            setTimeout(() => {
                const swiper = new Swiper('.swiper', {
                    loop: false,
                    slidesPerView: 2,
                    spaceBetween: 30,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'bullets',
                        clickable: true,
                        dynamicBullets: true,
                    },
                    preventClicks: false,
                    preventClicksPropagation: false,
                    breakpoints: {
                        340: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                        },
                        576: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        767: {
                            slidesPerView: 1,
                            spaceBetween: 30,
                        },
                        1023: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        1200: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                    },
                });

                swiper.update();
            }, 100);

            console.log('Projects data loaded from fallback JSON');
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }
    }
}

// Load projects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
} else {
    loadProjects();
}
