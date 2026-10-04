import { readFile, writeFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(join(root, path), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

const host = (await read("CNAME").catch(() => "portfolio.anubhavlal.dev")).trim();
const SITE = `https://${host}`;
const PERSON_ID = `${SITE}/#person`;
const IMAGE_W = 1264;
const IMAGE_H = 848;
const DESCRIPTION_MAX = 160;
const year = process.env.BUILD_YEAR || String(new Date().getUTCFullYear());

const sandbox = {
  console,
  URL,
  location: { href: `${SITE}/` },
  document: {
    readyState: "loading",
    currentScript: null,
    addEventListener() {},
    getElementById: () => null,
    documentElement: { dataset: {} },
  },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ["assets/js/icons.js", "assets/js/data.js", "assets/js/work.js"]) {
  vm.runInContext(await read(file), sandbox, { filename: file });
}
const { esc, icon, normalize, slugify, renderFlow } = sandbox.Site;

const raw = {
  profile: await readJson("assets/json/profile.json"),
  social_links: await readJson("assets/json/social_links.json"),
  resume: await readJson("assets/json/resume.json"),
  projects: await readJson("assets/json/projects.json"),
};
const content = normalize(raw);
const name = content.profile.name || "Anubhav Lal";
const jobTitle = content.profile.title || "";
const resumeLink = content.contact.resumeLink || "#";

const rowsBySlug = new Map();
for (const row of raw.projects) {
  if (!row || row.is_visible === false) continue;
  const slug = slugify(row.title);
  if (slug && !rowsBySlug.has(slug)) rowsBySlug.set(slug, row);
}

const seen = new Set();
const projects = content.projects.filter((project) => {
  if (!project.slug || seen.has(project.slug)) return false;
  seen.add(project.slug);
  return true;
});

const day = (value) => {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const safeUrl = (value) => {
  const url = String(value ?? "").trim();
  if (!url) return "";
  const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^(https?|mailto)$/i.test(scheme[1])) return "";
  return url;
};

const isGithub = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase() === "github.com";
  } catch {
    return false;
  }
};

function summarize(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_MAX) return clean;
  const cut = clean.slice(0, DESCRIPTION_MAX - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > DESCRIPTION_MAX / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

function describe(project) {
  if (project.description) return summarize(project.description);
  const tech = project.tech.length ? `a ${project.tech.join(", ")} project` : "a project";
  return summarize(`${project.title}, ${tech} by ${name}${jobTitle ? `, ${jobTitle}` : ""}.`);
}

function jsonLd(project, url, description, row) {
  const link = safeUrl(project.link);
  const work = {
    "@type": link && isGithub(link) ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#project`,
    name: project.title,
    description,
    url: link && !isGithub(link) ? link : url,
    mainEntityOfPage: url,
  };
  if (link && isGithub(link)) work.codeRepository = link;
  if (safeUrl(project.image)) work.image = project.image;
  if (project.tech.length) work.keywords = project.tech.join(", ");
  if (day(row.created_at)) work.dateCreated = day(row.created_at);
  if (day(row.updated_at)) work.dateModified = day(row.updated_at);
  work.author = { "@type": "Person", "@id": PERSON_ID, name, url: `${SITE}/` };
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name, item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE}/#work` },
      { "@type": "ListItem", position: 3, name: project.title, item: url },
    ],
  };
  const data = { "@context": "https://schema.org", "@graph": [work, breadcrumb] };
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c").replace(/\n/g, "\n    ");
}

function footer() {
  const socials = content.socials
    .filter((s) => safeUrl(s.url))
    .map(
      (s) =>
        `<li><a class="icon-button" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.name || "Profile")}">${icon(s.icon)}</a></li>`
    )
    .join("");
  const email = content.contact.email
    ? `<a class="footer-email" href="mailto:${esc(content.contact.email)}">${icon("mail")}<span>${esc(content.contact.email)}</span></a>`
    : "";
  return `<footer class="site-footer" id="contact">
    <div class="container footer-inner" id="footer-body">
      <p class="footer-copy">© ${esc(year)} ${esc(name)}</p>
      <div class="footer-links">
        ${email}
        ${socials ? `<ul class="footer-social" role="list">${socials}</ul>` : ""}
      </div>
    </div>
  </footer>`;
}

function moreProjects(current) {
  const others = projects.filter((project) => project.slug !== current.slug);
  if (others.length === 0) return "";
  const items = others
    .map(
      (project) =>
        `<li><a class="project-more-link" href="/projects/${esc(project.slug)}/"><span class="project-more-title">${esc(project.title)}</span>${
          project.tech.length ? `<span class="project-more-tech">${esc(project.tech.slice(0, 3).join(" · "))}</span>` : ""
        }</a></li>`
    )
    .join("\n          ");
  return `<section class="project-more" id="more" aria-labelledby="more-title">
        <h2 class="project-more-heading" id="more-title">More projects</h2>
        <ul class="project-more-list" role="list">
          ${items}
        </ul>
      </section>`;
}

function page(project) {
  const row = rowsBySlug.get(project.slug) || {};
  const url = `${SITE}/projects/${project.slug}/`;
  const title = `${project.title} — ${name}`;
  const description = describe(project);
  const image = safeUrl(project.image) || `${SITE}/assets/img/Person.png`;
  const imageAlt = safeUrl(project.image) ? `${project.title} screenshot` : name;
  const keywords = [project.title, name, ...project.tech].join(", ");
  const link = safeUrl(project.link);
  const flow = project.flow ? renderFlow(project.flow) : "";
  const tech = project.tech.length
    ? `<ul class="chip-list work-tech" role="list" aria-label="Built with">${project.tech
        .map((item) => `<li><span class="chip">${esc(item)}</span></li>`)
        .join("")}</ul>`
    : "";
  const media = safeUrl(project.image)
    ? `<div class="tile-media"><img src="${esc(project.image)}" alt="${esc(imageAlt)}" width="${IMAGE_W}" height="${IMAGE_H}" loading="eager" decoding="async" fetchpriority="high" /></div>`
    : "";
  const primary = link
    ? `<div class="featured-actions project-actions"><a class="button button-primary" href="${esc(link)}" data-project="${esc(
        project.slug
      )}" target="_blank" rel="noopener noreferrer">${esc(project.linkText || "View")}<span class="visually-hidden"> ${esc(
        project.title
      )} (opens in a new tab)</span>${icon("external")}</a></div>`
    : "";
  const flowSection = flow
    ? `
        <section class="featured-flow" id="flow" aria-labelledby="flow-title">
          <div class="featured-flow-head"><h2 class="featured-flow-label" id="flow-title">How it works</h2></div>
          ${flow}
        </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <script>
    (() => {
      let mode = "auto";
      try {
        const stored = localStorage.getItem("selected-theme");
        if (stored === "light" || stored === "dark") mode = stored;
      } catch (e) {}
      const dark = mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.dataset.themeMode = mode;
      document.documentElement.classList.add("js");
    })();
  </script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="author" content="${esc(name)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:alt" content="${esc(imageAlt)}" />
  <meta property="og:site_name" content="${esc(name)}" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${esc(url)}" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <meta name="twitter:image:alt" content="${esc(imageAlt)}" />
  <meta name="theme-color" content="#eef1f4" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0f1a2b" media="(prefers-color-scheme: dark)" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="icon" href="/assets/img/favicon.png" type="image/png" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/assets/img/Person.png" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="${esc(name)}" />

  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Geist+Mono:wght@400..500&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="/assets/css/tokens.css" />
  <link rel="stylesheet" href="/assets/css/base.css" />
  <link rel="stylesheet" href="/assets/css/nav.css" />
  <link rel="stylesheet" href="/assets/css/work.css" />
  <link rel="stylesheet" href="/assets/css/about.css" />
  <link rel="stylesheet" href="/assets/css/resume.css" />

  <script type="application/ld+json">
    ${jsonLd(project, url, description, row)}
  </script>
</head>

<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <canvas id="bg-field" class="bg-field" aria-hidden="true"></canvas>
  <div class="spotlight" aria-hidden="true"></div>

  <header class="site-header" id="header">
    <nav class="nav container" aria-label="Primary">
      <a href="/" class="nav-brand" id="nav-brand"><span class="nav-mark" id="nav-mark" aria-hidden="true">${esc(
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join("")
      )}</span><span class="nav-name" id="nav-name">${esc(name)}</span></a>
      <div class="nav-menu" id="nav-menu">
        <ul class="nav-list" role="list">
          <li><a href="/#experience" class="nav-link">Experience</a></li>
          <li><a href="/#work" class="nav-link" aria-current="true">Work</a></li>
          <li><a href="/#skills" class="nav-link">Stack</a></li>
          <li><a href="/#about" class="nav-link">About</a></li>
        </ul>
      </div>
      <div class="nav-actions">
        <button type="button" class="icon-button" id="theme-toggle" aria-label="Theme: auto"></button>
        <a href="${esc(resumeLink)}" class="button button-sm nav-resume resumeButton" id="resume-link">Resume</a>
      </div>
    </nav>
  </header>

  <main id="main" class="project-page">
    <div class="container">
      <p class="project-back"><a class="text-link" href="/#work">← All projects</a></p>
      <article class="tile tile-featured project-tile">
        <section class="featured-top" id="project" aria-labelledby="project-title">
          ${media}
          <div class="tile-body">
            <h1 class="tile-title" id="project-title">${esc(project.title)}</h1>
            ${project.description ? `<p class="tile-desc">${esc(project.description)}</p>` : ""}
            ${tech}
            ${primary}
          </div>
        </section>${flowSection}
      </article>
      ${moreProjects(project)}
    </div>
  </main>

  ${footer()}

  <a href="#main" class="scroll-top icon-button" id="scroll-top" aria-label="Back to top"></a>

  <dialog class="resume-dialog" id="resume-dialog" aria-labelledby="resume-dialog-title">
    <div class="resume-bar">
      <button type="button" class="icon-button resume-close" data-resume-close aria-label="Close resume"></button>
    </div>
    <article class="resume-dialog-inner" id="resume-dialog-body"></article>
  </dialog>

  <script src="/assets/js/supabaseClient.js" defer></script>
  <script src="/assets/js/icons.js" defer></script>
  <script src="/assets/js/data.js" defer></script>
  <script src="/assets/js/nav.js" defer></script>
  <script src="/assets/js/motion.js" defer></script>
  <script src="/assets/js/background.js" defer></script>
  <script src="/assets/js/resume.js" defer></script>
  <script src="/assets/js/disableInput.js" defer></script>
  <script src="/assets/js/analytics.js" defer></script>
</body>

</html>
`;
}

function sitemap() {
  let newest = "";
  for (const rows of Object.values(raw)) {
    for (const row of Array.isArray(rows) ? rows : []) {
      const value = day(row && (row.updated_at || row.created_at));
      if (value > newest) newest = value;
    }
  }
  const entry = (loc, lastmod, priority) =>
    `  <url>
    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  const urls = [
    entry(`${SITE}/`, newest, "1.0"),
    ...projects.map((project) => {
      const row = rowsBySlug.get(project.slug) || {};
      return entry(`${SITE}/projects/${project.slug}/`, day(row.updated_at || row.created_at), "0.8");
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

async function writeIfChanged(path, next) {
  const file = join(root, path);
  const previous = await readFile(file, "utf8").catch(() => null);
  if (previous !== null && previous.replace(/\r\n/g, "\n") === next) return false;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, next);
  console.log(`wrote ${path}`);
  return true;
}

let changed = 0;
const outDir = join(root, "projects");
await mkdir(outDir, { recursive: true });

for (const project of projects) {
  if (await writeIfChanged(`projects/${project.slug}/index.html`, page(project))) changed += 1;
}

for (const entry of await readdir(outDir)) {
  if (seen.has(entry)) continue;
  const path = join(outDir, entry);
  if (!(await stat(path)).isDirectory()) continue;
  await rm(path, { recursive: true, force: true });
  console.log(`removed projects/${entry}`);
  changed += 1;
}

if (await writeIfChanged("sitemap.xml", sitemap())) changed += 1;

console.log(changed ? `${changed} file(s) changed, ${projects.length} project page(s)` : `no changes, ${projects.length} project page(s)`);
