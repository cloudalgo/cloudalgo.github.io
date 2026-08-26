---
title: "We're Building an Offline Salesforce Org Health Checker. First We Had to Lint Apex Without Java."
date: 2026-06-26
category: Salesforce
excerpt: "We wanted one runtime: Node. So the Apex analysis had to run in Node too, with no JVM anywhere in the picture. Here's how we built a 41-rule static analysis engine — and why we open-sourced it."
seoTitle: "Linting Apex in Node, without a JVM"
seoDescription: "We wanted one runtime: Node. So the Apex analysis had to run in Node too, with no JVM anywhere. How we built a 41-rule engine, and why we open-sourced it."
readTime: 9
published: true
image: /blog-images/apex-lint-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---

We've been building a desktop app that scans a Salesforce org's health and runs completely offline. You point it at an org, it pulls the metadata down once, and from there everything happens on your machine. No org code leaving your laptop for some analysis cloud, no connection required to run a scan, no per-seat SaaS meter running in the background.

Org health is a broad thing — bad sharing settings, technical debt piling up in old classes, governor-limit landmines, dead code, misconfigurations you inherited from three admins ago. A lot of that lives in Apex. So any honest org health check has to actually read your Apex and understand it, not just grep for strings.

And that's where we hit a wall.

## The JVM problem

If you want to statically analyze Apex, the road leads to PMD. PMD is the mature option and it works well. But PMD runs on the JVM.

For a desktop app, that's a real problem. We're building on Node and Electron, which means the app already ships one runtime. Bolting Java on as a second one means a heavier download, a Java version to detect and manage on every user's machine, and a setup step that turns "open the app and scan" into "open the app, install a JDK, fix your PATH, then scan." That's not an offline desktop experience — that's a build server pretending to be an app.

We wanted one runtime. Node. So the Apex analysis had to run in Node too, with no JVM anywhere in the picture.

## So we built apex-lint

apex-lint is static analysis for Apex that runs on pure Node. No Java, no apex-jorje, no Code Analyzer plugin.

The part that matters — the part that makes it trustworthy rather than just a toy: it doesn't use a homegrown grammar. It parses with `@apexdevtools/apex-parser`, the same ANTLR grammar PMD 7 uses. Same tree, same fidelity, just running in Node instead of on a JVM.

On top of that tree we run 41 rules across six categories: security, performance, error-prone, design, best practices, and code style.

The security rules do real taint tracking, not pattern matching. They follow user-controlled input (Visualforce params, REST bodies, cookies) through the code until it reaches a dangerous sink — or doesn't — so you get SOQL injection and SSRF findings without false positives on safe internal variables. The performance rules catch the governor-limit classics: SOQL in a loop, DML in a loop, callouts in a loop. Some rules are type-aware, reading your SObject metadata to check CRUD and FLS properly rather than guessing.

That's the engine sitting inside the health app. Every Apex check runs in Node, on your machine, offline.

## How it's built

If a linter is going to tell you your org has problems, you should understand how it actually works.

### One walk, many rules

apex-lint parses each file once into a syntax tree, then walks that tree a single time. Rules aren't little programs that each re-scan the file. A rule is a set of visitor functions keyed by node type — "when you see a SOQL query node, run this check." The engine does the walk and hands each node to whichever rules registered interest in that node type. It's the same model ESLint uses, and it's why running all 41 rules costs roughly the same as running one. The expensive part — the walk — is shared.

A rule ends up looking like this:

```typescript
export const soqlInLoop: Rule = {
  id: "SoqlInLoop",
  category: "performance",
  severity: "high",
  description: "SOQL inside a loop hits governor limits.",
  create(ctx) {
    return {
      QueryContext: (node) => {
        if (isInsideLoop(node)) ctx.report(node, "SOQL inside a loop hits governor limits.");
      },
    };
  },
};
```

No parsing, no file reading, no traversal logic in the rule itself. Just "here's the node I care about, here's what's wrong with it."

### The parser lives behind a seam

The engine lives in one package, `apex-core`, and we kept to one rule while building it: rules never import the parser directly. Exactly one file touches `@apexdevtools/apex-parser`. Everything else — all 41 rules included — works against our own tree and traversal helpers.

That might sound overly careful, but Salesforce ships new Apex syntax every few releases. When the grammar changes, the parser package updates, and we update that one file. Every rule keeps working untouched. If each rule reached into the parser on its own, a grammar bump would mean touching 41 files instead of one. Tedious to set up, but it's the kind of decision that makes future maintenance much less painful.

### Metadata is a seam too

Some rules need your schema. `UnguardedCrudOperation` has to know an object exists and what fields it has before it can check CRUD and FLS honestly. We didn't want that to mean "this rule only runs against a live org."

So type-aware rules talk to a `MetadataProvider` interface, not to Salesforce directly. In CI, the provider reads your sfdx `objects/` folder off disk. Inside the desktop app, the same rule gets a provider backed by a live org. Same rule code, different source of truth. And when there's no provider at all, those rules stay quiet instead of guessing — we'd rather surface nothing than flag something incorrectly.

### The taint analysis

This is the piece most Apex linters skip entirely, and the part we spent the most time on.

The lazy approach to SOQL injection is to find every `Database.query(` and file a complaint. That produces a lot of noise. Most of those calls are perfectly safe, and developers learn to ignore a tool that yells at everything.

apex-lint does intra-method forward taint propagation instead. We mark untrusted inputs as tainted at their source — Visualforce page parameters, the REST request body, cookies — then follow them forward through the method. Assign a tainted value to another variable, and that variable is now tainted too. A finding only fires when a tainted value actually reaches a dangerous sink: `Database.query()`, a `PageReference` redirect, `HttpRequest.setEndpoint()`, `addError` with escaping switched off.

The practical result is precision. A query string built from literals and safe internal values never gets flagged, even when it lands in `Database.query()`. A string that started as `ApexPages.currentPage().getParameters().get('id')` and got concatenated into a query does. That difference is what makes a security linter worth keeping in your workflow versus one you disable after the first sprint.

One limitation worth being upfront about: this currently runs inside a single method. If taint crosses a method boundary — one method takes the param, hands it to a helper that builds the query — we don't follow it across that call yet. Cross-method taint tracking is on the roadmap. We'd rather say that clearly than let you assume coverage you don't have.

## Wiring it into your stack

The CLI gets you going quickly, but apex-lint ships as a few packages so it fits into whatever you're already running. The CLI, the ESLint plugin, and the desktop app are all thin layers over one engine.

### Embedded: @cloudalgo/apex-core

apex-core is the analysis engine. It exposes a `Linter` class you can call from any Node 20+ process — an editor extension, a CI step, a desktop app. Pass it a file path and source, get back findings. No subprocess, no JVM to boot.

```typescript
import { Linter, allRules } from "@cloudalgo/apex-core";

const result = new Linter(allRules).lint({
  filePath: "MyClass.cls",
  source,
});
```

That's exactly how the health app uses it. The analysis is library code running in the same process as the app — that's what makes "offline" mean something real.

### ESLint plugin: @cloudalgo/eslint-plugin-apex

Plenty of Salesforce teams already run ESLint over their LWC and JavaScript. This plugin brings all 41 Apex rules into that same setup, so Apex isn't the one language without inline linting in your editor. The custom Apex parser is bundled in — one dependency, not two.

```bash
npm install --save-dev @cloudalgo/eslint-plugin-apex eslint
```

On ESLint v9 (flat config), the recommended preset is a single spread. It enables all 41 rules, mapping critical and high to error and the rest to warn:

```javascript
// eslint.config.js
import apex from "@cloudalgo/eslint-plugin-apex";

export default [
  ...apex.flatConfigs.recommended,
];
```

If you want type-aware rules like `UnguardedCrudOperation` to do their full job, point them at your metadata:

```javascript
// eslint.config.js
import apex from "@cloudalgo/eslint-plugin-apex";

export default [
  {
    files: ["**/*.cls", "**/*.trigger"],
    languageOptions: { parser: apex.parser },
    plugins: { apex: { rules: apex.rules } },
    settings: { "apex/metadataRoot": "./force-app/main/default" },
    rules: {
      "apex/SoqlInLoop": "error",
      "apex/DmlInLoop": "error",
      "apex/ApexSOQLInjection": "error",
      "apex/UnguardedCrudOperation": "warn",
    },
  },
];
```

Still on ESLint v8? The legacy config format works too:

```json
{
  "extends": ["plugin:apex/recommended"],
  "settings": { "apexMetadataRoot": "./force-app/main/default" }
}
```

Standard `// eslint-disable-next-line apex/SoqlInLoop` suppression works either way. And because the plugin runs on apex-core underneath, your existing `// NOPMD` and `@SuppressWarnings('PMD')` comments are honored — migrating from PMD doesn't mean re-annotating your whole codebase. Install the ESLint VS Code extension and findings show up inline on save.

## Why we open-sourced it

We could've kept apex-lint internal to the app, but that felt wrong for two reasons.

It's genuinely useful on its own — you can drop it into CI today and get SARIF output straight into GitHub code scanning, independently of the health app. And a security linter that you can't read and audit isn't one you should really trust. If it's going to tell you your org has a problem, you should be able to see exactly how it reached that conclusion. The full rule list, config options, and CI setup are in the [README](https://github.com/cloudalgo/apex-lint#readme).

Install is one line:

```bash
npm install -g @cloudalgo/apex-lint
apex-lint force-app/
```

Node 20 or newer. Open source under BSD-3-Clause.

## What's next

apex-lint is v0.1.0. It's the first piece, not the finished story, and it's not a PMD replacement yet — we're not pretending it is. More rules, PMD ruleset import, and a baseline mode for legacy orgs are all coming.

The bigger thing is the offline health app it feeds into. That's what we're heads-down on, and it releases soon. When it ships it'll be free — no card, no usage limits, no cloud sync. You run it, your org's data stays on your machine. If scanning your whole org for technical debt and security gaps — entirely offline, on your own hardware — sounds useful, keep an eye on us.

In the meantime, the linter is there.

---

Point it at your org's messiest Apex class and see what comes back. Node 20 or newer, BSD-3-Clause. [View on GitHub](https://github.com/cloudalgo/apex-lint) [Install from npm](https://www.npmjs.com/package/@cloudalgo/apex-lint)
