fetch("assets/json/experience.json")
    .then(res => res.json())
    .then(data => {
        const container = document.querySelector(".experienceContainer");

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
            dateSpan.textContent = exp.date;
            entryDiv.appendChild(dateSpan);

            // Create description bullets
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
    })
    .catch(err => console.error("Failed to load experience:", err));
