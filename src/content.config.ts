// src/content.config.ts
import { defineCollection, reference } from 'astro:content';
// `z` from 'astro:content' is deprecated in Astro 7 and slated for removal.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Filenames keep their YYYY-MM-DD- prefix so the directory stays in chronological
  // order, but the prefix is stripped from the URL slug. Old date-prefixed paths are
  // redirected in astro.config.mjs.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
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
    relatedCaseStudy:   z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title:   z.string(),
    // The name for a narrow slot -- the footer's quarter-width column, where
    // the full title wraps to three lines. Declared rather than derived: the
    // footer used to cut the title at its "&", which turned "Salesforce
    // Consulting & Implementation" into "Salesforce Consulting" and left
    // "Airflow Data Pipelines" at full length, because a rule that only knows
    // about conjunctions cannot shorten a title that has none.
    shortTitle: z.string(),
    order:   z.number(),
    icon:    z.string(),
    excerpt: z.string(),
    // What demonstrates this service. Exactly one of these two, enforced
    // below, because the design has one slot and it must not be empty.
    //
    // `proves` is a reference rather than a bare string, so a service naming
    // a product that does not exist fails the build instead of rendering a
    // dead link.
    //
    // `provenBy` exists because not every practice ships a product. Consulting
    // is proven by the work delivered -- the mock's row reads "Proven by /
    // 70+ projects" -- and when the schema demanded a product reference here,
    // consulting was pointed at Pledgivo, a package it did not build. A field
    // that forces a false answer gets a false answer.
    proves:   reference('products').optional(),
    provenBy: z.string().optional(),
  }).refine(
    (d) => Boolean(d.proves) !== Boolean(d.provenBy),
    { message: 'A service needs exactly one of `proves` (a product it shipped) or `provenBy` (a plain claim).' }
  ),
});

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    title:          z.string(),
    status:         z.enum(['ga', 'preview', 'beta']),
    type:           z.enum(['salesforce-app', 'integration', 'mobile-app', 'desktop-app']),
    tagline:        z.string(),
    excerpt:        z.string(),
    icon:           z.string(),
    externalUrl:    z.url().optional(),
    issuesUrl:      z.url().optional(),
    guideUrl:       z.string().optional(),
    seoTitle:       z.string().optional(),
    version:        z.string().optional(),
    lastUpdated:    z.string().optional(),
    order:          z.number(),
    features: z.array(z.object({
      icon:        z.string(),
      title:       z.string(),
      description: z.string(),
    })).min(1),
    screenshots:  z.array(z.string()).optional(),
    video: z.object({
      src:      z.string(),
      poster:   z.string().optional(),
      captions: z.string().optional(),
      title:    z.string(),
      duration: z.string().optional(),
      heading:  z.string().optional(),
    }).optional(),
    pricing: z.array(z.object({
      tier:  z.string(),
      price: z.string(),
    })).optional(),
    requirements: z.array(z.string()).optional(),
    techStack: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    roadmap: z.array(z.object({
      version:     z.string(),
      theme:       z.string(),
      description: z.string(),
    })).optional(),
    legal: z.array(z.object({
      label: z.string(),
      href:  z.string(),
    })).optional(),
    published:    z.boolean(),
  }),
});

export const collections = { blog, services, products };
