# Design system (v2)

The look is dark-first and product-grade, in the tradition of Linear, Vercel and Raycast, with a recruiter-friendly structure: identity, stack and contact on the first screen, then selected work, experience, stack, about and contact. All visible content comes from Supabase (edited in the portfolio-data dashboard), with `assets/json/*.json` as the offline fallback.

## Tokens

Every value lives in `assets/css/tokens.css`. Components use tokens only, never raw hex values.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` / `--bg-subtle` | `#08090b` / `#0b0c0f` | `#fafafa` / `#f4f4f5` | page and inset backgrounds |
| `--surface` / `--elevated` | `#0e0f12` / `#15171b` | `#ffffff` / `#f4f4f5` | tiles, cards, hover fills |
| `--text` / `--muted` / `--faint` | `#ededef` / `#8a8f98` / `#7b8089` | `#0a0a0b` / `#5f6368` / `#6b7078` | text tiers (all AA on their backgrounds) |
| `--border` / `--border-strong` | white 7% / 12% | black 8% / 14% | hairlines and hovered borders |
| `--accent` / `--accent-text` | `#6b8cff` / `#8ea6ff` | `#3b5bdb` / `#3451c9` | the one accent: focus, badges, glow, run checks |
| `--success` | `#3fcf8e` | `#1f9d55` | status dot and the "Current" badge |

Surfaces carry a 1px inset top highlight (`--highlight`) and layered shadows (`--shadow-sm/md/lg`). Elevation comes from lighter surfaces, not heavy shadows.

Type: **Geist** for everything and **Geist Mono** for small technical labels (chips, dates, window titles). Headings are weight 600 with tight tracking (`--tracking-tight` is -0.035em). The hero runs 42px on mobile to 72px on desktop.

Layout: a 1200px container, `--gutter` of 16–32px, `--section-y` of 48–72px. Radius follows nesting: pills for buttons and chips, 16px tiles, 20px window and contact panel, and an inner radius equal to the outer radius minus the padding.

## Rules

- **Motion** is short and purposeful. Scroll reveals run once (12px, 500ms, staggered), the hero run card ticks through its steps once, tiles lift 2px on hover with a cursor-following glow, and a faint page spotlight follows the pointer. `background.js` draws a fixed dot field: dots within about 210px of the cursor brighten towards `--accent` and ease away from it, and a click or tap sends a ripple through the grid. It animates only while the pointer moves or a ripple runs, and goes static when the tab is hidden. All of it is disabled under `prefers-reduced-motion`.
- **Mobile is calm, not a squeezed desktop.** The hero drops the focus chips, location and project window below 1024px. Tiles clamp descriptions to four lines and show at most four chips. Experience shows one highlight per role, and About shows one paragraph until expanded.
- **Accessibility:** 44px touch targets, visible `:focus-visible` rings, a skip link, labelled icon links (analytics reads `aria-label`), and AA contrast in both themes.
- **Avoid:** skill-level bars, particle backgrounds, three or more typefaces, 700–800 weight display type, and gradient washes as decoration.
- **No comments in source files.**

## Data contract

`assets/js/data.js` exposes `Site.onContent(fn)`, called once with fallback JSON and again with live data, so renderers must be idempotent. Use `Site.esc()` for every interpolated string. `Site.icon(name)` returns inline SVG for `ri-*` names.

```
content.profile     { name, title, tagline, lede, summary[], worksOn[] }
content.socials     [{ name, url, icon }]
content.skills      [{ title, icon, items: [{ name, level, rank 1-3, image }] }]
content.experience  [{ role, company, start, end, current, highlights[] }]   dashboard order
content.projects    [{ title, subtitle, tech[], description, image, link, linkText, featured, flow }]
content.education   [{ degree, institution, start, end, detail }]
content.contact     { email, location, resumeLink }
content.resume      raw resume row (JSONB sections)
```

The hero headline is `profile.tagline` when it differs from the title; otherwise it's the name. The hero run card lists the featured project's `flow` steps, or its tech list when `flow` is null.

## Files

Each area owns one CSS file and one JS file: `nav`, `hero`, `work`, `experience`, `skills` (Stack), `about` (About and the contact footer) and `resume`. `motion.js` holds the spotlight, the tile glow and the scroll reveal.
