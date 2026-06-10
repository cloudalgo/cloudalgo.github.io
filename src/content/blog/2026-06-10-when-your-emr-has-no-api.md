---
title: "When Your EMR Has No API: Automating Patient Data Sync with Heroku and Puppeteer"
date: 2026-06-10
category: Heroku
excerpt: "How we automated Salesforce-to-EMR patient data sync for a therapy clinic with no API access — Heroku, Puppeteer, and RabbitMQ running 24/7, zero double entry."
readTime: 5
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
relatedCaseStudy: salesforce-emr-sync
---

Every patient intake at a pediatric therapy clinic begins in Salesforce. Name, date of birth, insurance details, parent or guardian contacts, presenting concerns, case notes — all of it captured in the CRM at the moment of referral.

Then a staff member opens the EMR, finds the same blank form, and types it all again.

No copy-paste. No shortcut. No integration. Two systems that should talk to each other, with a human in the middle doing the translation. Every day, for every patient.

## The constraint nobody tells you about

The EMR vendor — Fusion Web Clinic — provides no public API. No webhooks, no export endpoints, no integration layer of any kind. The only interface to the system is the web application itself: the same portal a clinician clicks through to record session notes.

This is more common than it should be. Healthcare software vendors optimise for compliance and clinical workflow, not for developer experience. The result is a category of otherwise functional software that is, from an integration standpoint, completely opaque.

The standard playbook for Salesforce integrations doesn't apply here. Zapier and Make require a connector or API on both sides. MuleSoft needs REST or SOAP endpoints. Heroku Connect syncs to Postgres — useful for database-level integration, not for writing into a third-party web portal. The only thing Fusion exposes is a login page.

## The pattern: a queue-backed browser robot

When a third-party system has no API, a headless browser is a legitimate integration layer.

This isn't a workaround or a hack. It's a deliberate architectural choice for a constrained environment. The browser *is* the API. Puppeteer can drive form fills, dropdown selections, button clicks, and navigation — anything a human can do, programmatically and at scale.

The architecture we built on Heroku:

- **Web process** — Express server handling the Salesforce OAuth 2.0 flow. Stores access and refresh tokens in Redis. Exposes a health check endpoint.
- **Worker process** — Throng-clustered RabbitMQ consumer (via CloudAMQP). Dequeues sync jobs triggered by Salesforce Apex. Calls the sync processor, then callbacks to Salesforce with the resulting Fusion patient ID.
- **Sync processor** — Launches headless Chrome via Puppeteer. Logs into the Fusion portal. Creates or updates the patient record. Returns the Fusion patient ID on success, or an error message on failure.

Heroku's two-process Procfile model (`web` and `worker`) maps cleanly onto this separation. The Google Chrome buildpack makes Chrome available on the dyno without custom Docker images. Redis mini and CloudAMQP provide the supporting infrastructure as add-ons. Papertrail aggregates logs across both processes.

## How a sync works

When a patient record is created or updated in Salesforce, an Apex trigger pushes a job message onto the RabbitMQ queue. The worker dequeues it and hands it to the sync processor.

The sync processor:

1. Launches a headless Chrome instance via Puppeteer
2. Logs into the Fusion portal with stored credentials
3. Checks whether the payload includes a `fusion_web_id` — if so, searches for the existing patient to update; if not, creates a new record
4. Fills in: patient info (name, DOB, SSN, gender, location), primary contact (parent/guardian name, address, phone, email), insurance coverage (type and ID number), and case notes
5. Returns the Fusion patient ID

The worker then calls back to a Salesforce Apex REST endpoint — `/updateSyncRequest/` — with the result. If the sync succeeded, Salesforce records the Fusion patient ID. If it failed, Salesforce records the error. Either way, the Salesforce record reflects the actual state of the sync rather than going silently stale.

## Three decisions that kept this production-stable

**Why a queue, not a direct call.** A synchronous Salesforce → Heroku → Fusion call chain would have worked until it didn't. Network latency, Fusion session timeouts, and concurrent intake volume would all create failure modes with no retry mechanism. The queue decouples the Salesforce trigger event from the sync execution. Jobs survive restarts. Consumers can be scaled horizontally. Failed jobs can be requeued without data loss.

**Why Puppeteer over lighter scraping tools.** Fusion Web Clinic is a JavaScript-heavy single-page application. DOM interaction — clicks, form fills, dropdown selections, waiting for network requests to settle — requires a full browser runtime. Axios with Cheerio won't work when the page is rendered client-side and interactable only through event-driven JS.

**Why Heroku.** The Google Chrome buildpack solves the hardest infrastructure problem in the stack: getting Chrome onto a server without managing Docker images or buildpacks yourself. The add-on ecosystem (Redis, CloudAMQP, Papertrail) eliminates infrastructure overhead entirely. The two-dyno Procfile model provides clean process separation. The total infrastructure setup was a `git push`.

## Edge cases that mattered

**Lock screen re-authentication.** Fusion's idle timeout shows a password dialog overlaying the current page. The worker detects this state and re-enters credentials before continuing the sync operation.

**Idempotent field writes.** Before writing any field, the processor reads the current value and skips the write if it hasn't changed. This prevents unnecessary mutations and reduces the risk of race conditions when the same patient is updated multiple times in quick succession.

**Error callbacks.** If the sync fails at any point, the worker catches the exception and calls back to Salesforce with `fusionWebId: null, error: <message>`. Staff can see exactly which records failed and why, rather than discovering discrepancies during a clinical session.

## The outcome

Zero manual re-entry. Staff time returned to patient care. The sync runs 24/7 without supervision, handles both new patient creation and updates to existing records, and writes the Fusion patient ID back to Salesforce so both systems stay linked. No transcription errors in patient records.

The integration pattern — Salesforce Apex → RabbitMQ → Heroku worker → Puppeteer → no-API portal — is reusable anywhere you need to bridge a Salesforce CRM to a vendor system that offers no programmatic interface.

---

We built this integration for a healthcare client using Heroku as the middleware layer. [See the full case study](/case-studies/salesforce-emr-sync), or [get in touch](/contact) if you're facing a similar problem.
