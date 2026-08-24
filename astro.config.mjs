// astro.config.mjs
// Note: Requires Node >=22.12.0 (set node-version: 22 in GitHub Actions)
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Blog slugs dropped their YYYY-MM-DD- filename prefix (see src/content.config.ts).
// Anything already indexed at the dated path is redirected to the clean one.
// Posts that were retitled and reslugged. Both the original dated path and the
// original clean path redirect to the current slug.
const RENAMED = {
  '2022-04-04-heroku-connect-and-best-practice-from-experience': 'heroku-connect-lessons-learned',
  '2022-06-06-formatting-a-apex-time-into-string-in-apex-class': 'format-apex-time-as-string',
  '2023-01-01-dynamic-javascript-import-in-salesforce-lightning-web-component-light-': 'loading-stripe-js-in-lwc-light-dom',
  '2023-04-04-a-comprehensive-guide-to-using-rest-and-soap-apis-in-salesforce-with-n': 'salesforce-rest-and-soap-apis-nodejs',
  '2023-04-04-mastering-advanced-soql-queries-in-salesforce-tips-and-tricks': 'advanced-soql-queries-salesforce',
  '2023-04-04-salesforce-oauth-setup-and-use-example-a-comprehensive-guide': 'salesforce-oauth-connected-app-setup',
  '2023-10-10-leveraging-apache-airflow-on-heroku-to-create-a-unified-data-ecosystem': 'apache-airflow-on-heroku-salesforce-data',
  '2024-01-01-an-effective-method-for-launching-an-asynchronous-process-in-heroku-us': 'async-heroku-processes-from-salesforce-apex',
};

const renamedRedirects = Object.fromEntries(
  Object.entries(RENAMED).flatMap(([dated, slug]) => [
    [`/blog/${dated}`, `/blog/${slug}`],
    [`/blog/${dated.replace(/^\d{4}-\d{2}-\d{2}-/, '')}`, `/blog/${slug}`],
  ]),
);

const blogRedirects = Object.fromEntries(
  readdirSync('./src/content/blog')
    .filter(f => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .map(f => {
      const dated = f.replace(/\.md$/, '');
      return [`/blog/${dated}`, `/blog/${dated.replace(/^\d{4}-\d{2}-\d{2}-/, '')}`];
    }),
);

export default defineConfig({
  site: 'https://cloudalgo.com',
  output: 'static',
  redirects: { ...blogRedirects, ...renamedRedirects },
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
