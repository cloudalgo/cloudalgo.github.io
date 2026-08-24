import { motion, useReducedMotion, type Variants } from 'framer-motion';

interface WhyUsItem {
  number: string;
  title: string;
  body: string;
}

const items: WhyUsItem[] = [
  {
    number: '01',
    title: 'Certified Expertise',
    body: 'Our architects hold active Salesforce certifications across Admin, Developer, and Architect tracks.',
  },
  {
    number: '02',
    title: 'On-Time Delivery',
    body: 'We scope tightly and ship on schedule. No surprise delays, no scope creep.',
  },
  {
    number: '03',
    title: 'Clean Architecture',
    body: "No over-engineered orgs. We build for maintainability and your team's long-term ownership.",
  },
  {
    number: '04',
    title: 'Cost-Effective',
    body: 'Transparent pricing, no surprise invoices. Flexible retainer or project-based engagements.',
  },
];

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function WhyUs() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      style={{
        background: '#fff',
        padding: '6rem 0',
        borderTop: '1px solid #E0E0DC',
        borderBottom: '1px solid #E0E0DC',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div data-parallax="0.07" style={{ position: 'absolute', bottom: -90, right: -70, width: 280, height: 280, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.19" style={{ position: 'absolute', top: '20%', left: '7%', width: 8, height: 8, borderRadius: '50%', background: '#0A0A0A', opacity: 0.09, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.13" style={{ position: 'absolute', bottom: '20%', right: '14%', width: 6, height: 6, borderRadius: '50%', background: '#0A0A0A', opacity: 0.06, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="row align-items-center" style={{ gap: '3rem 0' }}>
          <div className="col-lg-4">
            <motion.p
              className="section-label"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
            >
              Why choose us
            </motion.p>
            <motion.h2
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
              transition={{ delay: 0.05 }}
              style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}
            >
              Why teams choose CloudAlgo
            </motion.h2>
            <p style={{ color: '#5A5A5A', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340 }}>
              We've helped 15+ companies get more from their Salesforce investment — without the bloat.
            </p>
            <a href="/about" className="btn btn-outline" style={{ marginTop: '2rem', fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
              About us &rarr;
            </a>
          </div>

          <div className="col-lg-8">
            <motion.div
              className="why-us-grid"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.3 }}
              variants={gridVariants}
            >
              {items.map((item) => (
                <motion.div key={item.number} className="why-card" variants={cardVariants}>
                  <div className="why-card-number">{item.number}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
