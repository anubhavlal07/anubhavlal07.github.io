(() => {
  const list = document.getElementById("experience-list");
  if (!list || !window.Site) return;

  const { esc } = Site;
  const wide = window.matchMedia("(min-width: 720px)");
  const expanded = new Set();
  let jobs = [];

  list.setAttribute("aria-busy", "true");
  list.innerHTML = [0, 1]
    .map(
      () => `<li class="job" aria-hidden="true">
        <span class="skeleton" style="width:9ch;height:0.9em"></span>
        <div class="job-main">
          <span class="skeleton" style="width:min(22ch,80%);height:1.3em"></span>
          <span class="skeleton" style="width:min(14ch,60%);height:1em"></span>
          <span class="skeleton" style="width:100%;height:2.8em"></span>
        </div>
      </li>`
    )
    .join("");

  const visible = () => (wide.matches ? 2 : 1);
  const keyOf = (job) => `${job.role}|${job.company}|${job.start}`;
  const label = (count, open) => (open ? "Show less" : `Show ${count} more`);

  function dates(job) {
    const start = job.start ? `<time>${esc(job.start)}</time>` : "";
    const end = job.end ? `<time>${esc(job.end)}</time>` : "";
    if (start && end) return `${start} – ${end}`;
    return start || end;
  }

  function entry(job, index) {
    const id = `job-highlights-${index}`;
    const open = expanded.has(keyOf(job));
    const limit = visible();
    const extra = Math.max(0, job.highlights.length - limit);
    const items = job.highlights
      .map((text, i) => `<li${i >= limit && !open ? " hidden" : ""}>${esc(text)}</li>`)
      .join("");
    const toggle = extra
      ? `<button type="button" class="job-toggle" aria-expanded="${open}" aria-controls="${id}" data-key="${esc(keyOf(job))}" data-extra="${extra}">${label(extra, open)}</button>`
      : "";
    const when = dates(job);

    return `<li class="job${job.current ? " is-current" : ""}" data-reveal>
      ${when ? `<p class="job-dates">${when}</p>` : `<span></span>`}
      <div class="job-main">
        <div class="job-head">
          <h3 class="job-role">${esc(job.role)}</h3>
          ${job.current ? `<span class="job-badge">Current</span>` : ""}
        </div>
        ${job.company ? `<p class="job-company">${esc(job.company)}</p>` : ""}
        ${items ? `<ul class="job-highlights" id="${id}">${items}</ul>` : ""}
        ${toggle}
      </div>
    </li>`;
  }

  function render() {
    list.removeAttribute("aria-busy");
    list.innerHTML = jobs.map(entry).join("");
    list.hidden = !jobs.length;
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".job-toggle");
    if (!button || !list.contains(button)) return;
    const open = button.getAttribute("aria-expanded") !== "true";
    const target = document.getElementById(button.getAttribute("aria-controls"));
    const limit = visible();
    if (target) {
      Array.from(target.children).forEach((item, i) => {
        if (i >= limit) item.hidden = !open;
      });
    }
    button.setAttribute("aria-expanded", String(open));
    button.textContent = label(Number(button.dataset.extra), open);
    if (open) expanded.add(button.dataset.key);
    else expanded.delete(button.dataset.key);
  });

  const onResize = () => {
    if (jobs.length) {
      render();
      list.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed"));
    }
  };
  if (wide.addEventListener) wide.addEventListener("change", onResize);

  Site.onContent((content) => {
    const next = (content.experience || []).filter((job) => job.role || job.company);
    if (JSON.stringify(next) === JSON.stringify(jobs) && !list.hasAttribute("aria-busy")) return;
    jobs = next;
    render();
  });
})();
