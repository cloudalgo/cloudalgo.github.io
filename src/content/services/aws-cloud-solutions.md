---
title: "AWS Cloud Solutions"
shortTitle: "AWS"
order: 5
icon: "🏗️"
excerpt: "AWS architecture for the workloads that do not belong inside Salesforce — VPC and IAM as code, serverless processing, analytics, and cost work in the design."
---

### The architecture review

Every engagement opens with one. It covers what you run now, what it costs, and — the answer people least expect — which parts of it Salesforce should stop doing. The first recommendation is often what to switch off.

### Foundation as code

Written as Terraform or CDK, so the account can be rebuilt from the repository rather than remembered:

- **Network** — VPC, subnets, routing, and private connectivity to what needs it
- **Identity** — IAM roles scoped to the job, with guardrails on what the account can do at all
- **Accounts** — separation between production and everything else, enforced rather than agreed
- **Budgets** — cost alerts wired at setup, not after the first surprising invoice

### Workloads

Whichever the review picked:

- **Serverless processing** — Lambda consuming Salesforce Platform Events, so the org publishes and stops waiting
- **Migration** — moving a legacy system off its own hardware, with a rollback that actually works
- **Storage lifecycle** — S3 with tiering, so archived data stops being billed at hot-storage rates
- **Analytics layer** — QuickSight, Athena or Snowflake, reading the cross-system view Salesforce alone cannot give you

### Salesforce-adjacent by design

The point is not "we also do AWS". It is that the two sides are designed together: what stays in the org, what moves out, what crosses between them, and which API limits that crossing spends.

You keep the infrastructure repository, the budgets and cost alerts, the documented access model, and the runbook.
