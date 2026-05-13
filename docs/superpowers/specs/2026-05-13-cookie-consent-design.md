# Cookie Consent Banner — Design Spec

**Date:** 2026-05-13  
**Status:** Approved

---

## Problem

Safari iOS shows a privacy warning on every page because three cross-site tracking scripts (Google Analytics, HubSpot, Clarity) load unconditionally. The fix is to defer those scripts until the user explicitly consents.

---

## Design

### Visual

- **Desktop (≥640px):** Floating card, bottom-left corner, 220px wide, 12px from edge. White background, 1px `#E0E0DC` border, 12px border-radius, soft shadow.
- **Mobile (<640px):** Same card expands to full width, anchors to the bottom edge, top corners rounded (12px), bottom corners flush — mirrors the schedule widget's mobile pattern.
- **Icon:** SVG cookie icon (circle outline with filled chip dots), stroke-based to match the site's icon style.
- **Typography:** Outfit font, matching the site's `.btn-primary` / `.btn-outline` button styles.
- **Buttons:**
  - "Accept all" — black fill, white text, pill shape (`.btn-primary` style)
  - "Decline" — underlined text link on desktop; pill outline on mobile (side-by-side with Accept)
- **Animation:** Fades in after a 1.5s delay (matches the schedule widget's `swFadeIn` pattern).

### Behaviour

- On first visit: banner appears after 1.5s.
- **Accept:** saves `ca_cookie_consent=accepted` to `localStorage`, immediately injects GA4 + HubSpot + Clarity scripts, hides banner.
- **Decline:** saves `ca_cookie_consent=declined` to `localStorage`, no scripts loaded, hides banner.
- **Return visit:** on page load, reads `localStorage` before rendering. If `accepted`, injects scripts immediately (no banner). If `declined`, does nothing (no banner). If unset, shows banner.
- Consent is permanent until the user clears site data.

---

## Architecture

### Files changed

| File | Change |
|------|--------|
| `src/layouts/Base.astro` | Remove inline GA4 / HubSpot / Clarity `<script>` tags. Add `<CookieConsent />` import and tag. Add a small inline `<script>` that runs before `</body>` to check consent and inject scripts on return visits. |
| `src/components/ui/CookieConsent.astro` | New file. Self-contained banner — markup, scoped CSS, and inline `<script>` that wires up the Accept/Decline buttons. |

### Script injection strategy

Scripts are injected dynamically via `document.createElement('script')` so they only execute after consent. The same injection function is called from two places:
1. **CookieConsent.astro** — when the user clicks Accept.
2. **Base.astro inline script** — on page load, if `localStorage` already holds `accepted`.

This avoids duplicating the script URLs and keeps the consent logic colocated with the banner.

### No third-party library

Consent state is plain `localStorage` (`ca_cookie_consent`). No cookie consent SDK needed — the site only has two states (accepted / declined) and no granular category management.

---

## Out of scope

- Per-category consent (Analytics vs Marketing vs Functional) — overkill for three scripts.
- A "Manage preferences" re-open flow — user can clear localStorage if they want to re-decide.
- Server-side consent propagation — not needed for a static site.
