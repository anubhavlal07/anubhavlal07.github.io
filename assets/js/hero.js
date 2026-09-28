(() => {
  const nameEl = document.getElementById("hero-name");
  const titleEl = document.getElementById("hero-title");
  const ledeEl = document.getElementById("hero-lede");
  const resumeEl = document.getElementById("resume-link");
  const socialEl = document.getElementById("hero-social");
  const traceEl = document.getElementById("hero-trace");
  if (!window.Site || typeof Site.onContent !== "function" || !titleEl) return;

  const esc = Site.esc;
  const icon = (name) => (typeof Site.icon === "function" ? Site.icon(name) : "");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const horizontal = window.matchMedia("(min-width: 900px)");
  const LINE_MS = 1400;
  const TOTAL_MS = 1600;

  let traceKey = null;
  let hasPlayed = false;
  let playTimer = 0;

  function renderIntro(profile) {
    const name = profile.name || "Anubhav Lal";
    const headline = profile.tagline || profile.title || name;
    const role = profile.title && profile.title !== headline ? profile.title : "";
    if (nameEl) {
      nameEl.innerHTML = `<span class="hero-name-main">${esc(name)}</span>${role ? `<span class="hero-name-role">, ${esc(role)}</span>` : ""}`;
    }
    titleEl.textContent = headline;
    if (ledeEl) {
      ledeEl.textContent = profile.lede || "";
      ledeEl.hidden = !profile.lede;
    }
  }

  function renderResume(contact) {
    if (!resumeEl) return;
    if (contact && contact.resumeLink) resumeEl.setAttribute("href", contact.resumeLink);
    if (!resumeEl.querySelector(".icon")) {
      resumeEl.innerHTML = `${icon("file")}<span>Resume</span>`;
    }
  }

  function renderSocial(socials) {
    if (!socialEl) return;
    socialEl.innerHTML = (socials || [])
      .map(
        (social) =>
          `<li><a class="icon-button" href="${esc(social.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(social.name)}">${icon(social.icon)}</a></li>`
      )
      .join("");
    socialEl.hidden = !socialEl.children.length;
  }

  function traceMarkup(items, state) {
    const nodes = items
      .map((item) => `<li class="trace-node"><span class="trace-label">${esc(item)}</span></li>`)
      .join("");
    return `<figcaption class="visually-hidden" id="hero-trace-caption">What I work on</figcaption>
      <div class="trace" data-state="${state}">
        <span class="trace-track" aria-hidden="true"><span class="trace-fill"></span></span>
        <ol class="trace-list" role="list">${nodes}</ol>
        <span class="trace-end" aria-hidden="true"></span>
      </div>`;
  }

  function fontsReady() {
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, 700))]);
  }

  function schedule(trace) {
    const track = trace.querySelector(".trace-track");
    const nodes = Array.from(trace.querySelectorAll(".trace-node"));
    const across = horizontal.matches;
    const box = track.getBoundingClientRect();
    const length = across ? box.width : box.height;
    nodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const offset = across ? rect.left - box.left : rect.top - box.top;
      const ratio = length > 0 ? Math.min(1, Math.max(0, offset / length)) : index / nodes.length;
      node.style.setProperty("--at", `${Math.round(ratio * LINE_MS)}ms`);
    });
    trace.style.setProperty("--line", `${LINE_MS}ms`);
    trace.style.setProperty("--end-at", `${LINE_MS - 40}ms`);
  }

  function play(trace) {
    fontsReady().then(() => {
      requestAnimationFrame(() => {
        if (!trace.isConnected || trace.dataset.state !== "pending") return;
        schedule(trace);
        trace.dataset.state = "playing";
        playTimer = window.setTimeout(() => {
          if (trace.isConnected) trace.dataset.state = "settled";
        }, TOTAL_MS + 120);
      });
    });
  }

  function renderTrace(items) {
    if (!traceEl) return;
    const key = JSON.stringify(items);
    if (key === traceKey) return;
    traceKey = key;
    traceEl.hidden = items.length === 0;
    if (!items.length) return;
    const animate = !hasPlayed && !reducedMotion.matches;
    hasPlayed = true;
    window.clearTimeout(playTimer);
    traceEl.innerHTML = traceMarkup(items, animate ? "pending" : "settled");
    if (animate) play(traceEl.querySelector(".trace"));
  }

  Site.onContent((content) => {
    const profile = (content && content.profile) || {};
    renderIntro(profile);
    renderResume(content && content.contact);
    renderSocial(content && content.socials);
    renderTrace(Array.isArray(profile.worksOn) ? profile.worksOn : []);
  });
})();
