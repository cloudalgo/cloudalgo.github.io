/**
 * What a Journal entry's social card is CALLED.
 *
 * Every crawler that renders a card fetches `og:image` as a bitmap, and none
 * of them rasterise SVG. Five entries are headed by a drawing, so all five
 * shipped the site's generic card: share the Airflow entry anywhere and the
 * preview showed the CloudAlgo plate, not the entry's own work.
 *
 * So each `foo.svg` hero has a `foo-1200x630.png` card drawn beside it by
 * `npm run og` -- see src/build/og-card.ts for what is on it -- and that is
 * what the tags name. The `-WIDTHxHEIGHT` is not decoration: it is the
 * convention the rest of the blog's assets already follow, and Base.astro
 * reads it back out to declare `og:image:width` and `og:image:height`.
 *
 * The naming lives here, alone, because three places have to agree on it: the
 * layout that writes the tag, the blog route that reuses the card as the
 * Article image, and the script that draws the file. If they disagree the card
 * is a 404, which no crawler reports and no build catches -- so the test
 * beside this file walks the collection and checks the files are there.
 */

/** 1200x630 is the size every crawler documents, and the size the card is drawn at. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

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
