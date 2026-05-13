# Products Section Design Spec

**Date:** 2026-05-13  
**Status:** Approved  

## Overview

Add a Products section to the CloudAlgo site to showcase 2 internal products (Salesforce apps and integration connectors) with GA / Preview / Beta maturity badges. The feature includes a new top-level nav entry, a products listing page, individual product detail pages, a home page section, and footer link.

---

## Decisions Made

| Question | Decision |
|---|---|
| Product types | Salesforce apps + integration connectors |
| Launch count | 2 products |
| Nav entry | Top-level link → `/products` |
| Card links | Internal detail page + external AppExchange link |
| Listing layout | Hero + secondary (GA product bold, Beta/Preview subdued) |
| Home page | Full dark section (Option A) between Why Us and Case Studies |
| Footer | "Products" link added to Company column |
| Detail page | White hero + features + screenshots + pricing/requirements + dark CTA |

---

## Site Design Constraints

All new components must match the existing design system in `src/styles/global.css`:

- **Font:** Outfit (400–900)
- **Colors:** `#0A0A0A` (black), `#5A5A5A` (secondary), `#F5F5F2` (grey bg), `#FFFFFF` (surface), `#E0E0DC` (border)
- **No orange accent** — the redesign maps it to black
- **Status badge colors** (exception — semantic only): green `#16a34a` for GA, amber `#d97706` for Beta/Preview
- **Buttons:** pill shape (`border-radius: 100px`), `.btn-primary` (black fill) / `.btn-outline` (black border)
- **Cards:** `border: 1px solid #E0E0DC; border-radius: 12px; padding: 2rem`
- **Section label:** `0.75rem`, `font-weight: 700`, `letter-spacing: 0.1em`, `text-transform: uppercase`, `color: #5A5A5A`
- **Page header:** `.page-header` — white bg, `border-bottom: 1px solid #E0E0DC`, `padding-top: 7rem`

---

## Content Schema

New Astro content collection: `src/content/products/` (markdown files, one per product).

Add to `src/content.config.ts`:

```ts
products: defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    title:         z.string(),
    status:        z.enum(['ga', 'preview', 'beta']),
    type:          z.enum(['salesforce-app', 'integration']),
    tagline:       z.string(),
    excerpt:       z.string(),
    icon:          z.string(),           // emoji or icon key
    appexchangeUrl: z.string().url().optional(),
    version:       z.string().optional(),
    lastUpdated:   z.string().optional(),
    order:         z.number(),           // 1 = primary (GA hero)
    features: z.array(z.object({
      icon:        z.string(),
      title:       z.string(),
      description: z.string(),
    })),
    screenshots:   z.array(z.string()).optional(),  // image paths under /public/
    pricing: z.array(z.object({
      tier:        z.string(),
      price:       z.string(),
    })).optional(),
    requirements:  z.array(z.string()).optional(),
    published:     z.boolean(),
  }),
})
```

Status badge display labels:
- `ga` → "Generally Available" (green `#16a34a`)
- `preview` → "Preview" (amber `#d97706`)
- `beta` → "Beta" (amber `#d97706`)

---

## New Files

### `src/content/products/` (2 seed files)

One `.md` per product. Filenames become the URL slug. `order: 1` product is the GA hero on the listing page.

### `src/pages/products/index.astro`

Products listing page at `/products`.

**Structure:**
1. `<Page>` wrapper (title, description, canonicalURL)
2. `.page-header` — breadcrumb (Home → Products), section label "Our Products", heading "Built for Salesforce teams", subtext
3. Product cards section (white bg, `section-padding--vertical`):
   - **GA hero card** (`order: 1`): bold `border: 2px solid #0A0A0A`, product icon, status badge, name, excerpt, 3 feature pills, two CTAs (`Learn more →` internal, `View on AppExchange ↗` external)
   - **Secondary cards** (remaining products): lighter `border: 1px solid #E0E0DC`, same structure but subdued, includes "Early access · Feedback welcome" sub-label for beta/preview, "Join waitlist" CTA if no AppExchange URL

### `src/pages/products/[slug].astro`

Product detail page at `/products/[slug]`.

Uses `p.id` (not `p.slug`) for the route param — Astro 6 content layer convention, matching `[slug].astro` in blog and services.

**Section order:**
1. **Hero** — `.page-header` (white bg, border-bottom): breadcrumb, section label (product type), product icon, status badge + version, `<h1>` name, tagline paragraph, btn-primary (AppExchange ↗) + btn-outline (Book a demo)
2. **Features** — `#F5F5F2` bg: section label "What it does", h2 "Key Features", 3-column feature card grid (white cards, 1px border, 12px radius, emoji icon + title + description)
3. **Screenshots** — white bg: section label "See it in action", horizontal strip of up to 3 images (16:9 aspect ratio, 10px radius, 1px border); omitted if no screenshots in frontmatter
4. **Pricing + Requirements** — `#F5F5F2` bg: two-column grid — left: pricing table (bordered, rows with tier + price); right: requirements list (arrow bullets matching `.blog-post-details ul > li::before` style); both columns omitted entirely if neither field is set
5. **CTA strip** — `#0A0A0A` bg (dark): heading "Ready to get started?", sub-line, btn-light (Install on AppExchange ↗) + btn-outline-white (Contact us)

### `src/components/ui/ProductCard.astro`

Reusable card component used on both the listing page and the home page section. Props: `product` (collection entry), `featured: boolean` (controls border weight and sizing).

### `src/components/sections/ProductsSection.astro`

Home page section component. Dark background (`#0A0A0A`), placed between `<WhyUs>` and `<BlogPreview>` in `src/pages/index.astro`.

**Structure:**
- Dark section with `section-padding--vertical`
- Section label (white/dimmed): "Our Products"
- Heading (white): "Built in-house, for Salesforce teams"
- 2-column card grid (both products, dark card surface `rgba(255,255,255,0.06)`, white text, status badges)
- "View all products →" link (white, underlined) below grid

---

## Modified Files

### `src/components/layout/Header.astro`

Add `{ href: '/products', label: 'Products' }` to `navLinks` between `'/services'` and `'/case-studies'`.

### `src/components/layout/Footer.astro`

Add `<li><a href="/products">Products</a></li>` to the Company links column (first `<ul class="ca-flinks">`), after the Services entry.

### `src/pages/index.astro`

Import `ProductsSection` and insert it between `<WhyUs />` and `<BlogPreview />`.

### `src/content.config.ts`

Add `products` collection definition.

---

## Scroll Animations

Apply existing animation classes consistent with other sections:
- Section heading: `anim-fade-up`
- Product cards: `anim-scale-pop` with staggered `transition-delay` (0s, 0.1s)

---

## Out of Scope

- Search or filter by status/type (only 2 products at launch)
- Waitlist form backend (just a "Join waitlist" link to `/contact` for now)
- Demo video embed (placeholder only; can be added per-product later)
- Pricing logic / Stripe integration
