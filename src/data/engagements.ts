/**
 * The eight engagements, as data.
 *
 * Both services pages read from here: the index draws all seven against one
 * calendar and gives each a spread, and `/services/<slug>/` opens one of them
 * out into its own page. Before this module existed the index owned the lot,
 * which meant the detail page could only have copies -- and a copy of a
 * fourteen-week bar is a second truth that goes stale silently.
 *
 * What lives here is STRUCTURE: how long a stage runs, what order the stages
 * come in, what you are committing to, what you are left holding. The PROSE
 * that describes each practice in full stays in the `services` content
 * collection, because that is markdown somebody edits without opening a .ts
 * file. The detail page renders the collection body as its scope document and
 * takes everything around it from here.
 *
 * The pricing MECHANISMS ("fixed scope, or time & materials", "per process
 * automated") are true as written. There is no money in this file, and none
 * should be invented here.
 */

/** A span on the spine, measured in the unit that engagement's axis is drawn
    in -- weeks for six of them, months for the retainer. */
export interface Bar {
  from: number;
  typical: number;
  most: number;
}

export interface TrackStep {
  /** Printed as given ("01"). */
  n: string;
  name: string;
  /**
   * When this stage runs, in words: "Weeks 3-10", "Continuous". Printed on
   * the detail page's spine beside the bar, so a reader who cannot see the
   * figure still gets the fact it draws.
   */
  when?: string;
  bar?: Bar;
  /** More than one bar on one row: a stage that repeats rather than runs. */
  bars?: Bar[];
  /** Where the rolling ticks start, for a stage that does not end. */
  roll?: number;
  /** Caps the bar with the ember rule: this is the handover. */
  end?: boolean;
  detail: string;
}

export interface Term {
  term: string;
  detail: string;
}

export interface ManifestItem {
  title: string;
  detail: string;
}

/** One mark on the spine's ruler, positioned at `at` out of `cols`. */
export interface AxisMark {
  at: number;
  mark: string;
}

/** A legend entry, naming one of the four marks the figure can draw. */
export interface LegendKey {
  mod: 'min' | 'range' | 'cap' | 'roll';
  label: string;
}

/**
 * A scope section this engagement carries that markdown cannot express.
 *
 * Only the retainer uses it, and only twice: its response windows are a
 * four-cell band and its tiers are a comparison table, both of which exist
 * as real components already. Writing them as raw HTML inside a content file
 * would put markup somewhere nobody expects to find it, so they are declared
 * here and rendered as siblings around the markdown instead.
 */
export interface ScopeDevice {
  /** Anchor id, matching the rail link. */
  id: string;
  title: string;
  intro: string;
  device: 'windows' | 'tiers';
}

export interface Detail {
  /** The page's h1. HTML, because its last phrase carries the crayon mark. */
  title: string;
  lede: string;
  /** The engagement's own time, drawn one zoom level in from the index. */
  spine: {
    title: string;
    /** The line beside the head: what the figure is drawn at. */
    note: string;
    /** The scale. Bars and marks are both positions out of this. */
    cols: number;
    axis: AxisMark[];
    legend: LegendKey[];
    /** HTML: the last sentence is emphasised. */
    caption: string;
  };
  /** The rendered markdown, plus the head above it and the rail beside it. */
  scope: {
    title: string;
    lede: string;
    /** Sections rendered before the markdown body. */
    before?: ScopeDevice[];
    /** Sections rendered after it. */
    after?: ScopeDevice[];
  };
  /** What this one engagement ends with, as against the site-wide four. */
  manifest: {
    kicker: string;
    title: string;
    note: string;
    items: ManifestItem[];
  };
}

export type Engagement = {
  /** Content-collection id. Also the detail page's route. */
  slug: string;
  /** Printed as given, and the same numeral on every device below. */
  n: string;
  /** In-page anchor on the index. Short, because it is read in a URL bar. */
  id: string;
  /** The name these pages use. Shorter than the collection title where
      the collection's spends its first word restating "Salesforce". */
  name: string;
  /** The contents strip: what the engagement is FOR. */
  contents: string;
  /** The schedule: how long it RUNS. Different fact, same row. */
  shape: string;
  /** Months, on the index's twelve-month axis. */
  bar?: Bar;
  /** Month the rolling ticks start. */
  roll?: number;
  /**
   * The spread's stamp. `shape` is what you are buying. The second line is
   * the practice's proof, taken from the collection -- and where a practice
   * has none, `note` stands in its place with a true statement of scope
   * instead. A descriptive stamp is not a weaker proof, it is a different
   * kind of sentence, and printing it as one would be the invented claim
   * this page went out of its way to remove.
   */
  stamp: { shape: string; note?: string };
  tagline: string;
  lead: string;
  track: TrackStep[];
  ending?: 'handover' | 'rolling';
  caveat?: string;
  stackLabel?: string;
  stack: string;
  terms: Term[];
  /** The first step THIS engagement asks for. Every engagement carried
      an identical "Book a consultation" button in an early draft, which
      is the same ask printed once per row rather than one first meeting
      per engagement. */
  cta: string;
  detail: Detail;
};

export const TYPICAL: Record<string, { range: string; qualifier?: string }> = {
  'salesforce-consulting':  { range: '6–12 weeks' },
  'heroku-consulting':      { range: '8–16 weeks' },
  'product-development':    { range: '12–24 weeks' },
  'mulesoft-integration':   { range: '8–16 weeks' },
  'mulesoft-rpa':           { range: '4–8 weeks', qualifier: 'per process' },
  'aws-cloud-solutions':    { range: '4–12 weeks' },
  'airflow-data-pipelines': { range: '6–10 weeks' },
};

/** The schedule's row label, under the name: "Project · 6–12 weeks". */
export const runs = (slug: string) => `Project · ${TYPICAL[slug].range}`;

/** The terms row. Carries the qualifier the schedule label has no room for --
    RPA is priced and scheduled per process, and the figure is meaningless
    without that word. */
export const lengthOf = (slug: string) =>
  [TYPICAL[slug].range, TYPICAL[slug].qualifier].filter(Boolean).join(' ');

export const ENGAGEMENTS: Engagement[] = [
  {
    slug: 'salesforce-consulting',
    n: '01',
    id: 'consulting',
    name: 'Consulting & implementation',
    contents: 'Build or untangle the org itself',
    shape: runs('salesforce-consulting'),
    bar: { from: 0, typical: 1.5, most: 3 },
    stamp: { shape: 'Fixed-scope project' },
    tagline: 'The build, done so your admins can still change it.',
    lead:
      'Every engagement starts by watching the process before we touch a field. Then we build it ' +
      '— objects, flows, Lightning Web Components, integrations, migrations — in a shape your ' +
      'team can read six months later. Over-customised orgs are the other half of this work: we ' +
      'untangle trigger conflicts and redundant automation as readily as we add to them.',
    track: [
      {
        n: '01',
        name: 'Workshop',
        when: 'Week 1',
        bar: { from: 0, typical: 1, most: 1 },
        detail:
          'We sit with the people doing the work and map what actually happens, not what the ' +
          'process document says.',
      },
      {
        n: '02',
        name: 'Architecture note',
        when: 'Week 2',
        bar: { from: 1, typical: 2, most: 2 },
        detail:
          'What we will build, what we will not, and what it costs to change our minds later. ' +
          'You approve this before any code.',
      },
      {
        n: '03',
        name: 'Two-week increments',
        when: 'Weeks 3–10',
        bar: { from: 2, typical: 8, most: 10 },
        detail: 'You see it working in a sandbox at the end of each one. No six-week silences.',
      },
      {
        n: '04',
        name: 'Handover',
        when: 'Weeks 11–12',
        bar: { from: 10, typical: 12, most: 12 },
        end: true,
        detail:
          'Repository, deployment runbook, and a working session with your admins on the parts ' +
          'they will own.',
      },
    ],
    stack:
      'CRM customisation · Flows & automation · Lightning Web Components · ' +
      'REST / SOAP / Platform Events · Data migration',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('salesforce-consulting') },
      { term: 'Priced',         detail: 'Fixed scope, or time & materials' },
      { term: 'Starts with',    detail: 'A workshop, not a proposal' },
      { term: 'You keep',       detail: 'Repository, runbook, admin training' },
    ],
    cta: 'Book the workshop',
    detail: {
      title:
        'We build the org so your admins can still ' +
        '<span class="mark mark--draw">change it</span>.',
      lede:
        'Two kinds of org call us. One has nothing yet and needs Sales Cloud, flows and ' +
        'integrations built. The other has too much — nine years of triggers, three ' +
        'overlapping automations, and nobody left who knows why. We take both, and both start ' +
        'the same way: watching the process before touching a field.',
      spine: {
        title: 'Twelve weeks, four stages, one handover.',
        note: 'Drawn to scale',
        cols: 12,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 2, mark: '02' }, { at: 4, mark: '04' },
          { at: 6, mark: '06' }, { at: 8, mark: '08' }, { at: 10, mark: '10' },
          { at: 12, mark: '12' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: twelve weeks. A six-week build runs the same four stages with ' +
          'two increments instead of four — the workshop, the architecture note and the handover ' +
          'do not shrink. <b>The length is fixed at the workshop, not before it.</b>',
      },
      scope: {
        title: 'Everything this engagement can touch.',
        lede:
          'This is the whole surface the engagement can cover. Most orgs need three of these ' +
          'five — the workshop decides which, and what you do not need does not get built.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'Weeks eleven and twelve are not a formality. They are the reason the other ten were ' +
          'built the way they were.',
        items: [
          {
            title: 'The repository',
            detail:
              'Every line of Apex, LWC and Flow metadata, in your git, under your account. No ' +
              'vendor repo, no licence to keep paying.',
          },
          {
            title: 'The deployment runbook',
            detail:
              'How it deploys, what breaks first, and what to check at 2am. Written during the ' +
              'build, not reconstructed at the end.',
          },
          {
            title: 'A working session with your admins',
            detail:
              'Live, on the parts they will own, with their questions. Not a recorded ' +
              'walkthrough nobody watches twice.',
          },
          {
            title: 'The architecture note',
            detail:
              'What we built, what we deliberately did not, and what it would cost to change ' +
              'either.',
          },
        ],
      },
    },
  },
  {
    slug: 'heroku-consulting',
    n: '02',
    id: 'heroku',
    name: 'Heroku consulting',
    contents: 'The Heroku estate beside the org',
    shape: runs('heroku-consulting'),
    bar: { from: 0, typical: 2, most: 4 },
    stamp: { shape: 'Fixed-scope project', note: 'Migration review included' },
    tagline: 'The Heroku side, built so it outlasts the roadmap.',
    lead:
      'Heroku Connect at the volume you actually have, Postgres as the scale tier, and the ' +
      'long-running jobs Apex was never going to run. We build that side and we hand back the ' +
      'mappings, the runbook and the cost baseline. Since February 2026 the platform ships no ' +
      'new features, which changes nothing about whether your app works and everything about ' +
      'how long you should expect to own it — so every engagement here ends with that question ' +
      'answered in writing rather than left for a board meeting.',
    track: [
      {
        n: '01',
        name: 'Estate review',
        when: 'Weeks 1–2',
        bar: { from: 0, typical: 2, most: 2 },
        detail:
          'What runs, what it costs, what it syncs, and which part of it is one traffic spike ' +
          'away from a bad afternoon.',
      },
      {
        n: '02',
        name: 'Integration design',
        when: 'Weeks 3–4',
        bar: { from: 2, typical: 4, most: 4 },
        detail:
          'REST, Platform Events, RabbitMQ or Heroku Connect — chosen per workload, with the ' +
          'reason written down and the failure mode named.',
      },
      {
        n: '03',
        name: 'Build',
        when: 'Weeks 5–11',
        bar: { from: 4, typical: 10, most: 11 },
        detail:
          'Dynos, workers and the queue between them; Connect mappings with external IDs chosen ' +
          'before the first sync; Postgres indexed for the reads you will actually make.',
      },
      {
        n: '04',
        name: 'Scale & cost pass',
        when: 'Weeks 12–14',
        bar: { from: 11, typical: 14, most: 14 },
        detail:
          'Run it under load, then size it. Dyno plans and add-ons reviewed against real usage, ' +
          'sync lag and error counts put on a dashboard.',
      },
      {
        n: '05',
        name: 'Handover',
        when: 'Weeks 15–16',
        bar: { from: 14, typical: 16, most: 16 },
        end: true,
        detail:
          'Repository, runbook, the Connect mapping document, and the written answer on whether ' +
          'to stay, invest or plan the move.',
      },
    ],
    stack:
      'Heroku Connect · Heroku Postgres · Web & worker dynos · RabbitMQ / Redis · ' +
      'Platform Events · Node.js / Java · Puppeteer',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('heroku-consulting') },
      { term: 'Priced',         detail: 'Fixed scope, or time & materials' },
      { term: 'Starts with',    detail: 'An estate review' },
      { term: 'You keep',       detail: 'Repository, runbook, Connect mappings, cost baseline' },
    ],
    cta: 'Book an estate review',
    detail: {
      title:
        'The Heroku side, built so it ' +
        '<span class="mark mark--draw">outlasts the roadmap</span>.',
      lede:
        'Heroku Connect at the volume you actually have, Postgres as the scale tier, and the ' +
        'long-running jobs Apex was never going to run. We build that side and hand back the ' +
        'mappings, the runbook and the cost baseline. Since February 2026 the platform ships ' +
        'no new features — which changes nothing about whether your app works, and everything ' +
        'about how long you should expect to own it.',
      spine: {
        title: 'Sixteen weeks at the long end, and the first two decide the rest.',
        note: 'Drawn to scale',
        cols: 16,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 4, mark: '04' }, { at: 8, mark: '08' },
          { at: 12, mark: '12' }, { at: 16, mark: '16' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: sixteen weeks. An eight-week engagement is usually the review ' +
          'and one integration, which is a legitimate place to stop. <b>The estate review is ' +
          'scoped on its own, so stopping there costs you nothing you did not want.</b>',
      },
      scope: {
        title: 'What we do on the Heroku side.',
        lede:
          'The review comes first and it decides the rest — including, on occasion, that the ' +
          'app is fine where it is and the honest recommendation is to leave it alone.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'A Heroku estate nobody can redeploy or price is a liability, and a frozen platform ' +
          'roadmap makes it a slower-burning one. These four are what not having that looks like.',
        items: [
          {
            title: 'The repository',
            detail:
              'Apps, workers and pipelines in your git, with the deploy documented. Not an ' +
              'account somebody set up once and left.',
          },
          {
            title: 'The Connect mapping document',
            detail:
              'Every mapped object, its external ID, its write direction and its known limits — ' +
              'the thing nobody writes down until the sync breaks.',
          },
          {
            title: 'The cost baseline',
            detail:
              'What each dyno and add-on costs against what it actually uses, measured after a ' +
              'month of real traffic rather than guessed at setup.',
          },
          {
            title: 'The stay-or-move note',
            detail:
              'What a migration would cost, what it would break, and the conditions that should ' +
              'trigger it. Written whether or not you plan to act on it.',
          },
        ],
      },
    },
  },
  {
    slug: 'product-development',
    n: '03',
    id: 'product',
    name: 'Product development',
    contents: 'Managed packages through Security Review',
    shape: 'Project, then retainer',
    bar: { from: 0, typical: 3, most: 6 },
    roll: 6,
    stamp: { shape: 'Project, then retainer' },
    tagline: 'Get through Security Review the first time.',
    lead:
      'Building for the AppExchange is not org work with a namespace on it. Packaging tier, ' +
      'namespace, edition compatibility and subscriber lifecycle are decisions that are expensive ' +
      'to reverse, and Security Review is where the unprepared lose a quarter. We have shipped ' +
      'managed packages and know which of those decisions bite.',
    track: [
      {
        n: '01',
        name: 'Packaging decision',
        when: 'Weeks 1–2',
        bar: { from: 0, typical: 2, most: 2 },
        detail:
          '1GP or 2GP, namespace registration, and how the package splits — settled before the ' +
          'first commit.',
      },
      {
        n: '02',
        name: 'Build',
        when: 'Weeks 3–16',
        bar: { from: 2, typical: 14, most: 16 },
        detail:
          'Multi-edition patterns, CRUD/FLS on every query and DML, scratch-org CI from day one.',
      },
      {
        n: '03',
        name: 'Review preparation',
        when: 'Weeks 17–19',
        bar: { from: 16, typical: 19, most: 19 },
        detail:
          'PMD static analysis on an AppExchange-tuned ruleset, then a manual pass for XSS and ' +
          'SOQL injection.',
      },
      {
        n: '04',
        name: 'Submission',
        when: 'Weeks 20–24',
        bar: { from: 19, typical: 22, most: 24 },
        end: true,
        detail:
          'We fill out the form, answer the reviewer, and coordinate resubmission if it comes back.',
      },
      {
        n: '05',
        name: 'Listing & licensing',
        when: 'From week 22, ongoing',
        roll: 21,
        detail:
          'LMA, trials that expire gracefully, seat enforcement, and the listing copy buyers ' +
          'respond to.',
      },
    ],
    stack:
      '1GP & 2GP · Namespace strategy · PMD + manual audit · LMA & entitlements · ' +
      'Scratch-org CI/CD · Release readiness',
    terms: [
      { term: 'Shape',          detail: 'Project, then retainer at launch' },
      { term: 'Typical length', detail: lengthOf('product-development') },
      { term: 'Priced',         detail: 'Per phase' },
      { term: 'Starts with',    detail: 'A packaging decision' },
      { term: 'You keep',       detail: 'Package, CI pipeline, submission record' },
    ],
    cta: 'Book a packaging call',
    detail: {
      title:
        'Get through Security Review the ' +
        '<span class="mark mark--draw">first time</span>.',
      lede:
        'Building for the AppExchange is not org work with a namespace on it. Packaging tier, ' +
        'namespace, edition compatibility and subscriber lifecycle are all expensive to ' +
        'reverse, and Security Review is where the unprepared lose a quarter. We have shipped ' +
        'managed packages through it, and we know which of those decisions bite.',
      spine: {
        title: 'Twenty-four weeks to a listing, then it keeps going.',
        note: 'Drawn to scale',
        cols: 24,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 4, mark: '04' }, { at: 8, mark: '08' },
          { at: 12, mark: '12' }, { at: 16, mark: '16' }, { at: 20, mark: '20' },
          { at: 24, mark: '24' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Listed' },
          { mod: 'roll',  label: 'Runs on after launch' },
        ],
        caption:
          'Drawn at the long end: twenty-four weeks. Security Review is the one stage whose ' +
          'length is not ours to set — the range on it is the queue, not the work. ' +
          '<b>Packaging is decided in week one, because it is the decision that is expensive ' +
          'to reverse.</b>',
      },
      scope: {
        title: 'Everything a managed package needs.',
        lede:
          'A package touches all five of these before it lists. The first one constrains the ' +
          'other four, which is why it is settled in week one rather than discovered in ' +
          'week twelve.',
      },
      manifest: {
        kicker: 'At launch',
        title: 'What you are left holding.',
        note:
          'The package is yours. So is the pipeline that builds it, the record of what the ' +
          'reviewer asked, and the listing that sells it.',
        items: [
          {
            title: 'The package',
            detail:
              'Namespace, metadata and version history in your own Dev Hub. We do not hold the ' +
              'keys to your product.',
          },
          {
            title: 'The CI pipeline',
            detail:
              'Scratch-org creation, test runs and packaging on every commit, in your git, ' +
              'ready for the next release.',
          },
          {
            title: 'The submission record',
            detail:
              'Every question the reviewer asked and the answer that satisfied them. The ' +
              'document that makes resubmission cheap.',
          },
          {
            title: 'The listing',
            detail:
              'Copy, screenshots, trial flow and licensing set up in the Partner Console, ' +
              'under your account.',
          },
        ],
      },
    },
  },
  {
    slug: 'mulesoft-integration',
    n: '04',
    id: 'mulesoft',
    name: 'MuleSoft integration',
    contents: 'One API layer instead of six point-to-point links',
    shape: runs('mulesoft-integration'),
    bar: { from: 0, typical: 2, most: 4 },
    stamp: { shape: 'Fixed-scope project', note: 'Anypoint Platform' },
    tagline: 'One API layer, so your systems stop talking point-to-point.',
    lead:
      'Point-to-point integrations are cheap to build and expensive to own: every system you add ' +
      'multiplies the connections, and nobody can say what breaks when one goes down. API-led ' +
      'connectivity puts three named layers between your systems, so a change lands in one place ' +
      'instead of six. We design the layers, build them, and document the Exchange portal well ' +
      'enough that your team adds the next API without calling us.',
    track: [
      {
        n: '01',
        name: 'Connection audit',
        when: 'Weeks 1–2',
        bar: { from: 0, typical: 2, most: 2 },
        detail:
          'Every system, every integration that already exists, and what each one actually moves. ' +
          'Usually the first honest map anyone has had.',
      },
      {
        n: '02',
        name: 'System APIs',
        when: 'Weeks 3–6',
        bar: { from: 2, typical: 6, most: 6 },
        detail:
          'One per source of record — Salesforce, ERP, HCM. Nothing business-specific, so they ' +
          'outlive the processes built on top of them.',
      },
      {
        n: '03',
        name: 'Process APIs',
        when: 'Weeks 7–11',
        bar: { from: 6, typical: 10, most: 11 },
        detail:
          'Where the business logic lives. Order-to-cash, lead-to-quote, composed from the system ' +
          'layer rather than wired to it.',
      },
      {
        n: '04',
        name: 'Experience APIs',
        when: 'Weeks 12–14',
        bar: { from: 11, typical: 14, most: 14 },
        detail:
          'Shaped for whoever consumes them: the mobile app, the partner portal, the Salesforce org.',
      },
      {
        n: '05',
        name: 'Handover',
        when: 'Weeks 15–16',
        bar: { from: 14, typical: 16, most: 16 },
        end: true,
        detail:
          'Exchange portal with specs and examples, API policies applied, Anypoint Monitoring ' +
          'dashboards and dead-letter queues wired, runbook written.',
      },
    ],
    stack:
      'API-led connectivity · Anypoint Platform · Anypoint MQ · Platform Events · ' +
      'Change Data Capture · RAML / OAS · Exchange',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('mulesoft-integration') },
      { term: 'Priced',         detail: 'Per layer, scoped from the audit' },
      { term: 'Starts with',    detail: 'A connection audit' },
      { term: 'You keep',       detail: 'Anypoint repo, API specs, policies, dashboards, runbook' },
    ],
    cta: 'Book a connection audit',
    detail: {
      title:
        'One API layer, so your systems stop talking ' +
        '<span class="mark mark--draw">point to point</span>.',
      lede:
        'Point-to-point integrations are cheap to build and expensive to own: every system you ' +
        'add multiplies the connections, and nobody can say what breaks when one goes down. ' +
        'Three named layers put a change in one place instead of six — and the Exchange portal ' +
        'is documented well enough that your team adds the next API without calling us.',
      spine: {
        title: 'Sixteen weeks, three layers, one handover.',
        note: 'Drawn to scale',
        cols: 16,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 4, mark: '04' }, { at: 8, mark: '08' },
          { at: 12, mark: '12' }, { at: 16, mark: '16' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: sixteen weeks. Eight is the same five stages with fewer APIs ' +
          'in each layer — the audit and the handover do not shrink. <b>How many layers you ' +
          'actually need is decided at the audit, not before it.</b>',
      },
      scope: {
        title: 'What the integration layer covers.',
        lede:
          'The audit decides how much of this you need. Most orgs turn out to need three system ' +
          'APIs and two process APIs, not the twelve they were bracing for.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'An API layer nobody can maintain is six point-to-point integrations wearing a suit. ' +
          'These four are what make it maintainable by your team rather than by ours.',
        items: [
          {
            title: 'The Anypoint repository',
            detail:
              'Every flow, every DataWeave transform, every policy — in your git, under your ' +
              'own Anypoint tenancy.',
          },
          {
            title: 'The Exchange portal',
            detail:
              'Specs, examples and a working sandbox for each API, so the next team adds one ' +
              'without calling us.',
          },
          {
            title: 'The monitoring',
            detail:
              'Anypoint dashboards, alert thresholds and dead-letter queues wired before ' +
              'handover, not after the first outage.',
          },
          {
            title: 'The runbook',
            detail:
              'How it deploys, what fails first, and what to do when a downstream system goes ' +
              'quiet.',
          },
        ],
      },
    },
  },
  {
    slug: 'mulesoft-rpa',
    n: '05',
    id: 'rpa',
    name: 'MuleSoft RPA',
    contents: 'Bots for the systems that never got an API',
    shape: runs('mulesoft-rpa'),
    bar: { from: 0, typical: 1, most: 2 },
    stamp: { shape: 'Fixed-scope project', note: 'Per process automated' },
    tagline: 'Automate the systems that never got an API.',
    lead:
      'Some systems cannot be integrated, only operated: a supplier portal with no API, a ' +
      'mainframe screen, a PDF somebody rekeys into Salesforce every morning. RPA drives those ' +
      'the way a person does, except at 3am and without transcription errors. We build the bots ' +
      'in MuleSoft RPA so they run on the same Anypoint platform as your integrations — one place ' +
      'to monitor, one place to alert — instead of becoming a second automation tool nobody governs.',
    track: [
      {
        n: '01',
        name: 'Process capture',
        when: 'Week 1',
        bar: { from: 0, typical: 1, most: 1 },
        detail:
          'We sit with whoever does the work today and record it. What looks like one process is ' +
          'usually three, and one of them should not exist at all.',
      },
      {
        n: '02',
        name: 'Bot build',
        when: 'Weeks 2–4',
        bar: { from: 1, typical: 3, most: 4 },
        detail:
          'We record it in RPA Builder and write the exception paths deliberately, instead of ' +
          'discovering them in production.',
      },
      {
        n: '03',
        name: 'Attended or unattended',
        when: 'Weeks 5–6',
        bar: { from: 4, typical: 6, most: 6 },
        detail:
          'Attended runs beside a person for the judgement calls; unattended runs on a schedule. ' +
          'Most processes want one of each, split at the decision point.',
      },
      {
        n: '04',
        name: 'Wired into Anypoint',
        when: 'Week 7',
        bar: { from: 6, typical: 7, most: 7 },
        detail:
          'Bots triggered by, and reporting into, the same integration layer — so a bot failure ' +
          'raises the same alert everything else does.',
      },
      {
        n: '05',
        name: 'Handover',
        when: 'Week 8',
        bar: { from: 7, typical: 8, most: 8 },
        end: true,
        detail:
          'Bot definitions in your own tenancy, an exception runbook, and the process ' +
          'documentation the capture produced.',
      },
    ],
    caveat:
      'A bot breaks when somebody changes the screen it drives. That maintenance is real and it ' +
      'is ongoing — it belongs in the retainer below, not hidden inside this project’s price.',
    stack:
      'MuleSoft RPA Builder · RPA Manager · Attended & unattended bots · ' +
      'Document processing · Anypoint triggers',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('mulesoft-rpa') },
      { term: 'Priced',         detail: 'Per process automated' },
      { term: 'Starts with',    detail: 'A process capture' },
      { term: 'You keep',       detail: 'Bot definitions, exception runbook, process docs' },
    ],
    cta: 'Book a process capture',
    detail: {
      title:
        'Automate the systems that ' +
        '<span class="mark mark--draw">never got an API</span>.',
      lede:
        'Some systems cannot be integrated, only operated: a supplier portal with no API, a ' +
        'mainframe screen, a PDF somebody rekeys into Salesforce every morning. A bot drives ' +
        'those the way a person does, except at 3am and without transcription errors — and ' +
        'because it runs on Anypoint, it raises the same alert everything else does when it ' +
        'breaks.',
      spine: {
        title: 'Eight weeks, one process.',
        note: 'Per process, drawn to scale',
        cols: 8,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 2, mark: '02' }, { at: 4, mark: '04' },
          { at: 6, mark: '06' }, { at: 8, mark: '08' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: eight weeks for one process. Two processes are not sixteen ' +
          'weeks — the capture and the Anypoint wiring are done once — but they are not eight ' +
          'either. <b>The scope is one process at a time, and so is the price.</b>',
      },
      scope: {
        title: 'What a bot engagement covers.',
        lede:
          'Four areas, and the fourth is the one nobody quotes for. A bot automates a process ' +
          'somebody else can change without telling you, so the caveat is written into the ' +
          'scope rather than discovered in month three.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'A bot you cannot change is a liability with a schedule. These four are what make it ' +
          'yours to change.',
        items: [
          {
            title: 'The bot definitions',
            detail:
              'Recorded steps, selectors and schedules, versioned, in your own RPA Manager ' +
              'tenancy.',
          },
          {
            title: 'The exception runbook',
            detail:
              'Every path the bot can fail down, what it does when it does, and who it tells.',
          },
          {
            title: 'The process documentation',
            detail:
              'What the capture found: the process as it actually runs, including the parts ' +
              'nobody had written down.',
          },
          {
            title: 'The Anypoint wiring',
            detail:
              'Triggers and alerts on the same platform as your integrations, so a bot failure ' +
              'raises the alarm everything else does.',
          },
        ],
      },
    },
  },
  {
    slug: 'aws-cloud-solutions',
    n: '06',
    id: 'aws',
    name: 'AWS cloud solutions',
    contents: 'The workloads that do not belong in Salesforce',
    shape: runs('aws-cloud-solutions'),
    bar: { from: 0, typical: 1, most: 3 },
    stamp: { shape: 'Fixed-scope project', note: 'Cost work included' },
    tagline: 'The workloads that do not belong inside Salesforce.',
    lead:
      'Heavy compute, long-term storage, cross-system analytics, and anything that would eat your ' +
      'API limits belongs next to Salesforce rather than inside it. We architect that side ' +
      'properly the first time — VPC, IAM, infrastructure as code — so the account is auditable ' +
      'and the bill does not surprise you in month four. Cost work is part of the design here, ' +
      'not a clean-up engagement we sell you afterwards.',
    track: [
      {
        n: '01',
        name: 'Architecture review',
        when: 'Weeks 1–2',
        bar: { from: 0, typical: 2, most: 2 },
        detail:
          'What you run now, what it costs, and which parts of it Salesforce should stop doing.',
      },
      {
        n: '02',
        name: 'Foundation',
        when: 'Weeks 3–5',
        bar: { from: 2, typical: 5, most: 5 },
        detail:
          'VPC, subnets, IAM roles and guardrails, written as Terraform or CDK so the account can ' +
          'be rebuilt from the repository.',
      },
      {
        n: '03',
        name: 'Workloads',
        when: 'Weeks 6–9',
        bar: { from: 5, typical: 8, most: 9 },
        detail:
          'Serverless processing of Platform Events, a migration off a legacy system, or the ' +
          'analytics layer — whichever the review picked.',
      },
      {
        n: '04',
        name: 'Reporting layer',
        when: 'Weeks 10–11',
        bar: { from: 9, typical: 11, most: 11 },
        detail:
          'QuickSight, Athena or Snowflake, reading the cross-system view Salesforce alone cannot ' +
          'give you.',
      },
      {
        n: '05',
        name: 'Handover',
        when: 'Week 12',
        bar: { from: 11, typical: 12, most: 12 },
        end: true,
        detail:
          'Infrastructure repository, budgets and cost alerts set, access model documented, ' +
          'runbook written.',
      },
    ],
    stack:
      'VPC & IAM · Terraform / CDK · Lambda · Platform Events · S3 lifecycle · ' +
      'QuickSight / Athena / Snowflake · Cost alerts',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('aws-cloud-solutions') },
      { term: 'Priced',         detail: 'Scoped from the architecture review' },
      { term: 'Starts with',    detail: 'An architecture review' },
      { term: 'You keep',       detail: 'Infrastructure repo, cost alerts, access model, runbook' },
    ],
    cta: 'Book an architecture review',
    detail: {
      title:
        'The workloads that do not belong ' +
        '<span class="mark mark--draw">inside Salesforce</span>.',
      lede:
        'Heavy compute, long-term storage, cross-system analytics, and anything that would eat ' +
        'your API limits belongs next to Salesforce rather than inside it. We architect that ' +
        'side properly the first time — VPC, IAM, infrastructure as code — so the account is ' +
        'auditable and the bill does not surprise you in month four. Cost work is part of the ' +
        'design here, not a clean-up we sell you afterwards.',
      spine: {
        title: 'Twelve weeks, and the first two decide the other ten.',
        note: 'Drawn to scale',
        cols: 12,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 3, mark: '03' }, { at: 6, mark: '06' },
          { at: 9, mark: '09' }, { at: 12, mark: '12' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: twelve weeks. A four-week engagement is usually the review ' +
          'and the foundation alone — which is a legitimate place to stop, and sometimes the ' +
          'right one. <b>The review is scoped on its own, so stopping there costs you nothing ' +
          'you did not want.</b>',
      },
      scope: {
        title: 'What we build on the AWS side.',
        lede:
          'The review comes first and it decides the rest — including, sometimes, that the ' +
          'answer is to switch things off rather than build.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'An AWS account you cannot rebuild from a repository is a liability. That is the ' +
          'test we build against, and these four are what passing it looks like.',
        items: [
          {
            title: 'The infrastructure repository',
            detail:
              'Terraform or CDK in your git. The account can be rebuilt from it, which is the ' +
              'only real test that it is documented.',
          },
          {
            title: 'The cost alerts',
            detail:
              'Budgets, anomaly detection and per-service alarms set during the build, so ' +
              'month four is not a surprise.',
          },
          {
            title: 'The access model',
            detail:
              'IAM roles, permission boundaries and who can do what — written down rather than ' +
              'inferred from the console.',
          },
          {
            title: 'The runbook',
            detail: 'How it deploys, what breaks first, and what to check at 2am.',
          },
        ],
      },
    },
  },
  {
    slug: 'airflow-data-pipelines',
    n: '07',
    id: 'pipelines',
    name: 'Airflow data pipelines',
    contents: 'Bulk movement between Salesforce and the warehouse',
    shape: runs('airflow-data-pipelines'),
    bar: { from: 0, typical: 1.5, most: 2.5 },
    stamp: { shape: 'Fixed-scope project' },
    tagline:
      'Move data between Salesforce and everything else, on a schedule that recovers itself.',
    lead:
      'Salesforce API limits make naive syncs brittle the moment volume arrives. Airflow gives the ' +
      'job a dependency graph, automatic retry with backoff, and an audit trail of every run. We ' +
      'write the DAGs, hand you the repository with its CI, and train your team to extend them. We ' +
      'build them idempotent, so a re-run is always safe, and to carry 50M+ records a day with ' +
      'sub-30-minute incrementals.',
    track: [
      {
        n: '01',
        name: 'Source audit',
        when: 'Week 1',
        bar: { from: 0, typical: 1, most: 1 },
        detail:
          'Which systems, which objects, what volume, and how fresh the data actually has to be.',
      },
      {
        n: '02',
        name: 'Bronze — raw extract',
        when: 'Weeks 2–4',
        bar: { from: 1, typical: 4, most: 4 },
        detail:
          'Bulk API 2.0 into S3 or PostgreSQL. No transformation, full fidelity, timestamped for ' +
          'point-in-time replay.',
      },
      {
        n: '03',
        name: 'Silver — cleansed',
        when: 'Weeks 5–6',
        bar: { from: 4, typical: 6, most: 6 },
        detail:
          'Deduped and typed. Salesforce IDs resolved to business keys, picklists normalised, ' +
          'field validation applied.',
      },
      {
        n: '04',
        name: 'Gold — business-ready',
        when: 'Weeks 7–9',
        bar: { from: 6, typical: 8, most: 9 },
        detail:
          'Pipeline by account, case resolution, conversion funnels — loaded into Snowflake or ' +
          'Redshift for the BI tools you already have.',
      },
      {
        n: '05',
        name: 'Handover',
        when: 'Week 10',
        bar: { from: 9, typical: 10, most: 10 },
        end: true,
        detail: 'DAG repository with CI/CD, RBAC configured, failure and SLA alerts wired, runbook written.',
      },
    ],
    stack:
      'Bulk API 2.0 · Bi-directional sync · Heroku · AWS MWAA · Self-hosted K8s · Snowflake / Redshift',
    terms: [
      { term: 'Shape',          detail: 'Fixed-scope project' },
      { term: 'Typical length', detail: lengthOf('airflow-data-pipelines') },
      { term: 'Priced',         detail: 'Fixed scope, per pipeline' },
      { term: 'Starts with',    detail: 'A source audit' },
      { term: 'You keep',       detail: 'DAG repository, CI/CD, alerts, runbook' },
    ],
    cta: 'Book a source audit',
    detail: {
      title:
        'Move data on a schedule that ' +
        '<span class="mark mark--draw">recovers itself</span>.',
      lede:
        'Salesforce API limits make naive syncs brittle the moment volume arrives. Airflow ' +
        'gives the job a dependency graph, retry with backoff, and an audit trail of every ' +
        'run. We write the DAGs idempotent — a re-run is always safe — and hand you the ' +
        'repository with the CI that deploys it.',
      spine: {
        title: 'Ten weeks, bronze to gold.',
        note: 'Drawn to scale',
        cols: 10,
        axis: [
          { at: 0, mark: 'Week 0' }, { at: 2, mark: '02' }, { at: 4, mark: '04' },
          { at: 6, mark: '06' }, { at: 8, mark: '08' }, { at: 10, mark: '10' },
        ],
        legend: [
          { mod: 'min',   label: 'Committed' },
          { mod: 'range', label: 'Where the range moves' },
          { mod: 'cap',   label: 'Handover' },
        ],
        caption:
          'Drawn at the long end: ten weeks. Six is the same five stages with fewer objects in ' +
          'each layer — the audit and the handover do not shrink. <b>Every layer is ' +
          'idempotent, so a re-run is always safe.</b>',
      },
      scope: {
        title: 'What the pipeline work covers.',
        lede:
          'Most pipelines need the first few of these. The last ones are about how it runs once ' +
          'it is yours, which is the half that decides whether you call us again.',
      },
      manifest: {
        kicker: 'The handover',
        title: 'What you are left holding.',
        note:
          'A pipeline is only as good as the morning somebody else has to fix it. These four ' +
          'are what make that possible without us.',
        items: [
          {
            title: 'The DAG repository',
            detail:
              'Every DAG, every operator, every test, with the CI that deploys them — in your ' +
              'git.',
          },
          {
            title: 'The access model',
            detail:
              'Airflow RBAC configured per team, and every credential rotated out of the code ' +
              'into a secrets backend.',
          },
          {
            title: 'The alerts',
            detail:
              'Failure and SLA-miss alerts wired to wherever your team already looks, not to a ' +
              'dashboard nobody opens.',
          },
          {
            title: 'The runbook',
            detail:
              'How to re-run a day, how to backfill, and why every task is safe to run twice.',
          },
        ],
      },
    },
  },
  {
    slug: 'support-and-managed-services',
    n: '08',
    id: 'support',
    name: 'Support & managed services',
    contents: 'A retainer with named response times',
    shape: 'Retainer · rolling month',
    roll: 0,
    stamp: { shape: 'Monthly retainer' },
    tagline: 'Keep the org healthy between projects.',
    lead:
      'Salesforce ships three releases a year, your business changes more often than that, and ' +
      'integrations rot quietly. A retainer buys named response times, hours that flex between ' +
      'fixing and building, and a quarterly review that tells you what is accumulating before it ' +
      'breaks. Bugs come back with a written root cause, not just a patch.',
    track: [
      {
        n: '01',
        name: 'Org health review',
        when: 'Month 1, once',
        bar: { from: 0, typical: 1, most: 1 },
        detail:
          'We read the org first: profiles, sharing, automation debt, governor-limit trends. You ' +
          'get the report whether or not you continue.',
      },
      {
        n: '02',
        name: 'Triage & response',
        when: 'Continuous',
        roll: 1,
        detail:
          'Every ticket triaged against a named response window. P1 emergency response is ' +
          'unlimited on every tier.',
      },
      {
        n: '03',
        name: 'Enhancements',
        when: 'Continuous',
        roll: 1,
        detail:
          'Retainer hours flex — the same hours cover a broken flow this week and a new report ' +
          'next week.',
      },
      {
        n: '04',
        name: 'Release testing',
        when: 'Three times a year',
        bars: [
          { from: 1, typical: 1.7, most: 1.7 },
          { from: 5, typical: 5.7, most: 5.7 },
          { from: 9, typical: 9.7, most: 9.7 },
        ],
        detail:
          'Sandbox testing ahead of each Salesforce release, so Spring does not surprise you in ' +
          'production. Then it repeats.',
      },
    ],
    ending: 'rolling',
    stackLabel: 'Tiers',
    stack:
      'Essentials, 10 hrs/mo · Growth, 20 hrs/mo · Enterprise, 40+ hrs/mo · ' +
      'Quarterly health review · Release management',
    terms: [
      { term: 'Shape',       detail: 'Monthly retainer' },
      { term: 'Term',        detail: 'Rolling month' },
      { term: 'Priced',      detail: 'By tier, hours flex within it' },
      { term: 'Starts with', detail: 'An org health review' },
      { term: 'You keep',    detail: 'Health reports, ticket history, runbooks' },
    ],
    cta: 'Book an org health review',
    detail: {
      title:
        'Salesforce support with response times you can ' +
        '<span class="mark mark--draw">hold us to</span>.',
      lede:
        'The org was clean the day it was handed over. Then three releases landed, four people ' +
        'left, and an integration started failing at 3am on Sundays. A retainer is what stops ' +
        'that from becoming a project again — named response times, hours that move between ' +
        'fixing and building, and a quarterly read that finds the debt before it finds you.',
      spine: {
        title: 'A month, and then the same month again.',
        note: 'One year, drawn to scale',
        cols: 12,
        axis: [
          { at: 0, mark: 'Month 0' }, { at: 3, mark: '03' }, { at: 6, mark: '06' },
          { at: 9, mark: '09' }, { at: 12, mark: '12' },
        ],
        legend: [
          { mod: 'min',  label: 'Scheduled' },
          { mod: 'roll', label: 'Runs until you stop it' },
        ],
        caption:
          'Nothing on this figure ends. Two rows run off the right edge and a third repeats — ' +
          'which is the whole difference between a retainer and the six projects beside it. ' +
          '<b>Rolling month: you can stop it the month it stops earning its place.</b>',
      },
      scope: {
        title: 'What the retainer covers.',
        lede:
          'The retainer covers all of these from month one — no tier buys you fewer of them. ' +
          'What changes between tiers is how many hours you have and how fast we pick up.',
        before: [
          {
            id: 'defined-slas',
            title: 'Defined SLAs',
            intro:
              'Every ticket is triaged and answered inside a named window. These are the ' +
              'numbers that get quoted back at us, so they are the numbers on the contract.',
            device: 'windows',
          },
        ],
        after: [
          {
            id: 'retainer-tiers',
            title: 'Retainer tiers',
            intro:
              'Three tiers, matched to how much Salesforce activity you actually have. Rates ' +
              'are quoted after the first call, once there is a scope to put a number against.',
            device: 'tiers',
          },
        ],
      },
      manifest: {
        kicker: 'Every month',
        title: 'What the retainer leaves behind.',
        note:
          'A retainer that only closes tickets is a cost. These are the things that accumulate ' +
          'instead, and they are yours whether or not you renew.',
        items: [
          {
            title: 'The health reports',
            detail:
              'Every quarterly read of the org, with findings prioritised by risk and effort. ' +
              'The first one is yours even if you stop there.',
          },
          {
            title: 'The ticket history',
            detail:
              'Every incident with its written root cause, so a pattern is visible rather than ' +
              'remembered.',
          },
          {
            title: 'The runbooks',
            detail:
              'Deployment steps, sandbox strategy, and what to check after a release.',
          },
          {
            title: 'The release record',
            detail:
              'What changed, when, and what it broke. The document nobody has until they need ' +
              'it.',
          },
        ],
      },
    },
  },
];


// The retainer's promise, and the only engagement that has one. Sourced
// from support-and-managed-services.md, which states the same four
// windows and the unlimited-P1 line.
export const WINDOWS = [
  { priority: 'P1 — Critical', time: '< 1 hour',        detail: 'Production down, data loss risk' },
  { priority: 'P2 — High',     time: '< 4 hours',       detail: 'Key process broken, workaround exists' },
  { priority: 'P3 — Medium',   time: '1 business day',  detail: 'Non-blocking bug or enhancement' },
  { priority: 'P4 — Low',      time: '3 business days', detail: 'Cosmetic issue, long-term request' },
];


/**
 * The three retainer tiers, for the comparison table on engagement 07's
 * scope document. Sourced from support-and-managed-services.md, which
 * states the same hours, coverage, cadence and the unlimited-P1 line.
 *
 * Typed structurally rather than by importing CompareTable's `CompareRow`,
 * because an .astro file cannot export a type for another module to import.
 *
 * There are no rates here, and there is no rate row. The tiers differ by
 * hours, coverage and cadence, which is what a buyer compares; the number
 * comes after the first call.
 */
export const TIERS: Array<{
  label: string;
  cells: Array<string | { text: string; muted?: boolean }>;
}> = [
  { label: 'Hours / month',      cells: ['10', '20', '40+'] },
  {
    label: 'Coverage',
    cells: ['P1–P3', 'P1–P2 same-day', 'Everything in Growth, plus a dedicated resource'],
  },
  { label: 'Review cadence',     cells: ['Quarterly', 'Monthly', 'Weekly standups'] },
  {
    label: 'Release management',
    cells: [{ text: 'Not included', muted: true }, 'Included', 'Full org management'],
  },
  { label: 'P1 emergency',       cells: ['Unlimited', 'Unlimited', 'Unlimited'] },
];

/** Engagement by content-collection id, for the detail route. */
export const BY_SLUG = new Map(ENGAGEMENTS.map((e) => [e.slug, e] as const));
