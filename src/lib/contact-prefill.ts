/*
 * What the contact form starts with when a visitor arrives from the Sojourn
 * site. Its buttons link to /contact/?product=sojourn&intent=<...>, and the
 * page URL already travels to HubSpot as `pageUri`, so the context needs no
 * field of its own -- an unknown field is rejected by the form definition.
 *
 * Kept out of ContactForm.tsx so the wording and the 500-character limit can
 * be tested without rendering the island.
 */

export const MESSAGE_MAX_LENGTH = 500;

export const SOJOURN_PLACEHOLDER =
  'Case, Lead, and a custom object. Status and owner. Enterprise Edition.';

const EARLY_ACCESS =
  'Sojourn early access.\n' +
  'Salesforce edition: \n' +
  'Objects to track (Case, Lead, Opportunity, custom): \n' +
  'The question your director asks that you cannot answer today: ';

const BY_INTENT: Record<string, string> = {
  'early-access': EARLY_ACCESS,
  question: 'A question about Sojourn: ',
  services: 'Help setting up Sojourn: ',
  omni: 'Sojourn Omni-Channel: ',
};

export interface SojournPrefill {
  message: string;
  placeholder: string;
}

/** Null for every visit that did not come from the Sojourn site. */
export function sojournPrefill(search: string): SojournPrefill | null {
  const params = new URLSearchParams(search);
  if (params.get('product') !== 'sojourn') return null;

  const intent = params.get('intent') ?? '';
  // Own-property check: ?intent=constructor must not reach Object.prototype.
  const message = Object.prototype.hasOwnProperty.call(BY_INTENT, intent)
    ? BY_INTENT[intent]
    : EARLY_ACCESS;

  return { message, placeholder: SOJOURN_PLACEHOLDER };
}

export const UNTOUCHED_MESSAGE = 'Add your answers after the prompts before sending.';

/*
 * True when the message holds nothing beyond the prompts it was prefilled
 * with: sent as-is, or with prompts deleted but nothing written. Each line
 * that starts with a prompt counts only for what follows the prompt, so an
 * answer on any one line is enough.
 */
export function isUntouched(message: string, template: string): boolean {
  const prompts = template
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return message.split('\n').every((raw) => {
    const line = raw.trim();
    const prompt = prompts.find((p) => line.startsWith(p));
    return (prompt ? line.slice(prompt.length) : line).trim() === '';
  });
}
