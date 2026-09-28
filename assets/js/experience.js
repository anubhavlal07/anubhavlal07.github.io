(() => {
  const list = document.getElementById("experience-list");
  if (!list || !window.Site) return;

  const { esc } = Site;
  const VISIBLE = 2;
  const expanded = new Set();

  list.setAttribute("aria-busy", "true");
  list.innerHTML = [0, 1]
    .map(
      () => `<li class="run run-skeleton" aria-hidden="true">
        <span class="run-node"></span>
        <div class="run-body">
          <span class="skeleton" style="width:min(22ch,80%);height:1.4em"></span>
          <span class="skeleton" style="width:min(16ch,60%);height:1em;margin-top:var(--space-2)"></span>
          <span class="skeleton" style="width:100%;max-width:60ch;height:3.2em;margin-top:var(--space-4)"></span>
        </div>
      </li>`
    )
    .join("");

  const keyOf = (job) => `${job.role}|${job.company}|${job.start}`;

  function label(count, open) {
    return open ? "Show fewer" : `Show ${count} more`;
  }

  function dates(job) {
    const start = job.start ? `<time>${esc(job.start)}</time>` : "";
    const end = job.end ? `<time>${esc(job.end)}</time>` : "";
    if (start && end) return `${start}<span class="run-dash"> – </span>${end}`;
    return start || end;
  }

  function entry(job, index, jobs) {
    const id = `run-highlights-${index}`;
    const open = expanded.has(keyOf(job));
    const extra = Math.max(0, job.highlights.length - VISIBLE);
    const leadsToCurrent = !!(jobs[index + 1] && jobs[index + 1].current);
    const classes = ["run", job.current ? "is-current" : "", leadsToCurrent ? "leads-current" : ""].filter(Boolean).join(" ");

    const items = job.highlights
      .map((text, i) => `<li${i >= VISIBLE && !open ? " hidden" : ""}>${esc(text)}</li>`)
      .join("");

    const toggle = extra
      ? `<button type="button" class="run-toggle" aria-expanded="${open}" aria-controls="${id}" data-key="${esc(keyOf(job))}" data-extra="${extra}">${label(extra, open)}</button>`
      : "";

    const when = dates(job);

    return `<li class="${classes}">
      <span class="run-node" aria-hidden="true"></span>
      ${when ? `<p class="run-dates">${when}${job.current ? '<span class="visually-hidden">, current role</span>' : ""}</p>` : ""}
      <div class="run-body">
        <h3 class="run-role">${esc(job.role)}</h3>
        ${job.company ? `<p class="run-company">${esc(job.company)}</p>` : ""}
        ${items ? `<ul class="run-highlights" id="${id}">${items}</ul>` : ""}
        ${toggle}
      </div>
    </li>`;
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".run-toggle");
    if (!button || !list.contains(button)) return;
    const open = button.getAttribute("aria-expanded") !== "true";
    const target = document.getElementById(button.getAttribute("aria-controls"));
    if (target) {
      Array.from(target.children).forEach((item, i) => {
        if (i >= VISIBLE) item.hidden = !open;
      });
    }
    button.setAttribute("aria-expanded", String(open));
    button.textContent = label(Number(button.dataset.extra), open);
    if (open) expanded.add(button.dataset.key);
    else expanded.delete(button.dataset.key);
  });

  Site.onContent((content) => {
    const jobs = (content.experience || []).filter((job) => job.role || job.company);
    list.removeAttribute("aria-busy");
    if (!jobs.length) {
      list.innerHTML = "";
      return;
    }
    list.innerHTML = jobs.map(entry).join("");
  });
})();
