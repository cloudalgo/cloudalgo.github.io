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
    type:           z.enum(['salesforce-app', 'integration', 'mobile-app']),
    tagline:        z.string(),
    excerpt:        z.string(),
    icon:           z.string(),
    externalUrl:    z.string().url().optional(),
    version:        z.string().optional(),
    lastUpdated:    z.string().optional(),
    order:          z.number(),
    features: z.array(z.object({
      icon:        z.string(),
      title:       z.string(),
      description: z.string(),
    })).min(1),
    screenshots:  z.array(z.string()).optional(),
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
    published:    z.boolean(),
  }),
});

export const collections = { blog, services, products };
