/**
 * Drawn plates for the entries that have no image of their own.
 *
 * Every row in the /blog/ archive carries a plate. Sixteen of them are
 * the entry's own hero art; the rest are the newest entries -- the
 * MuleSoft and Heroku write-ups, including all three that a case study
 * sits behind -- and those files carry no `image`. A hole in the plate
 * column at the TOP of the archive would put the weakest rows next to
 * the strongest pictures, so each of those gets the integration it is
 * about, drawn: the systems either side, and the direction the data
 * moves between them.
 *
 * These pairs are the one thing on the page not read off the content
 * files: they are our reading of each entry's title, confirmed by
 * Sandeep before the page shipped. A post that adds an `image` stops
 * using its entry here; a post with neither fails the build, in
 * `ArchivePlate.astro`, rather than shipping an empty cell.
 */

/** How the data moves: one way, both ways, or not at all (a comparison). */
export type PlateLink = 'to' | 'both' | 'versus';

export interface Plate {
  /** Two or three systems, left to right. Two or three characters each. */
  systems: string[];
  link: PlateLink;
}

export const BLOG_PLATES: Record<string, Plate> = {
  'when-your-emr-has-no-api': { systems: ['EMR', 'SF'], link: 'to' },
  'health-portal-mulesoft-integration': { systems: ['HP', 'MS', 'SF'], link: 'to' },
  'salesforce-netsuite-mulesoft-integration': { systems: ['SF', 'NS'], link: 'both' },
  'salesforce-heroku-architecture-patterns': { systems: ['SF', 'HK'], link: 'both' },
  'heroku-or-aws-how-to-choose': { systems: ['HK', 'AWS'], link: 'versus' },
  'heroku-connect-at-scale-what-goes-wrong': { systems: ['SF', 'PG'], link: 'both' },
};

/**
 * What each code stands for, spelled out.
 *
 * The plate itself is two or three characters wide, so the boxes are
 * abbreviated; the caption under the enlarged plate on `/blog/[slug]` is
 * a sentence, and a sentence says Salesforce.
 */
const SYSTEM_NAMES: Record<string, string> = {
  EMR: 'the EMR',
  SF: 'Salesforce',
  HP: 'the health portal',
  MS: 'MuleSoft',
  NS: 'NetSuite',
  HK: 'Heroku',
  AWS: 'AWS',
  PG: 'Postgres',
};

/**
 * The caption for an enlarged plate: what the drawing shows, in words.
 *
 * The SVG is `aria-hidden` and this is its description, so the diagram is
 * read once rather than announced twice.
 */
export function plateCaption(plate: Plate): string {
  const names = plate.systems.map((s) => SYSTEM_NAMES[s] ?? s);
  if (plate.link === 'versus') {
    return `The choice this entry is about — ${names.join(' or ')}`;
  }
  const last = names[names.length - 1];
  const shape =
    plate.link === 'both'
      ? `both ways, ${names.slice(0, -1).join(', ')} and ${last}`
      : `one way, ${names.join(' to ')}`;
  return `The integration this entry describes — ${shape}`;
}
