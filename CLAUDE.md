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

- **`.astro` components** — all layout and section components (`src/components/layout/`, `src/components/sections/`), plus the `src/components/ui/` widgets whose interactivity is small enough for an inline `<script>` (`CookieConsent`, `VideoPlayer`, `BlogCard`, `ProductCard`, `SubscribeBlock`); they own copy, structure, and static markup
- **`.tsx` React components** — only the three hydrated islands, all in `src/components/ui/`:

| Island | Mounted by | Directive |
|---|---|---|
| `ContactForm` | `src/pages/contact.astro` | `client:load` |
| `StatsCounter` | `src/components/sections/StatsBar.astro` | `client:load` |
| `ScheduleWidget` | `src/layouts/Page.astro` (site-wide) | `client:only="react"` |

Testimonials used to be a Swiper React slider; it is now static markup in `src/components/sections/Testimonials.astro`. Do not reintroduce a carousel for a single quote.

**Keep any wrapper class outside the island.** A class a script writes onto a node inside the React tree is a hydration race; put it on the Astro wrapper around the island instead. See `StatsBar.astro`.

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

#### The social card

A crawler fetches `og:image` as a **bitmap** and none of them rasterise SVG, so
an entry headed by a drawing cannot name that drawing. It names the PNG drawn
*from* it: `socialCard()` in `src/build/social-cards.ts` maps `foo.svg` to
`foo-1200x600.png`, `Base.astro` and `blog/[slug].astro` (the JSON-LD `image`)
both go through it, and the `cloudalgo-social-cards` integration renders one
per declared card at `astro:build:done` with sharp. The size in the filename is
the same convention the rest of the blog's assets follow — `Base.astro` reads
it back out to declare `og:image:width` / `og:image:height`.

The card list is read out of the **emitted HTML**, not the collection, so what
is drawn is exactly what was declared; a card named by a page whose hero SVG is
missing fails the build rather than shipping a 404 no crawler reports. The
generic `/og-default.jpg` is now the fallback only for an off-site SVG.

#### Legacy URLs

`astro.config.mjs` derives most redirects from the blog filenames, which is
right for the two renames this repo performed. It is wrong for anything the
*previous* site published, and the difference has bitten once already: the
posts were imported with their filenames cut to 80 characters, so every
derived redirect used a cut slug while Google went on ranking the uncut
original. Four posts served the 404 page for months while holding page-one
positions — 31,682 impressions and 251 clicks.

So: **a URL the old site published is a fact about history, not about this
repo, and cannot be derived from it.** Those live in
`src/build/legacy-redirects.ts`, each line carrying the Search Console
impressions that justify it. Its tests resolve every target to the file that
builds it, so renaming a post fails the suite instead of the redirect.

Before assuming a legacy path is covered, check it — the 16-month page report
in Search Console lists every URL Google still has, and `curl -o /dev/null -w
'%{http_code}'` says whether we still answer it.

Astro also hardcodes `<meta name="robots" content="noindex">` into every
redirect stub it generates (`core/routing/3xx.js`), with no config option.
That contradicts the canonical it emits on the same page, and on GitHub Pages
— where there is no server-side 301 — the meta refresh and the canonical are
the entire signal. The `cloudalgo-indexable-redirects` integration strips it
back off after the build; see `src/build/redirect-stubs.ts`.

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

**There are none, deliberately.** Sections used to start at `opacity: 0` and fade
up as an `IntersectionObserver` in `Base.astro` reached them; that was removed —
the observer, `base/_motion.scss`, the `anim-fade-up` / `anim-scale-pop` classes
and the `--i` stagger vars that fed it. Content paints where it sits. Do not
reintroduce an entrance that hides content until scroll.

`SectionRail` and `StatsCounter` still run their own observers, for the margin
rail's active tick and the counter's start — both are about *when a thing acts*,
not about whether copy is visible.

### Astro 7 gotchas

Astro 7 bundles with **rolldown** instead of rollup/esbuild. Two things bite, and neither fails the build:

- **The `---` frontmatter fence must be the first bytes of a `.astro` file.** Not a blank line, not an HTML comment above it. If anything precedes it the frontmatter is parsed as markup and you get a misleading `Expected '}' but found ':'`. Put file-level notes *inside* the fence as JS comments.
- **Default-importing a CommonJS package can yield the module object instead of the export.** Rolldown emits the CJS interop in node mode, so `default` ends up bound to `module.exports` and React throws "element type is invalid" *at runtime while the build stays green*. Named imports are unaffected. Prefer a named import, or avoid the CJS dependency; `react-countup` was dropped for exactly this reason.

Because a green build no longer implies a working page, load the built site before shipping a dependency or bundler change — `npm run preview` and check the browser console, not just `npm run build`.

**Markdown runs on Sätteri, not unified.** `markdown.remarkPlugins`, `markdown.rehypePlugins` and `markdown.remarkRehype` now need `@astrojs/markdown-remark` installed and fail the build without it. The native path is `markdown: { processor: satteri({ hastPlugins: [...] }) }` from `@astrojs/markdown-satteri`, with plugins built by `defineHastPlugin` / `defineMdastPlugin` from `satteri`. `astro.config.mjs` has one: `satteriFigures` turns a lone captioned `<img>` in a paragraph into a `<figure>` + `<figcaption>`, moving the alt rather than copying it.

### Third-party integrations (all live — no placeholders left)

- **HubSpot Forms API** — two forms, one portal, and the ids live in
  `src/data/forms.ts` rather than in either component. `ContactForm.tsx`
  (`/contact/`) posts a message that gets a written reply; `SubscribeBlock.astro`
  (foot of every journal entry) posts an address to the journal list. Not
  Formspree. **`HUBSPOT_SUBSCRIBE_FORM_ID` is empty until the form exists in
  HubSpot, and `SubscribeBlock` renders nothing while it is** — a subscribe box
  that drops addresses is worse than no box. The two are deliberately separate:
  the contact form's own note promises no mailing list, so a contact submission
  must never be added to one.
- **Analytics — unconditional, with an explicit consent declaration.** Every
  visitor is measured. There is no consent gate in front of any tracker, and
  the cookie notice informs rather than asks — a decision taken deliberately by
  the site's owner on 2026-08-27, replacing the accept-only measurement this
  file used to document. Do not reintroduce a gate without being asked to.
- **The consent *declaration*** lives in
  `src/components/ui/ConsentBootstrap.astro`, rendered into `Base.astro`'s
  `<head>`. It is the ONLY analytics code permitted in a layout, it must stay
  `is:inline` (a deferred consent default is not a consent default), and it
  loads exactly one Google tag: GA4 (`G-5WYSWY2G6Z`). It declares all four
  Consent Mode v2 signals `granted` — not because anything is being gated, but
  because an undeclared state (`gcs=G1--`) degrades conversion modelling on the
  linked Google Ads account `AW-18354965185`. It carries no `wait_for_update`:
  verified in a browser, that parameter with no update ever arriving suppresses
  the collect request entirely.
- **Tracker *loading* lives in `injectTrackers()` in `CookieConsent.astro` and
  nowhere else**: the HubSpot script and Microsoft Clarity, both on every page
  load. Nothing may add a fourth tracker.
- **The notice is a legal surface and its copy is load-bearing.** It states
  that analytics run on every visit and that the browser is where the reader
  turns them off. `ca_notice_ack` records only that it has been read. If you
  ever put a tracker back behind a gate, the copy has to move with it in the
  same commit — and vice versa.
- `Base.astro` only *emits* events, never loads a tracker. It calls
  `captureFirstTouch()` and `initEngagement()` from `src/lib/`, and emits
  `scroll_depth`, `outbound_click` and `cta_click` inline. `gtag` exists from
  the head for every visitor, courtesy of `ConsentBootstrap.astro`. Any new
  tracker goes in `injectTrackers()`, never in a layout.

#### The event vocabulary

**Every event name is a member of the `AnalyticsEvent` union in
`src/lib/analytics.ts`, and every call goes through `track()`.** A stringly
typed `gtag('event', …)` typo is not an error — it is an event landing in GA4
under a name nobody reports on, which is indistinguishable from the visit
never happening. The union makes it a build failure. GA4 caps a property at
500 distinct names and truncates parameter values at 100 characters; `clean()`
in `engagement.ts` does the truncation, backing up to a word boundary because
a person reads these in a report.

| Group | Events | Emitted from |
|---|---|---|
| Conversion | `generate_lead`, `form_submit`, `contact_click` | `ContactForm.tsx`, `ScheduleWidget.tsx`, `engagement.ts` |
| Booking funnel | `schedule_step` | `ScheduleWidget.tsx` |
| Engagement | `link_click`, `select_item`, `content_view`, `expand_content`, `form_start` | `engagement.ts` |
| Video | `video_start`, `video_progress`, `video_complete` | `VideoPlayer.astro` |
| Page | `scroll_depth`, `outbound_click`, `cta_click`, `page_not_found` | `Base.astro`, `404.astro` |

- **`schedule_step` is one name with a `step` parameter**, not eight names:
  `open` · `date_selected` · `slot_considered` · `slot_selected` · `submit` ·
  `confirmed` · `failed` · `abandoned` (carrying `last_step`). A funnel
  exploration wants step as an orderable dimension, which separate names
  cannot give it. Do not split it.
- **`outbound_click` and `cta_click` duplicate clicks that `link_click`
  already reports.** They are kept because GA4 history is built on those
  names, and renaming an event orphans the reports built on it. The
  duplication is deliberate.
- **`generate_lead` carries no `value` or `currency`.** The site publishes no
  rate; a made-up number would poison every report built on it.
- **Same-origin is tested by parsing, never by `href.startsWith(origin)`** —
  the latter reads `cloudalgo.com.evil.test` as our own traffic. `classifyLink`
  and `itemFromHref` in `engagement.ts` are the shared helpers; the legacy
  `outbound_click` handler uses them too.
- **First-touch attribution** (`captureFirstTouch` / `readFirstTouch`) is a
  localStorage record written once per visitor and never overwritten — it has
  to survive the days between a campaign click and a booking. `ContactForm`
  sends it with `generate_lead`; it is deliberately NOT sent to HubSpot, which
  rejects a submission carrying a field the portal has not defined.
- **HubSpot's `hutk`**: HubSpot sets the cookie as `hubspotutk` and expects it
  back as `hutk`. The two names differ, they are both theirs, and unifying
  them de-attributes every lead. `readHubspotCookie()` exists for exactly this.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. The `dist/` directory is the Pages artifact.
