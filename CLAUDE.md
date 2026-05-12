# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server at localhost:4321
npm run build     # production build to ./dist/
npm run preview   # preview the production build locally
npm run astro check  # TypeScript / Astro type-checking (no separate test suite)
```

Node ≥ 22.12.0 is required (enforced in CI via `node-version: 22`).

## Architecture

**Stack**: Astro 6 (static output) · React 19 · Tailwind CSS 4 · TypeScript strict mode

### Two-tier layout system

All pages use `Page.astro`, which wraps `Base.astro`:

- `Base.astro` — HTML shell, `<head>` meta/OG/Twitter tags, global scroll-animation `IntersectionObserver`
- `Page.astro` — adds `<Header>` and `<Footer>` around the `<slot>`, and imports `global.css`

Every page imports `Page` (not `Base` directly) and passes `title`, `description`, `image`, `canonicalURL`.

### Component split: Astro vs React

The rule is purely interactive vs static:

- **`.astro` components** — all layout and section components (`src/components/layout/`, `src/components/sections/`); they own copy, structure, and static markup
- **`.tsx` React components** — only the three interactive UI widgets in `src/components/ui/`: `ContactForm`, `StatsCounter`, `TestimonialsSlider`

### Content collections (Astro content layer v2)

Defined in `src/content.config.ts` using `glob` loader (not the legacy v1 API). Two collections:

- `blog` — Markdown in `src/content/blog/`; schema requires `title`, `date`, `category` (enum: Salesforce/Heroku/MuleSoft/AWS/Product), `excerpt`, `readTime`, `published`
- `services` — Markdown in `src/content/services/`; schema requires `title`, `order`, `icon`, `excerpt`

**Critical**: dynamic route files (`[slug].astro`) use `p.id`, not `p.slug`, as the route param — this is an Astro 6 content layer change.

### Styling

Tailwind v4 is loaded via `@tailwindcss/vite` plugin (not PostCSS). All custom design tokens are declared in `src/styles/global.css` under `@theme`:

- Primary: `#f75a41` / dark: `#d94e37`
- Backgrounds: `#111111` (dark sections), `#f9f9f9` (off-white), `#ffffff` (white)
- Display font: **Syne** (headings/titles, loaded from Google Fonts); body font: system-ui
- Path alias `@/*` → `src/*`

### Scroll animations

`Base.astro` registers a single `IntersectionObserver` that adds `.in-view` to any element with class `anim-fade-up` or `anim-scale-pop`. Transitions are CSS-only and respect `prefers-reduced-motion`.

### Open configuration items

- **ContactForm** (`src/components/ui/ContactForm.tsx`): Formspree endpoint contains placeholder `YOUR_FORM_ID` — replace with real form ID before going live
- **Google Analytics** (`src/layouts/Base.astro`): GA4 snippet is commented out with placeholder `GA_MEASUREMENT_ID`

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. The `dist/` directory is the Pages artifact.
