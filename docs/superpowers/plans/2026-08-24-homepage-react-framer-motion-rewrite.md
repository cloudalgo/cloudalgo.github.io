# Homepage React + Framer-Motion Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `Hero`, `Services`, `WhyUs`, `ProductsSection`, and `BlogPreview` from static `.astro` components into React (`.tsx`) components animated with `framer-motion`, replacing their CSS `IntersectionObserver`/`stroke-dasharray` entrance and draw-in techniques.

**Architecture:** Each section becomes a self-contained React component under `src/components/sections/`. `ProductsSection`/`BlogPreview` receive pre-fetched, serialized content-collection data as props from `src/pages/index.astro` (React components cannot call `getCollection`). `Hero` gets `client:load`; the other four get `client:visible`. All five keep their exact current visual output — same class names, same inline style values, same copy — translated from Astro template syntax to JSX.

**Tech Stack:** Astro 6 (islands), React 19, `framer-motion` ^13.1.1 (already a dependency), TypeScript strict mode.

**Spec:** `docs/superpowers/specs/2026-08-24-homepage-react-framer-motion-rewrite-design.md`

## Global Constraints

- No accent colors — only `#0A0A0A` (black), `#5A5A5A` (secondary text), `#F5F5F2` (page bg), `#FFFFFF` (surface), `#E0E0DC` (border).
- Font is Outfit everywhere; no secondary typeface.
- Preserve every class name, inline style value, and copy string from the current `.astro` files exactly — this is a technology port, not a redesign.
- `viewport={{ once: true }}` on every `whileInView` trigger — animations fire once per page load, matching the current one-shot `.in-view` IntersectionObserver behavior.
- Respect `prefers-reduced-motion` via framer-motion's `useReducedMotion()` hook in every component that animates.
- **This codebase has no unit test suite** (confirmed in `CLAUDE.md`: "no separate test suite"). The verification step for every task is `npx astro check` (must report 0 errors) plus, where noted, a visual check against `npm run dev`. Do not attempt to introduce a test runner — this is out of scope.
- `ProductCard.astro` and `BlogCard.astro` are **not modified** — they're still used by `/products` and `/blog` listing pages. The new `ProductsSection.tsx`/`BlogPreview.tsx` inline their own equivalent JSX instead of importing them, per the spec. This means the category-illustration SVG map in `BlogPreview.tsx` (Task 6) duplicates ~5 SVG strings already in `BlogCard.astro` — this is an accepted, spec-approved trade-off, not an oversight.
- Astro islands are always server-rendered to static HTML regardless of hydration directive (`client:load` vs `client:visible` only controls *when JS hydrates*, not whether markup exists in the initial HTML) — so `Base.astro`'s global `[data-parallax]` and scroll-progress scripts, which run `document.querySelectorAll` once on page load, will find these elements without any changes to `Base.astro`. Do not modify `Base.astro` in this plan.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/homepage.ts` | Create | Serializable prop types shared between `index.astro` and the React islands |
| `src/components/sections/WhyUs.tsx` | Create | "Why choose us" 4-card grid, no icons, entrance stagger only |
| `src/components/sections/Services.tsx` | Create | 3-card services grid with inline SVG icons + hover micro-interaction |
| `src/components/sections/ProductsSection.tsx` | Create | Dark homepage product grid, consumes `products` prop |
| `src/components/sections/BlogPreview.tsx` | Create | Latest-3-posts grid, consumes `posts` prop, ports category illustrations |
| `src/components/sections/Hero.tsx` | Create | Hero headline/CTA + hub-and-spoke SVG with `pathLength` draw-in + mouse/scroll parallax |
| `src/pages/index.astro` | Modify | Fetch + serialize `products`/`posts`, swap imports to the 5 new `.tsx` files, set hydration directives |
| `src/components/sections/WhyUs.astro`, `Services.astro`, `ProductsSection.astro`, `BlogPreview.astro`, `Hero.astro` | Delete | Superseded by the `.tsx` versions |
| `CLAUDE.md` | Modify | Document the homepage React exception in "Component split: Astro vs React" |

Each of the 5 new components is created and type-checked on its own before `index.astro` is wired to use it (Task 7) — this keeps every task's `astro check` result meaningful without needing the whole homepage wired up first.

---

### Task 1: Shared serialized prop types

**Files:**
- Create: `src/types/homepage.ts`

**Interfaces:**
- Produces: `HomeProductCard`, `HomeBlogCard` — consumed by Task 4 (`ProductsSection.tsx`), Task 6 (`BlogPreview.tsx`), and Task 7 (`index.astro`).

- [ ] **Step 1: Write the types file**

```ts
// src/types/homepage.ts
export interface HomeProductCard {
  id: string;
  title: string;
  status: 'ga' | 'preview' | 'beta';
  excerpt: string;
  order: number;
}

export interface HomeBlogCard {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Salesforce' | 'Heroku' | 'MuleSoft' | 'AWS' | 'Product';
  date: string; // ISO 8601 string — Date objects don't survive Astro island prop serialization
  readTime: number;
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors (this file has no consumers yet, so nothing new to break).

- [ ] **Step 3: Commit**

```bash
git add src/types/homepage.ts
git commit -m "feat: add shared prop types for homepage React islands"
```

---

### Task 2: `WhyUs.tsx`

**Files:**
- Create: `src/components/sections/WhyUs.tsx`

**Interfaces:**
- Consumes: nothing (no props, no data fetching).
- Produces: default export `WhyUs()` — a React component with no props, consumed by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/WhyUs.tsx
import { motion, useReducedMotion, type Variants } from 'framer-motion';

interface WhyUsItem {
  number: string;
  title: string;
  body: string;
}

const items: WhyUsItem[] = [
  {
    number: '01',
    title: 'Certified Expertise',
    body: 'Our architects hold active Salesforce certifications across Admin, Developer, and Architect tracks.',
  },
  {
    number: '02',
    title: 'On-Time Delivery',
    body: 'We scope tightly and ship on schedule. No surprise delays, no scope creep.',
  },
  {
    number: '03',
    title: 'Clean Architecture',
    body: "No over-engineered orgs. We build for maintainability and your team's long-term ownership.",
  },
  {
    number: '04',
    title: 'Cost-Effective',
    body: 'Transparent pricing, no surprise invoices. Flexible retainer or project-based engagements.',
  },
];

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function WhyUs() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      style={{
        background: '#fff',
        padding: '6rem 0',
        borderTop: '1px solid #E0E0DC',
        borderBottom: '1px solid #E0E0DC',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div data-parallax="0.07" style={{ position: 'absolute', bottom: -90, right: -70, width: 280, height: 280, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.19" style={{ position: 'absolute', top: '20%', left: '7%', width: 8, height: 8, borderRadius: '50%', background: '#0A0A0A', opacity: 0.09, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.13" style={{ position: 'absolute', bottom: '20%', right: '14%', width: 6, height: 6, borderRadius: '50%', background: '#0A0A0A', opacity: 0.06, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="row align-items-center" style={{ gap: '3rem 0' }}>
          <div className="col-lg-4">
            <motion.p
              className="section-label"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
            >
              Why choose us
            </motion.p>
            <motion.h2
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
              transition={{ delay: 0.05 }}
              style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}
            >
              Why teams choose CloudAlgo
            </motion.h2>
            <p style={{ color: '#5A5A5A', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340 }}>
              We've helped 15+ companies get more from their Salesforce investment — without the bloat.
            </p>
            <a href="/about" className="btn btn-outline" style={{ marginTop: '2rem', fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
              About us &rarr;
            </a>
          </div>

          <div className="col-lg-8">
            <motion.div
              className="why-us-grid"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.3 }}
              variants={gridVariants}
            >
              {items.map((item) => (
                <motion.div key={item.number} className="why-card" variants={cardVariants}>
                  <div className="why-card-number">{item.number}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/WhyUs.tsx
git commit -m "feat: add WhyUs.tsx with framer-motion entrance animation"
```

---

### Task 3: `Services.tsx`

**Files:**
- Create: `src/components/sections/Services.tsx`

**Interfaces:**
- Consumes: nothing (no props).
- Produces: default export `Services()`, consumed by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/Services.tsx
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { SVGProps } from 'react';

function IconConsulting(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 16C10 13.1 11.6 10.6 14 9.3M22 16C22 18.9 20.4 21.4 18 22.7M6 20C4.3 18.5 3 16.4 3 14C3 9.6 6.6 6 11 6C12.2 6 13.3 6.3 14.3 6.8M26 12C27.7 13.5 29 15.6 29 18C29 22.4 25.4 26 21 26C19.8 26 18.7 25.7 17.7 25.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconProduct(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconSupport(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 3L28 9V16C28 22.6 22.7 28.7 16 30C9.3 28.7 4 22.6 4 16V9L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 16L14 19L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Service {
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
  body: string;
  href: string;
}

const services: Service[] = [
  {
    Icon: IconConsulting,
    title: 'Salesforce Consulting',
    body: 'CRM customization, Salesforce Communities, Force.com App Development, MuleSoft integrations, and Heroku solutions.',
    href: '/services/salesforce-consulting',
  },
  {
    Icon: IconProduct,
    title: 'Product Development',
    body: 'AppExchange product development with 1GP and 2GP managed packages, security review readiness, and ISV strategy.',
    href: '/services/product-development',
  },
  {
    Icon: IconSupport,
    title: 'Support & Managed Services',
    body: 'Ongoing support, maintenance, enhancements, org health reviews, and security recommendations for your Salesforce environment.',
    href: '/services/support-and-managed-services',
  },
];

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#F5F5F2', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.09" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.05, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.17" style={{ position: 'absolute', bottom: 40, left: '5%', width: 9, height: 9, borderRadius: '50%', background: '#0A0A0A', opacity: 0.1, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.12" style={{ position: 'absolute', top: '35%', right: '9%', width: 6, height: 6, borderRadius: '50%', background: '#0A0A0A', opacity: 0.07, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <motion.p
          className="section-label"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
        >
          What we do
        </motion.p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <motion.h2
            initial={reduceMotion ? undefined : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.4 }}
            variants={headingVariants}
            transition={{ delay: 0.05 }}
            style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, maxWidth: 500 }}
          >
            Expert services,<br />end to end.
          </motion.h2>
          <p style={{ maxWidth: 380, color: '#5A5A5A', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
            Specialized Salesforce and Heroku consulting for teams that want clean, scalable implementations.
          </p>
        </div>

        <motion.div
          className="row"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {services.map(({ Icon, title, body, href }) => (
            <div key={title} className="col-lg-4 col-md-4" style={{ marginBottom: '1.5rem', display: 'flex' }}>
              <motion.div className="card-bg" variants={cardVariants}>
                <motion.div className="card-icon" whileHover={reduceMotion ? undefined : { scale: 1.08 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                  <Icon />
                </motion.div>
                <h3 className="card-text" style={{ fontSize: '1.25rem' }}>{title}</h3>
                <p>{body}</p>
                <a href={href} className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
                  Learn more &rarr;
                </a>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Services.tsx
git commit -m "feat: add Services.tsx with inline SVG icons and hover motion"
```

---

### Task 4: `ProductsSection.tsx`

**Files:**
- Create: `src/components/sections/ProductsSection.tsx`

**Interfaces:**
- Consumes: `HomeProductCard` from `src/types/homepage.ts` (Task 1).
- Produces: default export `ProductsSection({ products: HomeProductCard[] })`, consumed by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/ProductsSection.tsx
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { HomeProductCard } from '../../types/homepage';

interface Props {
  products: HomeProductCard[];
}

const productIcons: Record<string, string> = {
  'algobridge': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="4" width="8" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="4" width="8" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9 L14.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 7.5 L14.5 9 L13 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 15 L9.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 13.5 L9.5 15 L11 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'sf-sync-connector': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="7" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="7" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 10 L14.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 8.5 L14.5 10 L13 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 14 L9.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 12.5 L9.5 14 L11 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'insurealgo': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="1" width="14" height="22" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M9 5 L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 9 L12 9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 13 L12 15 L15 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  'pledgivo': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C12 21 3 14.5 3 8.5C3 6 5 4 7.5 4C9.24 4 10.75 4.96 11.56 6.35C11.75 6.67 12.25 6.67 12.44 6.35C13.25 4.96 14.76 4 16.5 4C19 4 21 6 21 8.5C21 14.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 11 L10.5 13.5 L16 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'orgvitals': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="16" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 7 L22 7" stroke="currentColor" stroke-width="1.5"/><circle cx="4.6" cy="5" r="0.7" fill="currentColor"/><circle cx="6.8" cy="5" r="0.7" fill="currentColor"/><path d="M5 13 L8.5 13 L10.5 10 L13 16 L15 13 L19 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 22 L15.5 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function statusLabel(status: HomeProductCard['status']): string {
  if (status === 'ga') return 'Generally Available';
  if (status === 'preview') return 'Preview';
  return 'Beta';
}

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ProductsSection({ products }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#0A0A0A', padding: '6rem 0', borderTop: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.08" style={{ position: 'absolute', top: -60, left: -60, width: 210, height: 210, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.21" style={{ position: 'absolute', bottom: 50, right: '7%', width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.14" style={{ position: 'absolute', top: '40%', left: '14%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.1" style={{ position: 'absolute', bottom: -40, right: -30, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} aria-hidden="true" />

      <div className="container">
        <motion.p
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}
        >
          Our Products
        </motion.p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <motion.h2
            initial={reduceMotion ? undefined : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.4 }}
            variants={headingVariants}
            transition={{ delay: 0.05 }}
            style={{ fontSize: 'clamp(2rem,3.5vw,2.75rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', margin: 0 }}
          >
            Built in-house,<br />for Salesforce teams.
          </motion.h2>
          <a href="/products" className="products-view-all" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
            View all products &rarr;
          </a>
        </div>

        <motion.div
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem' }}
        >
          {products.map((product) => {
            const isEarlyAccess = product.status === 'preview' || product.status === 'beta';
            const iconSvg = productIcons[product.id];
            return (
              <motion.div key={product.id} variants={cardVariants} style={{ display: 'flex' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', height: '100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', overflow: 'hidden' }}>
                    {iconSvg && <span dangerouslySetInnerHTML={{ __html: iconSvg }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {product.status === 'ga' ? (
                        <span style={{ background: 'rgba(255,255,255,0.9)', color: '#0A0A0A', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {statusLabel(product.status)}
                        </span>
                      ) : (
                        <span style={{ border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {statusLabel(product.status)}
                        </span>
                      )}
                      {isEarlyAccess && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Early access</span>}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>{product.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '1rem' }}>{product.excerpt}</div>
                    <a href={`/products/${product.id}`} className="prod-card-link-dark" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'color 0.2s', marginTop: 'auto' }}>
                      Learn more &rarr;
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        .products-view-all:hover { color: rgba(255,255,255,0.9); }
        .prod-card-link-dark:hover { color: #fff !important; }
      `}</style>
    </section>
  );
}
```

Note: the original `ProductCard.astro` fell back to `productIcons['cloudalgo-flow-audit']` for unrecognized slugs — that key was never actually defined in the map, so the fallback always evaluated to `undefined`. This port preserves that exact observable behavior (`iconSvg` is `undefined`, no icon renders) by looking up `productIcons[product.id]` directly with no fallback — same outcome, simpler code, not a behavior change.

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ProductsSection.tsx
git commit -m "feat: add ProductsSection.tsx consuming serialized product props"
```

---

### Task 5: `BlogPreview.tsx`

**Files:**
- Create: `src/components/sections/BlogPreview.tsx`

**Interfaces:**
- Consumes: `HomeBlogCard` from `src/types/homepage.ts` (Task 1); `getBlogIllustration` from `src/data/blog-illustrations.ts` (existing, unmodified — exported as `export function getBlogIllustration(slug: string): string`).
- Produces: default export `BlogPreview({ posts: HomeBlogCard[] })`, consumed by Task 7.

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/BlogPreview.tsx
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { getBlogIllustration } from '../../data/blog-illustrations';
import type { HomeBlogCard } from '../../types/homepage';

interface Props {
  posts: HomeBlogCard[];
}

// Category fallback illustrations — ported from BlogCard.astro (kept in sync manually;
// BlogCard.astro itself is out of scope for this change, per the design spec).
const categoryIllustrations: Record<string, string> = {
  Salesforce: `<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true"><rect x="36" y="18" width="250" height="164" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/><rect x="36" y="18" width="250" height="30" rx="8" stroke="none" fill="#0A0A0A" opacity="0.07"/><path d="M36 48 L286 48" stroke="#0A0A0A" stroke-width="1" opacity="0.4"/><circle cx="52" cy="33" r="4" fill="#0A0A0A" opacity="0.35"/><circle cx="66" cy="33" r="4" fill="#0A0A0A" opacity="0.25"/><circle cx="80" cy="33" r="4" fill="#0A0A0A" opacity="0.18"/><path d="M52 65 L230 65" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><path d="M52 80 L200 80" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/><path d="M52 95 L220 95" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><path d="M52 110 L175 110" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/><rect x="52" y="128" width="62" height="22" rx="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/><path d="M62 139 L104 139" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><rect x="126" y="128" width="62" height="22" rx="4" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" opacity="0.8"/><path d="M136 139 L178 139" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/><rect x="320" y="28" width="132" height="70" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="386" y="60" text-anchor="middle" font-family="Outfit,sans-serif" font-size="24" font-weight="900" fill="#0A0A0A" opacity="0.8">92%</text><text x="386" y="82" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" fill="#5A5A5A">Success Rate</text><g class="sf-cloud"><path d="M362 148 C350 148 342 141 342 133 C342 127 347 122 354 121 C356 114 363 109 371 109 C378 109 384 113 386 119 C390 119 395 123 395 128 C395 135 388 141 379 141 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.7"/></g><g class="sf-bolt"><path d="M370 116 L365 127 L370 127 L365 138" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" opacity="0.6"/></g><circle cx="430" cy="120" r="22" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/><circle cx="430" cy="120" r="14" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/><path d="M430 105 L430 120 L440 120" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/></svg>`,
  Heroku: `<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true"><rect x="50" y="20" width="280" height="162" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/><rect x="50" y="20" width="280" height="28" rx="8" stroke="none" fill="#0A0A0A" opacity="0.07"/><path d="M50 48 L330 48" stroke="#0A0A0A" stroke-width="1" opacity="0.4"/><circle cx="66" cy="34" r="4" fill="#0A0A0A" opacity="0.35"/><circle cx="80" cy="34" r="4" fill="#0A0A0A" opacity="0.25"/><circle cx="94" cy="34" r="4" fill="#0A0A0A" opacity="0.18"/><text x="66" y="66" font-family="Outfit,monospace" font-size="10" fill="#5A5A5A" opacity="0.6">$</text><text x="78" y="66" font-family="Outfit,monospace" font-size="10" fill="#0A0A0A" opacity="0.7">git push heroku main</text><g class="heroku-lines"><text x="66" y="84" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.5">remote: Compressing source files...</text><text x="66" y="100" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.45">remote: Building source: Node.js</text><text x="66" y="116" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.4">remote: -----&gt; Installing dependencies</text><text x="66" y="132" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.5">remote: -----&gt; Build succeeded!</text></g><g class="heroku-success"><rect x="66" y="146" width="238" height="20" rx="4" fill="#0A0A0A" opacity="0.85"/><text x="185" y="160" text-anchor="middle" font-family="Outfit,monospace" font-size="9" font-weight="700" fill="#fff">✓ Deployed to production</text></g><g class="heroku-rocket"><path d="M400 160 C400 140 420 120 420 95" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.4"/><path d="M420 95 L414 105 L420 100 L426 105 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.6"/><path d="M412 108 C412 100 420 94 428 94 C428 104 422 112 412 114 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.6"/><circle cx="420" cy="92" r="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/></g><path d="M370 150 C360 150 352 144 352 136 C352 130 356 125 362 124 C364 118 370 114 377 114 C383 114 388 118 390 123 C393 123 397 127 397 131 C397 137 392 142 385 142 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.45"/></svg>`,
  MuleSoft: `<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true"><circle cx="240" cy="100" r="28" stroke="#0A0A0A" stroke-width="2" opacity="0.8"/><circle cx="240" cy="100" r="16" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/><text x="240" y="97" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">API</text><text x="240" y="109" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">HUB</text><g class="mule-node1"><circle cx="80" cy="55" r="18" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="80" y="52" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A">Sales</text><text x="80" y="63" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A">force</text></g><g class="mule-node2"><circle cx="80" cy="145" r="18" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="80" y="142" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A">ERP</text><text x="80" y="153" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A">SAP</text></g><g class="mule-node3"><circle cx="400" cy="55" r="18" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="400" y="52" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A">AWS</text><text x="400" y="63" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A">Cloud</text></g><g class="mule-node4"><circle cx="400" cy="145" r="18" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="400" y="142" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A">DB</text><text x="400" y="153" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A">SQL</text></g><line x1="98" y1="62" x2="213" y2="88" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45" class="mule-line"/><line x1="98" y1="138" x2="213" y2="112" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45" class="mule-line"/><line x1="267" y1="88" x2="382" y2="62" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45" class="mule-line"/><line x1="267" y1="112" x2="382" y2="138" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45" class="mule-line"/><circle cx="152" cy="74" r="4" fill="#0A0A0A" opacity="0.5" class="mule-pulse"/><circle cx="327" cy="74" r="4" fill="#0A0A0A" opacity="0.5" class="mule-pulse2"/><circle cx="152" cy="126" r="4" fill="#0A0A0A" opacity="0.5" class="mule-pulse3"/><circle cx="327" cy="126" r="4" fill="#0A0A0A" opacity="0.5" class="mule-pulse4"/></svg>`,
  AWS: `<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true"><g class="aws-cloud"><path d="M170 72 C142 72 122 58 122 42 C122 30 133 20 148 18 C150 6 163 -2 178 -2 C190 -2 200 4 205 14 C210 12 216 10 222 10 C242 10 258 24 258 42 C258 60 242 74 222 74 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.7"/><text x="190" y="44" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.6">AWS Region</text></g><rect x="100" y="90" width="280" height="90" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.65"/><text x="122" y="106" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">VPC</text><rect x="116" y="112" width="60" height="52" rx="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="146" y="133" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">EC2</text><path d="M130 144 L162 144" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/><path d="M130 152 L155 152" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/><rect x="196" y="112" width="60" height="52" rx="4" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" opacity="0.8"/><text x="226" y="133" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#fff">RDS</text><path d="M210 144 L242 144" stroke="#fff" stroke-width="1" opacity="0.3"/><path d="M210 152 L235 152" stroke="#fff" stroke-width="1" opacity="0.3"/><rect x="276" y="112" width="88" height="52" rx="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/><text x="320" y="133" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">S3 / Redshift</text><path d="M290 144 L352 144" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/><path d="M290 152 L335 152" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/><path d="M176 74 L176 90" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.4"/><path d="M146 90 L146 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/><path d="M226 90 L226 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/><path d="M320 90 L320 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/><rect x="360" y="20" width="88" height="52" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/><text x="404" y="42" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A">Lambda</text><text x="404" y="56" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Serverless</text><path d="M404 72 L404 90 L320 90" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.35"/></svg>`,
  Product: `<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true"><path d="M200 30 L280 70 L280 150 L200 190 L120 150 L120 70 Z" stroke="#0A0A0A" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/><path d="M200 30 L200 110 L280 70" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/><path d="M200 110 L120 70" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/><path d="M200 110 L200 190" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/><path d="M162 120 C162 110 178 103 200 102 C222 103 238 110 238 120 L238 148 C238 158 222 165 200 167 C178 165 162 158 162 148 Z" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.6"/><path d="M185 132 L195 142 L218 120" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/><rect x="326" y="30" width="62" height="22" rx="11" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" opacity="0.85"/><text x="357" y="45" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">v2.4.1</text><g class="product-star1"><circle cx="348" cy="90" r="3" fill="#0A0A0A" opacity="0.5"/><circle cx="348" cy="90" r="6" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/></g><g class="product-star2"><circle cx="374" cy="118" r="3" fill="#0A0A0A" opacity="0.45"/><circle cx="374" cy="118" r="6" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/></g><g class="product-star3"><circle cx="350" cy="148" r="3" fill="#0A0A0A" opacity="0.4"/><circle cx="350" cy="148" r="6" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/></g><g class="product-star4"><circle cx="396" cy="80" r="2.5" fill="#0A0A0A" opacity="0.3"/></g><g class="product-star5"><circle cx="410" cy="140" r="2.5" fill="#0A0A0A" opacity="0.3"/></g><g class="product-star6"><circle cx="330" cy="130" r="2" fill="#0A0A0A" opacity="0.25"/></g><rect x="326" y="64" width="100" height="60" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/><path d="M344 84 L408 84" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><path d="M344 96 L390 96" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/><path d="M344 108 L400 108" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/></svg>`,
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function BlogPreview({ posts }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#fff', padding: '6rem 0', borderTop: '1px solid #E0E0DC', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.08" style={{ position: 'absolute', top: 20, right: -70, width: 250, height: 250, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.16" style={{ position: 'absolute', bottom: 50, left: '4%', width: 8, height: 8, borderRadius: '50%', background: '#0A0A0A', opacity: 0.08, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.22" style={{ position: 'absolute', top: '18%', left: '28%', width: 5, height: 5, borderRadius: '50%', background: '#0A0A0A', opacity: 0.06, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <motion.p
              className="section-label"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
            >
              Writing
            </motion.p>
            <motion.h2
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
              transition={{ delay: 0.05 }}
              style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}
            >
              From the team
            </motion.h2>
          </div>
          <a href="/blog" className="btn btn-outline" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
            View all posts &rarr;
          </a>
        </div>

        <motion.div
          className="row"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {posts.map((post) => {
            const illustrationSvg = getBlogIllustration(post.slug) || categoryIllustrations[post.category] || categoryIllustrations.Salesforce;
            const formattedDate = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={post.slug} className="col-lg-4 col-md-4" style={{ marginBottom: '1.5rem', display: 'flex' }}>
                <motion.article className="blog-card-new" variants={cardVariants} style={{ width: '100%' }}>
                  <a href={`/blog/${post.slug}`} className="blog-card-thumb" aria-label={`Read: ${post.title}`} tabIndex={-1}>
                    <div className="blog-card-illus" dangerouslySetInnerHTML={{ __html: illustrationSvg }} />
                  </a>
                  <div className="blog-card-body">
                    <div className="blog-card-top">
                      <span className="blog-cat-tag">{post.category}</span>
                      <span className="blog-read-time">{post.readTime} min read</span>
                    </div>
                    <h3 className="blog-card-title">
                      <a href={`/blog/${post.slug}`}>{post.title}</a>
                    </h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-meta">
                      <span className="blog-meta-text">
                        <span className="blog-author-name">CloudAlgo Team</span>
                        <span className="blog-meta-dot">&middot;</span>
                        <span>{formattedDate}</span>
                      </span>
                    </div>
                  </div>
                </motion.article>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
```

This reuses the `.blog-card-new`, `.blog-card-thumb`, `.blog-card-illus`, `.blog-svg-illus`, `.blog-card-body`, etc. class names already styled globally by `BlogCard.astro`'s `<style is:global>` block — that stylesheet is loaded whenever `BlogCard.astro` is used elsewhere on the site (blog listing/detail pages), and since it's `is:global` its rules apply page-wide once emitted into any page's CSS, including hover hooks like `.blog-card-new:hover .sf-cloud`. **Verify during Task 5, Step 3** that the homepage actually receives this global stylesheet (it's bundled via `BlogCard.astro`, which the homepage no longer imports) — if hover illustration animations don't work on the homepage during the dev-server check, add a duplicate `<style>{...}</style>` block to `BlogPreview.tsx` containing the same CSS from `BlogCard.astro` lines 228–463, scoped identically (plain non-scoped tag, matching the `is:global` original).

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Visual verification of card hover animations**

Run: `npm run dev`, navigate to `/`, scroll to "From the team", hover over a blog card.
Expected: illustration hover animations (cloud float, terminal lines fade in, etc., per category) still play, since `.blog-card-new:hover .sf-cloud` etc. rules apply globally.
If the hover animations do NOT play (because `BlogCard.astro`'s global `<style>` never got bundled onto the homepage), add the CSS block as described above and re-check.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/BlogPreview.tsx
git commit -m "feat: add BlogPreview.tsx consuming serialized post props"
```

---

### Task 6: `Hero.tsx`

**Files:**
- Create: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: nothing (no props).
- Produces: default export `Hero()`, consumed by Task 7 with `client:load`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/sections/Hero.tsx
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const DRAW_TRANSITION = { duration: 1.6, ease: [0.4, 0, 0.2, 1] as const };

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const dotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    const illustration = illustrationRef.current;
    const dots = dotRefs.map((r) => r.current);
    [illustration, ...dots].forEach((el) => { if (el) el.style.willChange = 'transform'; });

    let rafId: number | null = null;
    let scrollY = 0;
    let targetMX = 0, targetMY = 0;
    let currentMX = 0, currentMY = 0;

    function scheduleFrame() {
      if (!rafId) rafId = requestAnimationFrame(update);
    }

    function update() {
      rafId = null;
      currentMX += (targetMX - currentMX) * 0.07;
      currentMY += (targetMY - currentMY) * 0.07;
      const scrollUp = -scrollY * 0.22;

      if (illustration) {
        illustration.style.transform = `translate(${currentMX * 16}px, ${scrollUp * 0.9 + currentMY * 10}px)`;
      }

      const dotOffsets = [
        { sx: 1.3, sy: 1.2, mx: 28, my: 20 },
        { sx: 0.8, sy: 1.5, mx: -22, my: 16 },
        { sx: 1.1, sy: 0.9, mx: 18, my: 24 },
      ];
      dots.forEach((dot, i) => {
        if (!dot) return;
        const o = dotOffsets[i];
        dot.style.transform = `translate(${currentMX * o.mx}px, ${scrollUp * o.sy + currentMY * o.my}px)`;
      });

      const stillLerping = Math.abs(currentMX - targetMX) > 0.0005 || Math.abs(currentMY - targetMY) > 0.0005;
      if (stillLerping) rafId = requestAnimationFrame(update);
    }

    const onScroll = () => { scrollY = window.scrollY; scheduleFrame(); };
    const onMouseMove = (e: MouseEvent) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      targetMX = (e.clientX - rect.left - rect.width / 2) / rect.width;
      targetMY = (e.clientY - rect.top - rect.height / 2) / rect.height;
      scheduleFrame();
    };
    const onMouseLeave = () => { targetMX = 0; targetMY = 0; scheduleFrame(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    section?.addEventListener('mousemove', onMouseMove);
    section?.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('scroll', onScroll);
      section?.removeEventListener('mousemove', onMouseMove);
      section?.removeEventListener('mouseleave', onMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} style={{ background: '#F5F5F2', paddingTop: '8rem', paddingBottom: '5rem', overflow: 'hidden', position: 'relative' }}>
      <div ref={dotRefs[0]} style={{ position: 'absolute', top: '15%', right: '8%', width: 12, height: 12, borderRadius: '50%', background: '#0A0A0A', opacity: 0.12 }} aria-hidden="true" />
      <div ref={dotRefs[1]} style={{ position: 'absolute', top: '30%', right: '15%', width: 7, height: 7, borderRadius: '50%', background: '#0A0A0A', opacity: 0.08 }} aria-hidden="true" />
      <div ref={dotRefs[2]} style={{ position: 'absolute', bottom: '25%', left: '5%', width: 9, height: 9, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.12 }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="row align-items-center" style={{ gap: '2rem 0' }}>
          <div className="col-lg-6">
            <motion.div
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
              variants={textContainer}
            >
              <motion.p className="section-label" variants={textItem}>Salesforce &amp; Heroku Consulting</motion.p>
              <h1 style={{ fontSize: 'clamp(2.5rem,5.5vw,5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#0A0A0A', marginBottom: '1.5rem' }}>
                <motion.span style={{ display: 'block' }} variants={textItem}>We make Salesforce</motion.span>
                <motion.span style={{ display: 'block' }} variants={textItem}>actually work for</motion.span>
                <motion.span style={{ display: 'block' }} variants={textItem}>your business.</motion.span>
              </h1>
              <motion.p className="paragraph-large" variants={textItem} style={{ maxWidth: 520, marginBottom: '2.25rem', color: '#5A5A5A' }}>
                CloudAlgo is a certified team of Salesforce architects and developers.
                70+ projects delivered, 12 years of combined experience.
              </motion.p>
              <motion.div variants={textItem} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/contact" className="btn btn-primary">Book a Consultation &rarr;</a>
                <a href="/services" className="btn btn-outline">See our work</a>
              </motion.div>
            </motion.div>
          </div>

          <div ref={illustrationRef} className="col-lg-6" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '2rem' }} aria-hidden="true">
            <svg viewBox="0 0 520 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 520, height: 'auto' }}>
              <motion.ellipse
                cx={255} cy={150} rx={180} ry={140}
                stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="3 6" opacity={0.22}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 0.1 }}
              />

              <path d="M255 150 L110 320" stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.4} />
              <path d="M255 150 L400 330" stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.4} />
              <path d="M255 150 L441 110" stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.4} />
              <path d="M255 150 L73 107" stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.4} />
              <path d="M255 150 L255 380" stroke="#0A0A0A" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.4} />

              <motion.path
                d="M195 205 C145 205 108 172 108 138 C108 106 132 81 163 77 C166 43 194 16 228 16 C258 16 284 35 293 62 C302 58 312 56 323 56 C358 56 387 85 387 120 C387 155 358 184 323 184 L195 205Z"
                stroke="#0A0A0A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.95}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 0.3 }}
              />
              <path d="M175 155 L330 155" stroke="#0A0A0A" strokeWidth={1.5} opacity={0.2} />
              <path d="M155 135 L350 135" stroke="#0A0A0A" strokeWidth={1.5} opacity={0.15} />
              <circle cx={255} cy={120} r={5} fill="#0A0A0A" opacity={0.8} />
              <circle cx={255} cy={120} r={12} stroke="#0A0A0A" strokeWidth={1.2} fill="none" opacity={0.3} />

              <motion.g
                stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.75}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
                animate={reduceMotion ? undefined : { opacity: 0.75, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
                style={{ transformOrigin: '90px 326px' }}
              >
                <ellipse cx={90} cy={300} rx={38} ry={12} />
                <path d="M52 300 L52 340 C52 347 69 353 90 353 C111 353 128 347 128 340 L128 300" />
                <path d="M52 320 C52 327 69 333 90 333 C111 333 128 327 128 320" opacity={0.5} />
              </motion.g>
              <text x={90} y={372} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={11} fontWeight={700} letterSpacing="0.06em" fill="#0A0A0A" opacity={0.55}>DATA</text>

              <motion.g
                stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.75}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
                animate={reduceMotion ? undefined : { opacity: 0.75, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
                style={{ transformOrigin: '400px 345px' }}
              >
                <circle cx={400} cy={345} r={30} />
                <circle cx={400} cy={345} r={10} />
                <line x1={400} y1={309} x2={400} y2={317} />
                <line x1={400} y1={373} x2={400} y2={381} />
                <line x1={364} y1={345} x2={372} y2={345} />
                <line x1={428} y1={345} x2={436} y2={345} />
                <line x1={375} y1={320} x2={381} y2={326} />
                <line x1={419} y1={364} x2={425} y2={370} />
                <line x1={425} y1={320} x2={419} y2={326} />
                <line x1={381} y1={364} x2={375} y2={370} />
              </motion.g>
              <text x={400} y={392} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={11} fontWeight={700} letterSpacing="0.06em" fill="#0A0A0A" opacity={0.55}>AUTOMATION</text>

              <motion.rect
                x={392} y={70} width={98} height={80} rx={8}
                stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.75}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 0.85 }}
              />
              <motion.polyline
                points="406,128 424,104 442,116 460,88 478,100"
                stroke="#0A0A0A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 1.05 }}
              />
              <path d="M406 138 L478 138" stroke="#0A0A0A" strokeWidth={1.5} opacity={0.3} />
              <text x={441} y={163} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={11} fontWeight={700} letterSpacing="0.06em" fill="#0A0A0A" opacity={0.55}>INSIGHTS</text>

              <motion.rect
                x={42} y={58} width={62} height={98} rx={10}
                stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.75}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 1 }}
              />
              <line x1={42} y1={78} x2={104} y2={78} stroke="#0A0A0A" strokeWidth={1.5} opacity={0.3} />
              <line x1={42} y1={136} x2={104} y2={136} stroke="#0A0A0A" strokeWidth={1.5} opacity={0.3} />
              <rect x={54} y={88} width={18} height={18} rx={4} stroke="#0A0A0A" strokeWidth={1.5} fill="none" opacity={0.5} />
              <rect x={78} y={88} width={18} height={18} rx={4} stroke="#0A0A0A" strokeWidth={1.5} fill="none" opacity={0.35} />
              <line x1={66} y1={146} x2={80} y2={146} stroke="#0A0A0A" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
              <text x={73} y={177} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={11} fontWeight={700} letterSpacing="0.06em" fill="#0A0A0A" opacity={0.55}>APPS</text>

              <motion.g
                stroke="#0A0A0A" strokeWidth={2} fill="none" opacity={0.75}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
                animate={reduceMotion ? undefined : { opacity: 0.75, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 1.15 }}
                style={{ transformOrigin: '252px 404px' }}
              >
                <circle cx={235} cy={382} r={11} />
                <path d="M213 415 C213 400 222 393 235 393 C248 393 257 400 257 415" />
                <circle cx={275} cy={388} r={9} opacity={0.6} />
                <path d="M258 415 C258 403 265 397 275 397 C285 397 292 403 292 415" opacity={0.6} />
              </motion.g>
              <text x={252} y={432} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={11} fontWeight={700} letterSpacing="0.06em" fill="#0A0A0A" opacity={0.55}>YOUR TEAM</text>

              <motion.circle
                cx={440} cy={225} r={22}
                stroke="#0A0A0A" strokeWidth={2} fill="#F5F5F2" opacity={0.9}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 1.3 }}
              />
              <motion.polyline
                points="430,225 437,232 451,217"
                stroke="#0A0A0A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9}
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ ...DRAW_TRANSITION, delay: 1.45 }}
              />

              <rect x={34} y={213} width={56} height={34} rx={17} stroke="#0A0A0A" strokeWidth={2} fill="#F5F5F2" opacity={0.55} />
              <text x={62} y={236} textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize={14} fontWeight={800} fill="#0A0A0A" opacity={0.75}>70+</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Notes on this port:
- The five `<g class="draw-stroke">`-wrapped node icons (Data, Automation, Team) become `motion.g` with an opacity/scale reveal instead of `pathLength`, since framer-motion's `pathLength` animates a single path-like shape, not an arbitrary group of children. The CSS-based version's `stroke-dasharray: 1400` on a `<g>` was inherited by all children uniformly and, since every child path in these icons is far shorter than 1400px, it produced a near-simultaneous "pop-in" rather than a true per-child draw — the opacity/scale reveal used here reproduces that same visual beat (an appearance timed to the same delay) rather than attempting a literal per-path stroke draw across a group.
- All single-shape elements that had `class="draw-stroke"` directly (orbit ellipse, cloud outline, Insights rect + polyline, Apps rect, checkmark badge circle + polyline) keep true `pathLength` draw-in, matching the original technique exactly, using the same delay values from the original `animation-delay` inline styles and the same `cubic-bezier(0.4,0,0.2,1)` easing (expressed as the array form `[0.4,0,0.2,1]`) over the same 1.6s duration.
- The parallax `<script>` becomes a `useEffect` with the identical lerp/rAF logic, using refs instead of `getElementById`, and returns a cleanup function that removes the listeners (a correctness improvement `<script>` tags can't provide — the original never removed its listeners because it only ever ran once per full page load).
- `useReducedMotion()` gates both the parallax effect and every `initial`/`animate` motion prop, replacing the CSS `@media (prefers-reduced-motion: reduce)` guard.

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: add Hero.tsx with framer-motion draw-in and parallax hook"
```

---

### Task 7: Wire `index.astro` to the new components

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `src/components/sections/Hero.astro`, `src/components/sections/Services.astro`, `src/components/sections/WhyUs.astro`, `src/components/sections/ProductsSection.astro`, `src/components/sections/BlogPreview.astro`

**Interfaces:**
- Consumes: `Hero`, `Services`, `WhyUs`, `ProductsSection`, `BlogPreview` default exports (Tasks 2–6); `HomeProductCard`, `HomeBlogCard` (Task 1).

- [ ] **Step 1: Rewrite `index.astro`**

```astro
---
import Page from '../layouts/Page.astro';
import { getCollection } from 'astro:content';
import Hero from '../components/sections/Hero';
import StatsBar from '../components/sections/StatsBar.astro';
import Services from '../components/sections/Services';
import WhyUs from '../components/sections/WhyUs';
import Testimonials from '../components/sections/Testimonials.astro';
import ProductsSection from '../components/sections/ProductsSection';
import BlogPreview from '../components/sections/BlogPreview';
import type { HomeProductCard, HomeBlogCard } from '../types/homepage';

const allProducts = await getCollection('products', ({ data }) => data.published);
const products: HomeProductCard[] = allProducts
  .sort((a, b) => a.data.order - b.data.order)
  .map((p) => ({
    id: p.id,
    title: p.data.title,
    status: p.data.status,
    excerpt: p.data.excerpt,
    order: p.data.order,
  }));

const allPosts = await getCollection('blog', ({ data }) => data.published);
const posts: HomeBlogCard[] = allPosts
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3)
  .map((post) => ({
    slug: post.id,
    title: post.data.title,
    excerpt: post.data.excerpt,
    category: post.data.category,
    date: post.data.date.toISOString(),
    readTime: post.data.readTime,
  }));

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CloudAlgo",
  "url": "https://cloudalgo.com",
  "logo": "https://cloudalgo.com/logo.svg",
  "foundingDate": "2019",
  "description": "CloudAlgo is a certified Salesforce & Heroku consulting firm. 70+ projects delivered, 12 years of combined experience.",
  "email": "sales@cloudalgo.com",
  "sameAs": [
    "https://www.linkedin.com/company/cloudalgo",
    "https://github.com/cloudalgo",
    "https://twitter.com/cloudalgo"
  ],
  "knowsAbout": ["Salesforce", "Heroku", "MuleSoft", "Salesforce AppExchange", "CRM Consulting"],
  "areaServed": "Worldwide"
};
---
<Page
  title="CloudAlgo — Salesforce & Heroku Consulting"
  description="CloudAlgo is a certified Salesforce & Heroku consulting firm specializing in CRM implementation, AppExchange development, and MuleSoft integration. 70+ projects, 15+ happy clients."
  {schema}
>
  <Hero client:load />
  <StatsBar />
  <Services client:visible />
  <WhyUs client:visible />
  <Testimonials />
  <ProductsSection client:visible products={products} />
  <BlogPreview client:visible posts={posts} />
</Page>
```

- [ ] **Step 2: Delete the superseded `.astro` files**

```bash
git rm src/components/sections/Hero.astro src/components/sections/Services.astro src/components/sections/WhyUs.astro src/components/sections/ProductsSection.astro src/components/sections/BlogPreview.astro
```

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: 0 errors. This is the first point where a stale import of a deleted `.astro` file, a prop-type mismatch between `index.astro` and a component's `Props` interface, or an unused/missing export would surface.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds with no errors. This specifically validates that `products`/`posts` — plain serializable objects/arrays of strings, numbers, and one ISO date string — cross the Astro-island prop boundary correctly (no `Date` objects, no class instances, nothing non-JSON-serializable is passed as a prop).

- [ ] **Step 5: Dev server visual check**

Run: `npm run dev`, open `/` in a browser.
Expected, compared against the pre-change homepage:
- Hero: headline/subhead/CTA stagger in, SVG hub-and-spoke draws in, mouse-move and scroll parallax both still work on the illustration and the three background dots.
- Services: 3 cards fade/scale in on scroll, icon scales up slightly on hover, card still inverts to black background on hover (existing CSS `.card-bg:hover`, untouched).
- Why Us: 4 numbered cards stagger in on scroll.
- Products: dark section's cards stagger in on scroll, each shows the correct per-product icon (or none, for products without a matching slug), status badge, and "Learn more" link to `/products/<id>`.
- Blog: 3 latest published posts render with their per-post or per-category illustration, entrance stagger works, hover illustration animations still play (per Task 5 Step 3).
- No layout shift or spacing difference versus production at both desktop and mobile widths (resize the viewport or use device emulation).

- [ ] **Step 6: Reduced-motion check**

In devtools, emulate `prefers-reduced-motion: reduce` (Rendering tab → Emulate CSS media feature), reload `/`.
Expected: no entrance/draw-in/parallax animation plays; all content is immediately visible in its final position (matching current reduced-motion behavior).

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: wire homepage to React framer-motion sections, drop static .astro versions"
```

---

### Task 8: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "Component split: Astro vs React" section**

Find this section in `CLAUDE.md`:

```markdown
### Component split: Astro vs React

The rule is purely interactive vs static:

- **`.astro` components** — all layout and section components (`src/components/layout/`, `src/components/sections/`); they own copy, structure, and static markup
- **`.tsx` React components** — only the three interactive UI widgets in `src/components/ui/`: `ContactForm`, `StatsCounter`, `TestimonialsSlider`
```

Replace it with:

```markdown
### Component split: Astro vs React

The rule is purely interactive vs static, with one dated exception:

- **`.astro` components** — all layout and section components (`src/components/layout/`, `src/components/sections/`); they own copy, structure, and static markup
- **`.tsx` React components** — the three interactive UI widgets in `src/components/ui/`: `ContactForm`, `StatsCounter`, `TestimonialsSlider`
- **Homepage exception (2026-08-24)** — `Hero`, `Services`, `WhyUs`, `ProductsSection`, and `BlogPreview` (all under `src/components/sections/`) are `.tsx` using `framer-motion` for icon and scroll-entrance animation. This was an intentional, explicit decision to support richer homepage motion design (see `docs/superpowers/specs/2026-08-24-homepage-react-framer-motion-rewrite-design.md`). `ProductsSection`/`BlogPreview` receive content-collection data as props fetched in `src/pages/index.astro` — React components cannot call `getCollection` directly.
- All other layout/section components elsewhere in the site remain `.astro`. Do not convert additional `.astro` components to React without an explicit, similarly-documented design decision — the general rule (interactive → React, static → Astro) still governs everywhere outside these 8 named components.
```

- [ ] **Step 2: Verify the replacement**

Run: `grep -n "Homepage exception" CLAUDE.md`
Expected: one match, inside the "Component split" section.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document homepage React + framer-motion exception in CLAUDE.md"
```

---

### Task 9: Final full-suite verification

**Files:** none (verification only).

- [ ] **Step 1: Full type-check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings related to this change.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: succeeds; check the build output for the homepage route and confirm no warnings about non-serializable props or missing hydration directives.

- [ ] **Step 3: Preview the production build**

Run: `npm run preview`, open the printed local URL, re-run the Task 7 Step 5 and Step 6 visual/reduced-motion checks against the **production** build (not just dev mode) — this catches any dev-only behavior (e.g., React StrictMode double-invocation) that could mask a bug in the parallax `useEffect` cleanup.

- [ ] **Step 4: Confirm no other page imports the deleted files**

Run: `grep -rn "sections/Hero.astro\|sections/Services.astro\|sections/WhyUs.astro\|sections/ProductsSection.astro\|sections/BlogPreview.astro" src/`
Expected: no matches (only `Hero`, `Services`, etc. without `.astro`, resolving to the new `.tsx` files, should remain — and only in `index.astro`).

- [ ] **Step 5: Final commit (if any fixes were made during verification)**

```bash
git add -A
git commit -m "fix: address issues found during homepage rewrite verification pass"
```

(Skip this step if Steps 1–4 all passed cleanly with no changes needed.)

---

## Self-Review

**Spec coverage:**
- Scope (5 sections → `.tsx`) — Tasks 2–7. ✅
- Data flow (`getCollection` in `index.astro`, serialized props) — Task 1, Task 7. ✅
- Hydration (`client:load` Hero, `client:visible` the rest) — Task 7 Step 1. ✅
- Styling preserved exactly — every task ports inline styles/class names 1:1. ✅
- Icon animation (`pathLength` draw-in, `whileInView` stagger, `whileHover`) — Task 3 (hover), Task 6 (draw-in), all tasks (stagger). ✅
- Scroll-animation ownership (these 5 drop `anim-fade-up`/`anim-scale-pop`, Base.astro untouched) — confirmed in Global Constraints and no task touches `Base.astro`. ✅
- Hero illustration stays inline SVG, not raster — Task 6. ✅
- CLAUDE.md update — Task 8. ✅
- Verification plan (astro check, build, dev-server QA, reduced-motion, parallax) — Task 7 Steps 3–6, Task 9. ✅

**Placeholder scan:** No "TBD"/"TODO"/"add appropriate X" phrases; every step has literal, complete code or an exact command.

**Type consistency:** `HomeProductCard`/`HomeBlogCard` (Task 1) are the exact shape produced in `index.astro` (Task 7) and consumed by `ProductsSection`/`BlogPreview` (Tasks 4–5) — field names (`id`, `title`, `status`, `excerpt`, `order` / `slug`, `title`, `excerpt`, `category`, `date`, `readTime`) match across all three call sites.
