import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactElement, SVGProps } from 'react';
import { getBlogIllustration } from '@/data/blog-illustrations';
import type { HomeBlogCard } from '@/types/homepage';

interface Props {
  posts: HomeBlogCard[];
}

// Category fallback illustrations — transcribed verbatim (geometry and every
// attribute byte-identical, kebab-case attrs converted to camelCase for JSX)
// from src/components/ui/BlogCard.astro's `illustrations` map (the binding
// content authority for this port, per Ruling C2). Inline JSX per Ruling C7 —
// not `dangerouslySetInnerHTML` — matching the IconAlgobridge/IconProduct
// pattern established in ProductsSection.tsx. BlogCard.astro itself is out of
// scope for this change (other pages still use it), so this duplicates those
// five SVGs — a deliberate, accepted cost of scoping this rewrite to the
// homepage; do not extract a shared module for it.
function SalesforceIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="blog-svg-illus" aria-hidden="true" {...props}>
      <rect x="36" y="18" width="250" height="164" rx="8" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.75" />
      <rect x="36" y="18" width="250" height="30" rx="8" stroke="none" fill="#0A0A0A" opacity="0.07" />
      <path d="M36 48 L286 48" stroke="#0A0A0A" strokeWidth="1" opacity="0.4" />
      <circle cx="52" cy="33" r="4" fill="#0A0A0A" opacity="0.35" />
      <circle cx="66" cy="33" r="4" fill="#0A0A0A" opacity="0.25" />
      <circle cx="80" cy="33" r="4" fill="#0A0A0A" opacity="0.18" />
      <path d="M52 65 L230 65" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M52 80 L200 80" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <path d="M52 95 L220 95" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M52 110 L175 110" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <rect x="52" y="128" width="62" height="22" rx="4" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.5" />
      <path d="M62 139 L104 139" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <rect x="126" y="128" width="62" height="22" rx="4" stroke="#0A0A0A" strokeWidth="1.5" fill="#0A0A0A" opacity="0.8" />
      <path d="M136 139 L178 139" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <rect x="320" y="28" width="132" height="70" rx="8" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
      <text x="386" y="60" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="24" fontWeight="900" fill="#0A0A0A" opacity="0.8">92%</text>
      <text x="386" y="82" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fill="#5A5A5A">Success Rate</text>
      <g className="sf-cloud">
        <path d="M362 148 C350 148 342 141 342 133 C342 127 347 122 354 121 C356 114 363 109 371 109 C378 109 384 113 386 119 C390 119 395 123 395 128 C395 135 388 141 379 141 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.7" />
      </g>
      <g className="sf-bolt">
        <path d="M370 116 L365 127 L370 127 L365 138" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
      <circle cx="430" cy="120" r="22" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.3" />
      <circle cx="430" cy="120" r="14" stroke="#0A0A0A" strokeWidth="1" opacity="0.2" />
      <path d="M430 105 L430 120 L440 120" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function HerokuIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="blog-svg-illus" aria-hidden="true" {...props}>
      <rect x="50" y="20" width="280" height="162" rx="8" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.75" />
      <rect x="50" y="20" width="280" height="28" rx="8" stroke="none" fill="#0A0A0A" opacity="0.07" />
      <path d="M50 48 L330 48" stroke="#0A0A0A" strokeWidth="1" opacity="0.4" />
      <circle cx="66" cy="34" r="4" fill="#0A0A0A" opacity="0.35" />
      <circle cx="80" cy="34" r="4" fill="#0A0A0A" opacity="0.25" />
      <circle cx="94" cy="34" r="4" fill="#0A0A0A" opacity="0.18" />
      <text x="66" y="66" fontFamily="Outfit,monospace" fontSize="10" fill="#5A5A5A" opacity="0.6">$</text>
      <text x="78" y="66" fontFamily="Outfit,monospace" fontSize="10" fill="#0A0A0A" opacity="0.7">git push heroku main</text>
      <g className="heroku-lines">
        <text x="66" y="84" fontFamily="Outfit,monospace" fontSize="9" fill="#5A5A5A" opacity="0.5">remote: Compressing source files...</text>
        <text x="66" y="100" fontFamily="Outfit,monospace" fontSize="9" fill="#5A5A5A" opacity="0.45">remote: Building source: Node.js</text>
        <text x="66" y="116" fontFamily="Outfit,monospace" fontSize="9" fill="#5A5A5A" opacity="0.4">remote: -----&gt; Installing dependencies</text>
        <text x="66" y="132" fontFamily="Outfit,monospace" fontSize="9" fill="#5A5A5A" opacity="0.5">remote: -----&gt; Build succeeded!</text>
      </g>
      <g className="heroku-success">
        <rect x="66" y="146" width="238" height="20" rx="4" fill="#0A0A0A" opacity="0.85" />
        <text x="185" y="160" textAnchor="middle" fontFamily="Outfit,monospace" fontSize="9" fontWeight="700" fill="#fff">✓ Deployed to production</text>
      </g>
      <g className="heroku-rocket">
        <path d="M400 160 C400 140 420 120 420 95" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        <path d="M420 95 L414 105 L420 100 L426 105 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M412 108 C412 100 420 94 428 94 C428 104 422 112 412 114 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="420" cy="92" r="5" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.7" />
      </g>
      <path d="M370 150 C360 150 352 144 352 136 C352 130 356 125 362 124 C364 118 370 114 377 114 C383 114 388 118 390 123 C393 123 397 127 397 131 C397 137 392 142 385 142 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.45" />
    </svg>
  );
}

function MuleSoftIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="blog-svg-illus" aria-hidden="true" {...props}>
      <circle cx="240" cy="100" r="28" stroke="#0A0A0A" strokeWidth="2" opacity="0.8" />
      <circle cx="240" cy="100" r="16" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4" />
      <text x="240" y="97" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#0A0A0A">API</text>
      <text x="240" y="109" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#0A0A0A">HUB</text>
      <g className="mule-node1">
        <circle cx="80" cy="55" r="18" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
        <text x="80" y="52" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fontWeight="700" fill="#0A0A0A">Sales</text>
        <text x="80" y="63" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fill="#5A5A5A">force</text>
      </g>
      <g className="mule-node2">
        <circle cx="80" cy="145" r="18" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
        <text x="80" y="142" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fontWeight="700" fill="#0A0A0A">ERP</text>
        <text x="80" y="153" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fill="#5A5A5A">SAP</text>
      </g>
      <g className="mule-node3">
        <circle cx="400" cy="55" r="18" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
        <text x="400" y="52" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fontWeight="700" fill="#0A0A0A">AWS</text>
        <text x="400" y="63" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fill="#5A5A5A">Cloud</text>
      </g>
      <g className="mule-node4">
        <circle cx="400" cy="145" r="18" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
        <text x="400" y="142" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fontWeight="700" fill="#0A0A0A">DB</text>
        <text x="400" y="153" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="7" fill="#5A5A5A">SQL</text>
      </g>
      <line x1="98" y1="62" x2="213" y2="88" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.45" className="mule-line" />
      <line x1="98" y1="138" x2="213" y2="112" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.45" className="mule-line" />
      <line x1="267" y1="88" x2="382" y2="62" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.45" className="mule-line" />
      <line x1="267" y1="112" x2="382" y2="138" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.45" className="mule-line" />
      <circle cx="152" cy="74" r="4" fill="#0A0A0A" opacity="0.5" className="mule-pulse" />
      <circle cx="327" cy="74" r="4" fill="#0A0A0A" opacity="0.5" className="mule-pulse2" />
      <circle cx="152" cy="126" r="4" fill="#0A0A0A" opacity="0.5" className="mule-pulse3" />
      <circle cx="327" cy="126" r="4" fill="#0A0A0A" opacity="0.5" className="mule-pulse4" />
    </svg>
  );
}

function AWSIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="blog-svg-illus" aria-hidden="true" {...props}>
      <g className="aws-cloud">
        <path d="M170 72 C142 72 122 58 122 42 C122 30 133 20 148 18 C150 6 163 -2 178 -2 C190 -2 200 4 205 14 C210 12 216 10 222 10 C242 10 258 24 258 42 C258 60 242 74 222 74 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.7" />
        <text x="190" y="44" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#0A0A0A" opacity="0.6">AWS Region</text>
      </g>
      <rect x="100" y="90" width="280" height="90" rx="8" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.65" />
      <text x="122" y="106" fontFamily="Outfit,sans-serif" fontSize="8" fill="#5A5A5A">VPC</text>
      <rect x="116" y="112" width="60" height="52" rx="4" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
      <text x="146" y="133" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#0A0A0A">EC2</text>
      <path d="M130 144 L162 144" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M130 152 L155 152" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <rect x="196" y="112" width="60" height="52" rx="4" stroke="#0A0A0A" strokeWidth="1.5" fill="#0A0A0A" opacity="0.8" />
      <text x="226" y="133" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#fff">RDS</text>
      <path d="M210 144 L242 144" stroke="#fff" strokeWidth="1" opacity="0.3" />
      <path d="M210 152 L235 152" stroke="#fff" strokeWidth="1" opacity="0.3" />
      <rect x="276" y="112" width="88" height="52" rx="4" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
      <text x="320" y="133" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#0A0A0A">S3 / Redshift</text>
      <path d="M290 144 L352 144" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M290 152 L335 152" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M176 74 L176 90" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <path d="M146 90 L146 112" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.3" />
      <path d="M226 90 L226 112" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.3" />
      <path d="M320 90 L320 112" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.3" />
      <rect x="360" y="20" width="88" height="52" rx="6" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.55" />
      <text x="404" y="42" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#0A0A0A">Lambda</text>
      <text x="404" y="56" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fill="#5A5A5A">Serverless</text>
      <path d="M404 72 L404 90 L320 90" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35" />
    </svg>
  );
}

function ProductIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="blog-svg-illus" aria-hidden="true" {...props}>
      <path d="M200 30 L280 70 L280 150 L200 190 L120 150 L120 70 Z" stroke="#0A0A0A" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
      <path d="M200 30 L200 110 L280 70" stroke="#0A0A0A" strokeWidth="1" opacity="0.35" />
      <path d="M200 110 L120 70" stroke="#0A0A0A" strokeWidth="1" opacity="0.35" />
      <path d="M200 110 L200 190" stroke="#0A0A0A" strokeWidth="1" opacity="0.3" />
      <path d="M162 120 C162 110 178 103 200 102 C222 103 238 110 238 120 L238 148 C238 158 222 165 200 167 C178 165 162 158 162 148 Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M185 132 L195 142 L218 120" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <rect x="326" y="30" width="62" height="22" rx="11" stroke="#0A0A0A" strokeWidth="1.5" fill="#0A0A0A" opacity="0.85" />
      <text x="357" y="45" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#fff">v2.4.1</text>
      <g className="product-star1">
        <circle cx="348" cy="90" r="3" fill="#0A0A0A" opacity="0.5" />
        <circle cx="348" cy="90" r="6" stroke="#0A0A0A" strokeWidth="1" opacity="0.2" />
      </g>
      <g className="product-star2">
        <circle cx="374" cy="118" r="3" fill="#0A0A0A" opacity="0.45" />
        <circle cx="374" cy="118" r="6" stroke="#0A0A0A" strokeWidth="1" opacity="0.2" />
      </g>
      <g className="product-star3">
        <circle cx="350" cy="148" r="3" fill="#0A0A0A" opacity="0.4" />
        <circle cx="350" cy="148" r="6" stroke="#0A0A0A" strokeWidth="1" opacity="0.2" />
      </g>
      <g className="product-star4">
        <circle cx="396" cy="80" r="2.5" fill="#0A0A0A" opacity="0.3" />
      </g>
      <g className="product-star5">
        <circle cx="410" cy="140" r="2.5" fill="#0A0A0A" opacity="0.3" />
      </g>
      <g className="product-star6">
        <circle cx="330" cy="130" r="2" fill="#0A0A0A" opacity="0.25" />
      </g>
      <rect x="326" y="64" width="100" height="60" rx="6" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4" />
      <path d="M344 84 L408 84" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M344 96 L390 96" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <path d="M344 108 L400 108" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

const categoryIllustrations: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  Salesforce: SalesforceIllustration,
  Heroku: HerokuIllustration,
  MuleSoft: MuleSoftIllustration,
  AWS: AWSIllustration,
  Product: ProductIllustration,
};

// Ports BlogPreview.astro's `transition-delay: 0.05s` on the h2 (line 19). The
// delay must live inside the variant's own transition — a `transition` prop on
// the element is ignored whenever the target variant defines one (Ruling C5;
// see Services.tsx / ProductsSection.tsx's `headingDelayedVariants`).
const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

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

export default function BlogPreview({ posts }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ background: '#fff', padding: '6rem 0', borderTop: '1px solid #E0E0DC', position: 'relative', overflow: 'hidden' }}>
      <div data-parallax="0.08" style={{ position: 'absolute', top: 20, right: -70, width: 250, height: 250, borderRadius: '50%', border: '1.5px solid #0A0A0A', opacity: 0.04, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.16" style={{ position: 'absolute', bottom: 50, left: '4%', width: 8, height: 8, borderRadius: '50%', background: '#0A0A0A', opacity: 0.08, pointerEvents: 'none' }} aria-hidden="true" />
      <div data-parallax="0.22" style={{ position: 'absolute', top: '18%', left: '28%', width: 5, height: 5, borderRadius: '50%', background: '#0A0A0A', opacity: 0.06, pointerEvents: 'none' }} aria-hidden="true" />

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <motion.p
              className="section-label"
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingVariants}
            >
              Writing
            </motion.p>
            <motion.h2
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'show'}
              viewport={{ once: true, amount: 0.4 }}
              variants={headingDelayedVariants}
              style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}
            >
              From the team
            </motion.h2>
          </div>
          {/* No anim-fade-up on this link in BlogPreview.astro (line 23) — deliberately unanimated; stays a plain <a>. */}
          <a href="/blog" className="btn btn-outline" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
            View all posts &rarr;
          </a>
        </div>

        <motion.div
          className="row"
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {posts.map((post) => {
            const contentIllustration = getBlogIllustration(post.slug);
            const CategoryIllustration = categoryIllustrations[post.category] ?? categoryIllustrations.Salesforce;
            const formattedDate = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={post.slug} className="col-lg-4 col-md-4" style={{ marginBottom: '1.5rem', display: 'flex' }}>
                <motion.article className="blog-card-new" variants={cardVariants} style={{ width: '100%' }}>
                  <a href={`/blog/${post.slug}`} className="blog-card-thumb" aria-label={`Read: ${post.title}`} tabIndex={-1}>
                    {contentIllustration ? (
                      // Content-specific illustrations come from the existing, unmodified
                      // src/data/blog-illustrations.ts module as raw SVG markup keyed by
                      // slug pattern (~20 unique illustrations) — out of scope to port to
                      // JSX. dangerouslySetInnerHTML here mirrors BlogCard.astro's own
                      // `set:html` for this exact same data, and is the only way to render
                      // it while preserving the DOM structure the global hover-animation
                      // CSS selectors (e.g. .blog-card-new:hover .sf-cloud) target.
                      <div className="blog-card-illus" dangerouslySetInnerHTML={{ __html: contentIllustration }} />
                    ) : (
                      <div className="blog-card-illus">
                        <CategoryIllustration />
                      </div>
                    )}
                  </a>
                  <div className="blog-card-body">
                    <div className="blog-card-top">
                      <span className="blog-cat-tag">{post.category}</span>
                      <span className="blog-read-time">{post.readTime} min read</span>
                    </div>
                    <h3 className="blog-card-title">
                      <a href={`/blog/${post.slug}`}>{post.title}</a>
                    </h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-meta">
                      <span className="blog-meta-text">
                        <span className="blog-author-name">CloudAlgo Team</span>
                        <span className="blog-meta-dot">&middot;</span>
                        <span>{formattedDate}</span>
                      </span>
                    </div>
                  </div>
                </motion.article>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
