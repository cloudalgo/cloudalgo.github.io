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

**Do not upgrade TypeScript to 7.** `@astrojs/check` peer-caps at `typescript ^5 || ^6`, and `npm run astro check` is the only type gate this project has. Revisit when `@astrojs/check` ships TS 7 support.

## Architecture

**Stack**: Astro 7 (static output) · React 19 · Tailwind CSS 4 · TypeScript 6, strict mode

### Two-tier layout system

All pages use `Page.astro`, which wraps `Base.astro`:

- `Base.astro` — HTML shell, `<head>` meta/OG/Twitter tags, global scroll-animation `IntersectionObserver`
- `Page.astro` — adds `<Header>` and `<Footer>` around the `<slot>`, and imports `global.css`

Every page imports `Page` (not `Base` directly) and passes `title`, `description`, `image`, `canonicalURL`.

### Component split: Astro vs React

The rule is purely interactive vs static:

- **`.astro` components** — all layout and section components (`src/components/layout/`, `src/components/sections/`), plus the `src/components/ui/` widgets whose interactivity is small enough for an inline `<script>` (`CookieConsent`, `VideoPlayer`, `BlogCard`, `ProductCard`); they own copy, structure, and static markup
- **`.tsx` React components** — only the three hydrated islands, all in `src/components/ui/`:

| Island | Mounted by | Directive |
|---|---|---|
| `ContactForm` | `src/pages/contact.astro` | `client:load` |
| `StatsCounter` | `src/components/sections/StatsBar.astro` | `client:load` |
| `ScheduleWidget` | `src/layouts/Page.astro` (site-wide) | `client:only="react"` |

Testimonials used to be a Swiper React slider; it is now static markup in `src/components/sections/Testimonials.astro`. Do not reintroduce a carousel for a single quote.

**Keep entrance animations outside the island.** `anim-fade-up` belongs on an Astro wrapper around the island, never on a node inside the React tree — `Base.astro`'s observer writes `in-view` onto it, and if React owns that node it is a hydration race. See `StatsBar.astro`.

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

### Astro 7 gotchas

Astro 7 bundles with **rolldown** instead of rollup/esbuild. Two things bite, and neither fails the build:

- **The `---` frontmatter fence must be the first bytes of a `.astro` file.** Not a blank line, not an HTML comment above it. If anything precedes it the frontmatter is parsed as markup and you get a misleading `Expected '}' but found ':'`. Put file-level notes *inside* the fence as JS comments.
- **Default-importing a CommonJS package can yield the module object instead of the export.** Rolldown emits the CJS interop in node mode, so `default` ends up bound to `module.exports` and React throws "element type is invalid" *at runtime while the build stays green*. Named imports are unaffected. Prefer a named import, or avoid the CJS dependency; `react-countup` was dropped for exactly this reason.

Because a green build no longer implies a working page, load the built site before shipping a dependency or bundler change — `npm run preview` and check the browser console, not just `npm run build`.

### Third-party integrations (all live — no placeholders left)

- **ContactForm** (`src/components/ui/ContactForm.tsx`) — posts to the HubSpot Forms API (`api.hsforms.com/submissions/v3/integration/submit/<portal>/<form>`). Portal and form IDs are real constants at the top of the file. Not Formspree.
- **Analytics** — every tracker is injected from `injectTrackers()` in `src/components/ui/CookieConsent.astro`, and **only after consent**: GA4 (`G-5WYSWY2G6Z`), the HubSpot tracking script, and Microsoft Clarity. Nothing loads from `Base.astro`.
- `Base.astro` only *emits* events (`scroll_depth`, `outbound_click`, `cta_click`) via `gtag?.(…)`. The optional call is deliberate: before consent `gtag` is undefined and the events are no-ops. Any new tracker goes in `injectTrackers()`, never in a layout.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. The `dist/` directory is the Pages artifact.
