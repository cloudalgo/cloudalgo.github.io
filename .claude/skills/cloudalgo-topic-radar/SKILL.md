---
name: cloudalgo-topic-radar
description: Daily research pass that finds what is new in CloudAlgo's service areas and proposes five blog candidates for approval. Use at the start of a content run, or when asked what CloudAlgo should write about, what is new in Salesforce/Heroku/MuleSoft/AWS, or for blog topic ideas.
---

# Topic radar

The first half of a content run. It ends with five candidates and a question,
never with a written post. **Nothing gets drafted, imaged or committed until a
human picks one.**

## What CloudAlgo actually sells

Write for the buyer, not for the algorithm. The reader who turns into a lead is
a Salesforce architect, an RevOps lead or a CTO at a mid-market company in the
US or Europe, who has a mess and a budget.

Service lines: Salesforce consulting and implementation, Heroku (volume
connectivity, Postgres scaling, job automation), managed packages 1GP/2GP with
security review, MuleSoft integration and RPA, AWS, Airflow data pipelines,
support and managed services.

Products: OrgVitals (preview, org health scanner), AlgoBridge (GA, Salesforce ↔
Postgres sync), Pledgivo (preview, donations), InsureAlgo (GA, policy app),
apex-lint (open source).

Industries with existing proof: non-profit, manufacturing, healthcare and
digital health, distribution and logistics.

## Where to look

Run searches across these each day. Prefer the last 7 days, always check the
last 30.

- **Salesforce release and platform news** — release notes and preview
  announcements (Spring/Summer/Winter), retirements and end-of-life notices,
  API version deprecations, governor limit changes, Agentforce and Data Cloud
  changes, security review policy changes for AppExchange.
- **Heroku** — pricing and dyno changes, Postgres version support, Heroku
  Connect changes, anything affecting Salesforce-to-Heroku architectures.
- **MuleSoft** — Anypoint releases, RPA, licensing shifts.
- **AWS** — only where it touches a Salesforce or data-pipeline story.
- **Airflow** — major versions, provider package changes.
- **Trailblazer community and Stack Exchange** — recurring questions with no
  good published answer. These are the highest-converting posts, because the
  reader arrives already stuck.
- **Competitor and partner blogs** — to find what is being covered badly or not
  at all, not to copy.

A retirement notice or a breaking change is worth more than a feature
announcement, because it creates work that someone has to pay for.

## Deduplicate

Before proposing anything:

```bash
ls src/content/blog/
grep -ri "<candidate keyword>" src/content/blog/ | head
```

Twenty-plus posts already exist covering Heroku Connect at scale, Heroku vs
AWS, Salesforce-Heroku architecture patterns, MuleSoft NetSuite and health
portal integrations, EMR integration without an API, field impact analysis,
apex-lint, org health, SOQL, OAuth connected apps, REST/SOAP with Node,
Airflow on Heroku, async Heroku processes from Apex, and integration patterns.

A new post must not repeat one of these. A genuinely new angle on an existing
topic is fine — say explicitly which existing post it sits next to and how it
differs.

## The bias: technical, not business

CloudAlgo's Journal is an engineering blog. Every candidate must be a
**technical** post — code, architecture, a platform limit, a failure mode, a
migration, a debugging story. Not "five reasons to choose a Salesforce
partner", not "why integration matters in 2026", not anything a marketing team
could write without opening an IDE.

The test: **does the post contain something a developer would copy?** A code
block, a config, a query, a limit table, a decision matrix, a sequence of
steps. If the answer is no, it is the wrong post for this blog.

Good shapes:

- "We hit X limit at Y scale, here's what we changed"
- "The documented approach for X doesn't work when Y, here's why"
- "How <API/pattern> actually behaves, with the edge cases"
- "Migrating from X to Y — the parts the guide skips"
- "Reading the source of X to answer Y"
- Post-mortem of a real failure, anonymised

Bad shapes:

- Anything with "in 2026" in the working title
- Feature roundups of a Salesforce release with no opinion attached
- Buyer's guides, "how to choose a partner", ROI arguments
- Anything that would work equally well as a LinkedIn carousel

Business value comes from the CTA at the bottom and from being the blog that
architects trust. It does not come from the topic.

## Score each candidate

Rank on four things, in this order:

1. **Is it genuinely technical?** Per the section above. A candidate that
   fails this is not a candidate. Drop it and find another.
2. **Can CloudAlgo speak from experience?** A post about something the team has
   actually shipped beats a well-researched post about something it hasn't.
   This is the tie-breaker that matters most.
3. **Is the search intent unserved?** Check whether page one already answers it
   well. If it does, skip it. The best posts answer a question that has a
   Stack Exchange thread with no accepted answer.
4. **Does it reach a practitioner at a US or Europe company with budget?** A
   post for a junior admin gets traffic and no leads. A post an architect
   bookmarks gets one lead that matters.

Timeliness is a tiebreaker, not a driver. A well-written post on a permanent
platform behaviour outlives ten posts about this quarter's release.

## Output: the approval request

Present exactly five candidates. For each, four lines and no more:

```
**N. <The headline, written as it would publish>**
Category: <Salesforce | Heroku | MuleSoft | AWS | Product>  ·  ~<n> min read
Why now: <one sentence — the news, change or gap this rides on, with the source link>
The angle: <one or two sentences on what the post argues and what CloudAlgo can say that nobody else can>
CTA: <which product, case study or service page this post lands on>
```

Then state plainly which one you would pick and why, in one sentence. Then ask
for a decision and stop.

How you ask depends on where you are running.

- **In a Claude session**, use `AskUserQuestion` with the five headlines as
  options. If that tool is unavailable, post the list and wait for a reply.
- **In GitHub Actions**, open one issue labelled `journal-candidates`
  containing the five candidates, and end the body with the line telling the
  reader to reply `/write N`. The `journal-write.yml` workflow picks it up from
  there. Do not write, commit or publish anything in the radar run.

**Do not proceed on silence.** If no answer comes, the run ends having
published nothing. That is the correct outcome, not a failure.

## After approval

Hand off to `cloudalgo-journal-post` for the write and publish, `cloudalgo-voice`
for the drafting and the de-AI pass, `cloudalgo-hero-svg` for the image, and
`cloudalgo-linkedin-post` for the distribution copy. Only the approved
candidate gets written. Discard the other four — do not bank them, because
tomorrow's research will surface better ones.
