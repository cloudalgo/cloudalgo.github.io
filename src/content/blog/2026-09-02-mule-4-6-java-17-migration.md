---
title: "Mule 4.6 on Java 8 went out of standard support last month, and nothing that breaks is a compile error"
date: 2026-09-02
category: MuleSoft
excerpt: "August took Java 8 and 11 out of standard support on 4.6 LTS, and February 2027 takes extended support with them. The upgrade is not a Maven bump. The compile target does not move, the build stays green, and every failure waits until deploy or until the first callout to somebody else's endpoint."
seoTitle: "Mule 4.6 to Java 17: what actually breaks"
seoDescription: "Java 8 and 11 left standard support on Mule 4.6 LTS in August 2026. The Java 17 jump fails at deploy time, not compile time. What to inventory first."
readTime: 7
published: true
image: /blog-images/mule-4-6-java-17-migration-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

MuleSoft's [Java support page](https://docs.mulesoft.com/general/java-support) puts the end of standard support for Java 8 and 11 on 4.6 LTS in August, with extended support running out in February 2027. Read as a deadline, that looks like a runtime upgrade. It is not one.

The runtime version and the JDK are two separate switches. On 4.6 they move independently, and only one of them breaks anything. Which one you can move, and in what order, is decided by a single table.

## The overlap band is the whole planning problem

| Mule version | Java versions |
| --- | --- |
| 4.5 Edge | 8, 11 |
| 4.6 LTS · 4.6 Edge | 8, 11, 17 |
| 4.7 Edge | 8, 11, 17 |
| 4.8 Edge | 8, 11, 17 |
| 4.9 LTS and everything after | 17 |

4.6 through 4.8 is the only band where both JDKs are legal. It is the only place a migration can change one variable at a time: move the runtime with the JDK held still, then move the JDK with the runtime held still. On 4.5 you cannot flip the JDK at all. On 4.9 you cannot flip it back.

So an estate still on 4.5 is doing two migrations, in that order, through a band whose Java 8 and 11 support expires in February. The lane you need is the lane that is closing. That is the real date on the calendar, and it is not the one most teams have written down.

## Your build will not tell you anything

This is the part that catches people, and it catches good teams.

On 4.6 running under Java 17, you still compile to Java 8. MuleSoft's wording is that for Mule 4.9.0 and later you can compile a project for Java 17 or lower, and earlier versions require Java 8 compilation targets. If a custom connector's `mule-modules-parent` is older than 1.9.0 the rule is stricter again: all code, including third-party dependencies, must be compiled for Java 8.

`mvn clean package` therefore produces the same artifact before and after the JDK change. No new compile errors. No deprecation warnings that were not already there last year. The build is green on the morning the app stops deploying, and it stays green right through the incident call.

MUnit does not cover for it either, because the suite runs under whatever JVM Maven was launched with. A CI job pinned to a Java 8 toolchain will execute every test, pass every one, and say nothing at all about 17.

## The first thing that fails is an annotation, not your code

Deploy a 4.6 app on Java 17 with one connector that has not been updated, and the runtime refuses it:

```text
Extension 'module-error-handler-plugin' does not support Java 17.
Supported versions are: [1.8, 11]
```

The reason that connector is on the list is usually not that its code is broken. It is that nobody declared anything. From Mule 4.5.0 onward, a custom connector that does not carry the `@JavaVersionSupport` annotation is *assumed* to support Java 8 and Java 11 only. The default is not "unknown, let's find out". The default is no.

```java
@Extension(name = "Database")
@JavaVersionSupport({JAVA_8, JAVA_11, JAVA_17})
public class DatabaseConnector {
```

That is the whole fix for a connector whose code was always fine. Four tokens above a class declaration.

The mixed notation in the error, `[1.8, 11]`, is worth committing to memory. One version in the old scheme and one in the new, in the same bracket, is the fastest way to recognise this failure in a log full of stack traces that all look alike.

Two things follow from how the check works. It runs per extension at deploy time, so it surfaces one connector at a time: fix, redeploy, meet the next one. And adding the annotation is a *declaration*, not a test. It gets the app deployed. Whether the connector then works is a separate question, and the rest of this post is about the ways it might not.

> **Watch.** Custom API policies are extensions too, with the same annotation and the same default. They are applied in API Manager rather than declared in an application's `pom.xml`, so they are missing from every dependency inventory anyone runs. MuleSoft's own sequencing is explicit about this: upgrade policies before the proxies and apps they protect.

## Reflection, and the flag that makes the error go away

Java 17 finished what Java 9 started. `--illegal-access` is gone, strong encapsulation is on, and reflective access into a JDK internal now throws rather than warns:

```text
java.lang.reflect.InaccessibleObjectException: Unable to make field
private final java.util.Comparator java.util.TreeMap.comparator
accessible: module java.base does not "opens java.util" to unnamed
module @6d06d69c
```

In a Mule estate this almost never comes from code anybody wrote this decade. It comes from a serialisation library, a bean-mapping helper or a bytecode generator sitting three levels down the shaded dependency tree of a connector built in 2019.

`--add-opens java.base/java.util=ALL-UNNAMED` makes the message stop. Everyone finds that flag within the hour, and it is a stopgap for two reasons worth being honest about.

The first is that you are re-opening a door the JDK deliberately closed, and the JDK keeps closing more of them. `--illegal-access` went from permit, to deny, to deleted across three releases. The list of flags only ever grows, nobody prunes it, and the day it stops working the app that depends on it is five years older than it is now.

The second is where the flag lives. On a standalone runtime it goes into `conf/wrapper.conf` as a `wrapper.java.additional` line, which is a file you own. On the managed deployment models you do not own that file. So a connector that runs perfectly on a developer's local runtime with two extra flags is not evidence that it deploys, and the gap between those two facts is discovered late by design.

## The TLS change that arrives at the same time

Java 17 ships `TLSv1` and `TLSv1.1` in the `jdk.tls.disabledAlgorithms` property of `java.security`. Mule keeps its own protocol and cipher list in `conf/tls-default.conf`, and the JDK's list wins. A `tls-default.conf` that still enables TLSv1 produces this on the first callout to whichever partner has not moved yet:

```text
javax.net.ssl.SSLHandshakeException: No appropriate protocol
(protocol is disabled or cipher suites are inappropriate)
```

Strictly, this is not a Java 17 change. Those protocols were disabled by default in 8u292 and 11.0.11. The reason it still lands on people during a 17 migration is that plenty of Mule runtimes sit on a JDK build that was installed once, pinned after some certificate incident nobody remembers, and never touched again. For those estates a three-year-old default arrives on the same day as everything else in this post.

It will also survive your smoke test. Your own APIs are on 1.2 or 1.3 and always were. The endpoint that breaks is a SOAP service at a partner, called by one scheduled flow, at two in the morning.

## What we would do, in this order

1. Run the matrix against the estate first. Anything on 4.5 needs two moves, and 4.5 is not somewhere to wait.
2. Inventory every extension in every app, then add the custom policies from API Manager that no `pom.xml` mentions.
3. For connectors you own: check for `@JavaVersionSupport` and check that `mule-modules-parent` is 1.9.0 or later. For connectors you do not own: find the version that declares 17, and if there is not one, work out today who you have to ask.
4. Move the runtime into 4.6–4.8 with the JDK untouched. One variable.
5. Then flip the JDK, as its own change, with its own window. Everything in this post fails here, which is exactly why it deserves to be a separate step rather than a line item in a runtime upgrade.
6. Then 4.9 LTS, where 17 is the only choice and there is nothing left to switch.

Steps 4 and 5 are the ones that get collapsed into one ticket, usually by someone reading the support matrix as a single deadline. They are not one change. They fail in different places, they roll back differently, and only one of them is reversible in an afternoon.

February 2027 is not really a deadline for a runtime version. It is the closing date on the only band of versions that will run both JDKs, which is the only place this work can be done one step at a time. After that the step still exists. It just has to be taken all at once, with everything else.

---

The estates where this hurts are the ones holding a connector somebody wrote and nobody owns. We build and maintain [MuleSoft integration layers](/services/mulesoft-integration/), including the [eight applications behind a digital health portal](/case-studies/health-portal-mulesoft-integration/). [Get in touch](/contact/) if the inventory turns up something you cannot get a Java 17 version of.
