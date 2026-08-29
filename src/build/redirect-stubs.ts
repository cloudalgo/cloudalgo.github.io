/**
 * Astro generates a static page for every entry in `redirects`, and hardcodes
 * a `noindex` into it (astro/dist/core/routing/3xx.js). On this site that tag
 * is actively harmful, and the reason is worth stating in full.
 *
 * A generated stub carries three instructions at once:
 *
 *     <meta http-equiv="refresh" content="0;url=/blog/new-slug/">
 *     <meta name="robots" content="noindex">
 *     <link rel="canonical" href="https://cloudalgo.com/blog/new-slug/">
 *
 * The canonical asks Google to index the target and move this URL's accumulated
 * ranking onto it. The `noindex` asks Google to drop this URL. Google resolves
 * that contradiction in favour of `noindex` and its redirect guidance says not
 * to put one on a redirecting URL: the old address falls out of the index
 * without handing anything to the new one.
 *
 * That is not academic here. When the journal dropped its `YYYY-MM-DD-` slug
 * prefixes, every blog post Google ranked -- 26 URLs, ~2,000 impressions a
 * quarter at positions 7-12 -- became one of these stubs. All of the journal's
 * organic visibility is sitting on pages this tag tells Google to forget.
 *
 * GitHub Pages serves static files and cannot issue a 301, so a zero-delay
 * meta refresh plus a canonical is the strongest signal available. Both are
 * left exactly as Astro wrote them; only the `noindex` comes out.
 */

/** Verbatim from Astro's redirect template. A page of ours never matches it:
 *  Base.astro writes `index, follow` or `noindex, follow`, never a bare value. */
const STUB_ROBOTS = '<meta name="robots" content="noindex">';

const HAS_REFRESH = /<meta\s+http-equiv="refresh"/i;

/**
 * Strip the `noindex` from one generated redirect stub.
 *
 * Returns the rewritten HTML, or `null` when the input is not a stub that
 * needs rewriting -- which is every real page on the site. The caller uses
 * `null` to decide not to write the file back, so an unrelated page is never
 * rewritten even byte-identically.
 */
export function unblockRedirectStub(html: string): string | null {
  if (!HAS_REFRESH.test(html)) return null;
  if (!html.includes(STUB_ROBOTS)) return null;
  const out = html.replace(`${STUB_ROBOTS}\n`, '').replace(STUB_ROBOTS, '');
  return out === html ? null : out;
}
