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
    id: 'enterprise-data-pipeline',
    index: '01',
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
