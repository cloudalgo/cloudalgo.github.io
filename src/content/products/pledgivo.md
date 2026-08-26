---
title: "Pledgivo"
status: preview
type: salesforce-app
tagline: "Fundraising that never leaves Salesforce. Donations, recurring giving, campaigns and ticketed events all run inside your org — no external platform, no sync job, no second permission model."
excerpt: "A native AppExchange package for fundraising: the form, the payment and the donor record live in your org, so a gift is an Opportunity the instant it is taken."
icon: "pledgivo"
externalUrl: "https://pledgivo.cloudalgo.com/"
guideUrl: "https://pledgivo.cloudalgo.com/getting-started/installation/"
seoTitle: "Pledgivo — Native Salesforce Fundraising & Donations"
order: 3
lastUpdated: "August 2026"
features:
  - icon: "objects"
    title: "Standard Objects, Not a Shadow Schema"
    description: "A confirmed gift is a standard Opportunity. A fundraising ask is a standard Campaign. A donor is a Contact or a Person Account. Every report, list view, flow and sharing rule you already have keeps working — there is no translation layer to maintain."
  - icon: "stripe"
    title: "Donations & Payments"
    description: "A public, guest-accessible donation form backed by Stripe's Payment Element — cards and card-backed wallets, one-time or recurring. Stripe.js collects the card in an iframe served by Stripe and tokenizes it in the browser, so no card number ever reaches Apex."
  - icon: "refresh"
    title: "Recurring Giving Salesforce Owns"
    description: "The billing schedule lives on a Recurring_Donation__c record rather than in Stripe Subscriptions. A nightly job charges the saved card off-session, and failed payments run the dunning sequence you configure — retry count, retry interval, grace period, donor emails — before the gift is cancelled."
  - icon: "campaign"
    title: "Campaigns You Compose"
    description: "Every ask starts from the standard Campaign object, themed with a reusable page design and built from movable content and field blocks. Fund designations, custom questions, FAQs and campaign updates hang off the campaign as related records — no page-builder platform bolted on the side."
  - icon: "clock"
    title: "Events & Ticketing"
    description: "Ticket tiers, seat capacity and named guests, running through the same donation pipeline as every other gift. A ticketed event is a Campaign with ticket types on it, so event revenue lands in the same reports as the rest of your fundraising."
  - icon: "portal"
    title: "A Donor Portal With No Passwords"
    description: "Donors ask for a link and the token in that emailed link is the credential — no sign-up, no password reset queue, and links expire on a window you set. From there donors change, pause, skip or cancel a recurring gift, update a card, reprint tickets and download annual tax statements."
  - icon: "compare"
    title: "Several Stripe Accounts, One Org"
    description: "Route each campaign to exactly one Stripe account — a second entity, a fiscal sponsee, a restricted programme. Every account keeps its own credentials, and its Test or Live badge is read from the publishable key rather than picked from a menu."
  - icon: "audit"
    title: "It Tells You What Went Wrong"
    description: "A Diagnostic Logs tab inside the app shows what the package recorded about its own behaviour — filtered by level, context and date, with stack traces on demand. A health check grades the org's configuration, and a nightly job deletes anything past the retention window you set."
techStack:
  - label: "Package type"
    value: "2GP managed package · namespace pledgivo"
  - label: "API version"
    value: "67.0"
  - label: "Donor-facing pages"
    value: "Enhanced LWR Experience Cloud site · LWC only"
  - label: "Payments"
    value: "Stripe Payment Element · browser-side tokenization"
  - label: "Payment confirmation"
    value: "Guest-side poll + scheduled reconciliation — no inbound webhook"
  - label: "Donation record"
    value: "Standard Opportunity, with Donation_Staging__c holding pre-confirmation state"
  - label: "Recurring engine"
    value: "Recurring_Donation__c + nightly RecurringDonationScheduler"
  - label: "Scheduled jobs"
    value: "24, installed and started by the post-install handler"
  - label: "Secrets"
    value: "Named Credential only — never a custom field, never in code"
  - label: "Testing"
    value: "90% Apex coverage, gated on every change"
pricing:
  - tier: "Free — up to 200 donations a year"
    price: "$0"
  - tier: "Pledgivo — unlimited donations"
    price: "$299/mo · $2,990/yr"
  - tier: "Cut of what you raise"
    price: "None"
  - tier: "Per-user licences"
    price: "None — priced per org"
video:
  src: "https://pledgivo.cloudalgo.com/assets/video/pledgivo-social-overview.mp4"
  poster: "https://pledgivo.cloudalgo.com/assets/video/pledgivo-social-overview-poster.png"
  title: "The feature tour — every Pledgivo capability, one at a time."
  duration: "2 min 54 sec"
  heading: "The feature tour"
requirements:
  - need: "Salesforce Enterprise, Unlimited, Performance or Developer Edition"
  - need: "A Stripe account, which you can connect after installing"
  - need: "API version 67.0 or later"
  - need: "An Experience Cloud licence, only to take donations from the public"
    optional: true
  - need: "No Nonprofit Success Pack needed — it is detected at runtime, never required"
    optional: true
published: true
---

Pledgivo installs into your Salesforce org and stays there. There is no hosted platform behind it, no connector to license, and no copy of your donor data anywhere else.

**How a gift travels.** A donor gives on your Experience Cloud site, where Stripe.js tokenizes the card in the browser. Salesforce then asks Stripe what happened — a guest-side poll right after the redirect, and a scheduled reconciliation pass as backup — rather than waiting on an inbound webhook you would have to expose and secure. What lands is an `Opportunity`, a donor `Contact` or Person Account, and a receipt, reportable with standard Salesforce reports immediately.

**Standard objects used:** `Opportunity` · `Campaign` · `Contact` · `Account`. Package objects carry the rest — `Recurring_Donation__c` for billing schedules, `Payment_Account__c` for each connected Stripe account, `Campaign_Design__c` for page themes, `Designation__c` for funds.

**Works with or without NPSP.** The package detects the Nonprofit Success Pack at runtime and behaves identically when it is absent. Nothing to install first, and no separate dependency.

**Works with or without Person Accounts.** Every donor-facing object carries two lookups — one for `Contact`, one for Person Account — so there is no org model to declare and no org-specific build to choose between.

**Free until you are busy.** The free plan is the whole product for up to 200 donations a year: every feature, no credit card, no expiry date. Past 200 it is a flat $299 a month, priced per org rather than per user, and never a percentage of what you raise.
