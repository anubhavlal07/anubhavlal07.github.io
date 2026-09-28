(() => {
  const statusEl = document.getElementById("hero-status");
  const titleEl = document.getElementById("hero-title");
  const ledeEl = document.getElementById("hero-lede");
  const stackEl = document.getElementById("hero-stack");
  const emailEl = document.getElementById("hero-email");
  const socialEl = document.getElementById("hero-social");
  const visualEl = document.getElementById("hero-visual");
  if (!window.Site || typeof Site.onContent !== "function" || !titleEl) return;

  const esc = Site.esc;
  const icon = (name) => (typeof Site.icon === "function" ? Site.icon(name) : "");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visualKey = null;
  let played = false;

  function safeUrl(value) {
    const url = String(value ?? "").trim();
    if (!url) return "";
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme && !/^(https?|mailto)$/i.test(scheme[1])) return "";
    return url;
  }

  function currentRole(experience) {
    const list = Array.isArray(experience) ? experience : [];
    return list.find((item) => item.current) || list[list.length - 1] || null;
  }

  function renderStatus(profile, experience, contact) {
    if (!statusEl) return;
    const role = currentRole(experience);
    const title = profile.title || (role && role.role) || "";
    const company = role && role.current ? role.company : "";
    const parts = [];
    if (title) parts.push(`<span class="hero-status-role">${esc(title)}${company ? ` at ${esc(company)}` : ""}</span>`);
    if (contact.location) parts.push(`<span class="hero-status-place">${icon("pin")}${esc(contact.location)}</span>`);
    statusEl.innerHTML = parts.length ? `<span class="hero-status-dot" aria-hidden="true"></span>${parts.join("")}` : "";
    statusEl.hidden = !parts.length;
  }

  function renderIntro(profile) {
    const hasTagline = profile.tagline && profile.tagline !== profile.title;
    titleEl.textContent = hasTagline ? profile.tagline : profile.name || profile.title || "";
    if (ledeEl) {
      ledeEl.textContent = profile.lede || "";
      ledeEl.hidden = !profile.lede;
    }
    if (stackEl) {
      stackEl.innerHTML = (profile.worksOn || []).map((item) => `<li class="chip">${esc(item)}</li>`).join("");
      stackEl.hidden = !stackEl.children.length;
    }
  }

  function renderActions(contact, socials) {
    document.querySelectorAll("a.resumeButton").forEach((link) => {
      if (contact.resumeLink) link.setAttribute("href", contact.resumeLink);
    });
    if (emailEl) {
      if (contact.email) {
        emailEl.setAttribute("href", `mailto:${contact.email}`);
        emailEl.innerHTML = `${icon("mail")}<span>Email me</span>`;
      } else {
        emailEl.setAttribute("href", "#contact");
        emailEl.innerHTML = `<span>Get in touch</span>`;
      }
    }
    if (socialEl) {
      socialEl.innerHTML = (socials || [])
        .map((social) => {
          const href = safeUrl(social.url);
          if (!href) return "";
          return `<li><a class="icon-button" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(social.name)}">${icon(social.icon)}</a></li>`;
        })
        .join("");
      socialEl.hidden = !socialEl.children.length;
    }
  }

  function runSteps(project) {
    if (project.flow && project.flow.length) {
      return { label: "Pipeline", steps: project.flow.map((step) => step.join(" / ")) };
    }
    return { label: "Built with", steps: (project.tech || []).slice(0, 5) };
  }

  function renderVisual(projects) {
    if (!visualEl) return;
    const list = Array.isArray(projects) ? projects : [];
    const project = list.find((item) => item.featured) || list[0];
    const key = JSON.stringify(project || null);
    if (key === visualKey) return;
    visualKey = key;
    if (!project) {
      visualEl.hidden = true;
      return;
    }
    visualEl.hidden = false;
    const image = safeUrl(project.image);
    const link = safeUrl(project.link);
    const run = runSteps(project);
    const animate = !played && !reducedMotion.matches;
    played = true;
    const steps = run.steps
      .map(
        (step, index) =>
          `<li class="run-step" style="--i:${index}"><span class="run-check" aria-hidden="true"></span><span class="run-label">${esc(step)}</span></li>`
      )
      .join("");
    visualEl.setAttribute("aria-label", `Featured project: ${project.title}`);
    visualEl.innerHTML = `
      <div class="window">
        <div class="window-bar">
          <span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="window-title">${esc(project.title)}</span>
          ${link ? `<a class="window-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(project.title)} (${esc(project.linkText || "View")})">${icon("external")}</a>` : `<span class="window-link-spacer"></span>`}
        </div>
        <div class="window-body">
          ${image ? `<img src="${esc(image)}" alt="" width="1264" height="848" decoding="async" fetchpriority="high" />` : ""}
        </div>
      </div>
      ${
        run.steps.length
          ? `<div class="run-card" data-state="${animate ? "pending" : "done"}">
          <p class="run-head"><span class="run-pulse" aria-hidden="true"></span>${esc(run.label)}</p>
          <ol class="run-steps" role="list">${steps}</ol>
        </div>`
          : ""
      }
      <figcaption class="visually-hidden">${esc(project.title)}${project.description ? `: ${esc(project.description)}` : ""}</figcaption>`;
    if (animate) {
      const card = visualEl.querySelector(".run-card");
      if (card) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.dataset.state = "running";
            window.setTimeout(() => {
              if (card.isConnected) card.dataset.state = "done";
            }, 500 + run.steps.length * 260);
          });
        });
      }
    }
  }

  Site.onContent((content) => {
    const profile = (content && content.profile) || {};
    const contact = (content && content.contact) || {};
    renderStatus(profile, content && content.experience, contact);
    renderIntro(profile);
    renderActions(contact, content && content.socials);
    renderVisual(content && content.projects);
  });
})();
