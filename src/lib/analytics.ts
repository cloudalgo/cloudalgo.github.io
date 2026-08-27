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
