/**
 * Load Experience Data from Supabase
 */

function renderExperienceData(data) {
    const container = document.querySelector(".experienceContainer");
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Create the experience content wrapper
    const contentDiv = document.createElement("div");
    contentDiv.className = "qualificationContent";

    // Create the title section
    const titleDiv = document.createElement("h3");
    titleDiv.className = "qualificationTitle";
    titleDiv.innerHTML = `<i class="ri-briefcase-line"></i> Work Experience`;
    contentDiv.appendChild(titleDiv);

    // Create the info wrapper
    const infoDiv = document.createElement("div");
    infoDiv.className = "qualificationInfo";

    // Inject experience entries dynamically
    data.forEach((exp, index) => {
        const entryDiv = document.createElement("div");

        const roleHeading = document.createElement("h3");
        roleHeading.className = "qualificationName";
        roleHeading.textContent = exp.role;
        entryDiv.appendChild(roleHeading);

        const companySpan = document.createElement("span");
        companySpan.className = "qualificationCity";
        companySpan.textContent = exp.company;
        entryDiv.appendChild(companySpan);

        const dateSpan = document.createElement("span");
        dateSpan.className = "qualificationYear";
        dateSpan.textContent = `${exp.start_date} - ${exp.end_date}`;
        entryDiv.appendChild(dateSpan);

        // Support both "highlights" and "description" since JSON and Supabase might differ slightly
        const bulletPoints = exp.highlights || exp.description;
        
        if (bulletPoints && bulletPoints.length > 0) {
            const descList = document.createElement("ul");
            descList.style.marginTop = "0.5rem";
            descList.style.marginLeft = "1rem";
            descList.style.fontSize = "var(--small-font-size)";
            descList.style.color = "var(--text-color-light)";
            descList.style.listStyleType = "disc";

            bulletPoints.forEach(bullet => {
                const listItem = document.createElement("li");
                listItem.textContent = bullet;
                listItem.style.marginBottom = "0.25rem";
                descList.appendChild(listItem);
            });

            entryDiv.appendChild(descList);
        }

        infoDiv.appendChild(entryDiv);

        if (index < data.length - 1) {
            const spacer = document.createElement("br");
            infoDiv.appendChild(spacer);
        }
    });

    contentDiv.appendChild(infoDiv);
    container.appendChild(contentDiv);

    // Re-initialize ScrollReveal if available
    if (typeof ScrollReveal !== 'undefined') {
        const srNodes = document.querySelectorAll('.experienceContainer');
        srNodes.forEach(node => {
            node.removeAttribute('data-sr-id');
            node.style.visibility = 'visible';
            node.style.opacity = '1';
            node.style.transform = 'none';
        });

        const scrollReveal = ScrollReveal({
            origin: "top",
            distance: "60px",
            duration: 2500,
            delay: 300,
        });

        scrollReveal.reveal('.experienceContainer', {
            interval: 100,
        });
    }
}

async function fetchSupabaseExperience() {
    const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .execute();

    if (error) throw new Error(error);
    if (!data || data.length === 0) {
        throw new Error('No experience data found');
    }

    // Process dates
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = months[date.getMonth()];
    const currentYear = date.getFullYear();

    data.forEach(exp => {
        if (exp.end_date === "Present") {
            exp.end_date = `${currentMonth} ${currentYear}`;
        }
    });

    return data;
}

async function loadExperience() {
    let supabaseLoaded = false;
    let jsonFallbackLoaded = false;

    // 1. Start Supabase fetch
    fetchSupabaseExperience().then(data => {
        renderExperienceData(data);
        supabaseLoaded = true;
        
        if (jsonFallbackLoaded) {
            console.log('Experience data updated with live Supabase data');
        } else {
            console.log('Experience data loaded successfully from Supabase');
        }
    }).catch(error => {
        console.error('Failed to load experience from Supabase:', error);
        if (!jsonFallbackLoaded) {
            loadJsonExperience();
        }
    });

    // 2. Fallback timer (1 second)
    setTimeout(() => {
        if (!supabaseLoaded && !jsonFallbackLoaded) {
            console.log('Supabase taking too long, loading JSON fallback...');
            loadJsonExperience();
        }
    }, 1000);

    async function loadJsonExperience() {
        if (jsonFallbackLoaded) return;
        jsonFallbackLoaded = true;

        try {
            const response = await fetch("assets/json/experience.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            
            // Replicate JSON processing
            data.sort((a, b) => b.id - a.id);
            const date = new Date();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonth = months[date.getMonth()];
            const currentYear = date.getFullYear();
            data.forEach(exp => {
                if (exp.end_date === "Present") {
                    exp.end_date = `${currentMonth} ${currentYear}`;
                }
            });

            if (!supabaseLoaded) {
                renderExperienceData(data);
                console.log('Experience data loaded from fallback JSON');
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            jsonFallbackLoaded = false;
        }
    }
}

// Load experience when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExperience);
} else {
    loadExperience();
}
