---
title: "Salesforce Integration Patterns: A Practical Guide"
date: 2024-06-01
category: Salesforce
excerpt: "The four core Salesforce integration patterns — REST, SOAP, Platform Events, and Change Data Capture — with a decision framework for choosing the right one."
readTime: 8
published: true
image: /blog-images/870f59fff70dbc1fc789c519719f547d9151d3e6-1200x600.jpg
author: "CloudAlgo Team"
authorDesignation: "Salesforce Architects"
---

Salesforce sits at the centre of most enterprise tech stacks today, and integrating it correctly with surrounding systems is one of the most impactful decisions you can make. The wrong pattern creates brittle, hard-to-debug connections. The right one scales quietly for years.

This guide walks through the four core integration patterns, when to use each, and the tradeoffs you're accepting.

## The Four Core Patterns

![Salesforce integration patterns overview](/blog-images/eebb5692a5e0de7447173c9c2afc6beb91127699-1200x600.jpg)

The diagram above captures the mental model we use at CloudAlgo when scoping a new integration: **who initiates**, **how frequently**, and **what latency is acceptable**.

### 1. REST API — Your Default Choice

REST is the right starting point for most integrations. It's synchronous, stateless, and well-supported by every external system you'll encounter.

Use REST when:
- You need immediate confirmation that a record was created or updated
- The external system speaks HTTP (almost everything does)
- You control both ends of the connection

```javascript
const axios = require('axios');

const instanceUrl = 'https://yourorg.my.salesforce.com';
const accessToken = '<your_access_token>';

// Create a new Account via REST
const response = await axios.post(
  `${instanceUrl}/services/data/v59.0/sobjects/Account`,
  {
    Name: 'CloudAlgo Ltd',
    Industry: 'Technology',
    BillingCountry: 'United States',
  },
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
);

console.log('Created Account ID:', response.data.id);
```

The response comes back in milliseconds with the new record's Salesforce ID — exactly what you need to maintain referential integrity in your external system.

### 2. SOAP API — Legacy Systems & Bulk Ops

![SOAP vs REST decision flowchart](/blog-images/d1803b192e6851dc7fb5fc43ddb8f61a3934fb15-1400x563.jpg)

SOAP predates REST in Salesforce's history and is still the right choice when:

- You're integrating with ERP systems that speak SOAP natively (SAP, Oracle)
- You need `upsert` operations with external IDs at volume
- Your team already has WSDL-generated client code

The Bulk API (a specialised SOAP variant) can handle millions of records per job — REST tops out at 200 per call.

### 3. Platform Events — Real-Time Decoupled Messaging

Platform Events are Salesforce's pub/sub mechanism. They decouple producers from consumers and are the right pattern when:

- You want Salesforce to broadcast something happened, without caring who's listening
- Multiple downstream systems need the same event
- You need guaranteed delivery with retry logic

```javascript
// Subscribe to Platform Events via Streaming API
const faye = require('faye');

const client = new faye.Client(`${instanceUrl}/cometd/59.0`);
client.setHeader('Authorization', `Bearer ${accessToken}`);

client.subscribe('/event/Order_Placed__e', (message) => {
  const event = message.data.payload;
  console.log('New order:', event.Order_Id__c, 'for', event.Customer_Name__c);

  // Trigger downstream processes
  fulfillmentService.process(event);
  analyticsService.record(event);
});
```

Unlike REST, Platform Events are fire-and-forget from the producer's perspective. Salesforce stores up to 72 hours of events for late subscribers to replay.

### 4. Change Data Capture — Sync Without Polling

![Heroku Connect data sync architecture](/blog-images/921830719b89800a07f795a55ebea355aeb5b9b7-1200x600.jpg)

Change Data Capture (CDC) streams every insert, update, delete, and undelete from Salesforce as an event. It's the foundation of tools like Heroku Connect.

Use CDC when:
- You're maintaining a replicated copy of Salesforce data in an external database
- You want near-real-time sync without hammering the API with polling
- You need to track deletes (REST polling can't do this reliably)

```javascript
// CDC delivers a complete changed-fields payload
const changeEvent = {
  ChangeEventHeader: {
    entityName: 'Account',
    changeType: 'UPDATE',
    changedFields: ['Name', 'Industry', 'LastModifiedDate'],
    recordIds: ['001xx000003GYnVAAW'],
  },
  Name: 'CloudAlgo Technologies Ltd',
  Industry: 'Technology',
};

// Only the changed fields are included — efficient over the wire
await db.accounts.upsert({
  sfId: changeEvent.ChangeEventHeader.recordIds[0],
  ...changeEvent,
});
```

## Choosing the Right Pattern

| Pattern | Initiation | Latency | Volume |
|---|---|---|---|
| REST | Request/Response | < 1s | Up to 200/call |
| SOAP / Bulk | Request/Response | Seconds–minutes | Millions/job |
| Platform Events | Event-driven | Near real-time | High throughput |
| CDC | Event-driven | Near real-time | All record changes |

The decision usually comes down to: **does the external system need to wait for a response?** If yes, use REST or SOAP. If no, events give you better decoupling and resilience.

## What We See in Practice

Most production Salesforce integrations combine two or three of these patterns. A common stack at CloudAlgo client engagements looks like:

- **REST** for transactional operations (order placement, case creation)
- **CDC + Heroku Connect** for keeping a Postgres replica in sync
- **Platform Events** for triggering async workflows across microservices

Getting this architecture right from the start avoids the painful rewrites we see when teams bolt on integrations one by one without a coherent pattern.


---

If you are in the middle of an integration project and want an experienced team to review your approach or take it on entirely, [get in touch](/contact) — this is the kind of work we do every day.
