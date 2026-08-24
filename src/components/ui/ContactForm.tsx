import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const HUBSPOT_PORTAL_ID = '21905808';
const HUBSPOT_FORM_ID = 'bdb87791-63e2-42ac-87b4-a6afa5675e4a';
const HUBSPOT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

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
            pageUri: 'cloudalgo.com/contact',
            pageName: 'CloudAlgo Contact Form',
          },
        }),
      });

      if (res.ok) {
        setStatus('sent');
        reset();
        // GA4 event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submit', {
            event_category: 'Contact',
            event_label: 'HubSpot Contact Form',
          });
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center" style={{ padding: '4rem 0' }} role="status" aria-live="polite">
        <h2 style={{ fontSize: '1.5rem' }}>Thank you for reaching out to CloudAlgo!</h2>
        <p>We&rsquo;ve received your message and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="mb-5" method="post" id="contactForm" name="contactForm"
      noValidate onSubmit={handleSubmit(onSubmit)}>

      <div className="row">
        <div className="col-md-12 form-group">
          <label className="form-label" htmlFor="cf-first-name">First name</label>
          <input
            id="cf-first-name"
            type="text"
            className="form-control"
            autoComplete="given-name"
            placeholder="Jane"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? 'cf-first-name-error' : undefined}
            {...register('firstName', { required: 'First name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.firstName && (
            <span className="error-line" id="cf-first-name-error" role="alert">{errors.firstName.message}</span>
          )}
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <label className="form-label" htmlFor="cf-last-name">Last name</label>
          <input
            id="cf-last-name"
            type="text"
            className="form-control"
            autoComplete="family-name"
            placeholder="Doe"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? 'cf-last-name-error' : undefined}
            {...register('lastName', { required: 'Last name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.lastName && (
            <span className="error-line" id="cf-last-name-error" role="alert">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <label className="form-label" htmlFor="cf-email">Work email</label>
          <input
            id="cf-email"
            type="email"
            className="form-control"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            autoCapitalize="none"
            placeholder="jane@company.com"
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
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <label className="form-label" htmlFor="cf-message">How can we help?</label>
          <textarea
            id="cf-message"
            className="form-control"
            rows={7}
            autoComplete="off"
            placeholder="Tell us about your project&hellip;"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? 'cf-message-error' : undefined}
            {...register('message', { required: 'Message is required', maxLength: { value: 500, message: 'Max 500 characters' } })} />
          {errors.message && (
            <span className="error-line" id="cf-message-error" role="alert">{errors.message.message}</span>
          )}
        </div>
      </div>

      {status === 'error' && (
        <p className="error-line" style={{ marginTop: '0.5rem' }} role="alert">
          Something went wrong. Please email us at{' '}
          <a href="mailto:sales@cloudalgo.com">sales@cloudalgo.com</a>
        </p>
      )}

      <div className="row mt-5">
        <div className="col-12">
          <button type="submit" className="btn btn-secondary py-2 px-4"
            disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send My Project Details'}
            <span className="icon-arrow_forward" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </form>
  );
}
