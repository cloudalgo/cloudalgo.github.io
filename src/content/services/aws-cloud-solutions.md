---
title: "AWS Cloud Solutions"
shortTitle: "AWS"
order: 5
icon: "🏗️"
excerpt: "AWS architecture for the workloads that do not belong inside Salesforce — VPC and IAM foundations as code, serverless processing, and the analytics layer, with cost work in the design rather than sold afterwards."
---

## AWS Cloud Solutions

Heavy compute, long-term storage, cross-system analytics, and anything that would eat your API limits belongs next to Salesforce rather than inside it. We architect that side properly the first time, so the account is auditable and the bill does not surprise you in month four.

Cost work is part of the design here, not a clean-up engagement we sell you afterwards.

---

### The Architecture Review

Every engagement opens with one. It covers what you run now, what it costs, and — the answer people least expect — which parts of it Salesforce should stop doing. The first recommendation is often what to switch off.

---

### Foundation as Code

Written as Terraform or CDK, so the account can be rebuilt from the repository rather than remembered:

- **Network** — VPC, subnets, routing, and private connectivity to what needs it
- **Identity** — IAM roles scoped to the job, with guardrails on what the account can do at all
- **Accounts** — separation between production and everything else, enforced rather than agreed
- **Budgets** — cost alerts wired at setup, not after the first surprising invoice

---

### Workloads

Whichever the review picked:

- **Serverless processing** — Lambda consuming Salesforce Platform Events, so the org publishes and stops waiting
- **Migration** — moving a legacy system off its own hardware, with a rollback that actually works
- **Storage lifecycle** — S3 with tiering, so archived data stops being billed at hot-storage rates
- **Analytics layer** — QuickSight, Athena or Snowflake, reading the cross-system view Salesforce alone cannot give you

---

### Salesforce-Adjacent by Design

The point is not "we also do AWS". It is that the two sides are designed together: what stays in the org, what moves out, what crosses between them, and which API limits that crossing spends.

You keep the infrastructure repository, the budgets and cost alerts, the documented access model, and the runbook.
