# Salesforce EMR Sync Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third case study (anonymized: "Pediatric Therapy Clinic") and a companion blog post documenting the Salesforce ↔ Fusion Web Clinic browser-automation integration.

**Architecture:** The case study system is already fully built and data-driven from `src/data/case-studies.ts`. No new pages, routes, or content collections are needed. The only structural work is (1) adding a new entry to the data array, (2) adding SVG illustration branches in two existing page files, and (3) writing the blog post markdown.

**Tech Stack:** Astro 6, TypeScript, inline SVG (monochrome, `viewBox` per CLAUDE.md conventions), Markdown

---

## File Map

| File | Change |
|---|---|
| `src/data/case-studies.ts` | Add third `CaseStudy` entry (`salesforce-emr-sync`) |
| `src/pages/case-studies.astro` | Add SVG branch for new `cs.id`; update badge "2 studies" → "3 studies" |
| `src/pages/case-studies/[slug].astro` | Add SVG branch for new `cs.id` |
| `src/content/blog/2026-06-10-when-your-emr-has-no-api.md` | New blog post |

---

## Task 1: Add case study data entry

**Files:**
- Modify: `src/data/case-studies.ts`

- [ ] **Step 1: Add the new CaseStudy object**

Open `src/data/case-studies.ts`. After the closing `},` of the `enterprise-data-pipeline` entry (line ~345), append the following before the closing `];`:

```typescript
  {
    id: 'salesforce-emr-sync',
    index: '03',
    company: 'Pediatric Therapy Clinic',
    industry: 'Healthcare',
    service: 'Heroku · Salesforce · Integration',
    metric: '0',
    metricLabel: 'manual data entry required — every patient sync fully automated',
    summary:
      'A pediatric therapy clinic was manually re-entering every patient intake from Salesforce into their EMR — a web portal with no public API. CloudAlgo built a Heroku-hosted Node.js integration using Puppeteer-driven browser automation and a RabbitMQ message queue to fully automate the sync, running 24/7 without staff intervention.',
    tags: ['Heroku', 'Salesforce', 'Puppeteer', 'Node.js', 'RabbitMQ', 'Redis', 'TypeScript'],
    duration: '3-month engagement',
    result: 'Fully automated Salesforce → EMR patient sync — zero re-entry, 24/7 coverage',

    headline: 'No API? No problem. Automating patient data sync with a browser robot on Heroku.',

    executiveSummary:
      'A pediatric therapy clinic had two systems that couldn\'t talk to each other: Salesforce for patient intake and an EMR for clinical records. Every new patient meant staff manually re-entering the same information twice — names, dates of birth, insurance, parent contacts, case notes. The EMR vendor provided no public API. CloudAlgo built a Heroku-hosted integration that closes the gap: a queue-backed Node.js worker that uses Puppeteer to drive a headless Chrome session through the EMR portal, populating every field exactly as a human would — but continuously, automatically, and without errors.',

    challenge:
      'Healthcare operations teams rarely choose which software they use — the EMR is mandated, the CRM is the enterprise standard, and the integration gap between them becomes a staffing problem. For this clinic, every patient intake created a dual-entry burden: clinical and administrative data recorded in Salesforce had to be manually transcribed into the EMR portal, field by field, form by form.',

    challengePoints: [
      'Every patient intake required staff to open two systems and enter the same information twice — patient details, parent/guardian contacts, insurance coverage, and clinical case notes.',
      'Transcription errors in patient records carry real risk in a clinical setting. A wrong date of birth, an incorrect insurance ID, or a missing parent phone number creates downstream problems in billing, scheduling, and care coordination.',
      'Staff time spent on dual data entry could not be spent on patient care, scheduling, or clinical support — the work the clinic actually hired for.',
      'The EMR vendor provided no public API, no webhook support, and no data export endpoint. The only integration surface was the web portal itself.',
    ],

    whyNotOffShelf:
      'The absence of an API is not a configuration problem — it\'s an architectural one. No integration platform, no middleware connector, and no low-code tool can connect to a system that doesn\'t expose an integration interface. Zapier, MuleSoft, and Heroku Connect all require at minimum a REST API or a database connection. When the only interface is a JavaScript-heavy web portal, the only viable bridge is a programmatic browser that can interact with it as a human would.',

    toolComparison: [
      {
        tool: 'Zapier',
        category: 'No-code automation',
        doesWell: 'Simple trigger-action workflows between systems with native connectors',
        limitation: 'Requires an API or a native app connector. No EMR connector exists. Cannot drive a web portal.',
      },
      {
        tool: 'MuleSoft',
        category: 'iPaaS',
        doesWell: 'Enterprise-grade API connectivity with deep integration logic',
        limitation: 'Only as capable as the APIs available. No API means MuleSoft has nothing to connect to on the EMR side.',
      },
      {
        tool: 'Heroku Connect',
        category: 'Database sync',
        doesWell: 'Bidirectional Salesforce ↔ Postgres sync with no custom code',
        limitation: 'Syncs to a Postgres database, not to a web portal. The EMR has no database access layer.',
      },
      {
        tool: 'Manual entry',
        category: 'Status quo',
        doesWell: 'Always works — no technical risk or upfront investment',
        limitation: 'Staff time per patient, transcription errors, and no scaling path as patient volume grows.',
      },
    ],

    solution:
      'CloudAlgo built a two-process Heroku application: a web process that manages Salesforce OAuth credentials and a worker process that listens to a RabbitMQ queue. When a patient record is created or updated in Salesforce, an Apex trigger publishes a job to the queue. The worker picks it up, launches a Puppeteer-controlled headless Chrome session, operates the EMR portal to create or update the patient record, and returns the resulting EMR patient ID back to Salesforce via an Apex REST callback.',

    solutionSteps: [
      {
        title: 'Salesforce Triggers the Queue',
        body: 'When a patient record is created or updated in Salesforce, an Apex trigger publishes a job payload to a RabbitMQ queue hosted on CloudAMQP. The queue decouples Salesforce event timing from the sync operation — Salesforce doesn\'t wait for the browser to finish, job bursts don\'t stack up Puppeteer sessions, and failed jobs are nack\'d without data loss.',
      },
      {
        title: 'OAuth Credentials Cached in Redis',
        body: 'A web process handles the Salesforce OAuth 2.0 flow and stores access tokens, refresh tokens, and instance URLs in Heroku Redis. The jsforce library automatically refreshes expired tokens and updates the cache — so the integration stays connected indefinitely without manual re-authentication.',
      },
      {
        title: 'Puppeteer Drives the EMR Portal',
        body: 'For each job, the worker launches a headless Chrome browser via the Google Chrome buildpack on Heroku. Puppeteer navigates to the EMR portal, logs in, and programmatically interacts with the interface: clicking buttons, selecting dropdown options, filling form fields, and waiting for network idle before each step. The worker detects and resolves idle lock screen re-authentication automatically, and checks field values before writing — only updating fields that have actually changed.',
      },
      {
        title: 'EMR Patient ID Written Back to Salesforce',
        body: 'After creating or updating the patient record, the worker extracts the EMR patient ID from the portal and calls a Salesforce Apex REST endpoint to write it back. The Salesforce record is now linked to the EMR record by ID, enabling future updates to target the correct patient without re-searching. On any failure, the worker sends an error callback so the Salesforce record reflects the failure rather than remaining silently stale.',
      },
    ],

    technicalHighlights: [
      {
        title: 'Browser Automation as Integration Layer',
        body: 'Puppeteer driving a full Chromium instance is not the first-choice integration pattern — but when there is no API, it is the only viable one. The architecture treats the browser as a typed, programmatic interface: CSS selectors as contracts, network idle waits as synchronisation points, and field-level read-before-write logic to prevent unnecessary mutations.',
      },
      {
        title: 'Queue-Backed, Decoupled Architecture',
        body: 'A synchronous Salesforce → EMR call would mean Salesforce waits for Puppeteer to complete — a multi-second operation that can time out, stall on a lock screen, or encounter unexpected DOM state. RabbitMQ decouples the trigger from the execution: the queue absorbs bursts, failed jobs are nack\'d without data loss, and the worker processes at its own pace without blocking the Salesforce transaction.',
      },
      {
        title: 'Lock Screen and Idempotent Field Writes',
        body: 'The EMR portal shows a password re-entry dialog after idle periods. The worker detects this overlay at every interaction point and resolves it before continuing. Field writes are also idempotent: the current value is read before typing, and the field is only updated if the value differs — preventing spurious writes and reducing the risk of triggering portal-side validation errors on unchanged fields.',
      },
      {
        title: 'Heroku Add-Ons Eliminate Infrastructure',
        body: 'The Google Chrome buildpack makes Chrome available on the dyno without Docker. Heroku Redis provides token caching, CloudAMQP provides the managed RabbitMQ queue, and Papertrail aggregates logs. No container orchestration, no managed cloud infrastructure. The stack deploys with a git push.',
      },
    ],

    outcomes: [
      { metric: 'Zero', label: 'Manual data entry — every patient sync is fully automated' },
      { metric: '24/7', label: 'Continuous coverage — the worker runs around the clock without supervision' },
      { metric: '0', label: 'Transcription errors — Salesforce is the source of truth, written once' },
    ],

    whatDemonstrates: [
      {
        title: 'We find the integration path, even when there isn\'t one.',
        body: 'No API doesn\'t mean no solution. It means the solution requires a different kind of engineering. Recognising that a headless browser is a legitimate, architecturally sound integration layer — not a workaround — is what made this problem solvable.',
      },
      {
        title: 'Architecture decisions prevent operational debt.',
        body: 'A synchronous direct-call integration would have worked initially and broken under any load or timeout. Queue decoupling, Redis token caching, and error callbacks to Salesforce are not over-engineering — they\'re the difference between something that works at 3am on a Monday and something that only works when someone is watching.',
      },
      {
        title: 'Healthcare constraints require defensive engineering.',
        body: 'Patient data accuracy is not a UX concern — it\'s a clinical one. Idempotent writes, lock screen detection, and failure callbacks were built because silent errors in a medical context are not acceptable. The integration behaves defensively by design.',
      },
      {
        title: 'Platform choice is an operational cost decision.',
        body: 'Heroku\'s add-on ecosystem eliminated a significant infrastructure footprint: no managed Redis to provision, no AMQP cluster to configure, no Chrome runtime to containerise. That operational simplicity is a cost advantage that compounds over the lifetime of the integration.',
      },
    ],

    techStack: [
      { layer: 'Runtime', technology: 'Node.js · TypeScript' },
      { layer: 'Web Framework', technology: 'Express.js' },
      { layer: 'Browser Automation', technology: 'Puppeteer (headless Chromium)' },
      { layer: 'Salesforce API', technology: 'jsforce (OAuth 2.0, Apex REST callbacks)' },
      { layer: 'Job Queue', technology: 'RabbitMQ via CloudAMQP' },
      { layer: 'Token Cache', technology: 'Heroku Redis (mini)' },
      { layer: 'Process Management', technology: 'Throng (clustered worker processes)' },
      { layer: 'Hosting', technology: 'Heroku (web + worker dyno formation)' },
      { layer: 'Chrome Runtime', technology: 'Google Chrome buildpack' },
      { layer: 'Logging', technology: 'Papertrail' },
    ],
  },
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run astro check
```

Expected: no type errors. If you see `Property 'X' is missing`, check that every required field in the `CaseStudy` interface is present in the new entry.

- [ ] **Step 3: Commit**

```bash
git add src/data/case-studies.ts
git commit -m "feat(case-studies): add salesforce-emr-sync case study data"
```

---

## Task 2: Add listing card SVG + update badge count

**Files:**
- Modify: `src/pages/case-studies.astro`

The listing page renders an SVG per `cs.id` inside `.cs-card-illo`. It also has a badge in the hero SVG that says "2 studies".

- [ ] **Step 1: Add the card illustration SVG**

In `src/pages/case-studies.astro`, locate the block ending with:
```astro
              )}
            </div>
```
that closes the `{cs.id === 'enterprise-data-pipeline' && (` SVG branch (around line 139). Add the new branch immediately after the closing `)}` of `enterprise-data-pipeline`, before the closing `</div>` of `.cs-card-illo`:

```astro
              {cs.id === 'salesforce-emr-sync' && (
                <svg viewBox="0 0 320 160" fill="none" class="cs-illo-svg">
                  <!-- Top row: SF → Queue → Worker -->
                  <rect x="14" y="22" width="56" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45" fill="rgba(10,10,10,0.05)"/>
                  <text x="42" y="39" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="800" fill="#0A0A0A" opacity="0.65" letter-spacing="0.04em">SALESFORCE</text>
                  <!-- Arrow SF→Queue -->
                  <path d="M71 35 L82 35" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round"/>
                  <path d="M79 32 L84 35 L79 38" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Queue -->
                  <rect x="84" y="22" width="64" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.38" fill="rgba(10,10,10,0.04)"/>
                  <text x="116" y="32" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="800" fill="#0A0A0A" opacity="0.55" letter-spacing="0.04em">RABBITMQ</text>
                  <text x="116" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="600" fill="#0A0A0A" opacity="0.35">QUEUE</text>
                  <!-- Arrow Queue→Worker -->
                  <path d="M149 35 L160 35" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round"/>
                  <path d="M157 32 L162 35 L157 38" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Worker -->
                  <rect x="162" y="22" width="70" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.48" fill="rgba(10,10,10,0.05)"/>
                  <text x="197" y="32" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="800" fill="#0A0A0A" opacity="0.68" letter-spacing="0.04em">HEROKU</text>
                  <text x="197" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="600" fill="#0A0A0A" opacity="0.42">WORKER</text>
                  <!-- Arrow Worker→Puppeteer (down) -->
                  <path d="M197 49 L197 60" stroke="#0A0A0A" stroke-width="1.5" opacity="0.35" stroke-linecap="round"/>
                  <path d="M194 57 L197 62 L200 57" stroke="#0A0A0A" stroke-width="1.5" opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Puppeteer/Chrome -->
                  <rect x="162" y="63" width="70" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.50" fill="rgba(10,10,10,0.05)"/>
                  <text x="197" y="73" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="800" fill="#0A0A0A" opacity="0.70" letter-spacing="0.04em">PUPPETEER</text>
                  <text x="197" y="83" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="600" fill="#0A0A0A" opacity="0.42">CHROME</text>
                  <!-- Arrow Puppeteer→Fusion -->
                  <path d="M233 76 L244 76" stroke="#0A0A0A" stroke-width="1.5" opacity="0.38" stroke-linecap="round"/>
                  <path d="M241 73 L246 76 L241 79" stroke="#0A0A0A" stroke-width="1.5" opacity="0.38" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Fusion EMR -->
                  <rect x="247" y="63" width="58" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.62" fill="rgba(10,10,10,0.07)"/>
                  <text x="276" y="73" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="800" fill="#0A0A0A" opacity="0.80" letter-spacing="0.04em">FUSION</text>
                  <text x="276" y="83" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="600" fill="#0A0A0A" opacity="0.50">EMR PORTAL</text>
                  <!-- Callback arc Fusion → SF -->
                  <path d="M276 90 C 276 118 42 118 42 50" stroke="#0A0A0A" stroke-width="1.5" opacity="0.18" stroke-dasharray="4 3" fill="none"/>
                  <path d="M39 53 L42 48 L45 53" stroke="#0A0A0A" stroke-width="1.5" opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>
                  <text x="159" y="130" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="600" fill="#0A0A0A" opacity="0.22" letter-spacing="0.04em">Fusion ID callback → Salesforce</text>
                  <!-- Metric badge -->
                  <rect x="14" y="63" width="68" height="26" rx="5" fill="#0A0A0A"/>
                  <text x="48" y="76" text-anchor="middle" font-family="Outfit,sans-serif" font-size="13" font-weight="900" fill="#fff">24/7</text>
                  <text x="48" y="86" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="rgba(255,255,255,0.55)">automation</text>
                </svg>
              )}
```

- [ ] **Step 2: Update the hero badge from "2 studies" to "3 studies"**

In `src/pages/case-studies.astro`, find this line (around line 67):
```astro
            <text x="391" y="69" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" font-weight="700" fill="#fff">2 studies</text>
```

Replace with:
```astro
            <text x="391" y="69" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" font-weight="700" fill="#fff">3 studies</text>
```

- [ ] **Step 3: Verify build**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/case-studies.astro
git commit -m "feat(case-studies): add salesforce-emr-sync card SVG, update badge to 3 studies"
```

---

## Task 3: Add detail page hero SVG

**Files:**
- Modify: `src/pages/case-studies/[slug].astro`

The detail page renders an SVG per `cs.id` inside `.csd-hero-illo`. Use `viewBox="0 0 360 300"`.

- [ ] **Step 1: Add the hero SVG branch**

In `src/pages/case-studies/[slug].astro`, locate the block ending with:
```astro
          )}
        </div>
      </div>
    </div>
  </div>
```
that closes the `{cs.id === 'enterprise-data-pipeline' && (` SVG (around line 139). Add the new branch immediately after its closing `)}`, before the closing `</div>` of `.csd-hero-illo`:

```astro
          {cs.id === 'salesforce-emr-sync' && (
            <svg viewBox="0 0 360 300" fill="none" class="csd-hero-svg">
              <!-- Row 1: Salesforce → RabbitMQ → Heroku Worker -->
              <rect x="20" y="28" width="92" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" fill="rgba(10,10,10,0.03)"/>
              <text x="66" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="800" fill="#0A0A0A" opacity="0.50" letter-spacing="0.06em">SALESFORCE</text>
              <text x="66" y="62" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.28">Apex trigger · payload</text>
              <!-- Arrow SF→Queue -->
              <path d="M113 50 L130 50" stroke="#0A0A0A" stroke-width="1.5" opacity="0.22" stroke-dasharray="4 3"/>
              <path d="M127 47 L132 50 L127 53" stroke="#0A0A0A" stroke-width="1.5" opacity="0.22" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- RabbitMQ Queue -->
              <rect x="133" y="28" width="100" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.32" fill="rgba(10,10,10,0.03)"/>
              <text x="183" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="800" fill="#0A0A0A" opacity="0.55" letter-spacing="0.06em">RABBITMQ</text>
              <text x="183" y="62" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.28">CloudAMQP · async queue</text>
              <!-- Arrow Queue→Worker -->
              <path d="M234 50 L252 50" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round"/>
              <path d="M249 47 L254 50 L249 53" stroke="#0A0A0A" stroke-width="1.5" opacity="0.28" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Heroku Worker -->
              <rect x="255" y="28" width="85" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.40" fill="rgba(10,10,10,0.04)"/>
              <text x="297" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="800" fill="#0A0A0A" opacity="0.62" letter-spacing="0.06em">HEROKU</text>
              <text x="297" y="62" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.30">Worker dyno</text>
              <!-- Arrow Worker→Puppeteer (down) -->
              <path d="M297 73 L297 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0.32" stroke-linecap="round"/>
              <path d="M294 87 L297 92 L300 87" stroke="#0A0A0A" stroke-width="1.5" opacity="0.32" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Redis (side panel) -->
              <rect x="133" y="94" width="100" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.25" fill="rgba(10,10,10,0.02)"/>
              <text x="183" y="114" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="800" fill="#0A0A0A" opacity="0.40" letter-spacing="0.06em">REDIS</text>
              <text x="183" y="128" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.22">OAuth token cache</text>
              <!-- Dashed line Worker→Redis -->
              <path d="M255 66 C 240 66 240 116 234 116" stroke="#0A0A0A" stroke-width="1" opacity="0.18" stroke-dasharray="3 3" fill="none"/>
              <!-- Puppeteer / Chrome -->
              <rect x="255" y="94" width="85" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.50" fill="rgba(10,10,10,0.05)"/>
              <text x="297" y="114" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="800" fill="#0A0A0A" opacity="0.70" letter-spacing="0.06em">PUPPETEER</text>
              <text x="297" y="128" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.35">headless Chrome</text>
              <!-- Arrow Puppeteer→Fusion (down) -->
              <path d="M297 139 L297 156" stroke="#0A0A0A" stroke-width="1.5" opacity="0.42" stroke-linecap="round"/>
              <path d="M294 153 L297 158 L300 153" stroke="#0A0A0A" stroke-width="1.5" opacity="0.42" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Fusion EMR -->
              <rect x="255" y="159" width="85" height="44" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.68" fill="rgba(10,10,10,0.07)"/>
              <text x="297" y="179" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="800" fill="#0A0A0A" opacity="0.85" letter-spacing="0.06em">FUSION EMR</text>
              <text x="297" y="193" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.45">web portal · no API</text>
              <!-- Callback arc Fusion→SF -->
              <path d="M255 181 C 180 181 66 181 66 74" stroke="#0A0A0A" stroke-width="1.5" opacity="0.18" stroke-dasharray="5 4" fill="none"/>
              <path d="M63 77 L66 72 L69 77" stroke="#0A0A0A" stroke-width="1.5" opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="159" y="218" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.22" letter-spacing="0.04em">Fusion ID callback → /apex/updateSyncRequest</text>
              <!-- Metric badge -->
              <rect x="20" y="159" width="100" height="44" rx="8" fill="#0A0A0A"/>
              <text x="70" y="180" text-anchor="middle" font-family="Outfit,sans-serif" font-size="14" font-weight="900" fill="rgba(255,255,255,0.85)">24/7</text>
              <text x="70" y="196" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="rgba(255,255,255,0.45)">zero manual entry</text>
            </svg>
          )}
```

- [ ] **Step 2: Verify build**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/case-studies/[slug].astro
git commit -m "feat(case-studies): add salesforce-emr-sync detail page hero SVG"
```

---

## Task 4: Write the blog post

**Files:**
- Create: `src/content/blog/2026-06-10-when-your-emr-has-no-api.md`

- [ ] **Step 1: Create the blog post file**

Create `src/content/blog/2026-06-10-when-your-emr-has-no-api.md` with the following content:

```markdown
---
title: "When Your EMR Has No API: Automating Patient Data Sync with Heroku and Puppeteer"
date: 2026-06-10
category: Heroku
excerpt: "How we eliminated manual double data entry for a therapy clinic by building a queue-backed browser robot on Heroku that syncs Salesforce patient records into a no-API EMR portal — and why that is the right architecture for locked-down systems."
readTime: 5
published: true
author: "Sandeep Kumar"
authorDesignation: "Engineering Lead"
---

The therapy clinic intake process looked something like this: a patient family calls to schedule an evaluation. The care coordinator opens Salesforce, creates the patient record — first name, last name, date of birth, parent contact, insurance plan, case notes from the intake call. Then they switch to a different tab, open the EMR, and type it all again.

Every day. For every patient. No copy-paste. No shortcut. Just two systems that don't speak to each other.

This is a problem we encounter regularly in healthcare-adjacent software engagements: a CRM manages the intake side of the relationship, a clinical system manages the care side, and there's a human in the middle transcribing data between them.

#### The Constraint

The EMR in this engagement was a web-based practice management system designed for therapy practices. It handles scheduling, clinical documentation, billing, and patient records. What it does not provide is a public API, a webhook endpoint, or any documented integration interface. The only way to interact with it is through the web application itself.

That means no REST connector, no Zapier integration, no MuleSoft adapter. Every tool that could be described as an "integration platform" assumes there's an API on both ends. When one end is a JavaScript-heavy web portal with no exposed endpoints, those tools are simply not applicable.

#### The Pattern

When a third-party system has no API, the only viable integration layer is a programmatic browser — a piece of software that can navigate a web application, interact with its interface, and read results from the DOM. This is not a workaround. For locked-down systems, it is the architectural choice.

The pattern we implemented on Heroku:

1. **Event** — Salesforce records a patient intake. An Apex trigger publishes a job payload to a RabbitMQ queue.
2. **Queue** — The job sits in CloudAMQP until the worker is ready. This decoupling matters: Salesforce doesn't wait for the browser to finish, and job bursts don't pile up Puppeteer sessions.
3. **Worker** — A Heroku worker dyno dequeues the job, retrieves cached Salesforce OAuth credentials from Heroku Redis, and calls the sync processor.
4. **Browser** — Puppeteer launches a headless Chrome session (via the Google Chrome buildpack on Heroku), logs into the EMR portal, and operates the interface: clicking buttons, filling form fields, selecting dropdown values, and waiting for network idle between steps.
5. **Callback** — After creating or updating the patient record, the worker extracts the EMR patient ID and calls a Salesforce Apex REST endpoint to write it back. The Salesforce record now holds the EMR ID as a permanent link.

#### Architecture Details

The application runs as two Heroku processes, defined in the Procfile.

**Web process**: An Express server that handles the Salesforce OAuth 2.0 flow. It exposes an `/auth/salesforce` route to initiate the handshake and a callback endpoint that stores the resulting access token, refresh token, and instance URL in Redis. The jsforce library automatically refreshes expired tokens — the connection stays live indefinitely without manual re-authentication.

**Worker process**: A Throng-clustered RabbitMQ consumer. On each message, it deserializes the payload, checks for an existing EMR patient ID in the payload, and branches: update the existing record if the ID is present, create a new one if not. After the Puppeteer session completes, it calls back to Salesforce with the result or an error.

**Sync processor**: The Puppeteer automation layer. It populates:

- Patient info — name, date of birth, SSN, gender, primary location
- Contact info — parent/guardian name, address, phone, email, city, zip
- Insurance coverage — plan name (searched by text), policy ID number
- Case notes — intake notes, appointment notes, and parent concerns as separate note entries

Two edge cases required deliberate handling.

**Lock screen**: The EMR portal shows a password re-entry dialog after idle periods. The worker detects this overlay at every interaction point and resolves it before continuing.

**Idempotent writes**: Before typing into a field, the processor reads the current value. It only writes if the value has changed. This prevents spurious mutations and reduces the risk of triggering validation errors on unchanged fields.

#### Why Heroku

The Google Chrome buildpack is the deciding factor. Running a headless Chrome instance requires a Chrome binary in the execution environment — non-trivial to configure in most cloud setups, and typically requires a custom Docker image. Heroku's buildpack system installs Chrome alongside Node.js at deploy time, with no Docker or container orchestration required.

Beyond Chrome, the add-on ecosystem eliminates infrastructure overhead:

- **Heroku Redis** (mini) — OAuth token caching
- **CloudAMQP** — Managed RabbitMQ queue
- **Papertrail** — Log aggregation

The two-process Procfile model (`web` and `worker`) maps cleanly to the separation of concerns: authentication lives in the web process, automation lives in the worker.

#### Outcomes

The integration eliminated all manual re-entry for patient intake. The sync runs continuously, handles new patients and updates equally, and writes the EMR patient ID back to Salesforce so both systems stay linked for the lifetime of the patient relationship.

Error handling is explicit: failures produce a callback to Salesforce with the error message, so records don't stay silently stale. The queue handles retries without data loss.

The broader point: when an integration problem looks unsolvable because there's no API, that's usually a signal that the right answer is an unusual one — not that there's no answer. A queue-backed browser robot isn't elegant in the abstract. In practice, it's the right tool.

---

[See the full case study &rarr;](/case-studies/salesforce-emr-sync)

Have a similar integration challenge between Salesforce and a system with no API? [Get in touch.](/contact)
```

- [ ] **Step 2: Verify the blog post builds**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```

Expected: build succeeds, no schema validation errors. If you see a schema error, check that `category: Heroku` matches the enum in `src/content.config.ts` (it should — `Heroku` is a valid value).

- [ ] **Step 3: Commit**

```bash
git add src/content/blog/2026-06-10-when-your-emr-has-no-api.md
git commit -m "feat(blog): add 'When Your EMR Has No API' post"
```

---

## Task 5: Visual verification and final commit

**Files:**
- No file changes — verification only

- [ ] **Step 1: Start the dev server**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run dev
```

- [ ] **Step 2: Check the case studies listing page**

Open `http://localhost:4321/case-studies` in a browser.

Verify:
- Three case study cards are visible
- The hero badge reads "3 studies"
- The third card (Pediatric Therapy Clinic) shows the flow diagram SVG in its illustration area
- The card displays index "03", industry "Healthcare", metric "0"
- "Read full case study →" link is present

- [ ] **Step 3: Check the case study detail page**

Open `http://localhost:4321/case-studies/salesforce-emr-sync`.

Verify:
- Hero renders with title, pills (Healthcare, Heroku · Salesforce · Integration), and the architecture diagram SVG
- Challenge section shows the 4 bullet points
- "Why standard tools failed" section renders the 4-row tool comparison table (Zapier, MuleSoft, Heroku Connect, Manual entry)
- Solution section shows 4 numbered steps on dark background
- Technical highlights section shows 4 cards
- Outcomes section shows 3 cards: "Zero", "24/7", "0"
- "What this shows" section shows 4 cards on dark background
- Tech stack grid renders 10 rows
- Prev/Next navigation shows `enterprise-data-pipeline` as Previous, no Next (it's the last entry)
- CTA section renders at bottom

- [ ] **Step 4: Check the blog post**

Open `http://localhost:4321/blog`.

Verify:
- "When Your EMR Has No API" post appears in the listing
- Click through to the post; verify headings, body text, and the two CTAs at the bottom render correctly

- [ ] **Step 5: Final commit if any fixes were needed**

If any visual fixes were applied during verification:

```bash
git add -p
git commit -m "fix(case-studies): visual corrections after dev review"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Blog post (Task 4)
- ✅ Case study page — hero, challenge, constraint (toolComparison), solution steps, technical highlights, outcomes, whatDemonstrates, tech stack (Task 1 + Task 3)
- ✅ Case study listing card with SVG illustration (Task 2)
- ✅ Badge updated from "2 studies" to "3 studies" (Task 2)
- ✅ Anonymized: "Pediatric Therapy Clinic", no real client names
- ✅ No hard metrics: outcomes use "Zero", "24/7", "0" (qualitative framing)
- ✅ Blog post CTA links to `/case-studies/salesforce-emr-sync`

**Placeholder scan:** None — all code, SVG, and copy is written out in full.

**Type consistency:** The `CaseStudy` interface requires `toolComparison` entries to have `{ tool, category, doesWell, limitation }` — all four fields are present in each entry. The `outcomes` entries use `{ metric, label }` — both present. The `solutionSteps`, `technicalHighlights`, and `whatDemonstrates` entries use `{ title, body }` — both present. The `techStack` entries use `{ layer, technology }` — both present.
