# Analytics and search visibility — design

**Date:** 2026-08-27
**Status:** approved in outline; awaiting spec review

## The problem, stated plainly

Two things are wrong, and they are the same thing wrong twice: we cannot see
what is happening.

**We measure only the traffic that clicks Accept.** `injectTrackers()` in
`src/components/ui/CookieConsent.astro` is a switch, not a signal — it either
loads all three trackers or none of them. Everyone who declines the notice, and
everyone who ignores it, is completely invisible. Not under-counted:
*absent*. Google's own figure for the gap this opens is 15–40% of measurable
conversions in regulated regions, and it does not backfill.

**The conversions we do measure are the wrong ones.** `form_submit` fires on the
contact form and nothing else. The schedule widget — mounted site-wide from
`src/layouts/Page.astro`, and the thing a reader does when they are actually
ready to buy — reports nothing at all. Leads that do arrive reach HubSpot
de-attributed, because the form posts to the Forms API without the `hutk`
cookie that would stitch a submission to the session that produced it.

The SEO foundation, by contrast, is sound. `src/data/schema.ts` states the org
entity once and refers to it by `@id`; the sitemap emits `lastmod` only where it
can be trusted; the redirect table preserves every dated blog URL. This design
does not touch that. It fills four holes around it.

## Decisions taken

| Question | Decision |
|---|---|
| Tracking substrate | `gtag` + Consent Mode v2. No GTM, no server-side tagging. |
| Consent mode | **Advanced** — GA4 loads for everyone, stores nothing until consent. |
| Cookie notice copy | Changes, so the notice stays true. Wording approved before it ships. |
| Search Console | Already verified by DNS. Nothing to add. |
| AI crawlers | Explicitly allowed. No `llms.txt` — Google does not read it. |
| `sameAs` handles | Retained as owned. X handle flagged for a visual check. |

## A. Consent Mode v2

> **SUPERSEDED, 2026-08-27, by the site's owner mid-implementation.**
>
> This section was written around a consent gate: measurement for the readers
> who clicked Accept, Consent Mode signalling for the rest. The owner's
> instruction was that every visitor is measured and the notice informs rather
> than asks — "it desnot meter user is rejecting or accepting. if user is using
> our site we should track him" — with scope confirmed as everywhere, no
> jurisdiction carve-out.
>
> **What shipped instead:** `ConsentBootstrap.astro` declares all four Consent
> Mode v2 signals `granted` for every visitor and carries no `wait_for_update`.
> The declaration is kept, despite gating nothing, because an undeclared state
> (`gcs=G1--`) degrades conversion modelling on the linked Ads account, and
> because `region` is then the single line to edit if a carve-out is ever
> wanted. Browser evidence against the live property: `wait_for_update` with no
> update ever arriving suppresses the collect request outright, so it was
> removed rather than paired with a restating update.
>
> The notice was rewritten so that no sentence offers a choice the page does
> not honour, and its storage key changed to `ca_notice_ack`. The EU/UK
> ePrivacy exposure was raised once and the owner decided; that is theirs to
> decide.
>
> Read the rest of this section as the argument that was made, not as the
> design that is live. `CLAUDE.md` describes what actually ships. The rulings
> are in the ledger at
> `.superpowers/sdd/2026-08-27-tracking-consent-mode-v2/progress.md`.


### What changes

The three trackers stop being one undifferentiated block, because they do not
pose the same question. Only one of them can be made anonymous:

| Tracker | Loads | Why |
|---|---|---|
| **GA4** | Always | Under Advanced consent mode it sends cookieless pings — no identifiers, nothing written to the device — which GA4 models into sessions. This is the entire visibility win. |
| **HubSpot** | On consent | Sets `hutk`, an identifying first-party cookie. Consent-requiring by construction. |
| **Clarity** | On consent | Records the session. Plainly consent-requiring. |

So `injectTrackers()` splits in two: `loadGA4()`, called unconditionally, and
`injectConsentedTrackers()`, called on accept. The consent signal itself is
declared before either:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
});
```

and on accept:

```js
gtag('consent', 'update', {
  ad_storage: 'granted', ad_user_data: 'granted',
  ad_personalization: 'granted', analytics_storage: 'granted',
});
```

A returning visitor who already accepted gets the `update` issued immediately at
bootstrap, so they never pay the 500ms `wait_for_update` stall.

### Where the bootstrap lives

A new `src/components/ui/ConsentBootstrap.astro`, rendered into `Base.astro`'s
`<head>` as a single `is:inline` script. It does exactly three things: define
`dataLayer` and the `gtag` shim, declare the consent default, and — if
`localStorage.ca_cookie_consent === 'accepted'` — issue the update.

It must be `is:inline` and in `<head>`. Astro defers processed `<script>` tags,
and a consent default that arrives after the tag it governs is not a consent
default.

### The CLAUDE.md amendment this forces

`CLAUDE.md` currently states, twice and emphatically, that every tracker is
injected from `injectTrackers()` *only after consent*, and that nothing loads
from `Base.astro`. Advanced consent mode contradicts both clauses, and the
contradiction is the point of the change rather than an oversight in it.

`CLAUDE.md` is updated in the same commit to state the new contract: the consent
*declaration* lives in `ConsentBootstrap.astro` and is the only analytics code
permitted in a layout; tracker *loading* still lives in `CookieConsent.astro`
and nowhere else; GA4 loads unconditionally under a denied consent state, and
HubSpot and Clarity remain gated. The spirit of the original rule — one file
owns tracker loading, and a layout may not add a fourth tracker — is preserved.

### The notice copy

The pip reading `No trackers loaded` becomes false the moment GA4 loads for
everyone, and the notice is a legal surface. Two edits, both subject to approval
before they ship:

- the pip: `No trackers loaded` → `Nothing stored yet`
- the body gains one sentence, to the effect that until the reader accepts, we
  receive an anonymous cookieless signal that a page was viewed, with no
  identifiers and nothing stored on their device.

Every other word of the notice, and the whole long-form register beneath it,
is unchanged.

### Verification

Consent state is encoded in the `gcs` parameter of the GA4 collect request.
The design is verified in a browser, not by reading the diff:

| State | Expected |
|---|---|
| Fresh visitor, notice open | `/g/collect` request present, `gcs=G100` |
| After Accept all | `gcs=G111`; HubSpot and Clarity scripts appear |
| After Customise → reject | `gcs=G100` persists; no HubSpot, no Clarity |
| Returning accepted visitor | `gcs=G111` on the first request, no 500ms stall |

## B. Conversion coverage

> **EXTENDED, 2026-08-27.** The owner added a second requirement mid-flight —
> "we need to track each action user is taking on website to see intrest" —
> which this section does not cover. It shipped as `src/lib/engagement.ts`
> (link clicks classified by kind and page location, sections reached,
> disclosures opened, forms started) and as the `schedule_step` booking funnel.
> The event vocabulary that resulted is tabulated in `CLAUDE.md`.


A new `src/lib/analytics.ts` — a small typed façade over `gtag`, so that no
component reaches for `window.gtag` directly and every event name is declared in
one place. It exposes `track(event, params)` and the first-touch helpers below.

### Events added

| Event | Fired from | Currently |
|---|---|---|
| `generate_lead` | `ScheduleWidget.tsx`, the `data.success` branch (~line 524) | nothing |
| `form_submit` | `ContactForm.tsx` | already fires; gains attribution params |
| `contact_click` | `Base.astro` click handler, for `mailto:` and `tel:` | nothing — the handler tests `href.startsWith('http')` |
| `page_not_found` | `404.astro`, carrying the requested path and referrer | nothing |

`generate_lead` and `form_submit` are the two to mark as key events in the GA4
UI. That is a console action, not a code change; it is listed in the plan as a
manual step rather than silently assumed.

### HubSpot attribution

`ContactForm.tsx` posts to the Forms API with a `context` block naming only the
page. The HubSpot script sets a `hutk` cookie; passing it in that block is what
lets HubSpot join the submission to the visitor's browsing history. Read it from
`document.cookie` and include it when present — absent when the visitor declined
consent, which is correct and must not throw.

### First-touch attribution

A visitor arrives on a campaign link, reads for a while, and books three days
later. Today the source of that lead is lost. On first load we capture
`utm_*`, `document.referrer`, the landing path and a timestamp, and attach them
to `generate_lead` and `form_submit`.

Storage is deliberately two-stage, because attribution data is not strictly
necessary and pre-consent device storage is the exact thing the notice governs:

- pre-consent → `sessionStorage`, so it lives no longer than the visit
- on consent → promoted to `localStorage`, so it survives the days before booking

This is the one part of the design with a defensible-but-arguable legal shape.
It is called out here so it can be reviewed deliberately rather than discovered.

### Clarity ↔ GA4

`clarity('set', 'ga4_session_id', id)` once both exist, so any conversion in GA4
can be traced to the session recording behind it. Both are consent-gated, so
this runs only in the accepted state.

## C. Crawl and index

**`public/robots.txt`** gains explicit `Allow` blocks for `GPTBot`,
`OAI-SearchBot`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`
and `CCBot`. They all crawl by default today; stating the permission makes the
intent legible and survives a future default flip. No `llms.txt` — Google has
confirmed it does not read it, adoption is around 10%, and no major provider has
committed to it. It would be a file we maintain for nobody.

**The dangling `#website` reference.** `about.astro`, `contact.astro`,
`case-studies.astro` and `blog/index.astro` each declare
`isPartOf: { '@id': ... '#website' }`, but only `index.astro` puts the `website`
node in its graph. A per-page graph that references a node it does not contain
resolves to nothing. Fix: add `website` to those four graphs alongside
`organization`, which is already imported in each.

**`FAQPage` on service pages.** This is where question-shaped B2B queries get
captured, and `services/[slug].astro` emits only `ProfessionalService` today.
The schema work is small: an optional `faq` array on the `services` collection
in `src/content.config.ts`, and a template branch that emits `FAQPage` only when
the array is present. The *content* is not small and is not invented here —
Google penalises fabricated Q&A, and answers about our engagements have to come
from the people who run them. Authoring is a separate task with the user.

**IndexNow.** A key file at `public/<key>.txt` and a post-deploy ping step in
`.github/workflows/deploy.yml`, so Bing and the ChatGPT search index pick up
changes in hours rather than weeks. Google does not participate.

**The X handle.** `https://twitter.com/cloudalgo` returned 404 to an
unauthenticated fetch. X serves 404 to logged-out profile requests generally, so
this proves nothing either way — but an unowned `sameAs` entry actively degrades
entity resolution, so it wants a thirty-second look in a logged-in browser
before we leave it asserted.

## D. Speed

Core Web Vitals are a ranking signal, so this belongs here rather than in a
performance backlog. It begins with measurement, not prescription: a Lighthouse
run against `npm run preview` via the Chrome DevTools MCP, on the home page, a
service page and a journal entry, before anything is recommended.

Two things are already certain:

- **Four unreferenced hero JPEGs**, ~1.1MB in `public/`, survive from the
  pre-redesign site and are referenced by no source file: `hero-silder.jpg`
  (409KB), `blog-header-bg.jpg` (311KB), `services-hero-bg.jpg` (260KB),
  `contact-bg.jpg` (156KB). Verified by grep across `src/`. They ship on every
  deploy and serve nobody. Delete.
- **`og-default.jpg`** is 193KB at 2400×1260. It is never on the critical path —
  crawlers fetch it, readers do not — so this is deploy weight rather than LCP,
  and it recompresses to roughly half with no visible loss.

The Google Fonts stylesheet is render-blocking from a third-party host, which is
the obvious next suspect. `Base.astro` documents a deliberate reason for the
current arrangement, so it is measured before it is touched, and it is out of
scope for this design.

## Sequencing

Four workstreams, ordered by risk rather than by value:

1. **D-quick** — delete the four dead JPEGs. Zero risk, immediate, independent.
2. **A** — Consent Mode v2 and the notice copy. Everything else in tracking
   depends on it, and it carries the copy approval.
3. **B** — conversion coverage, on top of A's façade.
4. **C** — crawl and index. Independent of A and B; `FAQPage` content splits off
   into its own task.
5. **D-measured** — Lighthouse, then a recommendation.

## Gates

Every commit passes the project's existing gates: `npm run build` and
`npm run astro check`. Workstream A additionally passes the four-state browser
verification in the table above — a green build does not imply a working
consent flow, and `CLAUDE.md` already warns that Astro 7's rolldown pipeline
lets runtime breakage through a green build.

## Out of scope

- Keyword and content strategy. Search Console is verified; an export of its
  Performance data would turn workstream C from best practice into targeting
  queries we nearly rank for already. That is the highest-value next task and it
  is not this one.
- Google Ads and remarketing. Consent Mode v2 restores eligibility for them;
  configuring them is separate.
- Self-hosting fonts.
- Rewriting any part of `src/data/schema.ts` beyond the `website` node fix.
