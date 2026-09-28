(() => {
  const dialog = document.getElementById("resume-dialog");
  const body = document.getElementById("resume-dialog-body");
  if (!dialog || !body) return;

  const esc = (value) => (window.Site && Site.esc ? Site.esc(value) : String(value ?? ""));
  const PHONE =
    '<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const icon = (name) => (name === "phone" ? PHONE : window.Site && Site.icon ? Site.icon(name) : "");

  const MOJIBAKE = [
    ["â€¢", "•"],
    ["â€”", "—"],
    ["â€“", "–"],
    ["â€™", "’"],
    ["â€˜", "‘"],
    ["â€œ", "“"],
    ["â€\u009d", "”"],
    ["â€¦", "…"],
    ["â‚¹", "₹"],
    ["Ã©", "é"],
    ["Â ", " "],
    ["Â·", "·"],
    [" ", " "],
  ];

  const CATEGORY_ORDER = ["languages", "backend", "frontend", "ai", "databases", "cloud", "tools"];
  const CATEGORY_LABELS = {
    languages: "Languages",
    language: "Languages",
    backend: "Backend",
    frontend: "Frontend",
    ai: "AI & LLM",
    llm: "AI & LLM",
    ml: "Machine learning",
    databases: "Databases",
    database: "Databases",
    db: "Databases",
    cloud: "Cloud",
    devops: "Tools",
    tools: "Tools",
  };
  const CATEGORY_MERGE = { devops: "tools", language: "languages", database: "databases", db: "databases", llm: "ai" };
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  let content = null;
  let painted = "";
  let opener = null;
  let pressedOutside = false;

  function clean(value) {
    if (value === null || value === undefined) return "";
    let out = String(value);
    for (const [bad, good] of MOJIBAKE) out = out.split(bad).join(good);
    return out.trim();
  }

  function safeUrl(value) {
    const url = clean(value);
    if (!url) return "";
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return `https://${url}`;
    return "";
  }

  function displayUrl(url) {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
  }

  function dateValue(value) {
    const text = clean(value).toLowerCase();
    if (!text) return -Infinity;
    if (/present|current|now/.test(text)) return Infinity;
    const match = text.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/);
    if (match && match[1] in MONTHS) return Number(match[2]) * 12 + MONTHS[match[1]];
    const year = text.match(/\d{4}/);
    return year ? Number(year[0]) * 12 : -Infinity;
  }

  function newestFirst(rows) {
    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const byEnd = dateValue(b.row.endDate ?? b.row.end_date) - dateValue(a.row.endDate ?? a.row.end_date);
        if (byEnd) return byEnd;
        const byStart = dateValue(b.row.startDate ?? b.row.start_date) - dateValue(a.row.startDate ?? a.row.start_date);
        if (byStart) return byStart;
        const idA = Number(a.row.id);
        const idB = Number(b.row.id);
        if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;
        return a.index - b.index;
      })
      .map((entry) => entry.row);
  }

  function bullets(entry) {
    if (Array.isArray(entry.achievements) && entry.achievements.length) {
      return entry.achievements.map((line) => clean(line).replace(/^[•\-–]\s*/, "")).filter(Boolean);
    }
    if (Array.isArray(entry.highlights) && entry.highlights.length) {
      return entry.highlights.map(clean).filter(Boolean);
    }
    const text = clean(entry.description);
    if (!text) return [];
    const lines = text.split(/\r?\n|\s(?=•\s*\S)/).map((line) => line.trim()).filter(Boolean);
    const marked = lines.filter((line) => /^[•\-–]\s*/.test(line)).map((line) => line.replace(/^[•\-–]\s*/, "").trim());
    if (marked.length) return marked.filter(Boolean);
    return lines.filter((line) => !/:$/.test(line));
  }

  function categoryKey(value) {
    const key = clean(value).toLowerCase().replace(/[\s_-]+/g, " ").trim();
    return CATEGORY_MERGE[key] || key || "other";
  }

  function categoryLabel(key) {
    if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
    return key
      .split(" ")
      .map((word, i) => (word.length <= 2 ? word.toUpperCase() : i === 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(" ");
  }

  function skillGroups(skills) {
    const groups = new Map();
    const add = (category, name) => {
      const label = clean(typeof name === "object" && name ? name.name : name);
      if (!label) return;
      const key = categoryKey(category);
      if (!groups.has(key)) groups.set(key, []);
      const items = groups.get(key);
      if (!items.includes(label)) items.push(label);
    };
    if (Array.isArray(skills)) {
      skills.forEach((skill) => {
        if (typeof skill === "string") add("other", skill);
        else if (skill) add(skill.category, skill.name);
      });
    } else if (skills && typeof skills === "object") {
      Object.entries(skills).forEach(([category, items]) => {
        const list = Array.isArray(items) ? items : typeof items === "string" ? items.split(",") : [];
        list.forEach((item) => add(category, item));
      });
    }
    const rank = (key) => {
      const i = CATEGORY_ORDER.indexOf(key);
      return i === -1 ? CATEGORY_ORDER.length : i;
    };
    return [...groups.entries()]
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([key, items]) => ({ label: categoryLabel(key), items }));
  }

  function social(socials, pattern) {
    const match = (socials || []).find((row) => pattern.test(`${row.name || ""} ${row.icon || ""} ${row.url || ""}`));
    return match ? safeUrl(match.url) : "";
  }

  function shape(data) {
    const row = (data && data.resume) || {};
    const socials = (data && data.socials) || [];
    const summary = Array.isArray(row.summary) ? row.summary.map(clean).filter(Boolean) : [clean(row.summary)].filter(Boolean);
    return {
      name: clean(row.name) || clean(data && data.profile && data.profile.name),
      title: clean(row.title) || clean(data && data.profile && data.profile.title),
      email: clean(row.email) || clean(data && data.contact && data.contact.email),
      phone: clean(row.phone),
      location: clean(row.location) || clean(data && data.contact && data.contact.location),
      linkedin: social(socials, /linkedin/i),
      github: social(socials, /github/i),
      download: safeUrl(row.resume_download_link) || safeUrl(data && data.contact && data.contact.resumeLink),
      summary,
      experience: newestFirst(Array.isArray(row.experience) ? row.experience : []).map((entry) => ({
        role: clean(entry.role || entry.title),
        company: clean(entry.company),
        location: clean(entry.location),
        start: clean(entry.startDate ?? entry.start_date),
        end: clean(entry.endDate ?? entry.end_date),
        bullets: bullets(entry),
      })),
      projects: (Array.isArray(row.projects) ? row.projects : []).map((entry) => ({
        title: clean(entry.title || entry.name),
        role: clean(entry.role),
        tech: Array.isArray(entry.technologies) ? entry.technologies.map(clean).filter(Boolean).join(", ") : clean(entry.technologies),
        description: clean(entry.description),
        link: safeUrl(entry.link || entry.url),
      })).filter((entry) => entry.title || entry.description),
      skills: skillGroups(row.skills),
      education: newestFirst(Array.isArray(row.education) ? row.education : []).map((entry) => ({
        degree: clean(entry.degree),
        institution: clean(entry.institution),
        start: clean(entry.startDate ?? entry.start_date),
        end: clean(entry.endDate ?? entry.end_date),
        coursework: clean(entry.score ?? entry.coursework),
      })),
    };
  }

  function dates(start, end) {
    if (start && end) return `${esc(start)} – ${esc(end)}`;
    return esc(start || end);
  }

  function contactItem(href, iconName, label, external) {
    const attrs = external ? ' target="_blank" rel="noopener"' : "";
    const inner = `${icon(iconName)}<span>${esc(label)}</span>`;
    if (!href) return `<li class="resume-contact-item">${inner}</li>`;
    return `<li><a class="resume-contact-item" href="${esc(href)}"${attrs}>${inner}</a></li>`;
  }

  function section(id, title, inner) {
    if (!inner) return "";
    return `<section class="resume-section" aria-labelledby="resume-${id}"><h3 class="resume-section-title" id="resume-${id}">${esc(title)}</h3>${inner}</section>`;
  }

  function render(data) {
    const r = shape(data);
    const contacts = [
      r.email && contactItem(`mailto:${r.email}`, "mail", r.email),
      r.phone && contactItem(`tel:${r.phone.replace(/[^\d+]/g, "")}`, "phone", r.phone),
      r.location && contactItem("", "pin", r.location),
      r.linkedin && contactItem(r.linkedin, "linkedin", "LinkedIn", true),
      r.github && contactItem(r.github, "github", "GitHub", true),
    ].filter(Boolean).join("");

    const actions = `<div class="resume-actions">${
      r.download
        ? `<a class="button button-primary" href="${esc(r.download)}" target="_blank" rel="noopener">${icon("download")}<span>Download PDF</span></a>`
        : ""
    }<button type="button" class="button" data-resume-print>${icon("printer")}<span>Print</span></button></div>`;

    const summary = r.summary.map((p) => `<p>${esc(p)}</p>`).join("");

    const experience = r.experience.length
      ? `<ol class="resume-entries" role="list">${r.experience
          .map(
            (e) => `<li class="resume-entry">
              <div class="resume-entry-head">
                <h4 class="resume-entry-title">${esc(e.role)}</h4>
                ${e.company ? `<p class="resume-entry-org">${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ""}</p>` : ""}
                <p class="resume-entry-date">${dates(e.start, e.end)}</p>
              </div>
              ${e.bullets.length ? `<ul class="resume-bullets">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
            </li>`
          )
          .join("")}</ol>`
      : "";

    const projects = r.projects.length
      ? `<ul class="resume-entries" role="list">${r.projects
          .map(
            (p) => `<li class="resume-entry">
              <div class="resume-entry-head">
                <h4 class="resume-entry-title">${esc(p.title)}${p.role ? `, ${esc(p.role)}` : ""}</h4>
                ${p.tech ? `<p class="resume-entry-org">${esc(p.tech)}</p>` : ""}
                ${p.link ? `<p class="resume-entry-link"><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(displayUrl(p.link))}</a></p>` : ""}
              </div>
              ${p.description ? `<p class="resume-entry-text">${esc(p.description)}</p>` : ""}
            </li>`
          )
          .join("")}</ul>`
      : "";

    const skills = r.skills.length
      ? `<dl class="resume-skills">${r.skills
          .map((g) => `<div class="resume-skill-row"><dt>${esc(g.label)}</dt><dd>${g.items.map(esc).join(", ")}</dd></div>`)
          .join("")}</dl>`
      : "";

    const education = r.education.length
      ? `<ul class="resume-entries" role="list">${r.education
          .map(
            (e) => `<li class="resume-entry">
              <div class="resume-entry-head">
                <h4 class="resume-entry-title">${esc(e.degree)}</h4>
                ${e.institution ? `<p class="resume-entry-org">${esc(e.institution)}</p>` : ""}
                <p class="resume-entry-date">${dates(e.start, e.end)}</p>
              </div>
              ${e.coursework ? `<p class="resume-entry-text"><span class="resume-label">Coursework:</span> ${esc(e.coursework)}</p>` : ""}
            </li>`
          )
          .join("")}</ul>`
      : "";

    body.removeAttribute("aria-busy");
    body.innerHTML = `
      <header class="resume-head">
        <h2 class="resume-name" id="resume-dialog-title">${esc(r.name || "Resume")}</h2>
        ${r.title ? `<p class="resume-title">${esc(r.title)}</p>` : ""}
        ${contacts ? `<ul class="resume-contact" role="list">${contacts}</ul>` : ""}
        ${actions}
      </header>
      ${section("summary", "Summary", summary)}
      ${section("experience", "Experience", experience)}
      ${section("projects", "Projects", projects)}
      ${section("skills", "Skills", skills)}
      ${section("education", "Education", education)}`;
  }

  function renderSkeleton() {
    const line = (w, h = "1em") => `<span class="skeleton" style="width:${w};height:${h}"></span>`;
    body.setAttribute("aria-busy", "true");
    body.innerHTML = `
      <header class="resume-head">
        <h2 class="resume-name" id="resume-dialog-title">Resume<span class="visually-hidden">, loading</span></h2>
        <div class="resume-skeleton">${line("60%")}${line("80%")}</div>
      </header>
      <div class="resume-skeleton">${line("30%", "1.25em")}${line("100%")}${line("94%")}${line("70%")}</div>
      <div class="resume-skeleton">${line("30%", "1.25em")}${line("100%")}${line("88%")}${line("96%")}${line("60%")}</div>`;
  }

  function paint() {
    const ready = !!(content && content.resume);
    const key = ready ? JSON.stringify([content.resume, content.socials]) : "skeleton";
    if (key === painted && body.firstElementChild) return;
    const focused = body.contains(document.activeElement);
    if (ready) render(content);
    else renderSkeleton();
    painted = key;
    if (focused) {
      const fallback = dialog.querySelector("[data-resume-close]");
      if (fallback) fallback.focus({ preventScroll: true });
    }
  }

  function lockScroll() {
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    root.classList.add("resume-open");
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  }

  function unlockScroll() {
    document.documentElement.classList.remove("resume-open");
    document.body.style.paddingRight = "";
  }

  function open(trigger) {
    if (dialog.open) return;
    opener = trigger || document.activeElement;
    paint();
    lockScroll();
    dialog.showModal();
    dialog.scrollTop = 0;
    const close = dialog.querySelector("[data-resume-close]");
    if (close) close.focus({ preventScroll: true });
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  const closeButton = dialog.querySelector("[data-resume-close]");
  if (closeButton && !closeButton.firstElementChild) closeButton.innerHTML = icon("close");

  dialog.addEventListener("close", () => {
    unlockScroll();
    const target = opener;
    opener = null;
    if (target && typeof target.focus === "function" && target.isConnected) target.focus({ preventScroll: true });
  });

  const outside = (event) => {
    const rect = dialog.getBoundingClientRect();
    return (
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
    );
  };

  dialog.addEventListener("pointerdown", (event) => {
    pressedOutside = event.target === dialog && outside(event);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-resume-close]")) {
      close();
      return;
    }
    if (event.target.closest("[data-resume-print]")) {
      window.print();
      return;
    }
    if (event.target === dialog && pressedOutside && outside(event)) close();
    pressedOutside = false;
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("a#resume-link, a.resumeButton");
    if (!link) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link);
  });

  function onContent(next) {
    content = next;
    if (dialog.open) paint();
  }

  if (window.Site && typeof Site.onContent === "function") Site.onContent(onContent);
  else document.addEventListener("site:content", (event) => onContent(event.detail));

  window.Site = window.Site || {};
  window.Site.resume = { open, close, shape };
})();
