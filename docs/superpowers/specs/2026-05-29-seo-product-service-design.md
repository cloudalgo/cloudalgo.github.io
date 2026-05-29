# SEO: Product & Service Discoverability — Design Spec

**Date:** 2026-05-29
**Scope:** Product and service pages only (blog excluded)
**Goal:** Improve search rankings and rich-snippet eligibility for CloudAlgo's product and service pages via structured data (JSON-LD) and sharpened title tags.

---

## Context

The site already has solid foundational SEO: sitemap, robots.txt, canonical URLs, Open Graph, Twitter Cards, and an Organization schema on the homepage. The gaps for product/service discoverability are:

1. No JSON-LD structured data on product or service pages
2. Generic product index title ("Products — CloudAlgo")
3. Product detail page titles follow `${name} — CloudAlgo Products` — no keyword phrase
4. `Base.astro` only accepts a single schema object, can't pass two schemas per page

---

## Files Changed

| File | Change type |
|---|---|
| `src/layouts/Base.astro` | Accept `schema?: object \| object[]`; wrap arrays in `@graph` |
| `src/content.config.ts` | Add `seoTitle: z.string().optional()` to products schema |
| `src/content/products/algobridge.md` | Add `seoTitle` field |
| `src/content/products/pledgivo.md` | Add `seoTitle` field |
| `src/content/products/insurealgo.md` | Add `seoTitle` field |
| `src/pages/products/index.astro` | Update title; add `ItemList` schema |
| `src/pages/products/[slug].astro` | Use `seoTitle`; add `SoftwareApplication` + `BreadcrumbList` `@graph` |
| `src/pages/services/[slug].astro` | Update title format; add `ProfessionalService` + `BreadcrumbList` `@graph` |

---

## 1. Base.astro — Schema Prop

**Current:** `schema?: object`

**New:** `schema?: object | object[]`

**Logic:**

```ts
// schema is destructured from Astro.props — not `data.schema`
const { schema } = Astro.props;
const schemaJson = !schema
  ? null
  : Array.isArray(schema)
    ? JSON.stringify({ '@context': 'https://schema.org', '@graph': schema })
    : JSON.stringify(schema);
```

Render conditionally:

```astro
{schemaJson && (
  <script is:inline type="application/ld+json" set:html={schemaJson} />
)}
```

Single-object pages (index pages with `ItemList`) pass a plain object — no breaking change to existing homepage Organization schema.

---

## 2. Content Schema

Add to the `products` collection in `src/content.config.ts`:

```ts
seoTitle: z.string().optional(),
```

No changes to the `services` collection — service detail titles are derived from `data.title` in the template.

---

## 3. Product Frontmatter — `seoTitle`

| File | `seoTitle` value |
|---|---|
| `algobridge.md` | `AlgoBridge — Salesforce to PostgreSQL Sync Tool \| CloudAlgo` |
| `pledgivo.md` | `Pledgivo — Native Salesforce Fundraising App for Nonprofits \| CloudAlgo` |
| `insurealgo.md` | `InsureAlgo — Insurance Policy Tracker for iOS & Android \| CloudAlgo` |

---

## 4. Products Index Page (`/products/index.astro`)

**Title change:**
- Current: `Products — CloudAlgo`
- New: `Salesforce Apps & AppExchange Products — CloudAlgo`

**Add `ItemList` schema** built from the products collection:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "CloudAlgo Products",
  "url": "https://cloudalgo.com/products",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "AlgoBridge",
      "url": "https://cloudalgo.com/products/algobridge"
    },
    ...
  ]
}
```

Built dynamically from `getCollection('products')` sorted by `order` — no hardcoding.

---

## 5. Product Detail Pages (`/products/[slug].astro`)

**Title:**

```astro
title={data.seoTitle ?? `${data.title} — CloudAlgo Products`}
```

**Schema** — two-item array passed as `@graph`:

### `SoftwareApplication`

| Field | Value |
|---|---|
| `@type` | `SoftwareApplication` |
| `name` | `data.title` |
| `description` | `data.tagline` |
| `applicationCategory` | `"BusinessApplication"` |
| `operatingSystem` | `salesforce-app` → `"Salesforce"` · `mobile-app` → `"iOS, Android"` · `integration` → `"Linux, Docker"` |
| `url` | `https://cloudalgo.com/products/${slug}` |
| `downloadUrl` | `data.externalUrl` (if present) |
| `offers` | `{ "@type": "Offer", "price": "0", "priceCurrency": "USD" }` — only if `data.status === 'ga'` and no paid tier |
| `provider` | `{ "@type": "Organization", "name": "CloudAlgo", "url": "https://cloudalgo.com" }` |

Pledgivo is `status: preview` with no `externalUrl` — `offers` is omitted; `downloadUrl` is omitted.

### `BreadcrumbList`

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://cloudalgo.com" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://cloudalgo.com/products" },
    { "@type": "ListItem", "position": 3, "name": "data.title", "item": "https://cloudalgo.com/products/${slug}" }
  ]
}
```

---

## 6. Service Detail Pages (`/services/[slug].astro`)

**Title format:**

```astro
title={`${data.title} — Salesforce Services | CloudAlgo`}
```

**Schema** — two-item array passed as `@graph`:

### `ProfessionalService`

| Field | Value |
|---|---|
| `@type` | `ProfessionalService` |
| `name` | `data.title` |
| `description` | `data.excerpt` |
| `serviceType` | `data.title` |
| `provider` | `{ "@type": "Organization", "name": "CloudAlgo", "url": "https://cloudalgo.com" }` |
| `areaServed` | `"Worldwide"` |
| `url` | `https://cloudalgo.com/services/${slug}` |

### `BreadcrumbList`

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://cloudalgo.com" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://cloudalgo.com/services" },
    { "@type": "ListItem", "position": 3, "name": "data.title", "item": "https://cloudalgo.com/services/${slug}" }
  ]
}
```

---

## Implementation Order

1. `Base.astro` — schema prop change (unblocks all downstream pages)
2. `content.config.ts` — add `seoTitle` field
3. Product frontmatter × 3 — add `seoTitle` values
4. `products/index.astro` — title + `ItemList` schema
5. `products/[slug].astro` — `seoTitle` usage + `@graph` schema
6. `services/[slug].astro` — title format + `@graph` schema

---

## Out of Scope

- Blog posts (Article schema, image alt text) — separate initiative
- Services index page (`/services`) — no schema gap identified
- MuleSoft and AWS services (no detail pages exist; display-only on index)
- `robots.txt` / sitemap config — already correct
