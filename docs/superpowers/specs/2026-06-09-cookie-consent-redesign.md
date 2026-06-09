# Cookie Consent Redesign

**Date:** 2026-06-09
**Status:** Approved
**File:** `src/components/ui/CookieConsent.astro`

---

## Context

The existing `CookieConsent.astro` blocks the UI with a full-screen frosted-glass overlay and offers only "Accept all" / "Decline" — no way to review or selectively consent. The redesign removes the overlay, adds a scrollable detail view with per-category control, and aligns the UI with CloudAlgo's monochromatic design system.

---

## Goals

- Non-blocking popup: user can scroll and interact with the page while the banner is visible
- Two-state UI: initial notice → detail/customise view
- Analytics & Marketing consent is opt-in (unchecked by default)
- Essential cookies always on, no toggle
- Wording updated to name CloudAlgo's actual third-party tools

---

## Visual Design

Matches CloudAlgo design system exactly:
- Font: `Outfit`, weights 700/800
- Colors: `#0A0A0A`, `#5A5A5A`, `#F5F5F2`, `#FFFFFF`, `#E0E0DC` — no accent colors
- Buttons: `border-radius: 100px` pill, `.btn-primary` (black fill) / `.btn-outline` (transparent + border)
- Category cards: `border-radius: 12px`, `border: 1px solid #E0E0DC`, `background: #F5F5F2`
- Badges: `border-radius: 100px`, uppercase, `font-size: 0.6875rem`
- **"Prohibited"**: outlined badge — white bg, `#E0E0DC` border, `#5A5A5A` text
- **"Allowed"**: filled badge — `#0A0A0A` bg, white text
- **"Always on"**: filled badge — `#0A0A0A` bg, white text

---

## Layout

```
position: fixed
bottom: 0
left: 50% / transform: translateX(-50%)
width: 90%
border-top-left-radius: 12px
border-top-right-radius: 12px
border-bottom: none
box-shadow: 0 -8px 32px rgba(0,0,0,0.12)
z-index: 1000
role="region"  aria-label="Cookie preferences"
```

No backdrop. No overlay. Page remains fully interactive. Do NOT use `aria-modal="true"` — that implies a blocking dialog.

**State 2 panel height:** `max-height: 70vh` on the `#ca-s2` container; inner `.ca-s2-body` gets `overflow-y: auto; flex: 1;` within a flex column layout so header and footer stay pinned.

**Animation:** `translateY(20px → 0)` over `0.35s cubic-bezier(0.34,1.2,0.64,1)` with `1.5s` initial delay (matches existing pattern).

---

## State 1 — Initial Notice

**Shown on first visit (no `ca_cookie_consent` key in localStorage).**

```
[🍪 icon]
We use cookies

We use cookies, including third-party tools (Google Analytics, HubSpot,
Microsoft Clarity), to understand how visitors engage with our site and
to improve our services. No personal data is sold to third parties.
Click "Accept all" to consent, or "Customise / reject" to review your options.

[ Customise / reject ]  [ Accept all ]
```

- "Customise / reject" (outline button) → switch to State 2
- "Accept all" (black button) → `localStorage.setItem('ca_cookie_consent', 'accepted')`, inject trackers, hide popup

---

## State 2 — Modifications & Details

**Shown after "Customise / reject" is clicked. Same panel, State 1 div hidden, State 2 div shown.**

### Header (fixed, not scrollable)
```
Cookies — Modifications & Details
Essential cookies are always active. Review and enable optional cookies below.
```

### Scrollable body
Contains in order:

**1. Analytics & Marketing Cookies card**
- Checkbox (default: unchecked) + status badge
  - Unchecked → badge: "Prohibited" (outlined, muted)
  - Checked → badge: "Allowed" (black filled); card border changes to `#0A0A0A`
- Description: "Used by Google Analytics, HubSpot, and Microsoft Clarity to measure site traffic, understand user behaviour, and surface relevant content about CloudAlgo's Salesforce, Heroku, and AWS services. Unchecked by default — enable only if you consent."
- "Open cookies and options in detail ↓" anchor link → scrolls to `#ca-cookie-detail` within the same scrollable body

**2. Essential Cookies card**
- "Always on" badge (no checkbox)
- Description: "Required for page navigation, session continuity, form submissions, and stable delivery of the CloudAlgo website. These cannot be disabled."
- "Open cookies and options in detail ↓" anchor link → also scrolls to `#ca-cookie-detail` (the same general info section — no separate essential section needed)

**3. Responsible line**
> Responsible as defined by data protection law: CloudAlgo Inc.

**4. Full explanatory text** (id: `ca-cookie-detail`) — the long-form cookie information provided by the user, organised under these headings:
- Cookies and Modifications
- What are Cookies?
- Purposes of Cookies
- Recognition and Response
- Continuous Improvements
- Advertising and Retargeting
- Cookie Categories
- What do you need to know about cookies?
- First-Party Cookies
- Third-Party Cookies
- Rejecting Cookies
- Cookie Management in your browser

### Footer (fixed, not scrollable)
```
[ Accept Selected ]  [ Accept All ]
```

- "Accept Selected":
  - Checkbox checked → `'accepted'`, inject trackers
  - Checkbox unchecked → `'declined'`, skip trackers
  - Hide popup either way
- "Accept All" → always `'accepted'`, inject trackers, hide popup

---

## Data / State

| Key | Values | Meaning |
|-----|--------|---------|
| `localStorage.ca_cookie_consent` | `'accepted'` | Analytics consented; trackers injected |
| `localStorage.ca_cookie_consent` | `'declined'` | Analytics refused; trackers skipped |
| *(absent)* | — | First visit; show popup |

On page load:
- `'accepted'` → inject trackers immediately, hide popup
- `'declined'` → hide popup, no trackers
- absent → show popup (State 1)

---

## Tracker Injection (`injectTrackers`)

Unchanged from existing implementation. Injects:
- Google Analytics GA4 (`G-5WYSWY2G6Z`)
- HubSpot (`21905808`)
- Microsoft Clarity (`wqcruv2yej`)

Called only when consent is `'accepted'`.

---

## DOM Structure

```html
<div id="ca-cookie-popup">            <!-- position:fixed, 90% wide, bottom-center -->

  <!-- State 1 -->
  <div id="ca-s1">
    [icon] [title] [body text]
    [btn: Customise/reject]  [btn: Accept all]
  </div>

  <!-- State 2 (hidden initially) -->
  <div id="ca-s2" hidden>
    <div class="ca-s2-header">…</div>         <!-- fixed header -->
    <div class="ca-s2-body">                  <!-- scrollable -->
      [analytics card with checkbox]
      [essential card]
      [responsible line]
      <div id="ca-cookie-detail">…long text…</div>
    </div>
    <div class="ca-s2-footer">                <!-- fixed footer -->
      [btn: Accept Selected]  [btn: Accept All]
    </div>
  </div>

</div>
```

---

## JS Logic (vanilla, TypeScript-flavoured)

Visibility mechanism: outer popup uses `.ca-hidden` class (`display:none`) removed on first visit. State 1/2 toggle via `element.hidden` boolean attribute.

```
on load:
  consent = localStorage.getItem('ca_cookie_consent')
  if consent === 'accepted' → injectTrackers()
  if consent is null → popup.classList.remove('ca-hidden')

#ca-btn-customise click:
  ca-s1.hidden = true
  ca-s2.hidden = false

#ca-btn-accept-all (State 1) click:
  setConsent('accepted'), injectTrackers(), hidePopup()

#ca-analytics-checkbox change:
  update badge text/class and card border

#ca-btn-accept-selected click:
  checked? setConsent('accepted'), injectTrackers() : setConsent('declined')
  hidePopup()

#ca-btn-accept-all-s2 (State 2) click:
  setConsent('accepted'), injectTrackers(), hidePopup()
```

---

## Mobile

At `max-width: 640px`:
- `width: 100%`
- `border-radius: 12px 12px 0 0`
- `border-bottom: none`

---

## Verification

1. `npm run dev` — visit any page, confirm popup appears at bottom after 1.5s with no overlay
2. Click "Customise / reject" — confirm panel switches to State 2 with scrollable body
3. Check/uncheck Analytics checkbox — confirm badge toggles "Prohibited" ↔ "Allowed" and card border updates
4. "Accept Selected" with checkbox unchecked → `localStorage.ca_cookie_consent` = `'declined'`, popup closes, no network requests to GA/HubSpot/Clarity
5. "Accept Selected" with checkbox checked → `'accepted'`, trackers injected
6. "Accept All" (either state) → `'accepted'`, trackers injected
7. Reload after accepting → popup hidden, trackers fire immediately
8. Reload after declining → popup hidden, no trackers
9. Mobile (≤640px) — popup goes full-width, flush to bottom
10. `localStorage.removeItem('ca_cookie_consent')` and reload → popup reappears in State 1
