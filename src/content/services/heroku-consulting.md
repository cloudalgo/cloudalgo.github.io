---
title: "Heroku Consulting"
shortTitle: "Heroku"
order: 2
icon: "🟪"
excerpt: "Heroku work for teams already on Salesforce — Heroku Connect at volume, Postgres as the scale tier, the workers Apex cannot run, and the migration question."
---

### The estate review

Every engagement opens with one, and it is the same review whether you are building the first app or inherited the fourth. What runs, what it costs, what it syncs, and which parts of it are one traffic spike away from a bad afternoon.

It ends with a written answer to the question everybody is now asking out loud: stay, invest, or plan the move. Sometimes the answer is stay — a well-behaved Heroku app is a cheap thing to own.

### Heroku Connect

The largest single source of Heroku work we see, and the one that fails quietly.

- **Mapping design** — external IDs chosen before the first sync, not after the duplicates appear
- **Volume behaviour** — Bulk API conditions, polling intervals and the write patterns that trip them
- **Formula and rollup fields** — which ones never sync, and what to do instead of waiting for them
- **Reload safety** — the tables a reload silently empties, and how the schema stops that being possible
- **Monitoring** — sync lag and error counts on a dashboard, so a stalled mapping is noticed before a user notices it

### Salesforce to Heroku, in the right pattern

There are three sane ways to connect the two sides and they fail differently. We pick per workload and write down why.

- **REST callouts** — named credentials, connected apps, OAuth 2.0, and a retry that does not double-post
- **Platform Events** — for when the org should publish and stop waiting for an answer
- **RabbitMQ** — Apex cannot speak AMQP, but it can POST to the HTTP API; the staging-record pattern makes the failures retryable
- **Heroku Connect** — when the honest answer is that you want the data in Postgres, not a message

### Apps, workers and the jobs Apex cannot run

Long-running work, headless browsers, PDF generation, third-party APIs with unfriendly rate limits — the things that would burn governor limits or API calls if you ran them inside the org.

- Web dynos and worker dynos, with the queue between them
- Scheduled jobs that report their own failure back to the Salesforce record
- **Postgres as the scale tier** — indexes, connection limits, and a bronze/silver/gold split when raw data should not touch the org
- Redis for caching and rate limiting, so you stop paying for the same call twice

### Running it, after we leave

- **Cost** — dyno sizing and add-on plans reviewed against what the app actually uses, once it has run for a month
- **Scale** — where the next bottleneck is, in writing, before you meet it
- **Incidents** — what breaks first, what to check, and which alert means wake someone up

### The migration question

In February 2026 Salesforce moved Heroku to a sustaining engineering model: security, stability and support, no new features, and no new enterprise contracts. Existing apps keep running, existing enterprise agreements keep renewing, and pay-as-you-go signups are still open.

That is not a reason to move tomorrow. It is a reason to know what moving would cost before someone asks you in a board meeting. Every estate review ends with that number and the shape of the work behind it — and if the answer is AWS, [06 — AWS cloud solutions](/services/aws-cloud-solutions/) is where that engagement lives.

We do not sell a migration to a client whose app is fine where it is.
