/**
 * Load Profile Data from Supabase
 */

async function loadProfile() {
    try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('*')
            .limit(1)
            .execute();

        if (profileError) throw new Error(profileError);

        const profile = profileData && profileData.length > 0 ? profileData[0] : null;

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

        // Fetch social links
        const { data: socialLinks, error: socialError } = await supabase
            .from('social_links')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .execute();

        if (socialError) throw new Error(socialError);

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

        console.log('Profile data loaded successfully from Supabase');
    } catch (error) {
        console.error('Failed to load profile from Supabase:', error);

        // Fallback to JSON file if Supabase fails
        console.log('Attempting fallback to JSON file...');
        try {
            const response = await fetch('assets/json/profile.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            // Load Summary
            const summaryContainer = document.getElementById('summary-content');
            if (summaryContainer && data.summary) {
                summaryContainer.innerHTML = data.summary
                    .map(paragraph => `${paragraph}<br /><br />`)
                    .join('');
            }

            // Load Works On
            const worksOnContainer = document.getElementById('works-on-content');
            if (worksOnContainer && data.worksOn) {
                worksOnContainer.innerHTML = data.worksOn
                    .map(item => `- ${item} <br />`)
                    .join('');
            }

            // Load Resume Link
            const resumeLink = document.getElementById('resume-link');
            if (resumeLink && data.resumeLink) {
                resumeLink.href = data.resumeLink;
            }

            // Load Social Links
            const socialContainer = document.querySelector('.homeSocial');
            if (socialContainer && data.socialLinks) {
                socialContainer.innerHTML = data.socialLinks
                    .map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="homeSocialLink">
              <i class="${link.icon}"></i>
            </a>
          `)
                    .join('');
            }

            console.log('Profile data loaded from fallback JSON');
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            // Keep existing hardcoded content
        }
    }
}

// Load profile when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
} else {
    loadProfile();
}
