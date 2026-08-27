// src/lib/engagement.ts
//
// What the reader did, as opposed to whether they converted.
//
// The conversion events in analytics.ts answer "did this visit turn into a
// lead?". Almost none do. That leaves the great majority of traffic
// reporting a single fact -- a page was viewed -- when the interesting
// question about a consultancy's site is which of its claims a stranger
// actually read before leaving.
//
// So: every link click classified, every section that reached the
// viewport, every disclosure opened, and the first keystroke in a form.
// Four listeners, all delegated or observed, all attached once per page
// from Base.astro.
//
// The helpers below are pure and separately tested. The wiring at the
// bottom is the part that needs a browser, and it is deliberately thin --
// classification is where the bugs live, and classification is testable.

import { track } from './analytics';

export type LinkKind =
  | 'internal'
  | 'outbound'
  | 'mailto'
  | 'tel'
  | 'anchor'
  | 'download';

/**
 * GA4 truncates parameter values at 100 characters and silently drops the
 * overflow. Cutting here means a long value is reported as a recognisable
 * prefix rather than arriving mangled.
 *
 * The cut backs up to the last word boundary when there is one in the
 * final quarter, because these strings are read by a person in a report:
 * a section headline arriving as "...They need less of the" reads as a
 * transcription error, where "...They need less of" reads as an elision.
 */
export function clean(value: string, max = 100): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;

  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.75 ? cut.slice(0, lastSpace) : cut).replace(
    /[\s,;:.\u2014-]+$/,
    '',
  );
}

/**
 * Same origin, compared as origins rather than as string prefixes.
 *
 * `href.startsWith(origin)` looks equivalent and is not:
 * `https://cloudalgo.com.evil.test/` starts with `https://cloudalgo.com`
 * and would be reported as our own traffic. Parsing is the only honest
 * comparison, and an unparseable href is not ours.
 */
function sameOrigin(href: string, origin: string): boolean {
  try {
    return new URL(href).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/** The path of an absolute same-origin href, without query or hash. */
function pathOf(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    return '';
  }
}

/**
 * What kind of link is this?
 *
 * `href` is taken as the resolved absolute value (`HTMLAnchorElement.href`),
 * except for the schemes the browser leaves alone. An in-page anchor is
 * distinguished from a page navigation by comparing everything left of the
 * hash: `/about/#team` clicked from `/about/` is an anchor, the same href
 * clicked from `/` is internal navigation.
 */
export function classifyLink(
  href: string,
  origin: string,
  currentPath = '',
): LinkKind {
  if (href.startsWith('mailto:')) return 'mailto';
  if (href.startsWith('tel:')) return 'tel';
  if (!sameOrigin(href, origin)) return 'outbound';

  const path = pathOf(href);
  if (href.includes('#') && path === currentPath) return 'anchor';
  if (/\.(pdf|zip|csv|docx?|xlsx?|pptx?)$/i.test(path)) return 'download';
  return 'internal';
}

/**
 * The catalogue item a link points at, if it points at one.
 *
 * Derived from the URL rather than from a data attribute on every card,
 * because the URL is already the identity: `/services/heroku-migration/`
 * IS the Heroku migration service, and a `data-` attribute duplicating
 * that is one more thing to forget on the next card component.
 *
 * Index pages return null -- `/services/` is not a service.
 */
export function itemFromHref(
  href: string,
  origin: string,
): { item_category: string; item_id: string } | null {
  if (!sameOrigin(href, origin)) return null;
  const segments = pathOf(href).split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  const categories: Record<string, string> = {
    services: 'service',
    products: 'product',
    'case-studies': 'case_study',
    blog: 'blog_post',
  };
  const item_category = categories[segments[0]];
  return item_category ? { item_category, item_id: segments[1] } : null;
}

/**
 * A human-readable name for a section.
 *
 * The sections on this site label themselves for screen readers and not
 * for us -- some carry `aria-labelledby` pointing at their heading, some
 * carry `aria-label`, some only a class. Reading them in that order gets
 * a usable name out of all three without adding tracking attributes to
 * markup that already says what it is.
 */
export function sectionName(el: Element): string {
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const heading = el.ownerDocument.getElementById(labelledby);
    if (heading?.textContent) return clean(heading.textContent, 60);
  }

  const label = el.getAttribute('aria-label');
  if (label) return clean(label, 60);

  if (el.id) return clean(el.id, 60);

  const named = Array.from(el.classList).find(
    (c) => c !== 'section' && !c.startsWith('astro-'),
  );
  return named ? clean(named, 60) : 'unnamed';
}

/**
 * Where on the page the reader clicked.
 *
 * Chrome first (a link in the masthead means something different from the
 * same link in the body), then the enclosing section, then the fallback.
 */
export function linkLocation(el: Element): string {
  const explicit = el.closest('[data-track-location]');
  if (explicit) {
    return clean(explicit.getAttribute('data-track-location') || 'body', 60);
  }
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  if (el.closest('#ca-cookie-popup')) return 'notice';

  const section = el.closest('section');
  return section ? sectionName(section) : 'body';
}

/** Broad page shape, for slicing every event below by template rather
 *  than by URL. */
export function pageType(path: string): string {
  const segments = path.split(/[#?]/)[0].split('/').filter(Boolean);
  if (segments.length === 0) return 'home';
  const [head] = segments;
  const known = ['services', 'products', 'case-studies', 'blog', 'page'];
  if (!known.includes(head)) return head;
  return segments.length > 1 ? `${head}_detail` : `${head}_index`;
}

// ── Wiring ───────────────────────────────────────────────────────────

/**
 * Attach every engagement listener. Idempotent: Astro's view transitions
 * can re-run page scripts, and a second set of listeners would double
 * every event on the page.
 */
export function initEngagement(): void {
  const w = window as unknown as { __caEngagement?: boolean };
  if (w.__caEngagement) return;
  w.__caEngagement = true;

  const origin = window.location.origin;
  const page_type = pageType(window.location.pathname);

  // ── Every link click, classified ──
  document.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const link_kind = classifyLink(
        anchor.href,
        origin,
        window.location.pathname,
      );
      const link_location = linkLocation(anchor);

      track('link_click', {
        link_kind,
        link_url: clean(anchor.href, 200),
        link_text: clean(anchor.textContent || anchor.ariaLabel || ''),
        link_location,
        page_type,
      });

      // Reaching for the phone or an email client is a different act
      // from following a link, and it is the one this site most wants
      // marked as a key event in GA4. `link_click` above still counts it;
      // this is the name a conversion report can be built on.
      if (link_kind === 'mailto' || link_kind === 'tel') {
        track('contact_click', {
          method: link_kind,
          link_location,
          page_type,
        });
      }

      // A click on a card is also a statement about which of several
      // things on the page the reader chose. GA4 gives `select_item` its
      // own reporting surface, so it is worth the second event.
      const item = itemFromHref(anchor.href, origin);
      if (item) {
        track('select_item', { ...item, link_location, page_type });
      }
    },
    // Capture, so a handler that stops propagation upstream -- the
    // schedule widget does -- cannot silence the measurement.
    true,
  );

  // ── Which sections were actually reached ──
  //
  // Reaching a section is the closest thing a marketing site has to a
  // reader saying "this part interested me", and it is the one signal
  // page-level scroll depth cannot give: 75% of a long page says nothing
  // about which 75%.
  const sections = document.querySelectorAll('section, [data-track-section]');
  if (sections.length && 'IntersectionObserver' in window) {
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          observer.unobserve(entry.target);
          track('content_view', {
            section_name: sectionName(entry.target),
            section_index: Array.prototype.indexOf.call(
              sections,
              entry.target,
            ),
            page_type,
          });
        }
      },
      // Half of it, or half a viewport of it for sections taller than the
      // screen -- otherwise a long section never reaches any threshold.
      { threshold: 0.5, rootMargin: '0px 0px -25% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
  }

  // ── Disclosures opened ──
  // `toggle` does not bubble, so this listens in the capture phase.
  document.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      track('expand_content', {
        content_id: clean(
          details.id ||
            details.querySelector('summary')?.textContent ||
            'untitled',
          60,
        ),
        page_type,
      });
    },
    true,
  );

  // ── The first touch of a form ──
  //
  // Paired with `form_submit`, this is the abandonment rate: how many
  // people started typing and left. A form nobody starts and a form
  // everybody starts and abandons are very different problems, and
  // submissions alone cannot tell them apart.
  const started = new WeakSet<HTMLFormElement>();
  document.addEventListener(
    'focusin',
    (event) => {
      const field = event.target;
      if (
        !(field instanceof HTMLInputElement) &&
        !(field instanceof HTMLTextAreaElement) &&
        !(field instanceof HTMLSelectElement)
      ) {
        return;
      }
      const form = field.form;
      if (!form || started.has(form)) return;
      started.add(form);
      track('form_start', {
        form_id: clean(form.id || form.name || 'unnamed', 60),
        page_type,
      });
    },
    true,
  );
}
