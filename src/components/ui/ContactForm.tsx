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
      <div className="text-center" style={{ padding: '4rem 0' }}>
        <h4>Thank you for reaching out to CloudAlgo!</h4>
        <p>We've received your message and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="mb-5" method="post" id="contactForm" name="contactForm"
      noValidate onSubmit={handleSubmit(onSubmit)}>

      <div className="row">
        <div className="col-md-12 form-group">
          <input type="text" className="form-control" placeholder="Your first name"
            {...register('firstName', { required: 'First name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.firstName && <span className="error-line">{errors.firstName.message}</span>}
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <input type="text" className="form-control" placeholder="Your last name"
            {...register('lastName', { required: 'Last name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
          {errors.lastName && <span className="error-line">{errors.lastName.message}</span>}
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <input type="email" className="form-control" placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              maxLength: { value: 100, message: 'Max 100 characters' },
            })} />
          {errors.email && <span className="error-line">{errors.email.message}</span>}
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12 form-group">
          <textarea className="form-control" rows={7} placeholder="Write your message"
            {...register('message', { required: 'Message is required', maxLength: { value: 500, message: 'Max 500 characters' } })} />
          {errors.message && <span className="error-line">{errors.message.message}</span>}
        </div>
      </div>

      {status === 'error' && (
        <p className="error-line" style={{ marginTop: '0.5rem' }}>
          Something went wrong. Please email us at contact@cloudalgo.com
        </p>
      )}

      <div className="row mt-5">
        <div className="col-12">
          <button type="submit" className="btn btn-secondary py-2 px-4"
            disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
            <span className="icon-arrow_forward"></span>
          </button>
        </div>
      </div>
    </form>
  );
}
