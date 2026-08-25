---
title: "MuleSoft Integration"
shortTitle: "MuleSoft"
order: 3
icon: "🔗"
excerpt: "API-led connectivity on Anypoint Platform — one reusable API layer between Salesforce, ERP and everything else, instead of point-to-point links nobody can map."
---

## MuleSoft Integration

Point-to-point integrations are cheap to build and expensive to own. Every system you add multiplies the connections, and after the third one nobody can say what breaks when a single endpoint goes down. API-led connectivity puts three named layers between your systems, so a change lands in one place instead of six.

---

### The Three Layers

We design, build and document all three, so your team can add the fourth API without calling us.

| Layer | What lives there | Why it is separate |
|---|---|---|
| System APIs | One per source of record — Salesforce, ERP, HCM | Nothing business-specific, so they outlive the processes on top of them |
| Process APIs | Order-to-cash, lead-to-quote, the business logic | Composed from the system layer rather than wired to it |
| Experience APIs | Shaped per consumer — mobile app, partner portal, the org | A consumer's needs change without touching the system below |

---

### The Connection Audit

Every engagement opens with one, and it is usually the first honest map anyone has had:

- **Every system** — including the ones that only exist in a spreadsheet somebody maintains
- **Every existing integration** — middleware, scheduled jobs, hand-written Apex callouts, and the nightly CSV
- **What each one actually moves** — objects, volume, direction, and how fresh it has to be
- **What breaks when it stops** — the dependency nobody documented

---

### Salesforce-Specific Patterns

- **Platform Events** — publish-subscribe between the org and Anypoint, so integrations stop polling
- **Change Data Capture** — the org tells the integration layer what changed, rather than being asked
- **Bulk API 2.0** — for volume, with governor limits respected by design rather than discovered
- **External Objects** — reading a system of record without copying it into Salesforce at all

---

### Operations and Handover

An integration layer nobody can operate is a liability, so the last phase is the one that makes it yours:

- **Exchange portal** — every API published with its spec and worked examples
- **API policies** — rate limiting, client ID enforcement, and OAuth applied at the gateway
- **Anypoint Monitoring** — dashboards and alerts per API, plus dead-letter queues for what fails
- **Runbook** — how it deploys, what fails first, and what to check at 2am

You keep the Anypoint repository, the API specifications, the policies, the dashboards and the runbook.
