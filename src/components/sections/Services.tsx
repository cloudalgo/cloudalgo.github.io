import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactElement, SVGProps } from 'react';

function IconConsulting(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 16C10 13.1 11.6 10.6 14 9.3M22 16C22 18.9 20.4 21.4 18 22.7M6 20C4.3 18.5 3 16.4 3 14C3 9.6 6.6 6 11 6C12.2 6 13.3 6.3 14.3 6.8M26 12C27.7 13.5 29 15.6 29 18C29 22.4 25.4 26 21 26C19.8 26 18.7 25.7 17.7 25.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconProduct(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconSupport(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 3L28 9V16C28 22.6 22.7 28.7 16 30C9.3 28.7 4 22.6 4 16V9L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 16L14 19L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Service {
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  title: string;
  body: string;
  href: string;
}

const services: Service[] = [
  {
    Icon: IconConsulting,
    title: 'Salesforce Consulting',
    body: 'CRM customization, Salesforce Communities, Force.com App Development, MuleSoft integrations, and Heroku solutions.',
    href: '/services/salesforce-consulting',
  },
  {
    Icon: IconProduct,
    title: 'Product Development',
    body: 'AppExchange product development with 1GP and 2GP managed packages, security review readiness, and ISV strategy.',
    href: '/services/product-development',
  },
  {
    Icon: IconSupport,
    title: 'Support & Managed Services',
    body: 'Ongoing support, maintenance, enhancements, org health reviews, and security recommendations for your Salesforce environment.',
    href: '/services/support-and-managed-services',
  },
];

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Ports Services.astro's `transition-delay: 0.05s` on the h2. The delay must live inside the
// variant's own transition — a `transition` prop on the element is ignored whenever the
// target variant defines one (framer-motion 13 behavior).
const headingDelayedVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.05 } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#F5F5F2', padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.09" style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.05, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.17" style={{ position: 'absolute', bottom: 40, left: '5%', width: 9, height: 9, borderRadius: '50%', background: '#0A0A0A', opacity: 0.1, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.12" style={{ position: 'absolute', top: '35%', right: '9%', width: 6, height: 6, borderRadius: '50%', background: '#0A0A0A', opacity: 0.07, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <motion.p
          className="section-label"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
        >
          What we do
        </motion.p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <motion.h2
            initial={reduceMotion ? undefined : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.4 }}
            variants={headingDelayedVariants}
            style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, maxWidth: 500 }}
          >
            Expert services,<br />end to end.
          </motion.h2>
          <p style={{ maxWidth: 380, color: '#5A5A5A', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
            Specialized Salesforce and Heroku consulting for teams that want clean, scalable implementations.
          </p>
        </div>

        <motion.div
          className="row"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {services.map(({ Icon, title, body, href }) => (
            <div key={title} className="col-lg-4 col-md-4" style={{ marginBottom: '1.5rem', display: 'flex' }}>
              <motion.div className="card-bg" variants={cardVariants}>
                <motion.div className="card-icon" whileHover={reduceMotion ? undefined : { scale: 1.08 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                  <Icon />
                </motion.div>
                <h3 className="card-text" style={{ fontSize: '1.25rem' }}>{title}</h3>
                <p>{body}</p>
                <a href={href} className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
                  Learn more &rarr;
                </a>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
