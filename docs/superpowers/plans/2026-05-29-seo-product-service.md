# SEO: Product & Service Discoverability — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JSON-LD structured data (SoftwareApplication, ProfessionalService, BreadcrumbList, ItemList) to product and service pages, and sharpen product/service page title tags for better search discoverability.

**Architecture:** `Base.astro` is extended to accept `schema?: object | object[]`; arrays are serialised as a single `@graph` block. Product and service page templates build schema objects from existing frontmatter at build time and pass them to the layout — no runtime JavaScript involved.

**Tech Stack:** Astro 6 (static output) · TypeScript strict · `astro:content` content layer · `npm run astro check` for type verification · `npm run build` for final HTML inspection.

**Spec:** `docs/superpowers/specs/2026-05-29-seo-product-service-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/layouts/Base.astro` | Modify lines 18, 30, 74 | Accept `object \| object[]`; emit single `@graph` block |
| `src/layouts/Page.astro` | Modify line 18 | Mirror type change so prop flows through |
| `src/content.config.ts` | Modify products schema | Add optional `seoTitle` field |
| `src/content/products/algobridge.md` | Add 1 line | `seoTitle` frontmatter value |
| `src/content/products/pledgivo.md` | Add 1 line | `seoTitle` frontmatter value |
| `src/content/products/insurealgo.md` | Add 1 line | `seoTitle` frontmatter value |
| `src/pages/products/index.astro` | Modify title + add schema | Updated title string + `ItemList` schema |
| `src/pages/products/[slug].astro` | Modify frontmatter + `<Page>` call | Use `seoTitle`; build `SoftwareApplication` + `BreadcrumbList` |
| `src/pages/services/[slug].astro` | Modify frontmatter + `<Page>` call | New title format; build `ProfessionalService` + `BreadcrumbList` |

---

## Task 1: Extend Base.astro and Page.astro to accept schema arrays

**Files:**
- Modify: `src/layouts/Base.astro` (lines 18, 30–31, 74)
- Modify: `src/layouts/Page.astro` (line 18)

- [ ] **Step 1.1 — Update the `Props` interface in `Base.astro`**

In `src/layouts/Base.astro`, change line 18 from:
```ts
schema?: object;
```
to:
```ts
schema?: object | object[];
```

- [ ] **Step 1.2 — Add `schemaJson` computation to `Base.astro` frontmatter**

In `src/layouts/Base.astro`, after the destructuring block (currently ending around line 31), add:
```ts
const schemaJson: string | null = !schema
  ? null
  : Array.isArray(schema)
    ? JSON.stringify({ '@context': 'https://schema.org', '@graph': schema })
    : JSON.stringify(schema);
```

- [ ] **Step 1.3 — Update the schema `<script>` tag in `Base.astro`**

In `src/layouts/Base.astro`, change line 74 from:
```astro
{schema && <script is:inline type="application/ld+json" set:html={JSON.stringify(schema)} />}
```
to:
```astro
{schemaJson && <script is:inline type="application/ld+json" set:html={schemaJson} />}
```

- [ ] **Step 1.4 — Mirror the type change in `Page.astro`**

In `src/layouts/Page.astro`, change line 18 from:
```ts
schema?: object;
```
to:
```ts
schema?: object | object[];
```

- [ ] **Step 1.5 — Type-check**

```bash
npm run astro check
```
Expected: `0 errors`

- [ ] **Step 1.6 — Commit**

```bash
git add src/layouts/Base.astro src/layouts/Page.astro
git commit -m "feat(seo): extend schema prop to accept object | object[] with @graph serialisation"
```

---

## Task 2: Add `seoTitle` to content schema and product frontmatter

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/content/products/algobridge.md`
- Modify: `src/content/products/pledgivo.md`
- Modify: `src/content/products/insurealgo.md`

- [ ] **Step 2.1 — Add `seoTitle` to the products Zod schema**

In `src/content.config.ts`, inside the `products` schema object, add after `externalUrl`:
```ts
seoTitle:    z.string().optional(),
```

The products schema block should now look like (showing relevant lines):
```ts
externalUrl:    z.string().url().optional(),
seoTitle:       z.string().optional(),
version:        z.string().optional(),
```

- [ ] **Step 2.2 — Add `seoTitle` to `algobridge.md`**

In `src/content/products/algobridge.md`, add after the `externalUrl` line:
```yaml
seoTitle: "AlgoBridge — Salesforce to PostgreSQL Sync Tool | CloudAlgo"
```

- [ ] **Step 2.3 — Add `seoTitle` to `pledgivo.md`**

In `src/content/products/pledgivo.md`, add after the `icon` line (no `externalUrl` for Pledgivo):
```yaml
seoTitle: "Pledgivo — Native Salesforce Fundraising App for Nonprofits | CloudAlgo"
```

- [ ] **Step 2.4 — Add `seoTitle` to `insurealgo.md`**

In `src/content/products/insurealgo.md`, add after the `externalUrl` line:
```yaml
seoTitle: "InsureAlgo — Insurance Policy Tracker for iOS & Android | CloudAlgo"
```

- [ ] **Step 2.5 — Type-check**

```bash
npm run astro check
```
Expected: `0 errors`

- [ ] **Step 2.6 — Commit**

```bash
git add src/content.config.ts src/content/products/algobridge.md src/content/products/pledgivo.md src/content/products/insurealgo.md
git commit -m "feat(seo): add seoTitle field to products schema and frontmatter"
```

---

## Task 3: Products index — sharpen title and add ItemList schema

**Files:**
- Modify: `src/pages/products/index.astro`

- [ ] **Step 3.1 — Add `ItemList` schema computation**

In `src/pages/products/index.astro`, add after the `const secondary = products.slice(1);` line:
```ts
const catalogSchema = {
  '@context': 'https://schema.org',
  '@type':    'ItemList',
  name:       'CloudAlgo Products',
  url:        'https://cloudalgo.com/products',
  itemListElement: products.map((p, i) => ({
    '@type':  'ListItem',
    position: i + 1,
    name:     p.data.title,
    url:      `https://cloudalgo.com/products/${p.id}`,
  })),
};
```

- [ ] **Step 3.2 — Update the `<Page>` title and pass schema**

Change the `<Page ...>` opening tag from:
```astro
<Page
  title="Products — CloudAlgo"
  description="Purpose-built Salesforce apps and integration connectors from the CloudAlgo team — from production-ready to early access."
>
```
to:
```astro
<Page
  title="Salesforce Apps & AppExchange Products — CloudAlgo"
  description="Purpose-built Salesforce apps and integration connectors from the CloudAlgo team — from production-ready to early access."
  schema={catalogSchema}
>
```

- [ ] **Step 3.3 — Type-check**

```bash
npm run astro check
```
Expected: `0 errors`

- [ ] **Step 3.4 — Commit**

```bash
git add "src/pages/products/index.astro"
git commit -m "feat(seo): add ItemList schema and sharpen title on products index"
```

---

## Task 4: Product detail page — seoTitle and SoftwareApplication + BreadcrumbList schema

**Files:**
- Modify: `src/pages/products/[slug].astro`

- [ ] **Step 4.1 — Add schema-building constants to the frontmatter**

In `src/pages/products/[slug].astro`, add these lines immediately after `const { data } = product;` (and after the existing `const { Content } = await render(product);` and `const hasBody` lines):

```ts
const siteBase = 'https://cloudalgo.com';

const osMap: Record<string, string> = {
  'salesforce-app': 'Salesforce',
  'mobile-app':     'iOS, Android',
  'integration':    'Linux, Docker',
};

const softwareApp: Record<string, unknown> = {
  '@type':             'SoftwareApplication',
  name:                data.title,
  description:         data.tagline,
  applicationCategory: 'BusinessApplication',
  operatingSystem:     osMap[data.type] ?? 'Web',
  url:                 `${siteBase}/products/${slug}`,
  provider: {
    '@type': 'Organization',
    name:    'CloudAlgo',
    url:     siteBase,
  },
};

if (data.externalUrl) softwareApp.downloadUrl = data.externalUrl;
if (data.status === 'ga') {
  softwareApp.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };
}

const productSchema: object[] = [
  softwareApp,
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: `${siteBase}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${siteBase}/products` },
      { '@type': 'ListItem', position: 3, name: data.title, item: `${siteBase}/products/${slug}` },
    ],
  },
];
```

- [ ] **Step 4.2 — Update the `<Page>` call**

Find the `<Page` opening tag (currently `title={`${data.title} — CloudAlgo Products`}`) and change it to:
```astro
<Page
  title={data.seoTitle ?? `${data.title} — CloudAlgo Products`}
  description={data.tagline}
  schema={productSchema}
>
```

- [ ] **Step 4.3 — Type-check**

```bash
npm run astro check
```
Expected: `0 errors`

- [ ] **Step 4.4 — Commit**

```bash
git add "src/pages/products/[slug].astro"
git commit -m "feat(seo): add SoftwareApplication + BreadcrumbList schema to product detail pages"
```

---

## Task 5: Service detail pages — title format and ProfessionalService + BreadcrumbList schema

**Files:**
- Modify: `src/pages/services/[slug].astro`

- [ ] **Step 5.1 — Add schema-building constants to the frontmatter**

In `src/pages/services/[slug].astro`, add after `const { Content } = await render(service);`:
```ts
const siteBase = 'https://cloudalgo.com';

const serviceSchema: object[] = [
  {
    '@type':       'ProfessionalService',
    name:          service.data.title,
    description:   service.data.excerpt,
    serviceType:   service.data.title,
    areaServed:    'Worldwide',
    url:           `${siteBase}/services/${service.id}`,
    provider: {
      '@type': 'Organization',
      name:    'CloudAlgo',
      url:     siteBase,
    },
  },
  {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: `${siteBase}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${siteBase}/services` },
      { '@type': 'ListItem', position: 3, name: service.data.title, item: `${siteBase}/services/${service.id}` },
    ],
  },
];
```

- [ ] **Step 5.2 — Update the `<Page>` call**

Change the `<Page` opening tag from:
```astro
<Page
  title={`${service.data.title} — CloudAlgo`}
  description={service.data.excerpt}
>
```
to:
```astro
<Page
  title={`${service.data.title} — Salesforce Services | CloudAlgo`}
  description={service.data.excerpt}
  schema={serviceSchema}
>
```

- [ ] **Step 5.3 — Type-check**

```bash
npm run astro check
```
Expected: `0 errors`

- [ ] **Step 5.4 — Commit**

```bash
git add "src/pages/services/[slug].astro"
git commit -m "feat(seo): add ProfessionalService + BreadcrumbList schema to service detail pages"
```

---

## Task 6: Build and verify schema output in generated HTML

- [ ] **Step 6.1 — Production build**

```bash
npm run build
```
Expected: build completes with no errors.

- [ ] **Step 6.2 — Verify products index schema**

```bash
grep -A 5 'application/ld+json' dist/products/index.html
```
Expected output contains:
```
"@type":"ItemList","name":"CloudAlgo Products"
```

- [ ] **Step 6.3 — Verify AlgoBridge product page schema**

```bash
grep -o 'application/ld+json.*</script>' dist/products/algobridge/index.html | head -c 500
```
Expected: JSON contains `"@graph"`, `"SoftwareApplication"`, `"downloadUrl":"https://bridge.cloudalgo.com/"`, `"BreadcrumbList"`.

- [ ] **Step 6.4 — Verify Pledgivo product page schema (no offers, no downloadUrl)**

```bash
grep -o '"@graph":\[.*' dist/products/pledgivo/index.html | head -c 400
```
Expected: JSON contains `"SoftwareApplication"` and `"BreadcrumbList"` but does NOT contain `"offers"` or `"downloadUrl"`.

- [ ] **Step 6.5 — Verify InsureAlgo product page schema**

```bash
grep -o '"@graph":\[.*' dist/products/insurealgo/index.html | head -c 400
```
Expected: `"operatingSystem":"iOS, Android"`, `"offers":{"@type":"Offer","price":"0"}`, `"downloadUrl":"https://apps.apple.com/app/insurealgo/id6748688246"`.

- [ ] **Step 6.6 — Verify service page schema**

```bash
grep -o '"@graph":\[.*' dist/services/salesforce-consulting/index.html | head -c 400
```
Expected: `"ProfessionalService"`, `"areaServed":"Worldwide"`, `"BreadcrumbList"`.

- [ ] **Step 6.7 — Verify product detail title tags use seoTitle**

```bash
grep '<title>' dist/products/algobridge/index.html
grep '<title>' dist/products/pledgivo/index.html
grep '<title>' dist/products/insurealgo/index.html
```
Expected:
```
<title>AlgoBridge — Salesforce to PostgreSQL Sync Tool | CloudAlgo</title>
<title>Pledgivo — Native Salesforce Fundraising App for Nonprofits | CloudAlgo</title>
<title>InsureAlgo — Insurance Policy Tracker for iOS & Android | CloudAlgo</title>
```

- [ ] **Step 6.8 — Verify service detail title format**

```bash
grep '<title>' dist/services/salesforce-consulting/index.html
```
Expected:
```
<title>Salesforce Consulting & Implementation — Salesforce Services | CloudAlgo</title>
```

- [ ] **Step 6.9 — Final commit and push**

```bash
git push
```
