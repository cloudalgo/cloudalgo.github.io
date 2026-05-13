# Cookie Consent Banner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cookie consent banner that defers GA4, HubSpot, and Clarity scripts until the user explicitly accepts, eliminating the Safari iOS cross-site tracking privacy warning.

**Architecture:** A new `CookieConsent.astro` component renders a hidden banner and reveals it only when `localStorage` has no prior decision. Accept injects the three trackers dynamically and records `ca_cookie_consent=accepted`; Decline records `declined` and injects nothing. On return visits, a small `is:inline` script in `Base.astro` reads `localStorage` and injects trackers immediately — the banner never shows again.

**Tech Stack:** Astro 6, vanilla TypeScript (bundled `<script>`), `is:inline` for the return-visit check, `document.createElement('script')` for dynamic tracker injection, `localStorage` for persistence.

---

### Task 1: Create `src/components/ui/CookieConsent.astro`

**Files:**
- Create: `src/components/ui/CookieConsent.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ui/CookieConsent.astro` with the following content exactly:

```astro
---
// Cookie consent banner — defers all third-party trackers until user accepts.
---

<div
  id="ca-cookie-banner"
  class="ca-cookie-banner ca-hidden"
  role="dialog"
  aria-label="Cookie preferences"
  aria-live="polite"
>
  <div class="ca-cookie-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="7.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="14.5" cy="13.5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="11" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  </div>
  <h3 class="ca-cookie-title">Cookie preferences</h3>
  <p class="ca-cookie-text">
    We use analytics (Google Analytics, HubSpot, Clarity) to improve your experience.
    No data is sold to third parties.
  </p>
  <div class="ca-cookie-btns">
    <button id="ca-cookie-accept" class="ca-cookie-accept">Accept all</button>
    <button id="ca-cookie-decline" class="ca-cookie-decline">Decline</button>
  </div>
</div>

<style>
  .ca-cookie-banner {
    position: fixed;
    bottom: 12px;
    left: 12px;
    width: 220px;
    background: #fff;
    border: 1px solid #E0E0DC;
    border-radius: 12px;
    padding: 1.125rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    z-index: 998;
    font-family: 'Outfit', system-ui, sans-serif;
    opacity: 0;
    transform: translateY(8px);
    animation: caFadeIn 0.4s ease 1.5s forwards;
  }

  .ca-cookie-banner.ca-hidden {
    display: none;
  }

  @keyframes caFadeIn {
    to { opacity: 1; transform: translateY(0); }
  }

  .ca-cookie-icon {
    width: 32px;
    height: 32px;
    background: #F5F5F2;
    border: 1px solid #E0E0DC;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0A0A0A;
    margin-bottom: 0.75rem;
  }

  .ca-cookie-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: #0A0A0A;
    margin-bottom: 0.375rem;
    line-height: 1.3;
  }

  .ca-cookie-text {
    font-size: 0.8125rem;
    color: #5A5A5A;
    line-height: 1.55;
    margin-bottom: 1rem;
  }

  .ca-cookie-btns {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .ca-cookie-accept {
    background: #0A0A0A;
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    font-weight: 700;
    font-family: 'Outfit', system-ui, sans-serif;
    cursor: pointer;
    width: 100%;
    transition: opacity 0.2s;
  }
  .ca-cookie-accept:hover { opacity: 0.8; }

  .ca-cookie-decline {
    background: transparent;
    color: #5A5A5A;
    border: none;
    padding: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: 'Outfit', system-ui, sans-serif;
    cursor: pointer;
    text-align: center;
    text-decoration: underline;
    width: 100%;
    transition: color 0.2s;
  }
  .ca-cookie-decline:hover { color: #0A0A0A; }

  /* Mobile: full-width strip anchored to bottom edge */
  @media (max-width: 640px) {
    .ca-cookie-banner {
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      border-radius: 12px 12px 0 0;
      border-bottom: none;
      padding: 1.25rem 1rem 1.5rem;
    }

    .ca-cookie-btns {
      flex-direction: row;
      gap: 0.5rem;
    }

    .ca-cookie-accept { flex: 1; }

    .ca-cookie-decline {
      flex: 1;
      border: 1.5px solid #E0E0DC;
      border-radius: 100px;
      text-decoration: none;
      color: #0A0A0A;
      padding: 0.625rem 1rem;
    }
    .ca-cookie-decline:hover { background: #F5F5F2; }
  }
</style>

<script>
  function injectTrackers(): void {
    // Google Analytics
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-5WYSWY2G6Z';
    document.head.appendChild(ga);
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function () { (window as any).dataLayer.push(arguments); };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', 'G-5WYSWY2G6Z');

    // HubSpot
    const hs = document.createElement('script');
    hs.async = true;
    hs.defer = true;
    hs.src = '//js.hs-scripts.com/21905808.js';
    document.head.appendChild(hs);

    // Microsoft Clarity
    const w = window as any;
    w['clarity'] = w['clarity'] || function () { (w['clarity'].q = w['clarity'].q || []).push(arguments); };
    const ct = document.createElement('script');
    ct.async = true;
    ct.src = 'https://www.clarity.ms/tag/wqcruv2yej';
    const first = document.getElementsByTagName('script')[0];
    first.parentNode!.insertBefore(ct, first);
  }

  const banner = document.getElementById('ca-cookie-banner');

  if (!localStorage.getItem('ca_cookie_consent')) {
    banner?.classList.remove('ca-hidden');
  }

  document.getElementById('ca-cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('ca_cookie_consent', 'accepted');
    injectTrackers();
    banner?.classList.add('ca-hidden');
  });

  document.getElementById('ca-cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem('ca_cookie_consent', 'declined');
    banner?.classList.add('ca-hidden');
  });
</script>
```

- [ ] **Step 2: Type-check**

```bash
npm run astro check
```

Expected: 0 errors. Scoped-CSS warnings about unused selectors are fine.

---

### Task 2: Modify `src/layouts/Base.astro`

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Add the `CookieConsent` import to the frontmatter**

In `src/layouts/Base.astro`, add the import as the **first line** of the frontmatter (Astro requires imports before `const` declarations):

Replace:
```astro
---
export interface Props {
```

With:
```astro
---
import CookieConsent from '../components/ui/CookieConsent.astro';

export interface Props {
```

(Only add the `import` line and a blank line after it — leave everything else unchanged.)

- [ ] **Step 2: Remove the three inline tracking script blocks from `<head>`**

Delete these lines entirely (currently lines 74–93):

```html
    <!-- Google Analytics GA4 -->
    <script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-5WYSWY2G6Z"></script>
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5WYSWY2G6Z');
    </script>

    <!-- HubSpot tracking -->
    <script is:inline async defer src="//js.hs-scripts.com/21905808.js"></script>

    <!-- Microsoft Clarity -->
    <script is:inline>
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "wqcruv2yej");
    </script>
```

- [ ] **Step 3: Add return-visit consent script in their place**

In the same location (where the three script blocks just were, still inside `<head>`), insert:

```html
    <!-- Analytics: loaded only after cookie consent is given -->
    <script is:inline>
      (function () {
        if (localStorage.getItem('ca_cookie_consent') !== 'accepted') return;
        var ga = document.createElement('script');
        ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-5WYSWY2G6Z';
        document.head.appendChild(ga);
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-5WYSWY2G6Z');
        var hs = document.createElement('script');
        hs.async = true; hs.defer = true;
        hs.src = '//js.hs-scripts.com/21905808.js';
        document.head.appendChild(hs);
        (function (c, l, a, r, i) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          var t = l.createElement(r); t.async = true;
          t.src = 'https://www.clarity.ms/tag/' + i;
          var y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', 'wqcruv2yej');
      })();
    </script>
```

- [ ] **Step 4: Add `<CookieConsent />` to `<body>`**

At the end of `<body>`, after the closing `</script>` of the existing scroll/GA4 event script, add:

```astro
    <CookieConsent />
  </body>
```

The bottom of `Base.astro` should now look like:

```astro
  <body>
    <slot />
    <script>
      // Scroll animations
      // ... (existing code — do not touch) ...

      // GA4: scroll depth
      // ... (existing code — do not touch) ...

      // GA4: CTA button clicks
      // ... (existing code — do not touch) ...
    </script>
    <CookieConsent />
  </body>
</html>
```

- [ ] **Step 5: Type-check**

```bash
npm run astro check
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/CookieConsent.astro src/layouts/Base.astro
git commit -m "feat: add cookie consent banner, defer analytics until accepted"
```

---

### Task 3: Visual verification

**Files:** none — read-only

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify first visit — no trackers fire, banner appears**

Open `http://localhost:4321/about` in a **private/incognito window** (ensures clean `localStorage`).

In DevTools → Network tab, filter by "gtag" / "hs-scripts" / "clarity":

Expected:
- None of those requests appear on page load
- After ~1.5 s the cookie banner fades in from bottom-left

- [ ] **Step 3: Test Accept flow**

Click "Accept all".

Expected:
- Banner disappears immediately
- Network tab shows `gtag/js`, `hs-scripts.com`, `clarity.ms` requests firing
- DevTools → Application → Local Storage → `ca_cookie_consent` = `"accepted"`

Reload the page:

Expected:
- Banner does NOT reappear
- Trackers fire immediately on page load (visible in Network tab from the start)

- [ ] **Step 4: Test Decline flow**

Open a new private window, navigate to any page, wait for the banner, click "Decline".

Expected:
- Banner disappears
- No tracker requests in Network tab
- `localStorage` → `ca_cookie_consent` = `"declined"`

Reload:

Expected:
- Banner does NOT reappear
- Network tab stays clean (no tracker requests)

- [ ] **Step 5: Verify mobile layout**

In DevTools, switch to a 390 × 844 viewport (iPhone 14 size).

Expected:
- Banner spans the full width of the viewport
- Anchored to the bottom edge, top corners rounded
- "Accept all" and "Decline" buttons sit side by side

- [ ] **Step 6: Verify no z-index conflict**

On a first-visit page where both the cookie banner and the schedule widget are visible:

Expected:
- Schedule widget (z-index: 999) renders on top of the cookie banner (z-index: 998) if they overlap in the bottom-right area

- [ ] **Step 7: Production build**

```bash
npm run build && npm run preview
```

Expected: build succeeds with no errors; Accept/Decline flows work identically in the production preview.
