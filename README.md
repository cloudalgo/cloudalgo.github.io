# CloudAlgo Website

Marketing website for [cloudalgo.com](https://cloudalgo.com) — a certified Salesforce & Heroku consulting firm.

## Stack

- **Astro 6** — static output
- **React 19** — interactive components only
- **Tailwind CSS 4** — via `@tailwindcss/vite`
- **TypeScript** — strict mode
- **GitHub Pages** — hosting, deployed via GitHub Actions on every push to `main`

## Commands

```bash
npm install       # install dependencies (requires Node >= 22.12.0)
npm run dev       # dev server at localhost:4321
npm run build     # production build to ./dist/
npm run preview   # preview production build locally
npm run astro check  # TypeScript / Astro type-checking
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Header, Footer (Astro)
│   ├── sections/     # Page sections — Hero, Services, etc. (Astro)
│   └── ui/           # Interactive widgets — ContactForm, StatsCounter, TestimonialsSlider (React)
├── content/
│   ├── blog/         # Markdown blog posts
│   └── services/     # Markdown service pages
├── layouts/
│   ├── Base.astro    # HTML shell, <head>, tracking scripts
│   └── Page.astro    # Adds Header + Footer around slot
├── pages/            # File-based routing
├── styles/
│   └── global.css    # Tailwind @theme tokens, global styles
└── content.config.ts # Content collection schemas
```

## Integrations & Tracking

| Service | Purpose | ID |
|---|---|---|
| Google Analytics 4 | Page views, scroll depth, CTA clicks | `G-5WYSWY2G6Z` |
| HubSpot | Contact form submissions + visitor CRM tracking | Portal `21905808` |
| Microsoft Clarity | Session recordings + heatmaps | `wqcruv2yej` |

## Contact Form

Submits directly to the HubSpot Forms API (no backend required). Form ID: `bdb87791-63e2-42ac-87b4-a6afa5675e4a`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main` and deploys to GitHub Pages. Custom domain `cloudalgo.com` is configured via `public/CNAME`.
