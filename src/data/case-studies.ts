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
  // Detail page fields
  headline: string;
  challenge: string;
  solution: string;
  solutionSteps: { title: string; body: string }[];
  outcomes: { metric: string; label: string }[];
  testimonial?: { quote: string; name: string; role: string };
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'retailscale',
    index: '01',
    company: 'RetailScale',
    industry: 'Retail',
    service: 'Salesforce',
    metric: '40%',
    metricLabel: 'increase in pipeline visibility',
    summary: 'Replaced spreadsheet-based sales tracking with a unified Sales Cloud implementation, giving leadership real-time visibility across 12 regional teams.',
    tags: ['Sales Cloud', 'LWC', 'SOQL', 'Reports & Dashboards'],
    duration: '14 weeks',
    result: 'Full Sales Cloud rollout with custom forecasting dashboards',
    headline: 'From spreadsheets to a single source of sales truth.',
    challenge: 'RetailScale operated 12 regional sales teams, each maintaining their own spreadsheets to track pipeline and forecast revenue. Leadership had zero real-time visibility. Monthly roll-up reports took 3 days to compile and were stale by the time they reached the board. The sales team spent 6+ hours per week on manual reporting instead of selling.',
    solution: 'We implemented Salesforce Sales Cloud as the single CRM across all 12 regions, replacing every spreadsheet with structured opportunity management. Custom LWC dashboards gave sales managers live pipeline views, and automated roll-up forecasting meant leadership could see the full picture in seconds, not days.',
    solutionSteps: [
      { title: 'Discovery & data mapping', body: 'Audited all 12 regional spreadsheets, normalised fields, and defined a unified data model in Salesforce.' },
      { title: 'Sales Cloud configuration', body: 'Built opportunity stages, custom fields, validation rules, and assignment rules aligned to the existing sales process.' },
      { title: 'LWC dashboard suite', body: 'Developed three custom Lightning Web Components: a regional pipeline view, a deal velocity tracker, and a team leaderboard.' },
      { title: 'Migration & training', body: 'Migrated 4,200+ historical opportunities, ran region-by-region onboarding sessions, and produced video training assets.' },
    ],
    outcomes: [
      { metric: '40%', label: 'Increase in pipeline visibility score (exec survey)' },
      { metric: '3 days → 0', label: 'Board reporting now instant via live dashboards' },
      { metric: '6 hrs/wk', label: 'Saved per sales rep on manual reporting' },
    ],
    testimonial: {
      quote: 'CloudAlgo took something we\'d been putting off for years and made it feel effortless. The rollout was flawless and the team was selling in the new system within a week.',
      name: 'Sarah Mitchell',
      role: 'VP of Sales, RetailScale',
    },
  },
  {
    id: 'medbridge',
    index: '02',
    company: 'MedBridge',
    industry: 'Healthcare',
    service: 'Heroku',
    metric: '18×',
    metricLabel: 'faster patient onboarding',
    summary: 'Built a HIPAA-compliant patient intake portal on Heroku, connected to Salesforce Health Cloud via REST APIs — reducing onboarding from 3 days to 4 hours.',
    tags: ['Heroku', 'Health Cloud', 'REST API', 'PostgreSQL'],
    duration: '18 weeks',
    result: 'Patient portal serving 50,000+ active records',
    headline: 'Patient onboarding cut from 3 days to 4 hours.',
    challenge: 'MedBridge\'s patient intake process was entirely paper-based. New patients filled out forms in-clinic, staff manually keyed data into multiple systems, and records took up to 3 days to be fully available to care teams. The friction drove patient drop-off and created compliance risk around incomplete records.',
    solution: 'We built a HIPAA-compliant digital intake portal on Heroku — patients complete forms online before their visit. A REST API integration with Salesforce Health Cloud ensures data flows instantly into the care team\'s view. PostgreSQL on Heroku handles encrypted document storage, and all data transit is secured via TLS with field-level encryption at rest.',
    solutionSteps: [
      { title: 'HIPAA compliance architecture', body: 'Designed the system architecture with Heroku Private Spaces, encrypted PostgreSQL, and audit logging to satisfy HIPAA technical safeguards.' },
      { title: 'Patient portal (Node.js)', body: 'Built a responsive intake portal with multi-step forms, e-signature, and document upload — optimised for mobile.' },
      { title: 'Health Cloud integration', body: 'Built REST API endpoints to push patient records, consent forms, and insurance data directly into Salesforce Health Cloud in real time.' },
      { title: 'Staff dashboard', body: 'Created an admin view for intake coordinators showing completion status, flagged records, and an audit trail for compliance review.' },
    ],
    outcomes: [
      { metric: '18×', label: 'Faster patient onboarding (3 days → 4 hours)' },
      { metric: '50k+', label: 'Active patient records in the portal' },
      { metric: '0', label: 'HIPAA compliance findings since launch' },
    ],
    testimonial: {
      quote: 'The integration between the patient portal and Health Cloud is seamless. Our care coordinators now walk into every appointment fully informed.',
      name: 'Dr. James Okonkwo',
      role: 'Chief Medical Officer, MedBridge',
    },
  },
  {
    id: 'gridflow',
    index: '03',
    company: 'GridFlow Energy',
    industry: 'Energy',
    service: 'MuleSoft',
    metric: '60%',
    metricLabel: 'reduction in manual data entry',
    summary: 'Unified SAP ERP and Salesforce via MuleSoft Anypoint Platform, eliminating double-entry across billing, metering, and CRM systems.',
    tags: ['MuleSoft', 'SAP Integration', 'Anypoint', 'Apex'],
    duration: '22 weeks',
    result: '14 system integrations running on a single API mesh',
    headline: 'Fourteen systems unified. Manual entry down 60%.',
    challenge: 'GridFlow\'s operations ran across 14 disconnected systems — SAP for billing, a legacy metering platform, Salesforce for customer management, and 11 supporting tools. Data moved between systems manually or via brittle point-to-point scripts. A customer address change required updates in 5 separate systems. Errors were frequent, costly, and invisible until they caused billing failures.',
    solution: 'We implemented MuleSoft Anypoint Platform as a central API mesh connecting all 14 systems. Every system now publishes and consumes via standardised APIs — a change in one system propagates automatically. We also built an operations dashboard in Salesforce showing real-time API health and data-flow monitoring.',
    solutionSteps: [
      { title: 'Integration audit & design', body: 'Mapped all 14 system integrations, identified 47 data flows, and designed a canonical data model to standardise fields across SAP and Salesforce.' },
      { title: 'Anypoint Platform setup', body: 'Configured MuleSoft Anypoint with environment segregation (dev/staging/prod), API governance policies, and SLA alerting.' },
      { title: 'SAP ↔ Salesforce connector', body: 'Built the primary bidirectional integration between SAP ERP and Salesforce — handling accounts, billing records, and meter readings in real time.' },
      { title: 'Remaining 12 integrations', body: 'Rolled out API connections for the remaining systems in three sprints, each with automated tests and error-replay capabilities.' },
    ],
    outcomes: [
      { metric: '60%', label: 'Reduction in manual data entry hours' },
      { metric: '14', label: 'Systems connected on a single API mesh' },
      { metric: '47', label: 'Automated data flows replacing manual processes' },
    ],
  },
  {
    id: 'shieldinsure',
    index: '04',
    company: 'ShieldInsure',
    industry: 'Insurance',
    service: 'Salesforce',
    metric: '91',
    metricLabel: 'CSAT score — up from 72',
    summary: 'Overhauled Service Cloud with a custom LWC agent console, automated case routing, and SLA dashboards. Agent handle time dropped by 35%.',
    tags: ['Service Cloud', 'LWC', 'Omni-Channel', 'Einstein'],
    duration: '16 weeks',
    result: 'Deployed to 200+ service agents across 3 regions',
    headline: 'Service Cloud overhaul takes CSAT from 72 to 91.',
    challenge: 'ShieldInsure\'s 200-agent service team operated on a heavily customised legacy CRM that had grown unmaintainable. Agents switched between 4 screens to resolve a single claim query. Case routing was manual. SLA tracking was a weekly spreadsheet exercise. Customer satisfaction had been declining for two consecutive years, and agent attrition was rising.',
    solution: 'We rebuilt the service operation on Salesforce Service Cloud with a custom LWC agent console that surfaces every relevant detail on a single screen. Omni-Channel routes cases to the right agent automatically based on skills, workload, and SLA priority. Einstein Case Classification tags and prioritises inbound cases before a human touches them.',
    solutionSteps: [
      { title: 'Current-state process mapping', body: 'Shadowed 20 agents across 3 regions to document exact workflows, pain points, and the data they needed at their fingertips.' },
      { title: 'Service Cloud configuration', body: 'Set up case management, entitlements, SLA milestones, and Omni-Channel routing rules aligned to the four policy lines.' },
      { title: 'Custom LWC agent console', body: 'Built a single-screen agent experience showing customer history, open cases, policy details, and recommended next actions — eliminating the 4-screen context-switch.' },
      { title: 'Einstein & reporting', body: 'Configured Einstein Case Classification and built a real-time SLA dashboard for supervisors replacing the weekly spreadsheet.' },
    ],
    outcomes: [
      { metric: '91', label: 'CSAT score (up from 72 in 12 months)' },
      { metric: '35%', label: 'Drop in average handle time per case' },
      { metric: '200+', label: 'Agents live across 3 regions' },
    ],
    testimonial: {
      quote: 'Our agents actually like using Salesforce now. That sentence would have been unthinkable before CloudAlgo came in.',
      name: 'Tom Eriksen',
      role: 'Head of Customer Operations, ShieldInsure',
    },
  },
  {
    id: 'partsco',
    index: '05',
    company: 'PartsCo',
    industry: 'Manufacturing',
    service: 'Salesforce',
    metric: '1 day',
    metricLabel: 'quote turnaround — down from 5',
    summary: 'Implemented Salesforce CPQ with automated pricing rules, product bundles, and approval workflows. Sales reps now generate accurate quotes without engineering sign-off.',
    tags: ['CPQ', 'Apex', 'Flow Automation', 'Price Books'],
    duration: '20 weeks',
    result: '3,000+ quotes processed in first quarter post-launch',
    headline: 'Quote turnaround from 5 days to same-day.',
    challenge: 'PartsCo\'s sales team sold complex industrial parts configurations — a single quote could involve 300+ line items with custom pricing, compatibility rules, and margin thresholds. Every quote required engineering review, which created a 5-day bottleneck. Deals were lost to competitors who quoted faster. Sales reps had no confidence in the numbers they were giving customers.',
    solution: 'We implemented Salesforce CPQ with a complete product catalogue, automated compatibility rules, and tiered pricing logic. The approval workflow now triggers only for quotes that breach margin thresholds — standard quotes generate and send automatically. Sales reps produce accurate, branded quotes in under 10 minutes.',
    solutionSteps: [
      { title: 'Product catalogue & pricing model', body: 'Loaded 12,000 SKUs into CPQ price books with compatibility matrices and bundle configurations based on engineering specs.' },
      { title: 'Pricing rules & constraints', body: 'Built 40+ Apex-backed pricing rules enforcing margin floors, volume discounts, and regional price variations.' },
      { title: 'Approval automation', body: 'Designed a tiered approval workflow — standard quotes auto-approve, custom pricing routes to sales ops, margin exceptions to management.' },
      { title: 'Quote template & e-sign', body: 'Created a branded PDF quote template with DocuSign integration for same-day e-signature and order confirmation.' },
    ],
    outcomes: [
      { metric: '1 day', label: 'Quote turnaround (was 5 days)' },
      { metric: '3,000+', label: 'Quotes processed in first quarter' },
      { metric: '22%', label: 'Increase in quote-to-close rate' },
    ],
    testimonial: {
      quote: 'Our reps were quoting on gut feel before. Now they walk into every negotiation with exact numbers and the confidence to back them up.',
      name: 'Marcus Webb',
      role: 'Sales Director, PartsCo',
    },
  },
  {
    id: 'lifesciences',
    index: '06',
    company: 'LifeSciences+',
    industry: 'Pharma',
    service: 'AppExchange',
    metric: '200+',
    metricLabel: 'enterprise customers at launch',
    summary: 'Designed, built, and published a native AppExchange product for clinical trial management — passing Salesforce Security Review on first submission.',
    tags: ['AppExchange', 'LWC', 'Security Review', 'Managed Package'],
    duration: '28 weeks',
    result: 'Listed on AppExchange — 4.8 ★ average rating',
    headline: 'AppExchange launch. Security Review passed first time.',
    challenge: 'LifeSciences+ had deep domain expertise in clinical trial management but no software product. Their consultants manually configured Salesforce for each new pharma client — a process that took 12 weeks per engagement. The founders wanted to productise their methodology as a native Salesforce app, but had no experience with AppExchange development, Managed Packages, or the Security Review process.',
    solution: 'We designed and built a fully native Salesforce Managed Package for clinical trial management — covering site activation, patient enrolment, adverse event tracking, and regulatory reporting. The app passed Salesforce Security Review on the first submission (an uncommon achievement) and launched with 200+ enterprise customers pre-committed from LifeSciences+\'s existing client base.',
    solutionSteps: [
      { title: 'Product architecture', body: 'Designed the managed package schema, namespace strategy, and feature toggle system to support configurable deployment across client orgs.' },
      { title: 'Core feature build', body: 'Built 6 LWC modules covering trial site management, patient enrolment tracking, protocol deviation logging, and regulatory submission templates.' },
      { title: 'Security Review preparation', body: 'Conducted a full security audit against Salesforce\'s checkmarx rules, remediated all findings, and prepared the Security Review submission package.' },
      { title: 'AppExchange listing & launch', body: 'Produced the listing content, demo org, and installation documentation. Coordinated the go-live with LifeSciences+\'s sales team for a simultaneous customer announcement.' },
    ],
    outcomes: [
      { metric: '200+', label: 'Enterprise customers at launch day' },
      { metric: '4.8 ★', label: 'Average AppExchange rating' },
      { metric: '1st try', label: 'Salesforce Security Review — passed first submission' },
    ],
    testimonial: {
      quote: 'CloudAlgo didn\'t just build the app — they taught us how to think like a software product company. The Security Review pass on first submission saved us months.',
      name: 'Priya Nair',
      role: 'CEO, LifeSciences+',
    },
  },
];
