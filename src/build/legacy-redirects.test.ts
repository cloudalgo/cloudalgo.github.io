import { readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { legacyRedirects } from './legacy-redirects';

/** Resolve a redirect target to the source file that builds it, or null.
 *  Content-collection routes resolve against the collection; everything
 *  else against src/pages. */
function sourceOf(target: string): string | null {
  const blog = target.match(/^\/blog\/(.+)\/$/);
  if (blog) {
    const file = readdirSync('src/content/blog').find(
      (f) => f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '') === blog[1],
    );
    return file ? `src/content/blog/${file}` : null;
  }
  const service = target.match(/^\/services\/(.+)\/$/);
  if (service) {
    const file = `src/content/services/${service[1]}.md`;
    return existsSync(file) ? file : null;
  }
  const bare = target.replace(/^\/|\/$/g, '');
  for (const candidate of [`src/pages/${bare}.astro`, `src/pages/${bare}/index.astro`]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

describe('legacyRedirects', () => {
  it('sends every URL to a page this site actually builds', () => {
    const broken = Object.entries(legacyRedirects)
      .filter(([, target]) => sourceOf(target) === null)
      .map(([from, to]) => `${from} -> ${to}`);
    expect(broken).toEqual([]);
  });

  it('states targets as directories, the way this site is served', () => {
    const bad = Object.values(legacyRedirects).filter((t) => !/^\/.*\/$/.test(t));
    expect(bad).toEqual([]);
  });

  it('never redirects a URL that is itself a redirect target', () => {
    const targets = new Set(Object.values(legacyRedirects));
    const loops = Object.keys(legacyRedirects).filter((k) => targets.has(`${k}/`) || targets.has(k));
    expect(loops).toEqual([]);
  });

  /** The four the 80-character filename truncation orphaned. Between them they
   *  held 31,682 impressions and 251 clicks while serving a 404, so each one is
   *  pinned here: a typo in these strings is silent everywhere else. */
  it.each([
    [
      '/blog/2023/04/a-comprehensive-guide-to-using-rest-and-soap-apis-in-salesforce-with-node-js',
      '/blog/salesforce-rest-and-soap-apis-nodejs/',
    ],
    [
      '/blog/2023/01/dynamic-javascript-import-in-salesforce-lightning-web-component-light-dom-with-lwc-with-stripe',
      '/blog/loading-stripe-js-in-lwc-light-dom/',
    ],
    [
      '/blog/2024/01/an-effective-method-for-launching-an-asynchronous-process-in-heroku-using-rabbitmq-from',
      '/blog/async-heroku-processes-from-salesforce-apex/',
    ],
    [
      '/blog/2023/10/leveraging-apache-airflow-on-heroku-to-create-a-unified-data-ecosystem-with-salesforce',
      '/blog/apache-airflow-on-heroku-salesforce-data/',
    ],
  ])('recovers the uncut original %s', (from, to) => {
    expect(legacyRedirects[from]).toBe(to);
  });

  it('keeps the uncut originals distinct from the cut slugs the config derives', () => {
    const cut = '/blog/2023/04/a-comprehensive-guide-to-using-rest-and-soap-apis-in-salesforce-with-n';
    expect(legacyRedirects).not.toHaveProperty(cut);
    expect(Object.keys(legacyRedirects).some((k) => k.startsWith(cut))).toBe(true);
  });
});
