/**
 * Which practice a journal entry came out of.
 *
 * Every entry on the site is a write-up of work somebody paid for, and the
 * question an entry leaves behind is "who does this, and under what name".
 * The closing band on `/blog/[slug]` answers it by naming the service and
 * linking to its page -- so the entry routes into the catalogue instead of
 * repeating the footer's ask.
 *
 * The answer is read off the entry's `category`, which every post already
 * carries, so a twenty-third entry is filed rather than wired. `OVERRIDES`
 * exists for the handful where the category is the wrong answer: an Airflow
 * write-up is filed under Heroku because that is where it runs, and a piece
 * about one of our own tools is product work whatever platform it sits on.
 *
 * `id` must name a file in `src/content/services/`; `/blog/[slug]` checks it
 * against the collection at build time and throws if it points nowhere.
 */

export interface EntryService {
  /** The service's collection id -- the link target. The title and the
      short name are read off that entry, not repeated here. */
  id: string;
  /** What we do under it, in one clause, for the band's sentence. */
  does: string;
}

const SERVICES = {
  consulting: {
    id: 'salesforce-consulting',
    does:
      'CRM customisation, Experience Cloud, custom platform development, MuleSoft '
      + 'integrations and Heroku solutions',
  },
  product: {
    id: 'product-development',
    does: 'AppExchange products, managed packages and the security review that gates them',
  },
  mulesoft: {
    id: 'mulesoft-integration',
    does:
      'one reusable API layer between Salesforce, ERP and everything else, instead of '
      + 'point-to-point links nobody can map',
  },
  aws: {
    id: 'aws-cloud-solutions',
    does:
      'the workloads that do not belong inside Salesforce — VPC and IAM as code, '
      + 'serverless processing and the analytics layer',
  },
  airflow: {
    id: 'airflow-data-pipelines',
    does:
      'Apache Airflow orchestration across Salesforce, ERP systems, databases and APIs '
      + 'at volume',
  },
  support: {
    id: 'support-and-managed-services',
    does: 'ongoing support, org health reviews and the enhancements a retainer pays for',
  },
} as const satisfies Record<string, EntryService>;

type ServiceKey = keyof typeof SERVICES;

/** The default answer, one per category in the blog schema's enum. */
const BY_CATEGORY: Record<string, ServiceKey> = {
  Salesforce: 'consulting',
  Heroku: 'consulting',
  MuleSoft: 'mulesoft',
  AWS: 'aws',
  Product: 'product',
};

/** Entries whose category is the wrong answer, by collection id. */
const OVERRIDES: Record<string, ServiceKey> = {
  /* Filed under Heroku because that is where the scheduler runs; the work
     is a data pipeline. */
  'apache-airflow-on-heroku-salesforce-data': 'airflow',
  /* A comparison, not a Heroku build -- the reader is choosing a platform. */
  'heroku-or-aws-how-to-choose': 'aws',
  /* Three write-ups of tools we built ourselves. */
  'salesforce-field-impact-analyser': 'product',
  'apex-lint-offline-apex-analysis-without-java': 'product',
  'how-healthy-is-your-salesforce-org': 'support',
};

export function getEntryService(id: string, category: string): EntryService {
  const key = OVERRIDES[id] ?? BY_CATEGORY[category];
  if (!key) {
    throw new Error(
      `/blog/${id}: category "${category}" has no service in src/data/blog-services.ts.`
    );
  }
  return SERVICES[key];
}
