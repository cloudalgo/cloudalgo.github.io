# Home Page (Press Room / Paper & Ember) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip the site to the approved Paper-and-Ember skin site-wide, then rebuild the home page's nine sections to the approved mock — without breaking the one-line theme flip that the token architecture exists to protect.

**Architecture:** The skin lands first as pure token work: the theme contract grows from 77 to 80 keys, `themes/_press-room.scss` is repainted to the artifact's measured anchors, and `main.scss` swaps one `@use`. Nothing outside `src/styles/themes/` and `src/styles/tokens/` names a colour, so the palette, type and radii change with no markup edits at all. Only after the skin is live do the sections get rebuilt, one component per task, each swapped into `index.astro` as it lands so the page is loadable at every step.

**Tech Stack:** Astro 7 (static, rolldown) · React 19 · TypeScript 6 strict · Dart Sass 1.103 · Node ≥ 22.12.0

**Spec:** `docs/superpowers/specs/2026-08-25-homepage-press-room-design.md`
Design source vendored at `docs/superpowers/specs/assets/home-mock.{html,css}` plus three screenshots. **Where this plan and the mock disagree, the mock wins.**

## Global Constraints

- **Node ≥ 22.12.0.** Do not upgrade TypeScript to 7 — `@astrojs/check` peer-caps at `^5 || ^6`, and `npm run astro check` is the only type gate this project has.
- **No colour outside `src/styles/themes/`.** Components reference semantic or component tokens only. A raw hex in a `.astro`, `.tsx` or non-theme `.scss` file is a defect, not a shortcut.
- **The contract is the gate.** Adding a token means adding its key to `$required` in `themes/_contract.scss` first. Both themes must define every key or the build `@error`s — that is the point.
- **Both themes must keep compiling.** `monochrome` is the proof that the flip is reversible. Every new key gets a monochrome value too.
- **Every text role clears WCAG AA (4.5:1)** against the background it actually paints on. Measured, not assumed.
- **Astro 7 / rolldown: a green build does not imply a working page.** Before calling any task done that touches the bundler, fonts, or an island, load the built site (`npm run preview`) and check the browser console.
- **The `---` frontmatter fence must be the first bytes of every `.astro` file.** No blank line, no comment above it. File-level notes go *inside* the fence as JS comments.
- **Do not push to `main`.** All work stays on `refactor/design-system` until the user signs off.

---

## File Structure

**Token layer (Tasks 1–4) — the whole skin:**

| File | Responsibility |
|---|---|
| `src/styles/themes/_contract.scss` | The 80-key `$required` list and the `emit()` mixin |
| `src/styles/themes/_press-room.scss` | The Paper & Ember palette, type and radii |
| `src/styles/themes/_monochrome.scss` | The reversible original skin |
| `src/styles/tokens/_semantic.scss` | Purpose roles; gains one repoint (`--font-heading`) |
| `src/styles/main.scss` | One `@use` line selects the live theme |
| `src/layouts/Base.astro` | The webfont `<link>` — fonts move when the `<head>` does |

**Section layer (Tasks 6–14) — one file per fold:**

| File | Responsibility | Fate |
|---|---|---|
| `src/components/sections/Hero.astro` | Fold 1: headline, fork, standfirst | rewritten |
| `src/components/sections/ProofStrip.astro` | Fold 2: four static proof figures | **new** |
| `src/components/sections/ProductsSection.astro` | Fold 3: featured product + three rows | rewritten |
| `src/components/sections/Services.astro` | Fold 4: four service rows with `proves` | rewritten |
| `src/components/sections/Band.astro` | Fold 5: full-bleed ember quote band | **new** |
| `src/components/sections/CaseStudies.astro` | Fold 6: two case cards with figures | **new** |
| `src/components/sections/BlogPreview.astro` | Fold 7: journal list + side rail | rewritten |
| `src/components/layout/Footer.astro` | Fold 8+9: CTA and colophon | rewritten |
| `src/components/sections/WhyUs.astro` | folded into Services | **deleted** |
| `src/components/sections/Testimonials.astro` | folded into Band | **deleted** |

Each new section owns a matching partial under `src/styles/sections/` or `src/styles/components/`, registered in `main.scss`.

**Deliberately NOT touched:** `StatsBar.astro` / `StatsCounter.tsx`. The spec proposed deleting the island because the home design has no count-up — but `StatsBar` is also mounted at `src/pages/about.astro:303`. Deleting it now would silently change a page nobody has designed yet. Task 8 removes it from the home page only; the island dies when `about.astro` is redesigned.

---

### Task 1: Grow the theme contract to 80 keys

The design needs three tokens no theme has: a display family (Archivo headings against Geist body — there is no display slot), the ember wash, and the rule colour inside an ember-washed panel. Adding them to `$required` makes the build fail until *both* themes define them, which is exactly the guarantee we want.

**Files:**
- Modify: `src/styles/themes/_contract.scss` (the `$required` list)
- Modify: `src/styles/themes/_press-room.scss`
- Modify: `src/styles/themes/_monochrome.scss`

**Interfaces:**
- Produces: three new theme keys — `family-display`, `accent-050`, `accent-200` — available to every later task as `var(--family-display)`, `var(--accent-050)`, `var(--accent-200)`, plus the derived `--accent-050-rgb` / `--accent-200-rgb` triplets that `emit()` writes for every colour-typed value.

- [ ] **Step 1: Prove the contract actually fails on a missing key**

Add the key to the contract *first*, with no theme defining it, and confirm the build stops:

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io
sed -i '' "s/^  'family-sans',$/  'family-display',\n  'family-sans',/" src/styles/themes/_contract.scss
npm run build 2>&1 | grep -i 'family-display'
```

Expected: the build fails with `Theme "monochrome" is missing the required token --family-display.` If it does not fail, the contract is not enforcing and everything below is built on sand — stop and investigate.

- [ ] **Step 2: Add the remaining two keys to the contract**

```bash
sed -i '' "s/^  'accent-400',$/  'accent-050',\n  'accent-200',\n  'accent-400',/" src/styles/themes/_contract.scss
grep -c "^  '" src/styles/themes/_contract.scss
```

Expected: `80`.

- [ ] **Step 3: Define the three keys in monochrome**

Monochrome has no ember, so its accent tokens are greys. It must define all three or the skin stops being reversible. Insert into the `$theme` map in `src/styles/themes/_monochrome.scss`, beside the existing accent block:

```scss
  /* The design layer needs a wash and an in-panel rule. Monochrome has
     no accent hue, so both resolve to paper — the roles exist, they are
     simply colourless here. Without them the flip is one-way. */
  'accent-050': #F7F7F5,
  'accent-200': #E4E4E0,
```

and beside its `family-sans`:

```scss
  /* Monochrome has one typeface. The display slot exists so a theme
     CAN split headings from body; this one declines to. */
  'family-display': 'Outfit, system-ui, sans-serif',
```

- [ ] **Step 4: Define the three keys in press-room (values from the artifact)**

In `src/styles/themes/_press-room.scss`, add to the ember block:

```scss
  'accent-050': #FDF1F0,  /* ember wash — panel and band backgrounds */
  'accent-200': #EDC1BB,  /* the rule inside an ember-washed panel */
```

and beside `family-sans` (the real family lands in Task 3; this is the placeholder-free interim value that keeps the build green):

```scss
  'family-display': 'Outfit, system-ui, sans-serif',
```

- [ ] **Step 5: Verify both themes still compile**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds. Then confirm press-room compiles too, by temporarily pointing main.scss at it and building:

```bash
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build 2>&1 | tail -3
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
```

Expected: both builds succeed.

- [ ] **Step 6: Verify the change is inert**

The live theme is still monochrome and the three new keys are referenced by nothing, so the rendered CSS must be byte-identical. Run the cascade comparers against the pre-task build.

Expected: zero declaration diffs. **Note the known blind spot:** `badgecmp.py:10` skips `@media` and `@keyframes` bodies. This task touches neither, so the comparers are authoritative here — that stops being true at Task 5.

- [ ] **Step 7: Commit**

```bash
git add src/styles/themes/
git commit -m "refactor(tokens): grow the contract to 80, give both themes a display slot

The home design splits headings (Archivo) from body (Geist) and washes
two panels in ember. No theme had a display family, a wash, or an
in-panel rule, so all three become contract keys -- which means
monochrome has to answer for them too, and the flip stays two-way.

Inert: the live theme is unchanged and nothing reads the new keys yet."
```

---

### Task 2: Repaint press-room to the artifact's measured palette

The artifact runs one continuous `ink-000`(white) → `ink-900` ramp; the contract splits `paper-*` from `ink-*` and has more rungs than the artifact has anchors. Anchors are copied exactly. The four in-between rungs are **interpolated along the artifact's own ramp**, never invented — and two of them are pulled tighter than a naive interpolation, because the artifact's next light rung (`#ADA299`, 2.28:1) is the exact unreadable grey the user rejected twice.

**Files:**
- Modify: `src/styles/themes/_press-room.scss` (the ink, paper and ember blocks)
- Create: `docs/superpowers/specs/assets/contrast-check.py`

**Interfaces:**
- Consumes: the 80-key contract from Task 1.
- Produces: the live palette every later task paints with. Semantic roles are unchanged — `--color-text` still resolves through `--ink-500`, `--surface-page` through `--paper-100`. No component knows the palette moved.

- [ ] **Step 1: Write the contrast harness**

Create `docs/superpowers/specs/assets/contrast-check.py`. This replaces the cascade comparers as the verification story from Task 5 onward, so it is a committed artifact, not a scratch script:

```python
#!/usr/bin/env python3
"""Measure every text role against the background it actually paints on.

The five cascade comparers prove a change moved nothing. From the theme
flip onward everything moves on purpose, so they retire and this takes
over: it proves the thing we actually care about, which is that no text
role in the shipped palette sits under WCAG AA.
"""
import re, sys, pathlib

def _srgb(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(h):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126 * _srgb(r) + 0.7152 * _srgb(g) + 0.0722 * _srgb(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    if a < b:
        a, b = b, a
    return (a + 0.05) / (b + 0.05)

def load(path):
    """Pull `'key': #HEX,` pairs out of a theme's Sass map."""
    src = pathlib.Path(path).read_text()
    return dict(re.findall(r"'([a-z0-9-]+)':\s*(#[0-9A-Fa-f]{6})", src))

# (token, background token, minimum). Backgrounds are the surface the
# role's semantic consumer actually paints on -- page, card or inverse.
TEXT_ROLES = [
    ('ink-900',   'paper-100', 4.5),   # --color-heading on page
    ('ink-900',   'paper-000', 4.5),   # --color-heading on card
    ('ink-500',   'paper-100', 4.5),   # --color-text on page
    ('ink-500',   'paper-000', 4.5),   # --color-text on card
    ('ink-400',   'paper-100', 4.5),   # --color-text-muted on page
    ('ink-300',   'paper-100', 4.5),   # --color-text-faint on page
    ('ink-300',   'paper-000', 4.5),   # --color-text-faint on card
    ('paper-400', 'paper-100', 4.5),   # --color-text-faintest on page
    ('ink-860',   'paper-000', 4.5),   # --color-prose on card
    ('ink-840',   'paper-000', 4.5),   # --color-prose-soft on card
    ('accent-on', 'accent-500', 4.5),  # button label on ember
    ('accent-on', 'accent-600', 4.5),  # button label on ember hover
    ('paper-000', 'ink-900',   4.5),   # --color-on-inverse
    ('paper-000', 'ink-800',   4.5),   # --color-on-inverse on footer CTA
    ('paper-025', 'ink-900',   4.5),   # --color-on-inverse-soft
    ('accent-400', 'ink-900',  4.5),   # ember on an inverse surface
    ('danger-500', 'paper-000', 4.5),  # --color-danger on card
]

def main(theme_path):
    t = load(theme_path)
    failed = []
    for fg, bg, floor in TEXT_ROLES:
        r = ratio(t[fg], t[bg])
        ok = r >= floor
        if not ok:
            failed.append((fg, bg, r, floor))
        print(f"{'ok  ' if ok else 'FAIL'} {fg:11} {t[fg]} on {bg:11} {t[bg]}  {r:5.2f}:1")
    if failed:
        print(f"\n{len(failed)} role(s) under AA:", file=sys.stderr)
        for fg, bg, r, floor in failed:
            print(f"  {fg} on {bg}: {r:.2f} < {floor}", file=sys.stderr)
        return 1
    print(f"\nall {len(TEXT_ROLES)} text roles clear AA")
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1
                  else 'src/styles/themes/_press-room.scss'))
```

- [ ] **Step 2: Run it against the current press-room and watch it fail**

```bash
python3 docs/superpowers/specs/assets/contrast-check.py
```

Expected: FAIL. The current theme's own header admits four roles sit under 4.5:1 (`ink-400` 3.7, `ink-300` 3.4, `paper-400` ~2.4, plus the hairline). This is the baseline the repaint fixes.

- [ ] **Step 3: Replace the ink block**

In `src/styles/themes/_press-room.scss`, replace the whole `/* Ink */` block with:

```scss
  /* Ink — the artifact's dark ramp, warm-neutral rather than the old
     pure grey. Anchors are copied exactly; `ink-300` is interpolated
     along the ramp because the artifact's next light rung (#ADA299)
     lands at 2.28:1 and is the grey the readability pass rejected. */
  'ink-900': #131110,  /* headings, filled buttons, hover borders — 17.19:1 on page */
  'ink-880': #1B1916,  /* cards raised off an ink-900 section */
  'ink-870': #34302D,  /* hairline rules on an ink-900 section */
  'ink-860': #231F1D,  /* long-form prose — 15.0:1 on card */
  'ink-840': #34302D,  /* long-form standfirst — 12.0:1 on card */
  'ink-800': #231F1D,  /* footer CTA surface — carries white at 15.0:1 */
  'ink-600': #34302D,  /* link hover — one step deeper than body */
  'ink-500': #494440,  /* body copy — 8.78:1 on page, 9.61:1 on card */
  'ink-400': #57504B,  /* captions — 7.22:1 on page, up from 3.7:1 */
  'ink-300': #6C645E,  /* card meta — 5.29:1 on page, up from 3.4:1 */
  'ink-000': #000000,  /* true black — pressed states only */
```

- [ ] **Step 4: Replace the paper block**

```scss
  /* Paper — the artifact's light ramp. `paper-400` is interpolated for
     the same reason as ink-300: it carries the faintest TEXT role, so
     it has to clear AA. The genuinely decorative rungs below it
     (paper-300 tracks and ghost numerals, paper-250 disabled labels)
     keep the artifact's pale anchors, because non-text is exempt. */
  'paper-000': #FFFFFF,  /* cards, modals, header */
  'paper-025': #F2EEEB,  /* softened light text on an inverse surface */
  'paper-050': #F2EEEB,  /* sunk wash — table-row hover, alternate bands */
  'paper-100': #F7F4F2,  /* page background */
  'paper-150': #EAE5E1,  /* tinted wash — callouts, inline code, chips */
  'paper-200': #E0D9D4,  /* borders, dividers, inputs */
  'paper-250': #ADA299,  /* disabled control text — exempt from AA */
  'paper-300': #CAC1BA,  /* toggle tracks, bullet dots, ghost numerals */
  'paper-400': #756D66,  /* faintest metadata text — 4.64:1 on page */
```

- [ ] **Step 5: Replace the ember block**

```scss
  /* Ember — the logo mark's #F75A41, and the reason `accent-on` is a
     theme key. White on #F75A41 is 3.2:1 and fails AA at button text
     size; no amount of naming fixes that. Darkening the ember until
     white passes lands somewhere visibly not the brand. So the accent
     keeps the brand value and the label goes dark: #110605 at 6.17:1.
     accent-400 and accent-600 have no artifact anchor and are
     interpolated along the flame ramp toward #EDC1BB and #110605. */
  'accent-050': #FDF1F0,  /* ember wash — panel and band backgrounds */
  'accent-200': #EDC1BB,  /* the rule inside an ember-washed panel */
  'accent-400': #F66953,  /* lighter ember — accent on an inverse surface, 6.33:1 */
  'accent-500': #F75A41,  /* brand ember — fills, band, borders */
  'accent-600': #E9553D,  /* hover — one step deeper, ink still 5.54:1 */
  'accent-on':  #110605,  /* ink on ember: 6.17:1 rest, 5.54:1 hover */
```

- [ ] **Step 6: Run the harness and confirm every role clears AA**

```bash
python3 docs/superpowers/specs/assets/contrast-check.py
```

Expected: `all 17 text roles clear AA`, exit 0. Confirm the four spec-critical ratios read back exactly as the design measured them: `ink-900` on `paper-100` = 17.19, `ink-500` = 8.78, `ink-400` = 7.22, `accent-on` on `accent-500` = 6.17.

- [ ] **Step 7: Confirm the repaint is still inert on the live site**

The live theme is monochrome; press-room is not loaded. Build and run the comparers against the pre-task build.

Expected: zero declaration diffs. Then confirm press-room itself compiles:

```bash
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build 2>&1 | tail -3
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
```

- [ ] **Step 8: Commit**

```bash
git add src/styles/themes/_press-room.scss docs/superpowers/specs/assets/contrast-check.py
git commit -m "refactor(theme): repaint press-room onto the approved ramp

Anchors copied from the artifact exactly. Four rungs the contract has
and the artifact does not are interpolated along its ramp -- two of
them pulled tighter than the arithmetic, because the next rung down
(#ADA299, 2.28:1) is the grey the readability pass rejected twice.

Net effect: every text role clears AA, including ink-400, ink-300 and
paper-400, which were under it in BOTH themes. contrast-check.py is
committed as the harness that proves it, and is what replaces the
cascade comparers once the flip lands.

Inert: the live theme is still monochrome."
```

---

### Task 3: Give press-room its typefaces and its square edge

Two axes of the design that are still token-only: Archivo for display, Geist for body and Geist Mono for the labels; and the press-room edge, which the mock states as one rule — `.hp * { border-radius: 0 }`. Everything is square, buttons included.

**Files:**
- Modify: `src/styles/themes/_press-room.scss` (type and radii blocks)

**Interfaces:**
- Consumes: `family-display` from Task 1.
- Produces: `--family-display` = Archivo, `--family-sans` = Geist, `--family-mono` = Geist Mono, and all six radius rungs at `0`. Task 4 wires `--font-heading` to the display slot; Task 5 links the webfonts.

- [ ] **Step 1: Replace the type block**

The fallback stacks matter: until Task 5 links the fonts, and for any viewer whose font request fails, these are what actually renders.

```scss
  /* Type — Archivo for display, Geist for everything else. The
     webfont is linked in Base.astro, so this half of the change is
     inert until the <head> moves with it (Task 5). That is deliberate:
     fonts are the one token family that cannot be flipped from the
     stylesheet alone, and pretending otherwise renders the fallback. */
  'family-display': 'Archivo, "Archivo Fallback", system-ui, sans-serif',
  'family-sans': 'Geist, "Geist Fallback", system-ui, -apple-system, sans-serif',
  'family-mono': '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
```

Leave `family-system`, `family-mono-jetbrains`, `family-mono-sf`, `family-mono-sf-bare` and `family-mono-courier` untouched — they belong to the blog code chrome, which the spec puts out of scope.

- [ ] **Step 2: Replace the radii block**

```scss
  /* Radii — the press-room edge, stated by the mock as a single rule:
     `.hp * { border-radius: 0 }`. Every rung goes to zero, the pill
     included; a pill button in this design is not a softer rung, it is
     the wrong shape. The family keeps its six names because renaming
     it while it happens to be uniform would cost a later theme the
     ability to be round again. */
  'radius-sm': 0,
  'radius-md': 0,
  'radius-lg': 0,
  'radius-xl': 0,
  'radius-2xl': 0,
  'radius-pill': 0,
```

- [ ] **Step 3: Verify press-room compiles and the radii actually reach the buttons**

```bash
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build
grep -o 'border-radius:[^;]*' dist/_astro/*.css | sort | uniq -c | sort -rn | head
```

Expected: build succeeds, and the dominant value is `0`. Any surviving non-zero radius is a component that hardcodes one instead of reading `--radius-*` — record it, it is a real defect of the same class Phase 6c fixed.

- [ ] **Step 4: Restore monochrome and confirm the change is inert**

```bash
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
npm run build 2>&1 | tail -3
```

Run the comparers against the pre-task build. Expected: zero declaration diffs.

- [ ] **Step 5: Commit**

```bash
git add src/styles/themes/_press-room.scss
git commit -m "refactor(theme): press-room takes Archivo, Geist, and a square edge

Radii all go to zero, the pill included -- the mock states the edge as
one rule and a pill button is a different shape, not a softer rung.
The six rung names survive on purpose: collapsing them now would cost
a later theme the ability to be round.

The type half is inert until Base.astro links the fonts. Fonts are the
one token family a stylesheet cannot flip alone.

Inert: the live theme is still monochrome."
```

---

### Task 4: Point the heading role at the display slot

The display family exists but nothing reads it. One line in the semantic layer connects it — and because monochrome's `family-display` equals its `family-sans`, the change renders identically under the live theme.

**Files:**
- Modify: `src/styles/tokens/_semantic.scss:272`

**Interfaces:**
- Consumes: `--family-display` from Tasks 1 and 3.
- Produces: `--font-heading` resolving to the theme's display family. Every `h1`–`h6` and every component reading `--font-heading` follows automatically.

- [ ] **Step 1: Repoint the role**

Replace line 272 of `src/styles/tokens/_semantic.scss`:

```scss
  /* The heading role reads the DISPLAY slot, not the sans one. A theme
     that wants one typeface sets family-display equal to family-sans
     and nothing here changes; a theme that wants two gets them without
     a single component learning a second font name. */
  --font-heading: var(--family-display);
  --font-body: var(--family-sans);
```

- [ ] **Step 2: Verify it is inert under monochrome**

```bash
npm run build 2>&1 | tail -3
grep -o 'font-family:[^;]*' dist/_astro/*.css | sort -u | head -20
```

Expected: build succeeds and the emitted `font-family` values are unchanged, because monochrome sets `family-display` and `family-sans` to the same stack. Run the comparers against the pre-task build — expected: zero declaration diffs.

- [ ] **Step 3: Verify it is live under press-room**

```bash
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build
grep -c 'Archivo' dist/_astro/*.css
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
```

Expected: a non-zero count. If it is zero, `--font-heading` is not reaching any rendered rule and the heading type will not change at the flip — investigate before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens/_semantic.scss
git commit -m "refactor(tokens): the heading role reads the display slot

One line. A single-typeface theme sets family-display equal to
family-sans and renders identically -- which is why this is provably
inert under monochrome and provably live under press-room.

Inert: the live theme is still monochrome."
```

---

### Task 5: The flip

One `@use` and one `<link>`. Everything the previous four tasks staged goes live at once. **This is where the five cascade comparers retire** — from here on, everything moves on purpose and "nothing changed" is the wrong question.

**Files:**
- Modify: `src/styles/main.scss:11`
- Modify: `src/layouts/Base.astro:51-55`

**Interfaces:**
- Consumes: everything from Tasks 1–4.
- Produces: the live Paper & Ember skin, site-wide, across all 90 built pages.

- [ ] **Step 1: Flip the theme**

```bash
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
grep -n "themes/" src/styles/main.scss
```

Expected: `@use 'themes/press-room';`. The `monochrome` partial stays on disk — it is the proof the flip is two-way, and Task 1's contract keeps it compiling.

- [ ] **Step 2: Link the webfonts**

Replace the Outfit link in `src/layouts/Base.astro` (lines 51–55) with:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
    />
```

Weights are the ones the mock actually uses: Archivo 600–800 for display, Geist 400–700 for body and UI, Geist Mono 400–500 for labels and figures. Do not request the full 100–900 range — it is three families now, not one.

- [ ] **Step 3: Build and check the ratios survived the round trip**

```bash
npm run build 2>&1 | tail -3
python3 docs/superpowers/specs/assets/contrast-check.py
npm run astro check 2>&1 | tail -5
```

Expected: build succeeds, all 17 roles clear AA, type-check clean.

- [ ] **Step 4: Confirm monochrome is still reversible**

```bash
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
npm run build 2>&1 | tail -3
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build 2>&1 | tail -3
```

Expected: both succeed. The flip is one line in both directions — that is the whole architecture, demonstrated.

- [ ] **Step 5: Load the built site in a real browser**

Rolldown means a green build does not imply a working page. This is not optional:

```bash
npm run preview
```

Open `http://localhost:4321/`, then check: the page background is warm (`#F7F4F2`), headings render in Archivo (not a fallback), body in Geist, corners are square, and the console is clean. Load `/about`, `/contact` and one blog post as well — the flip is site-wide and these are the pages most likely to expose a hardcoded colour that survived the token refactor.

- [ ] **Step 6: Commit**

```bash
git add src/styles/main.scss src/layouts/Base.astro
git commit -m "feat(theme): flip the site to Paper and Ember

One @use and one <link>. Four tasks of token work land at once across
all 90 pages, and monochrome still compiles -- verified by flipping
back and forward before committing.

This retires the five cascade comparers. They answer 'did anything
move', which was the right question for a refactor that must not
change what renders; from here everything moves on purpose.
contrast-check.py takes over, plus astro check, both themes building,
and an actual browser load."
```

---

### Task 6: Join services to the products that prove them

The spec calls `proves` "the join that lets one page serve both audiences":
each service names the product that demonstrates it. So the field holds a
product's collection id, not prose -- which means a service naming a product
that does not exist fails the build instead of rendering a dead reference.

**Files:**
- Modify: `src/content.config.ts` (the `services` collection schema)
- Modify: all four files in `src/content/services/`

**Interfaces:**
- Produces: `proves: string` on every `services` entry, holding a valid
  `products` collection id. Consumed by `Services.astro` in Task 10, which
  resolves it against the products collection to render the product's title
  and a link to it.

- [ ] **Step 1: Add the field to the schema**

In `src/content.config.ts`, add to the `services` collection's `z.object({...})`:

```ts
      // The id of the product that demonstrates this service. Not prose:
      // this is a join, and Services.astro resolves it against the products
      // collection. Required, because a service with nothing shipped behind
      // it is a claim, and the design has nowhere to put a claim.
      proves: z.string(),
```

- [ ] **Step 2: Build and watch it fail**

```bash
npm run build 2>&1 | grep -i 'proves'
```

Expected: a Zod error naming all four service files. This confirms the field
is required and the collection is actually validated.

- [ ] **Step 3: Point each service at its product**

The four services and four products pair one-to-one:

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io
sed -i '' '/^excerpt:/a\
proves: orgvitals
' src/content/services/salesforce-consulting.md
sed -i '' '/^excerpt:/a\
proves: algobridge
' src/content/services/airflow-data-pipelines.md
sed -i '' '/^excerpt:/a\
proves: pledgivo
' src/content/services/product-development.md
sed -i '' '/^excerpt:/a\
proves: insurealgo
' src/content/services/support-and-managed-services.md
head -8 src/content/services/*.md
```

Confirm each file gained a `proves:` line and the `---` fences are intact.

- [ ] **Step 4: Prove the join actually resolves**

A `z.string()` accepts any string, so the schema alone does not stop a typo.
Check every id against the products collection:

```bash
for f in src/content/services/*.md; do
  id=$(grep '^proves:' "$f" | sed 's/proves: *//')
  [ -f "src/content/products/$id.md" ] \
    && echo "ok   $(basename $f) -> $id" \
    || echo "FAIL $(basename $f) -> $id (no such product)"
done
```

Expected: four `ok` lines. Any `FAIL` is a broken join that would render as a
missing product title in Task 10.

- [ ] **Step 5: Verify**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
```

Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/services/
git commit -m "feat(content): each service names the product that proves it

Not prose -- an id into the products collection. The home page sells
services to buyers and products to developers, and this field is the join
that lets one page do both: every service points at something shipped.

Required, so a service with nothing behind it fails the build."
```

---

### Task 7: Hero

Fold 1. Display headline with an ember underline on the emphasised span, a two-button fork, and a standfirst. The mock's markup is `hp__hero` / `hp__h1` / `hp__fork` / `hp__standfirst`; its CSS is `home-mock.css:107-120`.

**Files:**
- Modify: `src/components/sections/Hero.astro` (full rewrite of markup)
- Create: `src/styles/sections/_hero-press.scss`
- Create: `src/styles/layout/_section-press.scss` (shared by Tasks 9, 10, 12, 13)
- Modify: `src/styles/main.scss` (register the partial)
- Modify: `src/styles/tokens/_components.scss` (add `--container-pad`)
- Modify: `src/pages/index.astro` (no import change — Hero keeps its name)

**Interfaces:**
- Produces: `<Hero />`, no props. Consumed by `src/pages/index.astro`.
- Produces: `--container-pad`, `.btn-row`, `.section-press`, `.section-press__head` -- all consumed by later section tasks. Build this task before Tasks 9-13.

- [ ] **Step 1: Define the container gutter token**

Every section below reads `var(--container-pad)`. `--container-max` already
exists at `src/styles/tokens/_components.scss:175`, but the gutter does not --
it is currently repeated as a literal in each layout partial. Add it beside
`--container-max`:

```scss
  /* The page gutter, named because nine sections are about to read it.
     It was a repeated literal in each layout partial; one name means the
     page can breathe differently without editing nine files. */
  --container-pad: 2rem;
```

Verify it resolves before anything depends on it:

```bash
npm run build 2>&1 | tail -3
grep -c 'container-pad' dist/_astro/*.css
```

Expected: a non-zero count.

- [ ] **Step 2: Create the shared section shell**

Four folds (products, services, case studies, journal) use the same outer
frame and the same heading row. It gets its own partial rather than living
inside whichever section happens to be built first.

Create `src/styles/layout/_section-press.scss`:

```scss
/* The frame every content fold sits in, and the rule-under-heading row
   at its top. Shared by four sections -- it lives here rather than in
   the first section that happened to need it, because a shared shell
   owned by one section is how a design system rots. */

.section-press {
  max-width: var(--container-max);
  margin-inline: auto;
  padding: 3.5rem var(--container-pad);
}

.section-press__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--border-default);
  padding-bottom: 0.75rem;
  margin-bottom: 1.75rem;
}
```

Register it before the sections that consume it:

```bash
sed -i '' "s|^@use 'layout/container';|@use 'layout/container';\n@use 'layout/section-press';|" src/styles/main.scss
```

- [ ] **Step 3: Port the mock's hero CSS onto tokens**

Create `src/styles/sections/_hero-press.scss`. Every value comes from `home-mock.css:107-120`; every colour and family is replaced by the token that carries it:

```scss
/* Fold 1. Ported from docs/superpowers/specs/assets/home-mock.css:107-120.
   The mock's raw custom properties map onto the token layer as:
   --display -> --font-heading, --acc -> --color-accent,
   --ink2 -> --color-heading, --muted -> --color-text. */

.hero-press {
  padding: 3.5rem var(--container-pad) 2.125rem;
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 2.5rem;
  align-items: end;
  max-width: var(--container-max);
  margin-inline: auto;
}

.hero-press__title {
  font-family: var(--font-heading);
  font-weight: var(--weight-bold);
  font-size: clamp(2.2rem, 5.6vw, 3.6rem);
  line-height: 1.02;
  letter-spacing: -0.038em;
  margin: 0;
  max-width: 15ch;
  text-wrap: balance;
}

/* The emphasised span is underlined by a gradient rather than
   text-decoration, so the rule sits below the baseline at a
   controlled height and survives a line wrap intact. */
.hero-press__mark {
  text-decoration: none;
  color: var(--color-heading);
  background: linear-gradient(
    transparent 78%,
    var(--color-accent) 78%,
    var(--color-accent) 99%,
    transparent 99%
  );
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

/* Not hero-scoped: the products panel uses the same row. Named for what
   it is, so a later section does not have to reach into a hero class to
   get a row of buttons. */
.btn-row {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.hero-press .btn-row { margin-top: 1.625rem; }

.hero-press__standfirst {
  font-size: var(--size-body);
  line-height: 1.6;
  color: var(--color-text);
  max-width: 46ch;
  margin: 0;
}

@media (max-width: 860px) {
  .hero-press {
    grid-template-columns: 1fr;
    gap: 1.625rem;
  }
}
```

- [ ] **Step 4: Register the partial**

```bash
sed -i '' "s|^@use 'sections/hero';|@use 'sections/hero';\n@use 'sections/hero-press';|" src/styles/main.scss
grep -n "hero" src/styles/main.scss
```

- [ ] **Step 5: Rewrite the component**

Replace the whole of `src/components/sections/Hero.astro`. The `---` fence must be the first bytes of the file:

```astro
---
// Fold 1. Structure follows docs/superpowers/specs/assets/home-mock.html
// (.hp__hero). The entrance animation lives on the section wrapper, not
// on anything inside an island -- see the note in StatsBar.astro.
---
<section class="hero-press anim-fade-up">
  <div>
    <h1 class="hero-press__title">
      Most orgs do not need more Salesforce.
      They need <span class="hero-press__mark">less of the wrong Salesforce</span>.
    </h1>
    <div class="btn-row">
      <a class="btn btn-primary" href="/services/">See what we cut</a>
      <a class="btn btn-outline" href="/products/">Browse the tools</a>
    </div>
  </div>
  <p class="hero-press__standfirst">
    We are a four-person Salesforce and Heroku shop. We ship managed packages,
    move data between systems that were never meant to talk, and delete more
    configuration than we add.
  </p>
</section>
```

- [ ] **Step 6: Verify**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `http://localhost:4321/`. Confirm: the headline is Archivo, the ember underline sits under the emphasised phrase and does not clip descenders, the two buttons are square and sit on one line each, and the layout collapses to a single column below 860px. Console clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/Hero.astro src/styles/sections/_hero-press.scss src/styles/layout/_section-press.scss src/styles/main.scss src/styles/tokens/_components.scss
git commit -m "feat(home): rebuild the hero on the approved mock

Underline is a gradient, not text-decoration -- it sits below the
baseline at a controlled height and box-decoration-break keeps it
intact across a wrap. Every value ported from the mock; every colour
and family resolved through a token."
```

---

### Task 8: Proof strip

Fold 2. Four static figures. The mock has no count-up, so this does not mount an island — but `StatsBar` stays on disk because `src/pages/about.astro:303` still mounts it.

**Files:**
- Create: `src/components/sections/ProofStrip.astro`
- Create: `src/styles/components/_proof-strip.scss`
- Modify: `src/styles/main.scss`
- Modify: `src/pages/index.astro` (swap `StatsBar` for `ProofStrip`)

**Interfaces:**
- Produces: `<ProofStrip />`, no props.
- Does NOT touch: `StatsBar.astro`, `StatsCounter.tsx`. Still live on `/about`.

- [ ] **Step 1: Write the stylesheet**

Create `src/styles/components/_proof-strip.scss`, ported from `home-mock.css` (`.hp__proof`):

```scss
/* Fold 2. Four figures, no count-up -- the mock has none, and an
   animated number is a different claim from a stated one. */

.proof-strip {
  max-width: var(--container-max);
  margin-inline: auto;
  padding: 0 var(--container-pad) 2.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-default);
  border-block: 1px solid var(--border-default);
}

.proof-strip__cell {
  background: var(--surface-page);
  padding: 1.25rem 1rem;
}

.proof-strip__figure {
  font-family: var(--font-heading);
  font-weight: var(--weight-bold);
  font-size: 1.75rem;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-heading);
  font-variant-numeric: tabular-nums;
}

.proof-strip__label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

@media (max-width: 760px) {
  .proof-strip { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 2: Write the component**

Create `src/components/sections/ProofStrip.astro`:

```astro
---
// Fold 2. Static figures by design -- see the stylesheet header.
const proof = [
  { figure: '70+',  label: 'Projects delivered' },
  { figure: '4',    label: 'Managed packages shipped' },
  { figure: '10s',  label: 'Salesforce-to-Postgres lag' },
  { figure: '6 yr', label: 'Longest running retainer' },
];
---
<section class="proof-strip anim-fade-up" aria-label="Proof">
  {proof.map((p) => (
    <div class="proof-strip__cell">
      <div class="proof-strip__figure">{p.figure}</div>
      <div class="proof-strip__label">{p.label}</div>
    </div>
  ))}
</section>
```

- [ ] **Step 3: Register the partial and swap it into the page**

```bash
sed -i '' "s|^@use 'components/stats';|@use 'components/stats';\n@use 'components/proof-strip';|" src/styles/main.scss
sed -i '' "s|^import StatsBar from '../components/sections/StatsBar.astro';|import ProofStrip from '../components/sections/ProofStrip.astro';|" src/pages/index.astro
sed -i '' 's|^  <StatsBar />|  <ProofStrip />|' src/pages/index.astro
grep -n "StatsBar\|ProofStrip" src/pages/index.astro src/pages/about.astro
```

Expected: `index.astro` names only `ProofStrip`; `about.astro` still names `StatsBar` twice (import and mount). That second result is the point — do not "clean it up".

- [ ] **Step 4: Verify**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `/` and confirm the four figures render as a hairline-separated row that collapses to 2×2 below 760px. Then open `/about` and confirm the count-up still runs — the island must be untouched and un-broken.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ProofStrip.astro src/styles/components/_proof-strip.scss src/styles/main.scss src/pages/index.astro
git commit -m "feat(home): static proof strip replaces the counter on the home page

The mock has no count-up, so this mounts no island. StatsBar and
StatsCounter stay on disk: about.astro still mounts them, and deleting
them now would silently redesign a page nobody has designed yet. They
die when /about does."
```

---

### Task 9: Products

Fold 3. One featured product with chips and buttons, then three rows. The products collection already carries `status` and `type`, so the live status dot and the mono type-label need no schema work.

**Files:**
- Modify: `src/components/sections/ProductsSection.astro` (full rewrite)
- Create: `src/styles/sections/_products-press.scss`
- Modify: `src/styles/main.scss`

**Interfaces:**
- Consumes: the `products` collection — `title`, `status` (`'ga' | 'preview' | 'beta'`), `type`, `tagline`, `excerpt`, `externalUrl?`, `order`.
- Consumes: `.section-press` / `.section-press__head`, `.btn-row` and `--container-pad` from Task 7.
- Produces: `<ProductsSection />`, no props.

- [ ] **Step 1: Port the mock CSS**

Create `src/styles/sections/_products-press.scss` from `home-mock.css` (`.hp__sec`, `.hp__sechead`, `.hp__feat`, `.hp__featl`, `.hp__chips`, `.hp__featbtns`, `.hp__featr`, `.hp__rows`, `.hp__row`). Port the geometry verbatim; replace every colour with its token:

```scss
/* Fold 3. Ported from the mock's .hp__feat / .hp__rows block.
   `.section-press` and `.section-press__head` are NOT defined here --
   four folds share them, so they live in layout/_section-press.scss
   (Task 7). A shared shell owned by one section is how a system rots.
   The featured panel is the one ember-washed surface on the page --
   hence accent-050 for its ground and accent-200 for its inner rule,
   which is why both are contract keys. */

.products-press__feature {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 2rem;
  background: var(--surface-wash-accent, var(--accent-050));
  border: 1px solid var(--accent-200);
  padding: 1.75rem;
}

.products-press__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.products-press__chip {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--accent-200);
  padding: 0.25rem 0.5rem;
  color: var(--color-text-muted);
}

.products-press__rows {
  border-top: 1px solid var(--border-default);
  margin-top: 2rem;
}

.products-press__row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--border-default);
}

/* Status dot. GA is the ember; anything pre-release is a hollow ring,
   so "not finished yet" reads without relying on hue alone. */
.products-press__status {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  margin-right: 0.5rem;
  border: 1px solid var(--color-accent);
}
.products-press__status--ga { background: var(--color-accent); }

@media (max-width: 860px) {
  .products-press__feature,
  .products-press__row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Rewrite the component**

Replace `src/components/sections/ProductsSection.astro`:

```astro
---
import { getCollection } from 'astro:content';

// Fold 3. The collection already carries `status` and `type`, so the
// live dot and the mono type-label are read, not invented.
const products = (await getCollection('products')).sort(
  (a, b) => a.data.order - b.data.order
);
const [featured, ...rest] = products;

const TYPE_LABEL: Record<string, string> = {
  'salesforce-app': 'Salesforce app',
  'integration': 'Integration',
  'mobile-app': 'Mobile app',
  'desktop-app': 'Desktop app',
};
---
<section class="section-press anim-fade-up" aria-labelledby="products-heading">
  <div class="section-press__head">
    <h2 id="products-heading" class="section-title">Products</h2>
    <a href="/products/">All products</a>
  </div>

  <article class="products-press__feature">
    <div>
      <h3>{featured.data.title}</h3>
      <p>{featured.data.tagline}</p>
      <div class="products-press__chips">
        <span class="products-press__chip">{TYPE_LABEL[featured.data.type]}</span>
        <span class="products-press__chip">{featured.data.status.toUpperCase()}</span>
      </div>
      <div class="btn-row">
        <a class="btn btn-primary" href={`/products/${featured.id}/`}>Read the detail</a>
        {featured.data.externalUrl && (
          <a class="btn btn-outline" href={featured.data.externalUrl}>Open the app</a>
        )}
      </div>
    </div>
    <p>{featured.data.excerpt}</p>
  </article>

  <div class="products-press__rows">
    {rest.map((p) => (
      <div class="products-press__row">
        <h3>
          <span
            class:list={['products-press__status', { 'products-press__status--ga': p.data.status === 'ga' }]}
            aria-hidden="true"
          ></span>
          {p.data.title}
        </h3>
        <p>{p.data.tagline}</p>
        <a href={`/products/${p.id}/`}>Detail</a>
      </div>
    ))}
  </div>
</section>
```

Note `p.id`, not `p.slug` — the Astro content-layer change this repo already hit.

- [ ] **Step 3: Register and verify**

```bash
sed -i '' "s|^@use 'sections/services';|@use 'sections/products-press';\n@use 'sections/services';|" src/styles/main.scss
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `/`. Confirm: the featured panel is ember-washed with a visible inner rule, three rows follow with a filled dot on GA and a hollow ring otherwise, and every product link resolves (click each one — a broken `p.id` route shows up as a 404, not a build error).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ProductsSection.astro src/styles/sections/_products-press.scss src/styles/main.scss
git commit -m "feat(home): products as one featured panel and three rows

status and type were already in the collection schema, so the live dot
and the type label are read rather than hardcoded. GA fills the dot and
pre-release leaves it hollow -- shape, not just hue, so the state
survives a monochrome theme and a colour-blind reader."
```

---

### Task 10: Services (and delete WhyUs)

Fold 4. Four rows, each pairing a service with the `proves` field from Task 6. The mock folds the old "Why us" section into this one — its claims become the proof column.

**Files:**
- Modify: `src/components/sections/Services.astro` (full rewrite)
- Create: `src/styles/sections/_services-press.scss`
- Delete: `src/components/sections/WhyUs.astro`
- Modify: `src/styles/main.scss`, `src/pages/index.astro`

**Interfaces:**
- Consumes: the `services` collection including `proves` (Task 6).
- Consumes: `.section-press` / `.section-press__head`, `.btn-row` and `--container-pad` from Task 7.
- Produces: `<Services />`, no props.

- [ ] **Step 1: Confirm WhyUs is not used anywhere else before deleting it**

```bash
grep -rn "WhyUs" src/ | grep -v node_modules
```

Expected: only `src/pages/index.astro` (import + mount) and the component itself. **If any other page mounts it, stop** — deleting it would change an undesigned page, exactly as with `StatsBar`. Fold it on the home page only and leave the file.

- [ ] **Step 2: Write the stylesheet**

Create `src/styles/sections/_services-press.scss`, ported from the mock's `.hp__svc` / `.hp__svcrow`:

```scss
/* Fold 4. The old "Why us" section folded in here twice over: its claims
   about how the team works are the standfirst, and each row now points at
   the product that proves it. */

.services-press__standfirst {
  font-size: var(--size-body-lg);
  line-height: 1.6;
  color: var(--color-prose-soft);
  max-width: 52ch;
  margin: 0 0 2rem;
  text-wrap: pretty;
}

.services-press__provelabel {
  display: block;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-bottom: 0.25rem;
}

.services-press__row {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1.2fr;
  gap: 1.5rem;
  align-items: start;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-default);
}

.services-press__row:first-child { border-top: 1px solid var(--border-default); }

.services-press__proof {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-text-muted);
  border-left: 2px solid var(--color-accent);
  padding-left: 0.875rem;
}

@media (max-width: 860px) {
  .services-press__row { grid-template-columns: 1fr; gap: 0.75rem; }
}
```

- [ ] **Step 3: Rewrite the component**

Replace `src/components/sections/Services.astro`:

```astro
---
import { getCollection } from 'astro:content';

// Fold 4. WhyUs folded in here: its claims about how the team works are
// the standfirst below, where they introduce the rows instead of
// competing with them as their own section.
const services = (await getCollection('services')).sort(
  (a, b) => a.data.order - b.data.order
);

// The join. `proves` is a product id, so every row can point at something
// shipped. A missing product is a content error, not a render branch --
// Task 6 step 4 checks the ids resolve.
const products = new Map(
  (await getCollection('products')).map((p) => [p.id, p.data])
);
---
<section class="section-press anim-fade-up" aria-labelledby="services-heading">
  <div class="section-press__head">
    <h2 id="services-heading" class="section-title">Services</h2>
    <a href="/services/">All services</a>
  </div>

  <p class="services-press__standfirst">
    Four people, no bench, no handoffs. The person who scopes your build is
    the person who writes it, and everything below has shipped something we
    still maintain.
  </p>

  {services.map((s) => (
    <div class="services-press__row">
      <h3><a href={`/services/${s.id}/`}>{s.data.title}</a></h3>
      <p>{s.data.excerpt}</p>
      <p class="services-press__proof">
        <span class="services-press__provelabel">Proved by</span>
        <a href={`/products/${s.data.proves}/`}>{products.get(s.data.proves)?.title}</a>
      </p>
    </div>
  ))}
</section>
```

- [ ] **Step 4: Delete WhyUs and unwire it**

```bash
git rm src/components/sections/WhyUs.astro
sed -i '' "/^import WhyUs from/d" src/pages/index.astro
sed -i '' "/^  <WhyUs \/>/d" src/pages/index.astro
sed -i '' "s|^@use 'sections/services';|@use 'sections/services';\n@use 'sections/services-press';|" src/styles/main.scss
grep -rn "WhyUs" src/ | grep -v node_modules
```

Expected: no matches.

- [ ] **Step 5: Verify**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `/`. Confirm four service rows, each with an ember-ruled proof column reading its `proves` value, collapsing to a single column below 860px.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/sections src/styles src/pages/index.astro
git commit -m "feat(home): services rows carry their own proof; WhyUs folds in

'Why us' was a section of claims with nothing attached to them. Each
claim now sits beside the service that earned it, which is what the
schema's required proves field is for.

Checked before deleting: index.astro was WhyUs's only consumer."
```

---

### Task 11: Band (and delete Testimonials)

Fold 5. A full-bleed ember band carrying one quote. Replaces the Testimonials section, which was already static markup for a single quote — the carousel was removed long ago and must not come back.

**Files:**
- Create: `src/components/sections/Band.astro`
- Create: `src/styles/components/_band.scss`
- Delete: `src/components/sections/Testimonials.astro`
- Modify: `src/styles/main.scss`, `src/pages/index.astro`

**Interfaces:**
- Produces: `<Band />`, no props.

- [ ] **Step 1: Confirm Testimonials is only used by the home page**

```bash
grep -rn "Testimonials" src/ | grep -v node_modules
```

Expected: only `index.astro` and the component. If another page mounts it, leave the file and unwire the home page only.

- [ ] **Step 2: Write the stylesheet**

Create `src/styles/components/_band.scss`, ported from the mock's `.hp__band` / `.hp__quote`:

```scss
/* Fold 5. The one full-bleed surface on the page. Ink on ember, not
   white: white on #F75A41 is 3.2:1 and fails AA, which is the whole
   reason accent-on is a theme key rather than an assumption. */

.band {
  background: var(--color-accent);
  color: var(--color-on-accent);
  padding: 3rem var(--container-pad);
}

.band__inner {
  max-width: var(--container-max);
  margin-inline: auto;
}

.band__quote {
  font-family: var(--font-heading);
  font-weight: var(--weight-semibold);
  font-size: clamp(1.35rem, 2.6vw, 2rem);
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0;
  max-width: 24ch;
  text-wrap: balance;
}

.band__attrib {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 1.25rem;
}

/* The quote is the attribution for the ask, not a standalone testimonial.
   The CTA sits under it so the sequence reads: someone said this, so here
   is what to do about it. */
.band__cta { margin-top: 1.75rem; }

/* On ember, the filled button's own black-on-ember is the same pairing as
   the band text. Give it the paper surface instead so it reads as a
   control rather than as more type. */
.band .btn-primary {
  background: var(--surface-card);
  color: var(--color-heading);
}
.band .btn-primary:hover { background: var(--surface-wash); opacity: 1; }
```

- [ ] **Step 3: Write the component**

Create `src/components/sections/Band.astro`. Carry across the quote and attribution from the existing `Testimonials.astro` rather than inventing one — read that file before deleting it:

```astro
---
// Fold 5. One quote, full-bleed, carrying the consulting ask -- the quote
// is the attribution for the CTA, not a standalone testimonial.
// Static by design: this was a Swiper carousel once, and a carousel for a
// single quote is a control with nothing to control. Do not reintroduce one.
---
<section class="band anim-fade-up">
  <div class="band__inner">
    <blockquote class="band__quote">
      Their expertise, dedication, collaboration and innovative solutions
      have consistently exceeded our expectations.
    </blockquote>
    <p class="band__attrib">Director of IT, enterprise insurance client</p>
    <div class="btn-row band__cta">
      <a class="btn btn-primary" href="/contact/">Tell us what is broken</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Swap it in and delete Testimonials**

```bash
cat src/components/sections/Testimonials.astro   # confirm the quote you carried across
git rm src/components/sections/Testimonials.astro
sed -i '' "s|^import Testimonials from '../components/sections/Testimonials.astro';|import Band from '../components/sections/Band.astro';|" src/pages/index.astro
sed -i '' 's|^  <Testimonials />|  <Band />|' src/pages/index.astro
sed -i '' "s|^@use 'components/testimonials';|@use 'components/testimonials';\n@use 'components/band';|" src/styles/main.scss
grep -rn "Testimonials" src/pages/ | grep -v node_modules
```

Expected: no matches in `src/pages/`.

- [ ] **Step 5: Verify contrast on the band specifically**

```bash
npm run build 2>&1 | tail -3
python3 docs/superpowers/specs/assets/contrast-check.py
npm run preview
```

Expected: `accent-on` on `accent-500` reads 6.17:1. In the browser, confirm the band is full-bleed edge to edge (no container gutter showing ember on one side only) and the quote is dark ink on ember, not white.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/sections src/styles src/pages/index.astro
git commit -m "feat(home): one full-bleed ember band replaces the testimonials fold

Ink on ember at 6.17:1. White would be 3.2:1 and fail AA -- that
constraint is why accent-on is a theme key and not a guess.

Static, and staying static: this was a Swiper carousel for a single
quote before it was static markup, and it is not going back."
```

---

### Task 12: Case studies

Fold 6. Two case cards, each led by its figure. `src/data/case-studies.ts` already carries `metric`, `metricLabel`, `company`, `industry` and `headline` — nothing new is needed.

**Files:**
- Create: `src/components/sections/CaseStudies.astro`
- Create: `src/styles/sections/_cases-press.scss`
- Modify: `src/styles/main.scss`, `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/data/case-studies.ts` — `id`, `company`, `industry`, `metric`, `metricLabel`, `headline`.
- Consumes: `.section-press` / `.section-press__head`, `.btn-row` and `--container-pad` from Task 7.
- Produces: `<CaseStudies />`, no props.

- [ ] **Step 1: Write the stylesheet**

Create `src/styles/sections/_cases-press.scss`, ported from the mock's `.hp__cases` / `.hp__case` / `.hp__casefig`:

```scss
/* Fold 6. Figure first, prose second -- the mock leads each card with
   the number, because the number is the reason to read the card. */

.cases-press {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--border-default);
  border: 1px solid var(--border-default);
}

.cases-press__case {
  background: var(--surface-card);
  padding: 1.75rem;
  display: block;
  color: inherit;
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-out);
}

.cases-press__case:hover { background: var(--surface-wash); }

.cases-press__fig {
  font-family: var(--font-heading);
  font-weight: var(--weight-bold);
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.035em;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
}

.cases-press__figlabel {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: 0.375rem;
}

.cases-press__meta {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-top: 1.25rem;
}

@media (max-width: 760px) {
  .cases-press { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Write the component**

Create `src/components/sections/CaseStudies.astro`:

```astro
---
import { caseStudies } from '../../data/case-studies';

// Fold 6. Two cards. The figures are already in the data file -- this
// reads them rather than restating them, so a corrected number is
// corrected in one place.
const featured = caseStudies.slice(0, 2);
---
<section class="section-press anim-fade-up" aria-labelledby="cases-heading">
  <div class="section-press__head">
    <h2 id="cases-heading" class="section-title">Case studies</h2>
    <a href="/case-studies/">All case studies</a>
  </div>

  <div class="cases-press">
    {featured.map((c) => (
      <a class="cases-press__case" href={`/case-studies/${c.id}/`}>
        <div class="cases-press__fig">{c.metric}</div>
        <div class="cases-press__figlabel">{c.metricLabel}</div>
        <h3>{c.headline}</h3>
        <div class="cases-press__meta">{c.company} · {c.industry}</div>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Wire it in**

```bash
sed -i '' "s|^import BlogPreview from|import CaseStudies from '../components/sections/CaseStudies.astro';\nimport BlogPreview from|" src/pages/index.astro
sed -i '' 's|^  <BlogPreview />|  <CaseStudies />\n  <BlogPreview />|' src/pages/index.astro
sed -i '' "s|^@use 'sections/industries';|@use 'sections/cases-press';\n@use 'sections/industries';|" src/styles/main.scss
grep -n "CaseStudies" src/pages/index.astro
```

- [ ] **Step 4: Verify**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `/`. Confirm two cards side by side with ember figures, hover washes the card, both links resolve to real case-study pages, and the grid stacks below 760px.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/CaseStudies.astro src/styles/sections/_cases-press.scss src/styles/main.scss src/pages/index.astro
git commit -m "feat(home): two case cards, figure first

The metrics already lived in src/data/case-studies.ts, so this reads
them instead of restating them -- one place to correct a number."
```

---

### Task 13: Journal

Fold 7. A list of recent posts with a side rail. Replaces the existing `BlogPreview` layout.

**Files:**
- Modify: `src/components/sections/BlogPreview.astro` (full rewrite)
- Create: `src/styles/sections/_journal-press.scss`
- Modify: `src/styles/main.scss`

**Interfaces:**
- Consumes: the `blog` collection — `title`, `date`, `category`, `excerpt`, `readTime`, `published`.
- Consumes: `.section-press` / `.section-press__head`, `.btn-row` and `--container-pad` from Task 7.
- Produces: `<BlogPreview />`, no props.

- [ ] **Step 1: Write the stylesheet**

Create `src/styles/sections/_journal-press.scss`, ported from the mock's `.hp__jrn` / `.hp__jrnside`:

```scss
/* Fold 7. A list, not cards. Three posts read faster as rows than as
   three equal tiles, and the side rail carries the category index. */

.journal-press {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 2.5rem;
}

.journal-press__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: baseline;
  padding: 1.125rem 0;
  border-bottom: 1px solid var(--border-default);
}

.journal-press__date {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.journal-press__side {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 2;
  color: var(--color-text-muted);
  border-left: 1px solid var(--border-default);
  padding-left: 1.5rem;
}

@media (max-width: 860px) {
  .journal-press { grid-template-columns: 1fr; gap: 1.5rem; }
  .journal-press__side { border-left: 0; padding-left: 0; }
}
```

- [ ] **Step 2: Rewrite the component**

Replace `src/components/sections/BlogPreview.astro`:

```astro
---
import { getCollection } from 'astro:content';

// Fold 7. Rows, not cards -- three posts read faster as a list.
const posts = (await getCollection('blog', ({ data }) => data.published))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);

const categories = [...new Set(posts.map((p) => p.data.category))];

const fmt = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
---
<section class="section-press anim-fade-up" aria-labelledby="journal-heading">
  <div class="section-press__head">
    <h2 id="journal-heading" class="section-title">Journal</h2>
    <a href="/blog/">All posts</a>
  </div>

  <div class="journal-press">
    <div>
      {posts.map((p) => (
        <article class="journal-press__item">
          <time class="journal-press__date" datetime={p.data.date.toISOString()}>
            {fmt(p.data.date)}
          </time>
          <div>
            <h3><a href={`/blog/${p.id}/`}>{p.data.title}</a></h3>
            <p>{p.data.excerpt}</p>
          </div>
        </article>
      ))}
    </div>

    <aside class="journal-press__side">
      {categories.map((c) => (
        <div><a href={`/blog/?category=${encodeURIComponent(c)}`}>{c}</a></div>
      ))}
    </aside>
  </div>
</section>
```

- [ ] **Step 3: Register and verify**

```bash
sed -i '' "s|^@use 'sections/blog-featured';|@use 'sections/blog-featured';\n@use 'sections/journal-press';|" src/styles/main.scss
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
npm run preview
```

Open `/`. Confirm three dated rows with the side rail beside them, dates render as `04 Aug 2026` with tabular figures so the column aligns, and every post link resolves. Stacks below 860px.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/BlogPreview.astro src/styles/sections/_journal-press.scss src/styles/main.scss
git commit -m "feat(home): the journal fold becomes a dated list

Three equal cards was the generic shape; three dated rows read faster
and the tabular date column gives the list its spine. Side rail
carries the category index."
```

---

### Task 14: Footer CTA and colophon

Folds 8 and 9. The footer is site-wide, so this is the one section task that changes every page — verify accordingly.

**Files:**
- Modify: `src/styles/layout/_footer.scss`
- Modify: `src/components/layout/Footer.astro` (gains the products column)

**Interfaces:**
- Produces: `<Footer />`, no props. Mounted by `src/layouts/Page.astro` on every page.

- [ ] **Step 1: Read what the footer currently renders**

```bash
cat src/components/layout/Footer.astro
```

The colophon must keep every legally-required link the current footer carries (privacy, terms, cookie settings). Losing one to a redesign is a real defect, not a simplification. List them before editing.

- [ ] **Step 2: Restyle the CTA and colophon**

Use the class names the markup already carries -- `.footer-cta` for the CTA
strip, `.ca-footer` / `.ca-footer-inner` / `.ca-footer-grid` for the colophon,
`.ca-footer-copy` for the imprint line, `.ca-flinks` for the link columns. Do
not rename them; a redesign that also renames every selector makes the diff
unreviewable. Update `src/styles/layout/_footer.scss`:

```scss
/* Folds 8-9. The CTA sits on ink-800 rather than ink-900 so it reads
   as a distinct surface against the near-black colophon below it,
   and carries white at 15.0:1. */

.footer-cta {
  background: var(--surface-inverse-soft);
  color: var(--color-on-inverse);
  padding: 3.5rem 0;
}

.ca-footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.9;
}

.ca-flinks {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ca-footer-copy {
  border-top: 1px solid var(--border-on-inverse);
  padding-top: 1.25rem;
  margin-top: 2.5rem;
  color: var(--color-on-inverse-soft);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

@media (max-width: 860px) {
  .ca-footer-grid { grid-template-columns: repeat(2, 1fr); }
}
```

Note the two dead selectors already in this file -- `.main-footer` and
`.footer-brand` -- are carried by no element. Leave them; they belong to the
drift sweep, not to this task.

**Watch the frontmatter fence.** `src/components/layout/Footer.astro` line 1 is
literally `---import Button from '../ui/Button.astro';` -- the fence and the
first import share a line. That parses today, but if you reformat the
frontmatter, the `---` must still be the first bytes of the file or rolldown
reads the whole frontmatter as markup and reports a misleading
`Expected '}' but found ':'`.

- [ ] **Step 3: Give the products their own colophon column**

The spec's colophon mirrors the masthead and adds a products column -- the
footer is where a developer who scrolled past the products fold finds them
again. `.ca-footer-grid` is already a four-column grid, so this is a column
swap, not a layout change.

In `src/components/layout/Footer.astro`, add a products column beside the
existing link columns, reading the collection rather than hardcoding names:

```astro
---
import { getCollection } from 'astro:content';

const footerProducts = (await getCollection('products')).sort(
  (a, b) => a.data.order - b.data.order
);
---
```

and in the colophon grid:

```astro
      <div>
        <h3 class="ca-fcolhd">Products</h3>
        <ul class="ca-flinks">
          {footerProducts.map((p) => (
            <li><a href={`/products/${p.id}/`}>{p.data.title}</a></li>
          ))}
        </ul>
      </div>
```

**Watch the frontmatter fence.** `Footer.astro` line 1 is literally
`---import Button from '../ui/Button.astro';` -- the fence and the first
import share a line. Adding an import is fine, but the `---` must stay the
first bytes of the file; if anything moves above it, rolldown parses the
frontmatter as markup and reports a misleading `Expected '}' but found ':'`.

If adding a fifth column would crowd the grid, drop whichever existing column
duplicates the header nav -- but **never** a legal link from Step 1.

Style the column heading alongside the rest:

```scss
.ca-fcolhd {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-bottom: 0.5rem;
}
```

- [ ] **Step 4: Verify site-wide**

```bash
npm run build 2>&1 | tail -3
npm run astro check 2>&1 | tail -5
python3 docs/superpowers/specs/assets/contrast-check.py
npm run preview
```

Confirm every legally-required link from Step 1 still renders, then check the footer on `/`, `/about`, `/contact`, `/blog/` and one blog post — it is on all 90 pages and this is the task most likely to regress one.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.astro src/styles/layout/_footer.scss
git commit -m "feat(footer): CTA on ink-800, products get a colophon column

CTA sits on ink-800 rather than ink-900 so it reads as its own surface
against the colophon, carrying white at 15.0:1. The colophon mirrors the
masthead and adds a products column -- read from the collection, so a
fifth product appears there without a footer edit.

Footer is on all 90 pages, so the legal links were listed before the
edit and checked after it."
```

---

### Task 15: Final verification

Everything is in place. This task changes no source — it proves the page and the architecture both still hold.

**Files:**
- Modify: `docs/superpowers/specs/2026-08-25-homepage-press-room-design.md` (record what actually shipped, if it diverged)

- [ ] **Step 1: Confirm the section order matches the mock**

```bash
grep -n "<[A-Z]" src/pages/index.astro
```

Expected, in order: `Hero`, `ProofStrip`, `ProductsSection`, `Services`, `Band`, `CaseStudies`, `BlogPreview`.

Also confirm the two joins the design depends on actually rendered, rather
than resolving to empty:

```bash
grep -o 'Proved by' dist/index.html | wc -l          # expect 4
grep -c 'products/orgvitals' dist/index.html         # expect >= 2 (fold + colophon)
```

An empty `products.get(...)` renders as nothing and leaves a bare "Proved by"
label with no link -- silent, and invisible in a green build. Compare against the mock's fold order in `docs/superpowers/specs/assets/home-mock.html`.

- [ ] **Step 2: Confirm no component learned a colour**

```bash
grep -rnE '#[0-9A-Fa-f]{6}' src/components/ src/pages/ src/styles/ \
  --include=*.astro --include=*.tsx --include=*.scss \
  | grep -v 'src/styles/themes/' | grep -v node_modules
```

Expected: no matches outside `src/styles/themes/`. Any hit is a component that hardcoded a colour during the rebuild — fix it before finishing, it is exactly the defect this architecture exists to prevent.

- [ ] **Step 3: Confirm the flip is still one line, both ways**

```bash
sed -i '' "s|@use 'themes/press-room';|@use 'themes/monochrome';|" src/styles/main.scss
npm run build 2>&1 | tail -3
sed -i '' "s|@use 'themes/monochrome';|@use 'themes/press-room';|" src/styles/main.scss
npm run build 2>&1 | tail -3
```

Expected: both succeed. If monochrome now fails, a section task introduced a token only press-room defines — add it to the contract and give monochrome a value.

- [ ] **Step 4: Full gate**

```bash
npm run astro check 2>&1 | tail -5
python3 docs/superpowers/specs/assets/contrast-check.py
npm run build 2>&1 | tail -3
npm run preview
```

Then load the built site and walk it: `/`, `/about`, `/services/`, `/products/`, `/case-studies/`, `/contact`, `/blog/`, one blog post, one case study, and `/404`. Check the console on each. Rolldown means the build being green tells you nothing about whether these render.

- [ ] **Step 5: Record any divergence and commit**

If the shipped result diverges from the spec anywhere, amend the spec to describe what shipped — a spec that no longer matches the code is worse than no spec.

```bash
git add -A docs/
git commit -m "docs(spec): reconcile the home page spec with what shipped"
```

---

## Deferred — explicitly NOT in this plan

Recorded so the next session does not have to rediscover them:

- **`StatsBar.astro` / `StatsCounter.tsx`** — still mounted on `/about`. They die when `/about` is redesigned, not before.
- **Three `public/blog-images/*.svg` heroes** — 238 hardcoded greys, unreachable by any theme because they load via `<img src>` and never see the page. Fix is to inline them with `set:html`.
- **Shiki config** — 10 hardcoded GitHub-dark hexes in the HTML of 12 posts; comments at 3.05:1 and inline code at 2.66:1 are under AA. Fix is to configure Shiki to emit CSS variables — a markdown-pipeline change, not a stylesheet one. `--code-text` stays unwired until then.
- **Drift convergence** — badge / card / section-title / numeral / ink-alpha / shadow / radius / font-stack duplicates, plus the now-dead `.section-padding--vertical` rules (carried by zero elements across all 90 pages).
- **`--input-border-invalid`** — declared, unwired. Wiring `.form-control[aria-invalid="true"]` is a real a11y gain and a rendered change.
- **`.btn-secondary`** — currently identical to `.btn-primary`. Decide whether it diverges or dies.
- **The radius family** — six rungs, all `0` under press-room. Do not collapse the names; a later theme needs them to be round again.
- **`CLAUDE.md`, at merge time only** — its `--ca-*` palette table documents variables that no longer exist, and its "no orange" clause now contradicts the shipped design. Update when this branch merges, not before.
- **Remaining pages** — each gets its own design → discuss → final design → implement pass. This plan covers the home page only.
