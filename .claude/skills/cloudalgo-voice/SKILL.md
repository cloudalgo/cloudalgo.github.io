---
name: cloudalgo-voice
description: CloudAlgo's writing voice and the de-AI edit pass. Use when writing or reviewing any CloudAlgo copy — blog posts, LinkedIn posts, site pages, emails — or when asked to make text sound less AI-generated, more human, or on-brand.
---

# CloudAlgo voice, and how to stop sounding like a language model

## The voice, in one line

A senior engineer who has shipped this before, writing to another engineer,
slightly tired of the vendor version of the story.

Concretely:

- **First person plural.** "We built", "we've seen", "we're not pretending it
  is". CloudAlgo is a team, and the reader is being told what that team did.
- **Specific over impressive.** "Six classes" beats "several classes". "A
  two-minute buffer for clock skew" beats "careful handling of timing issues".
  Numbers, object names, API names, error messages.
- **Mildly skeptical.** Willing to say a thing is not finished, not a
  replacement, not free forever. "apex-lint is v0.1.0. It's the first piece,
  not the finished story, and it's not a PMD replacement yet — we're not
  pretending it is."
- **Soft CTA.** An offer, never a demand. "If that sounds useful, keep an eye on
  us." Not "Contact us today to transform your Salesforce org."
- **Comfortable with a joke,** as long as it is dry and one clause long.

## Things that are banned outright

Words: leverage, game-changer, seamless, robust, cutting-edge, revolutionary,
unlock, supercharge, empower, elevate, delve, harness, navigate (figuratively),
landscape (figuratively), realm, tapestry, testament, pivotal, crucial,
paramount, myriad, plethora, holistic, synergy, best-in-class, world-class,
state-of-the-art, transformative, journey (unless it is literally the Journal).

Constructions:

- "In today's fast-paced world" and every variant of it.
- "It's not just X, it's Y."
- "Whether you're a X or a Y, this Z has something for you."
- "Let's dive in." / "Let's explore." / "Buckle up."
- "The bottom line?" as a one-word paragraph followed by a colon.
- Rhetorical question, immediate answer, repeat. Once in a post is a device.
  Three times is a tic.
- Tricolons everywhere. "Faster, cheaper, and more reliable" is fine once.
  Every third sentence is a tell.
- Opening a paragraph with "Moreover", "Furthermore", "Additionally", "In
  conclusion", "Ultimately".
- Closing a section by restating what the section just said.
- Bolding a phrase in the middle of a sentence for emphasis more than once or
  twice per post.
- Emoji. Anywhere. Ever.

## The em-dash question

Em-dashes are the best-known AI tell, and CloudAlgo's own published posts use
them freely and well. Do not ban them and do not carpet-bomb the draft with
them. The rule: **at most one em-dash per three paragraphs**, and only where a
comma or a full stop would genuinely be worse. If a draft has one in every
paragraph, that is the model's rhythm, not the house rhythm — convert most of
them to full stops and let the sentences be short.

## The de-AI pass

Run this as a separate read, after the draft is finished. Do not do it while
writing.

1. **Read the first three sentences alone.** If they could open a post about
   any topic, cut them. Start at the specific thing. Good openers from the
   corpus: "Here's a question every Salesforce team gets asked eventually,
   usually by someone senior, usually at the worst possible moment."

2. **Check sentence-length variance.** Count words in ten consecutive
   sentences. If eight of them land between 15 and 25 words, the prose is
   machine-flat. Break three of them into fragments. Let one run to forty.

3. **Kill the summary paragraphs.** A model restates. A person moves on. Any
   paragraph that begins "In short", "To summarise", or that repeats the
   section heading in prose, gets deleted outright — not rewritten.

4. **Delete hedges that carry no information.** "It's important to note that",
   "It's worth mentioning", "generally speaking", "in many cases", "can often
   be". Say the thing or don't.

5. **Find every list and ask if it earned being a list.** Models bullet
   everything. Three bullets of one clause each are a sentence with commas.
   Keep lists for genuinely parallel, scannable items — config steps, rule
   names, comparison rows.

6. **Add one thing only a practitioner would know.** A governor limit that
   bites at an odd threshold. The reason a documented approach fails in
   practice. A number from real work. If the draft contains nothing that could
   not be assembled from documentation, it is not publishable — go back and
   find the real detail or change the topic.

7. **Read the ending.** If it summarises the post, replace it. Endings in this
   corpus land on an offer or a flat statement of fact: "In the meantime, the
   linter is there."

8. **Run the checker.** It is mechanical and it does not flatter you:

   ```bash
   node scripts/prose-check.mjs src/content/blog/<file>.md
   ```

   It catches banned vocabulary, banned paragraph openers, flat sentence
   rhythm, and em-dash density. Errors must be fixed. Warnings are advisory
   and some published posts trip them.

   The thresholds are calibrated so that all 23 posts already published here
   pass. That is deliberate: the bar is "reads like the rest of this Journal",
   not an abstract standard. **Never loosen a threshold to make a draft pass.**
   The draft is the thing that is wrong.

   To see how the corpus scores, and where a new post sits against it:

   ```bash
   node scripts/prose-check.mjs --calibrate src/content/blog/*.md
   ```

   A hit gets rewritten, not softened.

## The honesty rule

Never claim a client, a metric, a certification or an outcome that is not
already documented in `src/data/case-studies.ts` or on the site. If a post
needs a number CloudAlgo does not have, the post makes its point without one.
An invented statistic in a marketing post is the fastest way to lose the trust
the whole Journal exists to build.

The same goes for the products. OrgVitals is in preview. Pledgivo is in
preview. Say so.

## Self-check before shipping

Read the draft and answer, honestly:

- Would a Salesforce architect with ten years in learn one thing from this?
- Does it sound like the same person who wrote the OrgVitals post?
- Is there a single sentence in it that a competitor could paste into their own
  blog with a find-and-replace on the company name?

The third one is the real test. If yes, that sentence is generic. Cut it.
