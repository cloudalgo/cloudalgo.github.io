/**
 * The HubSpot endpoints the site posts to, stated once.
 *
 * Two forms, one portal. They were one constant at the top of
 * ContactForm.tsx until a second form needed the same portal id, and a
 * portal id typed in two files is a portal id that goes wrong in one of
 * them.
 *
 * `SUBSCRIBE` is empty until somebody creates the form in HubSpot. That
 * is deliberate: SubscribeBlock renders nothing while it is empty, so a
 * form that posts into the void never reaches a page. Fill it in and the
 * block appears, with no other change.
 */

export const HUBSPOT_PORTAL_ID = '21905808';

/** /contact/ — a message that gets a written reply, and no mailing list.
    The note under that form says so, and it has to stay true. */
export const HUBSPOT_CONTACT_FORM_ID = 'bdb87791-63e2-42ac-87b4-a6afa5675e4a';

/** The journal list. Empty until the form exists in HubSpot. */
export const HUBSPOT_SUBSCRIBE_FORM_ID = '';

export const hubspotEndpoint = (formId: string): string =>
  `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${formId}`;
