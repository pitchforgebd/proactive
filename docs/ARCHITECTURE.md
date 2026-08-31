# Architecture

Verified against the codebase on **2026-08-29**. Specs that disagree with this file or the code are outdated — see [Conflicts](#conflicts-with-legacy-docs).

## Purpose

Public marketing site + same-app admin dashboard for **Proactive Trade International** (printing & packaging machinery / consumables supplier, Bangladesh). Design system: **CMYK Precision** (`CLAUDE.md` §6).

## Runtime topology

```
Browser
  ├─ Public site  app/(site)/*     RSC + ISR (revalidate = 60)
  └─ Admin        app/admin/*      Auth.js session + Server Actions

Public reads:   lib/data/index.ts → lib/data/remote.ts → Drizzle → MySQL
Admin writes:   Server Actions / route handlers → Drizzle → revalidatePath()
Public forms:   POST /api/contact | /api/career → DB (+ optional SMTP)
Uploads:        UPLOAD_DIR (outside public/) → /api/files | /api/admin/resume
```

One Next.js app. No separate PHP/REST dashboard API in the running system.

## App Router layout

| Area | Path | Role |
|---|---|---|
| Document shell | `app/layout.tsx` | Fonts, theme boot script, skip link |
| Public chrome | `app/(site)/layout.tsx` | Header, Footer, JSON-LD, Verification & analytics from Settings |
| Public pages | `app/(site)/…` | Marketing + collection detail routes |
| Admin | `app/admin/…` | Dashboard; Settings → General + Sitemap |
| APIs | `app/api/…` | Auth, forms, files, admin upload/resume |
| SEO | `app/sitemap.ts` + `lib/seo/*`, `app/robots.ts` | Dynamic `/sitemap.xml`; admin refresh via revalidate |

### Fixed marketing page slugs (`lib/pages.ts`)

`home`, `about`, `founder-message`, `vision-mission`, `products`, `global-sourcing`, `our-story`, `company`, `media`, `career`, `contact`.

Editors edit sections/SEO for these pages; they cannot invent new page routes. Adding a page requires a developer (route file + slug map + seed).

### Collection-driven routes (not section pages)

- `/products/[category]`, `/products/[category]/[product]`
- `/media/news`, `/media/news/[slug]`
- `/media/photo-gallery`, `/media/video-gallery`

## Data layer

- **Contract:** `lib/types.ts` + functions exported from `lib/data/index.ts`.
- **Implementation:** `lib/data/remote.ts` (MySQL). Mock fixtures under `lib/data/mock/` remain for seed/reference; the live index imports **`./remote` only**.
- Components must not import mock modules or query Drizzle directly.

## Section CMS

Structured section CMS — **not** a page builder (`PHASE2-BACKEND.md` §6).

| Piece | Location |
|---|---|
| Type catalog + defaults | `lib/sections/registry.ts` |
| Zod schemas | `lib/sections/schemas.ts` |
| Lazy component loaders | `lib/sections/components.ts` |
| Public renderer | `components/sections/SectionRenderer.tsx` |
| Section UI | `components/sections/*.tsx` (prop-driven) |

Registered types (23): `hero`, `pageHero`, `richText`, `imageText`, `richTextProfileAside`, `richTextFactsAside`, `founderMessage`, `stats`, `valueGrid`, `timeline`, `visionMission`, `solutions`, `capabilities`, `parentCompany`, `categoryGrid`, `galleryPreview`, `partners`, `mediaHub`, `careerOpenings`, `careerForm`, `contactDetails`, `map`, `cta`.

Invalid or unknown section data is skipped at render time (page does not crash).

## Database (Drizzle / MySQL)

Schema: `lib/schema.ts`. Pool: `lib/db.ts` + `lib/db-config.ts` (`connectionLimit: 5`, `server-only`).

| Table | Purpose |
|---|---|
| `pages`, `sections` | Dynamic page engine |
| `categories`, `products` | Catalogue |
| `news`, `gallery_images`, `videos`, `partners`, `job_openings` | Editorial / media / careers list |
| `career_applications`, `contact_messages` | Form inboxes |
| `settings` | Singleton site contact/socials/map/logo + Verification & Head Tags (`id = 1`) |
| `admin_users` | Dashboard logins (bcrypt hashes) |

## Auth

- Auth.js v5 (`auth.ts` Node + `auth.config.ts` Edge-safe).
- Credentials provider; JWT session (~8h); middleware matcher `/admin/:path*` only.
- Server Actions re-check `auth()` (middleware does not wrap actions).
- Production requires `AUTH_SECRET` (fail closed in `auth.ts`).

## APIs

| Route | Auth | Role |
|---|---|---|
| `POST /api/contact` | Public | JSON contact → DB + optional mail |
| `POST /api/career` | Public | Multipart application + private CV |
| `GET /api/files/[...path]` | Public | Images under upload root only |
| `POST /api/admin/upload` | Admin | Image upload |
| `GET /api/admin/resume/[...path]` | Admin | Private CV download |
| `/api/auth/[...nextauth]` | Auth.js | Session |

Forms: zod + honeypot field `website` + in-memory rate limit (`lib/rate-limit.ts`). Mail: `lib/mail.ts` (no-op without SMTP env).

## Media & HTML safety

- Images: JPG/PNG/WebP/AVIF ≤ 5MB. **SVG uploads rejected** (XSS).
- Resumes: PDF/DOC/DOCX ≤ 10MB; never via public `/api/files`.
- Rich HTML: `lib/sanitize.ts` on save and in `<RichText />` (only intentional `dangerouslySetInnerHTML` for content; JSON-LD scripts are the other exception).

## Revalidation

Helpers: `lib/revalidate.ts`. Guardrail: `npm run check:revalidation`. Public pages keep `export const revalidate = 60` as ISR fallback.

## Design / motion (public)

- Tokens in `app/globals.css`; Tailwind theme.
- Fonts via `next/font` (Archivo, Inter, JetBrains Mono).
- GSAP lazy via `lib/gsap.ts`; Framer Motion mainly lightbox; hero CMYK registration is CSS (Server Component).
- Respect `prefers-reduced-motion`.

## Conflicts with legacy docs

| Source | Outdated claim | Current truth |
|---|---|---|
| `README.md` | `NEXT_PUBLIC_DATA_SOURCE=mock\|remote` HTTP API swap | Always Drizzle via `remote.ts` |
| `README.md` / older CLAUDE | Mode B static export + `route.node.ts` | Mode A only; routes are `route.ts` |
| `HANDOFF.md` | Separate dashboard host API | Same Next app + MySQL |
| `PHASE2_PLAN.md` | Planning only; Prisma / TipTap options | Implemented per `PHASE2-BACKEND.md` (Drizzle / Summernote) |
| `CLAUDE.md` §13 | “Do not build Phase 2 yet” | Phase 2 code is built |
| `.env.example` `DEPLOY_MODE` | Suggests a switch | `next.config.js` is hardcoded standalone; variable is informational |

Preserve those files for history; do not delete them. Prefer this document + the code.
