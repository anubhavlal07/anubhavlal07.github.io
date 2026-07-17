# Portfolio

Welcome to my personal portfolio repository. As a professional software developer, this site showcases my technical skills, key projects, and career achievements. It serves as a central hub for employers and collaborators to review my work and learn more about my background in software development.

The portfolio is structured for clarity and ease of navigation, allowing visitors to quickly find information about my experience, technologies I work with, and notable accomplishments. I keep this repository updated with my latest projects and milestones to reflect my ongoing growth in the field.

## Visit

[https://portfolio.anubhavlal.dev/](https://portfolio.anubhavlal.dev/) (also served at [anubhavlal07.github.io](https://anubhavlal07.github.io/))

Explore my portfolio for a comprehensive overview of my software development expertise, project highlights, and professional journey.

## Tech Stack

A **static, dependency-free site** — plain HTML, CSS, and JavaScript with no build step, bundler, or framework. Content is served dynamically from a **Supabase** (PostgreSQL) backend, with local JSON files as an offline fallback.

- **HTML5 / CSS3** — semantic markup; custom properties, Flexbox, and CSS Grid.
- **Vanilla JavaScript (ES6+)** — Fetch API, no framework.
- **Supabase** — content (profile, skills, experience, projects, resume) and visitor analytics, read via a tiny hand-rolled REST client (`assets/js/supabaseClient.js`).
- **Swiper.js** — touch project carousel.
- **ScrollReveal.js** — scroll animations.
- **RemixIcons** — icon system (via CDN).

## Project Structure

```
anubhavlal07.github.io/
├── assets/
│   ├── css/
│   │   ├── styles.css              # Main stylesheet (CSS variables, dark/light theme)
│   │   └── swiper-bundle.min.css   # Swiper styles (vendored)
│   ├── img/                        # Images (profile, project thumbnails, skill icons, shapes)
│   ├── js/
│   │   ├── supabaseClient.js       # Minimal Supabase REST client (defines global `supabase`)
│   │   ├── loadProfile.js          # Loads summary / works-on / social links
│   │   ├── loadSkills.js           # Loads skill categories + items
│   │   ├── loadExperience.js       # Loads work experience
│   │   ├── loadProjects.js         # Loads projects (Swiper carousel)
│   │   ├── resumeModal.js          # Resume modal open/close + data loading
│   │   ├── quotes.js               # Daily "quote of the day" (cached in localStorage)
│   │   ├── main.js                 # Menu, scroll-spy, theme toggle, ScrollReveal, footer
│   │   ├── analytics.js            # Visitor analytics collector (sends to Supabase)
│   │   ├── disableInput.js         # Disables DevTools shortcuts / right-click / selection
│   │   ├── scrollreveal.min.js     # ScrollReveal library (vendored)
│   │   └── swiper-bundle.min.js    # Swiper library (vendored)
│   └── json/                       # Offline fallback data, mirrors the Supabase tables
│       ├── profile.json
│       ├── skills.json
│       ├── experience.json
│       ├── projects.json
│       └── resume.json
├── index.html                      # Single-page entry point
├── CNAME                           # Custom domain for GitHub Pages
└── README.md
```

## How Content Loads

Each section (`profile`, `skills`, `experience`, `projects`, and the resume modal) uses an
**optimistic dual-source pattern**:

1. Fire a request to **Supabase** immediately.
2. If Supabase hasn't responded within ~1 second, render from the matching
   `assets/json/*.json` fallback so the page is never empty.
3. When Supabase data arrives — even after the fallback rendered — **re-render** with the live data.

Because of this, the JSON files are a mirror of the Supabase tables and are kept schema-compatible
as an offline/degraded-mode fallback. Supabase columns use `snake_case` while the JSON files use
`camelCase`; the render functions handle both shapes.

## Features

- **Responsive design** — mobile, tablet, and desktop layouts via CSS media queries.
- **Dynamic content** — profile, skills, experience, projects, and resume all load at runtime.
- **Dark / light theme** — toggle persisted in `localStorage`.
- **Project carousel** — touch-friendly Swiper slider.
- **Resume modal** — pop-up resume view with a download link.
- **Scroll animations** — via ScrollReveal.
- **Quote of the day** — fetched daily and cached.
- **Visitor analytics** — anonymous session, device, and engagement metrics sent to Supabase.

## Running Locally

Serve the folder over HTTP (opening `index.html` directly with `file://` breaks the `fetch()`
calls the loaders rely on):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Hosted on **GitHub Pages** at the custom domain in `CNAME`. There is no build step — pushing to
`main` publishes the site.
</content>
