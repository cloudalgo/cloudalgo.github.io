---
title: "Before You Delete That Salesforce Field: How We Built a Seven-Pass Safety Net"
date: 2026-06-16
category: Salesforce
excerpt: "A client wanted to clean up 800+ legacy custom fields before a major data migration. The native dependency graph wasn't enough. Here's the script we built — and what it found."
readTime: 7
published: true
image: /blog-images/salesforce-field-impact-hero.svg
---

A client came to us ahead of a data migration. Their Salesforce org had grown over eight years — multiple product launches, several reorgs, a few abandoned features — and nobody was quite sure what was still live and what was dead weight. The schema had ballooned to over 800 custom fields on their core objects alone.

Before the migration team could do their work, the Salesforce team wanted to clean house. They had a list of fields they believed were no longer used — fields added for a workshop attendance tracking feature that had been replaced by a third-party platform two years earlier. The plan was to delete them before the migration window.

We ran the native check. Setup → Object Manager → find the field → View Field Dependencies. It showed a handful of references — a couple of layouts, one Validation Rule. The team cleared those. We ran it again. No more references. "Safe to delete," the team said.

We paused. Something felt off.

## The dependency graph lies by omission

Salesforce's built-in dependency graph is good at what it covers. Layouts, Flows, Validation Rules, Reports, Dashboards, Formula Fields — if a component is a first-class metadata citizen with a tracked reference, the dep graph sees it. But there is a long list of hiding spots it silently ignores.

**String references in Apex.** If a developer wrote `soqlFields.add('My_Field__c')` — assembling a dynamic SOQL query as a string — that reference is invisible to the dep graph. The field name is just text. Salesforce doesn't track it.

**FieldPermissions.** Profiles and Permission Sets that grant read or edit access to a field do not appear as dependencies. Delete the field and those permission entries break silently.

**Email Template bodies.** If a template uses a hardcoded field API name outside of standard merge field syntax — common in older orgs where templates were edited as raw HTML — the dep graph won't catch it.

**Workflow Field Updates.** The dep graph tracks Workflow Rules in criteria, but if a Workflow Field Update is *setting* a field as its target value, that relationship is not always surfaced in the dependency view.

**Static Resources.** Some orgs store configuration as JSON in a Static Resource — field mappings, column definitions for a data table, export configs. The dep graph sees the resource, not its contents.

**Custom Labels.** Uncommon, but some orgs use Custom Label values to store field API names for internationalised configuration. The dep graph has no visibility into label values.

On our client's org, the field that "had zero references" according to the dep graph was referenced as a string literal in 14 Apex classes. Dynamic SOQL was assembling the field name at runtime based on user-selected report parameters. Deleting that field would have broken a reporting feature silently — no compile error, just null results.

We pulled the trigger on nothing.

## So we built a script

We needed a way to check all of these hiding spots systematically — without spending half a day per field doing it manually. We built `sf-field-impact.sh`: a Bash script that combines the metadata dependency graph with source-level string scans across every place in the org a field API name could be lurking.

The script works against any authenticated Salesforce org via the Salesforce CLI. No deployment required. No packages to install in your org.

```bash
curl -o sf-field-impact.sh https://gist.githubusercontent.com/xenotime-india/6153edfad49a028076d521ca09104e35/raw/sf-field-impact.sh
chmod +x sf-field-impact.sh
```

It has two modes: **UNUSED** (full org scan — find all deletion candidates) and **IMPACT** (targeted — show everything touching a specific field before you touch it).

## Seven passes, in order

The script runs every candidate field through seven passes. Each pass targets a different class of reference:

| Pass | What it checks | Why it matters |
|------|---------------|----------------|
| 1 | Metadata dependency graph | Layouts, Flows, Validation Rules, Reports, Dashboards, Formula Fields, Workflow Rule criteria |
| 2 | Apex classes & triggers, LWC JS/HTML, Aura components, Visualforce pages — full source scan | Catches dynamic SOQL and any hardcoded string references |
| 3 | FieldPermissions in Profiles & Permission Sets | Field access grants are invisible to the dep graph |
| 4 | Custom Label values | Orgs that store field API names in labels for config-driven features |
| 5 | Static Resource bodies (fetched via REST, not just the URL pointer) | Middleware config JSON, LWC data table definitions |
| 6 | Email Template subject, body, and HTML | Hardcoded field names outside merge field syntax |
| 7 | Workflow Field Update target fields and formula text | The field being *set* — not just evaluated — by a field update action |

A field that survives all seven passes without a hit lands in `no_reference`. That is the only status that warrants serious consideration for deletion — and even then we recommend a manual spot-check against Reports and Dashboards.

## Two modes: UNUSED and IMPACT

**UNUSED mode** is where you start. Run it against the org, write the output to a CSV, then work through the `no_reference` bucket with your team:

```bash
./sf-field-impact.sh --org my-sandbox --output results.csv
```

The console gives you a summary as it runs:

```
Pass 1/7: querying metadata dependency graph…
  -> 776 field(s) not found in metadata dependency graph.
Pass 2/7: scanning Apex, LWC, Aura & Visualforce source…
Pass 3/7: checking FieldPermissions (Profiles & Permission Sets)…
Pass 4/7: scanning Custom Label values…
Pass 5/7: scanning text/JSON Static Resource contents…
Pass 6/7: scanning Email Template subject, body & HTML…
Pass 7/7: scanning Workflow Field Update targets & formulas…

Wrote results to results.csv
  no_reference:             46  <- safe deletion candidates
  found_in_code:           162  <- Apex/LWC/Aura/VF source
  found_in_permissions:    568  <- Profile or Permission Set field access
  found_in_email_template:   0  <- Email Template subject/body
  found_in_workflow:         0  <- Workflow Field Update target or formula
  found_in_labels:           0  <- Custom Label value
  found_in_static_resource:  0  <- text/JSON Static Resource
```

**IMPACT mode** is for when you already know which field you want to remove and need a full picture before acting:

```bash
./sf-field-impact.sh --org my-sandbox \
  --analyze "Is_Mandatory_Workshop_Attended__c,Is_Sahaj_Workshop_Attended__c" \
  --object Account
```

The output shows every referencing component — with `[ACTIVE]` / `[INACTIVE]` badges on Flows and Triggers — and tells you whether the field appears in source code as a string:

```
┌─ Is_Mandatory_Workshop_Attended__c
│  Layout                           (5):
│      • Person Account Layout
│      • Account Layout
│      • Person Account Layout For Support
│      • Person Account Layout For other Profile
│      • Person Account Layout for BusinessDev
│  Flow                             (2):
│      • MarkMandatoryOnStudentFlow [INACTIVE]
│      • Attendee Record Trigger Flow [INACTIVE]
│  ApexClass                        (14):
│      • AccountTriggerHandler
│      • AttendeeTriggerHandler
│      • AOL_MyStudentListCtrl
│      • ... (11 more)
│  String in source             : YES — appears in Apex/LWC/Aura/VF
└──────────────────────────────────────────────────────────
```

This is the output that stopped us from deleting a field that 14 Apex classes depended on.

## What we found for the client

When we ran the full unused-mode scan on the client's org, here is what came back:

- **46 fields** with zero references across all seven passes — genuine candidates for deletion
- **14 Apex classes** holding string references to one field the dep graph showed as clean
- **5 page layouts** still rendering two fields the team believed had been removed
- **2 inactive Flows** tagged against a third field — safe to delete, but documented in the cleanup log

The dep graph alone would have classified well over 200 fields as unreferenced. The script brought that number down to 46. The remaining 46 the team reviewed manually before deleting. Migration proceeded without a production incident.

## What it still won't catch

We try to be precise about what the script does and doesn't cover:

- **Runtime-assembled field names** — `'My_' + 'Field__c'` in Apex dynamic SOQL is invisible to any static scan. If your org does this, you need a code review, not a script.
- **External system references** — if an ETL tool, a middleware layer, or an external API refers to a Salesforce field by name, the script has no way to know. Check your integration inventory separately.
- **Translated Email Template bodies** — only the default-language HTML and body are scanned.
- **Binary or ZIP Static Resources** — only text/JSON content types are fetched and searched.

The `no_reference` bucket is high confidence, not guaranteed. Treat it as a starting list for human review, not a deletion queue.

## How to run it

Prerequisites: Salesforce CLI (`sf`) installed and authenticated to the target org. `curl` is optional — needed only for Static Resource body fetching (Pass 5); the rest of the passes work without it.

```bash
# Download
curl -o sf-field-impact.sh https://gist.githubusercontent.com/xenotime-india/6153edfad49a028076d521ca09104e35/raw/sf-field-impact.sh
chmod +x sf-field-impact.sh

# Full org scan — write to CSV
./sf-field-impact.sh --org MY_ORG_ALIAS --output results.csv

# Impact analysis on a specific field before deletion
./sf-field-impact.sh --org MY_ORG_ALIAS --analyze "My_Old_Field__c" --object Account

# Impact analysis on multiple fields
./sf-field-impact.sh --org MY_ORG_ALIAS --analyze "Field1__c,Field2__c"
```

The script is pure Bash and works with bash 3.2+, including the macOS default shell. No managed packages, no org configuration, no deployment.

---

We built this script during that field-cleanup engagement and have run it on every similar project since. If you're managing schema debt, preparing for a migration, or just want confidence before any field deletion, [get in touch](/contact) or [see how we approach Salesforce architecture](/services/salesforce-consulting).
