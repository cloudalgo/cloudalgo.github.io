---
name: cloudalgo-linkedin-post
description: Write the LinkedIn company-page post that distributes a CloudAlgo Journal entry. Use when drafting LinkedIn copy, social distribution, or a promotional post for a new blog article.
---

# LinkedIn post for a Journal entry

One post per published entry, on the CloudAlgo company page
(`linkedin.com/company/cloudalgo`). The post is not a summary of the blog. It
is the single most useful thing in the blog, given away, with the link for the
rest.

## Shape

```
<Hook — one line, under 12 words, no wind-up.>

<2–4 short paragraphs. The actual finding, with the specific detail in it.>

<One line that opens the door, not a demand.>

<link>

<3–5 hashtags>
```

Hard limits: **under 180 words**, and the first 140 characters have to carry
the post on their own, because that is all LinkedIn shows before "…see more".
Line breaks between every paragraph. LinkedIn renders no markdown — no bold, no
headers, no bullets with `-`. Use a line break where you want emphasis.

## The hook

The first line decides whether anything else gets read. It should be a
concrete claim, an admission, or a question a practitioner has actually asked.

Works:
- "Heroku Connect stops being magic at about 40 million rows."
- "We gave away the tool that shows people everything wrong with their org."
- "Nobody can tell you how healthy a Salesforce org is until it breaks on a Friday."

Does not work:
- "🚀 Excited to share our latest blog post!"
- "In today's fast-moving Salesforce landscape…"
- "Check out our new article on integration patterns."

Never open with "Excited to announce", "Thrilled to share", "Proud to", or any
emoji. See `cloudalgo-voice` for the full banned list — it applies here in
full.

## The body

Give away the finding. A reader who takes the insight and never clicks is a
fine outcome; a reader who clicks because the post was vague is not. Include
one specific thing — a number, an API name, an error, a limit. That is what
gets reshared.

Keep CloudAlgo's voice: first person plural, mildly skeptical, comfortable
saying what didn't work.

## The close

Soft. "Full write-up here if you want the detail." / "We wrote up how we did
it." Not "Read more!", not "Click the link below!", not "DM us to learn how we
can transform your org."

## Link placement

Put the URL in the post body, on its own line at the end. LinkedIn's reach
penalty for outbound links is real but modest, and burying the link in the
first comment costs more clicks than it saves. Use the canonical URL:
`https://cloudalgo.com/blog/<slug>/`

## Hashtags

Three to five, at the end, lowercase-camel. Draw from: `#Salesforce`
`#Heroku` `#MuleSoft` `#Apex` `#SalesforceDeveloper` `#SalesforceAdmin`
`#Integration` `#AWS` `#DataEngineering` `#Nonprofit`. Match the post's
category. Do not invent branded hashtags.

## Image

Attach the post's hero SVG rendered to PNG at 1200×627, or the short video if
one was made. LinkedIn does not render SVG:

```bash
npx --yes sharp-cli -i public/blog-images/<slug>-hero.svg -o /tmp/<slug>-li.png resize 1200 627
```

If `sharp-cli` is unavailable, `rsvg-convert -w 1200 -h 627` or a headless
Chromium screenshot both work.

## Timing

Best engagement for a US and Europe B2B audience is Tuesday to Thursday,
roughly 08:00–10:00 in the reader's local morning. For a US-and-Europe split,
13:00–15:00 IST covers Europe's morning and the US East Coast's early hours.

## Before it goes out

- Under 180 words, first 140 characters stand alone
- No emoji, no "excited to share", no markdown
- The specific detail is actually in the post, not just teased
- The link resolves and the post is live
- Nothing claims a client, metric or outcome not on the site
