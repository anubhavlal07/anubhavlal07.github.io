(() => {
  const featuredEl = document.getElementById("work-featured");
  const listEl = document.getElementById("work-list");
  const esc = (value) => window.Site.esc(value);
  const icon = (name) => (window.Site.icon ? window.Site.icon(name) : "");
  const IMAGE_W = 1264;
  const IMAGE_H = 848;
  const MAX_ROW_STEPS = 6;
  let signature = null;

  function safeUrl(value) {
    const url = String(value ?? "").trim();
    if (!url) return "";
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme && !/^(https?|mailto)$/i.test(scheme[1])) return "";
    return url;
  }

  function cleanSteps(steps) {
    if (!Array.isArray(steps)) return [];
    return steps
      .map((step) => (Array.isArray(step) ? step : [step]).map((label) => String(label ?? "").trim()).filter(Boolean))
      .filter((step) => step.length > 0);
  }

  function describeFlow(steps) {
    const parts = steps.map((step) => {
      if (step.length === 1) return step[0];
      return `${step.slice(0, -1).join(", ")} or ${step[step.length - 1]} in parallel`;
    });
    return `Flow: ${parts.join(", then ")}.`;
  }

  function renderFlow(steps) {
    const clean = cleanSteps(steps);
    if (clean.length === 0) return "";
    const node = (label) => `<span class="flow-node">${esc(label)}</span>`;
    const items = clean
      .map((step) =>
        step.length === 1
          ? `<li class="flow-step">${node(step[0])}</li>`
          : `<li class="flow-step flow-step-split"><ul class="flow-branches" role="list">${step
              .map((label) => `<li class="flow-branch">${node(label)}</li>`)
              .join("")}</ul></li>`
      )
      .join("");
    const stackOnly = clean.length > MAX_ROW_STEPS ? " flow-stacked" : "";
    return `<figure class="flow-wrap" style="--steps: ${clean.length}"><figcaption class="visually-hidden">${esc(
      describeFlow(clean)
    )}</figcaption><div class="flow-frame"><ol class="flow${stackOnly}" role="list">${items}</ol></div></figure>`;
  }

  function renderTech(tech, chained = true) {
    const items = Array.isArray(tech) ? tech.filter(Boolean) : [];
    if (items.length === 0) return "";
    const chain = chained && items.length > 1 ? " tech-chain" : "";
    const chips = items.map((name) => `<li><span class="chip">${esc(name)}</span></li>`).join("");
    return `<ul class="chip-list work-tech${chain}" role="list">${chips}</ul>`;
  }

  function renderLink(project, className) {
    const href = safeUrl(project.link);
    if (!href) return "";
    return `<a class="${className}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(
      project.linkText || "View"
    )}<span class="visually-hidden"> ${esc(project.title)} (opens in a new tab)</span>${icon("external")}</a>`;
  }

  function renderImage(project, className) {
    const src = safeUrl(project.image);
    if (!src) return "";
    return `<img class="${className}" src="${esc(src)}" alt="${esc(project.title)}" width="${IMAGE_W}" height="${IMAGE_H}" loading="lazy" decoding="async" />`;
  }

  function renderFeatured(project) {
    const image = renderImage(project, "featured-img");
    const link = renderLink(project, "button featured-link");
    const detail = project.flow
      ? `${renderFlow(project.flow)}${renderTech(project.tech, false)}`
      : renderTech(project.tech);
    return `<article class="featured${image ? "" : " featured-text-only"}">${
      image ? `<div class="featured-media">${image}</div>` : ""
    }<div class="featured-body"><h3 class="featured-title">${esc(project.title)}</h3>${
      project.description ? `<p class="featured-desc">${esc(project.description)}</p>` : ""
    }${detail}${link ? `<div class="featured-actions">${link}</div>` : ""}</div></article>`;
  }

  function renderItem(project) {
    const image = renderImage(project, "work-thumb");
    const link = renderLink(project, "work-link");
    return `<li class="work-item${image ? "" : " work-item-text-only"}">${image}<h3 class="work-title">${esc(
      project.title
    )}</h3><div class="work-body">${project.description ? `<p class="work-desc">${esc(project.description)}</p>` : ""}${
      project.flow ? renderFlow(project.flow) : renderTech(project.tech)
    }${link}</div></li>`;
  }

  function renderSkeleton() {
    if (featuredEl) {
      featuredEl.setAttribute("aria-busy", "true");
      featuredEl.innerHTML = `<div class="featured work-loading" aria-hidden="true"><span class="skeleton work-skel-media"></span><div class="featured-body"><span class="skeleton work-skel-title"></span><span class="skeleton work-skel-line"></span><span class="skeleton work-skel-line"></span><span class="skeleton work-skel-line work-skel-short"></span><span class="skeleton work-skel-chips"></span></div></div>`;
    }
    if (listEl) {
      listEl.innerHTML = Array.from(
        { length: 2 },
        () =>
          `<li class="work-item work-loading" aria-hidden="true"><span class="skeleton work-skel-thumb"></span><span class="skeleton work-skel-title"></span><div class="work-body"><span class="skeleton work-skel-line"></span><span class="skeleton work-skel-chips"></span></div></li>`
      ).join("");
    }
  }

  function renderWork(content) {
    if (!featuredEl || !listEl) return;
    const projects = content && Array.isArray(content.projects) ? content.projects.filter((p) => p && p.title) : [];
    const next = JSON.stringify(projects);
    if (next === signature) return;
    signature = next;
    featuredEl.removeAttribute("aria-busy");

    if (projects.length === 0) {
      featuredEl.innerHTML = `<p class="work-empty">No projects published yet.</p>`;
      listEl.innerHTML = "";
      listEl.hidden = true;
      return;
    }

    const index = Math.max(0, projects.findIndex((project) => project.featured));
    const rest = projects.filter((_, i) => i !== index);
    featuredEl.innerHTML = renderFeatured(projects[index]);
    listEl.innerHTML = rest.map(renderItem).join("");
    listEl.hidden = rest.length === 0;
  }

  window.Site = window.Site || {};
  Object.assign(window.Site, { renderFlow, renderWork });

  renderSkeleton();
  if (typeof window.Site.onContent === "function") window.Site.onContent(renderWork);
})();
