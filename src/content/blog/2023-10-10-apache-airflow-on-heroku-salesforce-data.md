---
title: "Running Apache Airflow on Heroku to Feed Clean Data into Salesforce"
date: 2023-10-10
category: Heroku
excerpt: "Airflow on Heroku, a bronze/silver/gold split in Postgres, and Heroku Connect pointed only at the gold tables. Why the layering is what keeps bad records out of Salesforce."
seoDescription: "Airflow on Heroku, a bronze/silver/gold split in Postgres, and Heroku Connect pointed only at the gold tables. Why the layering keeps bad records out."
readTime: 4
image: /blog-images/apache-airflow-on-heroku-salesforce-data-hero.svg
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
---

When data from half a dozen systems has to end up in Salesforce, the tempting shortcut is to sync it all in and clean it up afterwards. That falls apart fast. Bad records reach the people using them, every correction means another round of syncing, and nobody can tell which system a wrong value came from.

The alternative is to do the cleaning in Postgres first, in three distinct stages, and let Heroku Connect see only the finished result.

## Why run Airflow on Heroku specifically

Airflow gives you scheduled, dependency-aware pipelines. A step runs only once the step it depends on has succeeded, and a failure surfaces as a failed task you can inspect and retry — not as a silent gap in the data.

Running it on Heroku matters for one reason: if the data has to land in Salesforce, Heroku Connect is the shortest path there. Keeping Airflow on the same platform as the Postgres database Heroku Connect syncs from puts the pipeline and the sync target one `DATABASE_URL` apart. No cross-cloud networking to arrange, no egress charges for moving your own data between stages.

Budget for more than one dyno. Airflow needs the scheduler and the webserver running as separate process types, and workers on top of that if you move off the local executor.

## The three layers

This is the medallion pattern: bronze, silver, and gold tables that mark how far a record has been through validation. The value is not the naming — it is that each layer has exactly one job, so you always know where to look when a number is wrong.

**Bronze holds raw data, exactly as it arrived.** One table per source, no type coercion, no deduplication. Bronze is append-only and you never edit it. When a transformation turns out to be wrong six weeks later, bronze is what you replay from — and without it, the only way to recover is to go back to the source systems and hope they still have the history.

**Silver holds validated, conformed data.** Types cast properly, duplicates collapsed, IDs from different systems reconciled onto a common key, records that fail your checks quarantined rather than dropped. Most of the actual work lives here, and most of the bugs do too, which is why it is worth keeping separate from both neighbours.

**Gold holds what Salesforce will see.** Shaped to match the target objects — roughly one table per Salesforce object, columns named for the fields they map to. Nothing lands in gold until it has passed the silver checks.

## Mapping gold into Salesforce

Heroku Connect maps Postgres tables to Salesforce objects and keeps them in step. Point it at the gold tables and nothing else. The bronze and silver tables have no business being visible to Salesforce, and exposing them is how half-processed records end up in front of a sales team.

For any mapping that writes into Salesforce, you need an external ID field on the Salesforce object for Connect to match on. Decide what that key is early — usually the primary identifier from the upstream system — because retrofitting one across records that already synced is considerably more painful than choosing it up front.

## What the layering actually buys

- **Failures stay contained.** A malformed upstream feed breaks a bronze ingestion task. It does not reach Salesforce, because gold never gets written.
- **Reprocessing is cheap.** Fix the transformation, replay from bronze, and the corrected data flows forward. No re-extracting from source systems.
- **Wrong values are traceable.** A bad field in Salesforce can be walked back through gold to silver to bronze until you find the stage that introduced it.

The tradeoff is real: three copies of the data, and more pipeline code than a direct sync. On a single clean source that is overkill. It starts paying for itself around the point where you have several sources that disagree with each other — which, in practice, is most of them.

---

We design and maintain Airflow pipelines for clients with complex data integration requirements. If you are working through a similar problem, [see how we approach data pipelines](/services/airflow-data-pipelines/) or [get in touch](/contact/).
