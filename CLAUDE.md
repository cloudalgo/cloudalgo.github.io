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

**Stack**: Astro 7 (static output) · React 19 · Sass · TypeScript 6, strict mode

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

Defined in `src/content.config.ts` using `glob` loader (not the legacy v1 API). Three collections:

- `blog` — Markdown in `src/content/blog/`; requires `title`, `date`, `category` (enum: Salesforce/Heroku/MuleSoft/AWS/Product), `excerpt`, `readTime`, `published`
- `services` — Markdown in `src/content/services/`; requires `title`, `shortTitle`, `order`, `icon`, `excerpt`, and at most one of `proves` / `provenBy`
- `products` — Markdown in `src/content/products/`; requires `title`, `status`, `type`, `tagline`, `excerpt`, `icon`, `order`, `features`, `published`

Case studies are **not** a collection — they are typed records in `src/data/case-studies.ts`, because each one carries about forty fields of page furniture that no markdown body wants to hold.

**Critical**: dynamic route files (`[slug].astro`) use `p.id`, not `p.slug`, as the route param — this is an Astro 6 content layer change.

#### What a `<title>` and a `<meta description>` are allowed to be

A search result shows roughly **60 characters of title** and **160 of description**. The on-page copy is not written to that budget and should not be — a standfirst is written to be read. So where the two diverge, the page states the search version separately and the template prefers it:

- `blog` — optional `seoTitle` / `seoDescription` frontmatter. Absent, the headline and the `excerpt` are used as they stand, which is right for most entries. `blog/[slug].astro` appends `— CloudAlgo Journal` only when the headline leaves room for it.
- `products` — optional `seoTitle` frontmatter; `excerpt` is meta-only (nothing renders it) so it is written to the budget directly.
- `services` — `excerpt` is meta-only too. `services/[slug].astro` appends the brand only when title + engagement shape leave room.
- Case studies — `seoTitle` is required on every record; `summary` is the meta description and renders nowhere, while `headline` stays the JSON-LD headline and `detailTitle` the H1.

Never widen a title by pasting a full sentence into a template. That is how five case studies came to ship titles of 116–192 characters.

#### Structured data

`src/data/schema.ts` holds the entity facts once. Every page emits `organization` plus a `breadcrumbs(crumbs, url)` built from **the same array the masthead renders**, and refers to the org elsewhere by `orgRef` (`@id`) rather than restating it. Build page URLs with `abs('/path/')` — trailing slash included, since the site is served as directories. Do not hand-roll an `Organization` node in a page.

### Styling

**There is no Tailwind.** It was removed along with `src/styles/global.css`; the
stylesheet is Sass, entered at `src/styles/main.scss`, which `@use`s every
partial. **Load order in that file IS the cascade** — several later rules
deliberately override earlier ones (`base/_a11y.scss` is last on purpose so its
focus rings beat any earlier `outline: none`). Reorder with care. Path alias
`@/*` → `src/*`.

#### The token contract

Three layers, each resolving against the one above it:

| Layer | File | Holds |
|---|---|---|
| Primitive | `src/styles/themes/_press-room.scss` | Every literal colour, family and scale value |
| Semantic | `src/styles/tokens/_semantic.scss` | Role names — `--font-heading`, `--text-body`, … |
| Component | `src/styles/tokens/_components.scss` | Per-component knobs — `--card-radius`, `--stat-num-family`, … |

**Nothing outside `tokens/` and `themes/` may name a colour.** That is the whole
point: the active skin is chosen by one `@use` line in `main.scss`, and swapping
it reskins every surface, rule, border, shadow, scrim and SVG glyph.
`themes/_contract.scss` lists the token names a theme is required to define — a
new skin that misses one fails there rather than silently rendering wrong.

Two themes exist. **`press-room` is live** (Paper and Ember). `_monochrome.scss`
is the dormant former skin — the black-and-off-white palette this file used to
document. Do not treat it as current.

#### Colour palette (press-room — Paper and Ember)

Warm off-white stock, neutral near-black ink, and the logo's ember carrying the
accent. Values are primitives; **reference them through their semantic token, not
by name**.

| Token | Value | Usage |
|---|---|---|
| `ink-900` | `#131110` | Headings, filled buttons, hover borders |
| `ink-860` | `#231F1D` | Long-form prose |
| `ink-500` | `#494440` | Body copy |
| `ink-400` / `ink-300` | `#57504B` / `#6C645E` | Captions, card metadata |
| `paper-100` | `#F7F4F2` | Page background |
| `paper-000` | `#FFFFFF` | Cards, modals, header |
| `paper-200` | `#E0D9D4` | Borders, dividers, inputs |
| `accent-500` | `#F75A41` | **Brand ember** — fills, band, borders |
| `accent-600` | `#E9553D` | Ember hover |
| `accent-on` | `#110605` | Ink on ember |

Every ink and paper token carries its measured contrast ratio in a trailing
comment. Those numbers are load-bearing — if you retune a value, re-measure it.

#### Typography

- **Families** — `Archivo` (display/headings, weights 600–900), `Geist`
  (body/UI, 400–900), `Geist Mono` (400–500). Reached through `--font-heading`,
  `--font-body`, `--font-mono`. There is no `Outfit` and no `Syne`.
- **Changing a family takes two edits.** The families are theme tokens, but the
  webfont `<link>` lives in `src/layouts/Base.astro` — a theme swap that changes
  type is only half a change until the `<head>` moves with it.
- **Four monospaces are deliberately not `--font-mono`**, and each has a
  documented reason in `_semantic.scss`: `--font-mono-code` (JetBrains Mono, blog
  code blocks), `--font-mono-spec` (SF Mono, product spec rows),
  `--font-mono-spec-bare`, `--font-mono-typewriter` (Courier, diff gutters in
  blog art). Do not "unify" them.
- **Heading scale** (desktop): h1 `5.5rem/900`, h2 `3.5rem/800`, h3
  `1.375rem/700`. Letter-spacing h1 `-0.03em`, h2 `-0.02em`. Line-height `1.15`.
- **Mobile**: h1 `3rem`, h2 `2.25rem` (`max-width: 767px`). At `max-width:
  1200px` the root font-size scales to `85%`.
- **Section eyebrow**: `.section-label` — `0.75rem`, `700`,
  `letter-spacing: 0.1em`, uppercase.

#### Component conventions

- **Cards** — driven by `--card-radius` / `--card-border` / `--card-border-width`
  in `tokens/_components.scss`, with modifier classes (`.card--radius-xl`) rather
  than per-card literals. The table at the top of `components/_card.scss` is the
  index of which class means which radius and padding.
- **Buttons** — `border-radius: 100px` (pill), `font-weight: 700`.
  `.btn-primary` / `.btn-secondary` / `.btn-outline` / `.btn-light` all still
  exist.
- **Container max-width**: `var(--container-max)` at `≥1277px`, fluid below with
  breakpoints 540/720/960/1140px.

#### Do-nots

- **Do not name a colour outside `themes/` or `tokens/`.** No hex literals, no
  `rgb()`, in a component partial or an `.astro` file.
- **Orange is the brand again.** `#F75A41` is `accent-500`. Earlier revisions of
  this file banned it after a monochrome redesign; that redesign is now the
  dormant `_monochrome` theme. Do not strip the ember.
- No `Outfit`, no `Syne` — replaced by Archivo and Geist.
- No `--ca-*` variables — that generation of tokens is gone.
- No Tailwind utility classes (`text-red-500`, `flex`, …). Tailwind is not
  installed; those class names do nothing.
### Scroll animations

`Base.astro` registers a single `IntersectionObserver` that adds `.in-view` to any element with class `anim-fade-up` or `anim-scale-pop`. Transitions are CSS-only and respect `prefers-reduced-motion`.

### Astro 7 gotchas

Astro 7 bundles with **rolldown** instead of rollup/esbuild. Two things bite, and neither fails the build:

- **The `---` frontmatter fence must be the first bytes of a `.astro` file.** Not a blank line, not an HTML comment above it. If anything precedes it the frontmatter is parsed as markup and you get a misleading `Expected '}' but found ':'`. Put file-level notes *inside* the fence as JS comments.
- **Default-importing a CommonJS package can yield the module object instead of the export.** Rolldown emits the CJS interop in node mode, so `default` ends up bound to `module.exports` and React throws "element type is invalid" *at runtime while the build stays green*. Named imports are unaffected. Prefer a named import, or avoid the CJS dependency; `react-countup` was dropped for exactly this reason.

Because a green build no longer implies a working page, load the built site before shipping a dependency or bundler change — `npm run preview` and check the browser console, not just `npm run build`.

**Markdown runs on Sätteri, not unified.** `markdown.remarkPlugins`, `markdown.rehypePlugins` and `markdown.remarkRehype` now need `@astrojs/markdown-remark` installed and fail the build without it. The native path is `markdown: { processor: satteri({ hastPlugins: [...] }) }` from `@astrojs/markdown-satteri`, with plugins built by `defineHastPlugin` / `defineMdastPlugin` from `satteri`. `astro.config.mjs` has one: `satteriFigures` turns a lone captioned `<img>` in a paragraph into a `<figure>` + `<figcaption>`, moving the alt rather than copying it.

### Third-party integrations (all live — no placeholders left)

- **ContactForm** (`src/components/ui/ContactForm.tsx`) — posts to the HubSpot Forms API (`api.hsforms.com/submissions/v3/integration/submit/<portal>/<form>`). Portal and form IDs are real constants at the top of the file. Not Formspree.
- **Analytics** — every tracker is injected from `injectTrackers()` in `src/components/ui/CookieConsent.astro`, and **only after consent**: GA4 (`G-5WYSWY2G6Z`), the HubSpot tracking script, and Microsoft Clarity. Nothing loads from `Base.astro`.
- `Base.astro` only *emits* events (`scroll_depth`, `outbound_click`, `cta_click`) via `gtag?.(…)`. The optional call is deliberate: before consent `gtag` is undefined and the events are no-ops. Any new tracker goes in `injectTrackers()`, never in a layout.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. The `dist/` directory is the Pages artifact.
