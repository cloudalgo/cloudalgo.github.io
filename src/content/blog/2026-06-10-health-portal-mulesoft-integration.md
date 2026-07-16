---
title: "Connecting a Health Portal, Salesforce, and a Logistics Platform with MuleSoft"
date: 2026-06-10
category: MuleSoft
excerpt: "How we built an eight-application MuleSoft integration layer for a digital health company — connecting a customer portal, Salesforce CRM, and a logistics platform with bidirectional case management and automated kit tracking every 5 minutes."
readTime: 7
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
relatedCaseStudy: health-portal-mulesoft-integration
---

A digital health company ships diagnostic test kits to patients at home. Blood draws, telehealth appointments, cancellations, reschedules — all of it flows through a customer portal that their members use to manage their health journey.

Behind the scenes, three separate systems run the operation. The portal handles member journeys and orders. Salesforce manages support cases and customer accounts. A logistics platform handles kit fulfilment and shipment.

None of these systems talked to each other.

Staff creating a new member account would register the patient in the portal, then open Salesforce and enter the same information again. When a Salesforce agent flagged a case — "this member needs a new kit" or "reschedule the blood draw" — someone had to re-enter that request in the portal. Kit tracking data lived only in the logistics dashboard. Customers asking "where's my test kit?" got no answer from the portal they were already logged into.

We built the integration layer to fix this.

## Why native connectors weren't enough

Salesforce has a marketplace full of integration apps. MuleSoft has hundreds of connectors. Neither helps when the systems you're connecting are a proprietary health portal, a third-party logistics API with custom auth, and a Salesforce org with custom objects your business designed from scratch.

The portal uses API key authentication (X-Client-ID / X-Client-Secret headers). It exposes resources — journeys, orders, cases, member registrations — that don't map to any off-the-shelf connector's data model. The logistics platform uses Bearer token auth and returns structured shipment data with fields like `kit_ids`, `tracking_status`, `carrier_code`, and `service_code`. The Salesforce org has custom Person Account fields (`Portal_ID__c`, `Journey_ID__c`, `Integration_Timestamp__c`), a "Member" RecordType, and four custom boolean case flags that drive the integration logic.

The integration _is_ the custom mapping. There's no shortcut.

## The architecture: three tiers, eight applications

The integration follows MuleSoft's API-led connectivity pattern, split across three tiers:

**System APIs** — one per external system, each wrapping authentication, serialisation, and basic CRUD behind a stable interface:
- `dh-salesforce-sapi` — Salesforce connector with SOQL, upsert, and lookup resolution
- `dh-portal-sapi` — health portal API with X-Client-ID auth
- `dl-slp-sapi` — logistics platform API with Bearer token auth

**Process APIs** — four orchestration applications that implement business flows without talking to external systems directly:
- `dh-customer-papi` — member registration
- `dh-journey-sync-papi` — portal journey sync to Salesforce
- `dh-case-sync-papi` — Salesforce case flags sync to portal
- `dh-order-to-shipment-papi` — order fulfilment

**Batch application** — one scheduled job:
- `dh-order-status-sync-batch` — kit tracking sync, runs every 5 minutes

## The five flows

**1. Customer registration**

When a member registers on the portal, MuleSoft creates a Salesforce Person Account under the "Member" RecordType. First name, last name, email, phone, gender, subscription ID, start date, and `Portal_ID__c` (as the external ID linking the two systems) are all mapped and written. If the registration includes a journey ID, a linked Case is created simultaneously with `Journey_ID__c` as its external identifier. Both Salesforce record IDs come back in the response.

**2. Journey sync (scheduled)**

A scheduler polls the portal for pending journeys, queries Salesforce for existing Member Accounts by `Portal_ID__c`, and upserts both Accounts and Cases in bulk. Before the upsert, the sync queries the Salesforce RecordType ID for "Member" and filters the payload to only records of that type — preventing accidental creation of wrong-type Account records if a `Portal_ID__c` appears on a non-Member account. After each batch, portal IDs are zipped with Salesforce Account IDs to keep the cross-system map current.

**3. Case sync (watermark-based)**

Salesforce support agents flag cases using four boolean fields: `New_Kit_Requested__c`, `New_Blood_Draw_Requested__c`, `Cancellation_Requested__c`, `New_Telehealth_Requested__c`. The case sync scheduler polls for cases where `Integration_Timestamp__c` exceeds the stored watermark (held in Anypoint Object Store), transforms each flagged case into a request type string ("new_kit", "reschedule_blood_draw", "cancellation", "follow_up"), and sends a bulk PATCH to the portal's journeys endpoint — up to 100 requests per batch. After a successful run, the watermark advances.

**4. Kit fulfilment**

When a portal order is created, MuleSoft POSTs it to the logistics platform, creating the outbound shipment record. The process API handles the auth token lifecycle and payload mapping between the portal's order schema and the logistics API's expected format.

**5. Order status sync (every 5 minutes)**

A scheduled batch fetches pending orders from the portal, queries the logistics platform for each order's current status and full shipment detail — tracking number, carrier code, service code, estimated delivery date, delivery timestamp, kit IDs — and PATCHes the order back to the portal. If an order has a status update but no shipments yet, the status is applied without shipment fields; once shipments exist, the full logistics picture is included. Members see tracking data in the portal within one polling cycle of it becoming available in the logistics platform.

## Three technical decisions worth explaining

**Why Integration_Timestamp__c instead of LastModifiedDate for the watermark.**

The original case sync used `LastModifiedDate` to determine which cases to process. It caused false re-triggers: any update to a case — a comment added, a field changed by another system, a manual edit in Salesforce — would reset `LastModifiedDate` and cause the integration to re-process the case as if it hadn't been synced yet.

Version 1.1.0 introduced `Integration_Timestamp__c`, a custom datetime field that the integration itself updates after processing a case. Nothing else touches it. The watermark query now reads only cases where `Integration_Timestamp__c` is after the last-run timestamp — which means only cases the integration hasn't processed yet, not cases that had any change. The false re-triggers stopped.

**Why RecordType filtering before Person Account upserts.**

Person Accounts in Salesforce are unusual — they're a hybrid Account/Contact record with a specific RecordType. An upsert keyed on `Portal_ID__c` could, without filtering, create Account records of the wrong type if a `Portal_ID__c` value happened to exist on a non-Member account. Before the bulk upsert, the journey sync queries the Salesforce RecordType ID for "Member" accounts and filters the incoming payload to only records that should be Member-type. Records outside that set are excluded before they reach the upsert. Wrong-type Account creation isn't a recoverable error; it's much better to filter before writing.

**Why lookup resolution belongs in the System API.**

Process APIs need to upsert records that have relational fields — Cases linked to Accounts, for example. The natural approach would be to have each process API resolve parent record IDs with its own SOQL query before calling the SAPI. But that scatters Salesforce-specific query logic across multiple applications and means every process API needs to understand Salesforce's ID model.

The Salesforce SAPI instead includes a generic lookup resolution layer: payload fields that carry a `lookupTable` and `lookupField` property are detected before upsert, the SAPI runs the resolution query, and the parent record ID is substituted into the payload before writing. Process APIs pass field values; the SAPI resolves the relationship. Every process API stays free of Salesforce query logic, and the SAPI can handle new relational fields without changing the process layer.

## The outcome

Three systems, previously managed manually across dashboards and spreadsheets, now stay in sync continuously. Every portal registration creates the Salesforce record. Every Salesforce case flag reaches the portal without a human intermediary. Kit status, tracking number, carrier, and estimated delivery date are visible in the portal within 5 minutes of appearing in the logistics platform.

Eight MuleSoft applications. Zero manual handoffs.

---

We built this integration for a digital health client using MuleSoft Anypoint Platform on CloudHub. [See the full case study](/case-studies/health-portal-mulesoft-integration), or [get in touch](/contact) if you're connecting a custom health or logistics platform to Salesforce.
