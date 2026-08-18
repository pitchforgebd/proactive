# Proactive Trade International — Website

Next.js 14 (App Router / React Server Components) + TypeScript + Tailwind.
Frontend is complete and backend-agnostic: all content flows through `lib/data`,
which currently resolves from mock fixtures and later resolves from the
dashboard API by flipping one environment variable.

Design system: **CMYK Precision** — see `CLAUDE.md` §6.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

| Script | Does |
|---|---|
| `npm run build` | Production build (Mode A by default) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run gen:images` | Regenerate the placeholder imagery in `public/images` |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in as needed. Every one has a
working default, so the site builds with no `.env` file at all.

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://proactive.com.bd` | Canonical URLs, OG tags, sitemap |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | Set to `remote` in Phase 2 to read from the dashboard API |
| `NEXT_PUBLIC_API_BASE_URL` | *(empty)* | Base URL of the dashboard API. Required when `NEXT_PUBLIC_DATA_SOURCE=remote` |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | `/api/contact` | Where the contact form posts |
| `NEXT_PUBLIC_CAREER_ENDPOINT` | `/api/career` | Where the career form posts |
| `DEPLOY_MODE` | `node` | `node` (Mode A) or `static` (Mode B) — see below |

---

## Deployment — cPanel

Two supported modes. **Confirm with the host which one applies before
deploying.**

### Mode A — Node.js app (preferred)

Use this if cPanel shows **Setup Node.js App** (CloudLinux / Passenger, Node 18+).
It is the only mode that gives SSR + ISR, so dashboard content goes live without
a rebuild, and it is the only mode where the `/api/*` form endpoints exist.

1. Build locally (or on the server if Node is available there):

   ```bash
   DEPLOY_MODE=node npm run build
   ```

2. Upload to the app directory on the server:

   ```
   .next/standalone/     →  application root (contains server.js)
   .next/static/         →  <app root>/.next/static
   public/               →  <app root>/public
   ```

   `output: 'standalone'` does **not** copy `public/` or `.next/static/` — both
   must be uploaded alongside it or images and CSS 404.

3. In **Setup Node.js App**:
   - Application root → the directory containing `server.js`
   - Application startup file → `server.js`
   - Node version → 18 or higher
   - Add environment variables (`NEXT_PUBLIC_SITE_URL`, and the Phase 2 API vars
     when the dashboard exists)

4. Restart the app and point the domain at it.

ISR revalidation is 60 seconds (`export const revalidate = 60` on the dynamic
pages), so published dashboard changes appear within a minute.

### Mode B — Static export (fallback)

Use only if Node.js hosting is unavailable.

```bash
DEPLOY_MODE=static npm run build     # emits ./out
```

Upload the **contents** of `out/` into `public_html`.

What changes in this mode, and what you must do about it:

- **No image optimizer.** `images.unoptimized` is set automatically; images are
  served as authored. Keep source images reasonably sized.
- **No `/api/*` routes.** The route handlers are named `route.node.ts` and are
  excluded from the build by `pageExtensions` (see `next.config.js`), so the
  build succeeds rather than failing. You must host the form handlers
  separately — a small PHP script on the same cPanel is the usual answer — and
  point the forms at them:

  ```
  NEXT_PUBLIC_CONTACT_ENDPOINT=/handlers/contact.php
  NEXT_PUBLIC_CAREER_ENDPOINT=/handlers/career.php
  ```

  The contact handler receives JSON; the career handler receives multipart form
  data with a `resume` file part. Both should answer `200` with
  `{"ok":true}` on success, or `422` with `{"ok":false,"message":"..."}`.
  The field names and validation rules are in `lib/validation.ts`.

- **No ISR.** Content changes require a rebuild-and-upload, or a client-side
  fetch against a separate API.
- `trailingSlash` is enabled so Apache serves `/path/index.html` correctly.

Switching modes is a single environment variable; nothing in the application
code needs to change.

---

## Project structure

```
app/                      routes (App Router)
  api/                    Phase 2 form endpoints (route.node.ts — Mode A only)
  products/               category grid → category → product detail
  media/                  hub, news list + article, photo gallery, video gallery
  sitemap.ts robots.ts    generated at build
components/
  layout/                 Header, Nav, MobileDrawer, Footer, Logo, PageHero
  ui/                     Button, Card, Section, SectionHeading, Eyebrow,
                          Breadcrumbs, RichText, Skeleton, CTABand
  motion/                 RegistrationHero, RevealOnView, HalftoneBg,
                          CropMarks, RouteSweep
  media/                  YouTubeFacade, Lightbox, GalleryGrid, PartnerMarquee,
                          MapEmbed
  forms/                  ContactForm, CareerForm, Field
  home/                   Hero, HeroSlider
  products/               ProductGallery
lib/
  data/index.ts           the ONLY content API components may import
  data/mock/              Phase 1 fixtures
  data/remote.ts          Phase 2 swap-in
  types.ts validation.ts nav.ts utils.ts
public/images/            placeholder imagery (see below)
scripts/                  placeholder image generator
```

---

## Placeholder imagery

Everything in `public/images` is generated by
`scripts/generate-placeholders.mjs` — real PNG rasters in the CMYK Precision
palette, not stock photography.

**Replace each file in place with real photography at the same dimensions** and
nothing else needs to change. The manifest at the bottom of the script lists
every path and its intended size.

The partner logos in `public/images/partners/` are abstract placeholders and
must be replaced with the real partner marks before launch.

---

## Performance notes

Measured against the CLAUDE.md §5 targets. What the build does to hold them:

- **87 kB shared first-load JS.** Server Components by default; `"use client"`
  appears only in the nav, drawer, forms, sliders, gallery and lightbox.
- **The hero headline is server-rendered text.** The CMYK registration snap is
  pure CSS, so the LCP element paints without waiting on JavaScript.
- **One hero image loads eagerly.** The other two slides mount ~1.2s after
  hydration so they cannot compete with the LCP fetch.
- **Framer Motion is loaded by the lightbox only**, through
  `dynamic(..., { ssr: false })`. Scroll reveals use a bare IntersectionObserver
  instead — an animation runtime for a one-shot CSS transition is not worth the
  bytes.
- **No eager iframes.** The Google Map and every YouTube video are facades that
  swap in the real embed on scroll-into-range or click.
- **Fonts are self-hosted by `next/font`** — zero requests to Google, zero
  render-blocking stylesheets, zero layout shift.
- **All media has reserved dimensions**, so CLS stays near zero.
- `prefers-reduced-motion` is honoured globally in `globals.css`: the
  registration channels start in register and all transitions collapse.

Re-measure with Lighthouse (mobile) against a production build, not `next dev`.

---

## Content editing today (pre-dashboard)

All content lives in `lib/data/mock/`:

| File | Holds |
|---|---|
| `categories.ts` | The four solution lines |
| `products.ts` | Products, specs, rich HTML bodies |
| `news.ts` | News articles |
| `media.ts` | Gallery images, YouTube videos, partners |
| `settings.ts` | Contact details, socials, job openings |
| `content.ts` | Static marketing copy (about, vision, values, timelines) |

Blocks marked **FOR CLIENT REVIEW** in `content.ts` are drafted placeholder
copy — Global Sourcing, Our Story timeline and the Company profile.

See `HANDOFF.md` for what the Phase 2 backend must implement.
