---
title: "Heroku Connect at Scale: What Goes Wrong and How to Fix It"
date: 2026-05-29
category: Heroku
excerpt: "Heroku Connect is easy to misconfigure in ways that only surface at volume. Here are the failure modes we see most often and how to address them."
readTime: 4
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
image: /blog-images/heroku-connect-at-scale-hero.svg
---

Heroku Connect is one of the most useful tools in the Salesforce ecosystem — and one of the easiest to misconfigure in ways that do not show up until you are processing real data at real volume.

We have worked with several teams who came to us after their sync had silently drifted out of alignment, was dropping records, or was consuming governor limits at a rate that was affecting everything else in the org. Here is what we have seen go wrong and how to address it.

## Missing External IDs

The most common mistake is not setting up an External ID field on objects that need one. Heroku Connect uses External IDs to handle upserts correctly. Without them, repeated syncs can create duplicate records in Salesforce rather than updating existing ones.

The fix is straightforward — create an External ID field on each object you are syncing, set it as the merge key in Heroku Connect, and re-poll from a clean state. But if you have been syncing without one for months, you will need to deduplicate first. On a large object that can take time, and it needs to happen during a maintenance window.

## Cross-object formula fields and roll-up summaries

Heroku Connect syncs field values, not formula results. If you are mapping a cross-object formula field or a roll-up summary, you will get the cached value at sync time, which may already be stale. More importantly, writes to these fields from the Postgres side are ignored by Salesforce — they are read-only.

If your integration logic depends on these fields having current values, you need to rethink the data model. Either sync the source fields and compute locally in Postgres, or trigger a Salesforce automation to push the calculated value into a standard writable field that Connect can reliably sync.

## Governor limits under high write volume

Heroku Connect batches DML operations, but each batch still consumes Salesforce API calls and triggers any active flows or triggers on the objects being synced. On orgs with active automation, high-volume syncs can consume a significant share of the daily API limit or cause trigger-related errors that Connect surfaces as sync failures.

The usual causes: a flow that fires on every update to a commonly-synced field, or a trigger doing a callout that fails under bulk conditions. We audit the automation on every object in the sync as part of any Connect engagement — things that work fine at low volume become problems fast when you are syncing 50,000 records per hour.

## Sync lag under load

Heroku Connect uses polling intervals to detect changes in Salesforce. Under high load, or when polling too many objects, the effective sync lag grows. We have seen teams expecting near-real-time sync discover they are actually 15 to 20 minutes behind during peak hours.

The fix depends on the use case. If real-time sync is genuinely required, Platform Events are usually a better fit than Connect for those specific objects. Connect works well for data that can tolerate a polling delay — reporting feeds, background processing queues, analytics data.

## Schema drift

As Salesforce admins add or modify fields over time, the Heroku Connect field mapping can fall out of sync with what is in Postgres. This usually surfaces as silent data loss — the field exists in Salesforce but is not being pulled through.

A regular review of the Connect field mapping against the Salesforce object schema is worthwhile on any org with active development. We include this as part of managed services engagements where clients have Connect in production.

---

We work with teams on Heroku Connect setup, recovery, and ongoing maintenance. If your sync is not behaving the way it should, [see how we approach it](/services/salesforce-consulting/) or [get in touch](/contact/).
