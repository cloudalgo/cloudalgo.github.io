// src/components/ui/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { setStatus('sent'); reset(); }
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  const inputCls = 'w-full bg-[#1a1a1a] border border-[#333] text-white text-[14px] font-medium px-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-[#555]';
  const errorCls = 'text-primary text-[11px] font-semibold mt-1';

  if (status === 'sent') {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-display font-extrabold text-white text-[22px] mb-2">Message sent!</h3>
        <p className="text-[#64748b]">We'll get back to you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input {...register('name', { required: 'Name is required' })}
            placeholder="Your name" className={inputCls} />
          {errors.name && <p className={errorCls}>{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
          })}
            placeholder="your@email.com" type="email" className={inputCls} />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <input {...register('company')}
          placeholder="Company (optional)" className={inputCls} />
      </div>
      <div>
        <textarea {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'At least 20 characters' } })}
          placeholder="Tell us about your Salesforce goals..."
          rows={5} className={`${inputCls} resize-none`} />
        {errors.message && <p className={errorCls}>{errors.message.message}</p>}
      </div>
      {status === 'error' && (
        <p className="text-primary text-[13px] font-semibold">Something went wrong. Please email us at contact@cloudalgo.com</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-primary hover:bg-[#d94e37] disabled:opacity-60 text-white font-extrabold text-[14px] py-3.5 rounded-lg transition-colors duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(247,90,65,0.3)]"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  );
}
