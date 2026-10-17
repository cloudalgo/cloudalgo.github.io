// Counts in words, kept apart from listing.ts so tests can import it without astro:content.
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** A count in words, as the site's copy writes it: "four", or "Four" at the start of a sentence. */
export function countWord(n: number, capital = false): string {
  const w = WORDS[n] ?? String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
