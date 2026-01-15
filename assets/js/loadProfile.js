fetch("assets/json/profile.json")
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        // Update home title with name if needed
        // const homeTitle = document.querySelector('.homeTitle');
        // if (homeTitle) {
        //   homeTitle.innerHTML = `Hello there, I'm ${data.name} <br />`;
        // }

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

        // Load Social Links (optional - if you want to make them dynamic)
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
    })
    .catch(err => {
        console.error("Failed to load profile:", err);
        // Fallback: keep existing hardcoded content if fetch fails
    });
