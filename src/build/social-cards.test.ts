import { describe, it, expect } from 'vitest';
import { socialCard, cardHero, declaredCards, CARD_WIDTH, CARD_HEIGHT } from './social-cards';

describe('socialCard', () => {
  it('names a bitmap card for an SVG hero', () => {
    expect(socialCard('/blog-images/apex-lint-hero.svg')).toBe(
      '/blog-images/apex-lint-hero-1200x600.png',
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
    expect(socialCard('/blog-images/hero.svg?v=2')).toBe('/blog-images/hero-1200x600.png');
    expect(socialCard('/blog-images/hero.svg#top')).toBe('/blog-images/hero-1200x600.png');
  });
});

describe('cardHero', () => {
  it('round-trips with socialCard', () => {
    const hero = '/blog-images/orgvitals-hero.svg';
    expect(cardHero(socialCard(hero)!)).toBe(hero);
  });

  it('refuses a path it did not generate, rather than guessing at one', () => {
    expect(() => cardHero('/blog-images/photo.jpg')).toThrow();
  });
});

describe('declaredCards', () => {
  const page = (card: string) => `<!doctype html><html><head>
<meta property="og:image" content="https://cloudalgo.com${card}" />
<meta name="twitter:image" content="https://cloudalgo.com${card}" />
</head><body></body></html>`;

  it('finds the card a page declares, once', () => {
    expect(declaredCards(page('/blog-images/apex-lint-hero-1200x600.png'))).toEqual([
      '/blog-images/apex-lint-hero-1200x600.png',
    ]);
  });

  it('reads a root-relative reference too', () => {
    const html = '<meta property="og:image" content="/blog-images/x-1200x600.png">';
    expect(declaredCards(html)).toEqual(['/blog-images/x-1200x600.png']);
  });

  it('finds nothing on a page carrying the default card', () => {
    expect(declaredCards(page('/og-default.jpg'))).toEqual([]);
  });

  it('does not mistake another size for one of ours', () => {
    expect(declaredCards(page('/blog-images/photo-2400x1260.png'))).toEqual([]);
  });
});
