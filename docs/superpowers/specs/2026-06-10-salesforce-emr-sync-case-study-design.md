# Design: Salesforce ↔ EMR Sync Case Study

**Date**: 2026-06-10  
**Status**: Approved  
**Deliverables**: Blog post + Case study page (anonymized client)

---

## Context

A pediatric therapy clinic used Salesforce as their patient intake/CRM system and Fusion Web Clinic as their EMR. Staff manually re-entered every patient record from Salesforce into the EMR. Fusion Web Clinic provides no public API — the only interface is the web portal. CloudAlgo built a Heroku-hosted Node.js app that automates the sync using Puppeteer-driven browser automation, decoupled via a RabbitMQ message queue.

The client is **anonymized** throughout all content.

---

## Deliverable 1: Blog Post

**File**: `src/content/blog/2026-06-10-when-your-emr-has-no-api.md`  
**Category**: `Heroku`  
**Read time**: 5 min  
**Published**: true  
**Title**: *When Your EMR Has No API: Automating Patient Data Sync with Heroku and Puppeteer*  
**Excerpt**: How we eliminated double data entry for a therapy clinic by building a queue-backed browser robot on Heroku that syncs Salesforce patient records into a no-API EMR portal.

### Content Sections

1. **The pain** (~150 words)  
   A therapy clinic's intake team records every new patient in Salesforce: name, date of birth, insurance, parent/guardian contacts, case notes. Then they open the EMR, find the same form, and type it all again. Every day, for every patient. No copy-paste. No shortcut. Just two systems that don't talk to each other.

2. **The constraint** (~100 words)  
   The EMR vendor (Fusion Web Clinic) offers no public API, no webhook, no data export endpoint. The only integration surface is the web application itself — the same UI a human clicks through.

3. **The pattern** (~150 words)  
   Frame this as a reusable pattern: *when a third-party system has no API, a queue-backed browser robot is a legitimate integration layer.* Heroku provides the infrastructure: a web dyno for the OAuth handshake, a worker dyno running RabbitMQ consumers, Chrome available via a buildpack, Redis for token caching, CloudAMQP for the queue, Papertrail for observability. This isn't a hack — it's a deliberate architecture choice for a constrained integration environment.

4. **Architecture walkthrough** (~200 words)  
   - **Web process** (`index.ts`): Express server handling the Salesforce OAuth 2.0 flow. Stores OAuth credentials (access token, refresh token, instance URL) in Redis. Exposes a health check.
   - **Worker process** (`worker.ts`): Throng-clustered RabbitMQ consumer. Dequeues sync jobs triggered by Salesforce Apex. Calls `syncFusionWeb()`. On completion, calls back to a Salesforce Apex REST endpoint (`/updateSyncRequest/`) with the resulting Fusion patient ID (or an error).
   - **Sync processor** (`sync-processor.ts`): Launches headless Chrome via Puppeteer. Logs into the Fusion portal. Branches on whether the payload includes a `fusion_web_id`: if yes, searches for the existing patient and updates; if no, creates a new patient record. Populates: patient info (name, DOB, SSN, gender, location), primary contact (parent/guardian: name, address, phone, email, city/zip), insurance coverage (type + ID number), case notes (notes, appointment notes, parent concerns). Returns the Fusion patient ID.

5. **Key decisions** (~200 words)  
   - **Why a queue**: decouples Salesforce event timing from the sync operation; allows retries; prevents Puppeteer sessions piling up under load.
   - **Why Puppeteer over simpler scraping tools**: the Fusion portal is a JS-heavy single-page app; DOM interaction (clicks, form fills, dropdown selections, network idle waits) requires a full browser runtime.
   - **Why Heroku**: the Google Chrome buildpack makes Chrome available in the dyno without custom Docker images; the add-on ecosystem (Redis, CloudAMQP, Papertrail) eliminates infrastructure overhead; the two-process Procfile model separates concerns cleanly.

6. **Edge cases worth noting** (~150 words)  
   - **Lock screen re-authentication**: Fusion's idle timeout shows a password dialog. The worker detects this and re-enters credentials before continuing.
   - **Idempotent field updates**: before writing a field, the processor reads the current value; it only types if the value differs. Prevents unnecessary mutations and reduces flicker/race conditions.
   - **Error callback**: if the sync fails at any point, the worker catches the exception and calls back to Salesforce with `fusionWebId: null, error: <message>` so the Salesforce record reflects the failure rather than staying silently stale.

7. **Outcome** (~100 words)  
   Zero manual re-entry. Staff time returned to patient care. The sync runs 24/7 without supervision, handles new patients and updates equally, and writes back the Fusion ID to Salesforce so both systems stay linked. No transcription errors in patient records.

8. **CTA**  
   "See the full case study →" (links to `/case-studies/salesforce-emr-sync`)  
   Secondary: "Have a similar integration challenge? [Get in touch](/contact)"

---

## Deliverable 2: Case Study Page

### Infrastructure (new)

| File | Purpose |
|---|---|
| `src/content.config.ts` | Add `case-studies` collection (glob loader, schema) |
| `src/content/case-studies/salesforce-emr-sync.md` | Case study frontmatter + body |
| `src/pages/case-studies/index.astro` | Listing page (cards for each case study) |
| `src/pages/case-studies/[slug].astro` | Detail page template |

### Case Study Frontmatter Schema

```ts
{
  title: z.string(),
  date: z.date(),
  industry: z.string(),
  excerpt: z.string(),
  challenge: z.string(),
  stack: z.array(z.string()),
  published: z.boolean()
}
```

### Detail Page Structure (`/case-studies/salesforce-emr-sync`)

1. **Hero**  
   - Eyebrow: `Case Study · Healthcare · Heroku`  
   - Title: *Eliminating Double Data Entry Between Salesforce and a No-API EMR*  
   - One-liner: "A therapy clinic needed patient records to flow automatically from Salesforce into their EMR — a portal with no API. We built the bridge."  
   - Tags: Heroku · Salesforce · Puppeteer · Node.js · RabbitMQ

2. **Challenge** (3 cards)  
   - Manual re-entry on every patient intake  
   - Transcription errors in a clinical setting  
   - Staff time diverted from care coordination

3. **The Constraint** (callout block)  
   > "The EMR vendor provided no API. The only integration surface was the web portal itself."

4. **How It Works** (numbered steps + inline SVG architecture diagram)  
   1. Patient intake recorded in Salesforce  
   2. Salesforce Apex triggers a job onto the RabbitMQ queue  
   3. Heroku worker dequeues the job  
   4. Puppeteer launches headless Chrome, logs into the EMR portal  
   5. Worker creates or updates the patient record (info, contacts, insurance, case notes)  
   6. Fusion patient ID returned to Salesforce via Apex callback  

   **SVG diagram**: `viewBox="0 0 320 160"`, monochrome, shows: Salesforce → Queue → Worker → Browser → Fusion Portal → callback arrow back to Salesforce.

5. **Technical Stack** (two columns)  
   - **Platform**: Heroku (Node.js dyno, Redis mini, CloudAMQP, Papertrail, Google Chrome buildpack)  
   - **Integration**: jsforce (Salesforce API), Puppeteer (browser automation), RabbitMQ (job queue), OAuth 2.0

6. **Outcomes** (3 qualitative cards)  
   - Zero manual re-entry  
   - Runs 24/7 unsupervised  
   - No transcription errors in patient records

7. **CTA**  
   "Have a similar integration challenge?" → primary button: "Get in touch" → `/contact`

### Listing Page (`/case-studies`)

Single card for now (the EMR sync case study). Card shows: industry tag, title, excerpt, stack tags, "Read case study →" link. Uses existing card styling (12px radius, 1px `--ca-border`, hover border → `--ca-black`).

---

## Tone & Style

- Audience: CTOs, VPs of Engineering/Operations evaluating Salesforce + Heroku integrations
- Voice: direct, technical but accessible — lead with the problem, explain the architecture honestly
- No orange, no Syne font, no inline Tailwind color utilities — follow `CLAUDE.md` palette and typography
- No hard metrics (none available) — frame outcomes qualitatively and confidently
- Client anonymized throughout: "a pediatric therapy clinic" or "the clinic"

---

## What Is NOT in Scope

- Updating the site navigation (header/footer) to add a Case Studies link — separate decision
- Any other case studies beyond this one
- Screenshots or real product imagery of Fusion Web Clinic
