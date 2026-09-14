#!/usr/bin/env node
/**
 * Builds the daily research brief for the topic radar.
 *
 * Two jobs, both deterministic, both deliberately taken away from the model:
 *
 *   1. RECENCY. Fetch every feed, parse each entry's real publication date, and
 *      emit only what falls inside the window. The model does not get to decide
 *      what counts as recent, because when it did it kept rediscovering the same
 *      six-month-old deprecation every morning.
 *
 *   2. REPETITION. Read the candidate issues already opened, extract what has
 *      been proposed before, and emit a burned list. Any term that has already
 *      appeared in two or more candidate sets is spent, whether or not it was
 *      ever written up.
 *
 * Usage:
 *   node scripts/radar-brief.mjs                       # 24h window, live issues
 *   node scripts/radar-brief.mjs --hours 48
 *   node scripts/radar-brief.mjs --issues-file x.json  # offline, for testing
 *   node scripts/radar-brief.mjs --no-issues           # feeds only
 */

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const argVal = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const PRIMARY_HOURS = Number(argVal('--hours', '24'));
const SECONDARY_HOURS = PRIMARY_HOURS * 3;
const BURN_DAYS = Number(argVal('--burn-days', '45'));
// One chatty feed (a monorepo publishing forty provider point-releases at once)
// will otherwise fill the whole window and crowd out everything worth writing about.
const PER_FEED_CAP = Number(argVal('--per-feed', '6'));
const REPO = argVal('--repo', 'cloudalgo/cloudalgo.github.io');

const FEEDS = JSON.parse(
  readFileSync(new URL('./radar-feeds.json', import.meta.url), 'utf8')
).feeds;

const now = Date.now();
const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&#8217;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (block, names) => {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, 'i'));
    if (m) return decode(m[1]);
    const self = block.match(new RegExp(`<${n}[^>]*href=["']([^"']+)["']`, 'i'));
    if (self) return self[1];
  }
  return '';
};

async function readFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'user-agent': 'cloudalgo-journal-radar/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { feed, error: `HTTP ${res.status}`, items: [] };
    const xml = await res.text();
    const blocks = xml.match(/<(entry|item)[\s>][\s\S]*?<\/\1>/gi) || [];
    const items = blocks
      .map((b) => {
        const dateRaw = tag(b, ['published', 'updated', 'pubDate', 'dc:date']);
        const ts = Date.parse(dateRaw);
        return {
          title: tag(b, ['title']),
          link: tag(b, ['link', 'guid', 'id']),
          date: dateRaw,
          ts: Number.isNaN(ts) ? null : ts,
          summary: tag(b, ['summary', 'description', 'content']).slice(0, 320),
        };
      })
      .filter((i) => i.title && i.ts);
    return { feed, items };
  } catch (e) {
    return { feed, error: e.message, items: [] };
  }
}

// ---------- prior candidates ----------

const STOP = new Set(`a an and are as at be been before but by can cannot come comes
did do does doesn't don't every for from get gets go goes had has have here how i if
in is it its just keep keeps know like make makes never new no not now of off on one
only or our out over own put puts said say says see should since so some still stop
stops take takes than that the their them then there these they this those to too two
under until up use used uses very want was way we were what when where which while who
why will with without you your about after again all also any because been being does
doing down first into more most nobody nothing part parts thing things time way ways
does much many need needs let lets got does isn't won't you're it's here's that's
what's does'nt yours this's`.split(/\s+/));

function terms(text) {
  const words = text
    .toLowerCase()
    .replace(/[`*_"'’“”]/g, '')
    .replace(/[^a-z0-9.\- ]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    // Version numbers carry most of the meaning here: "Postgres 15", "Valkey 7",
    // "Winter '27", "Airflow 3.3". Keeping only words longer than two characters
    // threw all of them away, which is why the most-repeated topic in the whole
    // history was not being detected.
    .filter((w) => w && !STOP.has(w) && (w.length > 2 || /^\d/.test(w)));
  const out = new Set();
  for (let i = 0; i < words.length; i++) {
    out.add(words[i]);
    if (i + 1 < words.length) out.add(`${words[i]} ${words[i + 1]}`);
  }
  return out;
}

async function priorCandidates() {
  if (args.includes('--no-issues')) return [];
  const file = argVal('--issues-file', null);
  let issues;
  if (file) {
    issues = JSON.parse(readFileSync(file, 'utf8'));
  } else {
    const headers = { accept: 'application/vnd.github+json' };
    if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/issues?labels=journal-candidates&state=all&per_page=60`,
      { headers, signal: AbortSignal.timeout(20000) }
    );
    if (!res.ok) {
      console.error(`# could not read prior issues: HTTP ${res.status}`);
      return [];
    }
    issues = await res.json();
  }
  const cutoff = now - BURN_DAYS * 864e5;
  return issues
    .filter((i) => Date.parse(i.created_at || i.createdAt) >= cutoff)
    .map((i) => ({
      number: i.number,
      created: (i.created_at || i.createdAt).slice(0, 10),
      headlines: [...(i.body || '').matchAll(/^\*\*\d\.\s*(.+?)\*\*\s*$/gm)].map((m) => m[1]),
    }));
}

// ---------- main ----------

const [feedResults, prior] = await Promise.all([
  Promise.all(FEEDS.map(readFeed)),
  priorCandidates(),
]);

const all = feedResults.flatMap((r) =>
  r.items.map((i) => ({ ...i, source: r.feed.name }))
);
function capPerFeed(items) {
  const seen = new Map();
  const kept = [];
  const dropped = new Map();
  for (const i of items) {
    const n = seen.get(i.source) || 0;
    if (n < PER_FEED_CAP) {
      kept.push(i);
      seen.set(i.source, n + 1);
    } else {
      dropped.set(i.source, (dropped.get(i.source) || 0) + 1);
    }
  }
  return { kept, dropped };
}

const primaryAll = all
  .filter((i) => now - i.ts <= PRIMARY_HOURS * 36e5)
  .sort((a, b) => b.ts - a.ts);
const secondaryAll = all
  .filter((i) => now - i.ts > PRIMARY_HOURS * 36e5 && now - i.ts <= SECONDARY_HOURS * 36e5)
  .sort((a, b) => b.ts - a.ts);

const { kept: primary, dropped: primaryDropped } = capPerFeed(primaryAll);
const { kept: secondary } = capPerFeed(secondaryAll);

// Burned terms: anything that has shown up in two or more separate candidate sets.
const freq = new Map();
for (const issue of prior) {
  const seen = new Set();
  for (const h of issue.headlines) for (const t of terms(h)) seen.add(t);
  for (const t of seen) freq.set(t, (freq.get(t) || 0) + 1);
}
const burned = [...freq.entries()]
  .filter(([t, n]) => n >= 2 && t.includes(' '))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 60);

const fmt = (i) =>
  `- [${new Date(i.ts).toISOString().slice(0, 16).replace('T', ' ')}Z] (${i.source}) ${i.title}\n  ${i.link}${i.summary ? `\n  ${i.summary}` : ''}`;

console.log(`# Radar brief — generated ${new Date().toISOString()}`);
console.log(`# Primary window: last ${PRIMARY_HOURS}h. Secondary: ${PRIMARY_HOURS}-${SECONDARY_HOURS}h.\n`);

const broken = feedResults.filter((r) => r.error);
if (broken.length) {
  console.log('## FEEDS THAT FAILED');
  for (const r of broken) console.log(`- ${r.feed.name}: ${r.error}`);
  console.log('');
}

console.log(`## NEW IN THE LAST ${PRIMARY_HOURS} HOURS (${primary.length} items)`);
console.log(primary.length ? primary.map(fmt).join('\n') : '(nothing)');
if (primaryDropped.size) {
  console.log('');
  for (const [src, n] of primaryDropped)
    console.log(`  (${n} further items from ${src} not shown, per-feed cap ${PER_FEED_CAP})`);
}
console.log('');

console.log(`## OLDER, ${PRIMARY_HOURS}-${SECONDARY_HOURS}H (${secondary.length} items) — use only if the primary window is too thin`);
console.log(secondary.length ? secondary.slice(0, 25).map(fmt).join('\n') : '(nothing)');
console.log('');

console.log(`## ALREADY PROPOSED — DO NOT PROPOSE AGAIN (${prior.length} previous candidate sets, last ${BURN_DAYS} days)`);
for (const i of prior.sort((a, b) => (a.created < b.created ? 1 : -1))) {
  console.log(`#${i.number} ${i.created}`);
  for (const h of i.headlines) console.log(`  - ${h}`);
}
console.log('');

console.log('## BURNED TERMS — proposed in two or more previous sets, treat as spent');
console.log(
  burned.length
    ? burned.map(([t, n]) => `- "${t}" (${n} sets)`).join('\n')
    : '(none yet)'
);
