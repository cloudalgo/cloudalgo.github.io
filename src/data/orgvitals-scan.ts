/**
 * The one OrgVitals scan the site quotes, and the weights that produced
 * its grade.
 *
 * Both the home page's featured fold and the catalogue's entry 01 print
 * these numbers, and they have to be the same numbers: a grade of C on
 * one page and a B on the other is the kind of thing a reader notices
 * and nobody catches. So they are stated once here rather than typed
 * into two components.
 *
 * The figures are read off `/products/orgvitals/guide/posters/
 * scan-run.mp4 (and the 08-dashboard capture it was cut from)` -- the screenshot printed beside them. If that
 * poster is ever re-shot, these move with it in the same commit, or the
 * page starts captioning one scan with another scan's grade.
 *
 * The weights are quoted from the product's own feature copy in
 * `src/content/products/orgvitals.md` ("An A-F Health Grade"), and are
 * the reason the grade is a measurement rather than an opinion.
 */

export interface Severity {
  /** Printed as given -- these are counts, not values to format. */
  count: string;
  label: string;
}

export const SCAN = {
  grade: 'C',
  score: '69/100',
  state: 'Needs attention',
  date: 'Jun 25, 2026',
  scanners: 49,
  /** Critical first: the order the reader triages in. */
  severities: [
    { count: '2', label: 'Critical' },
    { count: '8', label: 'High' },
    { count: '3', label: 'Med' },
    { count: '3', label: 'Low' },
  ] satisfies Severity[],
} as const;

/** Category and its share of the overall grade. Sums to 100. */
export const WEIGHTS: Array<readonly [string, number]> = [
  ['Security', 30],
  ['Code quality', 20],
  ['Automation', 20],
  ['Tech debt', 20],
  ['Performance', 10],
];
