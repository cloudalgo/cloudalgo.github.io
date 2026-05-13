# About Page Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new sections to the About page — Core Values, How We Work, and Certifications & Tech Stack — using inline SVG line-art illustrations and the existing site palette.

**Architecture:** All markup goes directly in `src/pages/about.astro` following the existing inline-section pattern. No new component files. `StatsBar` is moved to after all three new sections.

**Tech Stack:** Astro 6, Tailwind CSS v4, Outfit font, inline SVG (line-art, `stroke:#0A0A0A`, no fill), existing `anim-fade-up` / `anim-scale-pop` scroll animation classes.

---

### Task 1: Core Values section

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Insert Core Values section after the Industries section and before `<StatsBar />`**

Replace:
```astro
  <StatsBar />
```

With the following (Core Values section first, then StatsBar at end — we'll add the other sections in subsequent tasks):

```astro
  <!-- Core Values -->
  <section style="background:#fff;padding:5rem 0;border-bottom:1px solid #E0E0DC;">
    <div class="container">
      <p class="section-label anim-fade-up">How we work</p>
      <h2 class="anim-fade-up" style="font-size:clamp(2rem,3vw,2.75rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:3rem;transition-delay:0.05s;">
        Built on three core principles.
      </h2>
      <div class="row">

        <div class="col-lg-4 col-md-6 anim-scale-pop" style="transition-delay:0s;margin-bottom:1.5rem;">
          <div style="background:#F5F5F2;border:1px solid #E0E0DC;border-radius:12px;padding:1.75rem;height:100%;">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="display:block;margin-bottom:1rem;" aria-hidden="true">
              <rect x="3" y="3" width="30" height="30" rx="4" stroke="#0A0A0A" stroke-width="2"/>
              <path d="M10 18h16M18 10v16" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3 style="font-size:1rem;font-weight:800;margin-bottom:0.5rem;">Clean architecture</h3>
            <p class="paragraph-small" style="color:#5A5A5A;line-height:1.6;">No over-engineered orgs. Solutions built to last, not to impress.</p>
          </div>
        </div>

        <div class="col-lg-4 col-md-6 anim-scale-pop" style="transition-delay:0.05s;margin-bottom:1.5rem;">
          <div style="background:#F5F5F2;border:1px solid #E0E0DC;border-radius:12px;padding:1.75rem;height:100%;">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="display:block;margin-bottom:1rem;" aria-hidden="true">
              <circle cx="18" cy="18" r="14" stroke="#0A0A0A" stroke-width="2"/>
              <path d="M12 18l4 4 8-8" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="font-size:1rem;font-weight:800;margin-bottom:0.5rem;">On-time delivery</h3>
            <p class="paragraph-small" style="color:#5A5A5A;line-height:1.6;">We scope carefully and commit to timelines that are real — not aspirational.</p>
          </div>
        </div>

        <div class="col-lg-4 col-md-6 anim-scale-pop" style="transition-delay:0.1s;margin-bottom:1.5rem;">
          <div style="background:#F5F5F2;border:1px solid #E0E0DC;border-radius:12px;padding:1.75rem;height:100%;">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="display:block;margin-bottom:1rem;" aria-hidden="true">
              <path d="M6 28C6 20 12 14 18 14C24 14 30 20 30 28" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round"/>
              <circle cx="18" cy="10" r="4" stroke="#0A0A0A" stroke-width="2"/>
              <path d="M12 28C12 24 15 21 18 21C21 21 24 24 24 28" stroke="#0A0A0A" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3 style="font-size:1rem;font-weight:800;margin-bottom:0.5rem;">Collaborative by default</h3>
            <p class="paragraph-small" style="color:#5A5A5A;line-height:1.6;">We work beside your team, not around them. Knowledge transfer is part of every project.</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <StatsBar />
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```
Expected: `dist/` built with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): add Core Values section"
```

---

### Task 2: How We Work section

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Insert How We Work section between Core Values and StatsBar**

Replace:
```astro
  <StatsBar />
```

With:

```astro
  <!-- How We Work -->
  <section style="background:#F5F5F2;padding:5rem 0;border-bottom:1px solid #E0E0DC;">
    <div class="container">
      <p class="section-label anim-fade-up">Engagement model</p>
      <h2 class="anim-fade-up" style="font-size:clamp(2rem,3vw,2.75rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:3rem;transition-delay:0.05s;">
        How a project with us actually runs.
      </h2>
      <div class="row align-items-center" style="gap:3rem 0;">

        <!-- Steps -->
        <div class="col-lg-6">
          <div style="display:flex;flex-direction:column;gap:2rem;">

            {[
              { num: '01', title: 'Discovery', body: 'We map your processes, data model, and goals before writing a single line of configuration.' },
              { num: '02', title: 'Architecture', body: 'We design the solution blueprint and validate it with your team before build starts.' },
              { num: '03', title: 'Build & iterate', body: 'Agile sprints with weekly demos. You see real progress from week one.' },
              { num: '04', title: 'Handover & support', body: 'Full documentation, team training, and optional ongoing support post-launch.' },
            ].map((step, i) => (
              <div class="anim-fade-up" style={`display:flex;gap:1rem;align-items:flex-start;transition-delay:${i * 0.07}s;`}>
                <div style="width:36px;height:36px;background:#0A0A0A;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;font-family:'Outfit',sans-serif;">
                  {step.num}
                </div>
                <div>
                  <h3 style="font-size:1rem;font-weight:800;margin-bottom:0.3rem;">{step.title}</h3>
                  <p class="paragraph-small" style="color:#5A5A5A;line-height:1.6;">{step.body}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

        <!-- Illustration -->
        <div class="col-lg-6 anim-scale-pop" style="display:flex;justify-content:center;align-items:center;" aria-hidden="true">
          <svg width="280" height="280" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
            <!-- Outer dashed orbit -->
            <circle cx="130" cy="130" r="110" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.18"/>
            <!-- Inner circle -->
            <circle cx="130" cy="130" r="70" stroke="#0A0A0A" stroke-width="1.5" opacity="0.12"/>
            <!-- Center node -->
            <circle cx="130" cy="130" r="22" stroke="#0A0A0A" stroke-width="2"/>
            <text x="130" y="127" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">Cloud</text>
            <text x="130" y="138" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8" font-weight="700" fill="#0A0A0A">Algo</text>
            <!-- Spoke: top (01 Discovery) -->
            <line x1="130" y1="108" x2="130" y2="34" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="130" cy="20" r="14" stroke="#0A0A0A" stroke-width="2" fill="#fff"/>
            <text x="130" y="24" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8.5" font-weight="800" fill="#0A0A0A">01</text>
            <!-- Spoke: right (02 Architecture) -->
            <line x1="152" y1="130" x2="226" y2="130" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="240" cy="130" r="14" stroke="#0A0A0A" stroke-width="2" fill="#fff"/>
            <text x="240" y="134" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8.5" font-weight="800" fill="#0A0A0A">02</text>
            <!-- Spoke: bottom (03 Build) -->
            <line x1="130" y1="152" x2="130" y2="226" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="130" cy="240" r="14" stroke="#0A0A0A" stroke-width="2" fill="#fff"/>
            <text x="130" y="244" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8.5" font-weight="800" fill="#0A0A0A">03</text>
            <!-- Spoke: left (04 Handover) -->
            <line x1="108" y1="130" x2="34" y2="130" stroke="#0A0A0A" stroke-width="1.5" stroke-dasharray="3 3"/>
            <circle cx="20" cy="130" r="14" stroke="#0A0A0A" stroke-width="2" fill="#fff"/>
            <text x="20" y="134" text-anchor="middle" font-family="Outfit,sans-serif" font-size="8.5" font-weight="800" fill="#0A0A0A">04</text>
            <!-- Decorative corner dots -->
            <circle cx="185" cy="75" r="3" fill="#0A0A0A" opacity="0.18"/>
            <circle cx="75" cy="75" r="3" fill="#0A0A0A" opacity="0.18"/>
            <circle cx="185" cy="185" r="3" fill="#0A0A0A" opacity="0.18"/>
            <circle cx="75" cy="185" r="3" fill="#0A0A0A" opacity="0.18"/>
          </svg>
        </div>

      </div>
    </div>
  </section>

  <StatsBar />
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```
Expected: built with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): add How We Work section with SVG process illustration"
```

---

### Task 3: Certifications & Tech Stack section

**Files:**
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Insert Certifications section between How We Work and StatsBar**

Replace:
```astro
  <StatsBar />
```

With:

```astro
  <!-- Certifications & Tech Stack -->
  <section style="background:#fff;padding:5rem 0;border-bottom:1px solid #E0E0DC;">
    <div class="container">
      <p class="section-label anim-fade-up">Credentials</p>
      <h2 class="anim-fade-up" style="font-size:clamp(2rem,3vw,2.75rem);font-weight:800;letter-spacing:-0.02em;margin-bottom:2.5rem;transition-delay:0.05s;">
        Certified across the Salesforce ecosystem.
      </h2>

      <!-- Cert badges -->
      <div style="display:flex;flex-wrap:wrap;gap:0.875rem;">
        {[
          'Salesforce Administrator',
          'Platform Developer I',
          'Platform Developer II',
          'Sales Cloud Consultant',
          'Service Cloud Consultant',
          'Heroku Architecture Designer',
          'MuleSoft Developer',
          'App Builder',
        ].map((cert, i) => (
          <div class="anim-scale-pop" style={`display:flex;align-items:center;gap:0.625rem;background:#F5F5F2;border:1.5px solid #E0E0DC;border-radius:10px;padding:0.875rem 1.125rem;transition-delay:${i * 0.04}s;`}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="12" stroke="#0A0A0A" stroke-width="1.5"/>
              <path d="M9 14l3 3 7-7" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-size:0.8rem;font-weight:700;color:#0A0A0A;line-height:1.3;">{cert}</span>
          </div>
        ))}
      </div>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #E0E0DC;margin:2.5rem 0;" />

      <!-- Tech stack -->
      <p class="section-label anim-fade-up">Tech stack</p>
      <div style="display:flex;flex-wrap:wrap;gap:0.625rem;margin-top:1rem;">
        {['Salesforce', 'Heroku', 'MuleSoft', 'Apex', 'LWC', 'SOQL', 'REST / SOAP APIs', 'Node.js', 'PostgreSQL', 'AWS'].map((tech, i) => (
          <span class="anim-fade-up" style={`border:1.5px solid #E0E0DC;border-radius:100px;padding:0.4rem 1rem;font-size:0.8rem;font-weight:600;color:#0A0A0A;background:#fff;transition-delay:${i * 0.03}s;`}>
            {tech}
          </span>
        ))}
      </div>

    </div>
  </section>

  <StatsBar />
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Volumes/WorkHD/cloudalgo/cloudalgo.github.io && npm run build 2>&1 | tail -20
```
Expected: built with no errors.

- [ ] **Step 3: Commit and push**

```bash
git add src/pages/about.astro
git commit -m "feat(about): add Certifications and Tech Stack section"
git push origin main
```
