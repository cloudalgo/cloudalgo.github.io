---
title: "Airflow renamed the Postgres provider's schema argument. It fails silently, not loudly."
date: 2026-08-31
category: Heroku
excerpt: "The Postgres provider renamed its schema argument to database back in version 6.0.0, and the old name didn't disappear. It just stopped doing anything. A pipeline built on a shared Postgres connection across bronze, silver and gold tables keeps running green. It just starts writing to the wrong database, and Heroku Connect syncs whatever it finds there."
seoTitle: "Airflow's Postgres schema rename: the silent break"
seoDescription: "apache-airflow-providers-postgres renamed schema to database in 6.0.0. Passing the old kwarg doesn't error. It silently falls back to the connection's default database."
readTime: 6
published: true
image: /blog-images/airflow-postgres-schema-database-rename-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
relatedCaseStudy: enterprise-data-pipeline
---

Airflow's Postgres connection form has had a field called "Schema" since the project's earliest versions, and that field has never held a schema. It holds a database name, the thing you'd pass to `psql -d`. Nobody building DAGs day to day thought much about the mismatch until `apache-airflow-providers-postgres` 6.0.0 shipped in December 2024 and renamed the hook's own `schema` argument to `database`, saying so directly in the changelog: the old name "contained the database name" and was wrong. The deprecated alias didn't linger for a release or two. It was gone in the same version.

If you skimmed that line, one entry among a dozen breaking changes in a provider major bump, and your DAGs kept running green afterward, that isn't because nothing broke. It's because this particular break doesn't raise.

## Why this is the one people miss

Most renamed arguments fail loud. Pass a keyword a function doesn't recognize and Python throws `TypeError: unexpected keyword argument`. That's not what happens here, because `PostgresHook.__init__` doesn't validate its kwargs against an allowlist. It forwards them:

```python
def __init__(
    self, *args, options=None, enable_log_db_messages=False, **kwargs
) -> None:
    super().__init__(*args, **kwargs)
    self.database: str | None = kwargs.pop("database", None)
    self.options = options
    self.enable_log_db_messages = enable_log_db_messages
```

Pass `schema="gold"` today and `kwargs.pop("database", None)` finds nothing, so `self.database` stays `None`. But `schema` was already forwarded to the parent class two lines earlier, via `super().__init__(*args, **kwargs)`. The base `DbApiHook`, from the `common-sql` provider, still declares its own `schema` parameter. It always has, so it accepts the value without complaint and quietly stores it somewhere nobody downstream reads for the connection you actually wanted.

Then `get_conn()` decides which database to connect to with one line:

```python
"dbname": self.database or conn.schema,
```

`self.database` is `None`, so it falls through to `conn.schema`, the Schema field on the Airflow Connection object itself, the one that's meant "database" this whole time. The task connects. The query runs. The DAG goes green. It's just talking to whatever database that Connection was configured to point at by default, not the one the task actually asked for.

## Where this bites a Salesforce pipeline specifically

This is the exact shape of the medallion pattern we've written about before: one Heroku Postgres instance, one Airflow deployment on the same platform, bronze/silver/gold tables marking how far a record has gotten through validation, and Heroku Connect pointed only at gold. The pattern's whole value is that Heroku Connect never sees a half-processed row.

The convenient way to run three layers off one Postgres server is one Airflow connection, `heroku_pg`, and a per-task override telling each task which layer it's working in:

```python
PostgresHook(postgres_conn_id="heroku_pg", schema="gold")
```

On Heroku specifically, that connection's Schema field usually isn't something anyone typed by hand. `heroku config:get DATABASE_URL` returns a path component after the host, `postgres://user:pass@host:5432/dbname`, and whoever wired the Airflow connection up as `AIRFLOW_CONN_HEROKU_PG` or through the UI carried that `dbname` straight across. It's whatever database Heroku's Postgres add-on provisioned for the dyno, not a name anyone chose to mean "silver" or "gold." The per-task `schema=` override was doing real work precisely because the connection's own default meant nothing semantically.

That line worked for every provider release up to 5.x. On 6.0.0 and everything after, it's a no-op. The task falls back to whatever database `heroku_pg`'s own Schema field names, commonly whichever layer someone configured first. Often silver, because that's usually the connection wired up earliest in the DAG's history. A task that thinks it's reading gold reads silver instead. A task meant to publish into gold writes into silver. Heroku Connect keeps polling gold on its own schedule, sees no new rows, and syncs nothing. Or worse, sees rows that were supposed to still be quarantined.

Nothing in that chain throws an exception. The DAG's task history shows a clean run. The first symptom is usually a support ticket: a record a rep swears they fixed last week is still wrong in Salesforce, or a duplicate showed up that the silver-layer validation was supposed to have caught months ago. By the time someone traces it back to a hook argument, they've usually spent longer ruling out Heroku Connect's own mapping, the External ID field, and the validation rules than it took to introduce the bug.

## Why teams hit a change from December 2024 in 2026

The rename itself isn't new. What's new is that Airflow 3 migrations are the reason teams are opening this changelog at all. A shop that's been quietly running Airflow 2.8 or 2.9 for two years doesn't read every provider release note along the way. There's no reason to, when nothing is forcing an upgrade. The Airflow 3 migration is what forces it, and when it does, it usually means jumping several provider majors in one sitting rather than one at a time. The `schema` rename rides along in the same diff as a dozen other changes that look more urgent: `PostgresOperator` itself was removed in that same 6.0.0 release, in favor of `SQLExecuteQueryOperator`. That one does fail loud, an `ImportError` at DAG parse time, which is why it gets fixed first while the quieter rename gets missed entirely.

By the time a team is running provider 7.x, the current line, which switched the default driver to psycopg3 and adjusted its async URL scheme for Airflow 3.4, the `schema` kwarg has been gone for six versions and nobody remembers it was ever load-bearing. Whoever wrote `schema="gold"` in the first place has probably moved teams.

## What to check before the upgrade, not after

Grep the DAG repo for `schema=` on any `PostgresHook(` or `SQLExecuteQueryOperator(` call before touching the provider version, not after:

```bash
grep -rn 'schema=' dags/ | grep -iE 'postgreshook|sqlexecutequeryoperator|hook_params'
```

Every hit needs to become `database=`. If several tasks share one connection and differentiate only by that argument, that's worth a second look regardless of the provider version. A connection whose default database silently decides behavior when an override is missing is a trap whether the override is spelled `schema` or `database`. Point each layer at its own named connection, or make the database name an explicit DAG parameter instead of leaning on the Connection's default.

Add a cheap sanity check while you're in there. A single `SELECT current_database();` at the start of a task, logged and compared against what the task expects, turns a silent wrong-database write into a failed task the next time someone mistypes an argument. That costs one line and catches the next version of this same mistake, not just this one. It is also the fastest way to confirm, before the upgrade ships, that every task is still landing where its DAG author intended.

---

We build and maintain Airflow pipelines that feed Salesforce through Heroku Connect, including the medallion layering this post describes. If you're moving DAGs toward Airflow 3 and want a second pair of eyes on what else rides along in that jump, [see how we approach data pipelines](/services/airflow-data-pipelines/), or [look at the pipeline we run for a manufacturing client's CRM and ERP sync](/case-studies/enterprise-data-pipeline/). Otherwise, [get in touch](/contact/).
