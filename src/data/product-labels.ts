/**
 * The display names for the two enums on the products collection.
 *
 * These lived in ProductsSection.astro until the catalogue page needed
 * exactly the same strings. Two copies of a label map is how "Preview"
 * and "In preview" end up on the same site, so the map moved out here
 * and both folds read it.
 *
 * Keyed by the raw enum values in src/content.config.ts. Add a value
 * there and TypeScript will not complain here -- the record is widened
 * to `string` on purpose so a fifth status still renders (as its raw
 * key) rather than throwing at build time.
 */
export const TYPE_LABEL: Record<string, string> = {
  'salesforce-app': 'Salesforce app',
  'integration':    'Integration',
  'mobile-app':     'Mobile app',
  'desktop-app':    'Desktop app',
};

export const STATUS_LABEL: Record<string, string> = {
  ga:      'Generally available',
  preview: 'Preview',
  beta:    'Beta',
};
