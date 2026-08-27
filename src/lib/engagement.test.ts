/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import {
  clean,
  classifyLink,
  itemFromHref,
  pageType,
  sectionName,
  linkLocation,
} from './engagement';

const ORIGIN = 'https://cloudalgo.com';

describe('clean', () => {
  it('collapses whitespace and trims', () => {
    expect(clean('  Book   a\n  call ')).toBe('Book a call');
  });

  it('truncates to the GA4 parameter limit', () => {
    expect(clean('x'.repeat(250)).length).toBe(100);
  });

  it('backs up to a word boundary rather than cutting mid-word', () => {
    const headline = 'Most orgs do not need more Salesforce. They need less of the wrong kind.';
    expect(clean(headline, 60)).toBe('Most orgs do not need more Salesforce. They need less of');
  });

  it('cuts hard when the last word is longer than the tail allowance', () => {
    // One space, early: backing up to it would lose three quarters of the
    // value, so the hard cut is the better answer.
    expect(clean(`ab ${'x'.repeat(60)}`, 20)).toBe('ab xxxxxxxxxxxxxxxxx');
  });

  it('honours a custom limit', () => {
    expect(clean('abcdef', 3)).toBe('abc');
  });
});

describe('classifyLink', () => {
  it('recognises mailto and tel before anything else', () => {
    expect(classifyLink('mailto:hello@cloudalgo.com', ORIGIN)).toBe('mailto');
    expect(classifyLink('tel:+911234567890', ORIGIN)).toBe('tel');
  });

  it('calls a different origin outbound', () => {
    expect(classifyLink('https://salesforce.com/x', ORIGIN)).toBe('outbound');
  });

  it('calls a same-origin page internal', () => {
    expect(classifyLink(`${ORIGIN}/services/`, ORIGIN, '/')).toBe('internal');
  });

  it('calls a hash on the current page an anchor', () => {
    expect(classifyLink(`${ORIGIN}/about/#team`, ORIGIN, '/about/')).toBe('anchor');
  });

  it('calls the same hash link from another page internal navigation', () => {
    expect(classifyLink(`${ORIGIN}/about/#team`, ORIGIN, '/')).toBe('internal');
  });

  it('recognises a file download by extension', () => {
    expect(classifyLink(`${ORIGIN}/files/brief.pdf`, ORIGIN, '/')).toBe('download');
  });

  it('does not mistake an origin PREFIX for the same site', () => {
    // startsWith(origin) would call this internal and report a lookalike
    // domain's traffic as our own.
    expect(classifyLink('https://cloudalgo.com.evil.test/', ORIGIN)).toBe('outbound');
  });

  it('treats a different scheme on the same host as outbound', () => {
    expect(classifyLink('http://cloudalgo.com/services/', ORIGIN)).toBe('outbound');
  });

  it('calls an unparseable href outbound rather than throwing', () => {
    expect(classifyLink('::not a url::', ORIGIN)).toBe('outbound');
  });
});

describe('itemFromHref', () => {
  it('identifies a service', () => {
    expect(itemFromHref(`${ORIGIN}/services/heroku-migration/`, ORIGIN)).toEqual({
      item_category: 'service',
      item_id: 'heroku-migration',
    });
  });

  it('identifies a case study, whose segment differs from its category', () => {
    expect(itemFromHref(`${ORIGIN}/case-studies/acme/`, ORIGIN)).toEqual({
      item_category: 'case_study',
      item_id: 'acme',
    });
  });

  it('returns null for an index page', () => {
    expect(itemFromHref(`${ORIGIN}/services/`, ORIGIN)).toBeNull();
  });

  it('returns null for an unknown section', () => {
    expect(itemFromHref(`${ORIGIN}/page/privacy-policy/`, ORIGIN)).toBeNull();
  });

  it('returns null for an outbound link', () => {
    expect(itemFromHref('https://elsewhere.test/services/x/', ORIGIN)).toBeNull();
  });

  it('returns null for a lookalike domain that merely shares the prefix', () => {
    expect(itemFromHref('https://cloudalgo.com.evil.test/services/x/', ORIGIN)).toBeNull();
  });

  it('ignores a query string and hash when reading the slug', () => {
    expect(itemFromHref(`${ORIGIN}/blog/why-heroku/?utm_source=x#top`, ORIGIN)).toEqual({
      item_category: 'blog_post',
      item_id: 'why-heroku',
    });
  });
});

describe('pageType', () => {
  it('names the home page', () => {
    expect(pageType('/')).toBe('home');
  });

  it('distinguishes an index from a detail page', () => {
    expect(pageType('/services/')).toBe('services_index');
    expect(pageType('/services/heroku-migration/')).toBe('services_detail');
  });

  it('names a standalone page by its first segment', () => {
    expect(pageType('/contact/')).toBe('contact');
  });
});

describe('sectionName', () => {
  const parse = (html: string): Element => {
    document.body.innerHTML = html;
    return document.querySelector('section')!;
  };

  it('prefers the heading named by aria-labelledby', () => {
    const el = parse(
      '<section aria-labelledby="h"><h2 id="h">Case studies</h2></section>',
    );
    expect(sectionName(el)).toBe('Case studies');
  });

  it('falls back to aria-label', () => {
    expect(sectionName(parse('<section aria-label="By the numbers"></section>')))
      .toBe('By the numbers');
  });

  it('falls back to the id, then to a meaningful class', () => {
    expect(sectionName(parse('<section id="pricing"></section>'))).toBe('pricing');
    expect(sectionName(parse('<section class="hero-press"></section>')))
      .toBe('hero-press');
  });

  it('ignores Astro scope classes when choosing a class name', () => {
    expect(sectionName(parse('<section class="astro-abc123 proof-strip"></section>')))
      .toBe('proof-strip');
  });

  it('says so when a section names itself in no way at all', () => {
    expect(sectionName(parse('<section></section>'))).toBe('unnamed');
  });
});

describe('linkLocation', () => {
  const anchorIn = (html: string): Element => {
    document.body.innerHTML = html;
    return document.querySelector('a')!;
  };

  it('names the masthead and the colophon', () => {
    expect(linkLocation(anchorIn('<header><a href="/">x</a></header>'))).toBe('header');
    expect(linkLocation(anchorIn('<footer><a href="/">x</a></footer>'))).toBe('footer');
  });

  it('prefers an explicit data-track-location over anything inferred', () => {
    expect(
      linkLocation(
        anchorIn('<header data-track-location="mobile-menu"><a href="/">x</a></header>'),
      ),
    ).toBe('mobile-menu');
  });

  it('falls back to the enclosing section name', () => {
    expect(
      linkLocation(anchorIn('<section aria-label="Journal"><a href="/">x</a></section>')),
    ).toBe('Journal');
  });

  it('falls back to body when a link sits in no landmark at all', () => {
    expect(linkLocation(anchorIn('<div><a href="/">x</a></div>'))).toBe('body');
  });
});
