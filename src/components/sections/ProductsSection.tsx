import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { HomeProductCard } from '@/types/homepage';

interface Props {
  products: HomeProductCard[];
}

// Small icon SVGs for dark variant cards — transcribed verbatim from
// src/components/ui/ProductCard.astro's `productIcons` map (the binding
// content authority for this port).
const productIcons: Record<string, string> = {
  'algobridge': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="4" width="8" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="4" width="8" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9 L14.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 7.5 L14.5 9 L13 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 15 L9.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 13.5 L9.5 15 L11 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'sf-sync-connector': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="7" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="7" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 10 L14.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 8.5 L14.5 10 L13 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 14 L9.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 12.5 L9.5 14 L11 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'insurealgo': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="1" width="14" height="22" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M9 5 L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 9 L12 9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 13 L12 15 L15 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  'pledgivo': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C12 21 3 14.5 3 8.5C3 6 5 4 7.5 4C9.24 4 10.75 4.96 11.56 6.35C11.75 6.67 12.25 6.67 12.44 6.35C13.25 4.96 14.76 4 16.5 4C19 4 21 6 21 8.5C21 14.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 11 L10.5 13.5 L16 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'orgvitals': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="16" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 7 L22 7" stroke="currentColor" stroke-width="1.5"/><circle cx="4.6" cy="5" r="0.7" fill="currentColor"/><circle cx="6.8" cy="5" r="0.7" fill="currentColor"/><path d="M5 13 L8.5 13 L10.5 10 L13 16 L15 13 L19 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 22 L15.5 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function statusLabel(status: HomeProductCard['status']): string {
  if (status === 'ga') return 'Generally Available';
  if (status === 'preview') return 'Preview';
  return 'Beta';
}

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Ports ProductsSection.astro's `transition-delay: 0.05s` on the h2. The delay
// must live inside the variant's own transition — a `transition` prop on the
// element is ignored whenever the target variant defines one (framer-motion
// 13 behavior; see Services.tsx's `headingDelayedVariants` for precedent).
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

export default function ProductsSection({ products }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#0A0A0A', padding: '6rem 0', borderTop: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.08" style={{ position: 'absolute', top: -60, left: -60, width: 210, height: 210, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.21" style={{ position: 'absolute', bottom: 50, right: '7%', width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.14" style={{ position: 'absolute', top: '40%', left: '14%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.1" style={{ position: 'absolute', bottom: -40, right: -30, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} aria-hidden="true" />

      <div className="container">
        <motion.p
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
          style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}
        >
          Our Products
        </motion.p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <motion.h2
            initial={reduceMotion ? undefined : 'hidden'}
            whileInView={reduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.4 }}
            variants={headingDelayedVariants}
            style={{ fontSize: 'clamp(2rem,3.5vw,2.75rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', margin: 0 }}
          >
            Built in-house,<br />for Salesforce teams.
          </motion.h2>
          <a href="/products" className="products-view-all" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
            View all products &rarr;
          </a>
        </div>

        <motion.div
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem' }}
        >
          {products.map((product) => {
            const isEarlyAccess = product.status === 'preview' || product.status === 'beta';
            const iconSvg = productIcons[product.id];
            return (
              <motion.div key={product.id} variants={cardVariants} style={{ display: 'flex' }}>
                <div className="product-card-dark" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', height: '100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', overflow: 'hidden' }}>
                    {iconSvg && <span dangerouslySetInnerHTML={{ __html: iconSvg }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {product.status === 'ga' ? (
                        <span style={{ background: 'rgba(255,255,255,0.9)', color: '#0A0A0A', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {statusLabel(product.status)}
                        </span>
                      ) : (
                        <span style={{ border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {statusLabel(product.status)}
                        </span>
                      )}
                      {isEarlyAccess && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Early access</span>}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>{product.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '1rem' }}>{product.excerpt}</div>
                    <a href={`/products/${product.id}`} className="prod-card-link-dark" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'color 0.2s', marginTop: 'auto' }}>
                      Learn more &rarr;
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        .products-view-all:hover { color: rgba(255,255,255,0.9); }
        .prod-card-link-dark:hover { color: #fff !important; }
      `}</style>
    </section>
  );
}
