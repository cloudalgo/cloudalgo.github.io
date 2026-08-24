# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Required skills

Invoke these at the start of any session doing work in this repository:

- **`latest-astro`** — this site is built on Astro; the skill carries current Astro 4.x–5.x API knowledge (Content Layer API, Server Islands, Actions API) that supersedes stale defaults. Note the project is on Astro **6.4.5**, ahead of the skill's coverage — verify v6-specific behaviour against the v6 docs.
- **`framer-motion`** — all page/section UI animation in this project is built with `framer-motion` (v13). Invoke before writing or editing any animated React section.

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

- **`.astro` components** — layout shell (`src/components/layout/`), pages, and any section that is purely static markup; they own copy and structure, and do data loading (`getCollection`) before passing serialized props down
- **`.tsx` React components** — the interactive UI widgets in `src/components/ui/` (`ContactForm`, `StatsCounter`, `TestimonialsSlider`) **and** the animated homepage sections in `src/components/sections/`

Homepage sections are being migrated from `.astro` to `.tsx` + framer-motion (`Services`, `WhyUs`, `ProductsSection`, `BlogPreview` so far). Both files exist side by side during the migration — check `src/pages/index.astro` for which variant is actually mounted before editing.

### UI animation: framer-motion

`framer-motion` v13 is the only animation library for React section UI. Conventions established in `src/components/sections/Services.tsx`:

- Import `{ motion, useReducedMotion, type Variants }`; declare named `Variants` objects at module scope (`headingVariants`, `cardVariants`, …) rather than inline props
- Entrance animation is `initial="hidden"` + `whileInView={reduceMotion ? undefined : 'show'}` with `viewport={{ once: true, amount: 0.2–0.4 }}` — never `animate` on mount
- **Always** gate motion on `const reduceMotion = useReducedMotion()` and pass `undefined` for the animated prop when true; this is the accessibility contract, not optional
- Stagger children via a parent container variant (`staggerChildren`), not per-child delays
- Hover affordances use `whileHover` with a short `transition={{ duration: 0.2, ease: 'easeOut' }}`
- Icons are inline JSX SVG with `stroke="currentColor"` — never `dangerouslySetInnerHTML`
- Astro-side sections keep using the CSS-only `anim-fade-up` / `anim-scale-pop` IntersectionObserver from `Base.astro`; do not mix the two systems inside one section

### Content collections (Astro content layer v2)

Defined in `src/content.config.ts` using `glob` loader (not the legacy v1 API). Two collections:

- `blog` — Markdown in `src/content/blog/`; schema requires `title`, `date`, `category` (enum: Salesforce/Heroku/MuleSoft/AWS/Product), `excerpt`, `readTime`, `published`
- `services` — Markdown in `src/content/services/`; schema requires `title`, `order`, `icon`, `excerpt`

**Critical**: dynamic route files (`[slug].astro`) use `p.id`, not `p.slug`, as the route param — this is an Astro 6 content layer change.

### Styling

Tailwind v4 is loaded via `@tailwindcss/vite` plugin (not PostCSS). All custom design tokens are declared in `src/styles/global.css` under `@theme`. Path alias `@/*` → `src/*`.

#### Color palette (monochromatic — no accent colors)

| Token | Value | Usage |
|---|---|---|
| `--ca-black` / `--ca-primary-black` | `#0A0A0A` | Primary text, borders on hover, filled buttons |
| `--ca-secondary-black` | `#5A5A5A` | Body copy, nav links, metadata, captions |
| `--ca-page-bg` / `--ca-grey2` | `#F5F5F2` | Page background, section alternates |
| `--ca-surface` / `--ca-grey` | `#FFFFFF` | Cards, modals, header surface |
| `--ca-border` | `#E0E0DC` | All card/input/divider borders |
| `--ca-orange` | `#0A0A0A` | **Deprecated alias** — maps to black; do not introduce orange |

There is **no accent/brand color**. The palette is strictly near-black, warm-off-white, and white. Do not add colors outside this set without explicit approval.

#### Typography

- **Font**: `Outfit` (Google Fonts, weights 400–900) — used for headings, body, and UI everywhere. No secondary typeface.
- **Heading scale** (desktop): h1 `5.5rem/900`, h2 `3.5rem/800`, h3 `1.375rem/700`. Letter-spacing: h1/h2 `-0.03em`, h2 `-0.02em`. Line-height `1.15`.
- **Mobile**: h1 `3rem`, h2 `2.25rem` (breakpoint `max-width: 767px`). At `max-width: 1200px` the root font-size scales to `85%`.
- **Body**: `1rem/1.7`, color `--ca-secondary-black`. Utility classes: `.paragraph-large` (1.125rem), `.paragraph-medium` (1rem), `.paragraph-small` (0.875rem).
- **Section eyebrow**: `.section-label` — `0.75rem`, `700`, `letter-spacing: 0.1em`, `text-transform: uppercase`.

#### Component conventions

- **Cards** — `border-radius: 12px`, `border: 1px solid var(--ca-border)`, white surface. Hover: border transitions to `--ca-black` (or full fill invert for service cards).
- **Buttons** — `border-radius: 100px` (pill), `font-weight: 700`. `.btn-primary` / `.btn-secondary`: black fill, white text. `.btn-outline`: transparent with black border, inverts on hover. `.btn-light`: white fill, inverts on hover.
- **Badges / tags** — black fill, white text, `border-radius: 100px`, `font-size: 0.6875rem`, uppercase.
- **Section spacing** — `.section-padding--vertical`: `6rem` top/bottom (desktop), `3.75rem` mobile (`max-width: 991px`).
- **Container max-width**: `1278px` at `≥1277px`, fluid below with standard breakpoints (540/720/960/1140px).

#### SVG illustrations (inline, in card headers)

Inline SVGs used as section illustrations follow this pattern: `viewBox="0 0 320 160"`, monochrome fills using `#0A0A0A` at varied `opacity` levels (0.15 → 0.85 for layered depth). No color fills other than black-on-light-background. Text in SVGs uses `font-family="Outfit,sans-serif"` and `letter-spacing="0.06em"`.

#### Do-nots

- No orange (`#f75a41` or similar) — the brand was redesigned; the `--ca-orange` variable intentionally maps to black.
- No `Syne` font — fully replaced by Outfit.
- No `#111111` dark section backgrounds — use `--ca-black` (`#0A0A0A`) or the footer CTA's `#2a2a2a` for near-black surfaces.
- Do not use inline Tailwind utility colors (e.g., `text-red-500`) — always use CSS vars from the palette above.

### Scroll animations

`Base.astro` registers a single `IntersectionObserver` that adds `.in-view` to any element with class `anim-fade-up` or `anim-scale-pop`. Transitions are CSS-only and respect `prefers-reduced-motion`.

### Open configuration items

- **ContactForm** (`src/components/ui/ContactForm.tsx`): Formspree endpoint contains placeholder `YOUR_FORM_ID` — replace with real form ID before going live
- **Google Analytics** (`src/layouts/Base.astro`): GA4 snippet is commented out with placeholder `GA_MEASUREMENT_ID`

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. The `dist/` directory is the Pages artifact.
