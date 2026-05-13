# About Page Expansion — Design Spec

**Date:** 2026-05-13
**Status:** Approved

## Overview

Expand `src/pages/about.astro` with three new sections that add credibility and storytelling depth. All additions use the existing site stack (Astro, Tailwind v4, Outfit font, `#0A0A0A` / `#F5F5F2` / `#FFFFFF` palette, inline SVG line-art illustrations).

## Current Page Structure

```
Hero header ("We're a small, focused team of Salesforce architects.")
Our Story + Stats Grid (70+, 12+, 15+, 2019)
Industries We Serve (8 industry cards)
StatsBar
```

## New Page Structure

```
Hero header                    [existing]
Our Story + Stats Grid         [existing]
Industries We Serve            [existing]
── NEW ── Core Values
── NEW ── How We Work (Process)
── NEW ── Certifications & Tech Stack
StatsBar                       [existing, moved to bottom]
```

---

## Section 1 — Core Values

**Purpose:** Build trust by articulating the principles behind every engagement.

**Layout:** White background. Section label + H2 headline. 3-column card grid below.

**Content:**

| Card | Icon (line-art SVG) | Heading | Body copy |
|---|---|---|---|
| 1 | Grid/plus shape | Clean architecture | No over-engineered orgs. Solutions built to last, not to impress. |
| 2 | Circle with checkmark | On-time delivery | We scope carefully and commit to timelines that are real — not aspirational. |
| 3 | Two-person silhouette | Collaborative by default | We work beside your team, not around them. Knowledge transfer is part of every project. |

**Cards:** `background:#F5F5F2`, `border:1px solid #E0E0DC`, `border-radius:12px`, `padding:1.75rem`. SVG icon (36×36, `stroke:#0A0A0A`, no fill) above heading above body.

**Animations:** `anim-scale-pop` on each card with staggered `transition-delay` (0s, 0.05s, 0.1s).

---

## Section 2 — How We Work

**Purpose:** Demystify the engagement model. Reduce sales friction by showing a clear, predictable process.

**Layout:** Off-white (`#F5F5F2`) background. Section label + H2. Two-column split: numbered steps left, SVG illustration right.

**Steps:**

| # | Title | Body |
|---|---|---|
| 01 | Discovery | We map your processes, data model, and goals before writing a single line of configuration. |
| 02 | Architecture | We design the solution blueprint and validate it with your team before build starts. |
| 03 | Build & iterate | Agile sprints with weekly demos. You see real progress from week one. |
| 04 | Handover & support | Full documentation, team training, and optional ongoing support post-launch. |

**Step number style:** 36×36 black circle, white bold number, flex row with step body.

**Illustration:** Circular spoke diagram SVG (260×260). Central node labelled "CloudAlgo", 4 outer nodes numbered 01–04, dashed spokes connecting them, dashed outer orbit ring. All `stroke:#0A0A0A`, no fill (line-art). Decorative corner dots at 45° positions.

**Animations:** Steps `anim-fade-up` with staggered delays. Illustration `anim-scale-pop`.

---

## Section 3 — Certifications & Tech Stack

**Purpose:** Substantiate expertise with concrete credentials.

**Layout:** White background. Section label + H2. Two sub-sections separated by a `<hr>`:

**Certifications grid** — flex-wrap row of badge chips:
- Each chip: `background:#F5F5F2`, `border:1.5px solid #E0E0DC`, `border-radius:10px`, `padding:0.9rem 1.25rem`
- Contents: 28×28 line-art checkmark circle SVG + certification name text
- Certs: Salesforce Administrator, Platform Developer I, Platform Developer II, Sales Cloud Consultant, Service Cloud Consultant, Heroku Architecture Designer, MuleSoft Developer, App Builder

**Tech stack pills** — flex-wrap row of pill tags:
- Each pill: `border:1.5px solid #E0E0DC`, `border-radius:100px`, white background
- Stack: Salesforce, Heroku, MuleSoft, Apex, LWC, SOQL, REST / SOAP APIs, Node.js, PostgreSQL, AWS

**Animations:** Cert badges `anim-scale-pop` staggered. Pills `anim-fade-up`.

---

## Implementation Notes

- All three sections go in `src/pages/about.astro` as inline Astro markup (no new component files needed — consistent with existing about page pattern)
- `StatsBar` stays at the bottom, after the three new sections
- Section backgrounds alternate: white → off-white → white (matching site pattern)
- Each section has `border-bottom: 1px solid #E0E0DC` except the last before StatsBar
- No new dependencies required
- `.gitignore` should include `.superpowers/` — add if not present
