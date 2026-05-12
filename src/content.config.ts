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

export const collections = { blog, services };
