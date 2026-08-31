// astro.config.mjs
// Note: Requires Node >=22.12.0 (set node-version: 22 in GitHub Actions)
import { readdirSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { defineHastPlugin } from 'satteri';
import sharp from 'sharp';
import { unblockRedirectStub } from './src/build/redirect-stubs.ts';
import { legacyRedirects } from './src/build/legacy-redirects.ts';
import {
  cardHero,
  declaredCards,
  CARD_WIDTH,
  CARD_HEIGHT,
} from './src/build/social-cards.ts';

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

// Paths that predate this site and still arrive from Google and from links we
// do not control, listed in src/build/legacy-redirects.ts with the Search
// Console impressions that earned each one its line.
//
// One shape is not there and cannot be: the oldest posts used the raw title as
// the slug, so the path carries spaces, parentheses and an unencoded "/" that
// Astro's router reads as more path segments. The one such URL still drawing
// impressions is a hand-written stub under public/blog/2022/05/, copied
// verbatim into the build.

// The dated-directory blog URLs, generated rather than listed: every post gets
// one, and a post that was also retitled gets a second under its old slug, so
// an old link survives both moves. Built from the same filenames the flat
// redirects above are built from, so the two cannot drift apart.
const datedDirRedirects = Object.fromEntries(
  readdirSync('./src/content/blog')
    .filter(f => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .flatMap(f => {
      const dated = f.replace(/\.md$/, '');
      const [, year, month] = dated.match(/^(\d{4})-(\d{2})/);
      const slug = dated.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const old = Object.entries(RENAMED)
        .filter(([, to]) => to === slug)
        .map(([from]) => from.replace(/^\d{4}-\d{2}-\d{2}-/, ''));
      return [slug, ...old].map(s => [`/blog/${year}/${month}/${s}`, `/blog/${slug}/`]);
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

/**
 * Take the `noindex` back off every generated redirect stub.
 *
 * See src/build/redirect-stubs.ts for why it must come off. This runs as a
 * post-build pass because Astro hardcodes the tag in its redirect template
 * and exposes no option to change it.
 */
const indexableRedirects = {
  name: 'cloudalgo-indexable-redirects',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const files = await readdir(root, { recursive: true });
      let freed = 0;
      for (const name of files) {
        if (!name.endsWith('.html')) continue;
        const path = join(root, name);
        const rewritten = unblockRedirectStub(await readFile(path, 'utf8'));
        if (rewritten === null) continue;
        await writeFile(path, rewritten);
        freed += 1;
      }
      logger.info(`${freed} redirect stubs may now pass their ranking on`);
    },
  },
};

/**
 * Draw the bitmap social card for every entry headed by an SVG drawing.
 *
 * See src/build/social-cards.ts for why the card cannot be the SVG itself.
 * The list of cards is read back out of the emitted HTML rather than from the
 * content collection, so what gets drawn is exactly what got declared: a card
 * named by a page and never written would be a 404 that no crawler reports.
 *
 * Rendered at 2x through librsvg and downsampled, which is what keeps the
 * small type on these diagrams readable. The drawings are built out of boxes
 * with room in them, so the system face librsvg substitutes for Archivo sets
 * within the same bounds -- verified against a deliberately wider face.
 */
const socialCards = {
  name: 'cloudalgo-social-cards',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const files = await readdir(root, { recursive: true });

      const wanted = new Set();
      for (const name of files) {
        if (!name.endsWith('.html')) continue;
        for (const card of declaredCards(await readFile(join(root, name), 'utf8'))) {
          wanted.add(card);
        }
      }

      for (const card of wanted) {
        const hero = join(root, cardHero(card).slice(1));
        let svg;
        try {
          svg = await readFile(hero);
        } catch {
          throw new Error(
            `A page names the social card ${card}, but ${cardHero(card)} is not in the `
              + 'built site. Every card is drawn from its SVG hero -- add the hero, or '
              + 'point the entry at a bitmap.',
          );
        }
        await sharp(svg, { density: 192 })
          .resize(CARD_WIDTH, CARD_HEIGHT, { fit: 'contain' })
          .png()
          .toFile(join(root, card.slice(1)));
      }

      logger.info(`${wanted.size} social cards drawn from their SVG heroes`);
    },
  },
};

export default defineConfig({
  site: 'https://cloudalgo.com',
  output: 'static',
  redirects: { ...blogRedirects, ...renamedRedirects, ...datedDirRedirects, ...legacyRedirects },
  markdown: { processor: satteri({ hastPlugins: [satteriFigures] }) },
  integrations: [
    indexableRedirects,
    socialCards,
    react(),
    sitemap({
      serialize: item => (blogLastmod[item.url] ? { ...item, lastmod: blogLastmod[item.url] } : item),
    }),
  ],
});
