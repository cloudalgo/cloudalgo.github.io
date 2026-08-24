// Content-specific SVG illustrations for each blog post.
// Keys match partial slug patterns. All viewBox="0 0 480 200".

const illustrations: Record<string, string> = {

  // ── Heroku Connect & Best Practices ────────────────────────────────
  'heroku-connect-lessons-learned': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- PostgreSQL cylinder (left) -->
  <ellipse cx="100" cy="62" rx="50" ry="14" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <line x1="50" y1="62" x2="50" y2="138" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <line x1="150" y1="62" x2="150" y2="138" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <ellipse cx="100" cy="138" rx="50" ry="14" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <ellipse cx="100" cy="80" rx="50" ry="14" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <ellipse cx="100" cy="98" rx="50" ry="14" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <text x="100" y="124" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.7">PostgreSQL</text>

  <!-- Salesforce cloud (right) -->
  <path d="M355 95 C338 95 326 84 326 72 C326 63 332 56 341 54 C343 46 351 40 360 40 C367 40 373 44 376 50 C380 48 385 47 390 47 C404 47 415 57 415 70 C415 83 404 93 390 93 Z"
        stroke="#0A0A0A" stroke-width="2" opacity="0.85"/>
  <text x="370" y="120" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.7">Salesforce CRM</text>
  <!-- Lightning bolt inside cloud -->
  <path d="M367 58 L362 70 L368 70 L363 84" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>

  <!-- Bidirectional arrows (sync channel) -->
  <path d="M155 90 L240 90" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.5"/>
  <path d="M155 110 L240 110" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.5"/>
  <path d="M151 87 L155 90 L151 93" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M244 107 L240 110 L244 113" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M240 87 L244 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0"/>
  <!-- HC bridge label -->
  <rect x="193" y="78" width="70" height="44" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="228" y="97" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A">HEROKU</text>
  <text x="228" y="110" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A">CONNECT</text>

  <!-- Data packets on lines -->
  <rect x="168" y="84" width="12" height="12" rx="2" fill="#0A0A0A" opacity="0.4"/>
  <rect x="215" y="104" width="12" height="12" rx="2" fill="#0A0A0A" opacity="0.35"/>

  <!-- Field mapping hint -->
  <text x="240" y="165" text-anchor="middle" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.6">External_Id__c → id</text>
  <line x1="80" y1="152" x2="380" y2="152" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="3 3" opacity="0.15"/>
</svg>`,

  // ── LWC Navigation in Experience Cloud ─────────────────────────────
  'navigation-in-salesforce-digital-experiences': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Browser chrome -->
  <rect x="30" y="20" width="420" height="162" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <rect x="30" y="20" width="420" height="30" rx="8" stroke="none" fill="#0A0A0A" opacity="0.06"/>
  <path d="M30 50 L450 50" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <!-- Traffic lights -->
  <circle cx="48" cy="35" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <circle cx="62" cy="35" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/>
  <circle cx="76" cy="35" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.2"/>
  <!-- URL bar -->
  <rect x="100" y="27" width="220" height="16" rx="8" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="210" y="39" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.7">mysite.force.com/portal</text>

  <!-- Experience Cloud nav bar -->
  <rect x="30" y="50" width="420" height="26" fill="#0A0A0A" opacity="0.85"/>
  <!-- Nav items -->
  <text x="65" y="67" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">Home</text>
  <text x="110" y="67" font-family="Outfit,sans-serif" font-size="9" fill="rgba(255,255,255,0.5)">Cases</text>
  <text x="150" y="67" font-family="Outfit,sans-serif" font-size="9" fill="rgba(255,255,255,0.5)">Knowledge</text>
  <text x="215" y="67" font-family="Outfit,sans-serif" font-size="9" fill="rgba(255,255,255,0.5)">My Account</text>
  <!-- Lightning bolt icon left nav -->
  <path d="M46 58 L42 67 L47 67 L43 77" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>

  <!-- LWC component boxes -->
  <rect x="48" y="88" width="168" height="80" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="58" y="104" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">c-navigation-item</text>
  <path d="M58 114 L190 114" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <path d="M58 124 L160 124" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <path d="M58 134 L175 134" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <!-- Navigation arrow -->
  <path d="M216 128 L260 128" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M256 124 L260 128 L256 132" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <!-- NavigationMixin code hint -->
  <rect x="264" y="88" width="178" height="80" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="274" y="104" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">NavigationMixin</text>
  <text x="274" y="116" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">  .navigate({</text>
  <text x="274" y="128" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">    type: 'standard</text>
  <text x="274" y="140" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">    __navItem'</text>
  <text x="274" y="152" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">  })</text>
</svg>`,

  // ── Date/Time/Timezone Conversion ──────────────────────────────────
  'converting-date-and-time-and-timezone': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Clock face (left) -->
  <circle cx="110" cy="100" r="64" stroke="#0A0A0A" stroke-width="2" opacity="0.8"/>
  <circle cx="110" cy="100" r="56" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <!-- Hour marks -->
  <line x1="110" y1="40" x2="110" y2="52" stroke="#0A0A0A" stroke-width="2" opacity="0.6"/>
  <line x1="110" y1="148" x2="110" y2="160" stroke="#0A0A0A" stroke-width="2" opacity="0.6"/>
  <line x1="50" y1="100" x2="62" y2="100" stroke="#0A0A0A" stroke-width="2" opacity="0.6"/>
  <line x1="158" y1="100" x2="170" y2="100" stroke="#0A0A0A" stroke-width="2" opacity="0.6"/>
  <!-- Clock hands -->
  <line x1="110" y1="100" x2="110" y2="62" stroke="#0A0A0A" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
  <line x1="110" y1="100" x2="140" y2="112" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
  <circle cx="110" cy="100" r="4" fill="#0A0A0A" opacity="0.8"/>
  <!-- IST label -->
  <text x="110" y="130" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" font-weight="700" fill="#0A0A0A" opacity="0.7">IST +5:30</text>

  <!-- Conversion arrow -->
  <path d="M182 92 L230 92" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M182 108 L230 108" stroke="#0A0A0A" stroke-width="1.5" opacity="0.35"/>
  <path d="M226 88 L230 92 L226 96" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="206" y="88" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#5A5A5A">toGMT</text>

  <!-- Result box (right) -->
  <rect x="240" y="58" width="208" height="84" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="258" y="82" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">// Input</text>
  <text x="258" y="96" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">2024-01-15 14:30 IST</text>
  <path d="M254 106 L432 106" stroke="#0A0A0A" stroke-width="1" opacity="0.2"/>
  <text x="258" y="120" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">// Output (GMT)</text>
  <text x="258" y="134" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">2024-01-15T09:00:00Z</text>

  <!-- Globe hint -->
  <circle cx="354" cy="166" r="20" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <ellipse cx="354" cy="166" rx="8" ry="20" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <path d="M334 166 L374 166" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="354" y="170" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A" opacity="0.5">UTC</text>
</svg>`,

  // ── Apex Time to String Formatting ─────────────────────────────────
  'format-apex-time-as-string': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Code editor window -->
  <rect x="30" y="20" width="420" height="160" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <rect x="30" y="20" width="420" height="28" rx="8" stroke="none" fill="#0A0A0A" opacity="0.07"/>
  <path d="M30 48 L450 48" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <circle cx="48" cy="34" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <circle cx="62" cy="34" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/>
  <circle cx="76" cy="34" r="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.2"/>
  <text x="210" y="38" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" fill="#5A5A5A" opacity="0.7">TimeFormatter.cls</text>

  <!-- Line numbers -->
  <text x="46" y="68" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">1</text>
  <text x="46" y="84" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">2</text>
  <text x="46" y="100" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">3</text>
  <text x="46" y="116" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">4</text>
  <text x="46" y="132" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">5</text>
  <text x="46" y="148" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.35">6</text>

  <!-- Code lines -->
  <text x="66" y="68" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">Time t = Time.newInstance(14, 30, 0, 0);</text>
  <text x="66" y="84" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">DateTime dt = DateTime.newInstance(Date.today(), t);</text>
  <text x="66" y="100" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">String formatted = dt.format(<tspan fill="#5A5A5A" opacity="0.9">'HH:mm:ss'</tspan>);</text>
  <path x="62" y="108" width="360" height="1" stroke="#0A0A0A" stroke-width="1" opacity="0.1"/>
  <text x="66" y="116" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A" opacity="0.6">// Result:</text>
  <rect x="66" y="122" width="200" height="20" rx="4" fill="#0A0A0A" opacity="0.07" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="76" y="136" font-family="Outfit,monospace" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.85">"14:30:00"</text>

  <!-- Arrow highlighting the output -->
  <path d="M284 132 L320 132" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M316 128 L320 132 L316 136" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  <text x="330" y="136" font-family="Outfit,sans-serif" font-size="9" fill="#5A5A5A" opacity="0.7">String output</text>
</svg>`,

  // ── Apex Enum with Switch Case ──────────────────────────────────────
  'apex-enum-with-switch-case': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Enum declaration box (left) -->
  <rect x="28" y="30" width="148" height="140" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <rect x="28" y="30" width="148" height="24" rx="6" fill="#0A0A0A" opacity="0.08"/>
  <path d="M28 54 L176 54" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="102" y="46" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">enum Status</text>
  <text x="44" y="72" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">  OPEN</text>
  <text x="44" y="88" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">  IN_PROGRESS</text>
  <text x="44" y="104" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">  CLOSED</text>
  <text x="44" y="120" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">  ESCALATED</text>
  <text x="44" y="136" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.75">  RESOLVED</text>

  <!-- Arrow to switch -->
  <path d="M176 100 L214 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M210 96 L214 100 L210 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- Switch block center -->
  <rect x="214" y="78" width="80" height="44" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8" fill="#0A0A0A" fill-opacity="0.05"/>
  <text x="254" y="97" text-anchor="middle" font-family="Outfit,monospace" font-size="10" font-weight="700" fill="#0A0A0A">switch</text>
  <text x="254" y="111" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">(status)</text>

  <!-- Branches to case boxes (right) -->
  <path d="M294 88 L326 60" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M294 100 L326 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M294 112 L326 140" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>

  <!-- Case result boxes -->
  <rect x="326" y="44" width="126" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="342" y="58" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">when OPEN → createTask()</text>

  <rect x="326" y="86" width="126" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" fill-opacity="0.85"/>
  <text x="342" y="100" font-family="Outfit,monospace" font-size="8" fill="#fff" opacity="0.9">when CLOSED → close()</text>

  <rect x="326" y="128" width="126" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="342" y="142" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">when else → log()</text>
</svg>`,

  // ── ViralSweep → Salesforce Leads ──────────────────────────────────
  'viralsweep-entries-into-lead': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Contest entry form (left) -->
  <rect x="24" y="30" width="130" height="140" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="89" y="52" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.7">ViralSweep</text>
  <text x="89" y="66" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Contest Entry</text>
  <rect x="38" y="76" width="102" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <text x="44" y="87" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">Full Name</text>
  <rect x="38" y="96" width="102" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <text x="44" y="107" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">Email</text>
  <rect x="38" y="116" width="102" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <text x="44" y="127" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">Phone</text>
  <rect x="38" y="140" width="102" height="20" rx="10" fill="#0A0A0A" opacity="0.85"/>
  <text x="89" y="154" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">Enter Now</text>

  <!-- Zapier / automation arrow -->
  <path d="M154 100 L194 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M190 96 L194 100 L190 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <!-- Zapier bolt in middle -->
  <text x="174" y="94" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" fill="#5A5A5A" opacity="0.6">Zapier</text>
  <path d="M170 96 L164 104 L169 104 L165 112" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>

  <!-- Salesforce Lead record (right) -->
  <rect x="200" y="30" width="256" height="140" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <!-- Header -->
  <rect x="200" y="30" width="256" height="28" rx="8" fill="#0A0A0A" opacity="0.08"/>
  <path d="M200 58 L456 58" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="290" y="48" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.8">Lead — Jessica Martinez</text>

  <!-- Lead fields -->
  <text x="216" y="76" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">First Name</text>
  <text x="310" y="76" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A">Jessica</text>
  <text x="216" y="93" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Last Name</text>
  <text x="310" y="93" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A">Martinez</text>
  <text x="216" y="110" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Email</text>
  <text x="310" y="110" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A">jm@example.com</text>
  <text x="216" y="127" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Lead Source</text>
  <rect x="308" y="118" width="64" height="14" rx="7" fill="#0A0A0A" opacity="0.85"/>
  <text x="340" y="129" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#fff">ViralSweep</text>
  <text x="216" y="144" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Status</text>
  <rect x="308" y="134" width="48" height="14" rx="7" stroke="#0A0A0A" stroke-width="1" opacity="0.5"/>
  <text x="332" y="145" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#0A0A0A" opacity="0.7">Open</text>
</svg>`,

  // ── Dynamic JavaScript Import in LWC ───────────────────────────────
  'loading-stripe-js-in-lwc': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- LWC component frame (left) -->
  <rect x="24" y="22" width="200" height="156" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <rect x="24" y="22" width="200" height="26" rx="8" fill="#0A0A0A" opacity="0.07"/>
  <path d="M24 48 L224 48" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <!-- Lightning bolt icon -->
  <path d="M40 32 L36 40 L41 40 L37 52" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <text x="130" y="40" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">payment-form.js</text>

  <!-- Dynamic import code -->
  <text x="38" y="66" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.6">async loadStripe() {</text>
  <text x="38" y="80" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.8">  const { loadStripe }</text>
  <text x="38" y="94" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.8">    = await import(</text>
  <rect x="38" y="100" width="172" height="20" rx="3" fill="#0A0A0A" opacity="0.06" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="48" y="114" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.85">      '@stripe/stripe-js'</text>
  <text x="38" y="130" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.8">    );</text>
  <text x="38" y="146" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.6">  this.stripe =</text>
  <text x="38" y="160" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.6">    await loadStripe(key);</text>

  <!-- Lazy load arrow -->
  <path d="M224 100 L270 100" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.5"/>
  <path d="M266 96 L270 100 L266 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="247" y="94" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A" opacity="0.6">lazy load</text>

  <!-- Stripe module box (right) -->
  <rect x="270" y="62" width="186" height="76" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="363" y="86" text-anchor="middle" font-family="Outfit,sans-serif" font-size="12" font-weight="900" fill="#0A0A0A" opacity="0.75">Stripe.js</text>
  <text x="363" y="104" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" fill="#5A5A5A">payment module</text>
  <text x="363" y="120" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.7">{ loadStripe, Elements }</text>

  <!-- Light DOM note -->
  <rect x="270" y="152" width="186" height="20" rx="6" stroke="#0A0A0A" stroke-width="1" opacity="0.4" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="363" y="166" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A" opacity="0.7">lightningComponentBundle: Light DOM</text>
</svg>`,

  // ── REST & SOAP APIs with Node.js ───────────────────────────────────
  'salesforce-rest-and-soap-apis': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Node.js server (left) -->
  <rect x="22" y="50" width="110" height="100" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <rect x="22" y="50" width="110" height="24" rx="8" fill="#0A0A0A" opacity="0.08"/>
  <path d="M22 74 L132 74" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="77" y="66" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">Node.js</text>
  <!-- Node hexagon -->
  <path d="M60 96 L70 90 L80 96 L80 108 L70 114 L60 108 Z" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="70" y="105" text-anchor="middle" font-family="Outfit,monospace" font-size="7" font-weight="700" fill="#0A0A0A" opacity="0.8">JS</text>
  <text x="77" y="132" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">express app</text>

  <!-- HTTP method badges (center) -->
  <rect x="152" y="34" width="44" height="18" rx="9" fill="#0A0A0A" opacity="0.85"/>
  <text x="174" y="47" text-anchor="middle" font-family="Outfit,monospace" font-size="9" font-weight="700" fill="#fff">GET</text>
  <rect x="152" y="58" width="50" height="18" rx="9" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="177" y="71" text-anchor="middle" font-family="Outfit,monospace" font-size="9" font-weight="700" fill="#0A0A0A">POST</text>
  <rect x="152" y="82" width="44" height="18" rx="9" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <text x="174" y="95" text-anchor="middle" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.7">PUT</text>
  <rect x="152" y="106" width="62" height="18" rx="9" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <text x="183" y="119" text-anchor="middle" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.6">DELETE</text>

  <!-- SOAP envelope hint -->
  <rect x="152" y="136" width="62" height="24" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <text x="183" y="148" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">SOAP</text>
  <text x="183" y="158" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">XML/WSDL</text>

  <!-- Arrows to Salesforce -->
  <path d="M214 43 L294 76" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M214 67 L294 88" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M214 91 L294 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.4"/>
  <path d="M214 115 L294 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.35"/>
  <path d="M214 148 L294 124" stroke="#0A0A0A" stroke-width="1.5" opacity="0.3"/>

  <!-- Salesforce cloud (right) -->
  <path d="M335 95 C312 95 296 80 296 64 C296 51 305 42 318 40 C321 30 332 22 345 22 C355 22 363 27 367 36 C372 33 378 32 385 32 C402 32 416 45 416 61 C416 77 402 90 385 90 Z"
        stroke="#0A0A0A" stroke-width="2" opacity="0.85"/>
  <path d="M356 45 L350 56 L357 56 L351 69" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <text x="356" y="120" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.7">Salesforce API</text>

  <!-- OAuth token -->
  <rect x="296" y="136" width="138" height="22" rx="6" stroke="#0A0A0A" stroke-width="1" opacity="0.4" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="365" y="151" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.7">Bearer eyJhbGci...</text>
</svg>`,

  // ── Advanced SOQL Queries ───────────────────────────────────────────
  'advanced-soql-queries': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- SOQL query block (top) -->
  <rect x="24" y="16" width="432" height="88" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <rect x="24" y="16" width="432" height="24" rx="8" fill="#0A0A0A" opacity="0.07"/>
  <path d="M24 40 L456 40" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="240" y="32" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.6">SOQL Query Builder</text>

  <!-- Query lines -->
  <text x="40" y="58" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">SELECT</text>
  <text x="90" y="58" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">Id, Name, Amount, (SELECT Id FROM OpportunityLineItems)</text>
  <text x="40" y="72" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">FROM</text>
  <text x="80" y="72" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">Opportunity</text>
  <text x="40" y="86" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">WHERE</text>
  <text x="88" y="86" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">Amount &gt; 10000 AND CloseDate = THIS_QUARTER</text>
  <text x="40" y="96" font-family="Outfit,monospace" font-size="9" fill="#0A0A0A" opacity="0.8">ORDER BY</text>
  <text x="96" y="96" font-family="Outfit,monospace" font-size="9" fill="#5A5A5A">Amount DESC LIMIT 50</text>

  <!-- Results table (bottom) -->
  <rect x="24" y="116" width="432" height="72" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <!-- Table header -->
  <rect x="24" y="116" width="432" height="20" rx="8" fill="#0A0A0A" opacity="0.06"/>
  <path d="M24 136 L456 136" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="50" y="130" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.7">Name</text>
  <text x="200" y="130" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.7">Amount</text>
  <text x="310" y="130" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.7">Close Date</text>
  <text x="420" y="130" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.7">Items</text>
  <!-- Dividers -->
  <line x1="180" y1="116" x2="180" y2="188" stroke="#0A0A0A" stroke-width="1" opacity="0.15"/>
  <line x1="290" y1="116" x2="290" y2="188" stroke="#0A0A0A" stroke-width="1" opacity="0.15"/>
  <line x1="400" y1="116" x2="400" y2="188" stroke="#0A0A0A" stroke-width="1" opacity="0.15"/>
  <!-- Table rows -->
  <text x="50" y="150" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">Acme Corp Deal</text>
  <text x="200" y="150" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">$85,000</text>
  <text x="310" y="150" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">2024-03-31</text>
  <text x="420" y="150" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">3</text>
  <path d="M30 156 L450 156" stroke="#0A0A0A" stroke-width="1" opacity="0.1"/>
  <text x="50" y="170" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">Beta Corp Q1</text>
  <text x="200" y="170" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">$42,500</text>
  <text x="310" y="170" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">2024-03-15</text>
  <text x="420" y="170" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A">1</text>
  <path d="M30 176 L450 176" stroke="#0A0A0A" stroke-width="1" opacity="0.1"/>
  <text x="50" y="186" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.5">... 48 more rows</text>
</svg>`,

  // ── Salesforce OAuth Setup ──────────────────────────────────────────
  'salesforce-oauth-connected-app': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- App box (left) -->
  <rect x="22" y="70" width="100" height="60" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="72" y="95" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">Node.js</text>
  <text x="72" y="110" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">App</text>

  <!-- Arrow 1: App → Auth Server -->
  <path d="M122 96 L172 96" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M168 92 L172 96 L168 100" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="147" y="90" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">auth request</text>

  <!-- Auth Server (center) -->
  <rect x="172" y="60" width="136" height="80" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8" fill="#0A0A0A" fill-opacity="0.04"/>
  <!-- Lock icon -->
  <rect x="224" y="78" width="32" height="26" rx="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <path d="M218 86 C218 76 224 70 240 70 C256 70 262 76 262 86" stroke="#0A0A0A" stroke-width="1.5" fill="none" opacity="0.7"/>
  <circle cx="240" cy="91" r="4" fill="#0A0A0A" opacity="0.7"/>
  <text x="240" y="126" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.7">Salesforce</text>
  <text x="240" y="138" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A">OAuth Server</text>

  <!-- Arrow 2: Auth Server → Token returned -->
  <path d="M172 114 L122 114" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M126 110 L122 114 L126 118" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <text x="147" y="130" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">access_token</text>

  <!-- Arrow 3: App → Salesforce API -->
  <path d="M308 96 L360 96" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M356 92 L360 96 L356 100" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="334" y="90" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.7">Bearer token</text>

  <!-- Salesforce API (right) -->
  <path d="M406 78 C388 78 374 66 374 53 C374 43 381 36 391 34 C393 26 402 20 413 20 C421 20 428 24 431 31 C435 29 440 28 445 28 C456 28 464 36 464 46 C464 56 456 64 445 64 Z"
        stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <path d="M413 33 L408 43 L414 43 L409 55" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <text x="414" y="90" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">Salesforce</text>
  <text x="414" y="103" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">REST API</text>

  <!-- Token box (bottom) -->
  <rect x="22" y="148" width="436" height="36" rx="8" stroke="#0A0A0A" stroke-width="1" opacity="0.4" fill="#0A0A0A" fill-opacity="0.03"/>
  <text x="30" y="163" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.6">access_token:</text>
  <text x="110" y="163" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.8">eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi4...</text>
  <text x="30" y="177" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.6">instance_url:</text>
  <text x="115" y="177" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.7">https://yourdomain.salesforce.com</text>
</svg>`,

  // ── Apache Airflow & Medallion Architecture ─────────────────────────
  'apache-airflow-on-heroku': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- DAG container -->
  <rect x="14" y="14" width="452" height="136" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <rect x="14" y="14" width="452" height="26" rx="8" fill="#0A0A0A" opacity="0.07"/>
  <path d="M14 40 L466 40" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="240" y="31" text-anchor="middle" font-family="Outfit,monospace" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">salesforce_to_snowflake_dag  @daily</text>

  <!-- Task nodes: Extract -->
  <rect x="30" y="58" width="80" height="34" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7" fill="#0A0A0A" fill-opacity="0.05"/>
  <text x="70" y="73" text-anchor="middle" font-family="Outfit,monospace" font-size="8" font-weight="700" fill="#0A0A0A">extract_sf</text>
  <text x="70" y="84" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A">Bulk API 2.0</text>

  <path d="M110 75 L136 75" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M132 71 L136 75 L132 79" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- Validate -->
  <rect x="136" y="58" width="76" height="34" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="174" y="73" text-anchor="middle" font-family="Outfit,monospace" font-size="8" font-weight="700" fill="#0A0A0A">validate</text>
  <text x="174" y="84" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A">schema + dedup</text>

  <path d="M212 75 L238 75" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M234 71 L238 75 L234 79" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- Transform -->
  <rect x="238" y="58" width="80" height="34" rx="5" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" fill-opacity="0.85"/>
  <text x="278" y="73" text-anchor="middle" font-family="Outfit,monospace" font-size="8" font-weight="700" fill="#fff">transform</text>
  <text x="278" y="84" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.6)">Bronze→Gold</text>

  <path d="M318 75 L344 75" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M340 71 L344 75 L340 79" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- Load -->
  <rect x="344" y="58" width="112" height="34" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="400" y="73" text-anchor="middle" font-family="Outfit,monospace" font-size="8" font-weight="700" fill="#0A0A0A">load_snowflake</text>
  <text x="400" y="84" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A">50M+ rows / day</text>

  <!-- Medallion layers -->
  <path d="M14 110 L466 110" stroke="#0A0A0A" stroke-width="1" opacity="0.15"/>
  <rect x="30" y="118" width="80" height="22" rx="11" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <text x="70" y="132" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" fill="#0A0A0A" opacity="0.6">🥉 Bronze</text>

  <path d="M120 129 L190 129" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="3 3" opacity="0.25"/>

  <rect x="196" y="118" width="80" height="22" rx="11" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <text x="236" y="132" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" fill="#0A0A0A" opacity="0.7">🥈 Silver</text>

  <path d="M286 129 L358 129" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="3 3" opacity="0.25"/>

  <rect x="362" y="118" width="80" height="22" rx="11" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <text x="402" y="132" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A">🥇 Gold</text>

  <!-- Volume badge -->
  <rect x="182" y="158" width="116" height="24" rx="12" fill="#0A0A0A" opacity="0.85"/>
  <text x="240" y="174" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">50M+ records / run</text>
</svg>`,

  // ── RabbitMQ Async Process in Heroku ───────────────────────────────
  'async-heroku-processes': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Salesforce (left) -->
  <rect x="18" y="60" width="108" height="80" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="72" y="88" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <text x="72" y="102" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Apex Trigger</text>
  <!-- Apex code hint -->
  <text x="30" y="118" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">HttpRequest req</text>
  <text x="30" y="130" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">= new HttpReq();</text>

  <!-- Arrow: SF → RabbitMQ -->
  <path d="M126 96 L164 96" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M160 92 L164 96 L160 100" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="145" y="90" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">publish</text>

  <!-- RabbitMQ Exchange (center) -->
  <rect x="164" y="42" width="152" height="116" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="240" y="64" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">RabbitMQ</text>
  <!-- Exchange symbol -->
  <rect x="210" y="72" width="60" height="26" rx="4" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <text x="240" y="89" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.8">exchange</text>
  <!-- Queue stacks (envelopes) -->
  <rect x="180" y="106" width="30" height="20" rx="3" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <path d="M180 106 L195 116 L210 106" stroke="#0A0A0A" stroke-width="1" opacity="0.5"/>
  <rect x="215" y="106" width="30" height="20" rx="3" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <path d="M215 106 L230 116 L245 106" stroke="#0A0A0A" stroke-width="1" opacity="0.4"/>
  <rect x="250" y="106" width="30" height="20" rx="3" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M250 106 L265 116 L280 106" stroke="#0A0A0A" stroke-width="1" opacity="0.35"/>
  <text x="240" y="142" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">message queue</text>
  <text x="240" y="152" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">3 pending jobs</text>

  <!-- Arrow: RabbitMQ → Heroku -->
  <path d="M316 96 L356 96" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M352 92 L356 96 L352 100" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="336" y="90" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">consume</text>

  <!-- Heroku Worker (right) -->
  <rect x="356" y="60" width="108" height="80" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="410" y="88" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Heroku</text>
  <text x="410" y="102" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Worker Dyno</text>
  <!-- Processing indicator -->
  <circle cx="410" cy="118" r="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M406 118 C406 114 414 114 414 118" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
  <text x="410" y="137" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.6">processing...</text>

  <!-- Return callback (bottom) -->
  <path d="M410 140 L410 170 L72 170 L72 140" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.3"/>
  <text x="240" y="183" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A" opacity="0.6">async callback → update SF record</text>
</svg>`,

  // ── Heroku or AWS: Decision Framework ──────────────────────────────
  'heroku-or-aws-how-to-choose': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Input factors (left column) -->
  <rect x="18" y="10" width="96" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <text x="66" y="28" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" opacity="0.65">SF coupling</text>

  <rect x="18" y="50" width="96" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="66" y="68" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" opacity="0.75">Team size</text>

  <rect x="18" y="90" width="96" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="66" y="108" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" opacity="0.75">Cost model</text>

  <rect x="18" y="130" width="96" height="26" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.7"/>
  <text x="66" y="148" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" opacity="0.75">Compliance</text>

  <!-- Arrows from inputs to ASSESS box -->
  <path d="M114 23 L172 88" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="4 3" opacity="0.25"/>
  <path d="M114 63 L172 94" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
  <path d="M114 103 L172 100" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
  <path d="M114 143 L172 110" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="4 3" opacity="0.25"/>

  <!-- Central ASSESS box -->
  <rect x="172" y="72" width="108" height="58" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.85" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="226" y="97" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.8">ASSESS</text>
  <text x="226" y="113" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A" opacity="0.65">CloudAlgo review</text>

  <!-- Fork: upper arrow to Heroku -->
  <path d="M280 88 L326 62" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M322 59 L326 62 L323 66" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- Heroku box (top right) -->
  <rect x="326" y="34" width="130" height="54" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <text x="391" y="56" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.8">Heroku</text>
  <text x="391" y="70" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A" opacity="0.65">simple ops · SF-native</text>
  <text x="391" y="81" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.5">git push · Connect built-in</text>

  <!-- Fork: lower arrow to AWS -->
  <path d="M280 114 L326 140" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M322 137 L326 140 L323 144" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

  <!-- AWS box (bottom right) -->
  <rect x="326" y="114" width="130" height="54" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <text x="391" y="136" text-anchor="middle" font-family="Outfit,sans-serif" font-size="10" font-weight="700" fill="#0A0A0A" opacity="0.8">AWS</text>
  <text x="391" y="150" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A" opacity="0.65">fine control · compliance</text>
  <text x="391" y="161" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.5">ECS / Lambda / RDS</text>
</svg>`,

  // ── Heroku Connect at Scale: Failure Modes ─────────────────────────
  'heroku-connect-at-scale': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- PostgreSQL cylinder (left) -->
  <ellipse cx="88" cy="58" rx="48" ry="13" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <line x1="40" y1="58" x2="40" y2="132" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <line x1="136" y1="58" x2="136" y2="132" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <ellipse cx="88" cy="132" rx="48" ry="13" stroke="#0A0A0A" stroke-width="1.5" opacity="0.8"/>
  <ellipse cx="88" cy="76" rx="48" ry="13" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="88" y="118" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">PostgreSQL</text>
  <text x="88" y="158" text-anchor="middle" font-family="Outfit,monospace" font-size="8" fill="#5A5A5A" opacity="0.55">50k rows/hr</text>

  <!-- HC bridge (centre) -->
  <rect x="184" y="74" width="88" height="46" rx="6" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="228" y="94" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">HEROKU</text>
  <text x="228" y="108" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">CONNECT</text>

  <!-- Warning triangle above HC bridge -->
  <path d="M228 44 L216 64 L240 64 Z" stroke="#0A0A0A" stroke-width="1.5" stroke-linejoin="round" opacity="0.75"/>
  <text x="228" y="61" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.8">!</text>

  <!-- Sync arrows Postgres → HC (left side) -->
  <path d="M136 88 L184 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M180 86 L184 90 L180 94" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <path d="M136 108 L184 108" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.3"/>

  <!-- API limit bar below HC -->
  <rect x="188" y="130" width="80" height="8" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <rect x="188" y="130" width="67" height="8" rx="3" fill="#0A0A0A" fill-opacity="0.45"/>
  <text x="228" y="151" text-anchor="middle" font-family="Outfit,monospace" font-size="7.5" fill="#5A5A5A" opacity="0.6">API limit 84%</text>

  <!-- Sync arrows HC → Salesforce (right side, one broken) -->
  <path d="M272 90 L316 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M312 86 L316 90 L312 94" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <!-- broken return line with X -->
  <path d="M272 108 L295 108" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.3"/>
  <path d="M300 104 L308 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M308 104 L300 112" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>

  <!-- Salesforce cloud (right) -->
  <path d="M352 90 C336 90 324 80 324 68 C324 59 330 52 339 50 C341 42 349 36 358 36 C365 36 371 40 374 46 C378 44 383 43 388 43 C402 43 413 53 413 66 C413 79 402 89 388 89 Z"
        stroke="#0A0A0A" stroke-width="2" opacity="0.8"/>
  <text x="368" y="115" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.7">Salesforce</text>
  <text x="368" y="155" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A" opacity="0.5">duplicate records</text>
  <text x="368" y="167" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.4">no External ID</text>
</svg>`,

  // ── When Your EMR Has No API (Puppeteer + RabbitMQ + Heroku) ────────
  'when-your-emr-has-no-api': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Salesforce (left) -->
  <rect x="20" y="64" width="80" height="72" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="60" y="90" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <text x="60" y="103" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">CRM</text>
  <text x="60" y="120" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">Apex trigger</text>
  <text x="60" y="131" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">+ REST callback</text>
  <!-- Arrow: SF → Queue -->
  <path d="M100 100 L126 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M122 96 L126 100 L122 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="113" y="93" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">publish</text>
  <!-- RabbitMQ Queue -->
  <rect x="126" y="64" width="98" height="72" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75" fill="#0A0A0A" fill-opacity="0.03"/>
  <text x="175" y="87" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">RabbitMQ</text>
  <rect x="141" y="95" width="24" height="16" rx="3" stroke="#0A0A0A" stroke-width="1.5" opacity="0.6"/>
  <path d="M141 95 L153 103 L165 95" stroke="#0A0A0A" stroke-width="1" opacity="0.4"/>
  <rect x="169" y="95" width="24" height="16" rx="3" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M169 95 L181 103 L193 95" stroke="#0A0A0A" stroke-width="1" opacity="0.3"/>
  <text x="175" y="126" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.55">CloudAMQP</text>
  <!-- Arrow: Queue → Worker -->
  <path d="M224 100 L250 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M246 96 L250 100 L246 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="237" y="93" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">consume</text>
  <!-- Heroku Worker -->
  <rect x="250" y="64" width="92" height="72" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="296" y="87" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Heroku</text>
  <text x="296" y="99" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">Worker</text>
  <text x="296" y="116" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">Puppeteer</text>
  <text x="296" y="127" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#5A5A5A" opacity="0.6">headless Chrome</text>
  <!-- Arrow: Worker → EMR -->
  <path d="M342 100 L360 100" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M356 96 L360 100 L356 104" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="351" y="93" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">automate</text>
  <!-- Fusion EMR Portal (solid black) -->
  <rect x="360" y="64" width="102" height="72" rx="8" fill="#0A0A0A" opacity="0.85"/>
  <text x="411" y="88" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff" opacity="0.9">Fusion EMR</text>
  <text x="411" y="101" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="rgba(255,255,255,0.55)">web portal</text>
  <text x="411" y="117" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.35)">no public API</text>
  <text x="411" y="128" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.35)">browser-only</text>
  <!-- Callback arc (bottom) -->
  <path d="M411 136 L411 162 L60 162 L60 136" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.3"/>
  <path d="M56 140 L60 136 L64 140" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
  <text x="240" y="177" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A" opacity="0.5">Fusion patient ID → Salesforce Apex callback</text>
</svg>`,

  // ── Salesforce + Heroku Architecture Patterns ──────────────────────
  'salesforce-heroku-architecture-patterns': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Column headers -->
  <text x="76" y="16" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.55" letter-spacing="0.06em">REST API</text>
  <text x="240" y="16" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.55" letter-spacing="0.06em">PLATFORM EVENTS</text>
  <text x="404" y="16" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A" opacity="0.55" letter-spacing="0.06em">RABBITMQ</text>

  <!-- Column dividers -->
  <line x1="158" y1="8" x2="158" y2="192" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="3 4" opacity="0.12"/>
  <line x1="322" y1="8" x2="322" y2="192" stroke="#0A0A0A" stroke-width="1" stroke-dasharray="3 4" opacity="0.12"/>

  <!-- ── Column 1: REST API ── -->
  <rect x="14" y="28" width="54" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="41" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.75">SF Apex</text>
  <!-- arrow -->
  <path d="M68 42 L88 42" stroke="#0A0A0A" stroke-width="1.5" opacity="0.5"/>
  <path d="M84 38 L88 42 L84 46" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <text x="78" y="36" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.55">HTTP</text>
  <rect x="88" y="28" width="54" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="115" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.75">Heroku</text>
  <!-- traits -->
  <text x="76" y="76" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#0A0A0A" opacity="0.65">Synchronous</text>
  <text x="76" y="96" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Easy to debug</text>
  <text x="76" y="109" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Any dev can read</text>
  <text x="76" y="130" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− 120s timeout</text>
  <text x="76" y="143" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− 100 callout limit</text>
  <text x="76" y="164" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.35">Best for small teams</text>

  <!-- ── Column 2: Platform Events ── -->
  <rect x="178" y="28" width="50" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="203" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <!-- event bus pill -->
  <rect x="234" y="36" width="48" height="14" rx="5" stroke="#0A0A0A" stroke-width="1" opacity="0.5"/>
  <text x="258" y="47" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.65">event bus</text>
  <path d="M228 43 L234 43" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M282 43 L288 43" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M284 39 L288 43 L284 47" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <rect x="288" y="28" width="50" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="313" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.75">Heroku</text>
  <!-- traits -->
  <text x="240" y="76" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#0A0A0A" opacity="0.65">Asynchronous</text>
  <text x="240" y="96" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Decoupled</text>
  <text x="240" y="109" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Scales well</text>
  <text x="240" y="130" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− 72hr replay window</text>
  <text x="240" y="143" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− Reconnect handling</text>
  <text x="240" y="164" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.35">Best for integration teams</text>

  <!-- ── Column 3: RabbitMQ ── -->
  <rect x="342" y="28" width="50" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="367" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="600" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <!-- queue box -->
  <rect x="396" y="34" width="36" height="18" rx="4" stroke="#0A0A0A" stroke-width="1" opacity="0.5"/>
  <text x="414" y="44" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.65">queue</text>
  <text x="414" y="52" text-anchor="middle" font-family="Outfit,monospace" font-size="5.5" fill="#5A5A5A" opacity="0.45">durable</text>
  <path d="M392 43 L396 43" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M432 43 L450 43" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M446 39 L450 43 L446 47" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <!-- Heroku box (right edge) - shift left slightly -->
  <rect x="344" y="28" width="0" height="0"/>
  <rect x="434" y="28" width="32" height="28" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="450" y="47" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" font-weight="600" fill="#0A0A0A" opacity="0.75">Heroku</text>
  <!-- traits -->
  <text x="404" y="76" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#0A0A0A" opacity="0.65">Guaranteed</text>
  <text x="404" y="96" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Survives restart</text>
  <text x="404" y="109" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.55">+ Back-pressure</text>
  <text x="404" y="130" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− Broker to operate</text>
  <text x="404" y="143" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.4">− Complex setup</text>
  <text x="404" y="164" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7" fill="#5A5A5A" opacity="0.35">Best for regulated env</text>
</svg>`,

  // ── Health Portal ↔ MuleSoft ↔ Salesforce + Logistics ────────────
  'health-portal-mulesoft-integration': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Health Portal (left) -->
  <rect x="14" y="46" width="106" height="100" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="67" y="70" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Health Portal</text>
  <text x="67" y="84" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A">Member journeys</text>
  <text x="67" y="102" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.6">X-Client-ID auth</text>
  <text x="67" y="114" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">orders · cases</text>
  <text x="67" y="126" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.5">registration</text>
  <!-- Bidirectional arrows Portal ↔ MuleSoft -->
  <path d="M120 82 L164 82" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <path d="M160 78 L164 82 L160 86" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M164 108 L120 108" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.35"/>
  <path d="M124 104 L120 108 L124 112" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  <text x="142" y="76" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.55">journeys</text>
  <text x="142" y="120" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.45">cases</text>
  <!-- MuleSoft Anypoint (center) -->
  <rect x="164" y="36" width="152" height="124" rx="8" stroke="#0A0A0A" stroke-width="2" opacity="0.85" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="240" y="58" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.85">MULESOFT ANYPOINT</text>
  <text x="240" y="71" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A">CloudHub · 8 applications</text>
  <rect x="176" y="82" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="92" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">DataWeave · Object Store v2</text>
  <rect x="176" y="100" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="110" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">Bulk API v2 · Portal_ID__c</text>
  <rect x="176" y="118" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="128" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">Integration_Timestamp__c</text>
  <!-- Arrows MuleSoft ↔ Salesforce + Logistics -->
  <path d="M316 72 L360 72" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <path d="M356 68 L360 72 L356 76" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M360 90 L316 90" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.35"/>
  <path d="M320 86 L316 90 L320 94" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  <path d="M316 126 L360 126" stroke="#0A0A0A" stroke-width="1.5" opacity="0.45"/>
  <path d="M356 122 L360 126 L356 130" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  <!-- Salesforce CRM (top right) -->
  <rect x="360" y="46" width="106" height="60" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="413" y="68" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <text x="413" y="81" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">CRM</text>
  <text x="413" y="96" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">Person Accounts</text>
  <!-- Logistics Platform (bottom right, filled) -->
  <rect x="360" y="116" width="106" height="60" rx="8" fill="#0A0A0A" opacity="0.85"/>
  <text x="413" y="138" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff" opacity="0.9">Logistics</text>
  <text x="413" y="152" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="rgba(255,255,255,0.55)">SLP Platform</text>
  <text x="413" y="167" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="rgba(255,255,255,0.35)">kits · tracking</text>
  <!-- Bottom metric badge -->
  <rect x="164" y="172" width="152" height="20" rx="10" fill="#0A0A0A" opacity="0.85"/>
  <text x="240" y="186" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">5 min kit tracking sync</text>
</svg>`,

  // ── Salesforce ↔ NetSuite via MuleSoft ────────────────────────────
  'salesforce-netsuite-mulesoft-integration': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Salesforce (left) -->
  <rect x="14" y="46" width="106" height="100" rx="8" stroke="#0A0A0A" stroke-width="1.5" opacity="0.75"/>
  <text x="67" y="70" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.75">Salesforce</text>
  <text x="67" y="83" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#5A5A5A">CRM</text>
  <text x="67" y="102" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.6">AccountsEvent__e</text>
  <text x="67" y="114" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.55">Create_NS_Order__e</text>
  <text x="67" y="126" text-anchor="middle" font-family="Outfit,monospace" font-size="6.5" fill="#5A5A5A" opacity="0.5">Payment_Event__e</text>

  <!-- Arrows SF ↔ MuleSoft -->
  <path d="M120 82 L164 82" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <path d="M160 78 L164 82 L160 86" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M164 108 L120 108" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.35"/>
  <path d="M124 104 L120 108 L124 112" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  <text x="142" y="76" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.55">events</text>

  <!-- MuleSoft Anypoint (center) -->
  <rect x="164" y="36" width="152" height="124" rx="8" stroke="#0A0A0A" stroke-width="2" opacity="0.85" fill="#0A0A0A" fill-opacity="0.04"/>
  <text x="240" y="58" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#0A0A0A" opacity="0.85">MULESOFT ANYPOINT</text>
  <text x="240" y="71" text-anchor="middle" font-family="Outfit,sans-serif" font-size="7.5" fill="#5A5A5A">CloudHub · 4 flows</text>
  <rect x="176" y="82" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="92" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">DataWeave · SOAP/XML · REST</text>
  <rect x="176" y="100" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="110" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">Object Store watermarks</text>
  <rect x="176" y="118" width="128" height="14" rx="3" stroke="#0A0A0A" stroke-width="1" opacity="0.25"/>
  <text x="240" y="128" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.65">Bidirectional ID writeback</text>

  <!-- Arrows MuleSoft ↔ NetSuite -->
  <path d="M316 82 L360 82" stroke="#0A0A0A" stroke-width="1.5" opacity="0.55"/>
  <path d="M356 78 L360 82 L356 86" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
  <path d="M360 108 L316 108" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.35"/>
  <path d="M320 104 L316 108 L320 112" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  <text x="338" y="76" text-anchor="middle" font-family="Outfit,monospace" font-size="6" fill="#5A5A5A" opacity="0.55">orders</text>

  <!-- NetSuite ERP (right, filled) -->
  <rect x="360" y="46" width="106" height="100" rx="8" fill="#0A0A0A" opacity="0.85"/>
  <text x="413" y="70" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff" opacity="0.9">NetSuite</text>
  <text x="413" y="83" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="rgba(255,255,255,0.55)">ERP</text>
  <text x="413" y="102" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.45)">Sales Orders</text>
  <text x="413" y="114" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.4)">Customers</text>
  <text x="413" y="126" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="rgba(255,255,255,0.35)">Invoices · Payments</text>

  <!-- Bottom metric badge -->
  <rect x="164" y="172" width="152" height="20" rx="10" fill="#0A0A0A" opacity="0.85"/>
  <text x="240" y="186" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="#fff">0 manual re-entry</text>
</svg>`,

  // ── Salesforce Field Impact Analyser ───────────────────────────────
  'salesforce-field-impact-analyser': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Terminal window (left) -->
  <rect x="12" y="12" width="214" height="176" rx="8" fill="white" fill-opacity="0.5" stroke="#0A0A0A" stroke-opacity="0.10" stroke-width="1.5"/>
  <rect x="12" y="12" width="214" height="26" rx="8" fill="#0A0A0A" fill-opacity="0.06"/>
  <rect x="12" y="30" width="214" height="8" fill="#0A0A0A" fill-opacity="0.06"/>
  <line x1="12" y1="38" x2="226" y2="38" stroke="#0A0A0A" stroke-opacity="0.07" stroke-width="1"/>
  <circle cx="28" cy="25" r="4" fill="#0A0A0A" fill-opacity="0.14"/>
  <circle cx="42" cy="25" r="4" fill="#0A0A0A" fill-opacity="0.14"/>
  <circle cx="56" cy="25" r="4" fill="#0A0A0A" fill-opacity="0.14"/>
  <text x="119" y="29" font-family="Outfit,system-ui,sans-serif" font-size="9" fill="#0A0A0A" fill-opacity="0.26" text-anchor="middle" letter-spacing="0.05em">sf-field-impact.sh</text>
  <text x="22" y="54" font-family="'Courier New',monospace" font-size="8.5" fill="#0A0A0A" fill-opacity="0.28">$</text>
  <text x="30" y="54" font-family="'Courier New',monospace" font-size="8.5" fill="#0A0A0A" fill-opacity="0.48">./sf-field-impact.sh</text>
  <!-- Pass rows -->
  <g class="sfia-passes">
    <circle cx="26" cy="70" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,70 L25,72.5 L29.5,67" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="74" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 1/7 · dep graph</text>
    <circle cx="26" cy="90" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,90 L25,92.5 L29.5,87" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="94" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 2/7 · Apex/LWC/Aura</text>
    <circle cx="26" cy="110" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,110 L25,112.5 L29.5,107" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="114" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 3/7 · FieldPermissions</text>
    <circle cx="26" cy="130" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,130 L25,132.5 L29.5,127" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="134" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 4/7 · Custom Labels</text>
    <circle cx="26" cy="148" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,148 L25,150.5 L29.5,145" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="152" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 5/7 · Static Resources</text>
    <circle cx="26" cy="165" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,165 L25,167.5 L29.5,162" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="169" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 6/7 · Email Templates</text>
    <circle cx="26" cy="182" r="6.5" fill="#0A0A0A" fill-opacity="0.76"/>
    <path d="M22.5,182 L25,184.5 L29.5,179" stroke="#F5F5F2" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="38" y="186" font-family="Outfit,system-ui,sans-serif" font-size="9" font-weight="600" fill="#0A0A0A" fill-opacity="0.80">Pass 7/7 · Workflow Updates</text>
  </g>
  <!-- Field dependency map (right) -->
  <!-- Account box -->
  <rect x="248" y="14" width="148" height="36" rx="7" fill="#0A0A0A" fill-opacity="0.85"/>
  <text x="322" y="37" font-family="Outfit,system-ui,sans-serif" font-size="13" font-weight="700" fill="#F5F5F2" text-anchor="middle" letter-spacing="0.05em">Account</text>
  <!-- Tree -->
  <line x1="322" y1="50" x2="322" y2="70" stroke="#0A0A0A" stroke-opacity="0.14" stroke-width="1.5"/>
  <line x1="280" y1="70" x2="450" y2="70" stroke="#0A0A0A" stroke-opacity="0.10" stroke-width="1.5"/>
  <line x1="280" y1="70" x2="280" y2="86" stroke="#0A0A0A" stroke-opacity="0.14" stroke-width="1.5"/>
  <line x1="368" y1="70" x2="368" y2="86" stroke="#0A0A0A" stroke-opacity="0.09" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="450" y1="70" x2="450" y2="86" stroke="#0A0A0A" stroke-opacity="0.14" stroke-width="1.5"/>
  <!-- Field 1: found_in_code -->
  <rect x="244" y="86" width="74" height="42" rx="5" fill="#0A0A0A" fill-opacity="0.06" stroke="#0A0A0A" stroke-opacity="0.28" stroke-width="1"/>
  <text x="250" y="102" font-family="'Courier New',monospace" font-size="7.5" fill="#0A0A0A" fill-opacity="0.70">Is_Mandatory_</text>
  <text x="250" y="113" font-family="'Courier New',monospace" font-size="7.5" fill="#0A0A0A" fill-opacity="0.70">Workshop__c</text>
  <g class="sfia-badge">
    <rect x="250" y="117" width="62" height="9" rx="4.5" fill="#0A0A0A" fill-opacity="0.72"/>
    <text x="281" y="124.5" font-family="Outfit,system-ui,sans-serif" font-size="6.5" font-weight="700" fill="#F5F5F2" text-anchor="middle" letter-spacing="0.06em">FOUND IN CODE</text>
  </g>
  <!-- Field 2: no_reference (dashed) -->
  <rect x="330" y="86" width="74" height="42" rx="5" fill="#0A0A0A" fill-opacity="0.02" stroke="#0A0A0A" stroke-opacity="0.12" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="336" y="102" font-family="'Courier New',monospace" font-size="7.5" fill="#0A0A0A" fill-opacity="0.26">Lead_Source_</text>
  <text x="336" y="113" font-family="'Courier New',monospace" font-size="7.5" fill="#0A0A0A" fill-opacity="0.26">Old__c</text>
  <rect x="336" y="117" width="42" height="9" rx="4.5" fill="#0A0A0A" fill-opacity="0.10"/>
  <text x="357" y="124.5" font-family="Outfit,system-ui,sans-serif" font-size="6.5" font-weight="700" fill="#0A0A0A" fill-opacity="0.42" text-anchor="middle" letter-spacing="0.06em">SAFE DEL</text>
  <!-- Field 3: in perms -->
  <rect x="418" y="86" width="54" height="42" rx="5" fill="#0A0A0A" fill-opacity="0.04" stroke="#0A0A0A" stroke-opacity="0.18" stroke-width="1"/>
  <text x="423" y="102" font-family="'Courier New',monospace" font-size="7" fill="#0A0A0A" fill-opacity="0.50">Stage_</text>
  <text x="423" y="113" font-family="'Courier New',monospace" font-size="7" fill="#0A0A0A" fill-opacity="0.50">Override</text>
  <rect x="423" y="117" width="44" height="9" rx="4.5" fill="#0A0A0A" fill-opacity="0.35"/>
  <text x="445" y="124.5" font-family="Outfit,system-ui,sans-serif" font-size="6.5" font-weight="700" fill="#F5F5F2" text-anchor="middle" letter-spacing="0.06em">IN PERMS</text>
  <!-- Stat blocks -->
  <rect x="248" y="146" width="110" height="46" rx="7" fill="#0A0A0A" fill-opacity="0.04" stroke="#0A0A0A" stroke-opacity="0.08" stroke-width="1"/>
  <text x="260" y="172" font-family="Outfit,system-ui,sans-serif" font-size="28" font-weight="900" fill="#0A0A0A" fill-opacity="0.82">46</text>
  <text x="260" y="184" font-family="Outfit,system-ui,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A" fill-opacity="0.32" letter-spacing="0.06em">SAFE TO DELETE</text>
  <rect x="364" y="146" width="108" height="46" rx="7" fill="#0A0A0A" fill-opacity="0.04" stroke="#0A0A0A" stroke-opacity="0.08" stroke-width="1"/>
  <text x="376" y="172" font-family="Outfit,system-ui,sans-serif" font-size="28" font-weight="900" fill="#0A0A0A" fill-opacity="0.82">162</text>
  <text x="376" y="184" font-family="Outfit,system-ui,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A" fill-opacity="0.32" letter-spacing="0.06em">IN SOURCE CODE</text>
</svg>`,

  // ── Apex Lint — offline Apex static analysis ────────────────────────
  'apex-lint': `
<svg viewBox="0 0 480 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="blog-svg-illus" aria-hidden="true">
  <!-- Apex file icon (left) -->
  <rect x="14" y="22" width="100" height="130" rx="6" stroke="#0A0A0A" stroke-width="1.5" fill="white" fill-opacity="0.35" opacity="0.72"/>
  <!-- Folded corner -->
  <path d="M88 22 L114 48 L88 48 Z" stroke="#0A0A0A" stroke-width="1" fill="#0A0A0A" fill-opacity="0.05" opacity="0.4"/>
  <!-- .cls label -->
  <text x="64" y="50" text-anchor="middle" font-family="Outfit,sans-serif" font-size="12" font-weight="700" fill="#0A0A0A" opacity="0.62">.cls</text>
  <!-- Code line stubs -->
  <rect x="24" y="62" width="62" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.20"/>
  <rect x="28" y="74" width="72" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.13"/>
  <rect x="24" y="86" width="50" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.18"/>
  <rect x="28" y="98" width="66" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.10"/>
  <rect x="28" y="110" width="52" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.16"/>
  <rect x="24" y="122" width="68" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.09"/>
  <rect x="24" y="134" width="44" height="5" rx="2" fill="#0A0A0A" fill-opacity="0.14"/>

  <!-- Arrow 1: file → AST -->
  <path d="M114 90 L152 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0.38" stroke-dasharray="4 3"/>
  <path d="M148 86 L152 90 L148 94" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>
  <text x="133" y="108" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.35">parse</text>

  <!-- AST tree (middle, x=152-308) -->
  <!-- Root node: MethodDecl -->
  <rect x="194" y="38" width="82" height="22" rx="5" fill="#0A0A0A" fill-opacity="0.85"/>
  <text x="235" y="53" text-anchor="middle" font-family="Outfit,monospace" font-size="8.5" font-weight="700" fill="white">MethodDecl</text>
  <!-- Tree connectors -->
  <line x1="235" y1="60" x2="197" y2="76" stroke="#0A0A0A" stroke-opacity="0.28" stroke-width="1.2"/>
  <line x1="235" y1="60" x2="278" y2="76" stroke="#0A0A0A" stroke-opacity="0.28" stroke-width="1.2"/>
  <!-- Left child: SOQLQuery (highlighted) -->
  <rect x="168" y="76" width="58" height="18" rx="4" stroke="#0A0A0A" stroke-width="1.5" fill="#0A0A0A" fill-opacity="0.08" opacity="0.85"/>
  <text x="197" y="88" text-anchor="middle" font-family="Outfit,monospace" font-size="7.5" fill="#0A0A0A" opacity="0.80">SOQLQuery</text>
  <!-- Right child: ForLoop -->
  <rect x="248" y="76" width="60" height="18" rx="4" stroke="#0A0A0A" stroke-width="1.2" fill-opacity="0" opacity="0.52"/>
  <text x="278" y="88" text-anchor="middle" font-family="Outfit,monospace" font-size="7.5" fill="#0A0A0A" opacity="0.52">ForLoop</text>
  <!-- Left leaf connector -->
  <line x1="197" y1="94" x2="197" y2="108" stroke="#0A0A0A" stroke-opacity="0.20" stroke-width="1"/>
  <!-- Left leaf: Identifier -->
  <rect x="168" y="108" width="58" height="16" rx="3" stroke="#0A0A0A" stroke-width="1" fill-opacity="0" opacity="0.32"/>
  <text x="197" y="119" text-anchor="middle" font-family="Outfit,monospace" font-size="7" fill="#0A0A0A" opacity="0.36">Identifier</text>
  <!-- TAINT badge over SOQLQuery node -->
  <rect x="218" y="70" width="38" height="12" rx="6" fill="#0A0A0A" fill-opacity="0.75"/>
  <text x="237" y="79.5" text-anchor="middle" font-family="Outfit,sans-serif" font-size="6.5" font-weight="700" fill="white" letter-spacing="0.04em">TAINT</text>

  <!-- Arrow 2: AST → findings -->
  <path d="M310 90 L328 90" stroke="#0A0A0A" stroke-width="1.5" opacity="0.38" stroke-dasharray="4 3"/>
  <path d="M324 86 L328 90 L324 94" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>
  <text x="319" y="108" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" fill="#0A0A0A" opacity="0.35">lint</text>

  <!-- Findings (right, x=332-466) -->
  <!-- CRITICAL -->
  <rect x="332" y="36" width="134" height="30" rx="5" fill="#0A0A0A" fill-opacity="0.86"/>
  <text x="345" y="50" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="white" letter-spacing="0.08em">CRITICAL</text>
  <text x="345" y="61" font-family="Outfit,monospace" font-size="8" fill="white" opacity="0.70">ApexSOQLInjection</text>
  <!-- HIGH 1 -->
  <rect x="332" y="74" width="134" height="30" rx="5" stroke="#0A0A0A" stroke-width="1.5" opacity="0.76"/>
  <text x="345" y="88" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A" opacity="0.78" letter-spacing="0.08em">HIGH</text>
  <text x="345" y="99" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.56">SoqlInLoop</text>
  <!-- HIGH 2 -->
  <rect x="332" y="112" width="134" height="30" rx="5" stroke="#0A0A0A" stroke-width="1.2" opacity="0.52"/>
  <text x="345" y="126" font-family="Outfit,sans-serif" font-size="7" font-weight="700" fill="#0A0A0A" opacity="0.60" letter-spacing="0.08em">HIGH</text>
  <text x="345" y="137" font-family="Outfit,monospace" font-size="8" fill="#0A0A0A" opacity="0.44">DmlInLoop</text>

  <!-- Bottom badge -->
  <rect x="106" y="168" width="268" height="22" rx="11" fill="#0A0A0A" fill-opacity="0.85"/>
  <text x="240" y="183" text-anchor="middle" font-family="Outfit,sans-serif" font-size="9" font-weight="700" fill="white" letter-spacing="0.05em">41 rules · ANTLR grammar · Pure Node.js</text>
</svg>`,

};

/**
 * Returns an SVG illustration string for a blog post slug.
 * Matches by checking if the slug contains a known keyword pattern.
 */
export function getBlogIllustration(slug: string): string {
  for (const [key, svg] of Object.entries(illustrations)) {
    if (slug.includes(key)) return svg;
  }
  return '';
}
