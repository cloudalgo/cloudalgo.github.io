---
title: "Sojourn"
status: early-access
type: salesforce-app
tagline: "Lifecycle tracking for Salesforce. How long every record spent in each status and with each owner, in business hours, on any object."
excerpt: "A native Salesforce package that records how long every record spends in each status and with each owner, in business hours. One reportable row per stay."
icon: "sojourn"
externalUrl: "https://sojourn.cloudalgo.com/"
guideUrl: "https://sojourn.cloudalgo.com/docs/guide/install/"
seoTitle: "Sojourn — Time in Status Tracking for Salesforce"
order: 4
features:
  - icon: "clock"
    title: "Time in Every Status, on Any Object"
    description: "Picklist fields and Owner on Case, Lead, Opportunity and any custom object. Each tracked field is a record in Sojourn's setup, not a new column, so adding one changes nothing in your schema."
  - icon: "calendar"
    title: "Business Hours That Match Your Teams"
    description: "The org default, or business hours set per object, per field or per queue, so a night shift is measured against its own hours rather than the day desk's. Every row carries calendar time beside it."
  - icon: "flag"
    title: "Goals and Breaches"
    description: "Set a target in business hours for any status value. A stay that runs past it is flagged with the moment it breached, so a Flow can alert the right person while there is still time to act."
  - icon: "refresh"
    title: "Live Values"
    description: "Time in current status and time with current owner, refreshed every 15 minutes — for list views, escalation rules and the queue a manager watches."
  - icon: "timeline"
    title: "A Timeline on the Record Page"
    description: "The Sojourn Timeline component draws one lane per tracked field, so the answer to 'why did this one take so long?' is on the record itself, on record pages and Experience Cloud sites alike."
  - icon: "report"
    title: "Reports and Dashboards, Ready on Install"
    description: "Seven report types, twenty report templates and four dashboards — Desk Productivity, Process Bottlenecks, SLA Health and Leaderboards. Managers filter by owner, queue or status in any of them."
  - icon: "history"
    title: "Backfill, and History You Keep"
    description: "Intervals are rebuilt from the field history you already have, up to 18 months back, so the first report covers months rather than minutes. Nothing is deleted unless you choose to; the optional purge exports first and archives to a big object."
techStack:
  - label: "Package"
    value: "Native managed package · AppExchange listing after security review"
  - label: "Runs in"
    value: "Your Salesforce org — no callouts, Named Credentials, Connected Apps or third-party JavaScript"
  - label: "Data access"
    value: "User mode — WITH USER_MODE · AccessLevel.USER_MODE"
  - label: "Capture engine"
    value: "System context, writing only Sojourn's own objects"
  - label: "Setup"
    value: "Records, not metadata — no Metadata API, Tooling API or session IDs"
  - label: "Storage"
    value: "One interval record per stay, in your org · optional archive to Interval_Archive__b"
  - label: "Live values"
    value: "Refreshed every 15 minutes"
  - label: "Failure handling"
    value: "A failed capture never blocks the save; the error queues in Tracking_Error__c for repair"
  - label: "Testing"
    value: "90% Apex coverage per class · 200-record bulk tests · Code Analyzer v5, 0 Critical / 0 High"
pricing:
  - tier: "The package, every feature"
    price: "Published with the AppExchange listing"
  - tier: "Early access"
    price: "Open now"
  - tier: "Sojourn Omni-Channel extension"
    price: "Ask us"
  - tier: "Set up by CloudAlgo"
    price: "Contact us"
roadmap:
  - version: "Release 1"
    theme: "In development"
    state: in-build
    description: "Two of nine sprints done. Time in status and with owner on any object, business hours per org, object, field or queue, backfill, goals and breaches, live values, the record timeline, and twenty reports with four dashboards."
  - version: "Sprint 8"
    theme: "Security review"
    state: planned
    description: "The package goes to Salesforce for AppExchange security review in sprint 8. Until it clears, early-access customers install by package version ID, into a sandbox first."
  - version: "Listing"
    theme: "AppExchange"
    state: planned
    description: "The public listing, and the price with it, once the review is through. One package with no feature tiers."
requirements:
  - need: "Salesforce Enterprise, Unlimited, Performance or Developer Edition"
  - need: "Business hours defined in Setup — Sojourn uses the org default unless you set others"
  - need: "One record-triggered Flow per object beyond Case, Lead and Opportunity, copied from the template — about three minutes each"
    optional: true
  - need: "Existing field history, only to backfill past intervals"
    optional: true
  - need: "Omni-Channel and the Sojourn Omni-Channel extension, only to attribute time to the accepting agent"
    optional: true
published: true
---

Sojourn installs into your Salesforce org and measures what Field History never recorded: how long each value lasted, who held the record meanwhile, and how much of that time fell inside business hours.

**Where it is.** Release 1 is in development, two sprints of nine done, and early access is open. There is no AppExchange listing yet; early-access customers are given a package version ID and install it into a sandbox first.

**How a stay becomes a row.** When a tracked field changes, Sojourn closes the interval that was open and starts the next one. Each closed interval is a record carrying the value, the owner, when it was entered and left, its business minutes and calendar minutes, its goal, and when it breached, if it did. A case that went New, Working, Waiting on customer, Working is four rows you can group by owner, status or week in any standard report.

**What it does not do.** Sojourn measures duration; it does not replace Field History, which remains the audit log of who changed which field and when. It makes no external calls and deploys no metadata into your org, and every query runs with the reading user's object and field permissions.

**What it costs.** Release 1 ships every feature in one package, with no higher tier held back. The price is published with the AppExchange listing.
