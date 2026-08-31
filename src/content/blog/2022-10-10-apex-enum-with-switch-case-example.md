---
title: "Using Apex Enums with Switch Case: A Practical Salesforce Example"
date: 2022-10-10
category: Salesforce
excerpt: "Using Apex enums with switch-case statements to manage support ticket states cleanly — a practical example with a real object model."
readTime: 3
image: /blog-images/apex-enum-with-switch-case-example-hero.svg
published: true
author: "Vikash Agarwal"
authorDesignation: "Technical Architect"
authorPhoto: "/blog-images/32c050b8f0ed847ec0b34f5144d2fa6b03a40888-200x200.jpg"
---

Apex code that branches on a picklist string tends to rot in a predictable way. Someone compares against `'In Progress'` in one class and `'In progress'` in another, a typo in a rarely-hit branch sits there for a year, and renaming a stage means grepping for quoted strings and hoping you found them all.

An enum moves those values into the type system, where the compiler checks them. Here is the pattern applied to support ticket stages.

## Define the enum

Each stage a ticket can be in becomes a constant:

```apex
public enum TicketStage {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}
```

The immediate payoff is that a misspelled stage is now a compile error rather than a branch that silently never runs.

## Switch on it

`switch on` pairs with the enum to give you one place where every stage is handled:


```apex
public class TicketProcessor {

    public static String processTicketStage(TicketStage stage) {
        String result = '';

        switch on stage {
            when OPEN {
                result = 'Ticket is currently in the Open stage.';
            }
            when IN_PROGRESS {
                result = 'Ticket is currently In Progress.';
            }
            when RESOLVED {
                result = 'Ticket has been Resolved.';
            }
            when CLOSED {
                result = 'Ticket is Closed.';
            }
            when else {
                result = 'Invalid or Unknown Ticket Stage.';
            }
        }

        return result;
    }
}

```

The `when` labels are the bare constant names, not `TicketStage.OPEN` — Apex already knows the type from the switch expression.

Keep the `when else` branch even once every stage is covered. It is what catches a null stage, and it is what runs when someone adds a fifth constant to the enum and forgets this class exists — a wrong-but-visible message rather than a silent fall-through.

## Converting the picklist value

The stage on the record is a string, so it has to be converted before it reaches the switch.

```apex
Support_Ticket__c myTicket = [SELECT Stage__c FROM Support_Ticket__c WHERE Id = 'your_ticket_id_here'];
TicketStage ticketStage = TicketStage.valueOf(myTicket.Stage__c);
String stageInfo = TicketProcessor.processTicketStage(ticketStage);
System.debug('Ticket Status: ' + stageInfo);

```

And this is where the pattern bites, so it is worth being deliberate about it.

`valueOf()` throws when the string does not correspond to a constant. Enum constants cannot contain spaces, but picklist values usually do — a `Stage__c` of `In Progress` will not resolve to `IN_PROGRESS`, and you get a runtime exception rather than the `when else` branch you might have expected to catch it.

You have two ways out. Either constrain the picklist's **API values** to match the enum constants exactly, leaving the labels free to read however the business wants, or write an explicit mapping and keep the conversion in one place:

```apex
private static final Map<String, TicketStage> STAGE_BY_VALUE = new Map<String, TicketStage>{
    'Open'        => TicketStage.OPEN,
    'In Progress' => TicketStage.IN_PROGRESS,
    'Resolved'    => TicketStage.RESOLVED,
    'Closed'      => TicketStage.CLOSED
};
```

The map is more code, but it fails in a way you control: an unmapped value returns null and lands in `when else`, instead of throwing from wherever the conversion happened to be called.

Whichever you pick, do the conversion once at the boundary. An enum that only exists inside one method has not bought you much — the value is in every downstream method taking `TicketStage` rather than `String`.

---

If your team is working through complex Salesforce business logic and you want an experienced set of eyes on the design, [we are happy to talk](/contact/).
