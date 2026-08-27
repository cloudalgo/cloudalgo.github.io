// src/lib/analytics.ts
//
// Every analytics event the site sends, named once.
//
// Before this module the three call sites reached for `window.gtag`
// directly with stringly-typed event names. A typo in one of those is not
// an error -- it is an event that lands in GA4 under a name nobody is
// looking at, which is indistinguishable from the visit never happening.
// The union below makes that typo a build failure instead.

/** The complete set of events this site sends. */
export type AnalyticsEvent =
  | 'generate_lead'
  | 'form_submit'
  | 'contact_click'
  | 'page_not_found'
  | 'scroll_depth'
  | 'outbound_click'
  | 'cta_click';

type Gtag = (...args: unknown[]) => void;

/** `gtag` exists from the document head under Consent Mode (see
 *  ConsentBootstrap.astro), but this module is also imported into React
 *  components that Astro renders during the static build, where there is
 *  no window at all. Both absences are normal and neither may throw. */
const gtag = (): Gtag | undefined =>
  typeof window === 'undefined'
    ? undefined
    : (window as unknown as { gtag?: Gtag }).gtag;

export function track(
  event: AnalyticsEvent,
  params: Record<string, unknown> = {},
): void {
  gtag()?.('event', event, params);
}

/**
 * HubSpot's visitor token, read from a cookie string.
 *
 * HubSpot sets this cookie as `hubspotutk` and expects it back in a form
 * submission as `hutk`. The two names are theirs, they differ, and
 * "unifying" them silently de-attributes every lead -- which is the bug
 * this function exists to fix.
 *
 * Absent when the visitor declined consent, since the HubSpot script only
 * loads on accept. That is correct, and callers must treat it as normal.
 */
export function readHubspotCookie(cookieString: string): string | undefined {
  const match = cookieString.match(/(?:^|;\s*)hubspotutk=([^;]*)/);
  return match ? match[1] : undefined;
}

// ── First-touch attribution ────────────────────────────────
//
// A reader arrives on a campaign link, reads for a week, and books on a
// Thursday. GA4's own attribution covers that; HubSpot's does not, because
// the booking arrives at a different endpoint from a different component.
// This is the record that travels with the lead.
//
// It lives in localStorage, so it survives the days between the campaign
// click and the booking -- which is the only span over which it is worth
// anything. There is no consent gate in front of it: the notice informs
// rather than asks, so there is no second storage tier and no promotion
// step. The record is written once and never overwritten; "first touch"
// means the first one, not the most recent.

export const FIRST_TOUCH_KEY = 'ca_first_touch';

export interface FirstTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page: string;
  ts: string;
}

const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
] as const;

/** Pure: build the record from a URL and referrer. Absent values are
 *  omitted rather than stored empty, so a direct visit is a two-key
 *  record instead of five empty strings pretending to be a campaign. */
export function buildFirstTouch(url: URL, referrer: string, now: Date): FirstTouch {
  const record: FirstTouch = {
    landing_page: url.pathname,
    ts: now.toISOString(),
  };
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) record[key] = value;
  }
  if (referrer) record.referrer = referrer;
  return record;
}

/** Storage access throws outright in some privacy modes, rather than
 *  returning null. Every caller here treats that as "no attribution",
 *  which is a worse answer than the truth but a better one than a
 *  broken page. */
function store(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readFirstTouch(): FirstTouch | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

/** Call once per page load. Does nothing if a record already exists. */
export function captureFirstTouch(): void {
  if (typeof window === 'undefined') return;
  if (readFirstTouch()) return;
  const s = store();
  if (!s) return;
  try {
    const url = new URL(String(window.location));
    const record = buildFirstTouch(url, window.document?.referrer ?? '', new Date());
    s.setItem(FIRST_TOUCH_KEY, JSON.stringify(record));
  } catch {
    // A visit we cannot attribute is still a visit. Never break the page.
  }
}
