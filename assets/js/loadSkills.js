async function loadSkills() {
    try {
        const response = await fetch("assets/json/skills.json");
        const skillsData = await response.json();
        const skillsContainer = document.querySelector(".skillsContainer");

        // Clear existing content just in case, though usually empty
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
    } catch (error) {
        console.error("Error loading skills:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadSkills);
