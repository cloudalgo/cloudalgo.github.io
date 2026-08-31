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
import { defineHastPlugin, defineMdastPlugin } from 'satteri';
import { unblockRedirectStub } from './src/build/redirect-stubs.ts';
import { legacyRedirects } from './src/build/legacy-redirects.ts';

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
 * The site's own origin, named once.
 *
 * It is `site:` below and it is the test the link pass runs, and those two
 * had better not drift: a mismatch would silently mark every internal link
 * external and open the whole archive in new tabs.
 */
const SITE_ORIGIN = 'https://cloudalgo.com';

/** Is this href somewhere on this site? */
const isOurs = (host) => host === 'cloudalgo.com' || host.endsWith('.cloudalgo.com');

/**
 * Mark every link in an entry as leading away or leading deeper.
 *
 * A reader deciding whether to follow a link is asking one question -- does
 * this take me out of what I am reading -- and the answer costs a glyph.
 * External links get `data-ext`, which the prose styles with a trailing
 * arrow bound to the last word by a non-breaking space, so the arrow cannot
 * orphan onto a line of its own; internal ones get `data-ref` and a quieter
 * underline, because a cross-reference into our own archive should not
 * shout.
 *
 * SAME-ORIGIN IS TESTED BY PARSING, never by `href.startsWith(origin)`.
 * That comparison reads `https://cloudalgo.com.evil.test/` as our own site
 * and hands it the trusted treatment -- it is the identical mistake
 * `classifyLink` in src/lib/engagement.ts exists to avoid, and the two must
 * keep agreeing about what "ours" means.
 */
const satteriLinks = defineHastPlugin({
  name: 'cloudalgo-markdown-links',
  element: {
    filter: ['a'],
    /* Every write goes through `ctx.setProperty`. The node handed to a
       visitor is a Readonly view of a tree that lives on the Rust side of
       satteri, so assigning to `node.properties` mutates a copy and is
       thrown away without a word -- which is exactly what it did: a build
       that stayed green and shipped an archive where no link was
       marked. */
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href) return;
      // A jump inside the page is neither: it goes nowhere.
      if (href.startsWith('#')) return;

      let url;
      try {
        url = new URL(href, `${SITE_ORIGIN}/`);
      } catch {
        return;
      }
      // mailto:, tel: and friends are actions, not destinations.
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      if (isOurs(url.hostname)) {
        ctx.setProperty(node, 'data-ref', '');
        return;
      }

      ctx.setProperty(node, 'data-ext', '');
      ctx.setProperty(node, 'target', '_blank');
      // `noopener` is the security half (the opened tab cannot reach back
      // through `window.opener`); `noreferrer` keeps our reader's path off
      // somebody else's analytics.
      ctx.setProperty(node, 'rel', 'noopener noreferrer');
    },
  },
});

/**
 * Turn a blockquote that opens `**Keep.**` or `**Watch.**` into a note.
 *
 * Markdown has one aside and the entries need two: the thing to remember
 * and the thing that will bite you. Rather than invent a fence syntax that
 * renders as garbage anywhere else -- GitHub, an RSS reader, a plain text
 * editor -- the entry writes an ordinary blockquote whose first words say
 * which kind it is. Everywhere but here it reads as a quotation with a bold
 * lead-in, which is exactly what it is.
 *
 * Every other blockquote stays a blockquote.
 */
/* `null` prototype, so the lookup below can only ever find a kind we put
   here. A plain object literal inherits `constructor`, `toString` and the
   rest, and the label being looked up is the first bold run of a
   blockquote -- author input. `NOTE_KINDS['constructor']` on a literal
   returns a function, which is truthy, and the build then dies on
   `.split` of it. */
const NOTE_KINDS = Object.assign(Object.create(null), {
  'Keep.': 'note',
  'Watch.': 'note note--warn',
});

const satteriNotes = defineHastPlugin({
  name: 'cloudalgo-markdown-notes',
  element: {
    filter: ['blockquote'],
    visit(node, ctx) {
      const kids = (node.children ?? []).filter(
        (c) => !(c.type === 'text' && !c.value.trim()),
      );
      const lead = kids[0];
      if (!lead || lead.type !== 'element' || lead.tagName !== 'p') return;

      const first = (lead.children ?? [])[0];
      if (!first || first.type !== 'element' || first.tagName !== 'strong') return;

      const label = (first.children ?? [])
        .map((c) => (c.type === 'text' ? c.value : ''))
        .join('')
        .trim();
      const className = NOTE_KINDS[label];
      if (!className) return;

      // The keyword moves out of the paragraph and becomes the note's own
      // head, so it is not read twice.
      const rest = (lead.children ?? []).slice(1);
      // Markdown leaves the space that followed the bold run; without this
      // every note would open on an indent.
      if (rest[0]?.type === 'text') rest[0] = { ...rest[0], value: rest[0].value.replace(/^\s+/, '') };

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: className.split(' ') },
        children: [
          {
            type: 'element',
            tagName: 'b',
            properties: { className: ['note__k'] },
            children: [{ type: 'text', value: label.replace(/\.$/, '') }],
          },
          { ...lead, children: rest },
          ...kids.slice(1),
        ],
      });
    },
  },
});

/**
 * Wrap a code block in a bar that names its language.
 *
 * The language exists in the markup already -- as the `language-*` class
 * markdown puts on the <code> -- but only a syntax highlighter ever reads
 * it, and a reader who cannot tell Apex from shell at a glance pastes the
 * wrong thing into the wrong window. This lifts it into something a person
 * can see. The copy button is NOT rendered here: it is added by the entry's
 * own script, so it exists only where it would work.
 *
 */
const satteriCode = defineMdastPlugin({
  name: 'cloudalgo-markdown-code',

  /* IT IS AN MDAST PLUGIN, NOT A HAST ONE, and that is not a style choice.
     Astro pushes its own Shiki highlighter into the hast plugin list AHEAD
     of ours (see @astrojs/markdown-satteri's satteri-processor), and that
     plugin's <pre> visitor RETURNS a replacement -- Shiki's own freshly
     built <pre>. A node handed back by one visitor is not re-offered to the
     visitors that follow it, so a `pre` filter downstream matched nothing
     whatsoever, and an `after` hook could see the finished tree but not
     change it. Nothing said so either way: the build stayed green, the page
     still had code on it, and the bar simply was not there.

     Upstream of all of that, the block is still a markdown fence with its
     language on it, and the bar can be laid down beside it as raw HTML that
     the highlighter never touches. */
  code(node, ctx) {
    const lang = (node.lang ?? '').trim().toLowerCase();
    // An unlabelled block gets no bar. A chip reading "CODE" tells the
    // reader nothing they could not already see.
    if (!lang || lang === 'plaintext') return;

    // Escaped, because a fence's info string is author input and this is
    // being written into markup.
    const safe = lang.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    ctx.insertBefore(node, {
      type: 'html',
      value: `<div class="code"><div class="code__bar"><span class="code__lang">${safe}</span></div>`,
    });
    ctx.insertAfter(node, { type: 'html', value: '</div>' });
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

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  redirects: { ...blogRedirects, ...renamedRedirects, ...datedDirRedirects, ...legacyRedirects },
  markdown: {
    processor: satteri({
      mdastPlugins: [satteriCode],
      hastPlugins: [satteriFigures, satteriLinks, satteriNotes],
    }),
  },
  integrations: [
    indexableRedirects,
    react(),
    sitemap({
      serialize: item => (blogLastmod[item.url] ? { ...item, lastmod: blogLastmod[item.url] } : item),
    }),
  ],
});
