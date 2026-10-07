/**
 * Service worker for the portfolio PWA.
 *
 * Strategy: network-first for page navigations and content JSON so edits
 * published from the dashboard show up immediately, stale-while-revalidate for
 * the rest of the same-origin static shell. Cross-origin requests
 * (Supabase reads/writes, analytics, Google Fonts, IP/geo APIs)
 * are left untouched so they always hit the network. Non-GET requests
 * (analytics POSTs, Supabase heartbeats) are ignored entirely.
 *
 * Bump CACHE when shell assets change so old caches are purged on activate.
 */
const CACHE = "anubhav-portfolio-v9";

const SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "assets/css/tokens.css",
  "assets/css/base.css",
  "assets/css/nav.css",
  "assets/css/hero.css",
  "assets/css/work.css",
  "assets/css/experience.css",
  "assets/css/skills.css",
  "assets/css/about.css",
  "assets/css/resume.css",
  "assets/js/supabaseClient.js",
  "assets/js/icons.js",
  "assets/js/data.js",
  "assets/js/nav.js",
  "assets/js/hero.js",
  "assets/js/motion.js",
  "assets/js/background.js",
  "assets/js/work.js",
  "assets/js/experience.js",
  "assets/js/skills.js",
  "assets/js/about.js",
  "assets/js/resume.js",
  "assets/js/disableInput.js",
  "assets/js/analytics.js",
  "assets/js/pwa.js",
  "assets/json/profile.json",
  "assets/json/social_links.json",
  "assets/json/skills.json",
  "assets/json/skill_items.json",
  "assets/json/experience.json",
  "assets/json/projects.json",
  "assets/json/resume.json",
  "assets/img/favicon.png",
  "assets/img/Person.png"
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

  const fresh = req.mode === "navigate" || url.pathname.endsWith(".json");

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone());
        return res;
      });

      if (fresh) {
        try {
          return await network;
        } catch (err) {
          const cached = await cache.match(req);
          if (cached) return cached;
          if (req.mode === "navigate") {
            const shell = await cache.match("index.html");
            if (shell) return shell;
          }
          throw err;
        }
      }

      const cached = await cache.match(req);
      if (cached) {
        event.waitUntil(network.catch(() => {}));
        return cached;
      }
      return network;
    })()
  );
});
