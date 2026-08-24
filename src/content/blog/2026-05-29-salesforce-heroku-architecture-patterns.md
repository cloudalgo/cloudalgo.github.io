---
title: "How to Architect Salesforce and Heroku Without Creating a Maintenance Nightmare"
date: 2026-05-29
category: Heroku
excerpt: "REST, Platform Events, or RabbitMQ — how to choose the right Salesforce-Heroku integration pattern based on team ownership, cost, and failure modes."
readTime: 4
published: true
author: "Sandeep Kumar"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

The integration between Salesforce and Heroku can be done several different ways, and the choice you make early tends to become load-bearing infrastructure later. We have inherited codebases built on every pattern described below, and the quality of the original decision usually shows.

Here is how we think about it.

## Three patterns, three different trade-offs

**REST API** is the default starting point for most teams. You build an endpoint on Heroku, call it from Salesforce via a Named Credential and an Apex callout, and handle the response. It is easy to reason about, straightforward to test, and works well for synchronous request-response interactions — looking up data, triggering a process and waiting for a result, passing a record to an external service.

The problem with REST shows up when you need to fire-and-forget at volume, or when the Heroku service has variable response time. Apex callout limits are per-transaction (100 callouts maximum) and have a hard timeout (120 seconds). If your integration hits these limits under load, you will see errors that are difficult to reproduce in a development environment.

**Platform Events** are a better fit for high-volume asynchronous communication. Salesforce publishes an event; Heroku subscribes via the Streaming API or CometD; Heroku processes it and optionally writes back. The decoupling is the point — Salesforce does not wait for Heroku to respond, and Heroku can process events at its own pace.

The operational cost is higher. You need to manage the subscription, handle reconnects, and deal with event replay windows (72 hours by default — events older than that are gone). If your Heroku process goes down during a high-volume period, catching up on replayed events requires careful design.

**RabbitMQ** (or another message broker) sits between the two. Salesforce publishes to a queue via a callout; Heroku consumes from the queue asynchronously. This gives you durable messaging — messages survive a Heroku restart — and lets you handle back-pressure by scaling consumers without touching Salesforce at all.

The trade-off: you are now running and operating a message broker. On Heroku that means a paid RabbitMQ add-on and the operational knowledge to maintain it. The complexity is worth it for workflows that need guaranteed delivery and cannot tolerate message loss. It is overkill for most standard integrations.

## How we choose

The question we ask first is not "which pattern is technically best?" It is "who on this team will own this integration in 18 months, and what will they be able to debug at 2am?"

A small team with no prior message-broker experience should default to REST with proper error handling and retry logic. It is boring infrastructure that any Salesforce developer can read and reason about. Adding Platform Events or a message broker introduces failure modes that are unfamiliar and harder to diagnose under pressure.

For teams with integration engineers who understand async patterns, Platform Events offer cleaner separation of concerns and scale better. For anything requiring guaranteed delivery in a regulated environment, a message broker is worth the overhead.

The mistake we see most often is teams choosing Platform Events or RabbitMQ because they feel like the "enterprise" choice, then struggling to maintain them because the team did not have the background for it. Simpler usually wins.

## What breaks first

With REST: callout timeouts under load, and Apex governor limit errors when a batch process fires many callouts in a single transaction. Both are recoverable, but only if you have retry logic built in from the start.

With Platform Events: replay edge cases and subscription drops during deployments. If your subscriber goes down and comes back up after the 72-hour window, you have lost events. Most teams discover this the first time they do a maintenance window and find a gap in their data.

With RabbitMQ: queue depth accumulation when consumers fall behind, and connection management across Heroku dyno restarts. Neither is hard to handle, but both require explicit attention during setup.

## A note on Heroku Connect

If your integration is primarily about keeping Salesforce records in sync with a Postgres database — as opposed to triggering processes or passing events — Heroku Connect is almost always the right choice over a custom REST or event-based integration. It handles the sync plumbing so you do not have to, and it is maintainable by a Salesforce admin without Heroku expertise.

Where it falls short: real-time requirements, non-standard objects, and high-frequency writes. For those cases, a custom integration pattern is warranted.

---

If you are designing a Salesforce-Heroku integration and want to talk through the architecture before you build it, we are happy to help. [Get in touch](/contact) or [see how we approach these projects](/services/salesforce-consulting).
