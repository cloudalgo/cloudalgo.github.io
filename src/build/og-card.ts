/**
 * The layout of a Journal entry's social card.
 *
 * A card is the one place an entry travels without the page around it. In a
 * Slack unfurl or a LinkedIn preview there is no masthead, no standfirst and
 * no URL bar -- so a card that is only the hero drawing says nothing about
 * what the entry claims, and a card that is only type says nothing about
 * whether there is any real work in it. This one carries both: the headline
 * and its standfirst on the left, a slice of the entry's own diagram on the
 * right, and the wordmark under them.
 *
 * Laid out by satori and rasterised by sharp, which matters for one reason:
 * satori emits every glyph as a PATH. Neither this machine nor the CI runner
 * needs Archivo or Geist installed, and the card cannot silently come out in
 * a substituted face -- the failure mode the older hero-only card had to be
 * hand-checked against on every build.
 *
 * The type is therefore vendored, in `fonts/`, under the OFL each ships with.
 * Static instances, not the variable files: satori renders a variable font at
 * its default instance, so `Archivo[wght].ttf` would quietly set the headline
 * at 400 instead of 900.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

/* ── Geometry ──────────────────────────────────────────────
   1200x630 is the size every crawler documents. The panel is inset from all
   four sides on the ember ground, and offset up-left from a hard shadow, so
   the card still reads as a card against a white or a black timeline. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const PANEL = { x: 46, y: 40, w: 1108, h: 508, radius: 22, shadow: 14 };
const PAD = { left: 44, right: 36, top: 40, bottom: 40 };

/** Left column type, right column drawing. They sum to the panel's inner width. */
const COL_TEXT = 540;
const COL_GAP = 32;
const COL_ART = PANEL.w - PAD.left - PAD.right - COL_TEXT - COL_GAP;
const COL_HEIGHT = PANEL.h - PAD.top - PAD.bottom;

export const ART = { width: COL_ART, height: COL_HEIGHT, radius: 14 };
export const MARK_HEIGHT = 24;

/**
 * The mark, taken from the same artwork the masthead inlines -- not from
 * public/logo.svg, which is the older export and a different drawing. There
 * is one lockup on this site and the card carries that one.
 *
 * Its fills are `var(--logo-*, #fallback)`, because in the page the mark
 * resolves against the four knobs in tokens/_components.scss. A card has no
 * cascade to resolve against and librsvg has no custom properties, so the
 * fallbacks -- which are the artwork's own values -- are substituted in.
 */
export function markSvg(): string {
  const art = readFileSync(here('../assets/brand/logo-lockup.svg'), 'utf8');
  const resolved = art.replace(/var\(--logo-[a-z]+,\s*(#[0-9a-fA-F]{3,8})\)/g, '$1');
  if (resolved.includes('var(--')) {
    throw new Error('The lockup has a fill this card cannot resolve to a colour.');
  }
  return resolved;
}

/**
 * The headline is set to fit rather than to a fixed size, because these
 * headlines are sentences and run from six words to twenty. The ladder is
 * measured off Archivo Black's average advance in a 540px column; the line
 * clamp is the backstop, so an outlier is cut rather than pushed through the
 * rule below it.
 */
function headlineSize(title: string): number {
  if (title.length <= 40) return 52;
  if (title.length <= 65) return 44;
  if (title.length <= 95) return 38;
  return 33;
}

/* ── Colour ────────────────────────────────────────────────
   Read out of the live theme rather than restated here. A bitmap cannot hold
   a CSS custom property, but it can still refuse to invent a colour: these
   are the same six hexes the site paints with, and a token this file names
   and the theme has dropped fails loudly instead of rendering off-brand. */
const THEME = here('../styles/themes/_press-room.scss');

const NEEDED = [
  'ink-900',
  'ink-500',
  'ink-400',
  'paper-000',
  'paper-100',
  'paper-200',
  'accent-500',
  'accent-on',
] as const;

export type Palette = Record<(typeof NEEDED)[number], string>;

export function palette(source = readFileSync(THEME, 'utf8')): Palette {
  const out = {} as Palette;
  for (const token of NEEDED) {
    const hit = new RegExp(`'${token}'\\s*:\\s*(#[0-9a-f]{3,8})`, 'i').exec(source);
    if (!hit) {
      throw new Error(
        `The press-room theme no longer defines '${token}', which the social card `
          + 'paints with. Point src/build/og-card.ts at whatever replaced it.',
      );
    }
    out[token] = hit[1];
  }
  return out;
}

/* ── Type ──────────────────────────────────────────────────
   satori wants font buffers, and wants them once. */
export const fonts = [
  { name: 'Archivo', data: readFileSync(here('fonts/Archivo-Black.ttf')), weight: 900 as const, style: 'normal' as const },
  { name: 'Geist', data: readFileSync(here('fonts/Geist-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: readFileSync(here('fonts/Geist-SemiBold.ttf')), weight: 600 as const, style: 'normal' as const },
];

export interface CardContent {
  /** The collection's category enum -- Salesforce, Heroku, MuleSoft, AWS, Product. */
  category: string;
  title: string;
  /** The entry's own standfirst, already cut to length by the caller. */
  standfirst: string;
  /** "31 Aug 2026 · 6 min read". */
  meta: string;
  /** The cropped hero, as a data URI at exactly ART.width x ART.height. */
  art: string;
  /** The wordmark, as a data URI. */
  mark: string;
  markWidth: number;
}

/** A satori element. Plain objects, so nothing here needs JSX or a transform. */
type El = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): El => ({
  type,
  props: children === undefined ? { style } : { style, children },
});

/**
 * The card the 34 pages with no drawing of their own carry: every service,
 * product, case study and legal page, and the home page.
 *
 * It is the same plate as an entry's card -- ember ground, white panel, hard
 * ink shadow -- because a reader who has seen one of these in a timeline
 * should recognise the next. What changes is the right column: an entry
 * shows a slice of its own diagram, and the site shows the four facts its
 * own home page leads with.
 *
 * The one it replaced was drawn against the monochrome skin this site no
 * longer wears, and carried a 92% success rate that appears nowhere else on
 * the site and answers to no definition. Every figure here is stated in words
 * a reader can check on the page it links to.
 */
export interface DefaultCardContent {
  /** The ember pill. Where an entry names its category, the site names itself. */
  eyebrow: string;
  title: string;
  standfirst: string;
  /** Label and value, in the order the home page's own fact list runs. */
  facts: { label: string; value: string }[];
  /** Set larger than the ladder would: this standfirst is two lines, not four,
   *  so the column has the room and the site's own promise should use it. */
  titleSize?: number;
  domain: string;
  mark: string;
  markWidth: number;
}

export function defaultCardTree(c: DefaultCardContent, p: Palette): El {
  const text = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: COL_TEXT,
      height: COL_HEIGHT,
    },
    [
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            backgroundColor: p['accent-500'],
            color: p['accent-on'],
            fontFamily: 'Geist',
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: 1.4,
            padding: '7px 13px',
            borderRadius: 7,
          },
          c.eyebrow.toUpperCase(),
        ),
        el(
          'div',
          {
            display: 'block',
            marginTop: 22,
            fontFamily: 'Archivo',
            fontWeight: 900,
            fontSize: c.titleSize ?? headlineSize(c.title),
            lineHeight: 1.04,
            letterSpacing: -1.6,
            color: p['ink-900'],
            lineClamp: 4,
          },
          c.title,
        ),
        el(
          'div',
          {
            display: 'block',
            marginTop: 18,
            fontFamily: 'Geist',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.45,
            color: p['ink-500'],
            lineClamp: 3,
          },
          c.standfirst,
        ),
      ]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { display: 'flex', width: 300, height: 4 }, [
          el('div', {
            display: 'flex',
            width: 84,
            height: 4,
            borderRadius: '2px 0 0 2px',
            backgroundColor: p['accent-500'],
          }),
          el('div', {
            display: 'flex',
            width: 216,
            height: 4,
            borderRadius: '0 2px 2px 0',
            backgroundColor: p['paper-200'],
          }),
        ]),
        el(
          'div',
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 18,
            width: '100%',
          },
          [
            el(
              'div',
              {
                display: 'flex',
                fontFamily: 'Geist',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 0.2,
                color: p['ink-400'],
              },
              c.domain,
            ),
            { type: 'img', props: { src: c.mark, width: c.markWidth, height: MARK_HEIGHT } },
          ],
        ),
      ]),
    ],
  );

  const plate = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: ART.width,
      height: ART.height,
      marginLeft: COL_GAP,
      padding: '4px 26px',
      borderRadius: ART.radius,
      backgroundColor: p['paper-100'],
      border: `1px solid ${p['paper-200']}`,
    },
    c.facts.map((fact, i) =>
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '17px 0',
          ...(i === 0 ? {} : { borderTop: `1px solid ${p['paper-200']}` }),
        },
        [
          el(
            'div',
            {
              display: 'flex',
              fontFamily: 'Geist',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: 1.3,
              color: p['ink-400'],
            },
            fact.label.toUpperCase(),
          ),
          el(
            'div',
            {
              display: 'block',
              marginTop: 7,
              fontFamily: 'Geist',
              fontWeight: 600,
              fontSize: 17,
              lineHeight: 1.25,
              color: p['ink-900'],
            },
            fact.value,
          ),
        ],
      ),
    ),
  );

  return frame([text, plate], p);
}

export function cardTree(c: CardContent, p: Palette): El {
  const text = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: COL_TEXT,
      height: COL_HEIGHT,
    },
    [
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            backgroundColor: p['accent-500'],
            color: p['accent-on'],
            fontFamily: 'Geist',
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: 1.4,
            padding: '7px 13px',
            borderRadius: 7,
          },
          c.category.toUpperCase(),
        ),
        el(
          'div',
          {
            display: 'block',
            marginTop: 20,
            fontFamily: 'Archivo',
            fontWeight: 900,
            fontSize: headlineSize(c.title),
            lineHeight: 1.03,
            letterSpacing: -1.4,
            color: p['ink-900'],
            lineClamp: 5,
          },
          c.title,
        ),
        el(
          'div',
          {
            display: 'block',
            marginTop: 16,
            fontFamily: 'Geist',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.45,
            color: p['ink-500'],
            lineClamp: 3,
          },
          c.standfirst,
        ),
      ]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        /* The rule is the site's own device: a short ember segment leading a
           long neutral one, the same shape the section headings use. */
        el('div', { display: 'flex', width: 300, height: 4 }, [
          el('div', {
            display: 'flex',
            width: 84,
            height: 4,
            borderRadius: '2px 0 0 2px',
            backgroundColor: p['accent-500'],
          }),
          el('div', {
            display: 'flex',
            width: 216,
            height: 4,
            borderRadius: '0 2px 2px 0',
            backgroundColor: p['paper-200'],
          }),
        ]),
        el(
          'div',
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 18,
            width: '100%',
          },
          [
            el(
              'div',
              {
                display: 'flex',
                fontFamily: 'Geist',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 0.2,
                color: p['ink-400'],
              },
              c.meta,
            ),
            { type: 'img', props: { src: c.mark, width: c.markWidth, height: MARK_HEIGHT } },
          ],
        ),
      ]),
    ],
  );

  const art = el(
    'div',
    {
      display: 'flex',
      width: ART.width,
      height: ART.height,
      marginLeft: COL_GAP,
      borderRadius: ART.radius,
      overflow: 'hidden',
      backgroundColor: p['paper-100'],
      border: `1px solid ${p['paper-200']}`,
    },
    [{ type: 'img', props: { src: c.art, width: ART.width, height: ART.height } }],
  );

  return frame([text, art], p);
}

/**
 * The plate itself: an inset white panel on the ember ground, offset from a
 * hard ink shadow so the card still reads as a card against a white timeline
 * or a black one. Both cards are built on this, so neither can drift.
 */
function frame(columns: El[], p: Palette): El {
  const panel = el(
    'div',
    {
      display: 'flex',
      position: 'absolute',
      left: PANEL.x,
      top: PANEL.y,
      width: PANEL.w,
      height: PANEL.h,
      padding: `${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px`,
      backgroundColor: p['paper-000'],
      borderRadius: PANEL.radius,
      boxShadow: `${PANEL.shadow}px ${PANEL.shadow}px 0 ${p['ink-900']}`,
    },
    columns,
  );

  return el(
    'div',
    {
      display: 'flex',
      position: 'relative',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: p['accent-500'],
    },
    [panel],
  );
}
