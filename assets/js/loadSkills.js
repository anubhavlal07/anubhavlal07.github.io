/*
 * Load Skills Data from Supabase
 */

function renderSkillsData(skillsCategories, skillItems, isFromSupabase = false) {
    const skillsContainer = document.querySelector(".skillsContainer");
    if (!skillsContainer) return;

    // Clear existing content
    skillsContainer.innerHTML = "";

    if (isFromSupabase) {
        // Group skill items by category map
        skillsCategories.forEach((category) => {
            const categoryItems = skillItems.filter(
                item => item.skill_category_id === category.id
            );
            buildCategoryDOM(category, categoryItems, true);
        });
    } else {
        // JSON structure has skills inside category
        const skillsData = skillsCategories; // First param holds the JSON structure
        skillsData.forEach((category) => {
            buildCategoryDOM(category, category.skills, false);
        });
    }

    function buildCategoryDOM(category, items, isSupabase) {
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

        items.forEach((skill) => {
            const skillData = document.createElement("div");
            skillData.className = "skillData";

            const skillBlob = document.createElement("div");
            skillBlob.className = "skillBlob";
            const img = document.createElement("img");
            img.src = isSupabase ? skill.image_url : skill.image;
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
    }
}

async function fetchSupabaseSkills() {
    // Fetch skills categories from Supabase
    const { data: skillsCategories, error: categoriesError } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true })
        .execute();

    if (categoriesError) throw new Error(categoriesError);
    if (!skillsCategories || skillsCategories.length === 0) throw new Error("Empty categories");

    // Fetch all skill items
    const { data: skillItems, error: itemsError } = await supabase
        .from('skill_items')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .execute();

    if (itemsError) throw new Error(itemsError);
    if (!skillItems || skillItems.length === 0) throw new Error("Empty skills");

    return { skillsCategories, skillItems };
}

// Placeholder cards shown while skills are loading.
function renderSkillsSkeleton() {
    const container = document.querySelector(".skillsContainer");
    if (!container) return;
    const group = `
      <div class="skillContent">
        <div class="skillTitle"><span class="skeleton" style="width:11rem;height:0.9rem;border-radius:0.4rem;display:block"></span></div>
        <div class="skillInfo">${'<div class="skeleton skillSkeleton"></div>'.repeat(4)}</div>
      </div>`;
    container.innerHTML = group + group;
}

async function loadSkills() {
    let supabaseLoaded = false;
    let jsonFallbackLoaded = false;

    // Show placeholders immediately so the section is never empty while loading.
    renderSkillsSkeleton();

    // 1. Start Supabase fetch
    fetchSupabaseSkills().then(({ skillsCategories, skillItems }) => {
        renderSkillsData(skillsCategories, skillItems, true);
        supabaseLoaded = true;

        if (jsonFallbackLoaded) {
            console.log('Skills data updated with live Supabase data');
        } else {
            console.log('Skills data loaded successfully from Supabase');
        }
    }).catch(error => {
        console.error('Failed to load skills from Supabase:', error);
        if (!jsonFallbackLoaded) {
            loadJsonSkills();
        }
    });

    // 2. Fallback timer (1 second)
    setTimeout(() => {
        if (!supabaseLoaded && !jsonFallbackLoaded) {
            console.log('Supabase taking too long, loading JSON fallback...');
            loadJsonSkills();
        }
    }, 1000);

    async function loadJsonSkills() {
        if (jsonFallbackLoaded) return;
        jsonFallbackLoaded = true;

        try {
            const response = await fetch("assets/json/skills.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const skillsData = await response.json();
            
            if (!supabaseLoaded) {
                renderSkillsData(skillsData, null, false);
                console.log('Skills data loaded from fallback JSON');
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            jsonFallbackLoaded = false;
        }
    }
}

document.addEventListener("DOMContentLoaded", loadSkills);
