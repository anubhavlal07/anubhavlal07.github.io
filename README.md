# Portfolio

Welcome to my personal portfolio repository. As a professional software developer, this site showcases my technical skills, key projects, and career achievements. It serves as a central hub for employers and collaborators to review my work and learn more about my background in software development.

The portfolio is structured for clarity and ease of navigation, allowing visitors to quickly find information about my experience, technologies I work with, and notable accomplishments. I keep this repository updated with my latest projects and milestones to reflect my ongoing growth in the field.

## Visit

[https://portfolio.anubhavlal.dev/](https://portfolio.anubhavlal.dev/) (also served at [anubhavlal07.github.io](https://anubhavlal07.github.io/))

Explore my portfolio for a comprehensive overview of my software development expertise, project highlights, and professional journey.

## Tech Stack

A **static, dependency-free site**: hand-written HTML, CSS and JavaScript with no framework, no third-party libraries and no build step. Content comes from **Supabase** (PostgreSQL) and is edited in the private [portfolio-data](https://github.com/anubhavlal07/portfolio-data) dashboard. Local JSON snapshots are the offline fallback.

- **HTML5 / CSS3**: semantic markup, custom-property design tokens, Grid, Flexbox and container queries.
- **Vanilla JavaScript (ES2020)**: one small renderer per section, with inline SVG icons.
- **Supabase**: content and visitor analytics, read through a tiny hand-rolled REST client (`assets/js/supabaseClient.js`).
- **Google Fonts**: Geist and Geist Mono.

The visual system is documented in [`docs/DESIGN.md`](docs/DESIGN.md).

## Project Structure

```
anubhavlal07.github.io/
├── .github/workflows/snapshot.yml   # Nightly Supabase → assets/json snapshot
├── assets/
│   ├── css/
│   │   ├── tokens.css               # Colour, type, spacing, motion tokens (light + dark)
│   │   ├── base.css                 # Reset, typography, layout primitives, shared controls
│   │   └── nav, hero, work, experience, skills, about, resume .css
│   ├── img/                         # Avatar, favicon, project screenshots, skill logos
│   ├── js/
│   │   ├── supabaseClient.js        # Minimal Supabase REST client (global `supabase`)
│   │   ├── data.js                  # Loads all tables, falls back to JSON, normalises content
│   │   ├── icons.js                 # Inline SVG icons, maps ri-* names stored in the database
│   │   ├── nav.js                   # Header, scroll-spy, theme toggle
│   │   ├── hero.js                  # Status, headline, actions, featured project window
│   │   ├── motion.js                # Cursor spotlight, tile glow, scroll reveal
│   │   ├── background.js            # Interactive dot-field canvas (cursor glow, click ripples)
│   │   ├── work.js                  # Selected work bento and project flow diagrams
│   │   ├── experience.js            # Experience list
│   │   ├── skills.js                # Stack groups
│   │   ├── about.js                 # About, education and footer
│   │   ├── resume.js                # Resume dialog (printable)
│   │   ├── analytics.js             # Visitor analytics collector (sends to Supabase)
│   │   ├── disableInput.js          # Blocks DevTools shortcuts, right-click and selection
│   │   └── pwa.js                   # Service worker registration
│   └── json/                        # Raw snapshots of the public Supabase tables
├── docs/DESIGN.md                   # Design tokens, rules and the content data contract
├── projects/<slug>/index.html       # Generated static page per visible project
├── scripts/snapshot.mjs             # Writes assets/json from Supabase (no dependencies)
├── scripts/build-pages.mjs          # Writes projects/ and sitemap.xml from assets/json
├── index.html                       # Single-page entry point
├── sitemap.xml                      # Generated: home plus every project page
├── sw.js                            # Service worker (network-first pages and JSON)
└── CNAME
```

## How Content Loads

`assets/js/data.js` requests the seven public tables (`profile`, `social_links`, `skills`,
`skill_items`, `experience`, `projects`, `resume`) from Supabase, and at the same time reads the
matching `assets/json/*.json` snapshots:

1. The snapshot renders first, so the page is never empty.
2. When Supabase answers, every section re-renders with live data. Any table that fails falls back to its snapshot.
3. Renderers subscribe with `Site.onContent(fn)` and receive a normalised content object (see `docs/DESIGN.md`).

Everything visible on the page is editable from the dashboard, including the hero headline
(`profile.tagline`, falling back to your name), the focus chips (`profile.works_on`) and each
project's flow diagram (`projects.flow`, falling back to the tech list in `subtitle`). Visibility,
featured state and ordering follow `is_visible`, `is_featured` and `display_order`.

### Keeping the fallback fresh

`scripts/snapshot.mjs` writes the snapshots using the public anon key, and
`.github/workflows/snapshot.yml` runs it every night (and on demand from the Actions tab),
then runs `scripts/build-pages.mjs`, committing `assets/json`, `projects/` and `sitemap.xml` only
when something changed. To refresh by hand: `node scripts/snapshot.mjs && node scripts/build-pages.mjs`.

## Project Pages

Every visible project also gets its own crawlable page at `/projects/<slug>/`, written as plain
static HTML by `scripts/build-pages.mjs` (Node 22, no dependencies). The generator reads
`assets/json/projects.json`, `profile.json`, `social_links.json` and `resume.json`, and reuses the
site's own `data.js` (normalisation and slugs), `work.js` (flow diagram markup) and `icons.js`, so a
project page renders exactly what the home page tile shows.

- **Slug**: the title lowercased, every run of characters outside `a-z0-9` replaced with `-`, and
  leading/trailing `-` trimmed (`Document Automation Platform` → `document-automation-platform`).
  The dashboard database uses the same rule (`_project_slug`), so clicks and pages line up.
- **Content in the HTML**: title, description, tech chips (from `subtitle`), the "How it works" flow
  when `projects.flow` is set, the screenshot, the primary link, other projects and the footer.
- **Head**: a unique `<title>` (`<Title> — Anubhav Lal`), a meta description of at most 160
  characters (built from the title and tech when the description is empty), the canonical URL,
  Open Graph and Twitter tags using the project image, and JSON-LD (`SoftwareSourceCode` with
  `codeRepository` for GitHub links, `CreativeWork` with `url` otherwise, plus a breadcrumb).
- **Design**: the pages load the same `tokens`, `base`, `nav`, `work`, `about` and `resume`
  stylesheets with root-relative paths, the same theme bootstrap and theme toggle, and the resume dialog.
- **Housekeeping**: pages for projects that are hidden or deleted are removed, and `sitemap.xml` is
  rewritten with the home page and every project page (`lastmod` from `updated_at`). Unchanged
  inputs produce byte-identical output; the footer year comes from the build date (`BUILD_YEAR`
  overrides it).

The home page links each tile to its page with a **Details** link.

## Campaign Links

Add `?ref=<tag>` to any link you share and the dashboard groups visits by it (first touch per
session). `utm_source` and `utm_campaign` work too when `ref` is absent. Tags are lowercased and
kept to `a-z 0-9 . _ / -`, at most 64 characters.

| Where the link lives | Link |
|---|---|
| LinkedIn featured section | `https://portfolio.anubhavlal.dev/?ref=linkedin-featured` |
| Resume PDF | `https://portfolio.anubhavlal.dev/?ref=resume` |
| A GitHub README | `https://portfolio.anubhavlal.dev/projects/cerebro/?ref=github-cerebro` |
| A newsletter | `https://portfolio.anubhavlal.dev/?utm_source=newsletter&utm_campaign=october` |

The tracker sends the full `page_url`, query string included, so nothing extra is needed on the site.

## Search Console

1. In [Google Search Console](https://search.google.com/search-console) add a **Domain** property
   for `anubhavlal.dev`.
2. Copy the `google-site-verification=…` TXT record it shows, add it at the DNS provider for
   `anubhavlal.dev`, wait for it to propagate and press **Verify**.
3. Open **Sitemaps** and submit `https://portfolio.anubhavlal.dev/sitemap.xml`.
4. Use **URL inspection** on a project page (for example `/projects/cerebro/`) and request indexing
   to speed up the first crawl.

## Features

- **Responsive**: mobile-first layouts from 320px to wide desktop; the four nav links stay visible on every screen size.
- **Theme**: auto, light and dark, applied before first paint and persisted in `localStorage`.
- **Project flows**: each project's pipeline drawn from dashboard data, featured in a framed hero window.
- **Resume dialog**: native `<dialog>` with download and print.
- **Accessibility**: skip link, visible focus, labelled icon links, reduced-motion support.
- **Offline**: installable PWA with a network-first service worker.
- **Visitor analytics**: anonymous session, device and engagement metrics sent to Supabase.

### What the tracker records

`assets/js/analytics.js` records a visit only after the page has been open for 5 seconds, and
`?notrack` opts a browser out (`?track` opts back in). Once the visit is recorded it also sends:

- **Section views**: each `main section[id]` and `footer#contact` counts once per page load when it is
  at least 40% visible, or fills at least half the viewport, for one second. Each one calls
  `rpc/record_section_view` with `{ p_session_id, p_section }`. Home page ids are `home`,
  `experience`, `work`, `skills`, `about` and `contact`; project pages use `project`, `flow`, `more`
  and `contact`.
- **Link clicks** to `link_clicks`, with `click_kind` and `project_slug` when the page knows them:
  the nav Resume link is `resume_open`, the dialog's "Download PDF" is `resume_download`, links
  carrying `data-project="<slug>"` are `project_code` (GitHub) or `project_demo`, `mailto:` links are
  `email`, and LinkedIn, Instagram, X/Twitter and Medium links are `social`. Anything else, including
  GitHub links without `data-project`, is left for the database trigger to classify. Same-site links
  (Details, back links) are not recorded as clicks.

## Running Locally

Serve the folder over HTTP (opening `index.html` directly with `file://` breaks the `fetch()`
calls):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Local visits are recorded by `analytics.js` like any other visit.

## Deployment

Hosted on **GitHub Pages** at the custom domain in `CNAME`. There is no build step: pushing to
`main` publishes the site. When shell files change, bump `CACHE` in `sw.js` so returning visitors
get the new version. After editing projects in the dashboard, run `node scripts/build-pages.mjs`
(or wait for the nightly workflow) so the project pages and sitemap follow.
