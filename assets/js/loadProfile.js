/**
 * Load Profile Data from Supabase
 */

function renderProfileData(profile, socialLinks) {
    if (profile) {
        // Load Summary
        const summaryContainer = document.getElementById('summary-content');
        if (summaryContainer && profile.summary) {
            summaryContainer.innerHTML = profile.summary
                .map(paragraph => `${paragraph}<br /><br />`)
                .join('');
        }

        // Load Works On
        const worksOnContainer = document.getElementById('works-on-content');
        if (worksOnContainer && profile.works_on) {
            worksOnContainer.innerHTML = profile.works_on
                .map(item => `- ${item} <br />`)
                .join('');
        }

        // Load Resume Link
        const resumeLink = document.getElementById('resume-link');
        if (resumeLink && profile.resume_link) {
            resumeLink.href = profile.resume_link;
        }
    }

    // Load Social Links
    const socialContainer = document.querySelector('.homeSocial');
    if (socialContainer && socialLinks && socialLinks.length > 0) {
        socialContainer.innerHTML = socialLinks
            .map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="homeSocialLink">
            <i class="${link.icon}"></i>
          </a>
        `)
            .join('');
    }
}

async function fetchSupabaseProfile() {
    // Fetch profile data
    const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .execute();

    if (profileError) throw new Error(profileError);
    if (!profileData || profileData.length === 0) throw new Error('No profile data found');

    const profile = profileData[0];

    // Fetch social links
    const { data: socialLinks, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .execute();

    if (socialError) throw new Error(socialError);

    return { profile, socialLinks };
}

async function loadProfile() {
    let supabaseLoaded = false;
    let jsonFallbackLoaded = false;

    // 1. Start Supabase fetch
    fetchSupabaseProfile().then(({ profile, socialLinks }) => {
        renderProfileData(profile, socialLinks);
        supabaseLoaded = true;
        
        if (jsonFallbackLoaded) {
            console.log('Profile data updated with live Supabase data');
        } else {
            console.log('Profile data loaded successfully from Supabase');
        }
    }).catch(error => {
        console.error('Failed to load profile from Supabase:', error);
        if (!jsonFallbackLoaded) {
            loadJsonProfile();
        }
    });

    // 2. Fallback timer (1 second)
    setTimeout(() => {
        if (!supabaseLoaded && !jsonFallbackLoaded) {
            console.log('Supabase taking too long, loading JSON fallback...');
            loadJsonProfile();
        }
    }, 1000);

    async function loadJsonProfile() {
        if (jsonFallbackLoaded) return; // Prevent double firing
        jsonFallbackLoaded = true;

        try {
            const response = await fetch('assets/json/profile.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            // Map JSON format to Supabase format for renderProfileData
            const mappedProfile = {
                summary: data.summary,
                works_on: data.worksOn,
                resume_link: data.resumeLink
            };

            // Only render if Supabase hasn't loaded in the meantime
            if (!supabaseLoaded) {
                renderProfileData(mappedProfile, data.socialLinks);
                console.log('Profile data loaded from fallback JSON');
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            jsonFallbackLoaded = false; // Reset if failed so catch block can attempt again if needed
        }
    }
}

// Load profile when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
} else {
    loadProfile();
}
