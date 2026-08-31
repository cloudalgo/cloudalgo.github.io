/**
 * A social card for the entries whose hero is a drawing.
 *
 * Every crawler that renders a card fetches `og:image` as a bitmap, and none
 * of them rasterise SVG. Five journal entries are headed by a drawing, so all
 * five shipped the site's generic card: share the Airflow entry anywhere and
 * the preview showed the CloudAlgo plate, not the entry's own artwork.
 *
 * The fix is to draw the bitmap rather than to fall back. Each `foo.svg` hero
 * gets a `foo-1200x600.png` rendered from it at build time, and that is what
 * the card names. The `-WIDTHxHEIGHT` in the filename is not decoration: it is
 * the convention the rest of the blog's assets already follow, and Base.astro
 * reads it back out to declare `og:image:width` and `og:image:height`.
 *
 * The naming lives here, alone, because two places have to agree on it: the
 * layout that writes the tag, and the build pass that draws the file. If they
 * disagree the card is a 404, which no crawler reports and no build catches.
 */

/** Every hero is authored at this size; the card is drawn 1:1 from it. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 600;

const CARD_SUFFIX = `-${CARD_WIDTH}x${CARD_HEIGHT}.png`;

/** Local `.svg`, ignoring a query or hash the way Base.astro's own test does. */
const LOCAL_SVG = /^\/([^?#]*)\.svg(?:[?#].*)?$/i;

/**
 * The card drawn from an SVG hero, or `null` for anything that is already a
 * bitmap, is off-site, or is not a path we generate from.
 */
export function socialCard(image: string): string | null {
  const match = LOCAL_SVG.exec(image);
  return match ? `/${match[1]}${CARD_SUFFIX}` : null;
}

/** The hero a card was drawn from -- the inverse of `socialCard`. */
export function cardHero(card: string): string {
  if (!card.endsWith(CARD_SUFFIX)) {
    throw new Error(`${card} is not a generated social card`);
  }
  return `${card.slice(0, -CARD_SUFFIX.length)}.svg`;
}

/**
 * Every card one built page names, as site-root paths.
 *
 * Read out of the emitted HTML rather than from the content collection, so
 * what gets drawn is exactly what got declared. The host is optional in the
 * match: `og:image` is absolute, but nothing should depend on that here.
 */
const DECLARED = new RegExp(
  `["'](?:https?://[^"'/]+)?(/[^"']*${CARD_SUFFIX.replace('.', '\\.')})["']`,
  'gi',
);

export function declaredCards(html: string): string[] {
  return [...new Set([...html.matchAll(DECLARED)].map((m) => m[1]))];
}
