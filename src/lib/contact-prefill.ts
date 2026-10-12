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
  /**
   * Set only for the fit checklist, whose message already carries the
   * visitor's answers, so it may be sent without writing anything more.
   * Absent for every other prefill, which must still be answered. Kept as an
   * optional flag so the shape of the existing prefills does not change.
   */
  answerOptional?: true;
}

/*
 * The estimator on the Sojourn home page sends the two numbers it shows.
 * Plain integers within the slider ranges, matched by regex so "3.5", "3e1"
 * and " 3" are refused rather than coerced; anything else is the plain
 * early-access template with no numbers in it.
 */
const ESTIMATE_PEOPLE_MAX = 30;
const ESTIMATE_HOURS_MAX = 12;

function boundedInteger(value: string | null, max: number): number | null {
  if (value === null || !/^[1-9][0-9]?$/.test(value)) return null;
  const n = Number(value);
  return n <= max ? n : null;
}

function estimateMessage(params: URLSearchParams): string {
  const people = boundedInteger(params.get('people'), ESTIMATE_PEOPLE_MAX);
  const hours = boundedInteger(params.get('hours'), ESTIMATE_HOURS_MAX);
  if (people === null || hours === null) return EARLY_ACCESS;

  const who = people === 1 ? '1 person' : `${people} people`;
  const lost = hours === 1 ? '1 hour' : `${hours} hours`;
  const [heading, ...prompts] = EARLY_ACCESS.split('\n');
  return [heading, `From the Sojourn estimator: ${who}, each losing ${lost} a week.`, ...prompts].join('\n');
}

/*
 * The fit checklist sends one value per question, each from a fixed list.
 * Lookups are own-property only (?edition=constructor must not reach
 * Object.prototype); an unknown value is dropped and its line reads
 * "Not answered".
 */
const NOT_ANSWERED = 'Not answered';

const FIT_EDITION: Record<string, string> = {
  enterprise: 'Enterprise',
  unlimited: 'Unlimited',
  performance: 'Performance',
  developer: 'Developer',
  other: 'Another edition or not sure',
};

// Insertion order is the order the message lists them in.
const FIT_OBJECTS: Record<string, string> = {
  case: 'Case',
  lead: 'Lead',
  opportunity: 'Opportunity',
  custom: 'custom objects',
};

const FIT_YES_NO_UNSURE: Record<string, string> = { yes: 'Yes', no: 'No', unsure: 'Not sure' };

const FIT_VOLUME: Record<string, string> = {
  lt10k: 'Under 10,000',
  '10k-100k': '10,000 to 100,000',
  gt100k: 'Over 100,000',
  unsure: 'Not sure',
};

function label(table: Record<string, string>, value: string | null): string {
  return value !== null && Object.prototype.hasOwnProperty.call(table, value) ? table[value] : NOT_ANSWERED;
}

function fitObjects(value: string | null): string {
  const chosen = new Set((value ?? '').split(','));
  const labels = Object.keys(FIT_OBJECTS)
    .filter((key) => chosen.has(key))
    .map((key) => FIT_OBJECTS[key]);
  return labels.length ? labels.join(', ') : NOT_ANSWERED;
}

function fitMessage(params: URLSearchParams): string {
  return (
    'Sojourn fit checklist.\n' +
    `Salesforce edition: ${label(FIT_EDITION, params.get('edition'))}\n` +
    `Objects to track: ${fitObjects(params.get('objects'))}\n` +
    `Business hours set up: ${label(FIT_YES_NO_UNSURE, params.get('bh'))}\n` +
    `Field history on for those fields: ${label(FIT_YES_NO_UNSURE, params.get('history'))}\n` +
    `Changes per month: ${label(FIT_VOLUME, params.get('volume'))}\n` +
    'Anything else we should know: '
  );
}

/** Null for every visit that did not come from the Sojourn site. */
export function sojournPrefill(search: string): SojournPrefill | null {
  const params = new URLSearchParams(search);
  if (params.get('product') !== 'sojourn') return null;

  const intent = params.get('intent') ?? '';
  if (intent === 'fit') {
    return { message: fitMessage(params), placeholder: SOJOURN_PLACEHOLDER, answerOptional: true };
  }
  if (intent === 'estimate') {
    return { message: estimateMessage(params), placeholder: SOJOURN_PLACEHOLDER };
  }

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
