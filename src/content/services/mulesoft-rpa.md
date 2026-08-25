---
title: "MuleSoft RPA"
shortTitle: "RPA"
order: 4
icon: "🤖"
excerpt: "Robotic process automation on MuleSoft RPA — bots for the supplier portals, mainframe screens and PDFs that never got an API, governed on the same platform as your integrations."
---

### Process capture first

We sit with whoever does the work today and record it. What looks like one process is usually three, and one of them should not exist at all. The capture produces the process documentation you keep, whether or not a bot is ever built.

### Attended and unattended

Most processes want one of each, split at the decision point:

| Mode | Runs | Best for |
|---|---|---|
| Attended | Beside a person, on demand | Steps needing a judgement call — exceptions, approvals, anything with a "usually" in it |
| Unattended | On a schedule, on a server | High-volume repetition, overnight batches, anything that should have finished before the office opens |

### What we build

- **Bot definitions in RPA Builder** — with the exception paths written deliberately, instead of discovered in production
- **Document processing** — reading the invoice or the statement rather than the person reading it
- **Anypoint triggers** — bots started by, and reporting into, the same integration layer, so a bot failure raises the same alert everything else does
- **RPA Manager** — scheduling, queues and run history in one place

### The honest caveat

A bot breaks when somebody changes the screen it drives. That maintenance is real and it is ongoing — it belongs in a support retainer, not hidden inside a project price. We say so before the engagement starts rather than after.

You keep the bot definitions in your own tenancy, an exception runbook, and the process documentation the capture produced.
