#!/usr/bin/env node
/**
 * Draw the social card for every Journal entry headed by an SVG hero.
 *
 *   npm run og                 # every published entry
 *   npm run og -- <file.md>    # just these
 *
 * Why a script and not a build step. The card is a composition -- headline,
 * standfirst, category, date, a slice of the entry's own diagram -- and a
 * composition is something you look at before you ship it. Committing the PNG
 * means the thing a crawler fetches is the thing somebody approved, and it
 * means the build has no browser and no font-substitution risk in it.
 *
 * The cost is that a new entry needs the script run. That is checked, not
 * trusted: src/build/social-cards.test.ts fails when a published entry names
 * an SVG hero whose card is not committed.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { socialCard, CARD_WIDTH, CARD_HEIGHT } from '../src/build/social-cards.ts';
import { cardTree, palette, fonts, markSvg, ART, MARK_HEIGHT } from '../src/build/og-card.ts';

const POSTS = 'src/content/blog';
const PUBLIC = 'public';

/**
 * The handful of frontmatter keys a card needs, not a YAML implementation.
 * Every value in this collection is a scalar on one line; anything else is a
 * schema change, and should stop here rather than be half-parsed.
 */
function frontmatter(md, file) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  if (!block) throw new Error(`${file} has no frontmatter block`);
  const out = {};
  for (const line of block[1].split(/\r?\n/)) {
    const hit = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!hit) continue;
    let value = hit[2].trim();
    if (/^"(.*)"$/s.test(value)) value = value.slice(1, -1);
    else if (/^'(.*)'$/s.test(value)) value = value.slice(1, -1);
    out[hit[1]] = value;
  }
  return out;
}

/** Cut to the last whole word inside `limit`, rather than mid-syllable. */
function clip(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const day = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

async function dataUri(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/** How far left of the ideal cut we look for a gutter, and how wide one must be. */
const GUTTER_SEARCH = 200;
const MIN_GUTTER = 8;

/**
 * A slice of the hero, sized for the card's right column.
 *
 * Cropped rather than shrunk: a 1200x600 diagram fitted whole into a 456px
 * column is a grey smear, while a slice of it at nearly full size still reads
 * as a real diagram, which is the only thing the card asks it to say.
 *
 * Where the cut falls is measured, not fixed. These heroes are two panels
 * with a gutter between them, and a cut computed from the column's aspect
 * alone lands a few pixels inside the second panel -- which on the card looks
 * exactly like what it is, a sliver of something the reader cannot see. So
 * the ideal cut is nudged to the nearest fully-background column within
 * GUTTER_SEARCH. A drawing with no such column is cut where the arithmetic
 * said, which is no worse than not looking.
 */
async function slice(hero) {
  const png = await sharp(hero, { density: 192 }).png().toBuffer();
  const { width, height } = await sharp(png).metadata();
  const want = Math.round(height * (ART.width / ART.height));
  if (width <= want) return png;

  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  // How un-uniform a column is: the number of rows that differ from the pixel
  // at the top of it. A column running down a gutter or a margin scores 0; one
  // running through a diagram scores in the hundreds.
  const noise = (x) => {
    const top = (x * ch);
    let n = 0;
    for (let y = 1; y < height; y += 1) {
      const i = (y * width + x) * ch;
      if (
        Math.abs(data[i] - data[top]) > 4
        || Math.abs(data[i + 1] - data[top + 1]) > 4
        || Math.abs(data[i + 2] - data[top + 2]) > 4
      ) n += 1;
    }
    return n;
  };

  // A gutter is a RUN of uniform columns, and that is what makes it a gutter
  // rather than a lucky gap between two letters -- which is why the cut is not
  // simply the quietest single column. The widest run at or left of the ideal
  // cut wins, and the cut lands in the middle of it.
  let run = 0;
  let cut = want;
  let widest = 0;
  for (let x = Math.max(1, want - GUTTER_SEARCH); x <= want; x += 1) {
    run = noise(x) === 0 ? run + 1 : 0;
    if (run > widest) {
      widest = run;
      cut = x - Math.floor(run / 2);
    }
  }
  if (widest < MIN_GUTTER) cut = want;

  return sharp(png)
    .extract({ left: 0, top: 0, width: cut, height })
    .resize(ART.width * 2, ART.height * 2, { fit: 'cover', position: 'left top' })
    .png()
    .toBuffer();
}

async function main() {
  const picked = process.argv.slice(2).map((a) => basename(a));
  const files = (await readdir(POSTS))
    .filter((f) => f.endsWith('.md'))
    .filter((f) => picked.length === 0 || picked.includes(f));

  if (picked.length && files.length !== picked.length) {
    throw new Error(`Not in ${POSTS}: ${picked.filter((p) => !files.includes(p)).join(', ')}`);
  }

  const colours = palette();

  // The wordmark, once. Rendered at 2x and placed at 1x, because everything
  // here is supersampled on the way out.
  const markPng = await sharp(Buffer.from(markSvg()), { density: 600 })
    .resize({ height: MARK_HEIGHT * 2 })
    .png()
    .toBuffer();
  const markWidth = Math.round((await sharp(markPng).metadata()).width / 2);
  const mark = await dataUri(markPng);

  let drawn = 0;
  for (const file of files) {
    const post = frontmatter(await readFile(join(POSTS, file), 'utf8'), file);
    if (post.published !== 'true') continue;

    const card = post.image ? socialCard(post.image) : null;
    if (!card) continue;

    const art = await dataUri(await slice(join(PUBLIC, post.image.slice(1))));

    const svg = await satori(
      cardTree(
        {
          category: post.category,
          title: post.title,
          standfirst: post.seoDescription || clip(post.excerpt ?? '', 170),
          meta: `${day.format(new Date(`${post.date}T00:00:00Z`))} · ${post.readTime} min read`,
          art,
          mark,
          markWidth,
        },
        colours,
      ),
      { width: CARD_WIDTH, height: CARD_HEIGHT, fonts },
    );

    const out = join(PUBLIC, card.slice(1));
    await writeFile(
      out,
      await sharp(Buffer.from(svg), { density: 144 })
        .resize(CARD_WIDTH, CARD_HEIGHT)
        .png({ compressionLevel: 9 })
        .toBuffer(),
    );
    console.log(`${out}  <-  ${file}`);
    drawn += 1;
  }

  console.log(`\n${drawn} social ${drawn === 1 ? 'card' : 'cards'} drawn.`);
}

await main();
