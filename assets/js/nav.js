(() => {
  const root = document.documentElement;
  const header = document.getElementById("header");
  const brand = document.getElementById("nav-brand");
  const menu = document.getElementById("nav-menu");
  const themeToggle = document.getElementById("theme-toggle");
  const scrollTop = document.getElementById("scroll-top");
  if (!header || !menu) return;

  const links = Array.from(menu.querySelectorAll(".nav-link"));
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const icon = (name) => (window.Site && typeof Site.icon === "function" ? Site.icon(name) : "");
  const THEME_KEY = "selected-theme";
  const MODES = ["auto", "light", "dark"];
  const MODE_ICONS = { auto: "auto", light: "sun", dark: "moon" };
  const themeMetas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
  themeMetas.forEach((meta) => { meta.dataset.original = meta.getAttribute("content") || ""; });

  function storedMode() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      if (value === "light" || value === "dark") return value;
    } catch (error) {}
    return "auto";
  }

  function storeMode(mode) {
    try {
      if (mode === "auto") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch (error) {}
  }

  function syncThemeColor(mode) {
    if (mode === "auto") {
      themeMetas.forEach((meta) => meta.setAttribute("content", meta.dataset.original));
      return;
    }
    const paper = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (paper) themeMetas.forEach((meta) => meta.setAttribute("content", paper));
  }

  let mode = storedMode();

  function applyTheme() {
    const dark = mode === "dark" || (mode === "auto" && prefersDark.matches);
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.themeMode = mode;
    if (themeToggle) {
      themeToggle.innerHTML = icon(MODE_ICONS[mode]);
      themeToggle.setAttribute("aria-label", `Theme: ${mode}`);
      themeToggle.title = `Theme: ${mode}`;
    }
    syncThemeColor(mode);
  }

  applyTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
      storeMode(mode);
      applyTheme();
    });
  }

  const onSchemeChange = () => {
    if (mode === "auto") applyTheme();
  };
  if (prefersDark.addEventListener) prefersDark.addEventListener("change", onSchemeChange);
  else if (prefersDark.addListener) prefersDark.addListener(onSchemeChange);

  const list = menu.querySelector(".nav-list");

  function setActive(id) {
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "true");
        if (list && list.scrollWidth > list.clientWidth) {
          const target = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
          list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  const spied = ["home", "work", "experience", "skills", "about"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && spied.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    spied.forEach((section) => observer.observe(section));
  }

  let ticking = false;
  function updateScroll() {
    ticking = false;
    const y = window.scrollY;
    header.toggleAttribute("data-scrolled", y > 4);
    if (scrollTop) scrollTop.toggleAttribute("data-visible", y > window.innerHeight * 0.9);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScroll);
    },
    { passive: true }
  );
  updateScroll();

  if (scrollTop) scrollTop.innerHTML = icon("arrowUp");

  if (window.Site && typeof Site.onContent === "function" && brand) {
    Site.onContent((content) => {
      const name = content && content.profile && content.profile.name;
      if (!name) return;
      const nameEl = document.getElementById("nav-name");
      const markEl = document.getElementById("nav-mark");
      if (nameEl) nameEl.textContent = name;
      if (markEl) markEl.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
    });
  }
})();
