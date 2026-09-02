# Changelog

Project-level changelog for continuity. Prefer short, dated entries. Application commits may use a different style; this file tracks **phase outcomes** and documentation milestones.

Format: newest first.

---

## 2026-09-02 — Floating WhatsApp button

- `settings.whatsapp`; Admin Settings field; public fixed bottom-right button
  (`wa.me`) when set; empty hides it.

## 2026-09-02 — Admin toast alerts on save / CRUD

- `AdminToaster` in dashboard shell: success/error toasts for collection save
  / delete, settings, section save / reorder / visibility / delete, page SEO,
  sitemap refresh, inbox mark/delete, and image uploads.

## 2026-09-02 — Footer tagline editable in Settings

- `settings.footer_tagline`; Admin Settings textarea; footer reads
  `getSiteSettings().footerTagline` (default copy if empty).

## 2026-09-02 — Mobile typography + shorter hero slider

- Hero: fixed short height on phones (`~52svh` / max 400px), not full viewport;
  compact type/CTAs; stats hidden until `sm`.
- Site titles/ledes/cards/page heroes scale down on mobile; body `0.9375rem` on xs.
- Headings wrap safely (`overflow-wrap`); tighter container padding on small screens.

- Hero slider: shorter mobile height / padding (no full-viewport stretch on phones).
- Site-wide `text-align: justify` for body copy; `.prose` / Summernote excluded.
- Home “What We Offer” (`categoryGrid` cards4): up to 8 **featured** products with
  square images + **Explore all products** → `/products`. Admin Products checkbox
  `featured`; `products.featured` column + `getFeaturedProducts()`.
- Partner logos always full colour (no grayscale / colour-on-hover).
- Settings: `logoTitle` / `logoSubtitle` for wordmark text in header & footer.

## 2026-08-31 — Futuristic press atmosphere

- `PressAtmosphere`: CMYK orbit rings, print-head scan, drifting ink dots on
  hero, Solutions, CTA, and PageHero (CSS-only, reduced-motion safe).
- `InkRule`: living CMYK registration divider under category headings.
- Section supports `atmosphere` for full-bleed ink-band effects.

## 2026-08-31 — Admin Settings: favicon

- `settings.favicon` column; Admin Settings ImageField (PNG/WebP/JPG).
- Public `(site)` layout `generateMetadata.icons` when set; clear removes it.

## 2026-08-31 — Section polish + Framer Motion

- Added `MotionReveal` (Framer, reduced-motion safe) for scroll reveals.
- Restyled Stats, ValueGrid, Vision/Mission, Solutions, Partners, Gallery,
  Cards, and CTA band — clearer hierarchy, hover lift, CMYK accents.
- Cards and CTA use Framer hover/tap; stats counters animate via PressCounter.

## 2026-08-31 — Demo photography for UI review

- Replaced abstract CMYK placeholders with real Unsplash demo photos for hero
  slides, category/product/solution cards, news, gallery, and about imagery
  (`npm run demo:images`). Paths unchanged — no DB/seed edits required.
- Partner/brand logo plates left as marks (not stock photos).

## 2026-08-31 — Normal letter-spacing

- Removed wide/tight letter-spacing from public UI (eyebrows, buttons, heroes,
  forms, labels) and type scale; small titles no longer use a dash separator.

- Raised global Tailwind radius scale (`rounded-sm` ≈ 10px) and `--radius`.
- Rounded **all** card-like surfaces: product/category `Card`, stats/solutions/
  vision grids, asides, media (YouTube/map/lightbox/gallery), forms, parent-
  company plates, product specs, news lead media, and admin list/panel chrome.
- Buttons/inputs/chips use the same softer scale (`rounded-md` / `rounded-xl`).

## 2026-08-31 — Footer QR code (admin-managed)

- `settings.qr_code` + `qr_code_caption`; Admin Settings ImageField + caption.
- Footer shows QR on a paper plate when set; clear image to hide.

## 2026-08-29 — Company page: DYNAMIK brand section

- Added DYNAMIK block after Zexora on `/company` (reuses `parentCompany` section).
- Logo at `public/images/about/dynamik-logo.png`; optional `tagline` + `logoSurface`
  on the section schema for dark marks on a paper plate.
- Seed + live DB section updated.

## 2026-08-29 — Phase 11: Final SEO integration & testing

- Audit-only of Phases 7–10. No product feature changes.
- Verified verification/analytics head, custom-head sanitization, sitemap,
  robots, URL origin, private exclusions, no SMTP/nav regressions.
- `npm run check`, production build, and SEO/sitemap smokes passed.

## 2026-08-29 — Phase 10: Sitemap admin UI

- Admin **Settings → Sitemap** (`/admin/settings/sitemap`): status, public URL,
  URL count/breakdown, newest lastmod, ISR note, Generate Sitemap Now
  (revalidates dynamic `/sitemap.xml` — no physical file, no search ping).
- Read-only content-type priority/frequency tables matching the real builder;
  Services/Portfolio marked not in this site.
- Shared loader `lib/seo/sitemap-source.ts`; Settings General/Sitemap subnav.

## 2026-08-29 — Phase 9: Sitemap core

- Hardened DB-driven `/sitemap.xml` via `lib/seo/build-sitemap.ts` + `app/sitemap.ts`.
- Includes: CMS pages ∩ coded routes, collection hubs, categories, products
  (valid category only), news with `publishedAt ≤ now`. Gallery/video hubs only
  (no per-item public routes). No services/portfolio collections in this codebase.
- Excludes: `/admin`, `/api`, login, orphan products, future-dated news.
- `revalidateGallery` / `revalidateVideos` / collection list writes also refresh sitemap.
- Unit check: `npx tsx scripts/check-sitemap.ts`. No Admin Sitemap UI yet.

## 2026-08-29 — Phase 8: Verification & Head Tags (public)

- Admin Settings section retitled **Verification & Head Tags**; empty fields clear tags.
- Custom head: allowlisted `<meta>`/`<link>` only; scripts/handlers rejected and stripped.
- Public `(site)` layout: `generateMetadata` emits verification metas; GA4/GTM/Pixel via
  `SiteAnalytics` only when IDs are configured and shape-valid.
- Root page metadata / Open Graph unchanged; no sitemap or SMTP/nav changes.

## 2026-08-29 — Phase 7: SEO settings foundation

- Extended `settings` with SEO/analytics columns (same row, no new table).
- Admin Settings form + `saveSettings` zod validation; exposed via
  `SiteSettings.seo` / `getSiteSettings`.
- Public `<head>` injection deferred to a later phase.

## 2026-08-29 — Improvements Phase 6: final readiness review

- Verified Phases 2–5: check + production build + HTTP smoke + DB status.
- No new features. No cPanel deploy. TASK_STATE marked track complete.

## 2026-08-29 — Improvements Phase 5: SMTP / forms verify + harden

- Kept existing save-then-notify architecture; no rebuild.
- `lib/mail.ts`: trimmed SMTP env reads, safer error logging, documented
  recipient priority (Settings.email → SMTP_TO → SMTP_USER).
- `.env.example` + `docs/DEPLOYMENT.md` clarified for cPanel env setup.

## 2026-08-29 — Improvements Phase 4: dynamic sitemap

- `app/sitemap.ts`: marketing routes from CMS page slugs ∩ `pagePathMap`;
  collections from `lib/data`; hubs via `PUBLIC_COLLECTION_INDEXES`.
- `lib/pages.ts`: sitemap meta + collection index constants.
- `revalidatePage` also revalidates `/sitemap.xml`.
- `robots.ts`: disallow `/admin/` in addition to `/api/`.

## 2026-08-29 — Improvements Phase 3: nav label → Products

- `lib/nav.ts`: primary nav + footer quick links label “What We Offer” → “Products”
  (`href` still `/products`).
- `NotFoundBody.tsx`: matching quick-link label.
- Page titles / breadcrumbs / CMS seed copy left unchanged.

## 2026-08-29 — Improvements Phase 2: dynamic logo + navbar contrast

- `settings.logo` column + admin Settings ImageField (existing upload pipeline).
- Header / Footer / MobileDrawer use Settings.logo; SVG wordmark fallback retained.
- Sticky header uses opaque `bg-paper-2` for nav contrast over dark sections.
- `npm run check` passed; schema pushed via `db:push`.

## 2026-08-29 — Cursor documentation & continuity system

- Added `.cursor/rules/project.mdc` (always-apply Cursor project rules).
- Added `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/CHANGELOG.md`.
- Established **Cursor** as the primary development environment; `TASK_STATE.md` remains the live progress tracker.
- No application functionality changes in this step.
- Documented known conflicts with stale root docs (`README.md`, `HANDOFF.md`, `PHASE2_PLAN.md`, parts of `CLAUDE.md`).

## 2026-08-29 — Optional SMTP notifications

- Added `lib/mail.ts` (nodemailer); no-op unless `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` set.
- Wired notify into `POST /api/contact` and `POST /api/career` after successful DB insert.
- Mail failures logged only; forms still return success when the row is saved.
- Updated `.env.example`; externalized `nodemailer` in `next.config.js`.

## 2026-08-29 — Phase 2 step 10: security pass + deploy prep

- Rejected SVG uploads; ImageField accept list updated.
- Sanitizer forces `rel="noopener noreferrer"` on `target=_blank` links.
- Security headers added in `next.config.js`.
- Production fails closed without `AUTH_SECRET`.
- Added uploads-safe `deploy.sh`.

## 2026-08-19 … ~2026-08-29 — Phase 2 backend + admin (implemented)

Implemented per `PHASE2-BACKEND.md` (not the Prisma/TipTap options in `PHASE2_PLAN.md`):

- MySQL schema + Drizzle pool; seed scripts; `lib/data` → `remote.ts`.
- Section registry (~23 types), `SectionRenderer`, marketing pages from DB.
- Auth.js credentials + `/admin` middleware.
- Admin CRUD: pages/sections/SEO, categories, products, news, gallery, videos, partners, jobs, settings, career/contact inboxes.
- Form APIs → DB; private resumes; on-demand revalidation; check scripts.
- Static export / Mode B retired.

## 2026-08-18 — Phase 1 frontend complete

- Next.js 14 App Router public site, CMYK design system, mock data layer (later swapped to DB).
- Routes, forms UI, SEO, motion/performance structure per `CLAUDE.md`.
- Verified: `tsc`, lint, Mode A build (historical notes in older `TASK_STATE` / `README`).

## Earlier — Initial commits

- Repo bootstrap and Phase 1 iteration (`git` history: first commit → navbar fixes → “phase 1 done” → “new updates”).
