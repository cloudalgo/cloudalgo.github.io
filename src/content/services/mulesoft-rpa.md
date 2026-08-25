---
title: "MuleSoft RPA"
shortTitle: "RPA"
order: 4
icon: "🤖"
excerpt: "Robotic process automation on MuleSoft RPA — bots for the supplier portals, mainframe screens and PDFs that never got an API, governed on the same platform as your integrations."
---

## MuleSoft RPA

Some systems cannot be integrated, only operated: a supplier portal with no API, a mainframe screen, a PDF somebody rekeys into Salesforce every morning. RPA drives those the way a person does, except at 3am and without transcription errors.

We build the bots in MuleSoft RPA specifically so they run on the same Anypoint platform as your integrations — one place to monitor, one place to alert — instead of becoming a second automation tool nobody governs.

---

### Process Capture First

We sit with whoever does the work today and record it. What looks like one process is usually three, and one of them should not exist at all. The capture produces the process documentation you keep, whether or not a bot is ever built.

---

### Attended and Unattended

Most processes want one of each, split at the decision point:

| Mode | Runs | Best for |
|---|---|---|
| Attended | Beside a person, on demand | Steps needing a judgement call — exceptions, approvals, anything with a "usually" in it |
| Unattended | On a schedule, on a server | High-volume repetition, overnight batches, anything that should have finished before the office opens |

---

### What We Build

- **Bot definitions in RPA Builder** — with the exception paths written deliberately, instead of discovered in production
- **Document processing** — reading the invoice or the statement rather than the person reading it
- **Anypoint triggers** — bots started by, and reporting into, the same integration layer, so a bot failure raises the same alert everything else does
- **RPA Manager** — scheduling, queues and run history in one place

---

### The Honest Caveat

A bot breaks when somebody changes the screen it drives. That maintenance is real and it is ongoing — it belongs in a support retainer, not hidden inside a project price. We say so before the engagement starts rather than after.

You keep the bot definitions in your own tenancy, an exception runbook, and the process documentation the capture produced.
