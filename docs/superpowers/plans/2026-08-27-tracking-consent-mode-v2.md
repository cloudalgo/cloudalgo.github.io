# Tracking: Consent Mode v2 and conversion coverage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every visitor measurable — not only the ones who click Accept — and report the conversions that actually matter.

**Architecture:** Google Consent Mode v2 in *Advanced* mode. A single inline bootstrap in `<head>` declares a denied-by-default consent state and loads GA4 for everyone; GA4 then sends cookieless pings that Google models into sessions. HubSpot and Clarity stay gated behind consent, because both set identifying storage. A small typed façade (`src/lib/analytics.ts`) owns every event name and the first-touch attribution record, so no component reaches for `window.gtag` directly.

**Tech Stack:** Astro 7 (static), React 19, TypeScript 6 strict, gtag.js, vitest (new — see Global Constraints).

**Spec:** `docs/superpowers/specs/2026-08-27-analytics-and-seo-design.md`

## Global Constraints

- **Node ≥ 22.12.0.** Enforced in CI via `node-version: 22`.
- **Do not upgrade TypeScript to 7.** `@astrojs/check` peer-caps at `typescript ^5 || ^6`.
- **The `---` frontmatter fence must be the first bytes of a `.astro` file.** Nothing may precede it — not a blank line, not a comment. File-level notes go *inside* the fence as JS comments.
- **A green build does not imply a working page.** Astro 7 uses rolldown; runtime breakage passes `npm run build`. Every task touching runtime behaviour is verified in a browser.
- **GA4 measurement ID:** `G-5WYSWY2G6Z` — exact, appears in `ConsentBootstrap.astro` only after Task 4.
- **HubSpot portal ID:** `21905808`. **HubSpot cookie name:** `hubspotutk`. **Payload key for it:** `hutk`. These differ; do not "unify" them.
- **Clarity project ID:** `wqcruv2yej`.
- **consent localStorage key:** `ca_cookie_consent`, values `accepted` | `declined`. Unchanged from today — do not rename, existing visitors' choices are stored under it.
- **No published prices.** `generate_lead` carries no `value` or `currency` parameter. The site never states a rate.
- **Gates for every commit:** `npm run build` and `npm run astro check` both pass.

### Risk flagged before you start

`vitest` (Task 2) pulls in its own Vite. Astro 7 bundles with **rolldown**, and a peer conflict is possible. If `npm install` errors or `npm run build` breaks after Task 2, **stop and report** — do not force it with `--legacy-peer-deps`. The fallback is to drop Task 2's harness and rely on Task 10's browser verification; the pure functions are small enough to survive that, and losing the tests is cheaper than destabilising the build.

---

### Task 1: Remove dead image assets

Four hero JPEGs survive from the pre-redesign site. Grep across `src/` returns zero references to each. They ship on every deploy and serve nobody.

**Files:**
- Delete: `public/hero-silder.jpg` (409KB)
- Delete: `public/blog-header-bg.jpg` (311KB)
- Delete: `public/services-hero-bg.jpg` (260KB)
- Delete: `public/contact-bg.jpg` (156KB)

**Interfaces:**
- Consumes: nothing
- Produces: nothing. Fully independent of every other task.

- [ ] **Step 1: Re-verify each file is unreferenced**

Do not trust this plan's claim. Check it.

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io
for f in hero-silder.jpg blog-header-bg.jpg services-hero-bg.jpg contact-bg.jpg; do
  echo "--- $f ---"
  grep -rn "$f" src/ astro.config.mjs public/ 2>/dev/null || echo "  no references"
done
```

Expected: `no references` for all four. **If any file has a reference, do not delete it** — remove it from this task and report which one.

- [ ] **Step 2: Delete them**

```bash
git rm public/hero-silder.jpg public/blog-header-bg.jpg \
       public/services-hero-bg.jpg public/contact-bg.jpg
```

- [ ] **Step 3: Verify the build still passes**

```bash
npm run build && npm run astro check
```

Expected: both succeed. A missing-asset error here means Step 1 missed a reference — restore the file and report.

- [ ] **Step 4: Commit**

```bash
git commit -m "perf(assets): drop four unreferenced hero images

hero-silder.jpg, blog-header-bg.jpg, services-hero-bg.jpg and
contact-bg.jpg are left over from the pre-redesign site. Nothing in
src/ names any of them; they were shipping 1.1MB per deploy to nobody."
```

---

### Task 2: Test harness and the analytics façade

Introduces `vitest` and the module that owns every event name. Today `window.gtag` is reached for directly in three places with stringly-typed event names, so a typo is silent data loss.

**Files:**
- Create: `src/lib/analytics.ts`
- Create: `src/lib/analytics.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + `vitest` devDependency)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type AnalyticsEvent = 'generate_lead' | 'form_submit' | 'contact_click' | 'page_not_found' | 'scroll_depth' | 'outbound_click' | 'cta_click'`
  - `track(event: AnalyticsEvent, params?: Record<string, unknown>): void`
  - `readHubspotCookie(cookieString: string): string | undefined`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

If this errors on peer resolution, **stop and report** — see the risk note in Global Constraints.

- [ ] **Step 2: Add the config and script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Everything under test is pure: no DOM, no Astro, no React. A jsdom
    // environment would be a dependency bought for nothing.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing tests**

Create `src/lib/analytics.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { track, readHubspotCookie } from './analytics';

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

const withGtag = (fn: (calls: unknown[][]) => void) => {
  const calls: unknown[][] = [];
  (globalThis as Record<string, unknown>).window = {
    gtag: (...args: unknown[]) => { calls.push(args); },
  };
  fn(calls);
};

describe('track', () => {
  it('forwards the event and params to gtag', () => {
    withGtag(calls => {
      track('generate_lead', { method: 'schedule_widget' });
      expect(calls).toEqual([['event', 'generate_lead', { method: 'schedule_widget' }]]);
    });
  });

  it('defaults params to an empty object', () => {
    withGtag(calls => {
      track('cta_click');
      expect(calls[0]).toEqual(['event', 'cta_click', {}]);
    });
  });

  it('is a no-op when gtag is absent, rather than throwing', () => {
    (globalThis as Record<string, unknown>).window = {};
    expect(() => track('form_submit')).not.toThrow();
  });

  it('is a no-op when there is no window at all (SSG build)', () => {
    expect(() => track('form_submit')).not.toThrow();
  });
});

describe('readHubspotCookie', () => {
  it('extracts hubspotutk from a cookie string', () => {
    expect(readHubspotCookie('foo=1; hubspotutk=abc123def; bar=2'))
      .toBe('abc123def');
  });

  it('finds it when it is the only cookie', () => {
    expect(readHubspotCookie('hubspotutk=solo')).toBe('solo');
  });

  it('returns undefined when absent', () => {
    expect(readHubspotCookie('foo=1; bar=2')).toBeUndefined();
  });

  it('returns undefined for an empty cookie string', () => {
    expect(readHubspotCookie('')).toBeUndefined();
  });

  it('does not match a cookie merely ending in hubspotutk', () => {
    expect(readHubspotCookie('not_hubspotutk=wrong')).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Failed to resolve import "./analytics"`.

- [ ] **Step 5: Write the implementation**

Create `src/lib/analytics.ts`:

```ts
// src/lib/analytics.ts
//
// Every analytics event the site sends, named once.
//
// Before this module the three call sites reached for `window.gtag`
// directly with stringly-typed event names. A typo in one of those is not
// an error -- it is an event that lands in GA4 under a name nobody is
// looking at, which is indistinguishable from the visit never happening.
// The union below makes that typo a build failure instead.

/** The complete set of events this site sends. */
export type AnalyticsEvent =
  | 'generate_lead'
  | 'form_submit'
  | 'contact_click'
  | 'page_not_found'
  | 'scroll_depth'
  | 'outbound_click'
  | 'cta_click';

type Gtag = (...args: unknown[]) => void;

/** `gtag` exists from the document head under Consent Mode (see
 *  ConsentBootstrap.astro), but this module is also imported into React
 *  components that Astro renders during the static build, where there is
 *  no window at all. Both absences are normal and neither may throw. */
const gtag = (): Gtag | undefined =>
  typeof window === 'undefined'
    ? undefined
    : (window as unknown as { gtag?: Gtag }).gtag;

export function track(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  gtag()?.('event', event, params);
}

/**
 * HubSpot's visitor token, read from a cookie string.
 *
 * HubSpot sets this cookie as `hubspotutk` and expects it back in a form
 * submission as `hutk`. The two names are theirs, they differ, and
 * "unifying" them silently de-attributes every lead -- which is the bug
 * this function exists to fix.
 *
 * Absent when the visitor declined consent, since the HubSpot script only
 * loads on accept. That is correct, and callers must treat it as normal.
 */
export function readHubspotCookie(cookieString: string): string | undefined {
  const match = cookieString.match(/(?:^|;\s*)hubspotutk=([^;]*)/);
  return match ? match[1] : undefined;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npm test
```

Expected: PASS, 9 tests.

- [ ] **Step 7: Verify the build is undisturbed**

```bash
npm run build && npm run astro check
```

Expected: both succeed. If the build broke, this is the rolldown/Vite conflict — stop and report.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat(analytics): typed event facade, and a test runner for it

Event names were stringly typed across three call sites, where a typo
lands data under a name nobody reads. They are a union now.

Brings in vitest for the pure logic only -- parsing and storage rules
that cannot be eyeballed. The build gate is unchanged."
```

---

### Task 3: First-touch attribution

A visitor arrives on a campaign link, reads for a while, and books three days later. Today the source of that lead is lost entirely.

Storage is two-stage on purpose: attribution is not strictly necessary, so pre-consent it lives in `sessionStorage` and dies with the visit; on consent it is promoted to `localStorage` and survives the days before booking.

**Files:**
- Modify: `src/lib/analytics.ts`
- Modify: `src/lib/analytics.test.ts`

**Interfaces:**
- Consumes: `src/lib/analytics.ts` from Task 2
- Produces:
  - `interface FirstTouch { utm_source?, utm_medium?, utm_campaign?, utm_term?, utm_content?: string; referrer?: string; landing_page: string; ts: string }`
  - `buildFirstTouch(url: URL, referrer: string, now: Date): FirstTouch`
  - `captureFirstTouch(): void` — call once per page load
  - `readFirstTouch(): FirstTouch | null`
  - `promoteFirstTouch(): void` — call on consent granted
  - `FIRST_TOUCH_KEY: 'ca_first_touch'`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/analytics.test.ts`:

```ts
import { buildFirstTouch, readFirstTouch, captureFirstTouch, promoteFirstTouch, FIRST_TOUCH_KEY } from './analytics';

class FakeStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const withStorage = (fn: (s: { session: FakeStorage; local: FakeStorage }) => void) => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  (globalThis as Record<string, unknown>).window = {
    sessionStorage: session,
    localStorage: local,
    location: new URL('https://cloudalgo.com/services/?utm_source=linkedin&utm_medium=social'),
    document: { referrer: 'https://www.linkedin.com/' },
  };
  fn({ session, local });
};

describe('buildFirstTouch', () => {
  const now = new Date('2026-08-27T10:00:00.000Z');

  it('captures utm params, referrer and landing path', () => {
    const url = new URL('https://cloudalgo.com/services/?utm_source=linkedin&utm_medium=social&utm_campaign=q3');
    expect(buildFirstTouch(url, 'https://www.linkedin.com/', now)).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'q3',
      referrer: 'https://www.linkedin.com/',
      landing_page: '/services/',
      ts: '2026-08-27T10:00:00.000Z',
    });
  });

  it('omits utm keys that are absent rather than writing empty strings', () => {
    const url = new URL('https://cloudalgo.com/?utm_source=google');
    const ft = buildFirstTouch(url, '', now);
    expect(ft.utm_source).toBe('google');
    expect('utm_medium' in ft).toBe(false);
    expect('referrer' in ft).toBe(false);
  });

  it('records a direct visit with no utm and no referrer', () => {
    expect(buildFirstTouch(new URL('https://cloudalgo.com/about/'), '', now)).toEqual({
      landing_page: '/about/',
      ts: '2026-08-27T10:00:00.000Z',
    });
  });
});

describe('first-touch storage', () => {
  afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

  it('captures into sessionStorage, not localStorage', () => {
    withStorage(({ session, local }) => {
      captureFirstTouch();
      expect(session.getItem(FIRST_TOUCH_KEY)).not.toBeNull();
      expect(local.getItem(FIRST_TOUCH_KEY)).toBeNull();
    });
  });

  it('does not overwrite an existing record — it is FIRST touch', () => {
    withStorage(({ session }) => {
      session.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/original/', ts: 'x' }));
      captureFirstTouch();
      expect(JSON.parse(session.getItem(FIRST_TOUCH_KEY)!).landing_page).toBe('/original/');
    });
  });

  it('does not overwrite a promoted record held in localStorage', () => {
    withStorage(({ session, local }) => {
      local.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/from-last-week/', ts: 'x' }));
      captureFirstTouch();
      expect(session.getItem(FIRST_TOUCH_KEY)).toBeNull();
    });
  });

  it('prefers the localStorage record when reading', () => {
    withStorage(({ session, local }) => {
      session.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/session/', ts: 'x' }));
      local.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/local/', ts: 'x' }));
      expect(readFirstTouch()?.landing_page).toBe('/local/');
    });
  });

  it('promotes the session record to localStorage on consent', () => {
    withStorage(({ session, local }) => {
      captureFirstTouch();
      const captured = session.getItem(FIRST_TOUCH_KEY);
      promoteFirstTouch();
      expect(local.getItem(FIRST_TOUCH_KEY)).toBe(captured);
    });
  });

  it('promoting with nothing captured does not throw or write', () => {
    withStorage(({ local }) => {
      expect(() => promoteFirstTouch()).not.toThrow();
      expect(local.getItem(FIRST_TOUCH_KEY)).toBeNull();
    });
  });

  it('returns null on unparseable stored JSON rather than throwing', () => {
    withStorage(({ session }) => {
      session.setItem(FIRST_TOUCH_KEY, 'not json');
      expect(readFirstTouch()).toBeNull();
    });
  });

  it('survives storage being unavailable entirely', () => {
    (globalThis as Record<string, unknown>).window = {
      get sessionStorage(): never { throw new Error('blocked'); },
      get localStorage(): never { throw new Error('blocked'); },
      location: new URL('https://cloudalgo.com/'),
      document: { referrer: '' },
    };
    expect(() => captureFirstTouch()).not.toThrow();
    expect(readFirstTouch()).toBeNull();
    expect(() => promoteFirstTouch()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `buildFirstTouch is not exported`.

- [ ] **Step 3: Write the implementation**

Append to `src/lib/analytics.ts`:

```ts
// ── First-touch attribution ────────────────────────────────
//
// A reader arrives on a campaign link, reads for a week, and books on a
// Thursday. GA4's own attribution covers that; HubSpot's does not, because
// the booking arrives at a different endpoint from a different component.
// This is the record that travels with the lead.
//
// Two-stage storage is deliberate and is the arguable part of the design.
// Attribution is not strictly necessary, and pre-consent device storage is
// the exact thing the cookie notice governs -- so before consent this lives
// in sessionStorage and dies with the visit. On consent it is promoted to
// localStorage, which is what makes the Thursday booking attributable.

export const FIRST_TOUCH_KEY = 'ca_first_touch';

export interface FirstTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page: string;
  ts: string;
}

const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
] as const;

/** Pure: build the record from a URL and referrer. Absent values are
 *  omitted rather than stored empty, so a direct visit is a two-key
 *  record instead of five empty strings pretending to be a campaign. */
export function buildFirstTouch(url: URL, referrer: string, now: Date): FirstTouch {
  const record: FirstTouch = {
    landing_page: url.pathname,
    ts: now.toISOString(),
  };
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) record[key] = value;
  }
  if (referrer) record.referrer = referrer;
  return record;
}

/** Storage access throws outright in some privacy modes, rather than
 *  returning null. Every caller here treats that as "no attribution",
 *  which is a worse answer than the truth but a better one than a
 *  broken page. */
function store(which: 'sessionStorage' | 'localStorage'): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window[which];
  } catch {
    return null;
  }
}

function readFrom(s: Storage | null): FirstTouch | null {
  if (!s) return null;
  try {
    const raw = s.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

/** The promoted record wins: it is the older of the two, and older is
 *  what "first touch" means. */
export function readFirstTouch(): FirstTouch | null {
  return readFrom(store('localStorage')) ?? readFrom(store('sessionStorage'));
}

/** Call once per page load. Does nothing if a record already exists in
 *  either store. */
export function captureFirstTouch(): void {
  if (typeof window === 'undefined') return;
  if (readFirstTouch()) return;
  const session = store('sessionStorage');
  if (!session) return;
  try {
    const url = new URL(String(window.location));
    const record = buildFirstTouch(url, window.document?.referrer ?? '', new Date());
    session.setItem(FIRST_TOUCH_KEY, JSON.stringify(record));
  } catch {
    // A visit we cannot attribute is still a visit. Never break the page.
  }
}

/** Call when consent is granted: the record earns the right to outlive
 *  the session. */
export function promoteFirstTouch(): void {
  const session = store('sessionStorage');
  const local = store('localStorage');
  if (!session || !local) return;
  try {
    const raw = session.getItem(FIRST_TOUCH_KEY);
    if (raw) local.setItem(FIRST_TOUCH_KEY, raw);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test
```

Expected: PASS, 20 tests total.

- [ ] **Step 5: Type-check and build**

```bash
npm run astro check && npm run build
```

Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat(analytics): first-touch attribution record

A reader who arrives on a campaign link and books a week later currently
reaches HubSpot with no source at all. This is the record that travels
with them.

Session-scoped before consent, promoted to localStorage after -- so the
storage the notice governs is only claimed once the notice is answered."
```

---

### Task 4: Consent Mode v2 — the bootstrap and the tracker split

The load-bearing task. `injectTrackers()` stops being a switch and becomes a signal.

**Files:**
- Create: `src/components/ui/ConsentBootstrap.astro`
- Modify: `src/layouts/Base.astro` — render it in `<head>`
- Modify: `src/components/ui/CookieConsent.astro:217-313` — split the script
- Modify: `CLAUDE.md` — amend the analytics contract

**Interfaces:**
- Consumes: `promoteFirstTouch` from Task 3
- Produces: `window.gtag` available from document head on every page, in every consent state. Later tasks rely on this — `track()` no longer needs to guard for a missing gtag at runtime (it still does, for the build).

- [ ] **Step 1: Create the bootstrap component**

Create `src/components/ui/ConsentBootstrap.astro`. **The `---` fence must be the first bytes of the file.**

```astro
---
/**
 * The consent declaration, and the only analytics code in a layout.
 *
 * ── Why this exists at all ──
 * Until now the site measured only the traffic that clicked Accept.
 * `injectTrackers()` was a switch: all three trackers or none. Everyone
 * who declined, and everyone who ignored the notice, was not
 * under-counted but absent.
 *
 * Consent Mode v2 replaces the switch with a signal. GA4 loads for
 * everyone under a DENIED state, in which it sets no cookies, reads no
 * identifiers and writes nothing to the device -- it sends an anonymous
 * ping that a page was viewed, which Google models into sessions. The
 * notice's copy says exactly this; see CookieConsent.astro.
 *
 * ── Why it is `is:inline` and in the head ──
 * Astro defers processed <script> tags. A consent default that arrives
 * after the tag it governs is not a consent default. This must execute
 * during head parse, before gtag.js runs, which `is:inline` guarantees
 * and a processed script does not.
 *
 * ── What does NOT live here ──
 * HubSpot and Clarity. Both set identifying storage, neither is governed
 * by Consent Mode, and both stay gated in CookieConsent.astro. This file
 * declares consent and loads exactly one Google tag. Nothing may add a
 * second.
 */
const GA4_ID = 'G-5WYSWY2G6Z';
---
<script is:inline define:vars={{ GA4_ID }}>
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Denied first, always. `wait_for_update` holds the tag for 500ms so a
  // visitor who accepts immediately is not measured as a decliner.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  // A returning visitor who already accepted should not pay the 500ms
  // stall. Their answer is on file; give it now.
  try {
    if (localStorage.getItem('ca_cookie_consent') === 'accepted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
  } catch (e) {
    // Storage blocked. Denied stands, which is the safe direction.
  }

  gtag('js', new Date());
  gtag('config', GA4_ID);
</script>
<script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}></script>
```

- [ ] **Step 2: Render it in the head**

In `src/layouts/Base.astro`, add the import to the frontmatter beside the existing `CookieConsent` import:

```astro
import ConsentBootstrap from '../components/ui/ConsentBootstrap.astro';
```

Then place it as the **last element inside `<head>`**, immediately after the JSON-LD line and before `</head>`:

```astro
    <!-- JSON-LD structured data -->
    {schemaJson && <script is:inline type="application/ld+json" set:html={schemaJson} />}

    <ConsentBootstrap />
  </head>
```

- [ ] **Step 3: Split the trackers in CookieConsent.astro**

In `src/components/ui/CookieConsent.astro`, replace the `injectTrackers` function (starts line 220) with the two below. **Delete the GA4 block from it** — GA4 now loads from the bootstrap.

```ts
  let trackersInjected = false;

  /** HubSpot and Clarity only.
   *
   *  GA4 is NOT here any more: it loads from ConsentBootstrap.astro for
   *  every visitor under a denied consent state. These two are not
   *  governed by Consent Mode and both set identifying storage, so they
   *  remain gated on an actual answer to the notice. */
  function injectConsentedTrackers(): void {
    if (trackersInjected) return;
    trackersInjected = true;

    // HubSpot
    const hs = document.createElement('script');
    hs.async = true;
    hs.src = '//js.hs-scripts.com/21905808.js';
    document.head.appendChild(hs);

    // Microsoft Clarity
    const w = window as any;
    w['clarity'] = w['clarity'] || function () { (w['clarity'].q = w['clarity'].q || []).push(arguments); };
    const ct = document.createElement('script');
    ct.async = true;
    ct.src = 'https://www.clarity.ms/tag/wqcruv2yej';
    document.head.appendChild(ct);

    window.dispatchEvent(new Event('ca:trackers-ready'));
  }

  /** Lift the denied state declared in the head. */
  function grantConsent(): void {
    (window as any).gtag?.('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    promoteFirstTouch();
  }
```

Add the import at the top of that same `<script>` block (line 218, immediately after `<script>`):

```ts
  import { promoteFirstTouch } from '@/lib/analytics';
```

- [ ] **Step 4: Update the four call sites**

Every place that called `injectTrackers()` now calls both functions. In the same script block, replace each occurrence:

The load-time branch (was ~line 261):

```ts
  const consent = localStorage.getItem('ca_cookie_consent');
  if (consent === 'accepted') {
    // The bootstrap already issued the consent update for this visitor.
    injectConsentedTrackers();
  } else if (!consent) {
    document.getElementById('ca-cookie-popup')?.classList.remove('ca-hidden');
  }
```

The "Accept all" (notice) handler:

```ts
  document.getElementById('ca-btn-accept-s1')?.addEventListener('click', () => {
    setConsent('accepted');
    grantConsent();
    injectConsentedTrackers();
    hidePopup();
  });
```

The "Accept selected" handler:

```ts
  document.getElementById('ca-btn-accept-selected')?.addEventListener('click', () => {
    if (cb?.checked) {
      setConsent('accepted');
      grantConsent();
      injectConsentedTrackers();
    } else {
      setConsent('declined');
    }
    hidePopup();
  });
```

The "Accept all" (register) handler:

```ts
  document.getElementById('ca-btn-accept-s2')?.addEventListener('click', () => {
    setConsent('accepted');
    grantConsent();
    injectConsentedTrackers();
    hidePopup();
  });
```

- [ ] **Step 5: Amend CLAUDE.md**

The current text contradicts this task in two clauses, and the contradiction is the point of the change rather than an oversight in it. In `CLAUDE.md`, replace the "Third-party integrations" bullet on analytics with:

```markdown
- **Analytics — Consent Mode v2, Advanced.** The consent *declaration* lives in
  `src/components/ui/ConsentBootstrap.astro`, rendered into `Base.astro`'s
  `<head>`. It is the ONLY analytics code permitted in a layout, it must stay
  `is:inline` (a deferred consent default is not a consent default), and it
  loads exactly one Google tag: GA4 (`G-5WYSWY2G6Z`), for every visitor, under
  `analytics_storage: 'denied'`. Denied GA4 sets no cookies and sends an
  anonymous ping — that is what makes declining visitors measurable at all.
- **Tracker *loading* still lives in `injectConsentedTrackers()` in
  `CookieConsent.astro` and nowhere else**: the HubSpot script and Microsoft
  Clarity, both gated on an actual accept, because both set identifying
  storage and neither is governed by Consent Mode. Nothing may add a fourth
  tracker, and nothing may move GA4 back behind the gate without also
  rewriting the notice copy, which is a legal surface.
```

- [ ] **Step 6: Build and type-check**

```bash
npm run build && npm run astro check
```

Expected: both succeed.

- [ ] **Step 7: Verify in a browser — this is the real gate**

A green build does not imply a working consent flow. Start the preview server and check the `gcs` parameter on the GA4 collect request, which encodes consent state.

```bash
npm run preview
```

With the Chrome DevTools MCP, navigate to the preview URL in a **fresh profile / cleared storage**, and inspect network requests matching `google-analytics.com/g/collect`:

| Check | Expected |
|---|---|
| Fresh visitor, notice showing | A `/g/collect` request **exists**, with `gcs=G100` in its query string |
| Click "Accept all" | A subsequent `/g/collect` with `gcs=G111`; `js.hs-scripts.com` and `clarity.ms` scripts now requested |
| Clear storage, reload, "Customise / reject" → "Accept selected" with the toggle **off** | `gcs=G100` persists; **no** request to `hs-scripts.com` or `clarity.ms` |
| Reload as an accepted visitor | First `/g/collect` already carries `gcs=G111` |

Also confirm the console is clean — no `gtag is not defined`, no CSP error on the gtag.js request.

**If the fresh-visitor case shows no `/g/collect` request at all**, Advanced mode is not working: the tag is being withheld rather than denied. Stop and report.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ConsentBootstrap.astro src/layouts/Base.astro \
        src/components/ui/CookieConsent.astro CLAUDE.md
git commit -m "feat(analytics): Consent Mode v2 in advanced mode

injectTrackers() was a switch -- all three trackers or none -- so every
visitor who declined or ignored the notice was not under-counted but
absent. Google puts that gap at 15-40% of measurable conversions.

GA4 now loads for everyone under analytics_storage: denied, setting no
cookies and sending an anonymous ping Google models into a session.
HubSpot and Clarity stay gated: both set identifying storage and neither
is governed by Consent Mode.

CLAUDE.md amended -- this contradicts two of its clauses deliberately."
```

---

### Task 5: The notice copy

**Gated on the user's approval of the exact wording. Do not ship this task without it.**

The pip reading `No trackers loaded` became false the moment Task 4 landed. The notice is a legal surface; `CLAUDE.md` records that a previous pass moved and repainted this copy without editing it. This task edits it, narrowly.

**Files:**
- Modify: `src/components/ui/CookieConsent.astro:37-47`

**Interfaces:**
- Consumes: Task 4's behaviour (GA4 loads pre-consent)
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Confirm the wording with the user before editing**

Present these two changes and wait for an explicit yes. If the user wants different words, use theirs.

- [ ] **Step 2: Change the pip**

In `src/components/ui/CookieConsent.astro`, line 39:

```astro
      <b class="pip__dot" aria-hidden="true"></b>Nothing stored yet
```

- [ ] **Step 3: Add the sentence to the body**

Replace the `notice__body` paragraph (lines 42-46) with:

```astro
    <p class="notice__body">
      We use cookies, including third-party tools (Google Analytics, HubSpot, Microsoft Clarity),
      to understand how visitors engage with our site and to improve our content and services.
      Until you accept, we receive only an anonymous signal that a page was viewed &mdash; no
      cookies, no identifiers, and nothing stored on your device.
      No personal data is sold to third parties.
    </p>
```

- [ ] **Step 4: Verify the notice still lays out correctly**

```bash
npm run build && npm run preview
```

The body gained roughly one line. Check in the browser at **1440px and 390px** that the notice does not overflow and the buttons remain reachable — `_notice.scss` sizes this panel and the copy sits in a scroll region.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/CookieConsent.astro
git commit -m "docs(consent): say what the notice now actually does

Advanced consent mode loads GA4 for every visitor, so 'No trackers
loaded' stopped being true. The pip states what is true instead --
nothing is stored -- and the body says plainly what the pre-consent
signal is and is not.

Every other word of the notice and the register below it is unchanged."
```

---

### Task 6: `generate_lead` on a completed booking

The schedule widget is mounted site-wide from `Page.astro` and booking a call is the site's actual conversion. It reports nothing.

**Files:**
- Modify: `src/components/ui/ScheduleWidget.tsx` — import, and the `data.success` branch at ~line 524

**Interfaces:**
- Consumes: `track`, `readFirstTouch` from Tasks 2–3
- Produces: a `generate_lead` event carrying `method` and first-touch params

- [ ] **Step 1: Add the import**

At the top of `src/components/ui/ScheduleWidget.tsx`, with the other imports:

```tsx
import { track, readFirstTouch } from '@/lib/analytics';
```

- [ ] **Step 2: Fire the event on success**

In `handleSubmit`, the `if (data.success)` branch currently reads:

```tsx
      if (data.success) {
        onConfirmed(allEmails[0]);
      } else {
```

Replace with:

```tsx
      if (data.success) {
        // The site's actual conversion. No `value` or `currency`: we do
        // not publish rates, and a made-up number is worse than none.
        track('generate_lead', {
          method: 'schedule_widget',
          event_category: 'Conversion',
          booking_timezone: userTimezone,
          ...readFirstTouch(),
        });
        onConfirmed(allEmails[0]);
      } else {
```

- [ ] **Step 3: Type-check and build**

```bash
npm run astro check && npm run build
```

Expected: both succeed. `@/lib/analytics` resolves via the `@/*` path alias already in `tsconfig.json`.

- [ ] **Step 4: Verify in the browser**

With `npm run preview` and the Chrome DevTools MCP: accept cookies, open the schedule widget, and complete a booking. Confirm a `/g/collect` request carrying `en=generate_lead`.

**Note:** this posts a real booking to `PUBLIC_SCHEDULE_API_URL`. Ask the user before submitting a live booking, or confirm the event fires by evaluating the call directly in the console instead:

```js
window.gtag('event', 'generate_lead', { method: 'schedule_widget' })
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ScheduleWidget.tsx
git commit -m "feat(analytics): report a completed booking as generate_lead

The widget is mounted site-wide and booking a call is what a reader does
when they are ready to buy. It reported nothing at all."
```

---

### Task 7: HubSpot attribution on the contact form

`ContactForm.tsx` posts to the Forms API with a `context` block naming only the page. HubSpot sets a `hubspotutk` cookie; passing it back as `hutk` is what lets HubSpot join the submission to the visitor's browsing history. Every lead currently lands de-attributed.

**Files:**
- Modify: `src/components/ui/ContactForm.tsx:23-58`

**Interfaces:**
- Consumes: `track`, `readHubspotCookie`, `readFirstTouch` from Tasks 2–3
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Add the import**

At the top of `src/components/ui/ContactForm.tsx`:

```tsx
import { track, readHubspotCookie, readFirstTouch } from '@/lib/analytics';
```

- [ ] **Step 2: Send the hutk and the real page URI**

In `onSubmit`, replace the `context` block:

```tsx
          context: {
            pageUri: 'cloudalgo.com/contact',
            pageName: 'CloudAlgo Contact Form',
          },
```

with:

```tsx
          context: {
            // HubSpot's visitor token, so this submission joins the
            // browsing session that produced it. Absent when the visitor
            // declined consent -- the HubSpot script only loads on accept
            // -- and HubSpot rejects the field if it is present but empty,
            // so it is spread in only when there is one.
            ...(readHubspotCookie(document.cookie)
              ? { hutk: readHubspotCookie(document.cookie) }
              : {}),
            pageUri: window.location.href,
            pageName: 'CloudAlgo Contact Form',
          },
```

- [ ] **Step 3: Attach attribution to the GA4 event**

Replace the existing GA4 block:

```tsx
        // GA4 event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submit', {
            event_category: 'Contact',
            event_label: 'HubSpot Contact Form',
          });
        }
```

with:

```tsx
        track('form_submit', {
          event_category: 'Contact',
          event_label: 'HubSpot Contact Form',
          ...readFirstTouch(),
        });
```

- [ ] **Step 4: Type-check and build**

```bash
npm run astro check && npm run build
```

Expected: both succeed.

- [ ] **Step 5: Verify in the browser**

With `npm run preview`, accept cookies, wait for the HubSpot script to set `hubspotutk` (check `document.cookie`), then submit the contact form. In the network panel, inspect the request payload to `api.hsforms.com` and confirm `context.hutk` is present and matches the cookie.

Then clear storage, **decline** cookies, and submit again: confirm the request still succeeds with **no** `hutk` key in the payload (not an empty one).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ContactForm.tsx
git commit -m "fix(hubspot): send the visitor token with the submission

The form posted a context block naming only the page, so every lead
reached HubSpot detached from the browsing session that produced it --
the cookie was being set and then not sent back.

pageUri was also hard-coded to /contact while the form is a React island
that could be mounted anywhere; it reports where it actually ran."
```

---

### Task 8: Contact clicks and 404s

Two blind spots. The colophon carries an email and a phone number, and the click handler in `Base.astro` tests `href.startsWith('http')` — so both are invisible. And the 404 page never says which broken URL was reached.

**Files:**
- Modify: `src/layouts/Base.astro` — the click handler in the body `<script>`
- Modify: `src/pages/404.astro` — add a reporting script

**Interfaces:**
- Consumes: `track`, `captureFirstTouch` from Tasks 2–3
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Import the façade into Base.astro's script**

At the very top of the `<script>` block in `src/layouts/Base.astro` (the one beginning with the `scrollableHeight` comment):

```ts
      import { track, captureFirstTouch } from '@/lib/analytics';

      // First touch is recorded before anything else can navigate away.
      captureFirstTouch();
```

- [ ] **Step 2: Replace the click handler**

Replace the whole `// GA4: CTA button clicks` handler at the end of that script with:

```ts
      // GA4: outbound, contact and CTA clicks
      document.addEventListener('click', (e) => {
        const el = (e.target as Element).closest('a, button');
        if (!el) return;
        const text = el.textContent?.trim().slice(0, 50);
        const href = (el as HTMLAnchorElement).href || '';

        // Reaching for the phone or the address bar is the strongest
        // intent signal on the site, and it was invisible: the outbound
        // test below only ever matched an http(s) href.
        if (href.startsWith('mailto:')) {
          track('contact_click', { event_category: 'Contact', method: 'email' });
        } else if (href.startsWith('tel:')) {
          track('contact_click', { event_category: 'Contact', method: 'phone' });
        } else if (href && !href.includes('cloudalgo.com') && href.startsWith('http')) {
          track('outbound_click', { event_category: 'Outbound', event_label: href });
        }

        if (/get in touch|book|contact|schedule|send message/i.test(text || '')) {
          track('cta_click', { event_category: 'CTA', event_label: text });
        }
      });
```

- [ ] **Step 3: Replace the scroll-depth gtag call**

In the same script, inside `flushScrollDepth`, replace the direct call:

```ts
            gtag('event', 'scroll_depth', {
              event_category: 'Engagement',
              event_label: `${milestone}%`,
              value: milestone,
            });
```

with:

```ts
            track('scroll_depth', {
              event_category: 'Engagement',
              event_label: `${milestone}%`,
              value: milestone,
            });
```

Leave the surrounding `const gtag = (window as any).gtag; if (!gtag) return;` guard in place. Under Consent Mode it will now essentially always pass, but a guard that never fires is cheaper than a page that breaks if the tag is ever blocked by an extension.

- [ ] **Step 4: Correct the stale scroll-depth comment**

The comment above the milestone machinery (`src/layouts/Base.astro:491-495`) explains the high-water mark by saying gtag only exists after consent. Task 4 made that false, and a load-bearing comment that is wrong is worse than no comment. Replace it:

```ts
      // GA4: scroll depth (25 / 50 / 75 / 100%)
      //
      // Depth is a high-water mark rather than a fire-and-forget event: the
      // milestones are only *consumed* when there is a tag to send them to.
      // Consent Mode means gtag is now present from the document head, so in
      // practice they flush immediately -- but an ad blocker can still take
      // the tag out from under us, and burning all four milestones as no-ops
      // would report the visit as having no depth at all.
```

- [ ] **Step 5: Report 404s**

In `src/pages/404.astro`, add before the closing `</Page>` tag:

```astro
<script>
  import { track } from '@/lib/analytics';

  // GitHub Pages serves this file for any unmatched path, so the address
  // bar holds the URL that was actually requested. Without this, a broken
  // inbound link is a reader who leaves and a fact nobody learns.
  track('page_not_found', {
    event_category: 'Error',
    event_label: window.location.pathname,
    referrer: document.referrer || '(direct)',
  });
</script>
```

- [ ] **Step 6: Type-check and build**

```bash
npm run astro check && npm run build
```

Expected: both succeed.

- [ ] **Step 7: Verify in the browser**

With `npm run preview` and cookies accepted:

- click the `mailto:` link in the colophon → `/g/collect` with `en=contact_click` and `method=email`
- click the `tel:` link → `en=contact_click`, `method=phone`
- visit a nonsense path such as `/does-not-exist/` → `en=page_not_found` with `event_label=/does-not-exist/`

- [ ] **Step 8: Commit**

```bash
git add src/layouts/Base.astro src/pages/404.astro
git commit -m "feat(analytics): report contact clicks and 404s

The colophon's mailto: and tel: links were invisible -- the click
handler only ever tested an http(s) href, so the two strongest intent
signals on the site went unrecorded.

The 404 now names the path that was asked for, which turns it from a
dead end into a report of which inbound links are broken."
```

---

### Task 9: Join Clarity sessions to GA4

A conversion in GA4 and the session recording that produced it are currently two facts with nothing connecting them.

**Files:**
- Modify: `src/components/ui/CookieConsent.astro` — inside `injectConsentedTrackers()`

**Interfaces:**
- Consumes: Task 4's `injectConsentedTrackers`
- Produces: nothing

- [ ] **Step 1: Tag the Clarity session with the GA4 session id**

In `src/components/ui/CookieConsent.astro`, inside `injectConsentedTrackers()`, after the Clarity script is appended and before the `ca:trackers-ready` dispatch:

```ts
    // Hand Clarity the GA4 session id, so any conversion in GA4 can be
    // traced to the recording behind it. gtag answers asynchronously and
    // only once the tag has initialised, hence the callback rather than a
    // read. Both tools are consent-gated, so this only ever runs in the
    // accepted state.
    (window as any).gtag?.('get', 'G-5WYSWY2G6Z', 'session_id', (id: string) => {
      if (id) w['clarity']('set', 'ga4_session_id', id);
    });
```

- [ ] **Step 2: Build and type-check**

```bash
npm run build && npm run astro check
```

Expected: both succeed.

- [ ] **Step 3: Verify in the browser**

With `npm run preview`, accept cookies, then in the console:

```js
window.gtag('get', 'G-5WYSWY2G6Z', 'session_id', console.log)
```

Expected: logs a numeric session id. Then confirm the Clarity network requests carry a custom tag — or, more simply, check `typeof window.clarity === 'function'` and that no console error was thrown by the callback.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CookieConsent.astro
git commit -m "feat(analytics): tag Clarity sessions with the GA4 session id

A conversion in GA4 and the recording that produced it were two facts
with nothing joining them."
```

---

### Task 10: Full verification and the console steps

Nothing here changes code. It confirms the whole flow works together and records the steps that only a human with console access can take.

**Files:** none

**Interfaces:**
- Consumes: every prior task
- Produces: a report

- [ ] **Step 1: Run the full gate from clean**

```bash
rm -rf dist node_modules/.astro
npm run build && npm run astro check && npm test
```

Expected: all three pass.

- [ ] **Step 2: Re-run the four-state consent matrix**

With `npm run preview` and the Chrome DevTools MCP, repeat the table from Task 4 Step 7 in full, on a **cleared profile**, and confirm all four rows still hold now that Tasks 5–9 have landed.

- [ ] **Step 3: Confirm every event fires**

On a single accepted session, exercise and confirm each: `scroll_depth`, `cta_click`, `outbound_click`, `contact_click` (email and phone), `page_not_found`, `form_submit`. `generate_lead` only if the user has agreed to a live test booking.

- [ ] **Step 4: Check the GA4 DebugView**

Confirm events arrive in the real property, not just as outbound requests. In the browser console:

```js
window.gtag('config', 'G-5WYSWY2G6Z', { debug_mode: true })
```

then watch **Admin → DebugView** in GA4.

- [ ] **Step 5: Report the manual console steps to the user**

These cannot be done from the repo. Write them up rather than assuming they happened:

1. **Mark key events.** GA4 → Admin → Events → mark `generate_lead` and `form_submit` as key events. Until this is done they are ordinary events and will not appear as conversions.
2. **Confirm consent mode is detected.** GA4 → Admin → Consent settings should show consent signals arriving within 24–48 hours.
3. **Enable behavioural modelling.** GA4 → Admin → Reporting Identity → *Blended*. This is what turns the denied-state pings into modelled sessions, and it is the payoff for the whole of Task 4. It needs a threshold of traffic before Google will model, so it may not activate immediately.
4. **Link Search Console to GA4.** Admin → Product links → Search Console. The property is already DNS-verified; linking surfaces query data inside GA4 reports.

- [ ] **Step 6: Report completion**

State plainly which steps passed, which were skipped (the live booking test, if declined), and anything that did not behave as this plan predicted.

---

## Self-review

**Spec coverage.** §A → Tasks 4, 5. §B events table → Tasks 6, 7, 8. §B HubSpot attribution → Task 7. §B first-touch → Task 3. §B Clarity join → Task 9. §B key-event marking → Task 10 Step 5. §D-quick dead images → Task 1. §A verification table → Task 4 Step 7, re-run in Task 10 Step 2. §A CLAUDE.md amendment → Task 4 Step 5.

**Not covered here, by design:** spec §C (crawl and index) and §D-measured (Lighthouse) are a separate plan, per the scope check.

**Type consistency.** `track` / `readHubspotCookie` (Task 2) and `buildFirstTouch` / `readFirstTouch` / `captureFirstTouch` / `promoteFirstTouch` / `FIRST_TOUCH_KEY` (Task 3) are used under exactly those names in Tasks 4, 6, 7 and 8. `injectConsentedTrackers` and `grantConsent` are defined in Task 4 and referenced under those names in Task 9. `AnalyticsEvent` covers every event string passed to `track` anywhere in the plan: `generate_lead`, `form_submit`, `contact_click`, `page_not_found`, `scroll_depth`, `outbound_click`, `cta_click`.
