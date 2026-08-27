import { describe, it, expect, afterEach } from 'vitest';
import { track, readHubspotCookie } from './analytics';

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window;
});

const withGtag = (fn: (calls: unknown[][]) => void) => {
  const calls: unknown[][] = [];
  (globalThis as Record<string, unknown>).window = {
    gtag: (...args: unknown[]) => { calls.push(args); },
  };
  fn(calls);
};

describe('track', () => {
  it('forwards the event and params to gtag', () => {
    withGtag(calls => {
      track('generate_lead', { method: 'schedule_widget' });
      expect(calls).toEqual([['event', 'generate_lead', { method: 'schedule_widget' }]]);
    });
  });

  it('defaults params to an empty object', () => {
    withGtag(calls => {
      track('cta_click');
      expect(calls[0]).toEqual(['event', 'cta_click', {}]);
    });
  });

  it('is a no-op when gtag is absent, rather than throwing', () => {
    (globalThis as Record<string, unknown>).window = {};
    expect(() => track('form_submit')).not.toThrow();
  });

  it('is a no-op when there is no window at all (SSG build)', () => {
    expect(() => track('form_submit')).not.toThrow();
  });
});

describe('readHubspotCookie', () => {
  it('extracts hubspotutk from a cookie string', () => {
    expect(readHubspotCookie('foo=1; hubspotutk=abc123def; bar=2'))
      .toBe('abc123def');
  });

  it('finds it when it is the only cookie', () => {
    expect(readHubspotCookie('hubspotutk=solo')).toBe('solo');
  });

  it('returns undefined when absent', () => {
    expect(readHubspotCookie('foo=1; bar=2')).toBeUndefined();
  });

  it('returns undefined for an empty cookie string', () => {
    expect(readHubspotCookie('')).toBeUndefined();
  });

  it('does not match a cookie merely ending in hubspotutk', () => {
    expect(readHubspotCookie('not_hubspotutk=wrong')).toBeUndefined();
  });
});
