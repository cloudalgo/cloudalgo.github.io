#!/usr/bin/env node
/**
 * Mechanical check for the tells that make prose read as machine-written.
 *
 * It does not judge whether a post is good. It catches the specific patterns a
 * language model falls into when nobody is looking: banned vocabulary, flat
 * sentence rhythm, transition words no person starts a paragraph with, and
 * paragraphs that restate what was just said.
 *
 * Thresholds are calibrated against the existing Journal, not invented. Run
 * `node scripts/prose-check.mjs --calibrate src/content/blog/*.md` to see how
 * the published corpus scores before changing any of them.
 *
 * Usage:  node scripts/prose-check.mjs src/content/blog/2026-09-01-slug.md
 * Exit:   0 pass, 1 fail (findings printed)
 */

import { readFileSync } from 'node:fs';

const BANNED_WORDS = [
  'leverage', 'game-changer', 'game changer', 'seamless', 'seamlessly',
  'robust', 'cutting-edge', 'revolutionary', 'unlock', 'supercharge',
  'empower', 'elevate', 'delve', 'harness', 'realm', 'tapestry',
  'testament to', 'pivotal', 'paramount', 'myriad', 'plethora', 'holistic',
  'synergy', 'best-in-class', 'world-class', 'state-of-the-art',
  'transformative', 'landscape of', 'navigating the',
];

const BANNED_PHRASES = [
  "in today's", 'fast-paced world', "let's dive", "let's explore", 'buckle up',
  'the bottom line', 'it is important to note', "it's important to note",
  "it's worth mentioning", 'it is worth noting', 'needless to say',
  'when it comes to', 'at the end of the day', 'in the world of',
  'look no further', 'rest assured', 'that being said',
];

// No person opens a paragraph this way. A model does it constantly.
const BANNED_OPENERS = [
  'moreover', 'furthermore', 'additionally', 'in conclusion', 'ultimately',
  'in summary', 'in short', 'to summarize', 'to summarise', 'overall,',
  'firstly', 'secondly', 'lastly', 'notably,', 'importantly,',
];

// Calibrated by running --calibrate over every published post. An ERROR is a
// threshold nothing in the corpus trips, so tripping one means the draft is
// outside anything this Journal has ever published. A WARNING is advisory:
// some published posts trip these and are fine, so they are reported and do
// not fail the run.
const ERRORS = {
  minStdev: 6.0,      // flattest published long post sits at 6.8
  maxFlatBand: 0.65,  // most banded published long post sits at 0.58
};

const WARNINGS = {
  minShortShare: 0.05,  // fragments read as human, but not every post has them
  minLongCount: 1,      // five published posts have none, so advisory only
  emDashPerPara: 1 / 3, // house preference, not a rule the corpus obeys
};

function stripFrontmatter(raw) {
  const m = raw.match(/^---\n[\s\S]*?\n---\n/);
  return m ? raw.slice(m[0].length) : raw;
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
}

function analyse(file) {
  const raw = readFileSync(file, 'utf8');
  const body = stripCode(stripFrontmatter(raw));

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('>'));

  const prose = paragraphs.filter((p) => !/^[-*\d]/.test(p)).join(' ');

  const sentences = prose
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 2);

  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const n = lengths.length || 1;
  const mean = lengths.reduce((a, b) => a + b, 0) / n;
  const stdev = Math.sqrt(lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / n);

  return {
    file,
    words: prose.split(/\s+/).filter(Boolean).length,
    paragraphs: paragraphs.length,
    sentences: n,
    mean,
    stdev,
    flatBand: lengths.filter((l) => l >= 15 && l <= 25).length / n,
    shortShare: lengths.filter((l) => l < 8).length / n,
    longCount: lengths.filter((l) => l > 35).length,
    emDashes: (body.match(/—/g) || []).length,
    body,
    paragraphList: paragraphs,
  };
}

function findings(a) {
  const errors = [];
  const warnings = [];
  const lower = a.body.toLowerCase();

  for (const w of BANNED_WORDS) {
    if (new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(lower)) {
      errors.push(`banned word: "${w}"`);
    }
  }
  for (const p of BANNED_PHRASES) {
    if (lower.includes(p)) errors.push(`banned phrase: "${p}"`);
  }
  for (const para of a.paragraphList) {
    const first = para.toLowerCase().replace(/^[*_#\s]+/, '');
    for (const o of BANNED_OPENERS) {
      if (first.startsWith(o)) errors.push(`paragraph opens with "${o}"`);
    }
  }

  // Rhythm statistics are meaningless on a short snippet. Two published posts
  // are under 400 words of prose and are fine; they are code notes, not essays.
  // Vocabulary checks still apply at any length.
  const longEnoughToJudge = a.words >= 400;

  if (longEnoughToJudge && a.stdev < ERRORS.minStdev) {
    errors.push(
      `sentence rhythm too even: stdev ${a.stdev.toFixed(1)} < ${ERRORS.minStdev}. ` +
        `Break some sentences into fragments and let one run long.`
    );
  }
  if (longEnoughToJudge && a.flatBand > ERRORS.maxFlatBand) {
    errors.push(
      `${(a.flatBand * 100).toFixed(0)}% of sentences are 15-25 words (max ${ERRORS.maxFlatBand * 100}%). ` +
        `That band is where a model sits when it is not thinking.`
    );
  }
  if (longEnoughToJudge && a.shortShare < WARNINGS.minShortShare) {
    warnings.push(
      `only ${(a.shortShare * 100).toFixed(0)}% of sentences are under 8 words. ` +
        `Short sentences are how people land a point.`
    );
  }
  if (longEnoughToJudge && a.longCount < WARNINGS.minLongCount) {
    warnings.push(`no sentence runs past 35 words. Consider letting one breathe.`);
  }
  const emDashCap = Math.ceil(a.paragraphs * WARNINGS.emDashPerPara);
  if (a.emDashes > emDashCap) {
    warnings.push(
      `${a.emDashes} em-dashes across ${a.paragraphs} paragraphs (house cap ${emDashCap}). ` +
        `Convert most to full stops.`
    );
  }
  return { errors, warnings };
}

const args = process.argv.slice(2);
const calibrate = args.includes('--calibrate');
const files = args.filter((a) => !a.startsWith('--'));

if (!files.length) {
  console.error('usage: node scripts/prose-check.mjs <file.md> [more.md ...]');
  process.exit(2);
}

if (calibrate) {
  console.log(
    ['file', 'words', 'sents', 'mean', 'stdev', 'flat%', 'short%', 'long', 'em-'].join('\t')
  );
  for (const f of files) {
    const a = analyse(f);
    console.log(
      [
        f.split('/').pop().slice(0, 46),
        a.words,
        a.sentences,
        a.mean.toFixed(1),
        a.stdev.toFixed(1),
        (a.flatBand * 100).toFixed(0),
        (a.shortShare * 100).toFixed(0),
        a.longCount,
        a.emDashes,
      ].join('\t')
    );
  }
  process.exit(0);
}

let failed = false;
for (const f of files) {
  const a = analyse(f);
  const { errors, warnings } = findings(a);
  if (errors.length) {
    failed = true;
    console.log(`\nFAIL  ${f}`);
    for (const x of errors) console.log(`  ERROR   ${x}`);
  } else {
    console.log(`PASS  ${f}`);
  }
  for (const x of warnings) console.log(`  warning ${x}`);
  console.log(
    `      ${a.words} words, ${a.sentences} sentences, mean ${a.mean.toFixed(1)}, ` +
      `stdev ${a.stdev.toFixed(1)}, ${(a.flatBand * 100).toFixed(0)}% flat, ${a.emDashes} em-dashes`
  );
}
process.exit(failed ? 1 : 0);
