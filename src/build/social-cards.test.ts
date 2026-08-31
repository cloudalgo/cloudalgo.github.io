import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { socialCard, CARD_WIDTH, CARD_HEIGHT } from './social-cards';

describe('socialCard', () => {
  it('names a bitmap card for an SVG hero', () => {
    expect(socialCard('/blog-images/apex-lint-hero.svg')).toBe(
      '/blog-images/apex-lint-hero-1200x630.png',
    );
  });

  it('carries the size in the name, which is where Base.astro reads it back', () => {
    const card = socialCard('/blog-images/apex-lint-hero.svg')!;
    expect(card).toContain(`-${CARD_WIDTH}x${CARD_HEIGHT}.`);
  });

  it('leaves a bitmap hero alone -- it is already a card', () => {
    expect(socialCard('/blog-images/921830-1200x600.jpg')).toBeNull();
    expect(socialCard('/og-default.jpg')).toBeNull();
  });

  it('ignores an off-site image, which we cannot draw from', () => {
    expect(socialCard('https://example.test/hero.svg')).toBeNull();
  });

  it('strips a query or hash, as the layout does', () => {
    expect(socialCard('/blog-images/hero.svg?v=2')).toBe('/blog-images/hero-1200x630.png');
    expect(socialCard('/blog-images/hero.svg#top')).toBe('/blog-images/hero-1200x630.png');
  });
});

/**
 * The card is drawn by a script and committed, not drawn during the build, so
 * the one thing that can go wrong is somebody publishing an entry and not
 * running `npm run og`. Nothing downstream would say so: the tags would point
 * at a file that is not there, and a 404 og:image is reported by no crawler.
 * So it is said here.
 */
describe('every published entry has the card its tags name', () => {
  const POSTS = 'src/content/blog';
  const entries = readdirSync(POSTS)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ file: f, md: readFileSync(join(POSTS, f), 'utf8') }))
    .filter(({ md }) => /^published:\s*true\s*$/m.test(md))
    .map(({ file, md }) => ({
      file,
      card: socialCard(/^image:\s*(\S+)\s*$/m.exec(md)?.[1] ?? ''),
    }))
    .filter((e) => e.card !== null);

  it('finds entries to check, so a broken parse cannot pass silently', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('$file', ({ card }) => {
    expect(existsSync(join('public', card!.slice(1)))).toBe(true);
  });
});
