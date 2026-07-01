---
title: "OrgVitals"
status: preview
type: desktop-app
tagline: "A desktop health scanner for Salesforce orgs — 49 read-only checks, an A–F grade, and a fix-it workflow, all running on your machine."
excerpt: "OrgVitals connects to any org you've authenticated with the Salesforce CLI, pulls a read-only metadata snapshot, and runs 49 scanners across Security, Code Quality, Automation, Tech Debt, and Performance. You get a graded health report, prioritized findings, historical trends, cross-org comparison, and an AI assistant. Your Salesforce metadata and scan results stay on your device — access to the org is strictly read-only."
icon: "orgvitals"
externalUrl: "https://github.com/cloudalgo/orgvitals-releases/releases"
issuesUrl: "https://github.com/cloudalgo/orgvitals-releases/issues"
seoTitle: "OrgVitals — Salesforce Org Health Scanner (Desktop) | CloudAlgo"
version: "1.1.1"
lastUpdated: "2026-07-01"
order: 1
features:
  - icon: "scan"
    title: "49 Scanners, 5 Categories"
    description: "Security, Code Quality, Automation, Tech Debt, and Performance. Scanners run in dependency-ordered waves across a worker pool, so a full org scans in minutes. Everything is read-only — OrgVitals fetches metadata but never writes back to Salesforce."
  - icon: "grade"
    title: "An A–F Health Grade"
    description: "Every finding carries a severity and subtracts from its category's 100-point base. Categories roll up by fixed weight — Security 30%, Code Quality / Automation / Tech Debt 20% each, Performance 10% — into one overall grade, plotted against every prior scan of the org."
  - icon: "triage"
    title: "Findings Triage Workflow"
    description: "Filter by category, severity, or scanner, and surface quick wins (high impact, low effort). Mark findings fixed, ignored, or snoozed — statuses persist across future scans by a stable key, and a 'managed score' shows your health after triage."
  - icon: "graph"
    title: "Insights — Dependency & Impact Graph"
    description: "Explore the component graph across triggers, controllers, flows, SOQL, LWC imports, and email-template usage. Impact analysis shows the blast radius of changing any component; global fuzzy search jumps you anywhere in the org."
  - icon: "compare"
    title: "Org Families — Cross-Org Comparison"
    description: "Group production and its sandboxes, then roll up scores side by side, find shared findings across orgs, A/B compare two orgs, and diff metadata or a single component's source line by line."
  - icon: "ai"
    title: "Ask Vita — AI Assistant"
    description: "A Claude-powered chat that answers questions about the connected org — 'which flows run on Account?', 'list my critical security findings' — by querying your local snapshot with read-only tools. Vita is opt-in and off by default: once you add your own Anthropic API key and acknowledge it, your questions and the metadata Vita reads go to Anthropic's Claude API — never to CloudAlgo, and never written back to Salesforce."
techStack:
  - label: "Platform"
    value: "Electron desktop · macOS, Windows, Linux"
  - label: "Salesforce access"
    value: "Salesforce CLI (sf) · strictly read-only, no write scopes"
  - label: "Local store"
    value: "SQLite snapshot on your machine — raw metadata and scan results stay local"
  - label: "Scan engine"
    value: "Dependency-ordered scanner waves across a worker pool (max 8)"
  - label: "AI assistant"
    value: "Claude via the Anthropic SDK; API key stored encrypted, queries run against the local DB"
  - label: "Scoring"
    value: "Weighted A–F — Security 30% · Code Quality / Automation / Tech Debt 20% · Performance 10%"
  - label: "Updates"
    value: "In-app auto-update from GitHub Releases"
roadmap:
  - version: "v1.1"
    theme: "Compare & Triage"
    description: "Org Families with cross-org rollup and A/B compare, metadata and GitHub-style source diff, remediation prioritization, and a managed score that excludes dismissed findings."
  - version: "Next"
    theme: "Guided Cleanup"
    description: "Turn cleanup-eligible findings — unused Apex, fields, LWC, Aura, and Visualforce — into a reviewed destructiveChanges package you can deploy, with OrgVitals staying strictly read-only against the org."
  - version: "Later"
    theme: "Team & Continuous"
    description: "Scheduled and CI-triggered scans plus shareable team dashboards, so org health is tracked continuously rather than one run at a time."
requirements:
  - "macOS, Windows, or Linux desktop"
  - "Salesforce CLI (sf) installed with at least one authenticated org"
  - "Read access to the org's metadata — no write permissions required"
  - "An Anthropic API key to use Ask Vita (optional)"
pricing:
  - tier: "OrgVitals Desktop"
    price: "Free"
screenshots:
  - "/products/orgvitals/dashboard.jpg"
  - "/products/orgvitals/findings.jpg"
  - "/products/orgvitals/insights.jpg"
  - "/products/orgvitals/history.jpg"
  - "/products/orgvitals/ask-vita.jpg"
legal:
  - label: "Privacy Policy"
    href: "/products/orgvitals/legal/privacy"
  - label: "Terms of Service"
    href: "/products/orgvitals/legal/terms"
  - label: "Data Processing"
    href: "/products/orgvitals/legal/data-processing"
  - label: "Acceptable Use"
    href: "/products/orgvitals/legal/acceptable-use"
published: true
---

OrgVitals is a desktop app that gives Salesforce architects and admins one place to see how healthy an org really is. You pick an org you've already authenticated with the `sf` CLI; OrgVitals fetches a **read-only** snapshot of its metadata — Apex, Flows, profiles, permission sets, objects, fields, reports, dashboards, limits, health-check score, and test coverage — stores it in a local SQLite database, and runs the selected scanners across a worker pool.

**Nothing is written back to Salesforce, and your metadata and scan results stay on your device.** The snapshot and all scan history live in a local database on your machine. OrgVitals uses a Google sign-in (your account profile is stored via Firebase), sends crash diagnostics by default (you can opt out), and offers opt-in product analytics. Ask Vita is opt-in and off by default — it's the only feature that sends org data off the device; if you enable it with your own Anthropic API key, your questions and the metadata it reads go to Anthropic's Claude API, never to CloudAlgo. Full details are in the [Privacy Policy](/products/orgvitals/legal/privacy) and [Data Processing](/products/orgvitals/legal/data-processing) pages.

**How the grade works.** Each finding has a severity that subtracts a penalty from its category's 100-point base. The five categories roll up by fixed weight into a single overall grade from **A to F**, and a trend chart tracks that grade across every scan so you can see whether the org is getting healthier over time.

**Scanners covered:** Security · Code Quality · Automation · Tech Debt · Performance — 49 checks in all, from SOQL injection and over-permissioned profiles to SOQL/DML in loops, unused metadata, duplicate triggers, and org-limit consumption.

Built and maintained by [CloudAlgo](https://cloudalgo.com) — the same team behind our Salesforce remediation practice. Download the latest build for macOS, Windows, or Linux from the releases page.
