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
  // Detail page — core
  headline: string;
  executiveSummary: string;
  challenge: string;
  challengePoints: string[];
  solution: string;
  solutionSteps: { title: string; body: string }[];
  outcomes: { metric: string; label: string }[];
  testimonial?: { quote: string; name: string; role: string };
  // Detail page — rich sections
  whyNotOffShelf?: string;
  toolComparison?: { tool: string; category: string; doesWell: string; limitation: string }[];
  technicalHighlights?: { title: string; body: string }[];
  resultsTable?: { metric: string; before: string; after: string }[];
  whatDemonstrates?: { title: string; body: string }[];
  techStack?: { layer: string; technology: string }[];
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
        body: 'A dedicated orchestration DAG receives table-level payloads via API and uses Redis-backed state coordination to track which tables have arrived for a given sync window. Only when all expected tables for a division are confirmed does the downstream pipeline trigger — eliminating the partial-data problem that caused reporting inconsistencies. Configurable timeout and retry handling ensure no sync window is silently skipped.',
      },
      {
        title: 'Bronze — The Faithful Copy',
        body: 'Raw data lands in the Bronze layer with minimal transformation — the goal is a clean, complete, denormalized record of what arrived. Records are processed in configurable batch sizes using executemany semantics so individual row failures don\'t abort the entire batch. A custom formula evaluation engine handles concatenation, unit conversion (tons ↔ pounds), date part extraction, and duration calculations — all driven by JSON configuration, not hardcoded logic. Business analysts can update derivation rules without touching Python.',
      },
      {
        title: 'Silver — The Trust Layer',
        body: 'The Silver pipeline is where raw data becomes trusted data. Every record passes through Cerberus schema validation (type checking, required field enforcement, value constraints), duplicate detection, column normalisation (uppercase, trimming, type coercion, null handling), and upsert writes. New records are inserted; existing records are updated on conflict, making the pipeline idempotent and safe to re-run. Anything downstream can trust that Silver data is structurally valid, deduplicated, and correctly typed.',
      },
      {
        title: 'Gold — Analytics at Speed',
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
];
