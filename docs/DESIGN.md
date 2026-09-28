# Design: "Agent trace"

The page reads like a well-drawn system diagram of an AI engineer's work. Content sits on rules and connectors, not on a grid of identical cards. Every piece of visible content comes from Supabase (edited in the portfolio-data dashboard), with `assets/json/*.json` as the offline fallback.

## Tokens

All colour, type, spacing, radius and motion values are custom properties in `assets/css/tokens.css`. Components never use raw hex values.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#eef1f4` | `#0f1a2b` | page background |
| `--surface` | `#f7f9fb` | `#142238` | raised surfaces (featured project, dialog, nodes) |
| `--ink` | `#14213d` | `#e4e9f0` | text |
| `--slate` | `#56657c` | `#93a1b5` | secondary text |
| `--rule` / `--rule-strong` | `#c9d2dd` / `#9aa8ba` | `#24344c` / `#3a4e6b` | edges, borders, connectors |
| `--trace` | `#c98a1b` | `#f2b233` | the active path, strokes, focus ring: the only accent |
| `--trace-ink` | `#8a5a00` | `#f2b233` | accent used as text (AA on paper) |

The theme is `html[data-theme="light"|"dark"]`, resolved before first paint from `localStorage["selected-theme"]` (`auto` / `light` / `dark`), with `data-theme-mode` holding the preference.

Type: **Bricolage Grotesque** for display (headings, the hero, node labels at large sizes) and **IBM Plex Sans** for body (17px, line-height 1.6, lines under 68ch). The scale runs from `--step--1` to `--step-4`.

Radius follows hierarchy: `--radius-s` 4px for chips, `--radius-m` 10px for nodes and controls, `--radius-l` 16px for the featured project and dialog, and pills for buttons.

## Rules

- There is one bold moment: the hero pipeline draws itself once on first render. Nothing else animates on its own. No fade-up on each section, and no hover lift on every card.
- Connectors mean something. They link steps of a flow or the jobs in the experience sequence, never decoration.
- Avoid these generated-page tells: all-caps eyebrow labels, monospace data labels, one accented word in a headline, `A · B · C` meta strings, arrows appended to link text, identical rounded cards with the same soft shadow, and gradient washes.
- Layout is left-aligned and mobile-first. There is no horizontal scroll from 320px up.
- Quality floor: 44px touch targets, visible focus (`--trace` outline), `prefers-reduced-motion` respected, AA contrast, icon-only links carry `aria-label` (analytics reads it too), and images declare width and height.
- No comments in source files.

## Data contract

`assets/js/data.js` exposes `Site.onContent(fn)`. It calls `fn(content)` once with fallback JSON, then again with live Supabase data, so renderers must be idempotent: replace the container contents and run one-time effects only on the first call. `Site.esc()` escapes all interpolated text, and `Site.icon(name)` returns an inline SVG for `ri-*` names or built-in keys.

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

`profile.tagline` and `projects.flow` are new dashboard fields. The tagline falls back to `profile.title`. `flow` is `[["step"], ["branch a", "branch b"], ["step"]]` or null; when it's null, the project shows its `tech` chain instead.

## Files

Each section owns one CSS file and one JS file (`nav`, `hero`, `graph`, `work`, `experience`, `skills`, `about`, `resume`) plus its mount points in `index.html`.
