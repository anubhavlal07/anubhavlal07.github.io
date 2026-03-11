// Resume Modal Functionality
const resumeModal = document.getElementById('resumeModal');
const resumeLink = document.getElementById('resume-link');
const closeModal = document.querySelector('.modalClose');

// Open modal when resume link is clicked
if (resumeLink) {
  resumeLink.addEventListener('click', (e) => {
    e.preventDefault();
    resumeModal.classList.add('showModal');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // Clear previous content to show loading state if desired (optional)
    const container = document.getElementById('resumeContent');
    if (container) container.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading Resume Data...</div>';
    
    loadResumeData();
  });
}

// Close modal when X is clicked
if (closeModal) {
  closeModal.addEventListener('click', () => {
    resumeModal.classList.remove('showModal');
    document.body.style.overflow = 'auto';
  });
}

// Close modal when clicking outside
resumeModal.addEventListener('click', (e) => {
  if (e.target === resumeModal) {
    resumeModal.classList.remove('showModal');
    document.body.style.overflow = 'auto';
  }
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && resumeModal.classList.contains('showModal')) {
    resumeModal.classList.remove('showModal');
    document.body.style.overflow = 'auto';
  }
});

async function fetchSupabaseResume() {
  // Fetch resume content
  const { data: resumeRows, error: resumeError } = await supabase
    .from('resume')
    .select('*')
    .execute();

  if (resumeError) throw new Error(resumeError.message);
  if (!resumeRows || resumeRows.length === 0) throw new Error('No resume data found');
  const resume = resumeRows[0];

  // Fetch social links
  const { data: socialRows, error: socialError } = await supabase
    .from('social_links')
    .select('*')
    .execute();

  if (socialError) console.error('Error fetching social links:', socialError);

  // Extract social links
  const linkedinUrl = socialRows?.find(link => link.name.toLowerCase().includes('linkedin'))?.url || '';
  const githubUrl = socialRows?.find(link => link.name.toLowerCase().includes('github'))?.url || '';

  // Format data for renderResume (remove protocol for display/href construction in template)
  const formatLink = (url) => url.replace(/^https?:\/\//, '');

  return {
    personalInfo: {
      name: resume.name,
      title: resume.title,
      email: resume.email,
      phone: resume.phone,
      location: resume.location,
      linkedin: formatLink(linkedinUrl),
      github: formatLink(githubUrl),
      resumeDownloadLink: resume.resume_download_link
    },
    summary: resume.summary,
    education: (resume.education || []).map(edu => ({
      ...edu,
      date: `${edu.startDate} — ${edu.endDate}`,
      location: edu.location || '',
      coursework: edu.score
    })),
    experience: (resume.experience || []).map(exp => ({
      ...exp,
      start_date: exp.startDate,
      end_date: exp.endDate,
      achievements: exp.achievements || (exp.description ? exp.description.split('\n').filter(line => line.includes('•')).map(line => line.replace(/[•-]\s*/, '').trim()) : [])
    })),
    skills: (() => {
      const skillsArray = resume.skills || [];
      if (!Array.isArray(skillsArray) && typeof skillsArray === 'object') return skillsArray;

      return {
        languages: skillsArray.filter(s => s.category === 'languages').map(s => s.name),
        backend: skillsArray.filter(s => s.category === 'backend').map(s => s.name),
        ai: skillsArray.filter(s => s.category === 'ai').map(s => s.name),
        databases: skillsArray.filter(s => s.category === 'databases').map(s => s.name),
        devops: skillsArray.filter(s => s.category === 'devops' || s.category === 'tools').map(s => s.name)
      };
    })(),
    projects: (resume.projects || []).map(proj => ({
      ...proj,
      name: proj.title
    }))
  };
}

// Load and render resume data using optimistic UI pattern
async function loadResumeData() {
  let supabaseLoaded = false;
  let jsonFallbackLoaded = false;

  // 1. Start Supabase fetch
  fetchSupabaseResume()
    .then(data => {
      processAndRender(data);
      supabaseLoaded = true;
      if (jsonFallbackLoaded) {
        console.log("Resume data updated with live Supabase data");
      } else {
        console.log("Resume data loaded successfully from Supabase");
      }
    })
    .catch(err => {
      console.warn('Supabase fetch failed:', err);
      if (!jsonFallbackLoaded) {
        loadFromLocalJSON();
      }
    });

  // 2. Fallback timer (1 second)
  setTimeout(() => {
    if (!supabaseLoaded && !jsonFallbackLoaded) {
      console.log('Supabase taking too long, loading JSON fallback...');
      loadFromLocalJSON();
    }
  }, 1000);

  function loadFromLocalJSON() {
    if (jsonFallbackLoaded) return;
    jsonFallbackLoaded = true;

    fetch('assets/json/resume.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!supabaseLoaded) {
          processAndRender(data);
          console.log('Resume data loaded from fallback JSON');
        }
      })
      .catch(err => {
        console.error('Failed to load local resume:', err);
        jsonFallbackLoaded = false;
      });
  }
}

function processAndRender(data) {
  // Sort experience by ID descending
  if (data.experience) {
    data.experience.sort((a, b) => b.id - a.id);

    // Dynamic end date for "Present"
    const date = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = months[date.getMonth()];
    const currentYear = date.getFullYear();

    data.experience.forEach(exp => {
      if (exp.end_date === "Present") {
        exp.end_date = `${currentMonth} ${currentYear}`;
      }
    });
  }
  renderResume(data);
}

function renderResume(data) {
  const container = document.getElementById('resumeContent');
  if (!container) return;

  container.innerHTML = `
    <!-- Header -->
    <div class="resumeHeader">
      <h1 class="resumeName">${data.personalInfo.name}</h1>
      <p class="resumeTitle">${data.personalInfo.title}</p>
      <div class="resumeContact">
        <a href="mailto:${data.personalInfo.email}" class="resumeSocialLink">
          ${data.personalInfo.email}
        </a>
        <span class="linkSeparator">|</span>
        <a href="tel:${data.personalInfo.phone}" class="resumeSocialLink">
          ${data.personalInfo.phone}
        </a>
        <span class="linkSeparator">|</span>
        <span class="resumeSocialLink">${data.personalInfo.location}</span>
        <span class="linkSeparator">|</span>
        <a href="https://${data.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" class="resumeSocialLink">
          LinkedIn
        </a>
        <span class="linkSeparator">|</span>
        <a href="https://${data.personalInfo.github}" target="_blank" rel="noopener noreferrer" class="resumeSocialLink">
          GitHub
        </a>
      </div>
    </div>

    <!-- Summary -->
    <div class="resumeSection">
      <h2 class="resumeSectionTitle"><i class="ri-user-line"></i> Professional Summary</h2>
      <p class="resumeSummary">${data.summary}</p>
    </div>

    <!-- Experience -->
    <div class="resumeSection">
      <h2 class="resumeSectionTitle"><i class="ri-briefcase-line"></i> Work Experience</h2>
      ${data.experience.map(exp => `
        <div class="resumeItem">
          <div class="resumeItemHeader">
            <div>
              <h3 class="resumeItemTitle">${exp.role}</h3>
              <p class="resumeCompany">${exp.company}</p>
            </div>
            <span class="resumeDate">${exp.start_date} — ${exp.end_date}</span>
          </div>
          <ul class="resumeList">
            ${(exp.achievements || []).map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- Education -->
    <div class="resumeSection">
      <h2 class="resumeSectionTitle"><i class="ri-book-line"></i> Education</h2>
      ${data.education.map(edu => `
        <div class="resumeItem">
          <div class="resumeItemHeader">
            <div>
              <h3 class="resumeItemTitle">${edu.degree}</h3>
              <p class="resumeCompany">${edu.institution}, ${edu.location}</p>
            </div>
            <span class="resumeDate">${edu.date}</span>
          </div>
          ${edu.gpa ? `<p class="resumeGpa">${edu.gpa}</p>` : ''}
          ${edu.coursework ? `<p class="resumeCoursework"><strong>Coursework:</strong> ${edu.coursework}</p>` : ''}
        </div>
      `).join('')}
    </div>

    <!-- Skills -->
    <div class="resumeSection">
      <h2 class="resumeSectionTitle"><i class="ri-code-line"></i> Skills</h2>
      <div class="resumeSkills">
        ${data.skills.languages && data.skills.languages.length > 0 ? `
        <div class="skillCategory">
          <h4>Programming Languages</h4>
          <p>${data.skills.languages.join(', ')}</p>
        </div>` : ''}
        ${data.skills.backend && data.skills.backend.length > 0 ? `
        <div class="skillCategory">
          <h4>Backend Frameworks</h4>
          <p>${data.skills.backend.join(', ')}</p>
        </div>` : ''}
        ${data.skills.ai && data.skills.ai.length > 0 ? `
        <div class="skillCategory">
          <h4>AI & LLM Orchestration</h4>
          <p>${data.skills.ai.join(', ')}</p>
        </div>` : ''}
        ${data.skills.databases && data.skills.databases.length > 0 ? `
        <div class="skillCategory">
          <h4>Databases</h4>
          <p>${data.skills.databases.join(', ')}</p>
        </div>` : ''}
        ${data.skills.devops && data.skills.devops.length > 0 ? `
        <div class="skillCategory">
          <h4>DevOps & Tools</h4>
          <p>${data.skills.devops.join(', ')}</p>
        </div>` : ''}
      </div>
    </div>

    <!-- Projects -->
    <div class="resumeSection">
      <h2 class="resumeSectionTitle"><i class="ri-stack-line"></i> Projects & Publications</h2>
      ${data.projects.map(project => `
        <div class="resumeItem">
          <h3 class="resumeItemTitle">${project.name}${project.role ? ` | ${project.role}` : ''}</h3>
          <p>${project.description}</p>
        </div>
      `).join('')}
    </div>

    <!-- Download Button -->
    ${data.personalInfo.resumeDownloadLink ? `
    <div class="resumeDownload">
      <a href="${data.personalInfo.resumeDownloadLink}" target="_blank" rel="noopener noreferrer" class="downloadButton">
        <i class="ri-download-line"></i> Download Resume</a>
    </div>` : ''}
  `;
}
