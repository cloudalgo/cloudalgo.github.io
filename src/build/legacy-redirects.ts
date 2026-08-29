/** Paths from the previous site that Google still holds and still ranks.
 *
 *  None of these can be derived from anything in this repo: they are facts
 *  about what the old Jekyll site published, recoverable only from Search
 *  Console. So they are listed, with the 16-month impression count that
 *  earned each one its line, and a target that must be a page we build.
 *
 *  A 404 here is not cosmetic. It spends the ranking of every page that
 *  points at the URL and returns nothing, and Google eventually drops the
 *  URL along with the position it held.
 */

/** The oldest posts published at /blog/YYYY/MM/<full title slug>.
 *
 *  When they were imported into this repo the filenames were cut to 80
 *  characters -- three of the four still end mid-word ("-light-", "-with-n",
 *  "-in-heroku-us") -- and every redirect the config derives is built from
 *  those cut filenames. The URLs Google actually ranks are the uncut
 *  originals, so they matched nothing and served the 404 page while holding
 *  first-page positions.
 *
 *  These four were the site's search traffic: 31,682 impressions and 251
 *  clicks over 16 months, all of it landing on a 404.
 */
const TRUNCATED_BLOG = {
  // 16,336 impressions, 82 clicks, avg position 13.7
  '/blog/2023/04/a-comprehensive-guide-to-using-rest-and-soap-apis-in-salesforce-with-node-js':
    '/blog/salesforce-rest-and-soap-apis-nodejs/',
  // 11,157 impressions, 158 clicks, avg position 11.4
  '/blog/2023/01/dynamic-javascript-import-in-salesforce-lightning-web-component-light-dom-with-lwc-with-stripe':
    '/blog/loading-stripe-js-in-lwc-light-dom/',
  // 2,133 impressions, 3 clicks, avg position 33.4
  '/blog/2024/01/an-effective-method-for-launching-an-asynchronous-process-in-heroku-using-rabbitmq-from':
    '/blog/async-heroku-processes-from-salesforce-apex/',
  // 2,056 impressions, 8 clicks, avg position 25.5
  '/blog/2023/10/leveraging-apache-airflow-on-heroku-to-create-a-unified-data-ecosystem-with-salesforce':
    '/blog/apache-airflow-on-heroku-salesforce-data/',
};

/** Service pages, published both under /page/<slug> and at the root. */
const LEGACY_SERVICES = {
  '/page/salesforce-consulting': '/services/salesforce-consulting/', // 597
  '/salesforce-consulting': '/services/salesforce-consulting/', // 117
  '/page/product-development': '/services/product-development/', // 103
  '/product-development': '/services/product-development/', // 14
  '/support-and-managed-services': '/services/support-and-managed-services/', // 30
};

/** Legal pages, before they moved under /page/. */
const LEGACY_LEGAL = {
  '/privacy-policy': '/page/privacy-policy/', // 7
  '/disclaimer': '/page/disclaimer/', // 5
  // No terms page was ever rebuilt. The disclaimer is the surface that
  // carries what this one said, so it is where the URL goes.
  '/terms-of-service': '/page/disclaimer/', // 60
};

/** Category archives, under two prefixes across the old site's lifetime.
 *
 *  This site has no per-category URL -- the journal filters in the browser --
 *  so every one of these lands on the journal index. That is a weaker match
 *  than a redirect usually wants, and deliberate: the alternative is a 404.
 */
const LEGACY_CATEGORIES = Object.fromEntries(
  [
    'airflow', // 94
    'airflow-with-heroku', // 21
    'apex', // 107 + 8
    'apex-date-and-time-and-timezone', // 47
    'enum', // 15
    'heroku', // 158 + 43
    'heroku-connect', // 7
    'lwc', // 8
    'node-js', // 22 + 12
    'salesforce', // 30 + 2
    'structured-content', // 8 + 7
    'viralsweep', // 2
  ].flatMap((c) => [
    [`/category/${c}`, '/blog/'],
    [`/blog/categories/${c}`, '/blog/'],
  ]),
);

/** Author archives. The people are on the about page; the archives are gone. */
const LEGACY_AUTHORS = {
  '/authors/vikash': '/about/', // 35
  '/blog/authors/vikash': '/about/', // 23
  '/blog/authors/sandeep-kumar': '/about/', // 7
  '/authors/sandeep-kumar': '/about/',
};

/** camelCase pages, before the move to lowercase directories. */
const LEGACY_PAGES = {
  '/aboutUs': '/about/',
  '/contactUs': '/contact/',
};

export const legacyRedirects: Record<string, string> = {
  ...TRUNCATED_BLOG,
  ...LEGACY_SERVICES,
  ...LEGACY_LEGAL,
  ...LEGACY_CATEGORIES,
  ...LEGACY_AUTHORS,
  ...LEGACY_PAGES,
};
