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

// Load and render resume data
function loadResumeData() {
  fetch('assets/json/resume.json')
    .then(res => res.json())
    .then(data => {
      renderResume(data);
    })
    .catch(err => console.error('Failed to load resume:', err));
}

function renderResume(data) {
  const container = document.getElementById('resumeContent');

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
            <span class="resumeDate">${exp.date}</span>
          </div>
          <ul class="resumeList">
            ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
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
        ${data.skills.languages ? `
        <div class="skillCategory">
          <h4>Programming Languages</h4>
          <p>${data.skills.languages.join(', ')}</p>
        </div>` : ''}
        ${data.skills.backend ? `
        <div class="skillCategory">
          <h4>Backend Frameworks</h4>
          <p>${data.skills.backend.join(', ')}</p>
        </div>` : ''}
        ${data.skills.ai ? `
        <div class="skillCategory">
          <h4>AI & LLM Orchestration</h4>
          <p>${data.skills.ai.join(', ')}</p>
        </div>` : ''}
        ${data.skills.databases ? `
        <div class="skillCategory">
          <h4>Databases</h4>
          <p>${data.skills.databases.join(', ')}</p>
        </div>` : ''}
        ${data.skills.devops ? `
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
        <i class="ri-download-line"></i></a>
    </div>` : ''}
  `;
}
