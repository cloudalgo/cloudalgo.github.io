# Products Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Products section to the CloudAlgo site with a nav entry, listing page, detail pages, home page dark section, and footer link — showcasing 2 products (Salesforce apps / connectors) with GA / Preview / Beta maturity badges.

**Architecture:** Content-driven using Astro content collections (same pattern as `blog` and `services`). A `ProductCard` component handles listing-page and home-section rendering via `featured` and `dark` props. All pages use the existing `Page` layout and match the `#0A0A0A` / `#F5F5F2` / `#E0E0DC` design system — no orange accent.

**Tech Stack:** Astro 6 content layer v2 (`glob` loader, `p.id` routes), Zod schema, Tailwind CSS 4 / global.css design tokens, TypeScript strict mode.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/content/products/cloudalgo-flow-audit.md` | Seed product #1 — GA Salesforce app |
| Create | `src/content/products/sf-sync-connector.md` | Seed product #2 — Beta integration |
| Modify | `src/content.config.ts` | Add `products` collection with Zod schema |
| Create | `src/components/ui/ProductCard.astro` | Card used on listing page and home section |
| Create | `src/pages/products/index.astro` | `/products` listing page |
| Create | `src/pages/products/[slug].astro` | `/products/[slug]` detail page |
| Create | `src/components/sections/ProductsSection.astro` | Home page dark products block |
| Modify | `src/pages/index.astro` | Insert `<ProductsSection>` between `<Testimonials>` and `<BlogPreview>` |
| Modify | `src/components/layout/Header.astro` | Add Products nav link |
| Modify | `src/components/layout/Footer.astro` | Add Products footer link |

---

## Task 1: Content schema + seed data

**Files:**
- Create: `src/content/products/cloudalgo-flow-audit.md`
- Create: `src/content/products/sf-sync-connector.md`
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add products collection to content.config.ts**

Open `src/content.config.ts`. The current file ends with `export const collections = { blog, services };`. Replace the whole file with:

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:     z.string(),
    date:      z.date(),
    category:  z.enum(['Salesforce', 'Heroku', 'MuleSoft', 'AWS', 'Product']),
    excerpt:   z.string(),
    readTime:  z.number(),
    published: z.boolean().default(true),
    featured:           z.enum(['editors-pick', 'bottom-pick']).optional(),
    image:              z.string().optional(),
    author:             z.string().optional(),
    authorDesignation:  z.string().optional(),
    authorPhoto:        z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title:   z.string(),
    order:   z.number(),
    icon:    z.string(),
    excerpt: z.string(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    title:          z.string(),
    status:         z.enum(['ga', 'preview', 'beta']),
    type:           z.enum(['salesforce-app', 'integration']),
    tagline:        z.string(),
    excerpt:        z.string(),
    icon:           z.string(),
    appexchangeUrl: z.string().url().optional(),
    version:        z.string().optional(),
    lastUpdated:    z.string().optional(),
    order:          z.number(),
    features: z.array(z.object({
      icon:        z.string(),
      title:       z.string(),
      description: z.string(),
    })),
    screenshots:  z.array(z.string()).optional(),
    pricing: z.array(z.object({
      tier:  z.string(),
      price: z.string(),
    })).optional(),
    requirements: z.array(z.string()).optional(),
    published:    z.boolean(),
  }),
});

export const collections = { blog, services, products };
```

- [ ] **Step 2: Create seed product #1 — GA Salesforce app**

Create `src/content/products/cloudalgo-flow-audit.md`:

```markdown
---
title: "CloudAlgo Flow Audit"
status: ga
type: salesforce-app
tagline: "Instantly visualize, document, and analyze every Flow in your Salesforce org."
excerpt: "Flow Audit gives Salesforce admins and architects a complete picture of their org's automation — dependencies, performance bottlenecks, and inactive flows — all in one dashboard."
icon: "⚡"
appexchangeUrl: "https://appexchange.salesforce.com"
version: "2.1.0"
lastUpdated: "2026-04-10"
order: 1
features:
  - icon: "🗺️"
    title: "Full Flow Inventory"
    description: "Automatically catalogs all active, inactive, and draft Flows with type, trigger, and last-modified metadata."
  - icon: "🔗"
    title: "Dependency Mapping"
    description: "Visualizes which objects, fields, and Apex classes each Flow references — so you can safely refactor without surprises."
  - icon: "📊"
    title: "Performance Insights"
    description: "Surfaces Flows with high interview counts, long execution times, or excessive DML operations that risk hitting governor limits."
screenshots: []
pricing:
  - tier: "Free"
    price: "$0 / org"
  - tier: "Pro"
    price: "$49 / org / mo"
requirements:
  - "Salesforce Professional, Enterprise, or Unlimited edition"
  - "API access enabled on the org"
  - "System Administrator profile required for installation"
published: true
---

CloudAlgo Flow Audit is a managed Salesforce package that gives your team instant visibility into every automation running in your org.
```

- [ ] **Step 3: Create seed product #2 — Beta integration connector**

Create `src/content/products/sf-sync-connector.md`:

```markdown
---
title: "SF Sync Connector"
status: beta
type: integration
tagline: "Bi-directional sync between Salesforce and external databases — zero custom code."
excerpt: "SF Sync Connector bridges your Salesforce org and external SQL databases or REST APIs with configurable field mappings, conflict resolution rules, and real-time change detection. Currently in beta — early access available."
icon: "🔗"
order: 2
features:
  - icon: "↔️"
    title: "Bi-directional Sync"
    description: "Push and pull records between Salesforce and PostgreSQL, MySQL, or any REST API on a configurable schedule or in real time via webhooks."
  - icon: "🛡️"
    title: "Conflict Resolution"
    description: "Choose Salesforce-master, external-master, or last-writer-wins strategies per object type — no data loss on concurrent updates."
  - icon: "👁️"
    title: "Sync Dashboard"
    description: "Monitor sync health, error rates, and record throughput in a real-time dashboard without leaving Salesforce."
screenshots: []
requirements:
  - "Salesforce Enterprise or Unlimited edition"
  - "API access and Platform Events enabled"
  - "External system must expose a REST API or direct DB connection"
published: true
---

SF Sync Connector eliminates the need for custom ETL code when connecting Salesforce to your operational databases.
```

- [ ] **Step 4: Run type check**

```bash
npm run astro check
```

Expected: no errors. If you see "Cannot find collection 'products'" — make sure `src/content/products/` directory exists and contains both `.md` files.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/content/products/
git commit -m "feat: add products content collection with 2 seed entries"
```

---

## Task 2: ProductCard component

**Files:**
- Create: `src/components/ui/ProductCard.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ui/ProductCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  product: CollectionEntry<'products'>;
  featured?: boolean;
  dark?: boolean;
}

const { product, featured = false, dark = false } = Astro.props;
const { data } = product;
const slug = product.id;

const statusLabel = (s: string) =>
  s === 'ga' ? 'Generally Available' : s === 'preview' ? 'Preview' : 'Beta';
const statusColor = (s: string) => (s === 'ga' ? '#16a34a' : '#d97706');
const isEarlyAccess = data.status === 'preview' || data.status === 'beta';
---

{dark ? (
  <!-- Dark variant: used inside dark home section -->
  <div style={`
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 1.75rem;
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
  `}>
    <div style="font-size:2rem;flex-shrink:0;">{data.icon}</div>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;">
        <span style={`background:${statusColor(data.status)};color:#fff;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:0.06em;`}>
          {statusLabel(data.status)}
        </span>
        {isEarlyAccess && (
          <span style="font-size:0.65rem;color:rgba(255,255,255,0.45);">Early access</span>
        )}
      </div>
      <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:0.35rem;">{data.title}</div>
      <div style="font-size:0.85rem;color:rgba(255,255,255,0.55);line-height:1.55;margin-bottom:1rem;">{data.excerpt}</div>
      <a href={`/products/${slug}`} style="font-size:0.8rem;font-weight:700;color:#fff;text-decoration:underline;text-underline-offset:3px;">
        Learn more →
      </a>
    </div>
  </div>
) : (
  <!-- Light variant: used on /products listing page -->
  <div style={`
    border: ${featured ? '2px solid #0A0A0A' : '1px solid #E0E0DC'};
    border-radius: 12px;
    padding: 1.75rem;
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    background: #fff;
    transition: border-color 0.2s;
  `} class="product-card-light">
    <div style={`
      width: ${featured ? '56px' : '48px'};
      height: ${featured ? '56px' : '48px'};
      border-radius: ${featured ? '12px' : '10px'};
      background: #F5F5F2;
      border: 1px solid #E0E0DC;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${featured ? '1.6rem' : '1.3rem'};
    `}>
      {data.icon}
    </div>
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;flex-wrap:wrap;">
        <span style={`background:${statusColor(data.status)};color:#fff;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:0.06em;`}>
          {statusLabel(data.status)}
        </span>
        {isEarlyAccess && (
          <span style="font-size:0.65rem;color:#5A5A5A;">Early access · Feedback welcome</span>
        )}
        {data.version && (
          <span style="font-size:0.65rem;color:#5A5A5A;">{data.version}</span>
        )}
      </div>
      <div style={`font-size:${featured ? '1.125rem' : '1rem'};font-weight:${featured ? '800' : '700'};color:#0A0A0A;margin-bottom:0.35rem;`}>
        {data.title}
      </div>
      <div style="font-size:0.875rem;color:#5A5A5A;line-height:1.6;margin-bottom:0.875rem;">
        {data.excerpt}
      </div>
      {featured && data.features.length > 0 && (
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem;">
          {data.features.slice(0, 3).map(f => (
            <span style="font-size:0.7rem;background:#F5F5F2;border:1px solid #E0E0DC;padding:3px 10px;border-radius:100px;color:#0A0A0A;font-weight:600;">
              ✓ {f.title}
            </span>
          ))}
        </div>
      )}
      <div style="display:flex;gap:0.625rem;flex-wrap:wrap;">
        <a href={`/products/${slug}`} class="btn btn-primary" style="font-size:0.8125rem;padding:0.5rem 1.1rem;">
          Learn more →
        </a>
        {data.appexchangeUrl ? (
          <a href={data.appexchangeUrl} target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:0.8125rem;padding:0.5rem 1.1rem;">
            AppExchange ↗
          </a>
        ) : (
          <a href="/contact" class="btn btn-outline" style="font-size:0.8125rem;padding:0.5rem 1.1rem;">
            Join waitlist
          </a>
        )}
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Run type check**

```bash
npm run astro check
```

Expected: no errors. If you see "CollectionEntry" not found, verify the import path is `astro:content`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProductCard.astro
git commit -m "feat: add ProductCard component (featured, dark variants)"
```

---

## Task 3: Products listing page

**Files:**
- Create: `src/pages/products/index.astro`

- [ ] **Step 1: Create the listing page**

Create `src/pages/products/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Page from '../../layouts/Page.astro';
import ProductCard from '../../components/ui/ProductCard.astro';

const allProducts = await getCollection('products', ({ data }) => data.published);
const products = allProducts.sort((a, b) => a.data.order - b.data.order);
const hero = products[0];
const secondary = products.slice(1);
---

<Page
  title="Products — CloudAlgo"
  description="Purpose-built Salesforce apps and integration connectors from the CloudAlgo team — from production-ready to early access."
>

  <!-- Page header -->
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb">
        <a href="/">Home</a>
        <span>&rarr;</span>
        <span>Products</span>
      </nav>
      <p class="section-label">Our Products</p>
      <h1>Built for Salesforce teams.</h1>
      <p style="max-width:540px;margin-top:1rem;font-size:1.0625rem;color:#5A5A5A;line-height:1.7;">
        Purpose-built apps and connectors that extend what Salesforce can do — from production-ready to early access.
      </p>
    </div>
  </div>

  <!-- Product cards -->
  <section style="background:#fff;padding:4rem 0;border-bottom:1px solid #E0E0DC;">
    <div class="container">
      <div style="display:flex;flex-direction:column;gap:1.25rem;max-width:860px;">
        {hero && (
          <div class="anim-fade-up">
            <ProductCard product={hero} featured={true} />
          </div>
        )}
        {secondary.map((p, i) => (
          <div class="anim-fade-up" style={`transition-delay:${(i + 1) * 0.08}s`}>
            <ProductCard product={p} featured={false} />
          </div>
        ))}
      </div>
    </div>
  </section>

</Page>
```

- [ ] **Step 2: Run type check**

```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 3: Start dev server and verify the page renders**

```bash
npm run dev
```

Open `http://localhost:4321/products`. You should see:
- Page header with breadcrumb "Home → Products"
- GA hero card (bold border, feature pills, two CTAs)
- Beta secondary card below (lighter border, "Early access · Feedback welcome" label, Join waitlist CTA)

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/products/index.astro
git commit -m "feat: add /products listing page with hero + secondary layout"
```

---

## Task 4: Product detail page

**Files:**
- Create: `src/pages/products/[slug].astro`

- [ ] **Step 1: Create the detail page**

Create `src/pages/products/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import Page from '../../layouts/Page.astro';

export async function getStaticPaths() {
  const products = await getCollection('products', ({ data }) => data.published);
  return products.map(p => ({ params: { slug: p.id } }));
}

const { slug } = Astro.params;
const products = await getCollection('products');
const product = products.find(p => p.id === slug);
if (!product) return Astro.redirect('/404');

const { data } = product;

const statusLabel = (s: string) =>
  s === 'ga' ? 'Generally Available' : s === 'preview' ? 'Preview' : 'Beta';
const statusColor = (s: string) => (s === 'ga' ? '#16a34a' : '#d97706');
const typeLabel = (t: string) =>
  t === 'salesforce-app' ? 'Salesforce App' : 'Integration Connector';

const hasPricingOrReqs = (data.pricing && data.pricing.length > 0) ||
  (data.requirements && data.requirements.length > 0);
---

<Page
  title={`${data.title} — CloudAlgo Products`}
  description={data.tagline}
>

  <!-- ① Hero — white bg, matches .page-header -->
  <div class="page-header" style="padding-bottom:3rem;">
    <div class="container">
      <nav class="breadcrumb">
        <a href="/">Home</a>
        <span>&rarr;</span>
        <a href="/products">Products</a>
        <span>&rarr;</span>
        <span>{data.title}</span>
      </nav>
      <p class="section-label">{typeLabel(data.type)}</p>
      <div style="display:flex;align-items:flex-start;gap:1.5rem;margin-top:1rem;">
        <div style="width:64px;height:64px;border-radius:14px;background:#F5F5F2;border:1px solid #E0E0DC;display:flex;align-items:center;justify-content:center;font-size:1.75rem;flex-shrink:0;" aria-hidden="true">
          {data.icon}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:0.625rem;margin-bottom:0.5rem;flex-wrap:wrap;">
            <span style={`background:${statusColor(data.status)};color:#fff;font-size:0.65rem;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.06em;`}>
              {statusLabel(data.status)}
            </span>
            {data.version && (
              <span style="font-size:0.8rem;color:#5A5A5A;">v{data.version}</span>
            )}
            {data.lastUpdated && (
              <span style="font-size:0.8rem;color:#5A5A5A;">· Updated {data.lastUpdated}</span>
            )}
          </div>
          <h1 style="font-size:clamp(2rem,4vw,3rem);margin-bottom:0.75rem;">{data.title}</h1>
          <p style="font-size:1.0625rem;color:#5A5A5A;line-height:1.7;max-width:560px;margin-bottom:1.5rem;">
            {data.tagline}
          </p>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            {data.appexchangeUrl ? (
              <a href={data.appexchangeUrl} target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                View on AppExchange ↗
              </a>
            ) : (
              <a href="/contact" class="btn btn-primary">Join waitlist →</a>
            )}
            <a href="/contact" class="btn btn-outline">Book a demo</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ② Key features — grey bg -->
  <section style="background:#F5F5F2;padding:4rem 0;border-bottom:1px solid #E0E0DC;">
    <div class="container">
      <p class="section-label anim-fade-up">What it does</p>
      <h2 class="anim-fade-up" style="font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:2rem;transition-delay:0.05s;">
        Key Features
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
        {data.features.map((f, i) => (
          <div
            class="anim-scale-pop"
            style={`background:#fff;border:1px solid #E0E0DC;border-radius:12px;padding:1.5rem;transition-delay:${i * 0.06}s;`}
          >
            <div style="font-size:1.5rem;margin-bottom:0.75rem;" aria-hidden="true">{f.icon}</div>
            <h3 style="font-size:1rem;font-weight:700;color:#0A0A0A;margin-bottom:0.4rem;">{f.title}</h3>
            <p style="font-size:0.875rem;color:#5A5A5A;line-height:1.6;margin:0;">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- ③ Screenshots — white bg (only if screenshots array is non-empty) -->
  {data.screenshots && data.screenshots.length > 0 && (
    <section style="background:#fff;padding:4rem 0;border-bottom:1px solid #E0E0DC;">
      <div class="container">
        <p class="section-label">See it in action</p>
        <h2 style="font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:2rem;">
          Screenshots
        </h2>
        <div style="display:flex;gap:1rem;overflow-x:auto;padding-bottom:0.5rem;">
          {data.screenshots.map(src => (
            <img
              src={src}
              alt={`${data.title} screenshot`}
              style="height:240px;width:auto;border-radius:10px;border:1px solid #E0E0DC;flex-shrink:0;"
            />
          ))}
        </div>
      </div>
    </section>
  )}

  <!-- ④ Pricing + Requirements — grey bg (only if at least one is set) -->
  {hasPricingOrReqs && (
    <section style="background:#F5F5F2;padding:4rem 0;border-bottom:1px solid #E0E0DC;">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:3rem;">
          {data.pricing && data.pricing.length > 0 && (
            <div>
              <p class="section-label">Licensing</p>
              <h3 style="font-size:1.125rem;font-weight:700;color:#0A0A0A;margin-bottom:1rem;">Pricing</h3>
              <div style="border:1px solid #E0E0DC;border-radius:12px;overflow:hidden;background:#fff;">
                {data.pricing.map((row, i) => (
                  <div style={`padding:0.875rem 1.25rem;display:flex;justify-content:space-between;align-items:center;${i > 0 ? 'border-top:1px solid #E0E0DC;' : ''}`}>
                    <span style="font-weight:700;color:#0A0A0A;font-size:0.9375rem;">{row.tier}</span>
                    <span style="color:#5A5A5A;font-weight:600;font-size:0.9375rem;">{row.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.requirements && data.requirements.length > 0 && (
            <div>
              <p class="section-label">Before you install</p>
              <h3 style="font-size:1.125rem;font-weight:700;color:#0A0A0A;margin-bottom:1rem;">Requirements</h3>
              <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">
                {data.requirements.map(req => (
                  <li style="font-size:0.9375rem;color:#5A5A5A;padding-left:1.5rem;position:relative;line-height:1.55;">
                    <span style="position:absolute;left:0;color:#0A0A0A;font-weight:700;">→</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )}

  <!-- ⑤ CTA strip — dark bg -->
  <section style="background:#0A0A0A;padding:4rem 0;">
    <div class="container">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:2rem;flex-wrap:wrap;">
        <div>
          <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:900;color:#fff;letter-spacing:-0.025em;margin-bottom:0.35rem;">
            Ready to get started?
          </h2>
          <p style="font-size:0.9375rem;color:rgba(255,255,255,0.5);margin:0;">
            {data.appexchangeUrl ? 'Available now on AppExchange' : 'Early access — join the waitlist'}
          </p>
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          {data.appexchangeUrl ? (
            <a href={data.appexchangeUrl} target="_blank" rel="noopener noreferrer" class="btn btn-light">
              Install on AppExchange ↗
            </a>
          ) : (
            <a href="/contact" class="btn btn-light">Join waitlist →</a>
          )}
          <a href="/contact" class="btn" style="background:transparent;color:#fff;border-color:rgba(255,255,255,0.3);">
            Contact us
          </a>
        </div>
      </div>
    </div>
  </section>

</Page>
```

- [ ] **Step 2: Run type check**

```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 3: Start dev server and verify both detail pages**

```bash
npm run dev
```

Open `http://localhost:4321/products/cloudalgo-flow-audit`. Verify:
- White page-header with breadcrumb, icon, GA badge, title, tagline, two CTAs
- Grey features section with 3 feature cards
- No screenshots section (empty array)
- Grey pricing + requirements section (two columns)
- Dark CTA strip with "Install on AppExchange" button

Open `http://localhost:4321/products/sf-sync-connector`. Verify:
- Beta badge (amber), no version shown, "Join waitlist" CTA
- 3 feature cards
- No pricing section (not in frontmatter)
- Requirements section (single column)
- Dark CTA strip with "Join waitlist" button

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/products/
git commit -m "feat: add /products/[slug] detail page with hero, features, pricing, CTA"
```

---

## Task 5: ProductsSection + home page wire-up

**Files:**
- Create: `src/components/sections/ProductsSection.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create the home page dark products section**

Create `src/components/sections/ProductsSection.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ProductCard from '../ui/ProductCard.astro';

const allProducts = await getCollection('products', ({ data }) => data.published);
const products = allProducts.sort((a, b) => a.data.order - b.data.order);
---

<section style="background:#0A0A0A;padding:6rem 0;">
  <div class="container">
    <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:0.75rem;" class="anim-fade-up">
      Our Products
    </p>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:2.5rem;">
      <h2 class="anim-fade-up" style="font-size:clamp(2rem,3.5vw,2.75rem);font-weight:800;letter-spacing:-0.025em;color:#fff;margin:0;transition-delay:0.05s;">
        Built in-house,<br/>for Salesforce teams.
      </h2>
      <a href="/products" style="font-size:0.9375rem;font-weight:700;color:rgba(255,255,255,0.6);white-space:nowrap;transition:color 0.2s;" class="anim-fade-up products-view-all">
        View all products →
      </a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem;">
      {products.map((p, i) => (
        <div class="anim-scale-pop" style={`transition-delay:${i * 0.1}s;`}>
          <ProductCard product={p} dark={true} />
        </div>
      ))}
    </div>
  </div>
</section>

<style>
.products-view-all:hover { color: #fff !important; }
</style>
```

- [ ] **Step 2: Add ProductsSection to the home page**

Open `src/pages/index.astro`. The current import block is:

```astro
---
import Page from '../layouts/Page.astro';
import Hero from '../components/sections/Hero.astro';
import StatsBar from '../components/sections/StatsBar.astro';
import Services from '../components/sections/Services.astro';
import WhyUs from '../components/sections/WhyUs.astro';
import Testimonials from '../components/sections/Testimonials.astro';
import BlogPreview from '../components/sections/BlogPreview.astro';
```

Replace with (add the ProductsSection import):

```astro
---
import Page from '../layouts/Page.astro';
import Hero from '../components/sections/Hero.astro';
import StatsBar from '../components/sections/StatsBar.astro';
import Services from '../components/sections/Services.astro';
import WhyUs from '../components/sections/WhyUs.astro';
import Testimonials from '../components/sections/Testimonials.astro';
import ProductsSection from '../components/sections/ProductsSection.astro';
import BlogPreview from '../components/sections/BlogPreview.astro';
```

Then in the template, replace:

```astro
  <Testimonials />
  <BlogPreview />
```

with:

```astro
  <Testimonials />
  <ProductsSection />
  <BlogPreview />
```

- [ ] **Step 3: Run type check**

```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 4: Verify on home page**

```bash
npm run dev
```

Open `http://localhost:4321`. Scroll past Testimonials — you should see a dark section with:
- "OUR PRODUCTS" label (dimmed)
- "Built in-house, for Salesforce teams." heading (white)
- "View all products →" link (top-right of heading row)
- Two dark product cards side by side, each with status badge and Learn more link

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ProductsSection.astro src/pages/index.astro
git commit -m "feat: add ProductsSection dark block to home page"
```

---

## Task 6: Nav + footer links

**Files:**
- Modify: `src/components/layout/Header.astro`
- Modify: `src/components/layout/Footer.astro`

- [ ] **Step 1: Add Products to the nav**

Open `src/components/layout/Header.astro`. The `navLinks` array currently is:

```ts
const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/services',      label: 'Services' },
  { href: '/case-studies',  label: 'Case Studies' },
  { href: '/about',         label: 'About Us' },
  { href: '/blog',          label: 'Blog' },
  { href: '/contact',  label: 'Contact' },
];
```

Replace with (Products inserted between Services and Case Studies):

```ts
const navLinks = [
  { href: '/',              label: 'Home' },
  { href: '/services',      label: 'Services' },
  { href: '/products',      label: 'Products' },
  { href: '/case-studies',  label: 'Case Studies' },
  { href: '/about',         label: 'About Us' },
  { href: '/blog',          label: 'Blog' },
  { href: '/contact',       label: 'Contact' },
];
```

- [ ] **Step 2: Add Products to the footer**

Open `src/components/layout/Footer.astro`. The Company links column is:

```html
<ul class="ca-flinks">
  <li><a href="/about">About</a></li>
  <li><a href="/services">Services</a></li>
  <li><a href="/blog">Blogs</a></li>
  <li><a href="/page/disclaimer">Disclaimer</a></li>
</ul>
```

Replace with (Products added after Services):

```html
<ul class="ca-flinks">
  <li><a href="/about">About</a></li>
  <li><a href="/services">Services</a></li>
  <li><a href="/products">Products</a></li>
  <li><a href="/blog">Blogs</a></li>
  <li><a href="/page/disclaimer">Disclaimer</a></li>
</ul>
```

- [ ] **Step 3: Run type check**

```bash
npm run astro check
```

Expected: no errors.

- [ ] **Step 4: Verify nav and footer**

```bash
npm run dev
```

Open `http://localhost:4321`. Confirm:
- Nav shows: Home · Services · **Products** · Case Studies · About Us · Blog · Contact
- "Products" link is active (underline) when on `/products` or `/products/*`
- Footer Company column shows Products link between Services and Blogs
- Mobile menu (resize browser < 1024px) also shows Products link

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Header.astro src/components/layout/Footer.astro
git commit -m "feat: add Products link to nav and footer"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full type check**

```bash
npm run astro check
```

Expected: `Found 0 errors` (or only pre-existing warnings unrelated to products).

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build completes with no errors. If you see "getStaticPaths" errors, verify the `[slug].astro` uses `p.id` (not `p.slug`) in the params.

- [ ] **Step 3: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4321` and manually test:

| URL | What to check |
|---|---|
| `/` | Dark Products section visible between Testimonials and Blog Preview |
| `/products` | Hero + secondary card layout; both cards link to correct detail pages |
| `/products/cloudalgo-flow-audit` | Full detail page: hero (white bg), features (grey), pricing + requirements (grey), CTA strip (dark) |
| `/products/sf-sync-connector` | Detail page: Beta badge, no pricing section, requirements only, Join waitlist CTAs |
| Any page | Nav shows Products between Services and Case Studies; footer has Products link |

- [ ] **Step 4: Final commit**

```bash
git add -p   # review any outstanding changes
git commit -m "feat: products section complete — listing, detail, home block, nav, footer"
```
