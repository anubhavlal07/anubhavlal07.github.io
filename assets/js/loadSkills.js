/*
 * Load Skills Data from Supabase
 */

async function loadSkills() {
    try {
        // Fetch skills categories from Supabase
        const { data: skillsCategories, error: categoriesError } = await supabase
            .from('skills')
            .select('*')
            .order('display_order', { ascending: true })
            .execute();

        if (categoriesError) throw new Error(categoriesError);

        // Fetch all skill items
        const { data: skillItems, error: itemsError } = await supabase
            .from('skill_items')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .execute();

        if (itemsError) throw new Error(itemsError);

        const skillsContainer = document.querySelector(".skillsContainer");
        if (!skillsContainer) return;

        // Clear existing content
        skillsContainer.innerHTML = "";

        // Group skill items by category
        skillsCategories.forEach((category) => {
            // Get items for this category
            const categoryItems = skillItems.filter(
                item => item.skill_category_id === category.id
            );

            // Create Category Container
            const skillContent = document.createElement("div");
            skillContent.className = "skillContent";

            // Create Category Title
            const skillTitle = document.createElement("h3");
            skillTitle.className = "skillTitle";
            skillTitle.innerHTML = `<i class="${category.icon}"></i> ${category.title}`;
            skillContent.appendChild(skillTitle);

            // Create Skills Grid
            const skillInfo = document.createElement("div");
            skillInfo.className = "skillInfo";

            categoryItems.forEach((skill) => {
                const skillData = document.createElement("div");
                skillData.className = "skillData";

                const skillBlob = document.createElement("div");
                skillBlob.className = "skillBlob";
                const img = document.createElement("img");
                img.src = skill.image_url;
                img.alt = `${skill.name} icon`;
                skillBlob.appendChild(img);

                const skillName = document.createElement("h3");
                skillName.className = "skillName";
                skillName.textContent = skill.name;

                const skillSubtitle = document.createElement("span");
                skillSubtitle.className = "skillSubtitle";
                skillSubtitle.textContent = skill.level;

                skillData.appendChild(skillBlob);
                skillData.appendChild(skillName);
                skillData.appendChild(skillSubtitle);

                skillInfo.appendChild(skillData);
            });

            skillContent.appendChild(skillInfo);
            skillsContainer.appendChild(skillContent);
        });

        console.log('Skills data loaded successfully from Supabase');
    } catch (error) {
        console.error('Failed to load skills from Supabase:', error);

        // Fallback to JSON file
        console.log('Attempting fallback to JSON file...');
        try {
            const response = await fetch("assets/json/skills.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const skillsData = await response.json();
            const skillsContainer = document.querySelector(".skillsContainer");
            if (!skillsContainer) return;

            // Clear existing content
            skillsContainer.innerHTML = "";

            skillsData.forEach((category) => {
                // Create Category Container
                const skillContent = document.createElement("div");
                skillContent.className = "skillContent";

                // Create Category Title
                const skillTitle = document.createElement("h3");
                skillTitle.className = "skillTitle";
                skillTitle.innerHTML = `<i class="${category.icon}"></i> ${category.title}`;
                skillContent.appendChild(skillTitle);

                // Create Skills Grid
                const skillInfo = document.createElement("div");
                skillInfo.className = "skillInfo";

                category.skills.forEach((skill) => {
                    const skillData = document.createElement("div");
                    skillData.className = "skillData";

                    const skillBlob = document.createElement("div");
                    skillBlob.className = "skillBlob";
                    const img = document.createElement("img");
                    img.src = skill.image;
                    img.alt = "skills image";
                    skillBlob.appendChild(img);

                    const skillName = document.createElement("h3");
                    skillName.className = "skillName";
                    skillName.textContent = skill.name;

                    const skillSubtitle = document.createElement("span");
                    skillSubtitle.className = "skillSubtitle";
                    skillSubtitle.textContent = skill.level;

                    skillData.appendChild(skillBlob);
                    skillData.appendChild(skillName);
                    skillData.appendChild(skillSubtitle);

                    skillInfo.appendChild(skillData);
                });

                skillContent.appendChild(skillInfo);
                skillsContainer.appendChild(skillContent);
            });

            console.log('Skills data loaded from fallback JSON');
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadSkills);
