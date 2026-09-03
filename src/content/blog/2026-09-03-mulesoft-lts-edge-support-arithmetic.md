---
title: "There is no MuleSoft LTS in 2026, and an Edge support window ends on a date somebody else picks"
date: 2026-09-03
category: MuleSoft
excerpt: "February shipped 4.11 Edge where an LTS was supposed to go, and MuleSoft's own note says there is no LTS planned for 2026 at all. That leaves 4.9, from February 2025, as the newest long-term runtime in existence. Edge buys about eight months, and the end of that window is set by a release date you have no say in."
seoTitle: "MuleSoft has no LTS in 2026. Pick a runtime anyway"
seoDescription: "No Mule LTS release is planned for 2026. What an Edge window is really worth, when CloudHub upgrades you without asking, and why 31 October matters twice."
readTime: 7
published: true
image: /blog-images/mulesoft-lts-edge-support-arithmetic-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

February 2026 shipped Mule 4.11 Edge. An LTS was supposed to go there.

MuleSoft said so in a support note in January, and the wording is worth reading twice: "In order to reduce the frequency of Mule Runtime LTS releases, we will not be releasing an LTS Release in February 2026. We plan to have an Edge Release in February 2026. At this point, there is no plan for an LTS release in 2026."

Which means the newest long-term runtime available today is 4.9 LTS, released on 28 February 2025. Eighteen months ago. If your upgrade plan was to skip 4.9 and land on whatever February 2026 brought, that plan is now waiting on a release with no date attached to it.

## What an Edge window is actually worth

The [cadence documentation](https://docs.mulesoft.com/release-notes/mule-runtime/lts-edge-release-cadence) states the rule plainly enough. For 4.9 and later, an Edge release gets standard support "until one month after the next Edge version is released", then three months of extended support after that.

Read that again with a planning hat on. The end of your support window is not a duration. It is the release date of a version you do not control, plus one month, and MuleSoft is under no obligation to tell you that date in advance.

In practice it has settled around eight months of total coverage, because Edge has been shipping roughly every four:

| Version | Released | Standard support ends | Extended support ends |
| --- | --- | --- | --- |
| 4.10 Edge | 31 Oct 2025 | 31 Mar 2026 | 30 Jun 2026 |
| 4.11 Edge | 28 Feb 2026 | 31 Jul 2026 | 31 Oct 2026 |
| 4.12 Edge | 30 Jun 2026 | 30 Nov 2026 | 28 Feb 2027 |
| 4.9 LTS | 28 Feb 2025 | 31 Aug 2027 | 29 Feb 2028 |

The eight months is not a commitment. It is an average of the last three intervals. Ship 4.13 six weeks earlier than the pattern suggests and every date in the 4.12 row moves left with it, including the one your change advisory board has already approved a window against.

The LTS row is the one to look at twice. 4.9 has been generally available for eighteen months and it still has eleven months of standard support left, then six more of extended. A 4.12 Edge deployment landing this month has under six.

## The upgrade you did not schedule

Here is the part that is in the documentation and almost never in anyone's plan.

On CloudHub and CloudHub 2.0, when an Edge version reaches end of standard support, "apps are automatically upgraded to the latest minor version in the Edge channel. The auto-upgrade occurs six weeks after the version reaches End of Standard Support." Apps in the LTS channel are not auto-upgraded when their version reaches the same milestone.

So Edge is not only a shorter window. It is a window at the end of which the platform changes your minor runtime version for you.

Do the arithmetic on 4.11 Edge. Standard support ended on 31 July 2026. Six weeks after that is 11 September, which is next week. Every 4.11 Edge application on CloudHub 2.0 is due to become a 4.12 application inside a window nobody on the team booked, and the only signal most estates get is the deployment record changing under them.

This is a different thing from the monthly auto-patch, and the two get conflated constantly. Patching moves 4.9.6 to 4.9.7 within a minor version and is backward compatible by design. The auto-upgrade moves you across a minor boundary, which is where connector compatibility, deprecated components and behavioural changes live. Both arrive without anyone on your side running a deployment. Only one of them is safe to ignore.

## The net has a hole exactly where the old versions are

If your response to all of that is "fine, the platform keeps us current for free", check whether it applies to you first. It has a carve-out: apps running Mule runtime 4.9 or earlier are not auto-upgraded to 4.10 or later.

The reason is TLS. 4.10 Edge is where MuleSoft deprecated TLS 1.0 and 1.1 for inbound and outbound connections to Anypoint Platform, and carrying an app across that line automatically would break every integration still handshaking on an old protocol. So MuleSoft does not carry it. A 4.9 Edge application, whose extended support ran out in February 2026, sits exactly where you left it.

That is the shape of the trap. The estates most likely to be relying on the auto-upgrade are the oldest ones, and the auto-upgrade stops precisely at the version boundary the oldest ones are sitting under.

## Two unrelated deadlines land on 31 October 2026

One is in the table above: extended support for 4.11 Edge ends.

The other is that all existing TLS 1.0 and 1.1 inbound connections are blocked on that date, across all Mule runtime versions in CloudHub 1.0 and CloudHub 2.0 deployments. Every version. Staying on an old runtime does not exempt you, because this enforcement is not happening in the runtime. Hybrid deployments and Runtime Fabric are outside its scope.

Both of those things are true on the same Saturday, and the interaction is not friendly. An estate that has deliberately stayed on an old CloudHub runtime to avoid the 4.10 TLS change receives the TLS change anyway, at the platform edge, without the runtime upgrade that would have given it somewhere to configure around the problem.

If you run anything on CloudHub with a partner still terminating on TLS 1.1, that is the date, and it is fifty-eight days from today.

## Before you can choose, you have to know what you are running

Two things make the inventory less obvious than it sounds.

The version in the POM is not the version running. Monthly auto-patching means an application declaring `4.9.0` in its `pom.xml` has been executing a considerably later patch for months, and both statements are correct. Support windows are published per minor version, so for this exercise the patch digit is noise and the minor is the entire answer. Read it from Runtime Manager, not from the repository.

And there is no single estate-wide view of it. CloudHub 1.0, CloudHub 2.0, Runtime Fabric and hybrid servers each answer to a different corner of the control plane, so an honest inventory is several queries joined by hand rather than one report with a runtime-version column in it. Budget an afternoon for a large estate, and do it before the conversation about target versions rather than during it, because the answer usually changes the conversation.

## Where we land clients, and what that costs

4.9 LTS, in almost every case.

It is Java 17 only, which is the whole of [what breaks on the way out of 4.6](/blog/mule-4-6-java-17-migration/) and the reason that move deserves to be two changes rather than one. Standard support runs to 31 August 2027 and extended support to 29 February 2028, with a further EOL support window for on-premises and hybrid deployments running to 6 February 2029. Nothing in the LTS channel is going to move your minor version while you are not looking.

The honest version of the recommendation includes the part that is not comfortable. Eleven months of standard support is not a decade. There is no announced LTS after 4.9, so the next real decision arrives some time in 2027 with information nobody has yet, and anyone telling you where MuleSoft's LTS cadence settles is guessing.

Edge is a genuine choice for a team that needs a specific feature in a specific release and can absorb a runtime upgrade every four months, permanently, with regression coverage good enough to make that routine. Those teams exist. Most estates we are called into cannot take a minor version bump every quarter on top of everything else, and choosing Edge is how they end up doing it anyway, on a schedule set by somebody in another company.

Pick the version you can still be on next year. Then find out, this week, whether CloudHub already picked a different one for you.

---

We run this arithmetic as part of every MuleSoft engagement, usually before anyone has mentioned a version number. See what a [MuleSoft integration layer](/services/mulesoft-integration/) looks like when it is maintained rather than inherited, or the [eight applications behind a digital health portal](/case-studies/health-portal-mulesoft-integration/). [Get in touch](/contact/) if your inventory comes back with something still on 4.9 Edge.
