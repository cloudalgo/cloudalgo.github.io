---
name: cloudalgo-journal-post
description: Publish a post to the CloudAlgo Journal (cloudalgo.com/blog). Use whenever writing, drafting, editing or shipping a blog post, journal entry or article for this repo. Covers filename, frontmatter schema, CTA block, build gate and live verification.
---

# Publishing to the CloudAlgo Journal

The Journal is an Astro content collection. Getting a post live is a file, a
build, and a push. Nothing else needs touching.

## 1. Filename

`src/content/blog/YYYY-MM-DD-slug.md`

The date prefix is stripped to make the URL, so
`2026-09-01-heroku-connect-limits.md` publishes at
`https://cloudalgo.com/blog/heroku-connect-limits/`.

Slug rules: lowercase, hyphens, no stop words padded in for length, and it
should still read as the topic in six months. Keep it under about 60
characters. Never reuse a slug that already exists in the directory — check
first with `ls src/content/blog/`.

**Do not edit `astro.config.mjs`.** Redirects, sitemap `lastmod` and the dated
URL aliases are all derived from the filename by `readdirSync`. A correctly
named file wires itself up.

## 2. Frontmatter

Validated by `src/content.config.ts`. A wrong field fails the build, which is
the point.

```yaml
---
title: "Sentence case, written for the page and not for a list of blue links"
date: 2026-09-01
category: Salesforce        # Salesforce | Heroku | MuleSoft | AWS | Product — exactly these
excerpt: "The standfirst. Runs under the headline and on the cards. Written to be read, so it can run past what a search result shows."
seoTitle: "Under 60 characters"          # only when the headline is longer
seoDescription: "Under 160 characters"   # only when the excerpt is longer
readTime: 7                              # integer minutes, ~220 words/min, round honestly
published: true
image: /blog-images/<slug>-hero.svg
author: "Sandeep Kumar"
authorDesignation: "Founder, CloudAlgo"
authorPhoto: "/blog-images/a0bac224191c550df6e3a1f8ade4206b0927cbfb-515x515.jpg"
---
```

`featured: editors-pick` and `featured: bottom-pick` exist but are a curation
decision, not a default. An automated run leaves `featured` off.

`relatedCaseStudy` takes a case-study id from `src/data/case-studies.ts`. Only
set it if the post genuinely describes that engagement.

**The SEO budget.** A search result shows about 60 characters of title and 160
of description. Only add `seoTitle` / `seoDescription` where the on-page copy
exceeds that. Do not pad them to hit the limit, and never paste a full sentence
into a title.

## 3. Body

Markdown. Starts straight into prose — no H1, the template renders the title.
Use `##` for sections, `###` sparingly. Fenced code blocks carry a language tag.
A lone captioned image in its own paragraph is turned into a `<figure>` by the
`satteriFigures` plugin, so write the caption as the alt text and let it.

Length: 1,200 to 2,000 words for a standard entry. A thin post is worse than no
post — see `cloudalgo-voice` for the quality bar.

## 4. The CTA block

Every post ends the same way: a horizontal rule, then one short paragraph that
offers the next step in plain language with two or three inline links. It is
soft. It never says "unlock", "supercharge" or "get started today".

```markdown
---

We built this for a specialty wholesale distributor on MuleSoft CloudHub. [See the full case study](/case-studies/salesforce-netsuite-sync/), or [get in touch](/contact/) if you're connecting Salesforce to NetSuite, or any other ERP.
```

Pick links that match what the post is actually about:

| Post is about | Link to |
| --- | --- |
| Org health, tech debt, code quality | `/products/orgvitals/`, `/contact/` |
| Apex tooling, static analysis | `github.com/cloudalgo/apex-lint`, npm |
| Salesforce ↔ Postgres, data sync | `/products/algobridge/` |
| Non-profit, donations, fundraising | `/products/pledgivo/` |
| An integration pattern we shipped | the matching `/case-studies/<id>/`, `/contact/` |
| Anything else | `/services/<matching-service>/`, `/contact/` |

`/contact/` earns its place in nearly every post. It should read as an offer,
not a demand. The subscribe box under every entry is rendered by the template —
do not write one into the body.

## 5. Hero image

Required. Generate it per `cloudalgo-hero-svg` and save it as
`public/blog-images/<slug>-hero.svg`, then point `image:` at
`/blog-images/<slug>-hero.svg`.

## 6. Build gate — never skip this

```bash
npm ci          # first run in a fresh container
npm run build
```

A schema violation, a bad category, a malformed date or a missing required
field fails here. Fix and rebuild until green. **Do not commit a post that has
not built.**

Astro 7 note: a green build does not guarantee a working page for dependency or
bundler changes. For a content-only change, green is sufficient.

## 7. Commit and push

One commit per post, message in the form:

```
Add journal entry: <title>
```

Push to `main`. `.github/workflows/deploy.yml` builds and deploys to GitHub
Pages on every push to `main`.

## 8. Verify live

Pages takes roughly two to four minutes. Then confirm all three:

1. `https://cloudalgo.com/blog/<slug>/` returns 200 and shows the post body.
2. The post appears on `https://cloudalgo.com/blog/`.
3. The hero renders — fetch `https://cloudalgo.com/blog-images/<slug>-hero.svg`.

If the first check 404s, wait 90 seconds and retry once before treating it as a
failure. If it still fails, check the Actions run rather than pushing again.
