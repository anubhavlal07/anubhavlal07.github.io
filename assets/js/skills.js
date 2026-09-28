(() => {
  const root = document.getElementById("skills-groups");
  if (!root || !window.Site) return;

  const { esc } = Site;
  let signature = null;

  root.setAttribute("aria-busy", "true");
  root.innerHTML = [0, 1, 2]
    .map(
      () => `<div class="stack-group" aria-hidden="true">
        <span class="skeleton" style="width:12ch;height:1.1em"></span>
        <span class="skeleton" style="width:100%;height:4.5em"></span>
      </div>`
    )
    .join("");

  function logo(item) {
    if (!item.image) return `<span class="stack-logo stack-logo-empty" aria-hidden="true">${Site.icon("node")}</span>`;
    return `<span class="stack-logo"><img src="${esc(item.image)}" alt="" width="18" height="18" loading="lazy" decoding="async" /></span>`;
  }

  function item(skill) {
    const strong = Number(skill.rank) >= 3;
    return `<li class="stack-item${strong ? " is-strong" : ""}" title="${esc(skill.level || "")}">${logo(skill)}<span>${esc(skill.name)}</span></li>`;
  }

  function group(g) {
    const items = g.items
      .filter((s) => s.name)
      .map((s, index) => ({ s, index }))
      .sort((a, b) => (Number(b.s.rank) || 0) - (Number(a.s.rank) || 0) || a.index - b.index)
      .map(({ s }) => item(s))
      .join("");
    return `<div class="stack-group" data-reveal>
      <h3 class="stack-title">${Site.icon(g.icon, "icon stack-icon")}<span>${esc(g.title)}</span></h3>
      <ul class="stack-list" role="list">${items}</ul>
    </div>`;
  }

  root.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (img.tagName !== "IMG" || !root.contains(img)) return;
      const holder = img.parentElement;
      if (!holder) return;
      holder.classList.add("stack-logo-empty");
      holder.setAttribute("aria-hidden", "true");
      holder.innerHTML = Site.icon("node");
    },
    true
  );

  Site.onContent((content) => {
    const groups = (content.skills || []).filter((g) => g.items && g.items.length);
    const next = JSON.stringify(groups);
    if (next === signature) return;
    signature = next;
    root.removeAttribute("aria-busy");
    root.innerHTML = groups.map(group).join("");
  });
})();
