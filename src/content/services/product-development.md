---
title: "Product Development"
order: 2
icon: "📦"
excerpt: "AppExchange product development with 1GP and 2GP managed packages, security review readiness, and ISV strategy."
proves: insurealgo
---

## AppExchange Product Development

Building for the AppExchange is fundamentally different from building internal org solutions. Security Review, multi-org compatibility, namespace constraints, and subscriber lifecycle all demand specialized expertise. We've shipped managed packages and know the pitfalls.

---

### Packaging Architecture

Choosing the right packaging strategy before writing code saves months of painful refactoring:

- **1GP (First-Generation Packaging)** — Namespace management, patch release process, push upgrades to subscribers, and component visibility settings
- **2GP (Second-Generation Packaging)** — Unlocked and managed packages, scratch org-based CI/CD, dependency management, and source-driven development
- **Namespace strategy** — Selecting, registering, and using a namespace that works across all packaging tiers
- **Package splitting** — Separating core, UI, and optional modules into independent packages for faster iteration

---

### Security Review Preparation

Salesforce's Security Review is a known bottleneck. We prepare you thoroughly:

- **PMD static analysis** — Automated scanning with CloudAlgo-tuned ruleset for AppExchange requirements
- **Manual code review** — Pattern-by-pattern review against the Salesforce Security Review Checklist
- **CRUD/FLS enforcement** — Ensuring every SOQL query and DML respects object- and field-level security
- **XSS & SOQL injection** — Identifying and remediating vulnerabilities in Visualforce, LWC, and Apex
- **Submission support** — Filling out the submission form, responding to Salesforce reviewer feedback, and resubmission coordination

---

### ISV Licensing & Entitlements

Monetizing your product through the marketplace requires LMA integration:

- **License Management App (LMA)** — Setup, subscriber record management, and automated license checking in your Apex
- **Trial experiences** — Time-limited trials with graceful expiry UX rather than hard errors
- **Seat-based licensing** — Per-user license enforcement patterns that don't break during renewals
- **Pricing tiers** — Multiple edition architectures (Starter, Professional, Enterprise) with feature gating

---

### AppExchange Listing & Go-to-Market

A great product with a weak listing won't convert:

- **Listing copy** — Value proposition messaging, feature bullets, and category selection
- **Screenshot and demo video** — Guidance on what Salesforce reviewers expect and what buyers respond to
- **Partner portal setup** — Trailhead Partner Community, Environment Hub, and partner agreement navigation
- **Post-listing support** — Subscriber onboarding flows, in-app guided setup, and support ticketing process

---

### Ongoing Product Maintenance

AppExchange products require ongoing investment after launch:

- Version management and backward compatibility across subscriber orgs
- Salesforce release readiness testing (Spring/Summer/Winter releases)
- Subscriber issue triage and resolution with namespace-aware debugging
- Feature development and roadmap planning on a retainer basis
