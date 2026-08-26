/**
 * The editorial copy for /products/[slug] — one entry per product.
 *
 * The collection files in src/content/products carry the FACTS: version,
 * features, spec rows, prerequisites, prices, screenshots. This file
 * carries the ARGUMENT the detail page makes out of them — the headline,
 * the boundary claim, the transit diagram, and the heading and note over
 * each fold. Two different jobs, so two different files: an edit to the
 * spec sheet should never require touching a headline, and a rewrite of
 * the headline should never risk the spec.
 *
 * The through-line, and the reason the page opens on `.transit`: every
 * product in the catalogue moves data along a path and makes a claim
 * about a boundary it never crosses. OrgVitals never writes back to the
 * org. Pledgivo never lets a card number reach Apex. AlgoBridge never
 * runs a record through our infrastructure. InsureAlgo never leaves the
 * handset. That claim was buried in body prose nobody reads; here it is
 * the first thing on the page.
 *
 * Keyed by the collection id (the .md filename), so a fifth product
 * fails the build with a named error rather than rendering a page with
 * no headline.
 */

/** A terminus of the transit diagram: where the data comes from, or the
    one place it is allowed to go. */
export interface Port {
  /** The mono eyebrow: Source, Sink, Optional. */
  label: string;
  name: string;
  note: string;
}

export interface Stage {
  name: string;
  what: string;
}

export interface Transit {
  source: Port;
  /** The word on the inbound rule. */
  inTag: string;
  /** The named boundary the stages sit inside. */
  estate: string;
  stages: Stage[];
  /** Omitted for a product where nothing leaves the boundary at all. */
  out?: Port & {
    tag: string;
    /** True where the outbound leg is opt-in and off until switched on;
        the rule is drawn dashed to say so. */
    dashed?: boolean;
  };
}

export interface Fold {
  title: string;
  note: string;
}

/** The folds a product page can carry. `transit`, `cap`, `terms` and
    `colophon` always render; the other three are gated on the data
    behind them, and their copy is simply absent where the fold is. */
export interface Folds {
  transit: Fold;
  cap: Fold;
  /** Screenshots or a video. Absent on a product with neither. */
  viewer?: Fold;
  /** The techStack readout. Absent where there is no techStack. */
  readout?: Fold;
  terms: Fold;
  /** The roadmap. Absent where there is none. */
  ahead?: Fold;
  colophon: Fold;
}

export interface ProductPage {
  /** The masthead headline. `mark` must be a verbatim substring of it —
      the page asserts that at build time rather than silently shipping a
      headline with no emphasis. */
  headline: string;
  mark: string;
  /** The standfirst. Rendered as HTML so a name that belongs in mono --
      `sf`, a namespace, an object API name -- can carry a <code>. */
  lede: string;
  /** How this product is named in ANOTHER product's colophon. The
      tagline is too long to be a link, and a link that runs to three
      lines is a paragraph. */
  short: string;
  /** The boundary claim, set above the body prose. One sentence. */
  claim: string;
  transit: Transit;
  /** Release facts for the masthead stand, after Version and Released,
      which are read off the collection file. */
  facts: { term: string; detail: string }[];
  /** Labels for the two head buttons. `primary` points at externalUrl,
      `secondary` at guideUrl; neither is printed without its target. */
  cta: { primary: string; secondary?: string };
  /** Labels for the colophon's first column. Shorter than the head's,
      because by then the reader knows what the product is. */
  links: { external: string; guide?: string };
  /** The price panel. The figure is the headline number; the tiers under
      it come from the collection file's `pricing`. */
  price: { figure: string; gloss: string };
  folds: Folds;
  /** The closing band. `emphasis` is set in italic after `ask`. */
  band: { ask: string; emphasis: string; note: string };
}

export const productPages: Record<string, ProductPage> = {
  orgvitals: {
    headline: 'Find out what is wrong with an org before you quote it.',
    mark: 'before you quote it',
    lede:
      'OrgVitals connects to an org you have already authenticated with the <code>sf</code> CLI, pulls a read-only snapshot of its metadata, and runs 49 checks across five categories. It grades the org A to F and shows you what to fix first.',
    short: 'org health scanner',
    claim:
      'Nothing is written back to Salesforce, and your metadata and scan results stay on your device.',
    transit: {
      source: {
        label: 'Source',
        name: 'Your Salesforce org',
        note: 'Metadata is read. Nothing is ever written back.',
      },
      inTag: 'read-only',
      estate: 'Your machine',
      stages: [
        {
          name: 'Snapshot',
          what: 'Apex, Flows, profiles, permission sets, objects, fields, reports, limits, test coverage.',
        },
        {
          name: 'Local database',
          what: 'The snapshot lands in a SQLite file on your disk, alongside every prior scan.',
        },
        {
          name: '49 scanners',
          what: 'Dependency-ordered waves across a worker pool of up to eight.',
        },
        {
          name: 'Grade',
          what: 'Findings, severities and one weighted A–F, plotted against every scan before it.',
        },
      ],
      out: {
        label: 'Optional',
        name: 'Anthropic’s Claude API',
        note: 'Ask Vita only, off by default, with your own key. Never to CloudAlgo.',
        tag: 'opt-in',
        dashed: true,
      },
    },
    facts: [
      { term: 'Runs on', detail: 'macOS · Windows · Linux' },
      { term: 'Salesforce access', detail: 'Read-only' },
      { term: 'Price', detail: 'Free' },
    ],
    cta: { primary: 'Download the latest build', secondary: 'Read the guide' },
    links: { external: 'Latest release', guide: 'The guide' },
    price: {
      figure: 'Free',
      gloss:
        'One tier, and it is the whole product. No seat count, no trial clock, and no paid edition held back behind it.',
    },
    folds: {
      transit: { title: 'Where your metadata goes.', note: 'Read-only, one direction' },
      cap: {
        title: 'What it checks, and what it does with the answers.',
        note: 'Six capabilities · 49 scanners',
      },
      viewer: {
        title: 'Six minutes of it, without installing anything.',
        note: 'Recorded against a live org',
      },
      readout: { title: 'The specification.', note: 'As built, v1.1.1' },
      terms: {
        title: 'What it costs, and what it needs.',
        note: 'Four prerequisites, three of which you have',
      },
      ahead: { title: 'What is shipped, and what is next.', note: 'Planned, not promised — no dates' },
      colophon: { title: 'Where to go next.', note: 'OrgVitals 1.1.1 · July 2026' },
    },
    band: {
      ask: 'OrgVitals tells you what is wrong.',
      emphasis: 'Fixing it is usually a services question.',
      note:
        'A grade is a starting point, not a plan. If the report comes back worse than you expected, send us the categories that failed and we will say plainly whether it is a week of work or a quarter.',
    },
  },

  algobridge: {
    headline: 'Keep Salesforce and Postgres in step, without a platform in the middle.',
    mark: 'without a platform in the middle',
    lede:
      'AlgoBridge watches both sides for changes and moves them across in ten-second batches. It is MIT-licensed and runs on your own Docker or ECS, so there is no hosted service to sign up to and no per-record fee.',
    short: 'Salesforce ⇆ PostgreSQL',
    claim:
      'AlgoBridge runs entirely on infrastructure you control. No record ever passes through a system CloudAlgo operates.',
    transit: {
      source: {
        label: 'Source',
        name: 'Your Salesforce org',
        note: 'Triggers on the objects you nominate record every change as it happens.',
      },
      inTag: 'both ways',
      estate: 'Your infrastructure',
      stages: [
        {
          name: 'Detect',
          what: 'Trigger-based change detection on each side, rather than a poll that scans everything on a timer.',
        },
        {
          name: 'Batch',
          what: 'Changes queue and cross in ten-second batches over the SOAP and Bulk v2 APIs.',
        },
        {
          name: 'Apply',
          what: 'The other side is updated and the record’s own id written back, so the pair stays matched.',
        },
        {
          name: 'Audit',
          what: 'Column-level diffs are kept for 31 days in hstore — what changed, when, and in which direction.',
        },
      ],
      out: {
        label: 'Sink',
        name: 'Your PostgreSQL database',
        note: 'PostgreSQL 14 or later, with hstore enabled. Yours, wherever you run it.',
        tag: 'both ways',
      },
    },
    facts: [
      { term: 'Runs on', detail: 'Docker Compose · AWS ECS' },
      { term: 'Licence', detail: 'MIT' },
      { term: 'Price', detail: 'Free' },
    ],
    cta: { primary: 'Open the AlgoBridge site' },
    links: { external: 'The AlgoBridge site' },
    price: {
      figure: 'MIT',
      gloss:
        'Open source and self-hosted: no licence fee, no per-record charge, and no cut of the data that crosses. Support on an enterprise install is a separate conversation.',
    },
    folds: {
      transit: { title: 'How a change crosses.', note: 'Both directions, ten-second batches' },
      cap: { title: 'What it does.', note: 'Four capabilities' },
      readout: { title: 'The specification.', note: 'As built, v1.0' },
      terms: { title: 'What it costs, and what it needs.', note: 'Three prerequisites' },
      colophon: { title: 'Where to go next.', note: 'AlgoBridge 1.0 · May 2026' },
    },
    band: {
      ask: 'AlgoBridge moves the records.',
      emphasis: 'Deciding which ones should cross is the harder half.',
      note:
        'A sync is only as good as the model underneath it. If you are not sure which objects belong in Postgres, or what should happen when both sides change at once, that is the conversation to have before the install.',
    },
  },

  pledgivo: {
    headline: 'Take a donation without it ever leaving your org.',
    mark: 'without it ever leaving your org',
    lede:
      'Pledgivo is a managed package that puts the donation form, the payment and the donor record inside Salesforce. A confirmed gift is a standard Opportunity the moment it is taken — there is no external platform and no sync job to keep running.',
    short: 'fundraising in your org',
    claim:
      'No card number ever reaches your Apex. Stripe.js tokenizes it in the donor’s browser, and the org only ever handles the token.',
    transit: {
      source: {
        label: 'Source',
        name: 'A donor on your site',
        note: 'An Experience Cloud page, where Stripe.js tokenizes the card in the browser.',
      },
      inTag: 'token only',
      estate: 'Your Salesforce org',
      stages: [
        {
          name: 'Staging',
          what: 'The gift lands in Donation_Staging__c while the payment is still in flight.',
        },
        {
          name: 'Confirm',
          what: 'A guest-side poll right after the redirect, with a scheduled reconciliation pass behind it.',
        },
        {
          name: 'Opportunity',
          what: 'On confirmation it becomes a standard Opportunity against a standard Campaign.',
        },
        {
          name: 'Receipt',
          what: 'A donor Contact or Person Account, and a receipt — reportable with the reports you already have.',
        },
      ],
      out: {
        label: 'Payment',
        name: 'Stripe',
        note: 'Holds the card and takes the money. Salesforce asks it what happened rather than waiting on an inbound webhook.',
        tag: 'poll',
      },
    },
    facts: [
      { term: 'Package', detail: '2GP managed · namespace pledgivo' },
      { term: 'Runs in', detail: 'Your Salesforce org' },
      { term: 'Price', detail: 'Free to 200 gifts a year' },
    ],
    cta: { primary: 'Open pledgivo.com', secondary: 'Installation guide' },
    links: { external: 'The Pledgivo site', guide: 'Installation guide' },
    price: {
      figure: '$0',
      gloss:
        'Free for your first 200 donations a year, and that is the whole product — every feature, no card, no expiry date. Past 200 it is one flat price per org, never per user and never a percentage of what you raise.',
    },
    folds: {
      transit: { title: 'How a gift travels.', note: 'The card stops at the browser' },
      cap: { title: 'What the package gives you.', note: 'Eight capabilities' },
      viewer: { title: 'The feature tour.', note: 'Two minutes fifty-four, one capability at a time' },
      readout: { title: 'The specification.', note: 'As built, API 67.0' },
      terms: { title: 'What it costs, and what it needs.', note: 'Five prerequisites, two conditional' },
      colophon: { title: 'Where to go next.', note: 'Pledgivo · August 2026' },
    },
    band: {
      ask: 'Pledgivo takes the gift.',
      emphasis: 'Getting your org ready to receive it is the other half.',
      note:
        'Most fundraising teams arrive with an Opportunity model that grew sideways for a decade. If yours needs straightening before the package lands on it, that is work we do.',
    },
  },

  insurealgo: {
    headline: 'Every policy you hold, on the phone in your pocket.',
    mark: 'on the phone in your pocket',
    lede:
      'InsureAlgo keeps vehicle, health, life, home and any policy type you invent in one list, counts down to each renewal, and reminds you before it lapses. It is free, there is no account to create, and nothing leaves the handset.',
    short: 'policy tracker',
    claim:
      'There is no account and no server. Every policy, document and reminder stays on the device.',
    transit: {
      source: {
        label: 'Source',
        name: 'You',
        note: 'Policies you type in and documents you photograph. Nothing is pulled from an insurer.',
      },
      inTag: 'on device',
      estate: 'Your phone',
      stages: [
        {
          name: 'Policy',
          what: 'Insurer, type, premium, renewal date, and the document itself — about a minute each.',
        },
        {
          name: 'Countdown',
          what: 'Every policy carries an exact days-remaining figure, ordered by what expires first.',
        },
        {
          name: 'Reminder',
          what: 'Local notifications fire on the schedule you set. No push server is involved.',
        },
        {
          name: 'Vault',
          what: 'Documents sit in the app behind an optional biometric lock.',
        },
      ],
      out: {
        label: 'Optional',
        name: 'Your own iCloud Drive',
        note: 'Backup only, into your own account, and only on iOS if you switch it on.',
        tag: 'opt-in',
        dashed: true,
      },
    },
    facts: [
      { term: 'Runs on', detail: 'iOS 15+ · Android 8+' },
      { term: 'Your data', detail: 'Stays on the device' },
      { term: 'Price', detail: 'Free' },
    ],
    cta: { primary: 'Get it on the App Store' },
    links: { external: 'The App Store listing' },
    price: {
      figure: 'Free',
      gloss:
        'Every feature, on both platforms, with no account to create and nothing to subscribe to. The backup uses your own iCloud storage rather than ours.',
    },
    folds: {
      transit: { title: 'Where a policy lives.', note: 'On the handset, and nowhere else' },
      cap: { title: 'What the app does.', note: 'Six capabilities' },
      viewer: { title: 'What it looks like.', note: 'Four screens from the iOS build' },
      terms: { title: 'What it costs, and what it needs.', note: 'Four prerequisites, two optional' },
      colophon: { title: 'Where to go next.', note: 'InsureAlgo 1.0.0 · May 2025' },
    },
    band: {
      ask: 'InsureAlgo is a small app we built for ourselves.',
      emphasis: 'The rest of the catalogue is the day job.',
      note:
        'If you found this page looking for Salesforce work rather than an insurance tracker, the services page is the one you want.',
    },
  },
};
