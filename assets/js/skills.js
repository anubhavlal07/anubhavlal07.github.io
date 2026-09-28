(() => {
  const root = document.getElementById("skills-groups");
  if (!root || !window.Site) return;

  const { esc } = Site;
  const WORDS = { 1: "Beginner", 2: "Intermediate", 3: "Skillful" };

  root.setAttribute("aria-busy", "true");
  root.innerHTML = [0, 1, 2]
    .map(
      () => `<div class="skill-group" aria-hidden="true">
        <span class="skeleton" style="width:12ch;height:1.4em"></span>
        <span class="skeleton" style="width:100%;height:1.2em;margin-top:var(--space-5)"></span>
        <span class="skeleton" style="width:100%;height:1.2em;margin-top:var(--space-4)"></span>
        <span class="skeleton" style="width:100%;height:1.2em;margin-top:var(--space-4)"></span>
      </div>`
    )
    .join("");

  function meter(rank) {
    const filled = Math.min(3, Math.max(1, Number(rank) || 2));
    return `<span class="skill-meter" data-rank="${filled}" aria-hidden="true">${[1, 2, 3]
      .map((n) => `<span class="skill-seg${n <= filled ? " is-on" : ""}"></span>`)
      .join("")}</span>`;
  }

  function logo(item) {
    if (!item.image) return `<span class="skill-logo skill-logo-empty" aria-hidden="true">${Site.icon("node")}</span>`;
    return `<span class="skill-logo"><img src="${esc(item.image)}" alt="" width="24" height="24" loading="lazy" decoding="async" /></span>`;
  }

  function item(skill) {
    const word = skill.level || WORDS[skill.rank] || "";
    return `<li class="skill">
      ${logo(skill)}
      <span class="skill-name">${esc(skill.name)}</span>
      <span class="skill-level">${meter(skill.rank)}<span class="skill-word">${esc(word)}</span></span>
    </li>`;
  }

  function group(g) {
    return `<div class="skill-group">
      <h3 class="skill-group-title">${Site.icon(g.icon, "icon skill-group-icon")}<span>${esc(g.title)}</span></h3>
      <ul class="skill-list" role="list">${g.items.filter((s) => s.name).map(item).join("")}</ul>
    </div>`;
  }

  root.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (img.tagName !== "IMG" || !root.contains(img)) return;
      const holder = img.parentElement;
      if (!holder) return;
      holder.classList.add("skill-logo-empty");
      holder.setAttribute("aria-hidden", "true");
      holder.innerHTML = Site.icon("node");
    },
    true
  );

  Site.onContent((content) => {
    const groups = (content.skills || []).filter((g) => g.items && g.items.length);
    root.removeAttribute("aria-busy");
    root.innerHTML = groups.map(group).join("");
  });
})();
