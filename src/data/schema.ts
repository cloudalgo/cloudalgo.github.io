// src/data/schema.ts
//
// The structured-data facts about CloudAlgo, stated once.
//
// Before this file the Organization node was retyped in full on the home
// page, on every product page, on every service page, on every case study
// and on every journal post -- twenty-nine copies, of which the home page's
// was the only one carrying `sameAs`, and none of which carried an address
// or a phone number. Search engines resolve an entity by reconciling those
// copies; twenty-nine partial ones reconcile worse than a single complete
// one referenced by `@id`.
//
// Everything here is stated somewhere on the site in words a reader can
// check -- the colophon carries the phone number and the city, /about/
// carries the founding year. Nothing is asserted to a crawler that is not
// also asserted to a person.

export const SITE = 'https://cloudalgo.com';

/** Stable node identifiers. A page refers to the organisation by `@id`
 *  rather than restating it, so all of them describe one entity. */
export const ORG_ID = `${SITE}/#organization`;
export const SITE_ID = `${SITE}/#website`;

/** The organisation, in full. Emitted once per page graph; everything else
 *  points at it. */
export const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'CloudAlgo',
  url: `${SITE}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE}/#logo`,
    url: `${SITE}/logo.svg`,
    contentUrl: `${SITE}/logo.svg`,
  },
  image: { '@id': `${SITE}/#logo` },
  foundingDate: '2019',
  description:
    'A Salesforce Consulting Partner since 2019, building on Salesforce, MuleSoft and Heroku from a bench in Jaipur.',
  email: 'sales@cloudalgo.com',
  telephone: '+91-6377-360659',
  // No street line: the colophon says "Jaipur, India" and the contact slip
  // says "Jaipur, Rajasthan, India", so that is what is claimed here. A
  // postal address nobody publishes is a postal address nobody can verify.
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'sales@cloudalgo.com',
    telephone: '+91-6377-360659',
    areaServed: 'Worldwide',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.linkedin.com/company/cloudalgo',
    'https://github.com/cloudalgo',
    'https://twitter.com/cloudalgo',
  ],
  knowsAbout: [
    'Salesforce',
    'Salesforce AppExchange',
    'Heroku',
    'MuleSoft',
    'Amazon Web Services',
    'Apache Airflow',
    'CRM Consulting',
    'System Integration',
  ],
  areaServed: 'Worldwide',
};

/** The site itself. Distinct from the organisation that runs it: one is a
 *  company, the other is a set of pages, and conflating them is why a lot
 *  of sites resolve to no entity at all. */
export const website = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${SITE}/`,
  name: 'CloudAlgo',
  description:
    'Salesforce, MuleSoft, Heroku and AWS consulting, and the four products built from the same bench.',
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
};

/** A short reference to the organisation, for `publisher` / `provider`
 *  slots on pages that already emit the full node elsewhere in the graph. */
export const orgRef = { '@id': ORG_ID };

export interface Crumb {
  label: string;
  /** Absolute path with a trailing slash. Omitted on the current page --
   *  the last crumb is where the reader already is, so it needs no URL. */
  href?: string;
}

/**
 * A BreadcrumbList matching the crumbs the page actually renders.
 *
 * Google requires the trail to agree with the visible one; a schema trail
 * invented for the crawler is the kind of mismatch that gets the whole
 * rich result dropped, so every caller passes the same array it renders.
 */
export function breadcrumbs(crumbs: Crumb[], pageUrl?: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': pageUrl ? `${pageUrl}#breadcrumb` : undefined,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href.startsWith('http') ? c.href : `${SITE}${c.href}` } : {}),
    })),
  };
}

/** An absolute, trailing-slashed URL for a site path. */
export const abs = (path: string) => new URL(path, `${SITE}/`).href;
