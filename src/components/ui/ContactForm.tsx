import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { readHubspotCookie, readFirstTouch, track } from '@/lib/analytics';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const HUBSPOT_PORTAL_ID = '21905808';
const HUBSPOT_FORM_ID = 'bdb87791-63e2-42ac-87b4-a6afa5675e4a';
const HUBSPOT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

/* The four field names below are HubSpot's, not ours -- `firstname` and
   `lastname` are one word on their side. Renaming them silently drops
   the value from the submission, so they are spelled out here rather
   than derived from the form's own keys. */
export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    try {
      const res = await fetch(HUBSPOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { name: 'firstname', value: data.firstName },
            { name: 'lastname', value: data.lastName },
            { name: 'email', value: data.email },
            { name: 'message', value: data.message },
          ],
          context: {
            // HubSpot's own visitor token, handed back so this submission
            // joins the browsing history HubSpot already recorded for this
            // person. Without it every lead arrives as a first-time
            // anonymous visitor, and the pages they read before writing to
            // us are stranded on a contact record nothing links to.
            //
            // Undefined until their script has loaded and set the cookie,
            // which is async on every page. JSON.stringify drops the key
            // in that case, which is what HubSpot wants -- an empty string
            // is rejected as malformed.
            hutk: readHubspotCookie(document.cookie),
            pageUri: window.location.href,
            pageName: document.title,
          },
        }),
      });

      if (res.ok) {
        setStatus('sent');
        reset();
        track('form_submit', {
          event_category: 'Contact',
          event_label: 'HubSpot Contact Form',
        });
        // The campaign that brought them here, which may have been weeks
        // ago and on a different page. GA4's own attribution covers its
        // side; this is the same record that HubSpot cannot see, reported
        // against the conversion it actually produced. No value: the site
        // publishes no rate.
        track('generate_lead', {
          method: 'contact_form',
          ...(readFirstTouch() ?? {}),
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  /* The sent state answers the question the reader now has -- when does
     somebody reply, and who -- rather than thanking them for the
     message they can see they just sent. */
  if (status === 'sent') {
    return (
      <div className="ca-form__sent" role="status" aria-live="polite">
        <h2>It has landed.</h2>
        <p>
          Sandeep and Vikash have it. One of them replies in writing within one
          working day, from sales@cloudalgo.com &mdash; worth checking a spam folder
          if it has not arrived by then.
        </p>
      </div>
    );
  }

  return (
    <form className="ca-form" method="post" id="contactForm" name="contactForm"
      noValidate onSubmit={handleSubmit(onSubmit)}>

      <div className="ca-form__pair">
        <div className="ca-field">
          <label className="ca-field__label" htmlFor="cf-first-name">First name</label>
          <input
            id="cf-first-name"
            type="text"
            className="ca-field__input"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? 'cf-first-name-error' : undefined}
            {...register('firstName', { required: 'First name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.firstName && (
            <span className="error-line" id="cf-first-name-error" role="alert">{errors.firstName.message}</span>
          )}
        </div>

        <div className="ca-field">
          <label className="ca-field__label" htmlFor="cf-last-name">Last name</label>
          <input
            id="cf-last-name"
            type="text"
            className="ca-field__input"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? 'cf-last-name-error' : undefined}
            {...register('lastName', { required: 'Last name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.lastName && (
            <span className="error-line" id="cf-last-name-error" role="alert">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      <div className="ca-field">
        <label className="ca-field__label" htmlFor="cf-email">Work email</label>
        <input
          id="cf-email"
          type="email"
          className="ca-field__input"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'cf-email-error' : undefined}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
            maxLength: { value: 100, message: 'Max 100 characters' },
          })} />
        {errors.email && (
          <span className="error-line" id="cf-email-error" role="alert">{errors.email.message}</span>
        )}
      </div>

      <div className="ca-field">
        <span className="ca-field__row">
          <label className="ca-field__label" htmlFor="cf-message">What you want to change</label>
          <span className="ca-field__hint">The more specific, the shorter the call</span>
        </span>
        <textarea
          id="cf-message"
          className="ca-field__input ca-field__input--area"
          rows={7}
          autoComplete="off"
          placeholder="Every order gets typed into NetSuite twice. Two people, most of a morning, every day."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'cf-message-error' : undefined}
          {...register('message', { required: 'Message is required', maxLength: { value: 500, message: 'Max 500 characters' } })} />
        {errors.message && (
          <span className="error-line" id="cf-message-error" role="alert">{errors.message.message}</span>
        )}
      </div>

      {status === 'error' && (
        <p className="error-line" role="alert">
          That did not send. Write to{' '}
          <a href="mailto:sales@cloudalgo.com">sales@cloudalgo.com</a> and it reaches
          the same two people.
        </p>
      )}

      <div className="ca-form__foot">
        <button type="submit" className="btn btn-secondary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Get an answer'}
          {status === 'sending' ? null : <span aria-hidden="true"> &rarr;</span>}
        </button>
        <p className="ca-form__note">
          No mailing list, no sequence, no chatbot &mdash; just a reply.{' '}
          <a href="/page/privacy-policy/">What we do with it</a>.
        </p>
      </div>
    </form>
  );
}
