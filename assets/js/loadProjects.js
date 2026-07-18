/**
 * Load Projects Data from Supabase
 */

function renderProjectsData(data, isFromSupabase = false) {
    const container = document.querySelector(".swiper-wrapper");
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Inject projects dynamically
    data.forEach(proj => {
        const div = document.createElement("div");
        div.className = "swiper-slide";

        // Handle property name differences (Supabase vs JSON)
        const imageUrl = isFromSupabase ? proj.image_url : proj.img;
        const description = (proj.description || "").trim();
        const tech = proj.tech_stack || proj.tech || [];

        // Links: prefer explicit code/demo fields; otherwise fall back to the
        // single legacy link, inferring its kind from its label.
        const legacyLink = isFromSupabase ? proj.project_link : proj.link;
        const legacyText = isFromSupabase ? proj.link_text : proj.linkText;
        const codeLink = proj.code_link || proj.codeLink ||
            (legacyText && /git|code/i.test(legacyText) ? legacyLink : null);
        const demoLink = proj.demo_link || proj.demoLink ||
            (legacyText && /demo|live|app|site/i.test(legacyText) ? legacyLink : null);

        const descHTML = description
            ? `<p class="projectDescription">${description}</p>`
            : "";
        const tagsHTML = Array.isArray(tech) && tech.length
            ? `<ul class="projectTags">${tech.map(t => `<li>${t}</li>`).join("")}</ul>`
            : "";

        let linksHTML = "";
        if (codeLink || demoLink) {
            if (codeLink) linksHTML += `<a href="${codeLink}" target="_blank" rel="noopener noreferrer" class="projectButton"><i class="ri-github-fill"></i> Code</a>`;
            if (demoLink) linksHTML += `<a href="${demoLink}" target="_blank" rel="noopener noreferrer" class="projectButton projectButton--ghost"><i class="ri-external-link-line"></i> Live Demo</a>`;
        } else if (legacyLink) {
            linksHTML = `<a href="${legacyLink}" target="_blank" rel="noopener noreferrer" class="projectButton">${legacyText || "View"} <i class="ri-arrow-right-line"></i></a>`;
        }

        div.innerHTML = `
        <div class="projectContent">
          <img src="${imageUrl}" alt="${proj.title} project" class="projectImage" loading="lazy"/>
          <div class="projectBody">
            <span class="projectSubtitle">${proj.subtitle || ""}</span>
            <h3 class="projectTitle">${proj.title}</h3>
            ${descHTML}
            ${tagsHTML}
            <div class="projectLinks">${linksHTML}</div>
          </div>
        </div>`;
        container.appendChild(div);
    });

    // Destroy existing swiper instance if it exists to prevent duplicates when re-rendering
    const swiperContainer = document.querySelector('.swiper');
    if (swiperContainer && swiperContainer.swiper) {
        swiperContainer.swiper.destroy(true, true);
    }

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
}

// Placeholder cards shown while project data is loading.
function renderProjectsSkeleton(count = 2) {
    const container = document.querySelector(".swiper-wrapper");
    if (!container) return;
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
        <div class="swiper-slide">
          <div class="projectContent projectSkeleton">
            <div class="skeleton skeletonImage"></div>
            <div class="projectBody">
              <div class="skeleton skeletonLine sm"></div>
              <div class="skeleton skeletonLine lg"></div>
              <div class="skeleton skeletonLine"></div>
              <div class="skeleton skeletonLine md"></div>
              <div class="skeletonChips">
                <span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span>
              </div>
            </div>
          </div>
        </div>`;
    }
    container.innerHTML = html;
}

async function fetchSupabaseProjects() {
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

    return data;
}

async function loadProjects() {
    let supabaseLoaded = false;
    let jsonFallbackLoaded = false;

    // Show placeholders immediately so the section is never empty while loading.
    renderProjectsSkeleton();

    // 1. Start Supabase fetch
    fetchSupabaseProjects().then(data => {
        renderProjectsData(data, true);
        supabaseLoaded = true;
        
        if (jsonFallbackLoaded) {
            console.log('Projects data updated with live Supabase data');
        } else {
            console.log('Projects data loaded successfully from Supabase');
        }
    }).catch(error => {
        console.error('Failed to load projects from Supabase:', error);
        if (!jsonFallbackLoaded) {
            loadJsonProjects();
        }
    });

    // 2. Fallback timer (1 second)
    setTimeout(() => {
        if (!supabaseLoaded && !jsonFallbackLoaded) {
            console.log('Supabase taking too long, loading JSON fallback...');
            loadJsonProjects();
        }
    }, 1000);

    async function loadJsonProjects() {
        if (jsonFallbackLoaded) return;
        jsonFallbackLoaded = true;

        try {
            const response = await fetch("assets/json/projects.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data || data.length === 0) {
                throw new Error('No projects data found');
            }

            if (!supabaseLoaded) {
                renderProjectsData(data, false);
                console.log('Projects data loaded from fallback JSON');
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            jsonFallbackLoaded = false;
        }
    }
}

// Load projects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
} else {
    loadProjects();
}
