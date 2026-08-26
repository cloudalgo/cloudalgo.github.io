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
