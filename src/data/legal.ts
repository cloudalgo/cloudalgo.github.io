// The register of instruments.
//
// One entry per legal document on the site. A legal document is an
// instrument that is IN FORCE, so every row here is a filing fact --
// what it governs, who issued it, since when, how many clauses it has --
// and never a marketing blurb.
//
// `clauses` is the count the document's own <h2> headings produce.
// LegalDoc.astro counts the headings it renders and throws at build time
// if the two disagree, so a clause added or removed cannot silently drift
// out of step with the register or the rail.

export interface Instrument {
  /** Route, and the key other documents cite it by. */
  href: string;
  /** The document's own title, as printed on its masthead. */
  title: string;
  /** What the document governs, in one line, for the register row. */
  what: string;
  /** Which set of documents this one belongs to. Siblings in the same
      register are listed at the foot of each document. */
  register: 'site' | 'orgvitals' | 'insurealgo';
  /** What the instrument applies to. */
  appliesTo: string;
  /** In force since. UK date order, matching the site's spelling. */
  inForce: string;
  /** Number of clauses. Verified against the rendered document. */
  clauses: number;
  /** Stated in the document's own text, or omitted. Never inferred. */
  governingLaw?: string;
}

export const ISSUER = 'CloudAlgo Private Limited';

export const instruments: Instrument[] = [
  // ── The site's own instruments ──────────────────────────
  {
    href: '/page/privacy-policy/',
    title: 'Privacy Policy',
    what: 'What we collect through the site, why, and the rights you hold over it.',
    register: 'site',
    appliesTo: 'cloudalgo.com',
    inForce: 'May 2026',
    clauses: 11,
  },
  {
    href: '/page/disclaimer/',
    title: 'Disclaimer',
    what: 'The limits of what the site says — no professional advice, no warranty on code samples.',
    register: 'site',
    appliesTo: 'cloudalgo.com',
    inForce: 'May 2026',
    clauses: 8,
  },

  // ── OrgVitals ───────────────────────────────────────────
  {
    href: '/products/orgvitals/legal/privacy/',
    title: 'Privacy Policy',
    what: 'What stays on your device, what reaches us, and the rights you hold over it.',
    register: 'orgvitals',
    appliesTo: 'OrgVitals',
    inForce: '1 July 2026',
    clauses: 11,
    governingLaw: 'India',
  },
  {
    href: '/products/orgvitals/legal/terms/',
    title: 'Terms of Service',
    what: 'The licence and the agreement — your responsibilities, warranties, liability.',
    register: 'orgvitals',
    appliesTo: 'OrgVitals',
    inForce: '1 July 2026',
    clauses: 12,
    governingLaw: 'India',
  },
  {
    href: '/products/orgvitals/legal/data-processing/',
    title: 'Data Processing and Usage',
    what: 'How data flows, what stays local, and the three sub-processors involved.',
    register: 'orgvitals',
    appliesTo: 'OrgVitals',
    inForce: '1 July 2026',
    clauses: 5,
    governingLaw: 'India',
  },
  {
    href: '/products/orgvitals/legal/acceptable-use/',
    title: 'Acceptable Use Policy',
    what: 'Scan only the orgs you own, administer, or are authorised in writing to assess.',
    register: 'orgvitals',
    appliesTo: 'OrgVitals',
    inForce: '1 July 2026',
    clauses: 5,
    governingLaw: 'India',
  },

  // ── InsureAlgo ──────────────────────────────────────────
  {
    href: '/apps/insurealgo/privacy/',
    title: 'Privacy Policy',
    what: 'Everything stays on the device. No account, no tracking, no servers.',
    register: 'insurealgo',
    appliesTo: 'InsureAlgo',
    inForce: '29 May 2025',
    clauses: 9,
  },
];

/** The instrument at `href`, or undefined. */
export function instrumentFor(href: string): Instrument | undefined {
  return instruments.find((i) => i.href === href);
}

/** The other instruments in the same register, in filing order. */
export function siblingsOf(href: string): Instrument[] {
  const self = instrumentFor(href);
  if (!self) return [];
  return instruments.filter((i) => i.register === self.register && i.href !== href);
}

/** Human label for a register, used as the register block's heading. */
export const registerLabel: Record<Instrument['register'], string> = {
  site: 'CloudAlgo',
  orgvitals: 'OrgVitals',
  insurealgo: 'InsureAlgo',
};
