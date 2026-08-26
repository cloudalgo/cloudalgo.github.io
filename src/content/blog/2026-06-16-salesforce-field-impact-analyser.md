---
title: "Before You Delete That Salesforce Field: How We Built a Seven-Pass Safety Net"
date: 2026-06-16
category: Salesforce
excerpt: "A client wanted to clean up 800+ legacy custom fields before a major data migration. The native dependency graph wasn't enough. Here's the script we built — and what it found."
seoTitle: "Before you delete that Salesforce field"
seoDescription: "A client wanted 800+ legacy custom fields cleaned up before a migration. The native dependency graph was not enough. Here is the script we built."
readTime: 6
published: true
image: /blog-images/salesforce-field-impact-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

A client asked us to help prep their Salesforce org for a data migration. Eight years of history — product pivots, reorgs, features that got halfway built and then quietly abandoned. The schema had somewhere north of 800 custom fields on Account alone. Nobody on their team could tell you with confidence which ones were actually being used.

Before the migration could happen, they wanted to clean it up. They'd already gone through the list and flagged a bunch of fields as dead — mostly tied to a workshop attendance tracking thing that got replaced by a third-party tool a couple years back. The plan was simple: clear the references, then delete.

We ran the native check. Setup → Object Manager → View Field Dependencies. Found a few things — some layouts, a validation rule. Cleared them. Ran it again. Clean. "Good to delete," the team said.

We said hold on.

## The dep graph doesn't show you everything

Here's the thing about Salesforce's built-in dependency checker — it works fine for what it tracks, but there's a bunch of stuff it just doesn't know about.

**Apex string references.** If someone wrote `soqlFields.add('My_Field__c')` to build a dynamic SOQL query at runtime, that's invisible. It's just a string. Salesforce has no idea it's a field reference.

**FieldPermissions.** Profiles and Permission Sets that grant access to a field don't show up in the dep graph at all. You delete the field, those entries break — silently.

**Email Template bodies.** Old orgs especially — if someone edited a template as raw HTML and hardcoded a field API name directly in the body rather than using standard merge field syntax, the dep graph won't catch it.

**Workflow Field Updates.** The dep graph picks up Workflow Rules in criteria, but if a field update action is *setting* a field as the target, that link isn't always surfaced.

**Static Resources.** Some orgs keep configuration as JSON files — field mappings, column definitions, that kind of thing. The dep graph sees that a Static Resource exists, not what's inside it.

**Custom Labels.** Rare, but it happens. Some orgs store field API names in label values for config-driven features.

On this client's org, the field the dep graph said had zero references was being referenced as a string literal in 14 Apex classes. Dynamic SOQL, assembled at runtime based on user-picked report options. If we'd deleted that field, the reporting feature would've just silently returned nothing. No error. No crash. Just wrong data.

We almost missed it.

## So we wrote a script

Rather than doing this manually for every field — which was going to take days — we built a Bash script that runs through all the hiding spots systematically. It's called `sf-field-impact.sh` and it works against any org you're authenticated to via the Salesforce CLI. Nothing to deploy, nothing to install in the org.

```bash
curl -o sf-field-impact.sh https://gist.githubusercontent.com/xenotime-india/6153edfad49a028076d521ca09104e35/raw/sf-field-impact.sh
chmod +x sf-field-impact.sh
```

It has two modes. **UNUSED** scans the whole org and classifies every custom field. **IMPACT** takes a specific field and tells you everything touching it before you make a move.

## Seven passes

The script runs each field through seven passes, each targeting a different kind of reference:

| Pass | What it checks | Why it matters |
|------|---------------|----------------|
| 1 | Metadata dependency graph | Layouts, Flows, Validation Rules, Reports, Dashboards, Formula Fields |
| 2 | Apex, LWC, Aura, Visualforce source — full text scan | Catches dynamic SOQL and hardcoded string references |
| 3 | FieldPermissions in Profiles and Permission Sets | These don't appear in the dep graph at all |
| 4 | Custom Label values | For orgs that store field names in labels |
| 5 | Static Resource bodies fetched via REST | Actually reads the file, not just the URL |
| 6 | Email Template subject, body, HTML | Hardcoded field names that bypass merge field syntax |
| 7 | Workflow Field Update targets and formulas | The field being set, not just evaluated |

If a field gets through all seven and nothing comes back, it lands in `no_reference`. That's your list to review. Not your list to bulk delete — still worth a quick manual check — but a solid starting point.

## Running it

**UNUSED mode** — run it against the org, dump to CSV, go through the `no_reference` bucket with your team:

```bash
./sf-field-impact.sh --org my-sandbox --output results.csv
```

You'll see the passes tick by in the console:

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
  found_in_email_template:   0
  found_in_workflow:         0
  found_in_labels:           0
  found_in_static_resource:  0
```

**IMPACT mode** — when you've already identified a field and want the full picture before touching it:

```bash
./sf-field-impact.sh --org my-sandbox \
  --analyze "Is_Mandatory_Workshop_Attended__c,Is_Sahaj_Workshop_Attended__c" \
  --object Account
```

Output shows every referencing component, with `[ACTIVE]` / `[INACTIVE]` on Flows and Triggers, plus whether the field shows up in source code:

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

That last line — `String in source: YES` — is exactly what stopped us from deleting a field that 14 Apex classes were depending on.

## What we actually found

On the client's org, the scan came back with 46 fields that had genuinely zero references across all seven passes. We also found 14 Apex classes touching a field the dep graph said was clean, 5 layouts still rendering two fields the team was convinced had been removed, and a couple of inactive Flows still tagged against another field.

The dep graph alone would have greenlit somewhere around 200 fields for deletion. The script cut that down to 46. Those 46 still got a manual review before anyone deleted anything. The migration went ahead without a production incident.

## What the script won't catch

To be straight about it — there are things this doesn't cover.

If field names are assembled at runtime through string concatenation (`'My_' + 'Field__c'`), no static scan will catch that. You need someone to actually read the code. Same goes for external systems — if a middleware layer or ETL tool is referring to a Salesforce field by name, the script has no way to see that. Check your integration docs separately.

Translated Email Template bodies only get the default-language version scanned. And binary Static Resources get skipped — only text and JSON get read.

So `no_reference` means high confidence, not certainty. Treat it as a shortlist, not a delete queue.

## Setup

Just needs the Salesforce CLI authenticated to the org. `curl` is optional — only needed for Pass 5 (Static Resource body fetching), the rest work without it.

```bash
# Download
curl -o sf-field-impact.sh https://gist.githubusercontent.com/xenotime-india/6153edfad49a028076d521ca09104e35/raw/sf-field-impact.sh
chmod +x sf-field-impact.sh

# Scan the whole org
./sf-field-impact.sh --org MY_ORG_ALIAS --output results.csv

# Check a specific field before deleting
./sf-field-impact.sh --org MY_ORG_ALIAS --analyze "My_Old_Field__c" --object Account
```

Works on bash 3.2+ so the macOS default shell is fine. No packages, no org config, no deployment.

---

We've run this on every schema cleanup engagement since we built it. If you're heading into a migration or just trying to get a handle on field debt, [get in touch](/contact/) or [see how we approach Salesforce architecture](/services/salesforce-consulting/).
