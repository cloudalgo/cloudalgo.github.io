---
title: "Connecting Salesforce and NetSuite with MuleSoft: Four Flows, Zero Manual Re-entry"
date: 2026-06-10
category: MuleSoft
excerpt: "How we built a bidirectional Salesforce ↔ NetSuite integration using MuleSoft API-led connectivity — Platform Events for real-time orders and customers, watermark-based scheduled sync for invoices and refunds, and SOAP/XML for complex Sales Order operations."
readTime: 7
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
relatedCaseStudy: salesforce-netsuite-sync
---

Every wholesale distributor has a version of the same problem.

Sales team lives in Salesforce. Operations and finance live in NetSuite. A deal closes, a Salesforce Order is created, and then someone — a person, with a keyboard — opens NetSuite and types it again. Line items, quantities, unit prices, discounts, shipping addresses, PO numbers. Everything that was already in Salesforce, re-entered field by field.

In parallel, invoices are being generated in NetSuite that the sales team can't see without a separate login. Customers are being updated in Salesforce that aren't reflected in NetSuite until someone notices a discrepancy. Payments are being posted to NetSuite that no one in sales knows about.

This isn't a data problem. It's a coordination problem. And it has a straightforward solution — if you build it correctly.

## Why native connectors weren't enough

NetSuite and Salesforce both have marketplace integrations and native connector apps. The SuiteApp for Salesforce will sync a standard set of objects out of the box. For many companies, that's sufficient.

For this client, it wasn't.

The requirements included custom Platform Events (`AccountsEvent__e`, `Create_NS_Order__e`, `Payment_and_Refund_Event__e`), custom financial objects, bidirectional ID writeback, watermark-based incremental polling for invoices and refunds, and per-flow error email notifications with failed record details. The native connector doesn't touch any of those. It maps standard objects and calls it done.

We needed a proper integration layer. We chose MuleSoft.

## The architecture: three applications, four flows

The integration follows MuleSoft's API-led connectivity pattern — not because it's a best practice worth following mechanically, but because it solves a real problem: when requirements change, you want to change one thing, not everything.

Three applications:

- **Salesforce System API** (`sfdc-sapi`) — Subscribes to Salesforce Platform Events and handles real-time flows to NetSuite. Also receives callbacks from NetSuite (ship confirms, order updates) and writes NetSuite IDs back to Salesforce records.
- **NetSuite System API** (`netsuite-sapi`) — Wraps all NetSuite create and update operations behind a clean API contract. SOAP/XML for Sales Orders, REST for customers.
- **Orchestration application** (`sf-ns-sync`) — Schedules 15-minute incremental syncs for invoices and refunds from NetSuite to Salesforce. Subscribes to payment Platform Events for near-real-time financial data.

The four flows those applications power:

**1. Customer sync (Salesforce → NetSuite, real-time)**  
When a Salesforce Account is created or updated, an `AccountsEvent__e` Platform Event fires. MuleSoft transforms the Account fields — company name, payment terms, credit limit, tax ID/VAT, DUNS number, shipping carrier, parent account — into a NetSuite Customer record. If the customer is new in NetSuite, the resulting NetSuite Customer ID is written back to the Salesforce Account.

**2. Order sync (Salesforce → NetSuite, real-time)**  
When a Salesforce Order moves to fulfilment, a `Create_NS_Order__e` Platform Event carries the order payload to MuleSoft. The Salesforce SAPI queries the Order Items (product SKUs, quantities, unit prices, discounts, expected ship dates, quote line IDs) and transforms them into a NetSuite Sales Order. The resulting NetSuite Order Number is written back to Salesforce asynchronously.

**3. Invoice and refund sync (NetSuite → Salesforce, scheduled)**  
Two schedulers run every 15 minutes — staggered by 7 minutes to avoid resource contention. Each fetches records from NetSuite modified since the last run, using a timestamp watermark stored in Anypoint Object Store. Records arrive in paginated batches of 50 and are posted to the Salesforce SAPI for upsert. Failed records trigger a structured HTML error email.

**4. Payment sync (Salesforce → NetSuite, event-driven)**  
When a payment is recorded in Salesforce, an `Payment_and_Refund_Event__e` Platform Event carries the payment amount, NetSuite Account number, and NetSuite Invoice ID. MuleSoft posts the payment to NetSuite via REST, applying it against the specific invoice — keeping accounts receivable in sync without manual journal entries.

## Why real-time for orders but scheduled for invoices?

The pattern mismatch is intentional.

Orders need to reach NetSuite before the fulfilment team leaves for the day. A 15-minute delay between a deal closing in Salesforce at 4:55pm and an order landing in NetSuite is operationally unacceptable. Platform Events solve this — the order is in NetSuite within seconds of the Salesforce trigger.

Invoices don't have the same urgency. They're generated in NetSuite after fulfilment; the sales team checking invoice status can wait 15 minutes. More importantly, pulling NetSuite transactional data reliably in batch is easier than expecting the ERP to produce real-time event triggers for every financial record. Scheduled polling fits the data type.

Applying the same pattern to both flows would mean either polling NetSuite every 15 seconds for orders (wasteful and brittle) or running invoice sync on Platform Events (which NetSuite doesn't natively produce). Match the pattern to the data.

## Three technical decisions worth explaining

**Why SOAP for Sales Orders.**  
NetSuite's SOAP WebServices API and its REST API aren't feature-equivalent. Complex transactional objects like Sales Orders — with conditional field inclusion, nested item lists, billing and shipping address structures, and custom field mappings — are more reliably handled via SOAP. DataWeave generates the XML structure using NetSuite's `urn:messages.platform.webservices.netsuite.com` namespaces, with conditional guards to prevent empty nodes from failing validation. The REST path was evaluated and ruled out for this object type.

**Why watermarks, not full-table polling.**  
The naive approach to scheduled sync is to fetch all records on every run. That approach hits API limits, creates duplicate records when runs overlap, and grows slower as data volume increases. We store the last-run timestamp in Anypoint Object Store, subtract a two-minute buffer for clock skew, and pass it as `lastModifiedDate` to the NetSuite query. Each run fetches only what changed. The watermark is configurable: a reset flag in the config file lets you replay from a specific date without touching code.

**Why bidirectional ID writeback.**  
Every flow that creates a record in one system writes the resulting ID back to the other. NetSuite Customer IDs and Order Numbers are written to Salesforce Account and Order fields. Salesforce Account and Order Line IDs are embedded in the NetSuite payload as custom fields. This mutual reference pattern makes the integration idempotent: before deciding whether to create or update, each flow checks whether a cross-system ID already exists on the Salesforce record. Without it, every re-run risks creating duplicates.

## Platform Events as the integration bus

One architectural detail worth noting: all the real-time Salesforce → NetSuite flows are triggered by Platform Events, not by direct Apex callouts to MuleSoft.

The difference matters. A synchronous Apex callout to MuleSoft would block the Salesforce transaction until MuleSoft responds — which blocks until NetSuite responds. If NetSuite is slow, Salesforce is slow. If NetSuite times out, the Salesforce transaction fails.

With Platform Events, Salesforce publishes and moves on. MuleSoft subscribes and processes asynchronously. NetSuite delays don't propagate back to Salesforce. The integration can be deployed, restarted, or updated without touching Salesforce Apex. Platform Events provide built-in replay and delivery guarantees that a synchronous callout simply doesn't have.

## The outcome

Zero manual order re-entry. Invoices sync to Salesforce every 15 minutes. Payments post to NetSuite in near real-time. Customer accounts stay consistent across both systems without anyone watching.

The integration handles both new record creation and updates to existing records, with bidirectional ID writeback ensuring every future operation targets the right record in each system.

---

We built this integration for a specialty wholesale distributor using MuleSoft Anypoint Platform on CloudHub. [See the full case study](/case-studies/salesforce-netsuite-sync), or [get in touch](/contact) if you're connecting Salesforce to NetSuite — or any other ERP.
