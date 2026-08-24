# Homepage React + Framer-Motion Rewrite Design Spec

**Date:** 2026-08-24
**Status:** Approved

## Overview

Convert five homepage sections — `Hero`, `Services`, `WhyUs`, `ProductsSection`, `BlogPreview` — from static `.astro` components into React (`.tsx`) components, so their icons and entrance animations can be driven by `framer-motion` instead of the current CSS `IntersectionObserver`/`stroke-dasharray` techniques. This is a deliberate, explicit override of CLAUDE.md's **Critical** "Component split: Astro vs React" rule (previously: React limited to exactly `ContactForm`, `StatsCounter`, `TestimonialsSlider`), requested and confirmed by the project owner.

`StatsBar` and `Testimonials` are already React (`StatsCounter.tsx`, `TestimonialsSlider.tsx`) and are unaffected. `Header`, `Footer`, and all non-homepage pages/sections remain `.astro` and keep using the existing CSS scroll-animation system — this rewrite is scoped to the homepage's five sections only.

---

## Decisions Made

| Question | Decision |
|---|---|
| Scope | Hero, Services, WhyUs, ProductsSection, BlogPreview only — not Header/Footer/other pages |
| Icon animation approach | framer-motion (`pathLength` draw-in, `whileInView` stagger, `whileHover`) |
| React vs. wrapper-only | Full section rewrite to `.tsx` (Approach B), not a reusable `IconMotion` wrapper around otherwise-static `.astro` sections |
| Data fetching | Stays in `.astro` frontmatter (`getCollection`) — `index.astro` fetches `products`/`blog` and passes results as props; React components never call `getCollection` directly |
| Hydration | `client:load` for `Hero` (above the fold); `client:visible` for `Services`, `WhyUs`, `ProductsSection`, `BlogPreview` |
| Styling | Preserve existing visual design exactly — same class names, same inline styles/tokens, same markup structure, translated to JSX. No changes to `global.css` |
| Scroll-animation ownership | These 5 sections stop using `Base.astro`'s `anim-fade-up`/`anim-scale-pop` IntersectionObserver classes; framer-motion's `whileInView` takes over entrance animation for them specifically. Other sections/pages keep the CSS system unchanged |
| Hero illustration | Existing inline SVG hub-and-spoke illustration is ported into `Hero.tsx` and re-implemented with framer-motion `pathLength` draw-in (replacing the CSS `stroke-dasharray` keyframe technique), not replaced with a raster image. The existing mouse/scroll parallax script is reimplemented as a `useEffect` in the component |
| CLAUDE.md | The "Component split: Astro vs React" section is rewritten to document the new rule for these 5 files, explicitly noting it's an intentional exception, not a reversion of the general Astro-first convention |

---

## Site Design Constraints

Unchanged from the existing design system in `src/styles/global.css` — the rewrite must reproduce these exactly, not reinterpret them:

- **Font:** Outfit (400–900), no secondary typeface
- **Colors:** `#0A0A0A` (black/primary text), `#5A5A5A` (secondary text), `#F5F5F2` (page bg), `#FFFFFF` (surface), `#E0E0DC` (border) — no accent color, no orange
- **Headings:** h2 `clamp(2rem,3.5–4vw,2.75–3.5rem)`, weight 800, `letter-spacing:-0.02em` — exact clamp values per section already set in each current `.astro` file and must carry over unchanged
- **Section label:** `0.75rem`, `700`, `letter-spacing:0.1em`, uppercase
- **Buttons:** pill (`border-radius:100px`), `.btn-outline` (transparent, black border, inverts on hover)
- **Cards:** `border-radius:12px`, `1px solid var(--ca-border)`, white surface, border→black on hover
- **Dark sections** (`ProductsSection`): `#0A0A0A` bg, white text at reduced opacity, `rgba(255,255,255,0.06)` card surfaces
- **Section padding:** `6rem` desktop / `3.75rem` mobile (`.section-padding--vertical` or equivalent inline values already present per section)

---

## Data Flow

- `src/pages/index.astro` keeps its `<Page>` wrapper, JSON-LD `schema`, and imports.
- `ProductsSection` and `BlogPreview` currently call `getCollection('products'|'blog', ...)` in their own `.astro` frontmatter. Since React components cannot call `getCollection`, this fetching moves up into `index.astro`'s frontmatter:
  ```ts
  const allProducts = (await getCollection('products', ({ data }) => data.published))
    .sort((a, b) => a.data.order - b.data.order);
  const posts = (await getCollection('blog', ({ data }) => data.published))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 3);
  ```
- These are passed as plain serializable props: `<ProductsSection client:visible products={allProducts} />`, `<BlogPreview client:visible posts={posts} />`. Astro serializes content-collection entries (title/excerpt/date/etc.) to JSON automatically for island props; `post.data.date` (a `Date`) is converted to an ISO string prop (`date={post.data.date.toISOString()}`) since `Date` objects don't survive serialization — `BlogCard`'s date-formatting logic moves into `BlogPreview.tsx` (or a small shared date-format helper) operating on the ISO string.
- `ProductCard.astro` and `BlogCard.astro` (currently `.astro` components used by these sections) are reimplemented as plain (non-animated, no motion needed at the card-content level beyond the parent's stagger) JSX markup inside the new `.tsx` files, or extracted as small internal sub-components within the same file — no new top-level `.astro` or `.tsx` files beyond the 5 sections, since these cards aren't reused elsewhere on the homepage. (`ProductCard.astro`/`BlogCard.astro` themselves are untouched — they're still used by `/products` and `/blog` listing pages — the homepage sections just stop calling them and inline equivalent JSX.)
- `Services` and `WhyUs` keep their hardcoded data arrays (`services`, `items`) — these move from `.astro` frontmatter (`---`) into plain JS consts at the top of the `.tsx` file, unchanged in content.

---

## Component Design

### `Hero.tsx`
- `client:load`.
- Ports the existing hub-and-spoke inline SVG (`viewBox="0 0 520 440"`) verbatim in JSX form.
- Each `.draw-stroke` element (orbit ellipse, spokes, cloud path, node icons, badges) becomes a `motion.path`/`motion.circle`/etc. with `initial={{ pathLength: 0 }}`, `animate={{ pathLength: 1 }}`, and the same per-element `delay` values currently expressed as CSS `animation-delay` (0.1s–1.45s), preserving the existing stagger choreography.
- Headline/subhead/CTA text: wrapped in a `motion.div` with `variants` + `staggerChildren`, replacing the current fade-up CSS classes, matching existing copy and structure exactly.
- Mouse/scroll parallax: the current vanilla-JS `<script>` block (reads mouse position / scroll offset, applies transforms to decorative elements) is reimplemented as a `useEffect` hook attaching the same `mousemove`/`scroll` listeners on mount and cleaning them up on unmount. Logic and effect (magnitude, easing) stays the same — only the wiring changes from a `<script>` tag to a hook.

### `Services.tsx`
- `client:visible`.
- 3-card grid; each card's icon (`s.icon`, currently raw SVG strings) becomes an inline JSX SVG (not `set:html`) so its `<path>`/`<circle>` elements can be individually targeted by framer-motion (`pathLength` draw or a subtle scale/opacity `whileHover` on the icon).
- Card entrance: `motion.div` per card with `whileInView` + staggered `transition.delay` (replacing `anim-scale-pop` + inline `transition-delay`), same 0.1s stagger step.
- Icon hover: `whileHover={{ scale: 1.08 }}` (or similar restrained micro-interaction) on the icon wrapper — new behavior enabled by the React conversion, kept subtle per the monochrome/no-flash design language.

### `WhyUs.tsx`
- `client:visible`.
- No icons currently (numbered cards `01–04`) — motion applies to entrance only: each `.why-card` becomes `motion.div` with `whileInView` + stagger (replacing `anim-fade-up` + inline delay), same 0.08s step and 0.1s base offset.

### `ProductsSection.tsx`
- `client:visible`.
- Receives `products` (serialized collection entries) as a prop from `index.astro`.
- Reimplements the product card markup inline (dark surface, status badge, title, excerpt) since it can no longer import `ProductCard.astro`.
- Entrance: `motion.div` grid items with `whileInView` + stagger (replacing `anim-scale-pop`), same values.
- No SVG icons in this section today — no new icon-motion surface here beyond entrance animation, unless product data supplies an icon (current schema has `icon` as an emoji/string field — rendered as plain text, no motion needed).

### `BlogPreview.tsx`
- `client:visible`.
- Receives `posts` (serialized, with `date` as ISO string) as a prop.
- Reimplements card markup inline (title, excerpt, category, formatted date, read time) since it can no longer import `BlogCard.astro`.
- Entrance: `motion.div` per card with `whileInView` + stagger (replacing `anim-scale-pop`), same values.

### Shared conventions across all 5
- All `motion` variants are typed with `Variants` from `framer-motion`, matching the existing pattern in `StatsCounter.tsx`/`TestimonialsSlider.tsx`.
- `viewport={{ once: true, margin: "-100px" }}` (or equivalent) on `whileInView` triggers, so animations fire once per page load, consistent with the current IntersectionObserver's one-shot `.in-view` behavior.
- `prefers-reduced-motion` is respected: use framer-motion's `useReducedMotion()` hook to skip/shorten transforms, matching the existing CSS reduced-motion guard's intent.
- Decorative parallax `<div data-parallax="...">` elements in `Services`/`WhyUs`/`ProductsSection`/`BlogPreview` are driven by a separate global script in `Base.astro` (not the per-element scroll animation system) — confirm during implementation whether that script selects elements by `data-parallax` attribute globally (in which case it keeps working unchanged against the ported JSX) or is scoped in a way that breaks under React islands; call out any needed adjustment in the implementation plan rather than assuming.

---

## Error Handling

- No new runtime error surfaces are introduced — these are presentational components with no data mutation, network calls, or user input. `products`/`posts` props are always arrays (possibly empty if a collection has zero published entries); each `.map()` over them already renders zero cards gracefully with no additional guard needed.
- TypeScript strict mode: prop types for `ProductsSection`/`BlogPreview` are explicit interfaces (e.g. `{ products: ProductEntry[] }`) matching the shape actually serialized across the Astro-island boundary, not the raw `CollectionEntry<'products'>` type (which includes non-serializable fields) — verified via `npx astro check` after implementation.

---

## Testing / Verification Plan

1. `npx astro check` — must pass with zero errors after all 5 conversions.
2. `npm run build` — production build must succeed (validates island serialization of `products`/`posts` props).
3. `npm run dev` + browser check (chrome-devtools MCP): visually compare each of the 5 sections against the current production look at desktop and mobile widths — spacing, colors, type scale must be pixel-equivalent to today.
4. Confirm entrance animations fire once on scroll into view (no repeat-replay on scroll up/down), and icon hover/draw-in animations behave as designed.
5. Confirm `prefers-reduced-motion: reduce` (via devtools emulation) suppresses/shortens motion as it does today under the CSS system.
6. Confirm Hero's mouse-parallax and scroll-parallax still work identically to the current `<script>`-based implementation.
7. Lighthouse/perf spot-check: `client:load` on Hero plus 4× `client:visible` islands adds client JS (framer-motion bundle) that didn't exist on this page before — acceptable per the trade-off below, but confirm no major regression in initial load metrics.

---

## Trade-offs (accepted)

- **More client-side JS** on the homepage (framer-motion + 5 React islands vs. previously almost-zero JS for these sections). Accepted because the user explicitly prioritized richer icon/entrance animation over minimizing JS payload for this page.
- **Astro/React architecture rule exception**: CLAUDE.md's Critical 3-component limit no longer holds for the homepage. This is documented explicitly in the updated CLAUDE.md section (see below) so future work (by Claude or otherwise) doesn't misread the homepage's 8 React components as a silent drift from convention — it's a recorded, intentional decision.
- **No SEO regression expected**: all content (headings, copy, product/blog data) is still server-rendered into the initial HTML via Astro's SSR of React islands (Astro renders islands to static HTML at build time, hydrating only on load/visible) — text content remains crawlable exactly as before.

---

## CLAUDE.md Update

The "Component split: Astro vs React" section is rewritten to read (replacing the current 3-component rule):

> **Homepage exception**: `Hero`, `Services`, `WhyUs`, `ProductsSection`, and `BlogPreview` (all under `src/components/sections/`) are React (`.tsx`) using framer-motion for icon and scroll-entrance animation — an intentional, explicit exception made 2026-08-24 to support richer homepage motion design. All other layout/section components elsewhere in the site remain `.astro`. `ContactForm`, `StatsCounter`, `TestimonialsSlider` remain the original React exceptions (`src/components/ui/`). Do not convert additional `.astro` components to React without an explicit design decision — the general rule (interactive → React, static → Astro) still governs everywhere outside these 8 named components.

---

## Out of Scope

- Header, Footer, and any non-homepage page/section — untouched, keep current `.astro` + CSS scroll-animation system.
- `ProductCard.astro` / `BlogCard.astro` themselves — untouched, still used by `/products` and `/blog` listing pages.
- Replacing the Hero SVG illustration with a raster/AI-generated image — out of scope for this spec; if the user later approves a Gemini-generated hero image, that's a separate follow-up change to `Hero.tsx`'s illustration markup, not a blocker for this rewrite.
- Any change to `global.css` design tokens, color palette, or typography scale.
- Google Analytics / ContactForm Formspree ID — pre-existing open configuration items, unrelated to this change.
