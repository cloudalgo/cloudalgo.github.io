#!/usr/bin/env node
/**
 * Rasterise a hero SVG so somebody can look at it.
 *
 *   node scripts/render-svg.mjs public/blog-images/foo-hero.svg
 *   node scripts/render-svg.mjs public/blog-images/foo-hero.svg out.png
 *
 * Well-formedness and a coordinate sweep both pass on art that has a fallback
 * face colliding with its neighbour, or an ember on the wrong element. Only a
 * render says so. This exists as a script rather than a `node -e` one-liner
 * because the agent that draws these runs in CI under an allowlist, and
 * `Bash(node scripts/:*)` is a narrower grant than arbitrary `node -e`.
 */

import { basename } from 'node:path';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const [input, output] = process.argv.slice(2);

if (!input) {
  console.error('usage: node scripts/render-svg.mjs <file.svg> [out.png]');
  process.exit(1);
}

// 200 DPI against a 1200-wide viewBox, then down to 900: the type is rendered
// at better than final size, so a collision shows as a collision rather than
// as a smudge.
const out = output ?? join(tmpdir(), `${basename(input, '.svg')}.png`);

await sharp(input, { density: 200 }).resize({ width: 900 }).png().toFile(out);

console.log(out);
