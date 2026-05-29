---
title: "Pledgivo"
status: preview
type: salesforce-app
tagline: "Native Salesforce fundraising for nonprofits — campaigns, donations, and donor engagement without leaving your CRM."
excerpt: "Pledgivo is a 2GP managed package (namespace: pledgivo) that runs entirely inside your Salesforce org. Donations become Opportunity records. Campaigns stay on the standard Campaign object. No external platform, no data sync, no second subscription."
icon: "pledgivo"
seoTitle: "Pledgivo — Native Salesforce Fundraising App for Nonprofits | CloudAlgo"
order: 2
features:
  - icon: "objects"
    title: "Built on Standard Objects"
    description: "Opportunity = donation (3 record types: Donation, Grant, Pledge). Campaign = fundraising campaign (Open Donation and Crowdfunding record types). Contact or Account = donor. Every native Salesforce report, list view, flow, and automation works without any translation layer."
  - icon: "campaign"
    title: "Four Campaign Types"
    description: "Open Donation (simple donate page), Crowdfunding (goal thermometer + public progress), Peer-to-Peer (supporters create personal fundraising pages linked to a parent campaign), and Event (ticket sales via Product2, PricebookEntry, and OpportunityLineItem)."
  - icon: "portal"
    title: "Experience Cloud Donor Portal"
    description: "An Enhanced LWR site (Spring '26) with an 8-component LWC donation form. Donors see real-time campaign progress, download PDF receipts, and manage recurring gifts — all on your Salesforce domain."
  - icon: "stripe"
    title: "Stripe Payments — PCI by Design"
    description: "Stripe.js tokenizes card data in the donor's browser — card numbers never reach Salesforce or your servers. Secret key lives exclusively in a Named Credential. One-time and monthly recurring donations in v1.0; ACH in v1.5."
techStack:
  - label: "Package type"
    value: "2GP Managed Package · namespace pledgivo"
  - label: "Apex architecture"
    value: "FFLib — Domain / Selector / Service / Unit of Work"
  - label: "Donor portal"
    value: "Enhanced LWR · LWC only · Experience Cloud Spring '26"
  - label: "Payments"
    value: "Stripe API + Stripe.js (PCI via browser tokenization)"
  - label: "CI/CD"
    value: "GitHub Actions + JWT bearer flow"
  - label: "API version"
    value: "62.0 (Spring '26)"
  - label: "Secrets"
    value: "Named Credentials only — never stored in custom fields"
  - label: "Testing"
    value: "fflib-apex-mocks · TestDataFactory · 90%+ coverage enforced"
roadmap:
  - version: "v1.0"
    theme: "Collect"
    description: "All 4 campaign types, Stripe card + recurring donations, Experience Cloud donor portal, NPSP and Person Account support"
  - version: "v1.5"
    theme: "Engage"
    description: "ACH payments, weekly recurring frequency, monthly upsell prompt in receipt email, social proof donor feed"
  - version: "v2.0"
    theme: "Analyze"
    description: "Einstein Analytics pack, public REST API for third-party integrations, partner integration program"
requirements:
  - "Salesforce Enterprise or Unlimited Edition"
  - "Experience Cloud license (Enhanced LWR for donor-facing portal)"
  - "Stripe account for payment processing"
  - "API version 62.0 (Spring '26) or later"
published: true
---

Pledgivo is a 2GP managed package (namespace: `pledgivo`) that runs entirely inside your Salesforce org. Donations become `Opportunity` records. Campaigns stay on the standard `Campaign` object. Donors are `Contact` or `Account` records — the same objects your team already uses in your CRM.

**Standard objects used:** `Opportunity` · `Campaign` · `Contact` · `Account` · `Product2` · `PricebookEntry` · `OpportunityLineItem`

**Works with or without NPSP.** Pledgivo detects NPSP at runtime via `Schema.describeSObjects()`. When present, recurring donations automatically map to `npe03__Recurring_Donation__c` and fund allocations map to General Accounting Units — zero configuration required.

**Works with or without Person Account.** `DonorResolutionService` detects your org model at runtime. Standard orgs use the `Contact` lookup; Person Account orgs use the `Account` lookup. No branching, no org-specific deployment packages needed.
