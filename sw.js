/**
 * Service worker for the portfolio PWA.
 *
 * Strategy: cache-first for same-origin GET requests (the static app shell),
 * with runtime caching of anything else same-origin. Cross-origin requests
 * (Supabase reads/writes, analytics, Google Fonts, RemixIcon CDN, IP/geo APIs)
 * are left untouched so they always hit the network. Non-GET requests
 * (analytics POSTs, Supabase heartbeats) are ignored entirely.
 *
 * Bump CACHE when shell assets change so old caches are purged on activate.
 */
const CACHE = "anubhav-portfolio-v1";

const SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "assets/css/styles.css",
  "assets/css/swiper-bundle.min.css",
  "assets/js/supabaseClient.js",
  "assets/js/main.js",
  "assets/js/interactiveBackground.js",
  "assets/js/disableInput.js",
  "assets/js/loadProjects.js",
  "assets/js/loadExperience.js",
  "assets/js/loadProfile.js",
  "assets/js/loadSkills.js",
  "assets/js/quotes.js",
  "assets/js/resumeModal.js",
  "assets/js/scrollreveal.min.js",
  "assets/js/swiper-bundle.min.js",
  "assets/js/analytics.js",
  "assets/js/pwa.js",
  "assets/json/profile.json",
  "assets/json/skills.json",
  "assets/json/experience.json",
  "assets/json/projects.json",
  "assets/json/resume.json",
  "assets/img/favicon.png",
  "assets/img/Person.png",
  "assets/img/shape-wawes.svg",
  "assets/img/shape-circle.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Cache what we can; a single 404 shouldn't abort the whole install.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // leave Supabase writes / analytics alone
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin hit network

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === "basic") {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch (err) {
        // Offline and not cached: fall back to the app shell for navigations.
        if (req.mode === "navigate") {
          const shell = await caches.match("index.html");
          if (shell) return shell;
        }
        throw err;
      }
    })()
  );
});
