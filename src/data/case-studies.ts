export interface CaseStudy {
  id: string;
  index: string;
  company: string;
  industry: string;
  service: string;
  metric: string;
  metricLabel: string;
  summary: string;
  tags: string[];
  duration: string;
  result: string;
  /* The index row. `/case-studies/` states each study as a change of
     state -- what was true, what is true now -- so the ledger carries its
     own short copy rather than trimming `summary` down to fit. The figure
     itself is `metric`, not repeated here; only its caption is. */
  ledger: {
    client: string;
    tags: string;
    when: string;
    was: string;
    now: string;
    figLabel: string;
  };
  // Detail page — core
  /** The <title> and the JSON-LD headline. Reads like a piece of writing;
      the page's own H1 is `detailTitle`, which reads like a fact. */
  headline: string;
  executiveSummary: string;
  challenge: string;
  challengePoints: string[];
  solution: string;
  solutionSteps: { title: string; body: string; path?: string }[];
  outcomes: { metric: string; label: string }[];
  testimonial?: { quote: string; name: string; role: string };
  // Detail page — rich sections
  whyNotOffShelf?: string;
  toolComparison?: {
    tool: string;
    category: string;
    doesWell: string;
    limitation: string;
    /** Set on the tool that WAS picked. Two of these registers list the
        chosen platform alongside the ones it beat, and printing "rules it
        out" against the thing we shipped would be a plain lie. */
    chosen?: boolean;
  }[];
  /* The four below are required, not optional: the detail page renders
     each of them under a heading of its own, so a study missing one
     would ship a section head with nothing under it. Every study
     carries all four. */
  technicalHighlights: { title: string; body: string }[];
  /** The before/after band the detail page opens on. Every row is one
      thing the engagement changed, struck through on the left. */
  resultsTable: { metric: string; before: string; after: string }[];
  whatDemonstrates: { title: string; body: string }[];
  techStack: { layer: string; technology: string }[];

  /* ── Detail page — the page's own furniture ──────────────────────
     `headline` is a sentence about the work; these are what the page
     itself prints. Kept per study rather than derived: which phrase
     carries the crayon, and what each section's stamp says, are copy
     decisions and not something a template can guess. */

  /** The H1. Contains `detailMark` verbatim, once. */
  detailTitle: string;
  /** The substring of `detailTitle` that takes the hero mark. */
  detailMark: string;
  detailLede: string;
  /** One extra fact in the masthead stand, specific to this engagement. */
  standNote: { label: string; detail: string };
  /** Title over the before/after band. */
  stateTitle: string;
  /** Heading of the band's first column -- the thing each row is about. */
  stateWhat: string;
  /** True when `solutionSteps` are stages of ONE path -- then the section
      draws its rail and numbers them. False when they are parallel parts
      of one build, where a numeral would only decorate. */
  buildChain: boolean;
  buildNote: string;
  notesNote: string;
  /** Omitted with `toolComparison`. */
  ruledoutNote?: string;
  /** Index into `challengePoints` of the constraint that picks the
      architecture, where exactly one does. */
  decisivePoint?: number;
  decisiveStamp?: string;
  /** The line the neighbouring pages print under this study's name. */
  pagerNote: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'nonprofit-web-platform',
    index: '01',
    company: 'Global Non-Profit Organization',
    industry: 'Non-Profit',
    service: 'Full-Stack · Salesforce',
    metric: '2+ yrs',
    metricLabel: 'ongoing platform engagement — serving 180+ countries',
    summary:
      'A global spiritual non-profit with presence in 180+ countries had outgrown its legacy PHP monolith — no CRM integration, growing technical debt, and a scalability ceiling that threatened every major event launch. CloudAlgo rebuilt the platform from the ground up: a Next.js 14 application with Salesforce CRM, Stripe-powered enrollment and donations, AWS Cognito passwordless auth, and a full content library — a platform the client has continued expanding for two years and counting.',
    tags: ['Next.js 14', 'Salesforce', 'Stripe', 'AWS Cognito', 'Heroku', 'Segment', 'React Query', 'Framer Motion'],
    duration: 'Ongoing (2+ years)',
    result: 'Full platform rebuild replacing a legacy PHP monolith — CRM-connected, continuously expanding',

    ledger: {
      client: 'A global non-profit, 180+ countries',
      tags: 'Non-profit · Full-stack & Salesforce',
      when: 'Ongoing',
      was: 'A PHP monolith with no CRM. Member records, enrolments and activity kept in three places that never agreed.',
      now: 'One Next.js platform with Salesforce underneath it. Enrolment, donations and membership all land on the same record.',
      figLabel: 'on one platform, was three',
    },

    detailTitle: 'They had a PHP monolith and no CRM. Two years on, they are still building on what replaced it.',
    detailMark: 'still building on what replaced it',
    detailLede:
      'A global non-profit serving 180+ countries ran its community on a custom PHP platform with no CRM behind it — member records, course enrolments and donations in separate systems that never agreed. We rebuilt it as a Next.js platform with Salesforce as the backbone and six external systems behind one backend layer. The client has been extending it ever since.',
    standNote: { label: 'Systems integrated', detail: 'Six, behind one Node.js backend layer.' },
    stateTitle: 'One platform, before and after',
    stateWhat: 'The platform',
    buildChain: false,
    buildNote: 'Five parts of one platform',
    notesNote: 'What keeps it navigable at 4,500 commits',
    pagerNote: 'One platform with a CRM under it, two years and counting',

    headline: 'From a legacy PHP monolith to a CRM-connected platform built for global reach.',

    executiveSummary:
      'A global non-profit spiritual organization operating across 180+ countries had outgrown its custom PHP platform — a monolith with no CRM connectivity, mounting technical debt, and a scalability ceiling that made every course launch a risk. CloudAlgo led a deliberate full-platform rebuild: a Next.js 14 application with a Node.js backend, Salesforce as the CRM backbone, Stripe for payments and donations, and AWS Cognito for passwordless authentication. The result is a modern, maintainable platform the client has continued to expand for two-plus years — adding course types, membership tiers, content features, and integrations — the clearest signal that the architecture was right.',

    challenge:
      'The client had served its global community for years on a custom PHP platform. But the system had accumulated enough technical debt that every new feature became a negotiation with legacy constraints. More critically, there was no CRM integration: member data, course enrollments, and user activity lived in separate silos with no unified view, no automation, and no path to real-time reporting.',

    challengePoints: [
      'No CRM connectivity — member records, course enrollments, and user activity lived in separate systems with no single source of truth and no automation between them.',
      'Feature delivery was slow. New requests required navigating a legacy PHP codebase with no modern tooling, no standardized patterns, and no onboarding documentation for new contributors.',
      'Traffic spikes during major course launches and enrollment windows pushed the PHP system toward its scalability ceiling.',
      'Without standardized development patterns, every new contributor increased the risk of regressions and maintenance became progressively harder with every release.',
    ],

    solution:
      'CloudAlgo led a full-platform rebuild — not a gradual migration, but a deliberate re-architecture. The new platform is a Next.js 14 application (React 18, Pages Router) deployed on Heroku, with a Node.js backend that normalizes data contracts across six external systems, Salesforce as the unified CRM backbone, and Heroku Marketing Cloud for campaign and transactional email automation.',

    solutionSteps: [
      {
        title: 'Course & Event Platform',
        body: 'A complete enrollment system for in-person courses, online workshops, ticketed events, youth programs, and retreats. Users can discover offerings via geo-based center finder (Google Maps + Autocomplete), register, pay via Stripe with saved payment methods and coupon support, and receive Apple Wallet passes and QR codes for in-person check-in — all within a single cohesive experience.',
      },
      {
        title: 'Authentication & Identity',
        body: 'Authentication runs on AWS Cognito with Cognito Passwordless Auth — enabling one-tap magic link and OTP logins alongside traditional email/password flows. This reduced friction at account creation and login significantly, critical for an audience spanning a wide age range and range of technical comfort across 180+ countries.',
      },
      {
        title: 'Membership & Content Platform',
        body: 'A complete membership lifecycle covering tier selection, billing, renewal, and personalized content gating. The content layer includes Daily Sky (daily inspiration), a guided meditation audio/video library, Ask Gurudev Q&A, a wisdom article and video collection, and a global audio player that persists playback state across page navigation.',
      },
      {
        title: 'Donation Platform',
        body: 'A full donation lifecycle built on Salesforce, Stripe, and Salesforce Community Cloud — one-time and recurring giving options, automated Salesforce sync per transaction, a donor self-service portal (giving history, tax receipts, payment method management), campaign and fund attribution, and Marketing Cloud acknowledgement emails triggered on transaction confirmation. This replaced a manual, spreadsheet-driven process with the organization\'s first fully auditable, end-to-end donation tracking system.',
      },
      {
        title: 'CRM-Connected Analytics',
        body: 'Every significant user action — page views, course views, checkout initiation, purchases — is tracked through Segment into Salesforce, enabling the marketing team to build audience segments, trigger Marketing Cloud automations, and report on enrollment funnel performance with no manual data entry.',
      },
    ],

    technicalHighlights: [
      {
        title: 'Six External Systems, One Clean Backend Layer',
        body: 'The platform integrates Salesforce, Salesforce Community Cloud, Stripe, AWS Cognito, Segment, and Heroku Marketing Cloud — each with distinct data models and failure modes. CloudAlgo built a Node.js backend layer that normalizes data contracts, handles retries, and decouples the frontend from individual vendor APIs. A Salesforce schema change doesn\'t cascade into the UI. A Stripe webhook failure doesn\'t leave the client state inconsistent.',
      },
      {
        title: 'Enforced Conventions at Scale',
        body: 'With a large team and 4,500+ commits over two years, ad-hoc patterns accumulate fast. Enforced conventions kept the codebase navigable: a custom useRouter hook that automatically preserves UTM parameters across every navigation; a useEntityTracking hook that standardizes analytics event payloads so no developer can accidentally fire a malformed track event; Pino structured logging replacing console.log throughout; React Query for consistent server-state management; and global modal and alert context providers preventing z-index conflicts and duplicated state logic scattered across features.',
      },
      {
        title: '82% SSR Payload Reduction',
        body: 'One major performance initiative reduced a key centers page SSR payload from 228 kB to 42 kB — an 82% reduction — by selectively deferring non-critical data to client-side fetches. Combined with Next.js SWC compilation, WebP image conversion at build time, and ongoing bundle analysis via @next/bundle-analyzer, the platform handles course launch traffic spikes without degradation.',
      },
      {
        title: 'Multi-Environment CI/CD with Sentry Monitoring',
        body: 'Three environments — development, QA, and production — each with distinct API credentials, feature flags, and Salesforce org connections. Heroku pipelines coordinate promotion from QA to production. Sentry monitors error rates post-deploy, and structured Pino logs give the engineering team clean, searchable production visibility without opening a dashboard.',
      },
    ],

    outcomes: [
      { metric: '2+ yrs', label: 'Ongoing client engagement — platform continuously expanding' },
      { metric: '82%', label: 'SSR payload reduction on centers page (228 kB → 42 kB)' },
      { metric: '6', label: 'External systems integrated cohesively — Salesforce, Stripe, Cognito, Segment, and more' },
    ],

    resultsTable: [
      { metric: 'Platform foundation', before: 'Legacy PHP monolith — no modern tooling', after: 'Next.js 14, React 18, modular architecture on Heroku' },
      { metric: 'CRM integration', before: 'None — siloed member and enrollment data', after: 'Salesforce as unified source of truth for all member activity' },
      { metric: 'Donation tracking', before: 'Manual, spreadsheet-driven process', after: 'Full Salesforce-backed lifecycle with automated receipts and donor portal' },
      { metric: 'Authentication', before: 'Email/password only', after: 'AWS Cognito with passwordless magic link and OTP' },
      { metric: 'Feature delivery', before: 'Weeks — navigating legacy constraints', after: 'Days — clean architecture and reusable components' },
      { metric: 'SSR payload (centers page)', before: '228 kB', after: '42 kB (82% reduction)' },
      { metric: 'Analytics pipeline', before: 'No structured pipeline', after: 'Segment → Salesforce with full enrollment funnel visibility' },
      { metric: 'Deployment', before: 'Manual', after: 'Heroku multi-environment pipelines with Sentry error monitoring' },
    ],

    whatDemonstrates: [
      {
        title: 'We rebuild when rebuilding is right.',
        body: 'A gradual migration would have preserved the constraints of the PHP platform while adding complexity. We made the case for a clean break, designed the new architecture to handle the client\'s actual integration requirements from day one, and delivered a platform the team could own and extend without re-engaging us for every change.',
      },
      {
        title: 'Integration depth requires an abstraction layer.',
        body: 'Six external systems with distinct data models is a coordination problem, not a configuration problem. Our Node.js backend treats integration complexity as a first-class architectural concern — not something left for the frontend to handle ad hoc.',
      },
      {
        title: 'Enforced conventions pay for themselves.',
        body: 'A custom useRouter hook, a standardized analytics event contract, global context providers for modals and alerts — these feel like overhead in week one. By year two, with 4,500+ commits from a large team, they\'re the reason the codebase is still navigable and safe to work in.',
      },
      {
        title: 'Ongoing engagement is the real metric.',
        body: 'The strongest signal that a platform was built right is that the client keeps building on it. Two years in, the client is adding course types, membership tiers, content features, and integrations — not rewriting.',
      },
    ],

    techStack: [
      { layer: 'Framework', technology: 'Next.js 14 (Pages Router), React 18' },
      { layer: 'Styling', technology: 'SCSS, Tailwind CSS, React Bootstrap 5' },
      { layer: 'Authentication', technology: 'AWS Cognito, Cognito Passwordless Auth (magic link + OTP)' },
      { layer: 'Payments', technology: 'Stripe (one-time, subscriptions, saved payment methods)' },
      { layer: 'CRM', technology: 'Salesforce, Salesforce Community Cloud' },
      { layer: 'Email / SMS Automation', technology: 'Heroku Marketing Cloud' },
      { layer: 'Analytics Pipeline', technology: 'Segment → Salesforce' },
      { layer: 'Server State', technology: 'React Query (TanStack)' },
      { layer: 'Forms', technology: 'Formik, React Hook Form, Yup, Zod' },
      { layer: 'Hosting & Deployment', technology: 'Heroku (multi-environment pipelines)' },
      { layer: 'Error Tracking', technology: 'Sentry' },
      { layer: 'Logging', technology: 'Pino (structured, leveled JSON)' },
      { layer: 'Maps', technology: 'Google Maps, Google Places Autocomplete' },
      { layer: 'Media', technology: 'Vimeo, YouTube, React Player' },
      { layer: 'Animations', technology: 'Framer Motion' },
      { layer: 'Build', technology: 'SWC, Next.js Bundle Analyzer, WebP conversion scripts' },
    ],
  },
  {
    id: 'enterprise-data-pipeline',
    index: '02',
    company: 'Enterprise Manufacturer',
    industry: 'Manufacturing',
    service: 'Data Engineering',
    metric: '<15 min',
    metricLabel: 'end-to-end data latency — down from 24 hours',
    summary:
      'An enterprise manufacturer was sitting on a goldmine of operational data — spread across CRM and ERP systems — but couldn\'t act on any of it in real time. CloudAlgo delivered a fully automated, cloud-native medallion pipeline that replaced 24-hour-stale reports with sub-15-minute analytics, eliminated manual reconciliation, and gave leadership a single source of truth they could trust.',
    tags: [
      'Apache Airflow',
      'PostgreSQL',
      'Redis',
      'Python',
      'Celery',
      'Cerberus',
      'Docker',
      'Heroku',
    ],
    duration: 'Ongoing engagement',
    result: 'Sub-15 min data freshness across CRM + ERP with zero manual intervention',

    ledger: {
      client: 'An enterprise manufacturer, multi-division',
      tags: 'Manufacturing · Data engineering',
      when: 'Ongoing',
      was: 'Yesterday\'s numbers. A batch 12 to 24 hours behind sat between the CRM, the ERP and anyone asking a question.',
      now: 'A medallion pipeline in Airflow. CRM and ERP land in one analytics layer, on a schedule nobody has to run.',
      figLabel: 'end-to-end data latency',
    },

    detailTitle: 'Leadership ran on yesterday\u2019s numbers. Now nothing on the dashboard is more than fifteen minutes old.',
    detailMark: 'more than fifteen minutes old',
    detailLede:
      'An enterprise manufacturer had CRM and ERP data it could not act on: reports 12 to 24 hours behind, account identifiers that did not match across the two systems, and reconciliation done by hand every week. We built a medallion pipeline in Airflow that ingests, validates and publishes both systems into one analytics layer, on a schedule nobody has to run.',
    standNote: { label: 'Cadence', detail: 'Every 15 minutes, with no manual step in the cycle.' },
    stateTitle: 'One sync window, before and after',
    stateWhat: 'The sync',
    buildChain: true,
    buildNote: 'Four layers, each with a contract',
    notesNote: 'Why it still runs at year two',
    ruledoutNote: 'Seven tools evaluated, none of them whole',
    pagerNote: 'Yesterday\u2019s numbers, now under 15 minutes old',

    headline: 'From disconnected systems to a unified, analytics-ready data layer.',

    executiveSummary:
      'An enterprise manufacturing business was sitting on a goldmine of operational data — spread across a leading CRM platform, an ERP system, and multiple business divisions — but couldn\'t act on any of it in real time. Reports were hours stale. Sales goals couldn\'t be reconciled with actual shipments. Account data across systems drifted out of sync daily. CloudAlgo designed and delivered a fully automated, cloud-native data pipeline that ingests raw transactional data, transforms it through a rigorous validation and enrichment layer, and surfaces analytics-ready datasets — all with sub-15-minute latency, fault-tolerant processing, and zero manual intervention. The result: a single source of truth that leadership, operations, and sales teams could trust and act on.',

    challenge:
      'Modern enterprises don\'t have a shortage of data. They have a coordination problem. CRM platforms capture customer relationships. ERP systems manage inventory, orders, and shipments. Finance tracks invoices. Sales sets goals by product and division. But these systems rarely talk to each other — and when they do, it\'s through brittle, manual exports and spreadsheet-driven reconciliation that breaks the moment volume increases.',

    challengePoints: [
      'Analytics dashboards reflected data that was 12–24 hours behind operational reality, making it impossible to act on live business conditions.',
      'Customer records in the CRM used different identifiers than those in the ERP, meaning shipment and order data couldn\'t be reliably attributed to the correct accounts. Teams spent hours per week manually reconciling discrepancies.',
      'Raw records from source systems contained inconsistencies — missing fields, incorrect types, unformatted strings, duplicate rows — that propagated silently into downstream reports.',
      'Sales goals set at the product and division level had no automated connection to shipped quantities. KPI tracking required manual extraction and formula work in spreadsheets.',
      'The business operated across multiple divisions, each with distinct data semantics, product lines, and reporting requirements.',
      'Any failure in existing data flows caused complete data loss for that sync window, with no recovery path short of a manual re-pull.',
    ],

    whyNotOffShelf:
      'Before engaging CloudAlgo, the business evaluated several standard enterprise integration platforms. Each had fundamental limitations that ruled it out. Off-the-shelf tools either handle extraction OR transformation — rarely both with the nuance required for business-specific rules, multi-system account resolution, and division-level data semantics. Stitching together three or four tools creates its own integration burden, operational overhead, and failure surface. CloudAlgo built what the tools couldn\'t provide: a unified, end-to-end pipeline with business logic embedded at every layer.',

    toolComparison: [
      {
        tool: 'Fivetran',
        category: 'Managed ELT',
        doesWell: 'Excellent pre-built connectors; zero-config replication',
        limitation:
          'Pure EL — no transformation logic. Business rules, formula evaluation, and multi-division enrichment are not supported. All logic still lives in spreadsheets.',
      },
      {
        tool: 'Stitch Data',
        category: 'Managed ELT',
        doesWell: 'Fast setup; affordable entry point',
        limitation:
          'Same limitation as Fivetran. Replicates data as-is. Data quality enforcement and derived field calculation require a separate transformation layer the tool doesn\'t provide.',
      },
      {
        tool: 'dbt',
        category: 'Transformation Layer',
        doesWell: 'SQL-native transformations; version control',
        limitation:
          'Only the "T" in ETL. Still requires a loading mechanism, orchestration, and a separate validation framework. Not a pipeline — a component.',
      },
      {
        tool: 'MuleSoft',
        category: 'iPaaS / Integration',
        doesWell: 'Robust connector library; enterprise-grade support',
        limitation:
          'Extremely heavyweight. Licensing costs are prohibitive. Built for API-centric integrations, not high-volume batch data pipelines with complex state management.',
      },
      {
        tool: 'Azure Data Factory',
        category: 'Cloud ETL',
        doesWell: 'Native Azure integration; visual pipeline builder',
        limitation:
          'Vendor lock-in to Microsoft cloud. Limited support for formula-based field derivation and schema-level validation. Customisation requires significant DevOps overhead.',
      },
      {
        tool: 'Talend',
        category: 'Enterprise ETL',
        doesWell: 'Feature-rich; handles complex transformations',
        limitation:
          'On-premise orientation; steep learning curve; expensive licensing. Overengineered for this use case and slow to adapt to schema changes.',
      },
      {
        tool: 'Salesforce Flow / Data Loader',
        category: 'Native CRM Tooling',
        doesWell: 'Tight CRM integration; no extra infrastructure',
        limitation:
          'No concept of a data warehouse layer. Cannot transform, validate, or route data to external systems at scale. API rate limits become a bottleneck immediately.',
      },
    ],

    solution:
      'CloudAlgo designed and implemented a multi-stage medallion architecture — a proven data engineering pattern where raw data is progressively refined through Bronze, Silver, and Gold layers before reaching analytics consumers. Each layer has a clear contract: what comes in, what transformations are applied, and what comes out. The entire system runs on Apache Airflow with Celery-based distributed execution, deployed to a managed cloud environment with PostgreSQL as the warehouse layer and Redis for real-time coordination between pipeline stages.',

    solutionSteps: [
      {
        title: 'Intelligent Ingestion — Staging Layer',
        path: 'API \u2192 Redis state',
        body: 'A dedicated orchestration DAG receives table-level payloads via API and uses Redis-backed state coordination to track which tables have arrived for a given sync window. Only when all expected tables for a division are confirmed does the downstream pipeline trigger — eliminating the partial-data problem that caused reporting inconsistencies. Configurable timeout and retry handling ensure no sync window is silently skipped.',
      },
      {
        title: 'Bronze — The Faithful Copy',
        path: 'Staging \u2192 Bronze',
        body: 'Raw data lands in the Bronze layer with minimal transformation — the goal is a clean, complete, denormalized record of what arrived. Records are processed in configurable batch sizes using executemany semantics so individual row failures don\'t abort the entire batch. A custom formula evaluation engine handles concatenation, unit conversion (tons ↔ pounds), date part extraction, and duration calculations — all driven by JSON configuration, not hardcoded logic. Business analysts can update derivation rules without touching Python.',
      },
      {
        title: 'Silver — The Trust Layer',
        path: 'Bronze \u2192 Silver',
        body: 'The Silver pipeline is where raw data becomes trusted data. Every record passes through Cerberus schema validation (type checking, required field enforcement, value constraints), duplicate detection, column normalisation (uppercase, trimming, type coercion, null handling), and upsert writes. New records are inserted; existing records are updated on conflict, making the pipeline idempotent and safe to re-run. Anything downstream can trust that Silver data is structurally valid, deduplicated, and correctly typed.',
      },
      {
        title: 'Gold — Analytics at Speed',
        path: 'Silver \u2192 Gold',
        body: 'The Gold layer exposes analytics-optimised schemas at 15-minute cadence. A Table Sync DAG maps Silver columns to Gold schema names with idempotent upserts. An Account Relationship DAG solves the hardest cross-system problem — linking CRM account identifiers to ERP records across 4 destination tables using functional indexes on TRIM()+LOWER() columns, cutting query time by 75–90%. A KPI Calculation DAG joins shipped quantity data against annual and prior-year sales goals at product and division level, giving sales leadership a live view of performance vs. plan.',
      },
    ],

    technicalHighlights: [
      {
        title: 'Config-Driven Architecture',
        body: 'Every pipeline stage — table definitions, column mappings, validation schemas, formula rules, relationship joins — is driven by JSON configuration files. Adding a new table or modifying a transformation does not require code changes. This makes the system maintainable by data engineers who didn\'t write it and adaptable to schema evolution without pipeline downtime.',
      },
      {
        title: 'Fault Tolerance by Design',
        body: 'Batch processing uses executemany with per-row error isolation. A single bad record is logged and skipped — it doesn\'t abort the batch. Failed rows are counted, reported in email notifications, and surfaced in the Airflow task log for investigation. The pipeline always completes; it never silently swallows failures.',
      },
      {
        title: '75–90% Performance Gain via Index Optimisation',
        body: 'An early version of the Account Relationship DAG used ILIKE pattern matching for account lookup — readable, but unindexable. As data volumes grew, this stage became a multi-hour bottleneck. CloudAlgo created functional indexes on TRIM(source_account_id) and TRIM(LOWER(division)) columns, then rewrote queries using identical semantics that were now index-scannable. Execution time dropped from 1–2 hours to 10–30 minutes — a 75–90% reduction with no change to output correctness.',
      },
      {
        title: 'Standardised Operational Observability',
        body: 'Every pipeline stage emits structured email notifications in a consistent format: [ENVIRONMENT] [STATUS] PIPELINE — DIVISION — RECORDS_PROCESSED / RECORDS_FAILED. Operations teams see at a glance what ran, whether it succeeded, what division it processed, and how many records were affected — without opening Airflow. Partial failures surface immediately, not after someone notices a dashboard anomaly.',
      },
    ],

    outcomes: [
      { metric: '<15 min', label: 'End-to-end data freshness (was 12–24 hours)' },
      { metric: '90%', label: 'Faster account linkage query (1–2 hrs → 10–30 min)' },
      { metric: '0', label: 'Manual interventions required per sync cycle' },
    ],

    resultsTable: [
      { metric: 'Data freshness', before: '12–24 hours behind', after: 'Sub-15 minutes end-to-end' },
      { metric: 'Account reconciliation', before: 'Manual, weekly, error-prone', after: 'Automated every 15 minutes' },
      { metric: 'Account linkage query time', before: '1–2 hours', after: '10–30 minutes (75–90% faster)' },
      { metric: 'Data quality enforcement', before: 'None — errors propagated silently', after: 'Schema-validated at Silver layer; failures isolated and reported' },
      { metric: 'Goal vs. actuals tracking', before: 'Manual spreadsheet extraction', after: 'Automated KPI calculation on every sync' },
      { metric: 'Pipeline failures', before: 'Total data loss for sync window', after: 'Row-level fault isolation; partial success reported' },
      { metric: 'Schema change process', before: 'Code modification + redeploy', after: 'Config file update' },
      { metric: 'Multi-division support', before: 'Separate, inconsistent scripts', after: 'Unified pipeline with division-aware routing' },
    ],

    whatDemonstrates: [
      {
        title: 'We build to the real requirement, not the template.',
        body: 'Off-the-shelf tools failed here not because they\'re bad tools, but because the problem demanded business logic embedded in the pipeline — formula evaluation, cross-system account resolution, division-aware routing, schema validation with specific rules per table. We designed a system where all of that logic is first-class, not bolted on.',
      },
      {
        title: 'We engineer for the second year, not just the launch.',
        body: 'Config-driven architecture, functional indexes, fault-tolerant batching, standardised observability — none of these are features you need on day one. They\'re the features that keep a pipeline running reliably at year two when data volumes have doubled and the original engineers have moved on.',
      },
      {
        title: 'We treat performance as a correctness requirement.',
        body: 'A pipeline that takes two hours to run every 15 minutes isn\'t a pipeline — it\'s a liability. Performance optimisation isn\'t a luxury phase; it\'s part of building something production-worthy.',
      },
      {
        title: 'We leave teams capable of owning what we build.',
        body: 'JSON-driven configuration, documented schemas, standardised notification formats, and clean DAG separation mean the team inheriting this system can understand, extend, and debug it without re-engaging us for every change.',
      },
    ],

    techStack: [
      { layer: 'Orchestration', technology: 'Apache Airflow 2.6.1 with CeleryExecutor' },
      { layer: 'Distributed Processing', technology: 'Celery 5.3.1 + Redis' },
      { layer: 'Data Warehouse', technology: 'PostgreSQL (Staging / Bronze / Silver / Gold schemas)' },
      { layer: 'Schema Validation', technology: 'Cerberus' },
      { layer: 'Formula Evaluation', technology: 'Custom Python engine (Sympy + pandas)' },
      { layer: 'Account Matching', technology: 'Levenshtein distance + functional index optimisation' },
      { layer: 'Deployment', technology: 'Docker + Heroku (managed cloud)' },
      { layer: 'Notifications', technology: 'Mailgun (structured HTML email)' },
      { layer: 'Monitoring', technology: 'Papertrail (log aggregation) + Librato (metrics)' },
      { layer: 'Language', technology: 'Python 3.x' },
    ],
  },
  {
    id: 'salesforce-emr-sync',
    index: '03',
    company: 'Pediatric Therapy Clinic',
    industry: 'Healthcare',
    service: 'Heroku · Salesforce · Integration',
    metric: '0',
    metricLabel: 'manual data entry required — every patient sync fully automated',
    summary:
      'How CloudAlgo automated Salesforce-to-EMR patient data sync for a therapy clinic with no API access — Heroku, Puppeteer, and RabbitMQ running 24/7, zero manual re-entry.',
    tags: ['Heroku', 'Salesforce', 'Puppeteer', 'Node.js', 'RabbitMQ', 'Redis', 'TypeScript'],
    duration: '3-month engagement',
    result: 'Fully automated Salesforce → EMR patient sync — zero re-entry, 24/7 coverage',

    ledger: {
      client: 'A paediatric therapy clinic',
      tags: 'Healthcare · Salesforce & Heroku',
      when: '3 months',
      was: 'Every patient typed twice — once into Salesforce, once into an EMR that shipped without an API.',
      now: 'A headless browser on Heroku does the second typing, around the clock, and writes the failure back to the record when it can\'t.',
      figLabel: 'records re-entered by hand',
    },

    detailTitle: 'Every patient was typed twice. Now a browser does the second typing.',
    detailMark: 'a browser does the second typing',
    detailLede:
      'A paediatric therapy clinic ran intake in Salesforce and clinical records in an EMR that shipped without an API. Staff re-keyed every name, date of birth, insurance ID and case note by hand. We put a headless browser on Heroku in the gap, and it has done the second typing ever since.',
    standNote: { label: 'Integration surface', detail: 'The EMR\u2019s own web portal. No API, no webhook, no export.' },
    stateTitle: 'One patient intake, before and after',
    stateWhat: 'The intake',
    buildChain: true,
    buildNote: 'Four stages, one queue between them',
    notesNote: 'Why it runs at 3am on a Monday',
    ruledoutNote: 'Four candidates, none of them fit',
    decisivePoint: 3,
    decisiveStamp: 'This one decides the architecture',
    pagerNote: 'Every patient typed once, and a browser does the rest',

    headline: 'No API? No problem. Automating patient data sync with a browser robot on Heroku.',

    executiveSummary:
      'A pediatric therapy clinic had two systems that couldn\'t talk to each other: Salesforce for patient intake and an EMR for clinical records. Every new patient meant staff manually re-entering the same information twice — names, dates of birth, insurance, parent contacts, case notes. The EMR vendor provided no public API. CloudAlgo built a Heroku-hosted integration that closes the gap: a queue-backed Node.js worker that uses Puppeteer to drive a headless Chrome session through the EMR portal, populating every field exactly as a human would — but continuously, automatically, and without errors.',

    challenge:
      'Healthcare operations teams rarely choose their software. The EMR is mandated, the CRM is the enterprise standard, and the gap between them quietly becomes a staffing problem. Here it was one clinic, two systems, and the same information entered field by field, form by form, twice.',

    challengePoints: [
      'Every intake meant opening both systems and entering the same details twice: the patient, the parent or guardian, the insurance cover, and the clinical case notes.',
      'Transcription errors carry real risk in a clinical setting. A wrong date of birth, an incorrect insurance ID or a missing parent phone number turns into a billing, scheduling or care-coordination problem downstream.',
      'Time spent typing the same record twice was not spent on patient care, scheduling or clinical support \u2014 the work the clinic actually hired for.',
      'The EMR vendor offered no public API, no webhooks and no export endpoint. The only integration surface was the portal a human logs into.',
    ],

    resultsTable: [
      {
        metric: 'Systems opened',
        before: 'Two. Salesforce, then the EMR portal.',
        after: 'One. Salesforce, and nothing else.',
      },
      {
        metric: 'Times a field is typed',
        before: 'Twice. Once in each system.',
        after: 'Once. Salesforce is the source of truth.',
      },
      {
        metric: 'Who does the second typing',
        before: 'Clinic staff, by hand.',
        after: 'A headless Chrome session on a Heroku worker.',
      },
      {
        metric: 'Hours covered',
        before: 'While somebody is at a desk.',
        after: 'Around the clock, unsupervised.',
      },
      {
        metric: 'When it goes wrong',
        before: 'Found later, if somebody notices.',
        after: 'Written back onto the Salesforce record as an error.',
      },
    ],

    whyNotOffShelf:
      'A missing API is not a configuration problem \u2014 it is an architectural one. Zapier, MuleSoft and Heroku Connect all want a REST API or a database at the far end, and this system exposes neither. When the only interface is a JavaScript-heavy portal, the only viable bridge is a programmatic browser that uses it the way a person does.',

    toolComparison: [
      {
        tool: 'Zapier',
        category: 'No-code automation',
        doesWell: 'Simple trigger-and-action workflows between systems that already have connectors.',
        limitation: 'Needs an API or a native connector. No EMR connector exists, and it cannot drive a portal.',
      },
      {
        tool: 'MuleSoft',
        category: 'iPaaS',
        doesWell: 'Enterprise-grade API connectivity with real integration logic behind it.',
        limitation: 'Only ever as capable as the APIs it is given. On the EMR side there is nothing to connect to.',
      },
      {
        tool: 'Heroku Connect',
        category: 'Database sync',
        doesWell: 'Two-way Salesforce and Postgres sync with no custom code to maintain.',
        limitation: 'Syncs to a database, not to a portal. The EMR has no database access layer to point it at.',
      },
      {
        tool: 'Carrying on by hand',
        category: 'The status quo',
        doesWell: 'Always works. No technical risk and nothing to build.',
        limitation: 'Staff time on every patient, transcription errors nobody catches, and no path as volume grows.',
      },
    ],

    solution:
      'A two-process Heroku application. The web process owns the Salesforce OAuth credentials; the worker process listens to a RabbitMQ queue, drives the portal, and reports back. Nothing in Salesforce waits for a browser.',

    solutionSteps: [
      {
        title: 'Salesforce triggers the queue',
        path: 'Salesforce \u2192 RabbitMQ',
        body: 'When a patient record is created or updated, an Apex trigger publishes a job to a RabbitMQ queue on CloudAMQP. The queue decouples the event from the work: Salesforce does not wait for the browser, bursts do not stack up Puppeteer sessions, and a failed job is nack\u2019d rather than lost.',
      },
      {
        title: 'Credentials cached in Redis',
        path: 'Web dyno \u2192 Heroku Redis',
        body: 'The web process handles the Salesforce OAuth 2.0 flow and keeps access tokens, refresh tokens and instance URLs in Heroku Redis. jsforce refreshes expired tokens and writes them back, so the integration stays connected without anyone re-authenticating it by hand.',
      },
      {
        title: 'Puppeteer drives the portal',
        path: 'Worker \u2192 EMR portal',
        body: 'For each job the worker starts headless Chrome through the Google Chrome buildpack, logs in, and works the interface: clicking, selecting, filling fields, waiting for network idle before each step. It notices the idle lock screen and clears it, and it reads a field before writing it, so only values that actually changed are touched.',
      },
      {
        title: 'The EMR ID goes back to Salesforce',
        path: 'Worker \u2192 Salesforce',
        body: 'The worker lifts the EMR patient ID out of the portal and writes it back through an Apex REST endpoint, so the two records are linked by ID and the next update finds the right patient without searching. If anything fails, an error callback puts that on the record rather than leaving it quietly stale.',
      },
    ],

    technicalHighlights: [
      {
        title: 'A browser as the integration layer',
        body: 'Driving a full Chromium instance is nobody\u2019s first-choice integration pattern, but with no API it is the only one that exists. The architecture treats the browser as a typed interface: CSS selectors as contracts, network idle as the synchronisation point, and read-before-write at field level so nothing is mutated without cause.',
      },
      {
        title: 'The queue is what makes it survivable',
        body: 'A synchronous call would mean Salesforce waiting on Puppeteer \u2014 a multi-second operation that can time out, stall on a lock screen, or meet a DOM it did not expect. RabbitMQ absorbs the bursts, holds failed jobs instead of dropping them, and lets the worker go at its own pace without blocking a Salesforce transaction.',
      },
      {
        title: 'Lock screens and idempotent writes',
        body: 'The portal throws a password re-entry dialog after an idle period. The worker checks for that overlay at every interaction point and clears it before continuing. Writes are idempotent too: the current value is read first, and the field is only touched if it differs, which keeps portal-side validation from firing on fields that never changed.',
      },
      {
        title: 'Add-ons instead of infrastructure',
        body: 'The Chrome buildpack puts a browser on the dyno without Docker. Redis caches tokens, CloudAMQP runs the queue, Papertrail collects the logs. No container orchestration and nothing of our own to look after \u2014 the whole stack deploys with a git push.',
      },
    ],

    outcomes: [
      { metric: '0', label: 'Records re-entered by hand. Every patient sync runs without a person in it.' },
      { metric: '24/7', label: 'Coverage. The worker runs around the clock and nobody supervises it.' },
      { metric: '0', label: 'Transcription errors between the two systems. Salesforce holds the record, and it is typed once.' },
    ],

    whatDemonstrates: [
      {
        title: 'We find the integration path, even when there isn\u2019t one.',
        body: 'No API does not mean no solution. It means a different kind of engineering. Treating a headless browser as a legitimate integration layer rather than a workaround is what made this solvable at all.',
      },
      {
        title: 'Architecture decisions prevent operational debt.',
        body: 'A direct synchronous call would have worked on day one and broken under the first timeout. Queue decoupling, token caching and error callbacks are the difference between something that works at 3am and something that works while you watch it.',
      },
      {
        title: 'Clinical constraints get defensive engineering.',
        body: 'Patient data accuracy is not a UX concern. Idempotent writes, lock-screen detection and failure callbacks exist because a silent error in a medical context is not something you get to explain later.',
      },
      {
        title: 'Platform choice is an operating cost.',
        body: 'Heroku\u2019s add-ons removed a whole infrastructure footprint: no Redis to run, no AMQP cluster to stand up, no Chrome runtime to containerise. The add-ons are the infrastructure, and that simplicity compounds for as long as the integration runs.',
      },
    ],

    techStack: [
      { layer: 'Runtime', technology: 'Node.js \u00b7 TypeScript' },
      { layer: 'Web framework', technology: 'Express.js' },
      { layer: 'Browser automation', technology: 'Puppeteer, headless Chromium' },
      { layer: 'Salesforce API', technology: 'jsforce, OAuth 2.0 and Apex REST callbacks' },
      { layer: 'Job queue', technology: 'RabbitMQ via CloudAMQP' },
      { layer: 'Token cache', technology: 'Heroku Redis (mini)' },
      { layer: 'Process management', technology: 'Throng, clustered workers' },
      { layer: 'Hosting', technology: 'Heroku, web and worker dynos' },
      { layer: 'Chrome runtime', technology: 'Google Chrome buildpack' },
      { layer: 'Logging', technology: 'Papertrail' },
    ],
  },
  {
    id: 'salesforce-netsuite-sync',
    index: '04',
    company: 'Specialty Wholesale Distributor',
    industry: 'Distribution',
    service: 'MuleSoft · Salesforce · NetSuite',
    metric: '0',
    metricLabel: 'manual order re-entry — every Salesforce order syncs to NetSuite automatically',
    summary:
      'MuleSoft API-led integration connecting Salesforce and NetSuite for a specialty wholesale distributor — orders, customers, invoices, and payments syncing bidirectionally via Platform Events and scheduled flows.',
    tags: ['MuleSoft', 'Salesforce', 'NetSuite', 'CloudHub', 'DataWeave', 'Platform Events', 'Object Store'],
    duration: '5-month engagement',
    result: 'Bidirectional Salesforce ↔ NetSuite sync — orders, customers, invoices, and payments fully automated',

    ledger: {
      client: 'A specialty wholesale distributor',
      tags: 'Distribution · Salesforce & NetSuite',
      when: '5 months',
      was: 'Orders re-keyed out of Salesforce into NetSuite, and invoices chased back the other way by email.',
      now: 'One API layer between them. Orders, customers, invoices and payments move both ways without a person in the middle.',
      figLabel: 'orders typed in twice',
    },

    detailTitle: 'Orders were typed into NetSuite by hand. Now nobody is in the middle.',
    detailMark: 'nobody is in the middle',
    detailLede:
      'A specialty wholesale distributor ran Salesforce for the sale and NetSuite for everything after it, with nothing between them. Orders were re-keyed by the operations team; invoices and payments were invisible to sales without a second login. We built a MuleSoft API layer that moves customers, orders, invoices and payments both ways.',
    standNote: { label: 'Sync surface', detail: 'Platform Events one way, a 15-minute scheduler the other.' },
    stateTitle: 'One order, before and after',
    stateWhat: 'The order',
    buildChain: false,
    buildNote: 'Four flows, two directions',
    notesNote: 'The decisions that keep it idempotent',
    ruledoutNote: 'Four candidates, one of them chosen',
    pagerNote: 'Orders and invoices, both ways, nobody in the middle',

    headline: 'One source of truth: bidirectional Salesforce ↔ NetSuite sync via MuleSoft API-led integration.',

    executiveSummary:
      'A specialty wholesale distributor ran Salesforce for CRM and NetSuite for ERP — with no connection between them. Sales orders placed in Salesforce were re-entered into NetSuite by the operations team. Invoices in NetSuite were invisible to the sales team without a separate login. Customer updates in Salesforce didn\'t reflect in NetSuite until someone noticed a discrepancy. CloudAlgo built a MuleSoft integration closing every gap: Platform Events trigger real-time customer and order sync to NetSuite, a 15-minute scheduler pushes NetSuite invoices and refunds to Salesforce, and a payment event keeps financial data flowing in near real-time — all without manual re-entry or a human in the loop.',

    challenge:
      'Wholesale distributors run two essential systems that rarely talk to each other: Salesforce for the sales process, NetSuite for everything after the deal closes. When those systems are disconnected, the gap becomes a daily operational tax — paid in manual re-entry, stale data, and coordination overhead that scales with every additional order, customer, and invoice.',

    challengePoints: [
      'Every Sales Order placed in Salesforce had to be manually re-entered into NetSuite by the operations team — creating a lag between deal close and fulfilment, and introducing a point of failure on every line item, discount, shipping address, and PO number.',
      'Invoice and payment status in NetSuite was invisible to the sales team without a separate NetSuite login. Account managers chasing payment status had to escalate to finance — information that already existed in a system they couldn\'t access.',
      'Customer account data — payment terms, credit limits, shipping preferences, tax IDs — was captured in Salesforce but not automatically reflected in NetSuite when accounts were created or updated.',
      'Shipment confirmations and NetSuite order numbers had no automated path back to Salesforce, leaving order records incomplete and requiring operations to manually close the loop.',
    ],

    whyNotOffShelf:
      'NetSuite and Salesforce both have marketplace connectors and native integration tools. The challenge wasn\'t finding something with a NetSuite connector — it was finding one that could handle the actual requirements: real-time Platform Event-driven flows for orders and customers, 15-minute incremental polling for invoices and refunds with watermark-based pagination, bidirectional ID writeback, SOAP/XML operations for complex Sales Order creation, and per-flow error email notifications with failed record details. No off-the-shelf connector handles all of these in a maintainable, multi-environment integration with the reliability a production-grade financial sync requires.',

    toolComparison: [
      {
        tool: 'Zapier',
        category: 'No-code automation',
        doesWell: 'Simple trigger-action flows with native connectors; fast setup for basic scenarios',
        limitation: 'No support for paginated batch polling, watermark-based incremental sync, or the complexity of SOAP/XML NetSuite Sales Order operations with conditional create-vs-update routing.',
      },
      {
        tool: 'Boomi',
        category: 'iPaaS',
        doesWell: 'Has NetSuite and Salesforce connectors; visual flow design; reasonable for standard object syncs',
        limitation: 'Less flexible for custom Platform Event flows and conditional ID writeback logic; per-connection pricing grows with flow count; limited DataWeave-equivalent transformation power.',
      },
      {
        tool: 'NetSuite SuiteApp for Salesforce',
        category: 'Native connector',
        doesWell: 'Out-of-the-box mapping for standard Salesforce and NetSuite objects; no custom development for common fields',
        limitation: 'Fixed object and field mappings only. No support for custom Platform Events, custom financial objects, conditional writeback, or paginated incremental sync patterns.',
      },
      {
        tool: 'MuleSoft Anypoint Platform',
        category: 'iPaaS / API-led',
        doesWell: 'Full connector library for Salesforce and NetSuite; DataWeave for field-level transformation; Object Store for watermark sync; per-flow error handling; CloudHub deployment',
        limitation: 'Higher upfront investment in design and configuration vs. point-to-point tools; requires MuleSoft expertise to architect correctly.',
        chosen: true,
      },
    ],

    solution:
      'CloudAlgo built a three-application MuleSoft integration following API-led connectivity principles. A Salesforce System API subscribes to Platform Events and orchestrates real-time flows from Salesforce to NetSuite, writing NetSuite record IDs back on success. A NetSuite System API wraps all create/update operations — SOAP/XML for complex Sales Order logic, REST for customers and payments. An orchestration application schedules incremental NetSuite → Salesforce syncs for invoices and refunds, and subscribes to payment Platform Events for near-real-time financial data.',

    solutionSteps: [
      {
        title: 'Real-Time Customer Sync (SF → NetSuite)',
        path: 'Salesforce \u2192 NetSuite',
        body: 'When a Salesforce Account is created or updated, an AccountsEvent__e Platform Event triggers the MuleSoft Salesforce SAPI. DataWeave transforms Salesforce Account fields — company name, payment terms, credit limit, tax ID/VAT, DUNS, shipping carrier, parent account — into a NetSuite Customer record. For new customers, the resulting NetSuite Customer ID is written back to the Salesforce Account. For existing customers, the record is updated by NetSuite ID.',
      },
      {
        title: 'Real-Time Order Sync (SF → NetSuite)',
        path: 'Salesforce \u2192 NetSuite',
        body: 'When a Salesforce Order is queued for fulfilment, a Create_NS_Order__e Platform Event fires. MuleSoft queries the Salesforce OrderItems — product SKUs, quantities, unit prices, discounts, expected ship dates, sequence names, quote line IDs — and transforms them into a NetSuite Sales Order via SOAP/XML. A DataWeave script handles country enum mapping, conditional null guards, and date format conversion. The resulting NetSuite Order ID and Number are written back to the Salesforce Order asynchronously.',
      },
      {
        title: 'Scheduled Invoice & Refund Sync (NetSuite → SF)',
        path: 'NetSuite \u2192 Salesforce',
        body: 'Two schedulers run every 15 minutes — staggered by 7 minutes to prevent resource contention. Each fetches records modified since the last run, using a timestamp watermark persisted in Anypoint Object Store (minus a two-minute buffer for clock skew). Fetching is paginated: 50 records per request, with recursive sub-flow calls while hasMore == true. Records are posted to the Salesforce SAPI for upsert. Any HTTP 400 responses are collected, and a structured HTML error email is sent to the operations team.',
      },
      {
        title: 'Real-Time Payment Sync (SF → NetSuite)',
        path: 'Salesforce \u2192 NetSuite',
        body: 'When a payment is recorded in Salesforce, an ABT_Payment_and_Refund_Event__e Platform Event carries the payment amount, NetSuite Account number, and NetSuite Invoice ID. MuleSoft transforms this into a NetSuite payment application — specifying the AR account, GL account, payment amount, and the exact invoice to apply it against. The payment is posted to NetSuite via REST, keeping accounts receivable in sync with Salesforce payment records without manual journal entries.',
      },
    ],

    technicalHighlights: [
      {
        title: 'Platform Events as the Integration Bus',
        body: 'All real-time flows are triggered by Salesforce Platform Events, not by direct cross-system API calls. This decouples Salesforce from NetSuite response times — a Salesforce Order save doesn\'t wait for a NetSuite SOAP call to complete. Platform Events provide built-in replay, retry, and delivery guarantees that a synchronous callout cannot.',
      },
      {
        title: 'Watermark-Based Incremental Sync with Object Store',
        body: 'The invoice and refund schedulers use Anypoint Object Store to persist the last-run timestamp, minus a two-minute buffer to handle clock skew. Each run fetches only records modified since that timestamp — avoiding full-table scans, preventing duplicates, and handling API rate limits. The watermark can be reset to a configured default date via a config flag without code changes.',
      },
      {
        title: 'SOAP/XML for NetSuite Sales Order Complexity',
        body: 'The Sales Order create and update operations use NetSuite\'s SOAP WebServices API, not REST. DataWeave generates the full XML structure — including conditional field inclusion via null guards, country enum mapping via string camelize functions, date format conversion, and item list construction. This path was chosen deliberately: NetSuite\'s SOAP API supports field-level conditional inclusion and complex transactional object types that its REST API does not yet fully expose.',
      },
      {
        title: 'Bidirectional ID Writeback',
        body: 'Every flow that creates a record in one system writes the resulting ID back to the other. NetSuite Customer IDs and Order Numbers are written to Salesforce fields via Salesforce Connector update. Salesforce Account and Order Line IDs are embedded in the NetSuite payload as custom fields. This mutual reference pattern makes the integration idempotent: an update flow checks whether a NetSuite ID already exists on the Salesforce record before deciding to create or update.',
      },
    ],

    outcomes: [
      { metric: '0', label: 'Manual order re-entry — every Salesforce order creates a NetSuite Sales Order automatically' },
      { metric: '15 min', label: 'Invoice and refund sync cadence — NetSuite financial data reaches Salesforce in near real-time' },
      { metric: '4', label: 'Bidirectional sync flows automated — customers, orders, invoices, and payments' },
    ],

    resultsTable: [
      { metric: 'Order fulfilment handoff', before: 'Manual re-entry by ops from Salesforce email', after: 'Automatic on Salesforce Platform Event' },
      { metric: 'Invoice visibility', before: 'NetSuite-only — required separate login', after: 'Synced to Salesforce every 15 minutes' },
      { metric: 'Payment status', before: 'Invisible to sales team without NetSuite access', after: 'Near real-time via Platform Event' },
      { metric: 'Customer account sync', before: 'Manual, inconsistent', after: 'Event-driven on Salesforce Account create/update' },
      { metric: 'NetSuite order number in SF', before: 'Manual update after ops confirms', after: 'Async writeback on NetSuite order creation' },
      { metric: 'Error handling', before: 'Silent failures, discovered after the fact', after: 'HTML error email per failed record per scheduler run' },
    ],

    whatDemonstrates: [
      {
        title: 'API-led architecture scales when requirements grow.',
        body: 'A point-to-point Apex callout to NetSuite would have worked for the first flow. By the fourth, four separate maintenance surfaces, four separate error patterns, and no shared observability. The three-application API-led structure meant each new flow was a new sub-flow in the orchestration layer — not a new integration to build from scratch.',
      },
      {
        title: 'Real-time and scheduled patterns solve different problems.',
        body: 'Order and customer sync are event-driven because the business cannot wait for a scheduler. Invoice sync runs on a schedule because pulling NetSuite transactional data in batch is more reliable than expecting real-time triggers from the ERP side. Matching the integration pattern to the data type and latency requirement is an architectural decision, not a default.',
      },
      {
        title: 'Incremental sync requires state management.',
        body: 'A naive sync fetches all records on every run. An incremental sync persists a watermark and only fetches what changed. The difference is between a 15-minute scheduler that runs reliably and one that hits NetSuite API limits, overlaps with the previous run, and creates duplicate records. Anypoint Object Store makes that state persisted, configurable, and observable.',
      },
      {
        title: 'Error visibility is part of the integration contract.',
        body: 'Automated HTML error emails with failed record details aren\'t a feature — they\'re a reliability guarantee. Without them, a batch failure in an invoice sync is invisible until a sales rep notices a missing record two days later. With them, operations sees the failure within 15 minutes, with enough detail to diagnose the root cause without opening a dashboard.',
      },
    ],

    techStack: [
      { layer: 'Integration Platform', technology: 'MuleSoft Anypoint Platform 4.x' },
      { layer: 'Salesforce Connectivity', technology: 'Salesforce Connector (Platform Events, SOQL, Update)' },
      { layer: 'NetSuite Connectivity', technology: 'NetSuite Connector (SOAP/XML WebServices + REST)' },
      { layer: 'Transformation', technology: 'DataWeave 2.0' },
      { layer: 'State Management', technology: 'Anypoint Object Store v2 (sync watermarks)' },
      { layer: 'Deployment', technology: 'CloudHub' },
      { layer: 'Error Notifications', technology: 'SMTP (structured HTML email via DataWeave template)' },
      { layer: 'Security', technology: 'Secure Properties + Blowfish encryption' },
      { layer: 'Testing', technology: 'MUnit (MuleSoft unit testing framework)' },
      { layer: 'Environments', technology: 'Multi-env config (dev / qa / prod) via mule.env' },
    ],
  },
  {
    id: 'health-portal-mulesoft-integration',
    index: '05',
    company: 'Digital Health Platform',
    industry: 'Digital Health',
    service: 'MuleSoft · Salesforce · Logistics',
    metric: '5 min',
    metricLabel: 'kit tracking to portal — order status, shipment details, and delivery date synced from the logistics platform every 5 minutes',
    summary: 'MuleSoft API-led integration connecting a health portal, Salesforce CRM, and a logistics platform — customer journeys into Salesforce, support cases back to the portal, and kit shipment tracking every five minutes.',
    tags: ['MuleSoft', 'Salesforce', 'CloudHub', 'DataWeave', 'Object Store', 'Bulk API v2', 'Person Accounts', 'Logistics API'],
    duration: '6-month engagement',
    result: 'Three-system integration — health portal, Salesforce, and logistics — with bidirectional data flow, automated case management, and real-time kit tracking',

    ledger: {
      client: 'An at-home diagnostics platform',
      tags: 'Digital health · Salesforce & logistics',
      when: '6 months',
      was: 'A patient asking where their test kit had got to, and nobody on the portal side who could answer.',
      now: 'Portal, CRM and logistics on one integration layer. The status is on the page before anyone thinks to ask.',
      figLabel: 'logistics to portal',
    },
    detailTitle: 'Nobody could say where the kit was. Now the portal says it before anyone asks.',
    detailMark: 'before anyone asks',
    detailLede:
      'An at-home diagnostics platform ran a customer portal, Salesforce and a third-party logistics system that shared nothing. Staff created CRM records by hand, re-entered support actions into the portal, and opened a logistics dashboard to answer where a kit had got to. We built eight MuleSoft applications that keep all three in step.',
    standNote: { label: 'Systems joined', detail: 'A health portal, Salesforce, and a third-party logistics API.' },
    stateTitle: 'One test kit, before and after',
    stateWhat: 'The kit',
    buildChain: false,
    buildNote: 'Five flows across three systems',
    notesNote: 'The decisions that keep it exact',
    ruledoutNote: 'Four candidates, one of them chosen',
    pagerNote: 'Portal, CRM and logistics, five minutes apart',

    headline: 'Three systems, eight applications, one integration layer: how a digital health platform connected its portal, CRM, and logistics without a gap.',
    executiveSummary: `A digital health company offering at-home diagnostic testing had three systems that didn't talk to each other. Their customer portal managed member journeys and orders. Salesforce managed accounts, cases, and support. A third-party logistics platform handled kit shipment. Staff bridged the gaps manually — creating Salesforce records after portal registrations, copying support actions between Salesforce and the portal, and checking the logistics dashboard to answer basic questions about kit status.

CloudAlgo built the integration layer: eight MuleSoft applications covering customer onboarding, bidirectional case management, kit fulfilment, and automated shipment tracking. All three systems now stay in sync without manual intervention.`,
    challenge: `The company's stack had grown around three independent systems. New customer registrations in the portal didn't automatically appear in Salesforce — support staff created them manually. When Salesforce agents flagged a case for a new kit, a blood draw reschedule, or a cancellation, someone had to translate that action back into the portal. Kit shipment status lived only in the logistics platform's dashboard; customers and support staff asking "where's my kit?" got no answer from either the portal or Salesforce.`,
    challengePoints: [
      'Customer registrations in the portal required manual Account and Case creation in Salesforce. Every new member was an entry that someone created twice.',
      'Case management was one-directional. Salesforce agents could log requests — new kit, blood draw reschedule, cancellation, telehealth follow-up — but those requests did not reach the portal automatically. A human had to transfer each one.',
      'Shipment tracking lived in the logistics platform. Neither the portal nor Salesforce could show customers their kit status, tracking number, or estimated delivery date without a separate dashboard login.',
      'Journey data in the portal and member data in Salesforce drifted apart over time. No scheduled sync, no external ID linkage, no single source of truth for member state.',
    ],
    whyNotOffShelf: `The three systems involved — a proprietary health portal, Salesforce, and a third-party logistics API — have no native integration pathway. The portal's API uses API key authentication (X-Client-ID / X-Client-Secret) and exposes custom resources (journeys, orders, cases) that no off-the-shelf connector maps. The logistics platform uses Bearer token auth and returns structured shipment data with custom fields (kit_ids, tracking_status, carrier_code, service_code). Salesforce Person Accounts, custom fields (Portal_ID__c, Journey_ID__c, Integration_Timestamp__c), and the Member RecordType are all organisation-specific. No integration tool can connect these three systems without custom mapping — which is the integration, not a shortcut to it.`,
    toolComparison: [
      { tool: 'Zapier', category: 'Low-code automation', doesWell: 'Connecting popular SaaS apps with standard triggers and actions', limitation: 'No support for custom API auth patterns; no Object Store for watermarks; no batch operations' },
      { tool: 'Workato', category: 'Enterprise automation', doesWell: 'Pre-built connectors for popular business apps', limitation: 'Same connector gap as Zapier for a custom portal API; no fine control over Salesforce Bulk API v2 behaviour' },
      { tool: 'Point-to-point Apex', category: 'Native Salesforce', doesWell: 'Direct Salesforce → external API calls', limitation: 'Salesforce-only; cannot orchestrate Portal → Salesforce flows; tight coupling; no observability across systems' },
      { tool: 'MuleSoft', category: 'Integration platform', doesWell: 'API-led architecture, DataWeave, Object Store, CloudHub', limitation: 'Higher initial investment; right choice for multi-system orchestration with durable state and bidirectional flows', chosen: true },
    ],
    solution: `Eight MuleSoft applications — three System APIs, four Process APIs, and one batch job — created a complete integration layer across the health portal, Salesforce, and the logistics platform. The architecture follows API-led connectivity: each system API wraps one external system behind a stable interface, and each process API orchestrates business logic without touching external systems directly.`,
    solutionSteps: [
      {
        title: 'Customer Onboarding (dh-customer-papi)',
        path: 'Portal \u2192 Salesforce',
        body: 'When a new member registers on the health portal, MuleSoft receives the registration payload and creates a Salesforce Person Account under the "Member" RecordType — splitting the full name, mapping email, phone, gender, Portal_ID__c as external ID, subscription ID, and start date. If the registration includes a Journey ID, a linked Case is created simultaneously with Journey_ID__c as the external identifier. Both Salesforce record IDs are returned to the caller.',
      },
      {
        title: 'Journey Sync (dh-journey-sync-papi, scheduled)',
        path: 'Portal \u2192 Salesforce',
        body: 'A scheduler fetches pending journeys from the portal (using portal user ID and journey ID as identifiers), queries Salesforce for existing Member Accounts by Portal_ID__c, and runs a RecordType filter to prevent accidental updates to non-Member records. Valid accounts are upserted with current journey data; Cases are upserted on Journey_ID__c. Portal IDs are zipped with Salesforce Account IDs after each batch to maintain the cross-system ID map.',
      },
      {
        title: 'Case Sync (dh-case-sync-papi, Object Store watermark)',
        path: 'Salesforce \u2192 Portal',
        body: 'Salesforce support agents flag cases using four boolean fields: New_Kit_Requested__c, New_Blood_Draw_Requested__c, Cancellation_Requested__c, New_Telehealth_Requested__c. The case sync scheduler polls for cases where Integration_Timestamp__c exceeds the last-run timestamp (stored in Anypoint Object Store), transforms each flagged case into a structured request type ("new_kit", "reschedule_blood_draw", "cancellation", "follow_up"), and sends a bulk PATCH to the portal\'s journeys endpoint — up to 100 requests per batch. The Object Store watermark is updated after each successful run.',
      },
      {
        title: 'Kit Fulfilment (dh-order-to-shipment-papi)',
        path: 'Portal \u2192 Logistics',
        body: 'When a diagnostic kit order is created in the portal, MuleSoft POSTs it to the logistics platform via Bearer token authentication — creating the outbound shipment record in the logistics system.',
      },
      {
        title: 'Order Status Sync (dh-order-status-sync-batch, every 5 minutes)',
        path: 'Logistics \u2192 Portal',
        body: 'A scheduled batch fetches pending orders from the portal, queries the logistics platform for each order\'s status and shipment details — tracking number, carrier code, service code, estimated delivery date, delivery timestamp, kit IDs — and PATCHes the order back to the portal. If an order has status updates but no shipments yet, the status is applied without shipment fields; once shipments exist, full tracking data is included.',
      },
    ],
    outcomes: [
      { metric: '0', label: 'manual Salesforce account creation — every portal registration creates the CRM record automatically' },
      { metric: '4', label: 'case request types synced to portal — new kit, blood draw reschedule, cancellation, telehealth — directly from Salesforce agent flags' },
      { metric: '5 min', label: 'maximum shipment tracking lag — kit status, tracking URL, and estimated delivery date visible in portal within one polling cycle' },
    ],
    resultsTable: [
      { metric: 'Customer registration in Salesforce', before: 'Manual — support staff created Account after portal sign-up', after: 'Automatic on portal registration via dh-customer-papi' },
      { metric: 'Case-driven portal requests', before: 'Manual — agent logged request in Salesforce, then repeated in portal', after: 'Automatic bulk PATCH from case sync, keyed on Journey_ID__c' },
      { metric: 'Kit shipment visibility', before: 'Logistics dashboard only — no data in portal or Salesforce', after: 'Tracking number, carrier, status, delivery date synced to portal every 5 min' },
      { metric: 'Journey data in Salesforce', before: 'Stale — no scheduled sync, portal and CRM diverged over time', after: 'Scheduled sync via Journey_ID__c → Salesforce Cases + Accounts' },
      { metric: 'Account safety on upsert', before: 'No protection — upsert could create wrong-type Account records', after: 'RecordType filter blocks non-Member records before upsert' },
      { metric: 'Case watermark accuracy', before: 'LastModifiedDate — re-processed records changed by any update', after: 'Integration_Timestamp__c — only updated when integration processes the case' },
    ],
    technicalHighlights: [
      {
        title: 'Object Store watermark on Integration_Timestamp__c',
        body: 'The case sync uses a dedicated custom field rather than Salesforce\'s LastModifiedDate to track which records have been processed. This was a deliberate v1.1.0 change noted in the flow code: LastModifiedDate can be updated by any system change, causing reprocessing of already-synced records. Integration_Timestamp__c is only updated when the integration itself processes a case, making the watermark exact.',
      },
      {
        title: 'RecordType-filtered upserts for Person Accounts',
        body: 'Before upserting accounts, the journey sync queries the Salesforce RecordType ID for "Member" accounts and filters the incoming payload to only include records where Portal_ID__c matches an existing Member-type account. This prevents the upsert from accidentally creating wrong-type Account records when a Portal_ID__c appears in the system but belongs to a different record type.',
      },
      {
        title: 'Multi-lookup resolution in the Salesforce SAPI',
        body: 'The Salesforce System API includes a generic lookup resolution layer: before upserting records, it detects lookup fields in the payload (identified by the presence of lookupTable and lookupField properties), queries Salesforce for the corresponding parent record IDs, and substitutes them into the payload. This keeps business logic out of the process layer and makes the SAPI reusable across any object with relational dependencies.',
      },
      {
        title: 'Shipment-level tracking propagation',
        body: 'The order status batch fetches shipment-level detail for every shipment on the order: direction (inbound/outbound), estimated delivery date, tracking status, tracking number, tracking URL, carrier code, service code, delivery timestamp, and kit IDs. Each field is written back to the portal, making the full logistics picture visible without requiring direct access to the logistics platform.',
      },
    ],
    whatDemonstrates: [
      {
        title: 'Different sync directions need different patterns',
        body: 'Portal → Salesforce uses scheduled full-sync with RecordType filtering. Salesforce → Portal uses watermark-based incremental polling. Logistics → Portal uses a 5-minute batch. Each pattern matches its data type and latency requirement — applying the same pattern to all three would have made each one worse.',
      },
      {
        title: 'External IDs are the architectural linchpin',
        body: 'Portal_ID__c and Journey_ID__c make every upsert idempotent across all three sync patterns. Without them, every re-run creates duplicates; with them, every re-run is safe. External IDs are not a convenience — they are the safety property that makes scheduled sync reliable.',
      },
      {
        title: 'Watermark field selection is a correctness question, not a convenience',
        body: 'The v1.1.0 change from LastModifiedDate to Integration_Timestamp__c eliminated false re-triggers from unrelated field updates. A watermark on the wrong field produces duplicate work at best and inconsistent state at worst.',
      },
      {
        title: 'Lookup resolution belongs in the system API',
        body: "The Salesforce SAPI's generic lookup resolver means process APIs pass field values, not Salesforce IDs. This keeps process APIs free from Salesforce-specific query logic and makes the SAPI reusable across any object with relational dependencies.",
      },
    ],
    techStack: [
      { layer: 'Integration Platform', technology: 'MuleSoft Anypoint Platform 4.x (8 applications)' },
      { layer: 'Deployment', technology: 'CloudHub' },
      { layer: 'Salesforce Connectivity', technology: 'Salesforce Connector — Bulk API v2, SOQL queries, upsert/create/update' },
      { layer: 'Salesforce Data Model', technology: 'Person Accounts (Member RecordType), Cases (Journey_ID__c), Portal_ID__c external IDs, Integration_Timestamp__c' },
      { layer: 'Health Portal Connectivity', technology: 'HTTP (X-Client-ID / X-Client-Secret), Secure Properties' },
      { layer: 'Logistics Connectivity', technology: 'HTTP (Bearer token), SLP shipments/orders API' },
      { layer: 'Transformation', technology: 'DataWeave 2.0' },
      { layer: 'State Management', technology: 'Anypoint Object Store v2 (case sync watermark on Integration_Timestamp__c)' },
      { layer: 'Security', technology: 'Secure Properties + Blowfish encryption' },
      { layer: 'Environments', technology: 'Multi-env config (dev / qa / prod) via mule.env' },
    ],
  },
];
