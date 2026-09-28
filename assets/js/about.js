(() => {
  if (!window.Site) return;

  const { esc } = Site;
  const body = document.getElementById("about-body");
  const education = document.getElementById("about-education");
  const footer = document.getElementById("footer-body");

  const line = (width, height = "1em", gap = "var(--space-3)") =>
    `<span class="skeleton" style="width:${width};height:${height};margin-top:${gap}"></span>`;

  if (body) {
    body.setAttribute("aria-busy", "true");
    body.innerHTML = `<div aria-hidden="true">
      <span class="skeleton about-avatar-skeleton"></span>
      ${line("100%", "1em", "var(--space-5)")}${line("100%")}${line("92%")}${line("100%", "1em", "var(--space-5)")}${line("70%")}
    </div>`;
  }

  if (education) {
    education.setAttribute("aria-busy", "true");
    education.innerHTML = `<div aria-hidden="true">${line("9ch", "1.3em", "0")}${line("100%", "3.5em", "var(--space-5)")}${line("100%", "3.5em", "var(--space-5)")}</div>`;
  }

  if (footer) {
    footer.setAttribute("aria-busy", "true");
    footer.innerHTML = `<div aria-hidden="true">${line("14ch", "2em", "0")}${line("24ch")}${line("16ch")}</div>`;
  }

  function dates(start, end) {
    const a = start ? `<time>${esc(start)}</time>` : "";
    const b = end ? `<time>${esc(end)}</time>` : "";
    return a && b ? `${a} – ${b}` : a || b;
  }

  function renderBody(profile) {
    if (!body) return;
    const name = profile.name || "Portrait";
    const paragraphs = (profile.summary || []).map((p) => `<p>${esc(p)}</p>`).join("");
    body.innerHTML = `<img class="about-avatar" src="assets/img/Person.png" alt="${esc(name)}" width="128" height="128" decoding="async" />
      <div class="about-text">${paragraphs}</div>`;
    body.removeAttribute("aria-busy");
  }

  function renderEducation(rows) {
    if (!education) return;
    education.removeAttribute("aria-busy");
    const entries = rows.filter((row) => row.degree || row.institution);
    if (!entries.length) {
      education.innerHTML = "";
      education.hidden = true;
      return;
    }
    education.hidden = false;
    education.innerHTML = `<h3 class="edu-title">Education</h3>
      <ol class="edu-list" role="list">${entries
        .map((row) => {
          const when = dates(row.start, row.end);
          return `<li class="edu">
            <span class="edu-node" aria-hidden="true"></span>
            ${row.degree ? `<p class="edu-degree">${esc(row.degree)}</p>` : ""}
            ${row.institution ? `<p class="edu-school">${esc(row.institution)}</p>` : ""}
            ${when ? `<p class="edu-dates">${when}</p>` : ""}
            ${row.detail ? `<p class="edu-detail">${esc(row.detail)}</p>` : ""}
          </li>`;
        })
        .join("")}</ol>`;
  }

  function renderFooter(content) {
    if (!footer) return;
    const contact = content.contact || {};
    const socials = (content.socials || []).filter((s) => s.url);
    const name = (content.profile && content.profile.name) || "";
    const year = new Date().getFullYear();

    const reach = [
      contact.email
        ? `<li><a class="footer-link" href="mailto:${esc(contact.email)}">${Site.icon("mail")}<span>${esc(contact.email)}</span></a></li>`
        : "",
      contact.location ? `<li class="footer-place">${Site.icon("pin")}<span>${esc(contact.location)}</span></li>` : "",
    ].join("");

    const social = socials
      .map(
        (s) =>
          `<li><a class="icon-button" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.name || "Profile")}">${Site.icon(s.icon)}</a></li>`
      )
      .join("");

    footer.innerHTML = `<div class="footer-main">
        <h2 class="footer-title">Get in touch</h2>
        ${reach ? `<ul class="footer-reach" role="list">${reach}</ul>` : ""}
      </div>
      <div class="footer-actions">
        ${social ? `<ul class="footer-social" role="list">${social}</ul>` : ""}
        <a class="button resumeButton" href="${esc(contact.resumeLink || "#")}">Resume</a>
      </div>
      <p class="footer-copy">© ${year} ${esc(name)}</p>`;
    footer.removeAttribute("aria-busy");
  }

  Site.onContent((content) => {
    renderBody(content.profile || {});
    renderEducation(content.education || []);
    renderFooter(content);
  });
})();
