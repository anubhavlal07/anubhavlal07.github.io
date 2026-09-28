(() => {
  if (!window.Site) return;

  const { esc } = Site;
  const body = document.getElementById("about-body");
  const education = document.getElementById("about-education");
  const footer = document.getElementById("footer-body");
  let bioOpen = false;

  const line = (width, height = "1em") => `<span class="skeleton" style="width:${width};height:${height}"></span>`;

  if (body) {
    body.setAttribute("aria-busy", "true");
    body.innerHTML = `<div class="about-skeleton" aria-hidden="true">${line("40%", "3rem")}${line("100%")}${line("100%")}${line("80%")}</div>`;
  }
  if (education) {
    education.setAttribute("aria-busy", "true");
    education.innerHTML = `<div class="about-skeleton" aria-hidden="true">${line("9ch", "1.2em")}${line("100%", "3.5em")}${line("100%", "3.5em")}</div>`;
  }
  if (footer) {
    footer.setAttribute("aria-busy", "true");
    footer.innerHTML = `<div class="about-skeleton" aria-hidden="true">${line("14ch", "2em")}${line("24ch")}</div>`;
  }

  function dates(start, end) {
    const a = start ? `<time>${esc(start)}</time>` : "";
    const b = end ? `<time>${esc(end)}</time>` : "";
    return a && b ? `${a} – ${b}` : a || b;
  }

  function renderBody(profile) {
    if (!body) return;
    const name = profile.name || "";
    const paragraphs = profile.summary || [];
    const more = paragraphs.length > 1;
    body.innerHTML = `<div class="about-card">
        <img class="about-avatar" src="assets/img/Person.png" alt="${esc(name || "Portrait")}" width="56" height="56" decoding="async" loading="lazy" />
        <div>
          <p class="about-name">${esc(name)}</p>
          ${profile.title ? `<p class="about-role">${esc(profile.title)}</p>` : ""}
        </div>
      </div>
      <div class="about-text${bioOpen ? " is-open" : ""}" id="about-text" data-count="${paragraphs.length}">${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      ${more ? `<button type="button" class="about-more" data-count="${paragraphs.length}" aria-expanded="${bioOpen}" aria-controls="about-text">${bioOpen ? "Show less" : "Read more"}</button>` : ""}`;
    body.removeAttribute("aria-busy");
  }

  function renderEducation(rows) {
    if (!education) return;
    education.removeAttribute("aria-busy");
    const entries = rows.filter((row) => row.degree || row.institution);
    education.hidden = !entries.length;
    if (!entries.length) {
      education.innerHTML = "";
      return;
    }
    education.innerHTML = `<h3 class="edu-title">Education</h3>
      <ol class="edu-list" role="list">${entries
        .map((row) => {
          const when = dates(row.start, row.end);
          return `<li class="edu">
            <div class="edu-head">
              ${row.degree ? `<p class="edu-degree">${esc(row.degree)}</p>` : ""}
              ${when ? `<p class="edu-dates">${when}</p>` : ""}
            </div>
            ${row.institution ? `<p class="edu-school">${esc(row.institution)}</p>` : ""}
            ${row.detail ? `<p class="edu-detail">${esc(row.detail)}</p>` : ""}
          </li>`;
        })
        .join("")}</ol>`;
  }

  function safeUrl(value) {
    const url = String(value ?? "").trim();
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
    if (!url || (scheme && !/^(https?|mailto)$/i.test(scheme[1]))) return "";
    return url;
  }

  function renderFooter(content) {
    if (!footer) return;
    const contact = content.contact || {};
    const socials = (content.socials || []).filter((s) => safeUrl(s.url));
    const name = (content.profile && content.profile.name) || "";
    const year = new Date().getFullYear();
    const social = socials
      .map(
        (s) =>
          `<li><a class="icon-button" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.name || "Profile")}">${Site.icon(s.icon)}</a></li>`
      )
      .join("");

    footer.innerHTML = `<p class="footer-copy">© ${year} ${esc(name)}</p>
      <div class="footer-links">
        ${contact.email ? `<a class="footer-email" href="mailto:${esc(contact.email)}">${Site.icon("mail")}<span>${esc(contact.email)}</span></a>` : ""}
        ${social ? `<ul class="footer-social" role="list">${social}</ul>` : ""}
      </div>`;
    footer.removeAttribute("aria-busy");
  }

  document.addEventListener("click", (event) => {
    const more = event.target.closest(".about-more");
    if (more) {
      bioOpen = more.getAttribute("aria-expanded") !== "true";
      more.setAttribute("aria-expanded", String(bioOpen));
      more.textContent = bioOpen ? "Show less" : "Read more";
      const text = document.getElementById("about-text");
      if (text) text.classList.toggle("is-open", bioOpen);
    }
  });

  Site.onContent((content) => {
    renderBody(content.profile || {});
    renderEducation(content.education || []);
    renderFooter(content);
  });
})();
