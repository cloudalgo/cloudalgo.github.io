# The Journal content pipeline

A daily research-and-publish loop that runs entirely in GitHub Actions. It
needs no laptop, no Claude session open, and no machine of ours online.

## How it runs

```
02:30 UTC weekdays          journal-radar.yml
  research the week's changes
  dedupe against src/content/blog/
  open an issue: "Journal candidates — 2026-09-01"   (labelled journal-candidates)
        │
        │   a human comments  /write 3
        ▼
                            journal-write.yml
  write candidate 3, generate hero SVG
  npm run build            ← gate; nothing ships if this fails
  commit + push to main    ← as the Claude GitHub App
  comment back: live URL + LinkedIn draft, close the issue
        │
        ▼
                            deploy.yml   (already existed)
  build + publish to GitHub Pages
```

Two properties worth keeping:

- **Nothing publishes without a human.** The radar opens an issue and stops. If
  nobody comments, the day passes with nothing written. That is the correct
  outcome, not a failure.
- **The build is the gate.** `journal-write.yml` runs `npm run build` before it
  commits. A schema violation in the frontmatter fails there, not on the live
  site.

## One-time setup

1. **Install the Claude GitHub App** on `cloudalgo/cloudalgo.github.io`:
   https://github.com/apps/claude

2. **Add the authentication token.** Generate a long-lived token against the
   Claude subscription:

   ```bash
   npm install -g @anthropic-ai/claude-code   # if not already installed
   claude setup-token
   ```

   Add the printed token as a repository secret named
   `CLAUDE_CODE_OAUTH_TOKEN`, under Settings → Secrets and variables →
   Actions → New repository secret.

   The token is tied to the subscription of whoever ran `claude setup-token`.
   To move the pipeline onto company-owned API billing later, create a key at
   https://platform.claude.com, store it as `ANTHROPIC_API_KEY`, and change the
   `claude_code_oauth_token:` line in both workflows to
   `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`.

3. **Create the label** the two workflows agree on:

   ```bash
   gh label create journal-candidates \
     --description "Daily blog topic candidates awaiting a pick" \
     --color 0E8A16
   ```

4. **Check Actions permissions.** Settings → Actions → General → Workflow
   permissions must be "Read and write permissions".

Then trigger a first run by hand rather than waiting for the cron:

```bash
gh workflow run journal-radar.yml
```

## Operating it

You get an issue each weekday morning with five candidates. Comment `/write 3`
on the one you want. Anything else you type in the comment is ignored, so
`/write 3 — this one, the SOQL angle is better` works fine.

Only accounts with write access to the repository can trigger a publish. The
workflow checks `author_association`, so a comment from a stranger on a public
issue does nothing.

To skip a day, do nothing. To kill a candidate set, close the issue.

## Why it is built this way

**Why the push must not use `GITHUB_TOKEN`.** GitHub deliberately does not fire
workflows on commits made with the default token, to stop workflows triggering
each other forever. If `journal-write.yml` pushed with `GITHUB_TOKEN`, the push
would land on `main` and `deploy.yml` would never run, so the post would sit in
the repository and never reach the site. Omitting the `github_token` input makes
the action authenticate as the Claude GitHub App instead, whose pushes do
trigger workflows. **Do not add a `github_token` input to
`journal-write.yml`.** It looks like a tightening and it silently breaks
deployment.

**Why the research pulls feeds with curl.** Web search tools are not reliably
available to the action, and a daily job should not depend on a tool that might
be switched off. The feed list in `journal-radar.yml` is the dependable path;
web search is used as well when it happens to work. Edit the feed list there as
the sources change.

**Why the skills live in `.claude/skills/`.** The action checks the repository
out before running, so the five skills are on the runner and the prompts point
at them by path. Editing a skill changes tomorrow's output with no workflow
change. The prompts deliberately reference the files by path rather than
invoking `/skill-name`, so they keep working regardless of how skill resolution
behaves in the action.

## Cost

One radar run and one write run per weekday. `--max-turns` caps each (40 and
60) and both jobs carry a timeout. The radar runs even on days nobody picks a
candidate, so the floor is about 20 radar runs a month.

## Changing the schedule

The cron in `journal-radar.yml` is UTC. 02:30 UTC is 08:00 IST. If you move it,
remember GitHub runs scheduled workflows only from the default branch, and
disables the schedule after 60 days without repository activity on a public
repository.

## When something breaks

Scheduled runs fail quietly. Check Actions → Journal topic radar for a run of
red. The usual causes:

- `CLAUDE_CODE_OAUTH_TOKEN` missing or expired
- the `journal-candidates` label deleted, so `gh issue create` fails
- a feed URL moved, which shows up as a thin or repetitive candidate list
  rather than a hard failure
- a post published but not live, which is nearly always `deploy.yml` not having
  fired, which is nearly always someone having added a `github_token` input

## Still manual

Posting to LinkedIn. `journal-write.yml` writes the post copy and puts it in the
issue comment, ready to paste. Once the Community Management API access is
approved, that step can move into the workflow with the LinkedIn credentials as
repository secrets.
