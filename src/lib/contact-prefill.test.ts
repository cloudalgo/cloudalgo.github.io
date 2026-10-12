import { describe, expect, it } from 'vitest';
import { MESSAGE_MAX_LENGTH, SOJOURN_PLACEHOLDER, isUntouched, sojournPrefill } from './contact-prefill';

const EARLY_ACCESS =
  'Sojourn early access.\nSalesforce edition: \nObjects to track (Case, Lead, Opportunity, custom): \nThe question your director asks that you cannot answer today: ';

describe('sojournPrefill', () => {
  it('returns null for anything but product=sojourn', () => {
    expect(sojournPrefill('')).toBeNull();
    expect(sojournPrefill('?intent=question')).toBeNull();
    expect(sojournPrefill('?product=orgvitals&intent=question')).toBeNull();
    expect(sojournPrefill('?product=Sojourn')).toBeNull();
  });

  it('prefills the early-access template and the Sojourn placeholder', () => {
    expect(sojournPrefill('?product=sojourn&intent=early-access')).toEqual({
      message: EARLY_ACCESS,
      placeholder: SOJOURN_PLACEHOLDER,
    });
  });

  it('maps each intent to its template', () => {
    expect(sojournPrefill('?product=sojourn&intent=question')?.message).toBe('A question about Sojourn: ');
    expect(sojournPrefill('?product=sojourn&intent=services')?.message).toBe('Help setting up Sojourn: ');
    expect(sojournPrefill('?product=sojourn&intent=omni')?.message).toBe('Sojourn Omni-Channel: ');
  });

  it('defaults to early access for a missing or unknown intent', () => {
    expect(sojournPrefill('?product=sojourn')?.message).toBe(EARLY_ACCESS);
    expect(sojournPrefill('?product=sojourn&intent=nope')?.message).toBe(EARLY_ACCESS);
    expect(sojournPrefill('?product=sojourn&intent=constructor')?.message).toBe(EARLY_ACCESS);
  });

  it('survives the utm parameters the Sojourn site appends', () => {
    const search =
      '?product=sojourn&intent=omni&utm_source=sojourn-site&utm_medium=cta&utm_content=hero';
    expect(sojournPrefill(search)?.message).toBe('Sojourn Omni-Channel: ');
  });

  it('keeps every template under the field limit', () => {
    for (const intent of ['early-access', 'question', 'services', 'omni', '']) {
      const message = sojournPrefill(`?product=sojourn&intent=${intent}`)!.message;
      expect(message.length).toBeLessThan(MESSAGE_MAX_LENGTH);
    }
  });
});

describe('isUntouched', () => {
  it('is true for the template as sent, with or without trailing spaces', () => {
    expect(isUntouched(EARLY_ACCESS, EARLY_ACCESS)).toBe(true);
    expect(isUntouched(EARLY_ACCESS.replace(/ $/gm, ''), EARLY_ACCESS)).toBe(true);
    expect(isUntouched('A question about Sojourn: ', 'A question about Sojourn: ')).toBe(true);
  });

  it('is true when prompts are deleted but nothing is written', () => {
    expect(isUntouched('Sojourn early access.\nSalesforce edition:', EARLY_ACCESS)).toBe(true);
    expect(isUntouched('   \n', EARLY_ACCESS)).toBe(true);
  });

  it('is false once any prompt has an answer', () => {
    expect(isUntouched(EARLY_ACCESS.replace('Salesforce edition: ', 'Salesforce edition: Enterprise'), EARLY_ACCESS)).toBe(false);
    expect(isUntouched('A question about Sojourn: does it track queues?', 'A question about Sojourn: ')).toBe(false);
  });

  it('is false for a message written over the template', () => {
    expect(isUntouched('We need time per owner on Case.', EARLY_ACCESS)).toBe(false);
    expect(isUntouched(EARLY_ACCESS + '\nAlso Lead.', EARLY_ACCESS)).toBe(false);
  });
});

const ESTIMATE_4_3 =
  'Sojourn early access.\nFrom the Sojourn estimator: 4 people, each losing 3 hours a week.\nSalesforce edition: \nObjects to track (Case, Lead, Opportunity, custom): \nThe question your director asks that you cannot answer today: ';

const estimate = (people: string, hours: string) =>
  sojournPrefill(`?product=sojourn&intent=estimate&people=${people}&hours=${hours}`)!;

describe('sojournPrefill intent=estimate', () => {
  it('adds the estimator line to the early-access template', () => {
    expect(estimate('4', '3')).toEqual({ message: ESTIMATE_4_3, placeholder: SOJOURN_PLACEHOLDER });
  });

  it('uses the singular forms', () => {
    expect(estimate('1', '1').message).toContain('From the Sojourn estimator: 1 person, each losing 1 hour a week.\n');
    expect(estimate('1', '5').message).toContain('1 person, each losing 5 hours a week.');
    expect(estimate('9', '1').message).toContain('9 people, each losing 1 hour a week.');
  });

  it('accepts the ends of both ranges', () => {
    expect(estimate('30', '12').message).toContain('30 people, each losing 12 hours a week.');
  });

  it('falls back to the plain early-access template for anything else', () => {
    for (const [people, hours] of [
      ['0', '3'], ['31', '3'], ['4', '0'], ['4', '13'], ['3.5', '3'], ['4', '3.5'],
      ['3e1', '3'], ['4', '1e1'], ['-4', '3'], ['+4', '3'], ['%204', '3'], ['04', '3'],
      ['', '3'], ['4', ''], ['four', '3'], ['100', '3'],
    ]) {
      expect(estimate(people, hours).message, `${people}/${hours}`).toBe(EARLY_ACCESS);
    }
    expect(sojournPrefill('?product=sojourn&intent=estimate')?.message).toBe(EARLY_ACCESS);
    expect(sojournPrefill('?product=sojourn&intent=estimate&people=4')?.message).toBe(EARLY_ACCESS);
    expect(sojournPrefill('?product=sojourn&intent=estimate&hours=3')?.message).toBe(EARLY_ACCESS);
  });

  it('still needs an answer, and the estimator line is not one', () => {
    expect(estimate('4', '3').answerOptional).toBeUndefined();
    expect(isUntouched(ESTIMATE_4_3, ESTIMATE_4_3)).toBe(true);
    expect(isUntouched(ESTIMATE_4_3.replace(/ $/gm, ''), ESTIMATE_4_3)).toBe(true);
    expect(isUntouched(ESTIMATE_4_3.replace('Salesforce edition: ', 'Salesforce edition: Enterprise'), ESTIMATE_4_3)).toBe(false);
  });

  it('ignores the estimator numbers on other intents', () => {
    expect(sojournPrefill('?product=sojourn&intent=question&people=4&hours=3')?.message).toBe('A question about Sojourn: ');
  });
});

const FIT_EXAMPLE =
  'Sojourn fit checklist.\nSalesforce edition: Enterprise\nObjects to track: Case, Lead, custom objects\nBusiness hours set up: Yes\nField history on for those fields: Not sure\nChanges per month: 10,000 to 100,000\nAnything else we should know: ';

const fit = (query: string) => sojournPrefill(`?product=sojourn&intent=fit&${query}`)!;
const line = (message: string, name: string) =>
  message.split('\n').find((l) => l.startsWith(name))!.slice(name.length);

describe('sojournPrefill intent=fit', () => {
  it('builds the contract example exactly', () => {
    const result = fit('edition=enterprise&objects=case,lead,custom&bh=yes&history=unsure&volume=10k-100k&utm_source=sojourn-site&utm_medium=cta&utm_content=fit');
    expect(result.message).toBe(FIT_EXAMPLE);
    expect(result.placeholder).toBe(SOJOURN_PLACEHOLDER);
  });

  it('is sendable without a further answer', () => {
    expect(fit('edition=enterprise').answerOptional).toBe(true);
  });

  it('labels every edition', () => {
    const labels = {
      enterprise: 'Enterprise', unlimited: 'Unlimited', performance: 'Performance',
      developer: 'Developer', other: 'Another edition or not sure',
    };
    for (const [value, text] of Object.entries(labels)) {
      expect(line(fit(`edition=${value}`).message, 'Salesforce edition: ')).toBe(text);
    }
  });

  it('labels every yes, no and unsure answer for both questions', () => {
    for (const [param, name] of [['bh', 'Business hours set up: '], ['history', 'Field history on for those fields: ']]) {
      expect(line(fit(`${param}=yes`).message, name)).toBe('Yes');
      expect(line(fit(`${param}=no`).message, name)).toBe('No');
      expect(line(fit(`${param}=unsure`).message, name)).toBe('Not sure');
    }
  });

  it('labels every volume', () => {
    const labels = { lt10k: 'Under 10,000', '10k-100k': '10,000 to 100,000', gt100k: 'Over 100,000', unsure: 'Not sure' };
    for (const [value, text] of Object.entries(labels)) {
      expect(line(fit(`volume=${value}`).message, 'Changes per month: ')).toBe(text);
    }
  });

  it('labels every object and joins them in the fixed order', () => {
    const objects = (value: string) => line(fit(`objects=${value}`).message, 'Objects to track: ');
    expect(objects('case')).toBe('Case');
    expect(objects('lead')).toBe('Lead');
    expect(objects('opportunity')).toBe('Opportunity');
    expect(objects('custom')).toBe('custom objects');
    expect(objects('custom,opportunity,lead,case')).toBe('Case, Lead, Opportunity, custom objects');
  });

  it('deduplicates objects and drops unknown ones', () => {
    const objects = (value: string) => line(fit(`objects=${value}`).message, 'Objects to track: ');
    expect(objects('lead,lead,case,case')).toBe('Case, Lead');
    expect(objects('case,account,,Lead,lead')).toBe('Case, Lead');
    expect(objects('account,contact')).toBe('Not answered');
    expect(objects('')).toBe('Not answered');
  });

  it('shows "Not answered" for missing and unknown values', () => {
    const message = fit('edition=platinum&bh=maybe&history=YES&volume=lots&objects=account').message;
    expect(message).toBe(
      'Sojourn fit checklist.\nSalesforce edition: Not answered\nObjects to track: Not answered\nBusiness hours set up: Not answered\nField history on for those fields: Not answered\nChanges per month: Not answered\nAnything else we should know: ',
    );
    expect(sojournPrefill('?product=sojourn&intent=fit')!.message).toBe(message);
  });

  it('drops values that name Object.prototype members', () => {
    const message = fit('edition=constructor&objects=__proto__,toString,constructor&bh=hasOwnProperty&history=__proto__&volume=valueOf').message;
    expect(message).toBe(fit('').message);
    expect(message).not.toMatch(/function|object Object/);
  });

  it('keeps the longest combination under the field limit', () => {
    const longest = fit(
      'edition=other&objects=case,lead,opportunity,custom&bh=unsure&history=unsure&volume=10k-100k',
    ).message;
    expect(longest.length).toBeLessThan(MESSAGE_MAX_LENGTH);
  });

  it('does not change the other intents', () => {
    expect(sojournPrefill('?product=sojourn&intent=question')!.answerOptional).toBeUndefined();
    expect(sojournPrefill('?product=sojourn')!.answerOptional).toBeUndefined();
  });
});

describe('prototype keys elsewhere', () => {
  it('drops them from the estimate numbers and the intent', () => {
    expect(sojournPrefill('?product=sojourn&intent=estimate&people=constructor&hours=__proto__')?.message).toBe(EARLY_ACCESS);
    expect(sojournPrefill('?product=sojourn&intent=__proto__')?.message).toBe(EARLY_ACCESS);
  });

  it('keeps every estimate message under the field limit', () => {
    expect(estimate('30', '12').message.length).toBeLessThan(MESSAGE_MAX_LENGTH);
  });
});
