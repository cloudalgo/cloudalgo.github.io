# Home page — Press Room / Contemporary

Design spec. Approved 2026-08-25. Branch `refactor/design-system`.

Source of truth for the visual design is the approved artifact
**CloudAlgo Homepage Sections**
(`https://claude.ai/code/artifact/7759231c-0bb8-420c-9464-de27ac9c9bfa`).
Where this document and the artifact disagree, the artifact wins and this
document is wrong and should be corrected.

## Why this exists

Phases 1–6 rebuilt the site's styling as a three-layer token system
(primitive theme map -> semantic role -> component knob) behind a Sass
contract that fails the build on a missing or extra token. Throughout,
the site was held byte-identical: every commit was verified to change
zero rendered values.

That work bought exactly one thing, and this is where it gets spent: the
redesign lands as a theme, not as a rewrite.

## Scope

Site-wide, decided 2026-08-25. The palette, type and shape flip for every
page at once. Pages other than home keep their current section
architecture and render in the new skin until each is designed in turn.

The alternative — scoping the new skin to the home page — was rejected.
The token layer is `:root`-global by design; scoping it would mean a
page-level override wrapper, would run two visual systems side by side
until the last page landed, and would discard the property that makes the
flip one line.

## What changes

Four axes. Only the fourth is markup.

| Axis     | Today                        | Approved                                    | Lives in                    |
|----------|------------------------------|---------------------------------------------|-----------------------------|
| Palette  | monochrome, ink + warm paper | Press Room — same paper, one ember           | `themes/_press-room.scss`   |
| Type     | Outfit for everything        | Archivo display, Geist body, Geist Mono figs | contract + `Base.astro`     |
| Shape    | 2–6px, buttons 100px pill    | **radius 0, everywhere**                     | six `radius-*` tokens       |
| Sections | 7, Services first            | 9, Products first                            | `components/sections/`      |

## The palette

Two ramps, two hues, nothing else. Ink holds the warm paper hue; flame
holds hue 8.2, measured off the logo mark. No colour on the page is
outside these.

### Anchors (authoritative, from the artifact)

Lights  `#FFFFFF` `#F7F4F2` `#F2EEEB` `#EAE5E1` `#E0D9D4` `#CAC1BA` `#ADA299`
Darks   `#57504B` `#494440` `#34302D` `#231F1D` `#1B1916` `#131110`
Flame   `#FDF1F0` `#F5DCD8` `#EDC1BB` `#F75A41` `#110605`

### Semantic roles and their measured ratios

| Role         | Value     | Ratio | Against  |
|--------------|-----------|-------|----------|
| `--ink`      | `#131110` | 17.19 | page     |
| `--muted`    | `#494440` |  8.78 | page     |
| `--faint`    | `#57504B` |  7.22 | page     |
| `--on-brand` | `#110605` |  6.17 | brand    |

These four numbers are claims made by the artifact. Implementation
verifies each against the background the token actually paints on. A
figure that does not reproduce is a bug in the implementation or an error
in the artifact — either way it gets resolved, not rounded.

This palette also closes the four sub-AA roles found during Phase 6b
(muted 3.16:1, faint 2.85:1, faintest 2.08:1, hairline rule 1.21:1).
They are fixed by the palette, not patched at the call site.

### Ramp topology

The artifact runs one continuous ramp, `ink-000` (white) through
`ink-900`, folding paper into ink. The contract splits `paper-*` (9
steps) from `ink-*` (11). They map cleanly — artifact lights onto
`paper-*`, darks onto `ink-*` — but **the contract has more slots than
the artifact defines anchors for**: `ink-880/870/860/840` and
`paper-250/400`.

Those in-between steps are interpolated along the artifact's ramp, never
invented. Any that end up read by nothing are recorded as deletion
candidates for the convergence pass; they are not deleted here, because
deleting a contract key is a change to both themes.

The contract's shape is deliberately **not** reshaped to match the
artifact. Reshaping it would make the theme flip stop being one line,
which is the property being bought.

## Contract changes

The contract grows from 77 required keys to 80. Every theme must define
all three, so `monochrome` defines them too and the old skin stays whole
and reversible.

| New key          | Why                                                                 | monochrome     |
|------------------|---------------------------------------------------------------------|----------------|
| `family-display` | Headings are Archivo, body is Geist. Two sans families, two jobs. There is no display slot today. | Outfit         |
| `accent-050`     | The wash — the ember diluted to a plate behind the featured panel.   | paper step     |
| `accent-200`     | The rule *inside* an ember-washed panel, which cannot be `--line`.   | border default |

## Type

Archivo (display, 700/800) + Geist (body) + Geist Mono (figures, labels,
status, dates). Replaces Outfit everywhere.

Mono is load-bearing here, not decorative: it carries every number, every
`type` label, every status, and every date. `font-variant-numeric:
tabular-nums` on all figures.

Three families replacing one is a real cost. Weights are subset to only
those the artifact uses, and all three are confirmed present on Google
Fonts before the CDN is relied on. If any is absent, it is self-hosted
rather than substituted.

## Shape

All six `radius-*` tokens go to 0, `radius-pill` included. Structure is
carried by hard 1px rules, which is what made Press Room work.

Note for later, not for this work: a token named `radius-pill` whose
value is `0` is a lie, and the six-name radius family now collapses to
one value. Renaming belongs to the convergence pass.

## Section architecture

Nine sections. Products moves above Services, because the products are
the proof that the services work.

| #  | Section      | Component                  | Action                                          |
|----|--------------|----------------------------|-------------------------------------------------|
| 01 | Hero         | `Hero.astro`               | rewrite — headline plus an explicit fork        |
| 02 | Proof strip  | `StatsBar.astro`           | rewrite — four figures, tabular mono            |
| 03 | Products     | `ProductsSection.astro`    | rewrite — featured panel plus three typed rows  |
| 04 | Services     | `Services.astro`           | rewrite — four ruled rows, each naming its proof|
| 05 | Band         | **new** `Band.astro`       | full-bleed ember; CTA with the quote as attribution |
| 06 | Case studies | **new** `CaseStudies.astro`| two engagements, figures from `case-studies.ts` |
| 07 | Journal      | `BlogPreview.astro`        | rewrite — one lead post, two in a ruled rail    |
| 08 | Footer CTA   | `Footer.astro`             | rewrite — the consulting ask, stated once, on paper |
| 09 | Colophon     | `Footer.astro`             | rewrite — masthead mirrored, products get a column |
| —  | `WhyUs.astro`       |                     | **delete** — folds into 04's standfirst         |
| —  | `Testimonials.astro`|                     | **delete** — folds into 05                      |

Two rows above record what shipped rather than what was first written,
because the mock disagreed with the prose and the mock is the approved
artifact:

- **07** was specified as three equal ruled rows. `home-mock.css` draws a
  `1.25fr 1fr` lead-plus-rail: one post carrying its excerpt, two more
  stacked beside it. Three equal rows say "we have a blog"; a lead says
  which post to read first, which is the only thing this fold has room
  to say. A companion rail of category links was dropped with it —
  `/blog/` reads no search params on a static build, so those links
  would have landed on an unfiltered index.
- **08 and 09** were expected to keep a filled dark surface. `.hp__foot`
  and `.hp__colo` have no fill at all: rules on the page surface, with
  the colophon described there as the masthead mirrored at the foot. A
  dark colophon under a light masthead mirrors nothing, and a near-black
  CTA above it would have given the page three inverted surfaces, which
  costs the ember band the thing that makes it land.

Both deletions are folds, not losses. `WhyUs`'s numbered points are
claims about how the team works, and read stronger as the standfirst
above the service rows than as a section competing with them.
`Testimonials` is already a single quote, and one quote does more work as
attribution beside the CTA than alone in the scroll. Either slots back in
as a standalone section without disturbing the order.

## Data

Most of what the design needs already exists.

- **products** — already carries `status` (`ga`/`preview`/`beta`) and
  `type` (`salesforce-app`/`integration`/`mobile-app`/`desktop-app`).
  These are exactly the mock's live status dots and mono type labels. No
  schema change. Status renders real state; it is not decoration.
- **case-studies.ts** — already carries `industry`, `metric`,
  `metricLabel`, `headline`, `outcomes`.
- **services** — needs one new field, `proves`, naming the product that
  demonstrates the service. This is the join that lets one page serve
  both audiences.

## StatsCounter

The proof strip in the approved design is static figures. No count-up.

`StatsCounter` is one of only three hydrated React islands. If the design
has no animation, the island is deleted rather than kept and stilled:
less JavaScript, and one fewer hydration boundary.

This is a behaviour change, so it is called out rather than absorbed. If
the count-up is wanted after all, it returns as an island under an
`anim-*` wrapper per the existing rule in `CLAUDE.md`.

## Sequence

**Skin first, then sections.**

1. Flip palette, type and shape site-wide with **zero markup change**.
   Verify. Commit.
2. Rebuild the nine sections on top, in order.

The point of the split: the whole site becomes visible in the new skin
before anything is built on it. If the ember is wrong, that is discovered
against known-good markup, and a bad result can be attributed to the
palette or to the new sections but never ambiguously to both.

Rejected: sections first (judging new layout in the wrong colours for the
whole build), and one big commit (unreviewable, and un-attributable).

## Verification

The five cascade-replay comparers used through Phases 3–6 are **retired
at step 1**. They prove that nothing changed. From here, things change on
purpose, and a tool that reports "17,149 values moved" is measuring the
intent rather than testing it.

The replacement gate:

1. `npm run astro check` clean, `npm run build` clean, zero Sass
   deprecation warnings.
2. **Measured contrast.** `wcag.py` / `pairs.py` are re-pointed at the new
   palette. Every semantic pair is measured against the background it
   actually paints on, and the four claimed ratios above are reproduced.
   A pair under its floor fails.
3. **Both themes still emit.** `monochrome` must keep building. The flip
   stays one line in both directions; a theme that no longer compiles is
   a broken contract, not a retired palette.
4. The site is loaded in a browser before shipping. Astro 7's rolldown
   bundler means a green build does not imply a working page — see
   `CLAUDE.md`.

## Out of scope

Deliberately not in this work, and not forgotten:

- The three `public/blog-images/*.svg` heroes, loaded via `<img src>`, so
  238 hardcoded greys survive any theme swap. They need inlining.
- Shiki's `github-dark` inline styles on 12 blog posts — ten hardcoded
  colours no theme can reach, comments at 3.05:1, and an unguarded
  `.blog-post-details code` crimson at 2.66:1. The fix is Shiki
  configuration.
- Convergence of the drift preserved through Phase 5 (badge, card,
  section-title, numeral, ink-alpha, shadow, radius, font-stack).
- `--input-border-invalid`, still unwired: wiring it puts a red border on
  invalid fields, which is a visible change.
- Whether `.btn-secondary` diverges from `.btn-primary` or collapses into
  it.
- Pages other than home. Each gets its own design -> discuss -> final
  design -> implement cycle.

Nothing reaches `main` until the whole site is signed off.
