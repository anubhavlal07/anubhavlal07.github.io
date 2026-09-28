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
│   │   ├── nav.js                   # Header, mobile menu, scroll-spy, theme toggle
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
├── scripts/snapshot.mjs             # Writes assets/json from Supabase (no dependencies)
├── index.html                       # Single-page entry point
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
committing only when content changed. To refresh by hand: `node scripts/snapshot.mjs`.

## Features

- **Responsive**: mobile-first layouts from 320px to wide desktop, with a full-screen mobile menu.
- **Theme**: auto, light and dark, applied before first paint and persisted in `localStorage`.
- **Project flows**: each project's pipeline drawn from dashboard data, featured in a framed hero window.
- **Resume dialog**: native `<dialog>` with download and print.
- **Accessibility**: skip link, visible focus, labelled icon links, reduced-motion support.
- **Offline**: installable PWA with a network-first service worker.
- **Visitor analytics**: anonymous session, device and engagement metrics sent to Supabase.

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
get the new version.
