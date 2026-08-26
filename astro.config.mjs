// astro.config.mjs
// Note: Requires Node >=22.12.0 (set node-version: 22 in GitHub Actions)
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { defineHastPlugin } from 'satteri';

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
    [`/blog/${dated}`, `/blog/${slug}/`],
    [`/blog/${dated.replace(/^\d{4}-\d{2}-\d{2}-/, '')}`, `/blog/${slug}/`],
  ]),
);

const blogRedirects = Object.fromEntries(
  readdirSync('./src/content/blog')
    .filter(f => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .map(f => {
      const dated = f.replace(/\.md$/, '');
      return [`/blog/${dated}`, `/blog/${dated.replace(/^\d{4}-\d{2}-\d{2}-/, '')}/`];
    }),
);

// The journal's filenames carry the publication date, and the frontmatter
// `date` agrees with them, so the sitemap can state a lastmod for every post
// without parsing a single frontmatter block.
//
// Only the journal gets one. A crawler that finds a lastmod it cannot trust
// stops reading the field across the whole site, so the pages whose last
// change nobody records -- the static ones -- say nothing rather than
// claiming the build date.
const blogLastmod = Object.fromEntries(
  readdirSync('./src/content/blog')
    .filter(f => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .map(f => {
      const [date] = f.match(/^\d{4}-\d{2}-\d{2}/);
      const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return [`https://cloudalgo.com/blog/${slug}/`, new Date(`${date}T00:00:00Z`).toISOString()];
    }),
);

/**
 * A lone image in a paragraph becomes a <figure>, and its alt text becomes
 * the <figcaption>.
 *
 * Markdown has no caption syntax: `![alt](src)` on its own line comes out
 * as `<p><img></p>`, and an uncaptioned picture in the middle of a
 * write-up is a picture nobody can tell you the point of. Lifting it here
 * rather than in the template is what keeps the caption in the content
 * file, where the author writes it.
 *
 * The alt is moved rather than copied: a caption sitting directly under
 * the image it describes would otherwise be read out twice.
 *
 * An image with no alt is decorative by declaration and is left where the
 * author put it; so is an image sharing its paragraph with other content.
 *
 * A Sätteri hast visitor, not a rehype plugin: Astro 7 runs its own
 * Markdown pipeline and only reaches for unified when told to, and one
 * paragraph rule is not worth putting the whole remark stack back.
 */
const satteriFigures = defineHastPlugin({
  name: 'cloudalgo-markdown-figures',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const kids = (node.children ?? []).filter(
        (c) => !(c.type === 'text' && !c.value.trim()),
      );
      if (kids.length !== 1) return;

      const img = kids[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;

      const alt = typeof img.properties?.alt === 'string' ? img.properties.alt.trim() : '';
      if (!alt) return;

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          { ...img, properties: { ...img.properties, alt: '' } },
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: alt }],
          },
        ],
      });
    },
  },
});

export default defineConfig({
  site: 'https://cloudalgo.com',
  output: 'static',
  redirects: { ...blogRedirects, ...renamedRedirects },
  markdown: { processor: satteri({ hastPlugins: [satteriFigures] }) },
  integrations: [
    react(),
    sitemap({
      serialize: item => (blogLastmod[item.url] ? { ...item, lastmod: blogLastmod[item.url] } : item),
    }),
  ],
});
