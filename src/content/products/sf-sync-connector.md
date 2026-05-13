---
title: "SF Sync Connector"
status: beta
type: integration
tagline: "Bi-directional sync between Salesforce and external databases — zero custom code."
excerpt: "SF Sync Connector bridges your Salesforce org and external SQL databases or REST APIs with configurable field mappings, conflict resolution rules, and real-time change detection. Currently in beta — early access available."
icon: "sync-connector"
order: 2
features:
  - icon: "arrows"
    title: "Bi-directional Sync"
    description: "Push and pull records between Salesforce and PostgreSQL, MySQL, or any REST API on a configurable schedule or in real time via webhooks."
  - icon: "shield"
    title: "Conflict Resolution"
    description: "Choose Salesforce-master, external-master, or last-writer-wins strategies per object type — no data loss on concurrent updates."
  - icon: "eye"
    title: "Sync Dashboard"
    description: "Monitor sync health, error rates, and record throughput in a real-time dashboard without leaving Salesforce."
screenshots: []
requirements:
  - "Salesforce Enterprise or Unlimited edition"
  - "API access and Platform Events enabled"
  - "External system must expose a REST API or direct DB connection"
published: true
---

SF Sync Connector eliminates the need for custom ETL code when connecting Salesforce to your operational databases.
