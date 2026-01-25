/**
 * Load Experience Data from Supabase
 */

async function loadExperience() {
    try {
        // Fetch experience data from Supabase
        const { data, error } = await supabase
            .from('experience')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: false })
            .execute();

        if (error) throw new Error(error);

        if (!data || data.length === 0) {
            throw new Error('No experience data found');
        }

        // Set dynamic end date for entries with "Present"
        const date = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = months[date.getMonth()];
        const currentYear = date.getFullYear();

        data.forEach(exp => {
            if (exp.end_date === "Present") {
                exp.end_date = `${currentMonth} ${currentYear}`;
            }
        });

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
            // Create wrapper for each experience entry
            const entryDiv = document.createElement("div");

            // Create role name
            const roleHeading = document.createElement("h3");
            roleHeading.className = "qualificationName";
            roleHeading.textContent = exp.role;
            entryDiv.appendChild(roleHeading);

            // Create company name
            const companySpan = document.createElement("span");
            companySpan.className = "qualificationCity";
            companySpan.textContent = exp.company;
            entryDiv.appendChild(companySpan);

            // Create date
            const dateSpan = document.createElement("span");
            dateSpan.className = "qualificationYear";
            dateSpan.textContent = `${exp.start_date} - ${exp.end_date}`;
            entryDiv.appendChild(dateSpan);

            // Create description bullets from highlights
            if (exp.highlights && exp.highlights.length > 0) {
                const descList = document.createElement("ul");
                descList.style.marginTop = "0.5rem";
                descList.style.marginLeft = "1rem";
                descList.style.fontSize = "var(--small-font-size)";
                descList.style.color = "var(--text-color-light)";
                descList.style.listStyleType = "disc";

                exp.highlights.forEach(bullet => {
                    const listItem = document.createElement("li");
                    listItem.textContent = bullet;
                    listItem.style.marginBottom = "0.25rem";
                    descList.appendChild(listItem);
                });

                entryDiv.appendChild(descList);
            }

            infoDiv.appendChild(entryDiv);

            // Add spacing between entries (except for the last one)
            if (index < data.length - 1) {
                const spacer = document.createElement("br");
                infoDiv.appendChild(spacer);
            }
        });

        contentDiv.appendChild(infoDiv);
        container.appendChild(contentDiv);

        // Apply ScrollReveal animation after content is loaded
        if (typeof ScrollReveal !== 'undefined') {
            const scrollReveal = ScrollReveal({
                origin: "top",
                distance: "60px",
                duration: 2500,
                delay: 300,
            });

            // Animate the experience container with interval for stagger effect
            scrollReveal.reveal('.experienceContainer', {
                interval: 100,
            });
        }

        console.log('Experience data loaded successfully from Supabase');
    } catch (error) {
        console.error('Failed to load experience from Supabase:', error);

        // Fallback to JSON file
        console.log('Attempting fallback to JSON file...');
        try {
            const response = await fetch("assets/json/experience.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            // Sort data by ID in descending order
            data.sort((a, b) => b.id - a.id);

            // Set dynamic end date for the latest experience
            const date = new Date();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonth = months[date.getMonth()];
            const currentYear = date.getFullYear();
            data.forEach(exp => {
                if (exp.end_date === "Present") {
                    exp.end_date = `${currentMonth} ${currentYear}`;
                }
            });

            const container = document.querySelector(".experienceContainer");
            if (!container) return;

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

                if (exp.description && exp.description.length > 0) {
                    const descList = document.createElement("ul");
                    descList.style.marginTop = "0.5rem";
                    descList.style.marginLeft = "1rem";
                    descList.style.fontSize = "var(--small-font-size)";
                    descList.style.color = "var(--text-color-light)";
                    descList.style.listStyleType = "disc";

                    exp.description.forEach(bullet => {
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

            if (typeof ScrollReveal !== 'undefined') {
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

            console.log('Experience data loaded from fallback JSON');
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }
    }
}

// Load experience when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExperience);
} else {
    loadExperience();
}
