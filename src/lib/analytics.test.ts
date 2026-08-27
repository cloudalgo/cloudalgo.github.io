import { describe, it, expect, afterEach } from 'vitest';
import { track, readHubspotCookie, buildFirstTouch, readFirstTouch, captureFirstTouch, FIRST_TOUCH_KEY } from './analytics';

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

class FakeStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

const withStorage = (fn: (s: { local: FakeStorage }) => void) => {
  const local = new FakeStorage();
  (globalThis as Record<string, unknown>).window = {
    localStorage: local,
    location: new URL('https://cloudalgo.com/services/?utm_source=linkedin&utm_medium=social'),
    document: { referrer: 'https://www.linkedin.com/' },
  };
  fn({ local });
};

describe('buildFirstTouch', () => {
  const now = new Date('2026-08-27T10:00:00.000Z');

  it('captures utm params, referrer and landing path', () => {
    const url = new URL('https://cloudalgo.com/services/?utm_source=linkedin&utm_medium=social&utm_campaign=q3');
    expect(buildFirstTouch(url, 'https://www.linkedin.com/', now)).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'q3',
      referrer: 'https://www.linkedin.com/',
      landing_page: '/services/',
      ts: '2026-08-27T10:00:00.000Z',
    });
  });

  it('omits utm keys that are absent rather than writing empty strings', () => {
    const url = new URL('https://cloudalgo.com/?utm_source=google');
    const ft = buildFirstTouch(url, '', now);
    expect(ft.utm_source).toBe('google');
    expect('utm_medium' in ft).toBe(false);
    expect('referrer' in ft).toBe(false);
  });

  it('records a direct visit with no utm and no referrer', () => {
    expect(buildFirstTouch(new URL('https://cloudalgo.com/about/'), '', now)).toEqual({
      landing_page: '/about/',
      ts: '2026-08-27T10:00:00.000Z',
    });
  });
});

describe('first-touch storage', () => {
  afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

  it('captures the landing visit into localStorage', () => {
    withStorage(({ local }) => {
      captureFirstTouch();
      const stored = JSON.parse(local.getItem(FIRST_TOUCH_KEY)!);
      expect(stored.utm_source).toBe('linkedin');
      expect(stored.landing_page).toBe('/services/');
    });
  });

  it('does not overwrite an existing record \u2014 it is FIRST touch', () => {
    withStorage(({ local }) => {
      local.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/original/', ts: 'x' }));
      captureFirstTouch();
      expect(JSON.parse(local.getItem(FIRST_TOUCH_KEY)!).landing_page).toBe('/original/');
    });
  });

  it('keeps a record written on an earlier visit, days later', () => {
    withStorage(({ local }) => {
      local.setItem(FIRST_TOUCH_KEY, JSON.stringify({ landing_page: '/from-last-week/', ts: 'x' }));
      captureFirstTouch();
      expect(readFirstTouch()?.landing_page).toBe('/from-last-week/');
    });
  });

  it('reads back what capture wrote', () => {
    withStorage(({ local }) => {
      captureFirstTouch();
      expect(readFirstTouch()).toEqual(JSON.parse(local.getItem(FIRST_TOUCH_KEY)!));
    });
  });

  it('returns null on unparseable stored JSON rather than throwing', () => {
    withStorage(({ local }) => {
      local.setItem(FIRST_TOUCH_KEY, 'not json');
      expect(readFirstTouch()).toBeNull();
    });
  });

  it('survives storage being unavailable entirely', () => {
    (globalThis as Record<string, unknown>).window = {
      get localStorage(): never { throw new Error('blocked'); },
      location: new URL('https://cloudalgo.com/'),
      document: { referrer: '' },
    };
    expect(() => captureFirstTouch()).not.toThrow();
    expect(readFirstTouch()).toBeNull();
  });
});
