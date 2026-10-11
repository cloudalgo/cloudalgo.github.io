import { describe, expect, it } from 'vitest';
import { MESSAGE_MAX_LENGTH, SOJOURN_PLACEHOLDER, sojournPrefill } from './contact-prefill';

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
